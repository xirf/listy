import { bot, startBot } from './lib/bot';
import { setupEventHandlers } from './handlers/events';
import logger from './utils/logger';
import { setupCallbackQuery } from './handlers/callbackQuery';

logger.info({}, "Starting bot...");

setupCallbackQuery(bot);
setupEventHandlers(bot);

startBot();
