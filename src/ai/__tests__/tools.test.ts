import { chooseRandom, executeTool, TOOLS } from '../tools'

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

describe('executeTool', () => {
  it('dispatches choose_random to chooseRandom', () => {
    expect(executeTool({ name: 'choose_random', arguments: { items: ['x'] } })).toBe('x')
  })

  it('coerces non-string items via String()', () => {
    const result = executeTool({ name: 'choose_random', arguments: { items: [1, 'two'] } })
    expect(['1', 'two']).toContain(result)
  })

  it('returns a fallback when items is missing', () => {
    expect(executeTool({ name: 'choose_random', arguments: {} })).toMatch(/候補/)
  })

  it('returns an error string for unknown tools', () => {
    expect(executeTool({ name: 'wat', arguments: {} })).toMatch(/unknown/)
  })
})

describe('TOOLS', () => {
  it('exposes choose_random with an items array parameter', () => {
    const t = TOOLS.find((tool) => tool.name === 'choose_random')
    expect(t).toBeDefined()
    expect(t?.parameters).toMatchObject({
      type: 'object',
      properties: { items: { type: 'array' } },
      required: ['items'],
    })
  })
})
