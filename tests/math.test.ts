import { describe, it, expect } from 'vitest'
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

describe('renderFormula', () => {
  it('returns mathml directly when available', async () => {
    const node = formulaNode({
      mathml: '<math><mi>x</mi></math>',
      asciimath: 'x',
    })
    const result = await renderFormula(node)
    expect(result).toBe('<math><mi>x</mi></math>')
  })

  it('returns asciimath string when plurimath is unavailable', async () => {
    const node = formulaNode({ asciimath: 'n <= n_{"LC"}' })
    const result = await renderFormula(node)
    // Either MathML (if plurimath loaded) or raw asciimath fallback
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
  })

  it('returns empty string when no math content', async () => {
    const node: MirrorNode = { type: 'formula' }
    const result = await renderFormula(node)
    expect(result).toBe('')
  })
})
