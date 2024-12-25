import type { ListyContext } from "../../types/index";
import i18n from '../../i18n';
import { userState } from "../../utils/state";
import logger from "../../utils/logger";

export async function handleSetLimit(ctx: ListyContext) {
    try {
        const userId = ctx.from?.id;
        if (userId) {
            userState[ userId ] = { waitingForLimit: true };
            await ctx.reply(i18n.t('setlimit'));
        }
    } catch (error: any) {
        logger.error({ error }, `Error while processing set limit command: ${error.message}`);
        await ctx.reply('An error occurred while setting the limit. Please try again later.');
    }
}