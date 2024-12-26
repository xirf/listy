import type { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import { getAiResponse } from "../../lib/instructor";
import type { ListyContext } from "../../types";
import logger from "../../utils/logger";
import handleFuntionCall from "../functionCallHandler";
import { db } from "../../database";

export async function getHistory(userId: string): Promise<ChatCompletionMessageParam[]> {
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

export async function saveMessage(userId: string, message: string, role: "user" | "system" = "user") {
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

export async function aiResponse(ctx: ListyContext, userId: string, history: ChatCompletionMessageParam[]) {
    try {
        console.log("User ID: ", userId, "Message: ", ctx.message.text);
        if (!ctx.message.text) return;

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

export default async function handleAi(ctx: ListyContext, userId: string) {
    const history = await getHistory(userId);
    await saveMessage(userId, ctx.message.text);
    await aiResponse(ctx, userId, history);
}