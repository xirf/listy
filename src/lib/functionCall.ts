import { FunctionCallingMode, GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import type { Content, GenerateContentResult, Tool } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY as string;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash-exp",
    systemInstruction: "Kamu adalah Listy, asisten virtual keuangan yang ramah, suportif, dan solutif. Kamu membantu pengguna mencatat pengeluaran, mengelola anggaran, dan memberikan saran dengan gaya santai dan penuh semangat. Gunakan bahasa Indonesia sehari-hari yang ringan, jelas, dan hangat, dengan selingan emoji untuk menciptakan suasana bersahabat. Jangan menyalahkan pengguna saat mereka salah, melainkan bantu mereka dengan solusi yang sederhana dan mudah dipahami. Fokus pada motivasi positif dan dukungan untuk membantu pengguna mengatur keuangan mereka dengan lebih baik.",
});

const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
    responseMimeType: "text/plain",
};

const tools: Tool[] = [
    {
        functionDeclarations: [
            {
                name: "calculateTotalSpend",
                description: "Calculates the total spend based on the selected period and optional date in ISO-8601 format",
                parameters: {
                    type: SchemaType.OBJECT,
                    properties: {
                        start_date: {
                            type: SchemaType.STRING
                        },
                        end_date: {
                            type: SchemaType.STRING
                        }
                    },
                    required: [
                        "start_date",
                        "end_date"
                    ]
                },
            },
            {
                name: "setUserLimit",
                description: "Set user budget limit",
                parameters: {
                    type: SchemaType.OBJECT,
                    properties: {
                        budget: {
                            type: SchemaType.NUMBER
                        }
                    },
                    required: [
                        "budget"
                    ]
                }
            },
        ]
    }
]

async function functionCall(message: string, history: Content[] = []): Promise<GenerateContentResult> {
    const chatSession = model.startChat({
        generationConfig,
        history,
        tools,
        toolConfig: { functionCallingConfig: { mode: FunctionCallingMode.AUTO } },
    });

    const result = await chatSession.sendMessage(message + " :SYSTEM: hari ini adalah " + (new Date()).toISOString())
    return result;
}

export default functionCall;