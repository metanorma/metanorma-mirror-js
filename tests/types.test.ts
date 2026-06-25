import { describe, it, expect, expectTypeOf } from 'vitest'
import {
  MARK_TYPES,
  STRUCTURAL_TYPES,
  SECTION_TYPES,
  BLOCK_TYPES,
  LIST_TYPES,
  TABLE_TYPES,
  MEDIA_TYPES,
  FOOTNOTE_TYPES,
  LEAF_TYPES,
  isMarkType,
  isStructuralType,
  isSectionType,
  isBlockType,
  isListType,
  isTableType,
  isMediaType,
  isFootnoteType,
  isLeafType,
  isTextNode,
  hasType,
  type MirrorNode,
  type ClauseNode,
  type FormulaNode,
  type FormulaAttrs,
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
  it('every node type appears in exactly one category array', () => {
    const all = [
      ...STRUCTURAL_TYPES,
      ...SECTION_TYPES,
      ...BLOCK_TYPES,
      ...LIST_TYPES,
      ...TABLE_TYPES,
      ...MEDIA_TYPES,
      ...FOOTNOTE_TYPES,
      ...LEAF_TYPES,
    ]
    const unique = new Set(all)
    expect(unique.size).toBe(all.length)
  })

  it('MARK_TYPES shares no type with any node category', () => {
    const nodeTypes = new Set<string>([
      ...STRUCTURAL_TYPES, ...SECTION_TYPES, ...BLOCK_TYPES,
      ...LIST_TYPES, ...TABLE_TYPES, ...MEDIA_TYPES,
      ...FOOTNOTE_TYPES, ...LEAF_TYPES,
    ])
    for (const mark of MARK_TYPES) {
      expect(nodeTypes.has(mark)).toBe(false)
    }
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

describe('all type categories have disjoint predicates', () => {
  it.each([
    ['clause', isSectionType],
    ['annex', isSectionType],
    ['doc', isStructuralType],
    ['preface', isStructuralType],
    ['paragraph', isBlockType],
    ['bullet_list', isListType],
    ['table', isTableType],
    ['figure', isMediaType],
    ['footnotes', isFootnoteType],
    ['text', isLeafType],
  ] as const)('identifies %s via its category predicate', (type, predicate) => {
    expect(predicate(type)).toBe(true)
  })

  it('a section type does not satisfy other category predicates', () => {
    expect(isSectionType('clause')).toBe(true)
    expect(isBlockType('clause')).toBe(false)
    expect(isStructuralType('clause')).toBe(false)
  })

  it('unknown types satisfy no category predicate', () => {
    const unknown = 'no_such_type'
    for (const predicate of [isMarkType, isStructuralType, isSectionType, isBlockType, isListType, isTableType, isMediaType, isFootnoteType, isLeafType]) {
      expect(predicate(unknown)).toBe(false)
    }
  })

  it('mark types are distinguishable from node types', () => {
    expect(isMarkType('emphasis')).toBe(true)
    expect(isMarkType('clause')).toBe(false)
    expect(isSectionType('emphasis')).toBe(false)
  })
})

describe('isTextNode', () => {
  it('returns true for a text node', () => {
    const node: MirrorNode = { type: 'text', text: 'hi' }
    expect(isTextNode(node)).toBe(true)
  })

  it('returns false for non-text nodes', () => {
    expect(isTextNode({ type: 'paragraph', content: [] })).toBe(false)
    expect(isTextNode({ type: 'soft_break' })).toBe(false)
  })
})

describe('hasType', () => {
  it('narrows to the matching typed node alias', () => {
    const node: MirrorNode = { type: 'clause', attrs: { id: 's1', title: 'Scope' } }
    if (hasType(node, 'clause')) {
      expectTypeOf(node).toMatchTypeOf<ClauseNode>()
      expectTypeOf(node.attrs).toEqualTypeOf<{ id?: string; number?: string; title?: string } | undefined>()
      expect(node.attrs?.title).toBe('Scope')
    } else {
      throw new Error('expected clause to be narrowed')
    }
  })

  it('narrows formula nodes to typed formula attrs', () => {
    const node: MirrorNode = { type: 'formula', attrs: { asciimath: 'x^2' } }
    if (hasType(node, 'formula')) {
      expectTypeOf(node).toMatchTypeOf<FormulaNode>()
      expectTypeOf(node.attrs).toEqualTypeOf<FormulaAttrs | undefined>()
      expect(node.attrs?.asciimath).toBe('x^2')
    } else {
      throw new Error('expected formula to be narrowed')
    }
  })

  it('returns false when types do not match', () => {
    const node: MirrorNode = { type: 'paragraph', content: [] }
    expect(hasType(node, 'clause')).toBe(false)
  })

  it('returns true when types match', () => {
    const node: MirrorNode = { type: 'paragraph', content: [] }
    expect(hasType(node, 'paragraph')).toBe(true)
  })
})
