import type { FunctionCallDeclaration, ListyContext } from "../types/index";
import i18n from '../i18n';
import logger from "../utils/logger";
import { db } from "../database";
import { numberFormat } from "../utils/numberFormat";

async function setUserLimitFunc(ctx: ListyContext, budget: number | undefined = undefined) {
    try {
        const userId = ctx.from?.id;
        if (!userId) {
            await ctx.reply('User ID not found.');
            return;
        }

        if (budget) {
            if (isNaN(budget) || budget <= 0) {
                await ctx.reply(i18n.t('limit_invalid'));
                return;
            }

            await db.updateTable('users')
                .where('telegram_id', '=', userId.toString())
                .set('limit', budget)
                .execute();

            if (budget < 1000000) {
                await ctx.reply(i18n.t('limit_too_low', {
                    limit: numberFormat(budget),
                }));
            } else {
                await ctx.reply(i18n.t('limit_set', {
                    limit: numberFormat(budget),
                }));
            }

            ctx.session.waitingForLimit = false;
        } else {
            ctx.session.waitingForLimit = true;
            await ctx.reply(i18n.t('setlimit'));
        }
    } catch (error: any) {
        logger.error({ error }, `Error while processing set limit command: ${error.message}`);
        await ctx.reply('An error occurred while setting the limit. Please try again later.');
    }
}

export const setUserLimit: FunctionCallDeclaration = {
    type: "function",
    function: {
        name: "set_user_limit",
        description: "Set the user's spending limit.",
        parameters: {
            type: "object",
            properties: {
                budget: {
                    type: "number",
                    description: "The spending limit to set for the user. example =\"Aku cuman punya 2jt bulan ini\",\"atur limit ku ke 2 juta\""
                },
            },
            required: [ "budget" ],
        },
    },
    execute: async (ctx: ListyContext, budget: number | undefined = undefined) => {
        return setUserLimitFunc(ctx, budget);
    },
};