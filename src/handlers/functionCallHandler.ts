import { setUserLimit } from "../functions/setlimit";
import type { ListyContext } from "../types";
import { calculateTotalSpending } from "../functions/calculateTotalSpend";
import type { ChatCompletionMessageToolCall } from "openai/resources/index.mjs";

export default async function handleFuntionCall(ctx: ListyContext, functionCall: ChatCompletionMessageToolCall) {
    try {
        let functionName = functionCall.function.name;
        let args = JSON.parse(functionCall.function.arguments);

        switch (functionName) {
            case "set_user_limit":
                setUserLimit.execute(ctx, args.budget);
                break;
            case "calculate_total_spending":
                if (args.startDate) {
                    calculateTotalSpending.execute(ctx, {
                        startDate: args.startDate,
                        endDate: args.endDate || new Date().toISOString()
                    });
                }
                break;
        }
    } catch (error: any) {
        console.error(`Error while processing function call: ${error.message}`);
        await ctx.reply('An error occurred while processing the function call. Please try again later.');
    }
}
