import type { FunctionCallDeclaration, ListyContext } from "../types/index";
import i18n from '../i18n';
import logger from "../utils/logger";
import { db } from "../database";
import { InlineKeyboard } from "grammy";
import { CallbackQuery } from "../constant/CallbackQuery";
import { numberFormat } from "../utils/numberFormat";


interface dateRange {
    startDate: string;
    endDate?: string;
}

export const calculateTotalSpending: FunctionCallDeclaration = {
    type: "function",
    function: {
        name: "calculate_total_spending",
        description: "Calculate the user's total spending within a specified date range and respond with relevant messages.",
        parameters: {
            type: "object",
            properties: {
                startDate: {
                    type: "string",
                    description: "Starting date in ISO format (e.g., 2023-01-01).",
                },
                endDate: {
                    type: "string",
                    description:
                        "Optional ending date in ISO format. Defaults to current date if not provided.",
                },
            },
            required: [ "startDate" ],
        },
    },
    execute: async (ctx: ListyContext, args: dateRange | null) => {
        return calculateTotalSpend(ctx, args);
    },
};


async function calculateTotalSpend(ctx: ListyContext, date: dateRange | null) {
    try {
        console.log("Date: ", date);

        const userId = ctx.from?.id;
        if (!userId) {
            throw new Error("User ID is missing from context.");
        }

        // Prompt user for a date range if not provided
        if (!date?.startDate) {
            await promptDateRange(ctx);
            return;
        }

        // Define start and end dates
        const startDate = new Date(date.startDate);
        const endDate = date.endDate ? new Date(date.endDate) : new Date();
        endDate.setDate(endDate.getDate() + 1); // Include end date in range

        // Fetch spending data and user limit
        const rawSpend = await fetchUserTransactions(userId, startDate, endDate);
        const userLimit = await fetchUserLimit(userId);

        // Process and respond based on spending data
        if (rawSpend.length > 0) {
            const formattedList = formatTransactionList(rawSpend);
            const totalSpend = calculateSpending(rawSpend);

            await sendSpendingSummary(ctx, formattedList, totalSpend, userLimit, startDate);
        } else {
            await ctx.reply(i18n.t('no_spending'));
        }
    } catch (error: any) {
        logger.error({ error }, `Error while processing calculateTotalSpend: ${error.message}`);
        await ctx.reply(i18n.t('error'));
    }
}

// Helper functions
async function promptDateRange(ctx: ListyContext) {
    ctx.session.waitingForSpendRange = true;
    const keyboard = new InlineKeyboard()
        .text(i18n.t('cek_buttons.monthly'), CallbackQuery.SPEND.MONTHLY)
        .text(i18n.t('cek_buttons.weekly'), CallbackQuery.SPEND.WEEKLY);

    await ctx.reply(i18n.t('cek'), { reply_markup: keyboard });
}

async function fetchUserTransactions(userId: string, startDate: Date, endDate: Date) {
    return await db
        .selectFrom('transactions')
        .select([ 'total_price_after_discount', 'total_price_before_discount', 'store_name', 'transaction_date' ])
        .where('user_id', '=', userId)
        .where(eb => eb.and([
            eb('transaction_date', '>=', startDate),
            eb('transaction_date', '<=', endDate),
        ]))
        .execute();
}

async function fetchUserLimit(userId: number) {
    return await db
        .selectFrom('users')
        .select('limit')
        .where('telegram_id', '=', userId.toString())
        .execute();
}

function formatTransactionList(transactions: any[]) {
    return transactions.map((record: any, index: number) => {
        const totalPrice = record.total_price_after_discount ?? record.total_price_before_discount;
        const formattedDate = new Date(record.transaction_date).toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "short",
        });

        return `${index + 1}. *${record.store_name}*\n${formattedDate} - ${numberFormat(totalPrice || 0)}`;
    }).join("\n\n");
}

function calculateSpending(transactions: any[]) {
    return transactions.reduce((acc, record) => {
        const totalPrice = record.total_price_after_discount ?? record.total_price_before_discount;
        return acc + (totalPrice || 0);
    }, 0);
}

async function sendSpendingSummary(ctx: ListyContext, formattedList: string, totalSpend: number, userLimit: any[], date: Date) {
    let today = new Date();

    // Check if user has set a spending limit for the current month
    if (userLimit.length > 0 && today.getMonth() === date.getMonth() && today.getFullYear() === date.getFullYear()) {
        const limit = userLimit[ 0 ].limit;
        const remaining = limit - totalSpend;

        await ctx.reply(i18n.t('cek_spending_have_limit', {
            list: formattedList,
            total: numberFormat(totalSpend),
            userLimit: limit,
            remaining: numberFormat(remaining),
        }));
    } else {
        await ctx.reply(i18n.t('cek_spending', {
            totalSpend,
            list: formattedList,
        }));
    }
}
