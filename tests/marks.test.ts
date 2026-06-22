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

  it('carries semantic class names for styled marks', () => {
    expect(resolveMark(mark('footnote'))?.classes).toBe('mirror-footnote')
    expect(resolveMark(mark('stem'))?.classes).toBe('mirror-stem')
    expect(resolveMark(mark('concept'))?.classes).toBe('mirror-concept')
    expect(resolveMark(mark('bcp14'))?.classes).toBe('mirror-bcp14')
    expect(resolveMark(mark('eref'))?.classes).toBe('mirror-eref')
    expect(resolveMark(mark('smallcap'))?.classes).toBe('mirror-smallcap')
  })

  it('leaves formatting marks without a class name', () => {
    expect(resolveMark(mark('strong'))?.classes).toBeUndefined()
    expect(resolveMark(mark('emphasis'))?.classes).toBeUndefined()
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

  it('prefers higher-priority marks regardless of list order', () => {
    const result = resolveFirstMark([mark('strong'), mark('link', { target: 'x' })])
    expect(result?.renderer.tag).toBe('a')
  })

  it('keeps the first mark when priorities tie', () => {
    const result = resolveFirstMark([mark('strong'), mark('emphasis')])
    expect(result?.renderer.tag).toBe('strong')
    const reversed = resolveFirstMark([mark('emphasis'), mark('strong')])
    expect(reversed?.renderer.tag).toBe('em')
  })

  it('prefers a footnote over a formatting mark', () => {
    const result = resolveFirstMark([mark('strong'), mark('footnote')])
    expect(result?.renderer.tag).toBe('sup')
    expect(result?.renderer.classes).toBe('mirror-footnote')
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
