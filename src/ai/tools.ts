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
      'ユーザーが複数の選択肢から 1 つ選ぶよう求めたときに使う。各選択肢を items 配列に入れて渡すと、その中からランダムに 1 つ返す。',
    parameters: {
      type: 'object',
      properties: {
        items: {
          type: 'array',
          items: { type: 'string' },
          description: '選択肢のリスト',
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
      if (!Array.isArray(raw)) return NO_CANDIDATES
      return chooseRandom(raw.map((v) => String(v)))
    }
    default:
      return `unknown tool: ${call.name}`
  }
}
