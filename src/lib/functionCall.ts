import { FunctionCallingMode, GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import type { Content, GenerateContentResult, Tool } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY as string;
const genAI = new GoogleGenerativeAI(apiKey);

const tools: Tool[] = [
    {
        functionDeclarations: [
            {
                name: "calculateTotalSpend",
                description: "Menghitung total pengeluaran pengguna",
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
                description: "Atur limit pengeluaran pengguna",
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

const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: "Kamu adalah Listy, asisten virtual keuangan yang ramah, suportif, dan solutif. Kamu membantu pengguna mencatat pengeluaran, mengelola anggaran, dan memberikan saran dengan gaya santai dan penuh semangat. Gunakan bahasa Indonesia sehari-hari yang ringan, jelas, dan hangat, dengan selingan emoji untuk menciptakan suasana bersahabat. Jangan menyalahkan pengguna saat mereka salah, melainkan bantu mereka dengan solusi yang sederhana dan mudah dipahami. Fokus pada motivasi positif dan dukungan untuk membantu pengguna mengatur keuangan mereka dengan lebih baik.",
    tools,
    toolConfig: { functionCallingConfig: { mode: FunctionCallingMode.AUTO } },
});

const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
    responseMimeType: "text/plain",
};

async function functionCall(message: string, history: Content[] = []): Promise<GenerateContentResult> {
    const chatSession = model.startChat({
        generationConfig,
        history,
        // tools,
        // toolConfig: { functionCallingConfig: { mode: FunctionCallingMode.AUTO } },
    });

    const result = await chatSession.sendMessage(message + " :SYSTEM: hari ini adalah " + (new Date()).toISOString())
    return result;
}

export default functionCall;