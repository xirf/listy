import type { Api, Bot, Context, RawApi } from 'grammy';
import type { ParseModeFlavor } from '@grammyjs/parse-mode';
import { CallbackQuery } from '../constant/CallbackQuery';
import { handleResetConfirm, handleResetCancel } from './callbacks/resetCallback';
import { userState } from '../utils/state';
import i18n from '../i18n';


// Add callback here to handle the callback query
const callbackHandlers: Record<string, (ctx: Context, userId: number) => Promise<void>> = {
    [CallbackQuery.RESET_CONFIRM]: handleResetConfirm,
    [CallbackQuery.RESET_CANCEL]: handleResetCancel,
};


export const setupCallbackQuery = (bot: Bot<ParseModeFlavor<Context>, Api<RawApi>>) => {
    bot.on('callback_query:data', async (ctx) => {
        const userId = ctx.from?.id;
        const state = userState[ userId ];
        const callbackQuery = ctx.callbackQuery.data;
        if (!userId) return;

        let isHadCallback = [ CallbackQuery.RESET_CONFIRM, CallbackQuery.RESET_CANCEL ].includes(callbackQuery)

        if (!state || !isHadCallback) {
            await ctx.answerCallbackQuery(i18n.t('reset_confirmation_expired'));
            return;
        }

        await callbackHandlers[ callbackQuery ](ctx, userId);

    });
};
