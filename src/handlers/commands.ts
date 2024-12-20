import type { Context, Telegraf } from 'telegraf';
import { db } from '../database';
import i18n from '../i18n';
import type { Update } from 'telegraf/types';

export const setupCommands = (bot: Telegraf<Context<Update>>) => {
    bot.command('start', async (ctx) => {
        await ctx.reply(i18n.t('start', { name: ctx.from.first_name || ctx.from.username }));
    });

    bot.command('help', async (ctx) => {
        await ctx.reply(i18n.t('help'));
    });
};
