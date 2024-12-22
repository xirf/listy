import type { Api, Bot, Context, RawApi } from 'grammy';
import { InlineKeyboard } from 'grammy';
import { db } from '../database';
import i18n from '../i18n';
import { userState } from '../utils/state';
import type { ParseModeFlavor } from '@grammyjs/parse-mode';
import { CallbackQuery } from '../constant/CallbackQuery';

export const setupCommands = (bot: Bot<ParseModeFlavor<Context>, Api<RawApi>>) => {
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

    bot.command('reset', async (ctx) => {
        const userId = ctx.from?.id;
        if (userId) {
            const keyboard = new InlineKeyboard()
                .text(i18n.t('reset_buttons.yes'), CallbackQuery.RESET_CONFIRM)
                .text(i18n.t('reset_buttons.no'), CallbackQuery.RESET_CANCEL);

            await ctx.reply(i18n.t('reset_confirm'), {
                reply_markup: keyboard,
            });
        }
    })
};

