import { Command, CommandGroup } from "@grammyjs/commands";
import type { ListyContext } from "../types";
import { handleSetLimit } from "../functions/setlimit";
import i18n from '../i18n';
import { handleReset } from "../functions/reset";

const setLimitCommand = new Command<ListyContext>("setlimit", "Tetapkan budget bulananmu", handleSetLimit);
const resetCommand = new Command<ListyContext>("reset", 'Hapus semua yang udah di catet', handleReset);
const helpCommand =  new Command<ListyContext>("help", "Butuh panduan? Sini sini", async (ctx) => { await await ctx.reply(i18n.t('help')); });
const startCommand = new Command<ListyContext>("start", "Yuk mulai ngobrol", async (ctx) => { await ctx.reply(i18n.t('start', { name: ctx.from?.first_name || ctx.from?.username })); });

export const userCommands = new CommandGroup<ListyContext>().add([
    setLimitCommand,
    resetCommand,
    helpCommand,
    startCommand
]);