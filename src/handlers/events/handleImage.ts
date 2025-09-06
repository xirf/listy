import i18n from "../../i18n";
import extractReceipt from "../../lib/gemini";
import fs from "fs";
import logger from "../../utils/logger";
import { fileTypeFromBuffer } from "file-type";
import { db } from "../../database";
import generateChecksum from "../../utils/checksum";
import type { ListyContext, ReceiptResult } from "../../types";
import { numberFormat } from "../../utils/numberFormat";
import { sql } from "kysely";

export const handleImage = async (ctx: ListyContext) => {
    try {
        await resetUserSpendingIfNeeded(ctx);
        ctx.reply(i18n.t("processing_image"));

        const filePath = await downloadFile(ctx);
        const fileType = await validateFileType(filePath);
        const checksum = await validateChecksum(filePath);

        const receiptContent = await extractReceipt(filePath, fileType);

        if (receiptContent && receiptContent.isReceipt) {
            const buyDate = extractBuyDate(receiptContent);
            const discountAmount = calculateDiscountAmount(receiptContent);

            const transaction = await insertTransaction(receiptContent, ctx, buyDate, discountAmount);
            await insertItemsAndDiscounts(receiptContent, transaction.id);

            const itemList = formatItemList(receiptContent.items);
            const totalSpending = calculateTotalSpending(receiptContent, discountAmount);
            const overallSpending = await updateUserSpending(ctx, totalSpending, extractBuyDate(receiptContent));

            await insertChecksum(checksum, ctx);
            await sendReceiptSuccess(ctx, itemList, discountAmount, totalSpending);

            await checkUserBudget(ctx, overallSpending);
        } else {
            await ctx.reply(i18n.t("invalid_image"));
            return
        }
    } catch (error: any) {
        logger.error({ error }, `Error while processing image: ${error.message}`);
        ctx.reply(i18n.t("image_error"));
    }
};


async function resetUserSpendingIfNeeded(ctx: ListyContext) {
    const currentDate = new Date();
    const [ user ] = await db
        .selectFrom("users")
        .select("reset_at")
        .where("telegram_id", "=", ctx.from.id.toString())
        .execute();
    const resetDate = new Date(user.reset_at);

    if (currentDate.getDate() === 1 && resetDate.getMonth() !== currentDate.getMonth()) {
        await db
            .updateTable("users")
            .set({ total_spending: 0, reset_at: currentDate })
            .where("telegram_id", "=", ctx.from.id.toString())
            .execute();
    }
}

async function downloadFile(ctx: ListyContext): Promise<string> {
    const file = await ctx.getFile();
    if (!file) {
        throw new Error(i18n.t("image_error"));
    }
    return file.download();
}

async function validateFileType(filePath: string): Promise<string> {
    const fileBuffer = fs.readFileSync(filePath);
    const fileType = await fileTypeFromBuffer(new Uint8Array(fileBuffer));
    if (!fileType?.mime) {
        throw new Error(i18n.t("image_error"));
    }
    return fileType.mime;
}

async function validateChecksum(filePath: string): Promise<string> {
    const checksum = generateChecksum(filePath);
    const existingFile = await db
        .selectFrom("checksum")
        .where("checksum", "=", checksum)
        .limit(1)
        .execute();

    if (!checksum || existingFile.length > 0) {
        throw new Error(i18n.t("image_exist"));
    }
    return checksum;
}

function extractBuyDate(receiptContent: ReceiptResult): Date {
    const { year, month, day } = receiptContent.transactionDate || {};
    return year && month && day ? new Date(year, month - 1, day) : new Date();
}

function calculateDiscountAmount(receiptContent: ReceiptResult): number {
    return receiptContent.discounts
        ? receiptContent.discounts.reduce((acc: number, discount: any) => acc + discount.amount, 0)
        : 0;
}

