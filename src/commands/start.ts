import { Command } from "@grammyjs/commands";
import type { ListyContext } from "../types/index";
import i18n from '../i18n';

export default new Command<ListyContext>("start", "Yuk mulai ngobrol", async (ctx) => {
    await ctx.reply(i18n.t('start', { name: ctx.from?.first_name || ctx.from?.username }));
});