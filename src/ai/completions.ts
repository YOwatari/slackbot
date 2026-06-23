import { runWithTools } from '@cloudflare/ai-utils'
import { Ai } from '@cloudflare/workers-types'
import { Tool } from './tools'

const MODEL = '@cf/meta/llama-4-scout-17b-16e-instruct'
const SYSTEM_PROMPT =
  'あなたはチャットボットです。短い返答が望ましいです。また、特に指示が無い場合は日本語で応答してください'
const MAX_TOKENS = 512

export type ChatMessage = {
  role: 'system' | 'user' | 'assistant' | 'tool'
  content: string
}

export class LlamaChat {
  constructor(private readonly ai: Ai) {}

  async completions(prompt: string): Promise<string> {
    return this.chat([{ role: 'user', content: prompt }])
  }

  async chat(messages: ChatMessage[]): Promise<string> {
    const result = await this.ai.run(MODEL, {
      messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
      max_tokens: MAX_TOKENS,
      temperature: 0.8,
    })
    return extractText(result)
  }

  async chatWithTools(messages: ChatMessage[], tools: Tool[]): Promise<string> {
    const result = await runWithTools(this.ai, MODEL, {
      messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
      tools,
    })
    return extractText(result)
  }
}

function extractText(result: unknown): string {
  if (typeof result === 'string') {
    return result.trim()
  }
  if (result && typeof result === 'object' && 'response' in result) {
    const response = (result as { response: unknown }).response
    if (typeof response === 'string') {
      return response.trim()
    }
  }
  throw new Error(`Unexpected Workers AI response shape: ${safeStringify(result)}`)
}

function safeStringify(value: unknown): string {
  try {
    return JSON.stringify(value).slice(0, 200)
  } catch {
    return String(value).slice(0, 200)
  }
}
