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

describe('choose_random tool', () => {
  const tool = TOOLS.find((t) => t.name === 'choose_random')!
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
  it('exposes choose_random with a flat string parameter (Workers AI flat schema)', () => {
    const t = TOOLS.find((tool) => tool.name === 'choose_random')
    expect(t).toBeDefined()
    expect(t?.parameters).toMatchObject({
      type: 'object',
      properties: { items: { type: 'string' } },
      required: ['items'],
    })
  })

  it('attaches a callable function to each tool (runWithTools requires it)', () => {
    for (const tool of TOOLS) {
      expect(typeof tool.function).toBe('function')
    }
  })
})
