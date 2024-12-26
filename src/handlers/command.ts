import { Command, CommandGroup } from "@grammyjs/commands";
import type { ListyContext } from "../types";
import { setUserLimit } from "../functions/setlimit";
import i18n from '../i18n';
import { handleReset } from "../functions/reset";
import { calculateTotalSpending } from "../functions/calculateTotalSpend";

async function handleSetLimit(ctx: ListyContext) {
    await setUserLimit.execute(ctx, undefined);
}

async function handleHelp(ctx: ListyContext) {
    await ctx.reply(i18n.t('help'));
}

async function handleStart(ctx: ListyContext) {
    await ctx.reply(i18n.t('start', { name: ctx.from?.first_name || ctx.from?.username }));
}

async function handleTotalSpending(ctx: ListyContext) {
    await calculateTotalSpending.execute(ctx, undefined);
}

// Command definitions
const setLimitCommand = new Command<ListyContext>("setlimit", "Tetapkan budget bulananmu", handleSetLimit);
const resetCommand = new Command<ListyContext>("reset", 'Hapus semua yang udah di catet', handleReset);
const helpCommand = new Command<ListyContext>("help", "Butuh panduan? Sini sini", handleHelp);
const startCommand = new Command<ListyContext>("start", "Yuk mulai ngobrol", handleStart);
const totalSpendingCommand = new Command<ListyContext>("totalspending", "Cek total pengeluaranmu", handleTotalSpending);

// Register commands
export const userCommands = new CommandGroup<ListyContext>().add([
    setLimitCommand,
    resetCommand,
    helpCommand,
    startCommand,
    totalSpendingCommand
]);