import type { Api, Bot, Context, RawApi } from 'grammy';
import { db } from '../database';
import i18n from '../i18n';
import { userState } from '../utils/state';

export const setupCommands = (bot: Bot<Context, Api<RawApi>>) => {
    bot.command('start', async (ctx) => {
        await ctx.reply(i18n.t('start', { name: ctx.from?.first_name || ctx.from?.username }));
    });

    bot.command('help', async (ctx) => {
        await ctx.reply(i18n.t('help'));
    });

    bot.command('setlimit', async (ctx) => {
        const userId = ctx.from?.id;
        if (userId) {
            userState[ userId ] = { waitingForLimit: true };
            await ctx.reply(i18n.t('setlimit'));
        }
    })
};

