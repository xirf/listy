import i18n from "../../i18n";
import extractReceipt from "../../lib/gemini";
import fs from 'fs';
import logger from "../../utils/logger";
import { fileTypeFromBuffer } from "file-type";
import { db } from "../../database";
import generateChecksum from "../../utils/checksum";
import type { ListyContext } from "../../types";

export const handleImage = async (ctx: ListyContext) => {
    try {
        ctx.reply(i18n.t("processing_image"));
        const file = await ctx.getFile();

        if (!file) {
            return ctx.reply(i18n.t("image_error"));
        }

        const filePath = await file.download();
        const fileBuffer = fs.readFileSync(filePath);
        const fileType = await fileTypeFromBuffer(new Uint8Array(fileBuffer));

        if (!fileType?.mime) {
            return ctx.reply(i18n.t("image_error"));
        }

        const checksum = generateChecksum(filePath);

        const existingFile = await db
            .selectFrom('checksum')
            .where('checksum', '=', checksum)
            .limit(1)
            .execute();

        if (!checksum || existingFile.length > 0) {
            return ctx.reply(i18n.t("image_exist"));
        }

        await db.insertInto('checksum').values({
            checksum,
            user_id: ctx.from.id
        }).execute();


        const receiptContent = await extractReceipt(filePath, fileType.mime || 'image/jpeg');

        if (!receiptContent || !receiptContent.isReceipt) {
            return ctx.reply(i18n.t("invalid_image"));
        }

        const transaction = await db
            .insertInto("transactions")
            .values({
                currency: receiptContent.currency,
                user_id: ctx.from.id,
                total_price_after_discount: receiptContent.totalPriceAfterDiscount,
                total_price_before_discount: receiptContent.totalPriceBeforeDiscount,
                store_name: receiptContent.storeName,
                transaction_date: new Date(
                    receiptContent.transactionDate?.year,
                    receiptContent.transactionDate?.month - 1,
                    receiptContent.transactionDate?.day
                ).toISOString()
            })
            .returning('id')
            .execute();

        const transactionId = transaction[ 0 ]?.id;

        if (receiptContent.items?.length) {
            await db.insertInto("items").values(
                receiptContent.items.map(item => ({
                    item: item.item,
                    item_count: item.itemCount,
                    price: parseFloat(item.price),
                    transaction_id: transactionId
                }))
            ).execute();
        }

        if (receiptContent.discounts?.length) {
            await db.insertInto("discounts").values(
                receiptContent.discounts.map(discount => ({
                    description: discount.description,
                    amount: parseFloat(discount.amount),
                    transaction_id: transactionId
                }))
            ).execute();
        }

        const itemList = receiptContent.items?.map(
            item => `- ${item.item} x${item.itemCount} ${item.price}`
        ).join("\n");

        await ctx.reply(i18n.t("image_success", {
            list: itemList,
            total: receiptContent.totalPriceAfterDiscount
        }));

    } catch (error: any) {
        logger.error({ error }, `Error while processing image: ${error.message}`);
        ctx.reply(i18n.t("image_error"));
    }
};
