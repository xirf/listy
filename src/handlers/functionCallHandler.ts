import type { FunctionCall } from "@google/generative-ai";
import { handleSetLimit } from "../functions/setlimit";
import type { ListyContext } from "../types";
import { calculateTotalSpending } from "../functions/calculateTotalSpend";
import type { ChatCompletionMessageToolCall } from "openai/resources/index.mjs";

export default async function handleFuntionCall(ctx: ListyContext, functionCall: ChatCompletionMessageToolCall) {
    try {
        let functionName = functionCall.function.name;

        switch (functionName) {
            case "setUserLimit":
                handleSetLimit(ctx, (parseInt(functionCall.function.arguments)));
                break;
            case "calculateTotalSpend":
                let args = functionCall.function.arguments;
                calculateTotalSpending.execute(ctx, args);
                break;
        }
    } catch (error) {

    }
}