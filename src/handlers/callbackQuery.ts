import type { Api, Bot, Context, RawApi } from 'grammy';
import type { ParseModeFlavor } from '@grammyjs/parse-mode';
import { CallbackQuery } from '../constant/CallbackQuery';
import { handleResetConfirm, handleResetCancel } from './callbacks/resetCallback';
import { calculateTotalSpending } from '../functions/calculateTotalSpend';


// Add callback here to handle the callback query
const callbackHandlers: Record<string, (ctx: Context, userId: number) => Promise<void>> = {
    [ CallbackQuery.RESET_CONFIRM ]: handleResetConfirm,
    [ CallbackQuery.RESET_CANCEL ]: handleResetCancel,
    [ CallbackQuery.SPEND.MONTHLY ]: async (ctx, _) => {
        console.log("Monthly");
        let currentDate = new Date();
        let startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        await calculateTotalSpending.execute(ctx, {
            startDate: startDate.toISOString()
        });
    },
    [ CallbackQuery.SPEND.WEEKLY ]: async (ctx, _) => {
        console.log("Weekly");
        let currentDate = new Date();
        let weekStart = new Date(currentDate);
        weekStart.setDate(currentDate.getDate() - currentDate.getDay());
        await calculateTotalSpending.execute(ctx, {
            startDate: weekStart.toISOString()
        });
    },
};


export const setupCallbackQuery = (bot: Bot<ParseModeFlavor<Context>, Api<RawApi>>) => {
    bot.on('callback_query:data', async (ctx) => {
        const userId = ctx.from?.id;
        const callbackQuery = ctx.callbackQuery.data;
        if (!userId) return;

        await callbackHandlers[ callbackQuery ](ctx, userId);

    });
};
