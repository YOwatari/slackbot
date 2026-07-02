import { Ai } from '@cloudflare/workers-types'
import { Tool } from './tools'

const MODEL = '@cf/meta/llama-4-scout-17b-16e-instruct'
const SYSTEM_PROMPT = [
  'あなたはチャットボットです。短い返答が望ましいです。特に指示が無い場合は日本語で応答してください。',
  '',
  '利用可能なツールがあれば必ず積極的に使ってください。とくに以下を厳守してください:',
  '- ユーザーが「画像」「絵」「写真」を求めたら、必ず search_image ツールを呼ぶこと。架空の結果 (例: 「画像見つかりました」だけ返す) は絶対にしてはいけません。',
  '- ユーザーが選択肢の中から 1 つ選ぶよう求めたら、必ず pick_one ツールを呼ぶこと。ただし「シャッフル」「順番を決めて」「並び替え」のような複数件の順序付け依頼にはこの tool は使えないので、tool を呼ばずに自然文で応答すること。',
  '- tool を呼ぶときは必ず構造化された tool_call として呼び、JSON をメッセージ本文に書かないこと。',
].join('\n')
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
    // Workers AI's Llama 4 Scout requires tools wrapped as
    // { type: 'function', function: { name, description, parameters } }
    // and returns tool_calls in the same wrapped shape — neither shape is
    // handled by @cloudflare/ai-utils' runWithTools, so we drive the loop
    // ourselves.
    const wrappedTools = tools.map((t) => ({
      type: 'function' as const,
      function: { name: t.name, description: t.description, parameters: t.parameters },
    }))
    const runner = this.ai as unknown as {
      run: (model: string, body: unknown) => Promise<unknown>
    }
    const raw = await runner.run(MODEL, {
      messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
      tools: wrappedTools,
      max_tokens: MAX_TOKENS,
      temperature: 0.8,
    })
    const result = raw as { response?: unknown; tool_calls?: unknown }
    let toolCalls = parseToolCalls(result.tool_calls)
    if (toolCalls.length === 0) {
      // Workers AI x Llama-4-Scout sometimes emits the tool_call as a JSON
      // literal in `response` instead of populating `tool_calls`. Parse it
      // out so the tool actually fires instead of leaking raw JSON to Slack.
      toolCalls = parseToolCallsFromResponseText(result.response)
    }
    if (toolCalls.length === 0) return extractText(raw)

    // A tool was invoked — return the tool's own output verbatim and skip the
    // follow-up "AI commentary" turn. Tools that already posted to Slack as a
    // side effect (e.g. search_image) return an empty string so the caller
    // posts nothing additional.
    const outputs: string[] = []
    for (const call of toolCalls) {
      const tool = tools.find((t) => t.name === call.name)
      const fn = tool?.function
      const out = fn ? await fn(call.arguments) : `unknown tool: ${call.name}`
      if (out) outputs.push(out)
    }
    return outputs.join('\n')
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

type ParsedToolCall = { id?: string; name: string; arguments: Record<string, unknown> }

// Workers AI's Llama 4 Scout returns tool_calls in OpenAI's wrapped shape:
//   { id, type: 'function', function: { name, arguments } }
// where arguments is sometimes a JSON-encoded string. Accept the flat shape
// too (in case Hermes or any future model returns it directly).
function parseToolCalls(raw: unknown): ParsedToolCall[] {
  if (!Array.isArray(raw)) return []
  return raw.flatMap((entry): ParsedToolCall[] => {
    if (!entry || typeof entry !== 'object') return []
    const e = entry as { id?: unknown; function?: unknown; name?: unknown; arguments?: unknown }
    const fn = (e.function && typeof e.function === 'object' ? e.function : e) as {
      name?: unknown
      arguments?: unknown
    }
    if (typeof fn.name !== 'string') return []
    let args: Record<string, unknown> = {}
    if (typeof fn.arguments === 'string') {
      try {
        args = JSON.parse(fn.arguments)
      } catch {
        args = {}
      }
    } else if (fn.arguments && typeof fn.arguments === 'object') {
      args = fn.arguments as Record<string, unknown>
    }
    return [{ id: typeof e.id === 'string' ? e.id : undefined, name: fn.name, arguments: args }]
  })
}

function parseToolCallsFromResponseText(response: unknown): ParsedToolCall[] {
  if (typeof response !== 'string') return []
  const trimmed = response.trim()
  if (!trimmed.startsWith('{')) return []
  let parsed: unknown
  try {
    parsed = JSON.parse(trimmed)
  } catch {
    return []
  }
  if (!parsed || typeof parsed !== 'object') return []
  const obj = parsed as { name?: unknown; parameters?: unknown; arguments?: unknown }
  if (typeof obj.name !== 'string') return []
  const argsRaw = obj.parameters ?? obj.arguments
  const args =
    argsRaw && typeof argsRaw === 'object' && !Array.isArray(argsRaw) ? (argsRaw as Record<string, unknown>) : {}
  return [{ name: obj.name, arguments: args }]
}
