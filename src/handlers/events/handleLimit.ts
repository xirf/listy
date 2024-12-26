import i18next from "../../i18n"
import { db } from "../../database";
import { numberFormat } from "../../utils/numberFormat";
import type { ListyContext } from "../../types";

export const handleLimit = async (ctx: ListyContext, userId: number) => {
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

        ctx.session.waitingForLimit = false;
    }
}