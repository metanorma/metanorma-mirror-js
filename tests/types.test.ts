import { describe, it, expect } from 'vitest'
import {
  MARK_TYPES,
  STRUCTURAL_TYPES,
  SECTION_TYPES,
  BLOCK_TYPES,
  LIST_TYPES,
  TABLE_TYPES,
  MEDIA_TYPES,
} from '../src/types'

describe('MARK_TYPES', () => {
  it('includes all 16 mark types', () => {
    const expected = [
      'emphasis', 'strong', 'subscript', 'superscript', 'code',
      'underline', 'strike', 'smallcap', 'link', 'xref', 'eref',
      'footnote', 'stem', 'concept', 'bcp14', 'span',
    ]
    for (const t of expected) {
      expect(MARK_TYPES).toContain(t)
    }
  })
})

describe('type categories are disjoint', () => {
  it('structural, section, block, list, table types have no overlap', () => {
    const all = [...STRUCTURAL_TYPES, ...SECTION_TYPES, ...BLOCK_TYPES, ...LIST_TYPES, ...TABLE_TYPES]
    const unique = new Set(all)
    expect(unique.size).toBe(all.length)
  })
})

describe('SECTION_TYPES', () => {
  it('includes clause, annex, terms, definitions, references', () => {
    expect(SECTION_TYPES).toContain('clause')
    expect(SECTION_TYPES).toContain('annex')
    expect(SECTION_TYPES).toContain('terms')
    expect(SECTION_TYPES).toContain('definitions')
    expect(SECTION_TYPES).toContain('references')
  })
})

describe('BLOCK_TYPES', () => {
  it('includes paragraph, note, admonition', () => {
    expect(BLOCK_TYPES).toContain('paragraph')
    expect(BLOCK_TYPES).toContain('note')
    expect(BLOCK_TYPES).toContain('admonition')
  })
})

describe('TABLE_TYPES vs BLOCK_TYPES', () => {
  it('table is in TABLE_TYPES not BLOCK_TYPES', () => {
    expect(TABLE_TYPES).toContain('table')
    expect(BLOCK_TYPES).not.toContain('table')
  })
})

describe('MEDIA_TYPES', () => {
  it('figure is in MEDIA_TYPES not BLOCK_TYPES', () => {
    expect(MEDIA_TYPES).toContain('figure')
    expect(BLOCK_TYPES).not.toContain('figure')
  })
})
