// config.js
import dotenv from 'dotenv';
import logger from '../utils/logger';

dotenv.config();

logger.info({}, "Loading configuration...");

if (!process.env.BOT_TOKEN) {
    logger.fatal({}, "Missing BOT_TOKEN in environment variables, have you created a .env file?");
    process.exit(1);
}

logger.info({}, "Configuration loaded successfully!");
export const BOT_TOKEN = process.env.BOT_TOKEN as string;
