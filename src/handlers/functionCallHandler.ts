import type { FunctionCall } from "@google/generative-ai";
import { handleSetLimit } from "../functions/setlimit";
import type { ListyContext } from "../types";
import { calculateTotalSpend } from "../functions/calculateTotalSpend";

export default async function handleFuntionCall(ctx: ListyContext, functionCall: FunctionCall) {
    try {
        let functionName = functionCall.name;

        switch (functionName) {
            case "setUserLimit":
                handleSetLimit(ctx, (functionCall.args as { budget: number }).budget);
                break;
            case "calculateTotalSpend":
                let { start_date, end_date } = functionCall.args as { start_date: string, end_date: string };
                calculateTotalSpend(ctx, start_date, end_date);
                break;
        }
    } catch (error) {

    }
}