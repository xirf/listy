import type { Context, Telegraf } from 'telegraf';
import { db } from '../database';
import i18n from '../i18n';
import type { Update } from 'telegraf/types';

export const setupEventHandlers = (bot: Telegraf<Context<Update>>) => {
    bot.on('photo', (ctx) => {
        ctx.reply('Photo received!');
    });

    bot.on('text', async (ctx) => {
        let user = await db.selectFrom('users').where('telegram_id', "=", ctx.from.id.toString()).execute();

        if (user.length === 0) {
            await db.insertInto('users')
                .values({
                    telegram_id: ctx.from.id.toString(),
                    username: ctx.from.username || '',
                    first_name: ctx.from.first_name || '',
                    last_name: ctx.from.last_name || '',
                })
                .execute();

            await ctx.reply(i18n.t('start', { name: ctx.from.first_name || ctx.from.username }));
        } else {
            ctx.reply(i18n.t('what_to_do'));
        }
    });
};
