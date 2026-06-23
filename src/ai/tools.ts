export type Tool = {
  name: string
  description: string
  parameters: object
}

export type ToolCall = {
  name: string
  arguments: Record<string, unknown>
}

const NO_CANDIDATES = '候補がありません'

export function chooseRandom(items: string[]): string {
  if (items.length === 0) return NO_CANDIDATES
  return items[Math.floor(Math.random() * items.length)]
}

export const TOOLS: Tool[] = [
  {
    name: 'choose_random',
    description:
      'ユーザーが複数の選択肢から 1 つ選ぶよう求めたときに使う。選択肢をカンマ区切りで items に入れて渡すと、その中からランダムに 1 つ返す。',
    parameters: {
      type: 'object',
      properties: {
        items: {
          type: 'string',
          description: 'カンマ区切りの選択肢 (例: "カレー,ラーメン,うどん")',
        },
      },
      required: ['items'],
    },
  },
]

export function executeTool(call: ToolCall): string {
  switch (call.name) {
    case 'choose_random': {
      const raw = call.arguments.items
      const items = parseCsvItems(raw)
      return chooseRandom(items)
    }
    default:
      return `unknown tool: ${call.name}`
  }
}

function parseCsvItems(raw: unknown): string[] {
  if (typeof raw === 'string') {
    return raw
      .split(/[,、]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
  }
  if (Array.isArray(raw)) {
    return raw.map((v) => String(v).trim()).filter((s) => s.length > 0)
  }
  return []
}
