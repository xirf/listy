import logger from '../utils/logger';
import { Api, Bot, GrammyError, HttpError, session, type NextFunction } from 'grammy';
import { BOT_TOKEN } from '../config/botconfig';
import { parseMode } from "@grammyjs/parse-mode";
import { hydrateFiles } from '@grammyjs/files';
import type { ListyApi, ListyContext, SessionData } from '../types';
import { commands } from '@grammyjs/commands';
import { userCommands } from '../handlers/command';
import { db } from '../database';

export const bot = new Bot<ListyContext, ListyApi>(BOT_TOKEN);

function initial(): SessionData {
    return {
        waitingForLimit: false,
        waitingForResetConfirmation: false,
        waitingForSpendRange: false
    };
}

async function checkUser(ctx: ListyContext, next: NextFunction): Promise<void> {
    if (ctx.from?.id) {
        const userId = ctx.from.id;
        const user = await db
            .selectFrom('users')
            .where('telegram_id', "=", userId.toString())
            .limit(1)
            .execute();

        if (user.length === 0) {
            await db.insertInto('users')
                .values({ telegram_id: userId.toString(), })
                .execute();

            logger.info(`User ${ctx.from.id} registered in the database`);
        }
    }

    await next();
}


bot.api.config.use(parseMode("Markdown"));
bot.api.config.use(hydrateFiles(bot.token));
bot.use(commands())
bot.use(session({ initial }));
bot.use(checkUser);
bot.use(userCommands)
await userCommands.setCommands(bot);

bot.catch((err) => {
    const e = err.error;

    if (e instanceof GrammyError) {
        logger.error({ error: e }, `Error in request: ${e.message}`);
    } else if (e instanceof HttpError) {
        logger.error({ error: e }, `HTTP error, cannot connect to Telegram: ${e.message}`);
    } else {
        logger.error({ error: e }, `Unknown error happend`);
    }
})


export async function startBot() {
    try {
        bot.start();
        logger.info({}, "Success, Waiting for messages...");
    } catch (error: any) {
        logger.fatal({ error }, `Fatal error while starting bot: ${error.message}`);
        process.exit(1);
    }
}
