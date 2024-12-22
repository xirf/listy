import { Command } from "@grammyjs/commands";
import type { ListyContext } from "../types/index";
import i18n from '../i18n';
import { userState } from "../utils/state";

export default new Command<ListyContext>("setlimit", "Tetapkan budget bulananmu", async (ctx) => {
    const userId = ctx.from?.id;
    if (userId) {
        userState[ userId ] = { waitingForLimit: true };
        await ctx.reply(i18n.t('setlimit'));
    }
});