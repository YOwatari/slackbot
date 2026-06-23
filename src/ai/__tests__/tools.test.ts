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
  it('dispatches choose_random with a CSV string', () => {
    expect(executeTool({ name: 'choose_random', arguments: { items: 'only' } })).toBe('only')
  })

  it('splits the CSV string and trims whitespace', () => {
    const result = executeTool({
      name: 'choose_random',
      arguments: { items: ' カレー , ラーメン , うどん ' },
    })
    expect(['カレー', 'ラーメン', 'うどん']).toContain(result)
  })

  it('also accepts a Japanese full-width comma', () => {
    const result = executeTool({
      name: 'choose_random',
      arguments: { items: 'a、b、c' },
    })
    expect(['a', 'b', 'c']).toContain(result)
  })

  it('falls back to a string array if the model sent an array anyway', () => {
    const result = executeTool({
      name: 'choose_random',
      arguments: { items: ['x', 'y'] },
    })
    expect(['x', 'y']).toContain(result)
  })

  it('returns a fallback when items is missing', () => {
    expect(executeTool({ name: 'choose_random', arguments: {} })).toMatch(/候補/)
  })

  it('returns an error string for unknown tools', () => {
    expect(executeTool({ name: 'wat', arguments: {} })).toMatch(/unknown/)
  })
})

describe('TOOLS', () => {
  it('exposes choose_random with a string items parameter (Workers AI schema only allows flat types)', () => {
    const t = TOOLS.find((tool) => tool.name === 'choose_random')
    expect(t).toBeDefined()
    expect(t?.parameters).toMatchObject({
      type: 'object',
      properties: { items: { type: 'string' } },
      required: ['items'],
    })
  })
})
