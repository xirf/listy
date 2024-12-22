import { db } from '../database';
import i18n from '../i18n';
import { userState } from '../utils/state';
import type { Bot, Context, Api, RawApi } from 'grammy';
import type { ParseModeFlavor } from '@grammyjs/parse-mode';
import { handleImage } from './events/handleImage';
import { handleLimit } from './events/handleLimit';

export const setupEventHandlers = (bot: Bot<ParseModeFlavor<Context>, Api<RawApi>>) => {
    bot.on('message:photo', (ctx) => {
        handleImage(ctx);
    });

    bot.on('message:text', async (ctx) => {
        const userId = ctx.from.id;
        const user = await db.selectFrom('users').where('telegram_id', "=", userId.toString()).execute();
        const state = userState[ userId ];

        if (user.length === 0) {
            await db.insertInto('users')
                .values({ telegram_id: userId.toString(), })
                .execute();

            await ctx.reply(i18n.t('start', { name: ctx.from.first_name || ctx.from.username }));
        }

        if (state && state.waitingForLimit) {
            handleLimit(ctx, userId);
        }
    });
};
