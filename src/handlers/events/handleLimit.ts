import type { Context } from "grammy";
import { userState } from "../../utils/state";
import i18next from "../../i18n"
import { db } from "../../database";
import { numberFormat } from "../../utils/numberFormat";

export const handleLimit = async (ctx: Context, userId: number) => {
    userState[ userId ] = { waitingForLimit: false };

    const limit = ctx.message && ctx.message.text ? parseInt(ctx.message.text) : NaN;

    if (isNaN(limit) || limit <= 0) {
        await ctx.reply(i18next.t('limit_invalid'));
    } else {
        await db.updateTable('users')
            .where('telegram_id', '=', userId.toString())
            .set('limit', limit)
            .execute();

        if (limit < 1000000) {
            await ctx.reply(i18next.t('limit_too_low', {
                limit: numberFormat(limit),
            }));
        } else {
            await ctx.reply(i18next.t('limit_set', {
                limit: numberFormat(limit),
            }));
        }

        userState[ userId ] = {};
    }
}