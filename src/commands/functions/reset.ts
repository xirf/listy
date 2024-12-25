import type { ListyContext } from "../../types/index";
import i18n from '../../i18n';
import { InlineKeyboard } from "grammy";
import { CallbackQuery } from "../../constant/CallbackQuery";
import { userState } from "../../utils/state";
import logger from "../../utils/logger";

export async function handleReset(ctx: ListyContext) {
    try {
        const userId = ctx.from?.id;
        if (userId) {
            userState[ userId ] = { waitingForResetConfirmation: true };
            const keyboard = new InlineKeyboard()
                .text(i18n.t('reset_buttons.yes'), CallbackQuery.RESET_CONFIRM)
                .text(i18n.t('reset_buttons.no'), CallbackQuery.RESET_CANCEL);

            await ctx.reply(i18n.t('reset_confirm'), {
                reply_markup: keyboard,
            });
        }
    } catch (error: any) {
        logger.error({ error }, `Error while processing reset command: ${error.message}`);
        await ctx.reply(i18n.t('error'));
    }
}