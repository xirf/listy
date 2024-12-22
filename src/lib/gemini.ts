import type { ReceiptResult } from "../types";
import logger from "../utils/logger";

const {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
} = require("@google/generative-ai");
const { GoogleAIFileManager } = require("@google/generative-ai/server");

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);
const fileManager = new GoogleAIFileManager(apiKey);

/**
 * Uploads the given file to Gemini.
 *
 * See https://ai.google.dev/gemini-api/docs/prompting_with_media
 */
async function uploadToGemini(path: string, mimeType: string) {
    const uploadResult = await fileManager.uploadFile(path, {
        mimeType,
        displayName: path,
    });
    const file = uploadResult.file;
    console.log(`Uploaded file ${file.displayName} as: ${file.name}`);
    return file;
}

const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
});

const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
    responseMimeType: "application/json",
    responseSchema: {
        type: "object",
        properties: {
            isReceipt: {
                type: "boolean",
            },
            items: {
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        item: {
                            type: "string",
                        },
                        itemCount: {
                            type: "number",
                        },
                        price: {
                            type: "string",
                        },
                    },
                    required: [ "item", "itemCount", "price" ],
                },
            },
            discounts: {
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        description: {
                            type: "string",
                        },
                        amount: {
                            type: "string",
                        },
                    },
                    required: [ "description", "amount" ],
                },
            },
            totalPriceBeforeDiscount: {
                type: "string",
            },
            totalPriceAfterDiscount: {
                type: "string",
            },
            storeName: {
                type: "string",
            },
            transactionDate: {
                type: "string",
            },
            currency: {
                type: "string",
            },
        },
        required: [
            "isReceipt",
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
            resolve(JSON.parse(resultText));
        } catch (error: any) {
            logger.error({ error }, `Error while extracting receipt: ${error.message}`);
            reject(null);
        }
    });
}

export default extractReceipt;