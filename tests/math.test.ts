import { describe, it, expect, vi } from 'vitest'
import { extractFormulaAttrs, renderFormula } from '../src/math'
import type { MirrorNode } from '../src/types'

function formulaNode(attrs: Record<string, unknown>): MirrorNode {
  return { type: 'formula', attrs }
}

describe('extractFormulaAttrs', () => {
  it('extracts mathml, asciimath, and number from formula node', () => {
    const node = formulaNode({
      mathml: '<math><mi>x</mi></math>',
      asciimath: 'x',
      number: '1',
    })
    const result = extractFormulaAttrs(node)
    expect(result).toEqual({
      mathml: '<math><mi>x</mi></math>',
      asciimath: 'x',
      number: '1',
    })
  })

  it('falls back to math_text for asciimath', () => {
    const node = formulaNode({ math_text: 'E = mc^2' })
    const result = extractFormulaAttrs(node)
    expect(result.asciimath).toBe('E = mc^2')
    expect(result.mathml).toBeNull()
  })

  it('handles node with no attrs', () => {
    const node: MirrorNode = { type: 'formula' }
    const result = extractFormulaAttrs(node)
    expect(result).toEqual({ mathml: null, asciimath: null, number: null })
  })

  it('returns null fields for non-formula nodes', () => {
    const node: MirrorNode = { type: 'paragraph', content: [] }
    const result = extractFormulaAttrs(node)
    expect(result).toEqual({ mathml: null, asciimath: null, number: null })
  })

  it('coerces empty mathml string to null', () => {
    const node = formulaNode({ mathml: '' })
    const result = extractFormulaAttrs(node)
    expect(result.mathml).toBeNull()
  })
})

vi.mock('@plurimath/plurimath', () => ({
  default: class MockPlurimath {
    constructor(private input: string, private _fmt: string) {}
    toMathml(): string {
      return `<math data-source="${this.input}"><mi>x</mi></math>`
    }
  },
}))

describe('renderFormula', () => {
  it('returns mathml directly when available', async () => {
    const node = formulaNode({
      mathml: '<math><mi>x</mi></math>',
      asciimath: 'x',
    })
    const result = await renderFormula(node)
    expect(result).toBe('<math><mi>x</mi></math>')
  })

  it('converts asciimath to MathML via plurimath', async () => {
    const node = formulaNode({ asciimath: 'a^2 + b^2 = c^2' })
    const result = await renderFormula(node)
    expect(result).toMatch(/<math[\s>]/)
    expect(result).toContain('data-source="a^2 + b^2 = c^2"')
  })

  it('returns empty string when no math content', async () => {
    const node: MirrorNode = { type: 'formula' }
    const result = await renderFormula(node)
    expect(result).toBe('')
  })

  it('falls back to raw asciimath when plurimath throws', async () => {
    vi.doMock('@plurimath/plurimath', () => ({
      default: class {
        constructor(_input: string, _fmt: string) {
          throw new Error('plurimath unavailable')
        }
      },
    }))
    vi.resetModules()
    const { renderFormula: fallbackRender } = await import('../src/math')
    const node = formulaNode({ asciimath: 'a^2' })
    const result = await fallbackRender(node)
    expect(result).toBe('a^2')
    vi.doUnmock('@plurimath/plurimath')
    vi.resetModules()
  })
})
