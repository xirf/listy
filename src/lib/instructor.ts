import Instructor from '@instructor-ai/instructor'
import OpenAI from 'openai'
import type { ChatCompletionMessageParam } from 'openai/resources/index.mjs'
import { calculateTotalSpending } from '../functions/calculateTotalSpend'

const openaiclient = new OpenAI({
    baseURL: "https://models.inference.ai.azure.com",
    apiKey: process.env.GITHUB_TOKEN
})

const client = Instructor({
    client: openaiclient,
    mode: 'TOOLS'
})


const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
    calculateTotalSpending
]


export async function getAiResponse(prompt: string, history: ChatCompletionMessageParam[] = []) {
    const response = await client.chat.completions.create({
        
        messages: [
            {
                role: 'system',
                content: 'You are Listy, a friendly, supportive and solution-oriented finance virtual assistant. You help users record expenses, manage budgets, and give advice in a relaxed and passionate style. Use colloquial Indonesian that is light, clear and warm. Focus on positive motivation and support to help users better manage their finances.'
            },
            ...history,
            {
                role: 'user',
                content: `${prompt}`
            }
        ],
        model: 'gpt-3.5-turbo',
        max_tokens: 1000,
        temperature: 1.0,
        top_p: 1.0,
        tools,
    })

    console.log(response.choices[0].message.content)
    console.log(response.choices[ 0 ].message.tool_calls)
    console.log(response.choices[ 0 ].message.refusal)
    return response.choices[0].message
}