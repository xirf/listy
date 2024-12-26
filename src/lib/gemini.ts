import type { ReceiptResult } from "../types";
import logger from "../utils/logger";

import { GoogleGenerativeAI, SchemaType, type GenerationConfig, } from "@google/generative-ai";
import { GoogleAIFileManager } from "@google/generative-ai/server";

const apiKey = process.env.GEMINI_API_KEY as string;
const genAI = new GoogleGenerativeAI(apiKey);
const fileManager = new GoogleAIFileManager(apiKey);

async function uploadToGemini(path: string, mimeType: string) {
    const uploadResult = await fileManager.uploadFile(path, {
        mimeType,
        displayName: path,
    });
    const file = uploadResult.file;
    logger.info(`Uploaded file to Gemini: ${file.uri}`);
    return file;
}

const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: "If no currency is provided, the system will assume the currency is IDR. If no store name is provided, the system will assume the store name is 'Unknown'. If no transaction date is provided, the system will assume the transaction date is the current date. If no items are provided, the system will assume there are no items. If no discounts are provided, the system will assume there are no discounts. all above assumptions are valid if image is a receipt or invoice.",
});

const generationConfig: GenerationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
    responseMimeType: "application/json",
    responseSchema: {
        type: SchemaType.OBJECT,
        properties: {
            isReceipt: {
                type: SchemaType.BOOLEAN,
            },
            items: {
                type: SchemaType.ARRAY,
                items: {
                    type: SchemaType.OBJECT,
                    properties: {
                        item: {
                            type: SchemaType.STRING,
                        },
                        itemCount: {
                            type: SchemaType.NUMBER,
                        },
                        price: {
                            type: SchemaType.STRING,
                        },
                    },
                    required: [ "item", "itemCount", "price" ],
                },
            },
            discounts: {
                type: SchemaType.ARRAY,
                items: {
                    type: SchemaType.OBJECT,
                    properties: {
                        description: {
                            type: SchemaType.STRING,
                        },
                        amount: {
                            type: SchemaType.NUMBER,
                        },
                    },
                    required: [ "description", "amount" ],
                },
            },
            totalPriceBeforeDiscount: {
                type: SchemaType.NUMBER
            },
            totalPriceAfterDiscount: {
                type: SchemaType.NUMBER
            },
            storeName: {
                type: SchemaType.STRING,
            },
            transactionDate: {
                type: SchemaType.OBJECT,
                properties: {
                    day: {
                        type: SchemaType.NUMBER,
                    },
                    month: {
                        type: SchemaType.NUMBER,
                    },
                    year: {
                        type: SchemaType.NUMBER,
                    },
                },
            },
            currency: {
                type: SchemaType.STRING,
            },
        },
        required: [
            "isReceipt",
            "transactionDate",
        ],
    },
};

async function extractReceipt(file: string, mimeType: string): Promise<ReceiptResult | null> {
    return new Promise(async (resolve, reject) => {
        try {
            const files = await uploadToGemini(file, mimeType)

            const chatSession = model.startChat({
                generationConfig,
                history: [
                    {
                        role: "user",
                        parts: [
                            {
                                fileData: {
                                    mimeType: files.mimeType,
                                    fileUri: files.uri,
                                },
                            },
                        ],
                    },
                ],
            });

            const result = await chatSession.sendMessage("");
            const resultText = await result.response.text();

            console.log(resultText);

            resolve(JSON.parse(resultText));
        } catch (error: any) {
            logger.error({ error }, `Error while extracting receipt: ${error.message}`);
            reject(null);
        }
    });
}

export default extractReceipt;