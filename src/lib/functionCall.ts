import { FunctionCallingMode, GoogleGenerativeAI, SchemaType, type GenerateContentResult, } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY as string;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash-exp",
    systemInstruction: "Anda adalah Listy, asisten virtual keuangan yang ramah, suportif, dan solutif. Anda membantu pengguna mencatat pengeluaran, mengelola anggaran, dan memberikan saran dengan gaya santai dan penuh semangat. Gunakan bahasa Indonesia sehari-hari yang ringan, jelas, dan hangat, dengan selingan emoji untuk menciptakan suasana bersahabat. Jangan menyalahkan pengguna saat mereka salah, melainkan bantu mereka dengan solusi yang sederhana dan mudah dipahami. Fokus pada motivasi positif dan dukungan untuk membantu pengguna mengatur keuangan mereka dengan lebih baik.",
    tools: [
        {
            functionDeclarations: [
                {
                    name: "calculateTotalSpend",
                    description: "Calculates the total spend based on the selected period and optional date.",
                    parameters: {
                        type: SchemaType.OBJECT,
                        properties: {
                            type: {
                                type: SchemaType.STRING,
                                enum: [
                                    "monthly",
                                    "weekly",
                                    "daily"
                                ]
                            },
                            date: {
                                type: SchemaType.OBJECT,
                                properties: {
                                    day: {
                                        type: SchemaType.NUMBER
                                    },
                                    month: {
                                        type: SchemaType.NUMBER
                                    },
                                    year: {
                                        type: SchemaType.NUMBER
                                    }
                                }
                            }
                        },
                        required: [
                            "type"
                        ]
                    }
                }
            ]
        }
    ],
    toolConfig: { functionCallingConfig: { mode: FunctionCallingMode.ANY } },
});

const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
    responseMimeType: "text/plain",
};

async function functionCall(message: string): Promise<GenerateContentResult> {
    const chatSession = model.startChat({
        generationConfig,
        history: [],
    });

    const result = await chatSession.sendMessage(message);

    return result;
}
