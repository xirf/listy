import { db } from '../../database';
import i18n from '../../i18n';
import type { ListyContext } from '../../types';

export const handleResetConfirm = async (ctx: ListyContext, userId: number) => {
    if (ctx.session.waitingForResetConfirmation) {
        await db.updateTable('users')
            .where('telegram_id', '=', userId.toString())
            .set('limit', 0)
            .execute();

        await ctx.reply(i18n.t('reset_confirmed'));
        ctx.session.waitingForResetConfirmation = false;
    } else {
        await ctx.answerCallbackQuery(i18n.t('reset_confirmation_expired'));
    }
};

export const handleResetCancel = async (ctx: ListyContext, userId: number) => {
    if (ctx.session.waitingForResetConfirmation) {
        await ctx.answerCallbackQuery(i18n.t('reset_cancelled'));
        ctx.session.waitingForResetConfirmation = false;
    } else {
        await ctx.answerCallbackQuery(i18n.t('reset_confirmation_expired'));
    }
};