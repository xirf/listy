import i18n from "../../i18n";
import extractReceipt from "../../lib/gemini";
import fs from 'fs';
import logger from "../../utils/logger";
import type { ListyContext } from "../../types";
import type { Context } from "grammy";
import { fileTypeFromBuffer } from "file-type";

export const handleImage = async (ctx: ListyContext) => {
    try {
        ctx.reply(i18n.t("processing_image"));
        const file = await ctx.getFile();

        if (!file) {
            ctx.reply(i18n.t("image_error"));
            return;
        }

        const filePath = await file.download()
        const fileBuffer = fs.readFileSync(filePath);
        const fileType = await fileTypeFromBuffer(new Uint8Array(fileBuffer));

        if (!fileType?.mime) {
            ctx.reply(i18n.t("image_error"));
            return;
        }

        logger.info(`Processing image: ${filePath} with type: ${fileType?.ext}`);

        const receiptContent = await extractReceipt(filePath, fileType?.mime || 'image/jpeg');

        console.log(receiptContent);
        
        if (receiptContent === null || !receiptContent.isReceipt) {
            ctx.reply(i18n.t("invalid_image"));
            return;
        }


        fs.writeFileSync('output.json', JSON.stringify(receiptContent, null, 2));
        ctx.reply(JSON.stringify(receiptContent, null, 2));


    } catch (error: any) {
        logger.error({ error }, `Error while processing image: ${error.message}`);
        ctx.reply(i18n.t("image_error"));
    }
}