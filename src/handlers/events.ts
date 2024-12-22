import { db } from '../database';
import i18n from '../i18n';
import { userState } from '../utils/state';
import i18next from '../i18n';
import type { Bot, Context, Api, RawApi } from 'grammy';
import type { ParseModeFlavor } from '@grammyjs/parse-mode';
import { numberFormat } from '../utils/numberFormat';

export const setupEventHandlers = (bot: Bot<ParseModeFlavor<Context>, Api<RawApi>>) => {
    bot.on('message:photo', (ctx) => {
        ctx.reply('Photo received!');
    });

    bot.on('message:text', async (ctx) => {
        let user = await db.selectFrom('users').where('telegram_id', "=", ctx.from.id.toString()).execute();

        console.log(user);

        if (user.length === 0) {
            await db.insertInto('users')
                .values({
                    telegram_id: ctx.from.id.toString(),
                })
                .execute();

            await ctx.reply(i18n.t('start', { name: ctx.from.first_name || ctx.from.username }));
        }

        const userId = ctx.from.id;
        const userStatus = userState[ userId ];

        if (userStatus && userStatus.waitingForLimit) {
            userState[ userId ] = { waitingForLimit: false };
            const limit = parseInt(ctx.message.text);

            if (isNaN(limit) || limit <= 0) {
                await ctx.reply(i18next.t('limit_invalid'));
            } else {
                await db.updateTable('users')
                    .where('telegram_id', '=', ctx.from.id.toString())
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

    });
};
