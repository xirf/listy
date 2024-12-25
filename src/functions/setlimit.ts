import type { ListyContext } from "../types/index";
import i18n from '../i18n';
import { userState } from "../utils/state";
import logger from "../utils/logger";
import { db } from "../database";
import { numberFormat } from "../utils/numberFormat";

export async function handleSetLimit(ctx: ListyContext, limit: number | undefined = undefined) {
    try {
        const userId = ctx.from?.id;
        if (userId) {
            if (limit) {
                if (isNaN(limit) || limit <= 0) {
                    await ctx.reply(i18n.t('limit_invalid'));
                } else {
                    await db.updateTable('users')
                        .where('telegram_id', '=', userId.toString())
                        .set('limit', limit)
                        .execute();

                    if (limit < 1000000) {
                        await ctx.reply(i18n.t('limit_too_low', {
                            limit: numberFormat(limit),
                        }));
                    } else {
                        await ctx.reply(i18n.t('limit_set', {
                            limit: numberFormat(limit),
                        }));
                    }

                    userState[ userId ] = {};
                }

            } else {
                userState[ userId ] = { waitingForLimit: true };
                await ctx.reply(i18n.t('setlimit'));
            }
        }
    } catch (error: any) {
        logger.error({ error }, `Error while processing set limit command: ${error.message}`);
        await ctx.reply('An error occurred while setting the limit. Please try again later.');
    }
}