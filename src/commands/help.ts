import { Command } from "@grammyjs/commands";
import type { ListyContext } from "../types/index";
import i18n from '../i18n';

export default new Command<ListyContext>("help", "Butuh panduan? Sini sini", async (ctx) => {
    await ctx.reply(i18n.t('help'));
});