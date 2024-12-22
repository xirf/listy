import { Command } from "@grammyjs/commands";
import type { ListyContext } from "../types/index";
import i18n from '../i18n';
import { InlineKeyboard } from "grammy";
import { CallbackQuery } from "../constant/CallbackQuery";

export default new Command<ListyContext>("reset", 'Hapus semua yang udah di catet', async (ctx) => {
    const userId = ctx.from?.id;
    if (userId) {
        const keyboard = new InlineKeyboard()
            .text(i18n.t('reset_buttons.yes'), CallbackQuery.RESET_CONFIRM)
            .text(i18n.t('reset_buttons.no'), CallbackQuery.RESET_CANCEL);

        await ctx.reply(i18n.t('reset_confirm'), {
            reply_markup: keyboard,
        });
    }
});