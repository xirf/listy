import { GoogleGenerativeAI, HarmBlockThreshold } from "@google/generative-ai";
import { GoogleAIFileManager } from "@google/generative-ai/server";
import fs from "fs";
import path from "path";

class GeminiImageProcessor {
    private genAI: GoogleGenerativeAI;
    private fileManager: GoogleAIFileManager;
    private model: any;
    private generationConfig: any;


    constructor(apiKey: string) {
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.fileManager = new GoogleAIFileManager(apiKey);
        this.model = this.genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            systemInstruction: "Analyze the provided image and extract the following details:\n    1. List of purchased items with:\n       - Name (string)\n       - Quantity (integer)\n       - Price (string, formatted as currency)\n    2. Discounts, if any (array of objects with 'description' and 'amount').\n    3. Total price before discount (string, formatted as currency).\n    4. Total price after discount (string, formatted as currency).\n    5. Store name (string).\n    6. Date and time of transaction (ISO 8601 format).\n    7. Currency\nIf the input image is not a receipt or the required details cannot be extracted, respond with :null",
        });
        this.generationConfig = {
            temperature: 1,
            topP: 0.95,
            topK: 40,
            maxOutputTokens: 8192,
            responseMimeType: "application/json",
            responseSchema: {
                type: "object",
                properties: {
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
                    "items",
                    "totalPriceBeforeDiscount",
                    "totalPriceAfterDiscount",
                    "storeName",
                    "transactionDate",
                    "currency",
                ],
            },
        };
    }

    async uploadImage(imagePath: string) {
        if (!fs.existsSync(imagePath)) {
            throw new Error("File does not exist: " + imagePath);
        }
        const mimeType = this.getMimeType(imagePath);
        const uploadResult = await this.fileManager.uploadFile(imagePath, {
            mimeType,
            displayName: path.basename(imagePath),
        });
        const file = uploadResult.file;
        console.log(`Uploaded file ${file.displayName} as: ${file.name}`);
        return file;
    }

    getMimeType(filePath: string): string {
        const ext = path.extname(filePath).toLowerCase();
        const mimeTypes: Record<string, string> = {
            ".png": "image/png",
            ".jpg": "image/jpeg",
            ".jpeg": "image/jpeg",
        };
        return mimeTypes[ ext ] || "application/octet-stream";
    }

    async processImage(imagePath: string): Promise<any> {
        const file = await this.uploadImage(imagePath);

        const chatSession = this.model.startChat({
            generationConfig: this.generationConfig,
            history: [
                {
                    role: "user",
                    parts: [
                        {
                            fileData: {
                                mimeType: file.mimeType,
                                fileUri: file.uri,
                            },
                        },
                    ],
                },
            ],
        });

        const result = await chatSession.sendMessage("");
        return result.response.json();
    }
}
