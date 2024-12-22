import type { Context } from "grammy";
import i18n from "../../i18n";
import { GeminiImageProcessor } from "../../lib/gemini";
import fs from 'fs';

export const handleImage = async (ctx: Context) => {
    try {
        const file = await ctx.getFile();

        if (!file) {
            ctx.reply(i18n.t("image_error"));
            return;
        }


        if (!fs.existsSync('/temp')) {
            fs.mkdirSync('/temp');
        }

        // @ts-expect-error already included in bot
        const filePath = await ctx.download('/temp')

        const gemini = new GeminiImageProcessor(process.env.GEMINI_API_KEY!!);
        const image = await gemini.processImage(filePath);

        ctx.reply(JSON.stringify(image, null, 2));


    } catch (error: any) {
        ctx.reply(i18n.t("image_error"));
    }
}