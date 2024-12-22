import { bot, startBot } from './lib/bot';
import { setupCommands } from './handlers/commands';
import { setupEventHandlers } from './handlers/events';
import logger from './utils/logger';
import { setupCallbackQuery } from './handlers/callbackQuery';

logger.info({}, "Starting bot...");

setupCallbackQuery(bot);
setupCommands(bot);
setupEventHandlers(bot);

startBot();
