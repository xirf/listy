import { Bot, Context } from 'grammy';
import { BOT_TOKEN } from '../config/botconfig';
import logger from '../utils/logger';

import { parseMode, type ParseModeFlavor } from "@grammyjs/parse-mode";

export const bot = new Bot<ParseModeFlavor<Context>>(BOT_TOKEN);

bot.api.config.use(parseMode("Markdown"))

export async function startBot() {
    try {
        bot.start();
        logger.info({}, "Success, Waiting for messages...");
    } catch (error: any) {
        logger.fatal({error}, `Fatal error while starting bot: ${error.message}`);  
        process.exit(1);
    }
}