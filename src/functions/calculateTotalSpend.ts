import type { ListyContext } from "../types/index";
import i18n from '../i18n';
import { InlineKeyboard } from "grammy";
import { CallbackQuery } from "../constant/CallbackQuery";
import { userState } from "../utils/state";
import logger from "../utils/logger";
import { db } from "../database";

export async function calculateTotalSpend(ctx: ListyContext, startDate: string, endDate: string | undefined = undefined) {
    try {
        const userId = ctx.from?.id;

        if (startDate && endDate) {
            let rawSpend = await db
                .selectFrom('transactions')
                .select([ 'total_price_after_discount', 'total_price_before_discount' ])
                .where('user_id', '=', userId)
                .where('transaction_date', '>=', new Date(startDate))
                .where('transaction_date', '<=', new Date(endDate || new Date()))
                .execute();

            let userLimit = await db.selectFrom('users').select('limit').where('telegram_id', '=', userId.toString()).execute();

            let list = rawSpend.map((a) => a.total_price_after_discount || a.total_price_before_discount).join('\n- ')

            if (rawSpend.length > 0) {
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
        } else {

        }

    } catch (error: any) {
        logger.error({ error }, `Error while processing reset command: ${error.message}`);
        await ctx.reply(i18n.t('error'));
    }
}