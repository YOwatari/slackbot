import { chooseRandom, TOOLS } from '../tools'

describe('chooseRandom', () => {
  it('returns the only item when the list has length 1', () => {
    expect(chooseRandom(['only'])).toBe('only')
  })

  it('returns one of the supplied items', () => {
    const items = ['a', 'b', 'c']
    expect(items).toContain(chooseRandom(items))
  })

  it('returns a fallback message for an empty list', () => {
    expect(chooseRandom([])).toMatch(/候補/)
  })
})

describe('pick_one tool', () => {
  const tool = TOOLS.find((t) => t.name === 'pick_one')!
  const callFn = (args: unknown) => tool.function!(args as { items?: unknown })

  it('splits a CSV string and returns one item', async () => {
    const result = await callFn({ items: 'カレー,ラーメン,うどん' })
    expect(['カレー', 'ラーメン', 'うどん']).toContain(result)
  })

  it('also accepts Japanese full-width comma', async () => {
    const result = await callFn({ items: 'a、b、c' })
    expect(['a', 'b', 'c']).toContain(result)
  })

  it('falls back to a string array if items is sent as an array', async () => {
    const result = await callFn({ items: ['x', 'y'] })
    expect(['x', 'y']).toContain(result)
  })

  it('returns the no-candidates fallback when items is missing', async () => {
    const result = await callFn({})
    expect(result).toMatch(/候補/)
  })
})

describe('TOOLS', () => {
  it('exposes pick_one with a flat string parameter (Workers AI flat schema)', () => {
    const t = TOOLS.find((tool) => tool.name === 'pick_one')
    expect(t).toBeDefined()
    expect(t?.parameters).toMatchObject({
      type: 'object',
      properties: { items: { type: 'string' } },
      required: ['items'],
    })
  })

  it('no longer registers the legacy choose_random name', () => {
    const t = TOOLS.find((tool) => tool.name === 'choose_random')
    expect(t).toBeUndefined()
  })

  it('description narrows pick_one to picking exactly one item and rejects shuffle-style requests', () => {
    const t = TOOLS.find((tool) => tool.name === 'pick_one')!
    expect(t.description).toMatch(/1\s*つ|一\s*つ|1件/)
    expect(t.description).toMatch(/シャッフル|順番|並び/)
  })

  it('attaches a callable function to each tool', () => {
    for (const tool of TOOLS) {
      expect(typeof tool.function).toBe('function')
    }
  })
})
