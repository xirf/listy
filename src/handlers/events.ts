import type { ListyContext, SessionData } from '../types';
import { handleLimit } from './events/handleLimit';
import type { Bot } from 'grammy';
import { handleImage } from './events/handleImage';
import handleAi from './events/aiResponse';

export async function setupEventHandlers(bot: Bot<ListyContext>) {
    bot.on(':photo', handleImage);
    bot.on(':text', async (ctx) => {
        const userId = ctx.from?.id.toString();;
        if (!userId) return;

        const state: SessionData = ctx.session;

        if (state.waitingForLimit) {
            await handleLimit(ctx, userId);
        } else {
            handleAi(ctx, userId);
        }
    })
}
