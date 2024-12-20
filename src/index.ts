import { bot, startBot } from './lib/bot';
import { setupCommands } from './handlers/commands';
import { setupEventHandlers } from './handlers/events';
import logger from './utils/logger';

logger.info({}, "Starting bot...");

setupCommands(bot);
setupEventHandlers(bot);

startBot();
