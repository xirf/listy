import type { FileFlavor } from "@grammyjs/files";
import type { Bot, SessionFlavor, Api } from "grammy";
import type { FileApiFlavor } from "@grammyjs/files";
import type { CommandsFlavor } from "@grammyjs/commands";

export interface SessionData {
    waitingForLimit?: boolean,
    waitingForResetConfirmation?: boolean,
}

export type ListyContext = Context & ParseModeFlavor<Context> & SessionFlavor<SessionData> & FileFlavor<Context> & CommandsFlavor;
export type ListyApi = FileApiFlavor<Api>;

type ReceiptResult = {
    isReceipt: boolean;
    items?: Array<{
        item: string;
        itemCount: number;
        price: string;
    }>;
    discounts?: Array<{
        description: string;
        amount: string;
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
