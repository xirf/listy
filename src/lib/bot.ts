import logger from '../utils/logger';
import { Api, Bot, session } from 'grammy';
import { BOT_TOKEN } from '../config/botconfig';
import { parseMode } from "@grammyjs/parse-mode";
import { hydrateFiles } from '@grammyjs/files';
import type { ListyApi, ListyContext, SessionData } from '../types';
import { commands } from '@grammyjs/commands';
import { userCommands } from '../commands';

export const bot = new Bot<ListyContext, ListyApi>(BOT_TOKEN);

function initial(): SessionData {
    return {
        waitingForLimit: false,
        waitingForResetConfirmation: false,
    };
}

bot.api.config.use(parseMode("Markdown"));
bot.api.config.use(hydrateFiles(bot.token));
bot.use(session({ initial }));
bot.use(commands())
bot.use(userCommands)
await userCommands.setCommands(bot);

export async function startBot() {
    try {
        bot.start();
        logger.info({}, "Success, Waiting for messages...");
    } catch (error: any) {
        logger.fatal({ error }, `Fatal error while starting bot: ${error.message}`);
        process.exit(1);
    }
}