import { describe, it, expect } from 'vitest'
import { resolveMark, resolveFirstMark, getMarkHref, registerMark } from '../src/marks'
import type { MirrorMark } from '../src/types'

function mark(type: string, attrs?: Record<string, unknown>): MirrorMark {
  return { type, attrs }
}

describe('resolveMark', () => {
  it('resolves built-in mark types', () => {
    expect(resolveMark(mark('strong'))?.tag).toBe('strong')
    expect(resolveMark(mark('emphasis'))?.tag).toBe('em')
    expect(resolveMark(mark('code'))?.tag).toBe('code')
    expect(resolveMark(mark('link'))?.tag).toBe('a')
    expect(resolveMark(mark('xref'))?.tag).toBe('a')
    expect(resolveMark(mark('footnote'))?.tag).toBe('sup')
    expect(resolveMark(mark('stem'))?.tag).toBe('span')
  })

  it('returns undefined for unknown marks', () => {
    expect(resolveMark(mark('unknown'))).toBeUndefined()
  })
})

describe('resolveFirstMark', () => {
  it('resolves the first known mark in a list', () => {
    const result = resolveFirstMark([mark('strong'), mark('emphasis')])
    expect(result?.renderer.tag).toBe('strong')
  })

  it('skips unknown marks', () => {
    const result = resolveFirstMark([mark('unknown'), mark('emphasis')])
    expect(result?.renderer.tag).toBe('em')
  })

  it('returns null for empty or undefined marks', () => {
    expect(resolveFirstMark([])).toBeNull()
    expect(resolveFirstMark(undefined)).toBeNull()
  })
})

describe('getMarkHref', () => {
  it('extracts href from link mark via target attr', () => {
    expect(getMarkHref(mark('link', { target: 'https://example.com' })))
      .toBe('https://example.com')
  })

  it('extracts href from link mark via href attr', () => {
    expect(getMarkHref(mark('link', { href: 'mailto:test@example.com' })))
      .toBe('mailto:test@example.com')
  })

  it('returns undefined for marks without href extraction', () => {
    expect(getMarkHref(mark('strong'))).toBeUndefined()
  })
})

describe('registerMark', () => {
  it('allows registering custom mark types', () => {
    registerMark('custom', { tag: 'custom-tag', classes: 'custom-class' })
    expect(resolveMark(mark('custom'))?.tag).toBe('custom-tag')
    expect(resolveMark(mark('custom'))?.classes).toBe('custom-class')
  })

  it('allows overriding existing marks', () => {
    registerMark('custom', { tag: 'updated-tag' })
    expect(resolveMark(mark('custom'))?.tag).toBe('updated-tag')
  })
})
