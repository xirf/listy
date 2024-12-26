import type { FunctionCallDeclaration, ListyContext } from "../types/index";
import i18n from '../i18n';
import logger from "../utils/logger";
import { db } from "../database";
import { InlineKeyboard } from "grammy";
import { CallbackQuery } from "../constant/CallbackQuery";


interface dateRange {
    startDate: string;
    endDate?: string;
}


async function calculateTotalSpend(ctx: ListyContext, date: dateRange | null) {
    try {
        const userId = ctx.from?.id;

        if (!date?.startDate) {
            ctx.session.waitingForSpendRange = true;
            const keyboard = new InlineKeyboard()
                .text(i18n.t('cek_buttons.monthly'), CallbackQuery.SPEND.MONTHLY)
                .text(i18n.t('cek_buttons.weekly'), CallbackQuery.SPEND.WEEKLY)


            await ctx.reply(i18n.t('cek'), {
                reply_markup: keyboard
            });
            return;
        }

        let startDate = new Date(date.startDate);
        let endDate = date.endDate ? new Date(date.endDate) : new Date();

        console.log("Start Date: ", startDate, "End Date: ", endDate);

        let rawSpend = await db
            .selectFrom('transactions')
            .select([ 'total_price_after_discount', 'total_price_before_discount' ])
            .where('user_id', '=', userId)
            .where(eb => eb.and([
                eb('transaction_date', '>=', startDate),
                eb('transaction_date', '<=', endDate)
            ]))
            .execute();

        console.log("Raw Spend: ", rawSpend);

        let userLimit = await db.selectFrom('users').select('limit').where('telegram_id', '=', userId.toString()).execute();


        if (rawSpend.length > 0) {
            let list = rawSpend.map((a) => a.total_price_after_discount || a.total_price_before_discount).join('\n- ')

            let totalSpend = rawSpend?.reduce((acc, val) => acc + (val.total_price_before_discount ? val.total_price_before_discount : val.total_price_after_discount!!), 0) || 0;

            if (userLimit.length > 0) {
                await ctx.reply(i18n.t('cek_spending_have_limit', {
                    list,
                    totalSpend, userLimit: userLimit[ 0 ].limit,
                    remaining: (userLimit[ 0 ].limit!! - totalSpend),
                }));
            } else {
                await ctx.reply(i18n.t('cek_spending', {
                    totalSpend,
                    list
                }));
            }
        } else {
            await ctx.reply(i18n.t('no_spending'));
        }


    } catch (error: any) {
        logger.error({ error }, `Error while processing calculateTotalSpend: ${error.message}`);
        await ctx.reply(i18n.t('error'));
    }
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