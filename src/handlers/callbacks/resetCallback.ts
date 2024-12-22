import type { Context } from 'grammy';
import { db } from '../../database';
import i18n from '../../i18n';
import { userState } from '../../utils/state';

export const handleResetConfirm = async (ctx: Context, userId: number) => {
    const userStateData = userState[ userId ];

    if (userStateData?.waitingForResetConfirmation) {
        await db.updateTable('users')
            .where('telegram_id', '=', userId.toString())
            .set('limit', 0)
            .execute();

        await ctx.reply(i18n.t('reset_confirmed'));
        delete userState[ userId ].waitingForResetConfirmation;
    } else {
        await ctx.answerCallbackQuery(i18n.t('reset_confirmation_expired'));
    }
};

export const handleResetCancel = async (ctx: Context, userId: number) => {
    const userStateData = userState[ userId ];
    if (userStateData?.waitingForResetConfirmation) {
        await ctx.answerCallbackQuery(i18n.t('reset_cancelled'));
        delete userState[ userId ].waitingForResetConfirmation;
    } else {
        await ctx.answerCallbackQuery(i18n.t('reset_confirmation_expired'));
    }
};