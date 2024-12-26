import { db } from '../database';
import { userState } from '../utils/state';
import logger from '../utils/logger';
import type { ListyContext } from '../types';
import { getAiResponse } from '../lib/instructor';
import { handleLimit } from './events/handleLimit';
import handleFuntionCall from './functionCallHandler';
import type { Bot } from 'grammy';
import { handleImage } from './events/handleImage';
import type { ChatCompletionMessageParam } from 'openai/src/resources/index.js';



/*
* FLow of this file is
* 1. Get the history of the user
* 2. Save the message to the database
* 3. Get the AI response
* 4. Handle the function call
* 5. Send the response to the user
*/


export async function setupEventHandlers(bot: Bot<ListyContext>) {
    bot.on(':photo', handleImage);
    bot.on(':text', async (ctx) => {
        const userId = ctx.from?.id.toString();;
        if (!userId) return;

        const state = userState[ userId ];

        if (state?.waitingForLimit) {
            await handleLimit(ctx, userId);
        } else {
            const history = await getHistory(userId);
            await saveMessage(userId, ctx.message.text);
            await aiResponse(ctx, userId, history);
        }
    })
}

async function getHistory(userId: string): Promise<ChatCompletionMessageParam[]> {
    try {
        const history = await db.selectFrom('history')
            .select('message')
            .where('telegram_id', '=', userId)
            .where('created_at', '>', new Date(Date.now() - 3600000))
            .limit(5)
            .execute();

        return history.map(a => JSON.parse(a.message));
    } catch (error: any) {
        logger.error(`Error fetching history for user ${userId}: ${error.message}`);
        return [];
    }
}

async function saveMessage(userId: string, message: string, role: "user" | "system" = "user") {
    try {
        await db.insertInto('history').values({
            telegram_id: userId,
            message: JSON.stringify({
                role,
                content: message,
            })
        }).execute();
    } catch (error: any) {
        logger.error(`Error saving message for user ${userId}: ${error.message}`);
    }
}

async function aiResponse(ctx: ListyContext, userId: string, history: ChatCompletionMessageParam[]) {
    try {
        console.log("User ID: ", userId, "Message: ", ctx.message.text);
        if(!ctx.message.text) return;

        const response = await getAiResponse(ctx.message.text, history);

        if (response) {
            const functionCalled = response.tool_calls
            const answer = response.content;

            console.log("Function called: ", JSON.stringify(functionCalled));
            console.log("Answer: ", answer);

            if (functionCalled && functionCalled.length > 0) {
                handleFuntionCall(ctx, functionCalled[ 0 ]);
            };

            if (answer) {
                await ctx.reply(answer);
                saveMessage(userId, answer, "system");
            };
        }

    } catch (error: any) {
        logger.error(`Error handling Gemini response for user ${userId}: ${error.message}`);
        await ctx.reply('An error occurred while processing your request. Please try again later.');
    }
}
