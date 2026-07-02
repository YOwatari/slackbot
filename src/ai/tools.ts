import type { AiTextGenerationToolInputWithFunction } from '@cloudflare/ai-utils'

export type Tool = AiTextGenerationToolInputWithFunction

const NO_CANDIDATES = '候補がありません'

export function chooseRandom(items: string[]): string {
  if (items.length === 0) return NO_CANDIDATES
  return items[Math.floor(Math.random() * items.length)]
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

export const TOOLS: Tool[] = [
  {
    name: 'pick_one',
    description: [
      '選択肢の中から 1 つだけをランダムに選んで返す tool。',
      '用途: 「A か B か選んで」「どっちにする？」「どれか決めて」のような 1 件抽選の依頼のみ。',
      '用途外: 「シャッフル」「順番を決めて」「並び替え」のような複数件の順序付け依頼にはこの tool を呼んではいけない。対応不可なので tool を呼ばず自然文で返す。',
      '引数 items にはカンマ区切り (半角 , または全角 、) の選択肢文字列を渡す (例: "カレー,ラーメン,うどん")。',
    ].join('\n'),
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
    function: async (args: { items?: unknown }) => {
      return chooseRandom(parseCsvItems(args?.items))
    },
  },
]