async function insertTransaction(receiptContent: ReceiptResult, ctx: ListyContext, buyDate: Date, discountAmount: number) {
    const [ transaction ] = await db
        .insertInto("transactions")
        .values({
            currency: receiptContent.currency,
            user_id: ctx.from.id.toString(),
            total_price_after_discount: receiptContent.totalPriceAfterDiscount,
            total_price_before_discount: receiptContent.totalPriceBeforeDiscount,
            discount_amount: discountAmount,
            store_name: receiptContent.storeName,
            transaction_date: buyDate.toISOString(),
        })
        .returning("id")
        .execute();
    return transaction;
}

async function insertItemsAndDiscounts(receiptContent: ReceiptResult, transactionId: number) {
    const { items = [], discounts = [] } = receiptContent;

    if (items.length > 0) {
        await db
            .insertInto("items")
            .values(
                items.map((item: any) => ({
                    item: item.item,
                    item_count: item.itemCount,
                    price: parseFloat(item.price) || 0,
                    transaction_id: transactionId,
                }))
            )
            .execute();
    }

    if (discounts.length > 0) {
        await db
            .insertInto("discounts")
            .values(
                discounts.map((discount: any) => ({
                    description: discount.description,
                    amount: discount.amount,
                    transaction_id: transactionId,
                }))
            )
            .execute();
    }
}

function formatItemList(items: ReceiptResult[ "items" ] | undefined): string {
    if (items) {
        return items
            .map((item) => `- ${item.item.toLocaleUpperCase()} x${item.itemCount} ${numberFormat(parseFloat(item.price) || 0)}`)
            .join("\n");
    } else {
        return i18n.t('no_list')
    }
}

function calculateTotalSpending(receiptContent: ReceiptResult, discountAmount: number): number {
    // Use totalPriceAfterDiscount if available, otherwise calculate it
    return receiptContent.totalPriceAfterDiscount || 
           ((receiptContent.totalPriceBeforeDiscount || 0) - discountAmount);
}

async function updateUserSpending(ctx: ListyContext, totalSpending: number, date: Date) {
    const currentDate = new Date();
    // Check if the transaction is from the current month AND year
    if (date.getMonth() === currentDate.getMonth() && date.getFullYear() === currentDate.getFullYear()) {
        const [ updatedUser ] = await db
            .updateTable("users")
            .set({ total_spending: sql`total_spending + ${totalSpending}` })
            .where("telegram_id", "=", ctx.from.id.toString())
            .returning("total_spending")
            .execute();
        return updatedUser.total_spending;
    } else {
        // For transactions from other months, just return the current total spending
        const [ user ] = await db
            .selectFrom("users")
            .select("total_spending")
            .where("telegram_id", "=", ctx.from.id.toString())
            .execute();
        return user?.total_spending || 0;
    }
}

async function insertChecksum(checksum: string, ctx: ListyContext) {
    await db
        .insertInto("checksum")
        .values({
            checksum,
            user_id: ctx.from.id.toString(),
        })
        .execute();
}

async function sendReceiptSuccess(ctx: ListyContext, itemList: string, discountAmount: number, totalSpending: number) {
    await ctx.reply(
        i18n.t("image_success", {
            list: itemList,
            discount: discountAmount,
            total: numberFormat(totalSpending),
        })
    );
}

async function checkUserBudget(ctx: ListyContext, overallSpending: number) {
    const [ user ] = await db
        .selectFrom("users")
        .select("limit")
        .where("telegram_id", "=", ctx.from.id.toString())
        .execute();

    if (user?.limit) {
        const remaining = user.limit - overallSpending;
        if (remaining < 0) {
            ctx.reply(
                i18n.t("overbudget", {
                    limit: user.limit,
                    total: overallSpending,
                })
            );
        } else if (remaining < 0.25 * user.limit) {
            ctx.reply(
                i18n.t("nearbudget", {
                    remaining,
                    limit: user.limit,
                })
            );
        }
    }
}
