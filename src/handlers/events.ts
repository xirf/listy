import { db } from '../database';
import { userState } from '../utils/state';
import logger from '../utils/logger';
import type { ListyContext } from '../types';
import functionCall from '../lib/functionCall';
import { handleLimit } from './events/handleLimit';
import type { Content } from '@google/generative-ai';
import handleFuntionCall from './functionCallHandler';
import type { Bot } from 'grammy';
import { handleImage } from './events/handleImage';

async function getHistory(userId: string) {
    try {
        const history = await db.selectFrom('history')
            .select('message')
            .where('telegram_id', '=', userId)
            .limit(5)
            .execute();
        return history.map(a => JSON.parse(a.message));
    } catch (error: any) {
        logger.error(`Error fetching history for user ${userId}: ${error.message}`);
        return [];
    }
}

async function saveMessage(userId: string, message: string, role: "user" | "model" = "user") {
    try {
        await db.insertInto('history').values({
            telegram_id: userId,
            message: JSON.stringify({
                role,
                parts: [ { text: message } ]
            })
        }).execute();
    } catch (error: any) {
        logger.error(`Error saving message for user ${userId}: ${error.message}`);
    }
}

async function handleGeminiResponse(ctx: ListyContext, userId: string, history: Content[]) {
    try {
        const geminiAnswer = await functionCall(ctx.message.text, history);
        const functionCalled = geminiAnswer.response.functionCalls();
        const answer = geminiAnswer.response.text();

        logger.info(`User ${userId} asked: ${ctx.message.text}, gemini answered: ${answer.slice(0, 100)}`);

        if (functionCalled && functionCalled.length > 0) handleFuntionCall(functionCalled[ 0 ]);
        if (answer) {
            await ctx.reply(answer);
            saveMessage(userId, answer, "model");
        };

    } catch (error: any) {
        logger.error(`Error handling Gemini response for user ${userId}: ${error.message}`);
        await ctx.reply('An error occurred while processing your request. Please try again later.');
    }
}

export async function setupEventHandlers(bot: Bot<ListyContext>) {
    bot.on(':photo', handleImage);
    bot.on(':text', async (ctx) => {
        const userId = ctx.from?.id.toString();;
        if (!userId) return;

        logger.info(`User ${userId} asked: ${ctx.message.text}`);

        const state = userState[ userId ];

        if (state?.waitingForLimit) {
            await handleLimit(ctx, userId);
        } else {
            const history = await getHistory(userId);
            await saveMessage(userId, ctx.message.text);
            await handleGeminiResponse(ctx, userId, history);
        }
    })
}