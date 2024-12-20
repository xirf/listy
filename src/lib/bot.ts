import { Telegraf } from 'telegraf';
import { BOT_TOKEN } from '../config/botconfig';
import logger from '../utils/logger';

export const bot = new Telegraf(BOT_TOKEN);

export async function startBot() {
    try {
        bot.launch();
        logger.info({}, "Success, Waiting for messages...");
    } catch (error: any) {
        logger.fatal({error}, `Fatal error while starting bot: ${error.message}`);
        process.exit(1);
    }
}

process.on('SIGINT', async () => {
    logger.info({}, "Received SIGINT, stopping bot...");
    await bot.stop();
});

process.on('SIGTERM', async () => {
    logger.info({}, "Received SIGTERM, stopping bot...");
    await bot.stop();
});
