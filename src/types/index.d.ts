import type { FileFlavor } from "@grammyjs/files";
import type { Bot, SessionFlavor, Api } from "grammy";
import type { FileApiFlavor } from "@grammyjs/files";
import type { CommandsFlavor } from "@grammyjs/commands";
import type { ChatCompletionTool } from "openai/src/resources/index.js";

export interface SessionData {
    waitingForLimit?: boolean,
    waitingForResetConfirmation?: boolean,
    waitingForSpendRange?: boolean
}

export type ListyContext = Context & ParseModeFlavor<Context> & SessionFlavor<SessionData> & FileFlavor<Context> & CommandsFlavor;
export type ListyApi = FileApiFlavor<Api>;

export interface ReceiptResult {
    isReceipt: boolean;
    items?: Array<{
        item: string;
        itemCount: number;
        price: string;
    }>;
    discounts?: Array<{
        description: string;
        amount: number;
    }>;
    totalPriceBeforeDiscount?: number;
    totalPriceAfterDiscount?: number;
    storeName?: string;
    transactionDate: {
        day: number;
        month: number;
        year: number;
    };
    currency?: string;
};

export interface FunctionCallDeclaration extends ChatCompletionTool {
    execute: (ctx: ListyContext, args: any) => Promise<void>;
}