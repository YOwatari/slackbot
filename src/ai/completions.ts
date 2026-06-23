import { Ai } from '@cloudflare/workers-types'
import { Tool, ToolCall } from './tools'

const MODEL = '@cf/meta/llama-4-scout-17b-16e-instruct'
const SYSTEM_PROMPT =
  'あなたはチャットボットです。短い返答が望ましいです。また、特に指示が無い場合は日本語で応答してください'
const MAX_TOKENS = 512

export type ChatMessage = {
  role: 'user' | 'assistant' | 'tool'
  content: string
  tool_calls?: unknown[]
  tool_call_id?: string
  name?: string
}

export type ChatResult = {
  text: string
  toolCalls: ToolCall[]
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

  async chatWithTools(messages: ChatMessage[], tools: Tool[]): Promise<ChatResult> {
    const runner = this.ai as unknown as {
      run: (model: string, body: unknown) => Promise<unknown>
    }
    const result = await runner.run(MODEL, {
      messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
      tools,
      max_tokens: MAX_TOKENS,
      temperature: 0.8,
    })
    return extractChatResult(result)
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

function extractChatResult(result: unknown): ChatResult {
  if (typeof result === 'string') return { text: result.trim(), toolCalls: [] }
  if (!result || typeof result !== 'object') {
    throw new Error(`Unexpected Workers AI response shape: ${safeStringify(result)}`)
  }
  const r = result as { response?: unknown; tool_calls?: unknown }
  const text = typeof r.response === 'string' ? r.response.trim() : ''
  const toolCalls = Array.isArray(r.tool_calls)
    ? r.tool_calls.map(normalizeToolCall).filter((c): c is ToolCall => c !== null)
    : []
  return { text, toolCalls }
}

function normalizeToolCall(raw: unknown): ToolCall | null {
  if (!raw || typeof raw !== 'object') return null
  const obj = raw as { name?: unknown; arguments?: unknown }
  if (typeof obj.name !== 'string') return null
  let args: Record<string, unknown> = {}
  if (typeof obj.arguments === 'string') {
    try {
      args = JSON.parse(obj.arguments)
    } catch {
      args = {}
    }
  } else if (obj.arguments && typeof obj.arguments === 'object') {
    args = obj.arguments as Record<string, unknown>
  }
  return { name: obj.name, arguments: args }
}

function safeStringify(value: unknown): string {
  try {
    return JSON.stringify(value).slice(0, 200)
  } catch {
    return String(value).slice(0, 200)
  }
}
