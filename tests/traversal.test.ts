import { describe, it, expect } from 'vitest'
import { getNodeText, findNodes, buildToc } from '../src/traversal'
import type { MirrorNode } from '../src/types'

function textNode(text: string, marks?: any[]): MirrorNode {
  return { type: 'text', text, marks }
}

function para(...content: MirrorNode[]): MirrorNode {
  return { type: 'paragraph', content }
}

function clause(id: string, title: string, ...content: MirrorNode[]): MirrorNode {
  return { type: 'clause', attrs: { id, title }, content }
}

describe('getNodeText', () => {
  it('returns text from a text node', () => {
    expect(getNodeText(textNode('hello'))).toBe('hello')
  })

  it('returns empty string for node without content', () => {
    expect(getNodeText({ type: 'image', attrs: { src: 'x.png' } })).toBe('')
  })

  it('concatenates text from nested content', () => {
    expect(getNodeText(para(textNode('Hello '), textNode('World')))).toBe('Hello World')
  })

  it('recurses through nested structures', () => {
    const doc: MirrorNode = {
      type: 'doc',
      content: [clause('s1', 'Intro', para(textNode('body text')))],
    }
    expect(getNodeText(doc)).toBe('body text')
  })
})

describe('findNodes', () => {
  it('finds nodes matching a predicate', () => {
    const doc: MirrorNode = {
      type: 'doc',
      content: [
        para(textNode('a')),
        para(textNode('b')),
        { type: 'note', content: [para(textNode('c'))] },
      ],
    }
    const notes = findNodes(doc, n => n.type === 'note')
    expect(notes).toHaveLength(1)
  })

  it('finds multiple matches', () => {
    const doc: MirrorNode = {
      type: 'doc',
      content: [para(textNode('a')), para(textNode('b'))],
    }
    expect(findNodes(doc, n => n.type === 'paragraph')).toHaveLength(2)
  })

  it('returns empty array for no matches', () => {
    expect(findNodes({ type: 'doc', content: [] }, n => n.type === 'table')).toHaveLength(0)
  })
})

describe('buildToc', () => {
  it('extracts TOC entries from sections', () => {
    const doc: MirrorNode = {
      type: 'doc',
      content: [clause('s1', 'Introduction'), clause('s2', 'Scope')],
    }
    expect(buildToc(doc)).toEqual([
      { id: 's1', title: 'Introduction', depth: 0 },
      { id: 's2', title: 'Scope', depth: 0 },
    ])
  })

  it('includes section numbers in title', () => {
    const doc: MirrorNode = {
      type: 'doc',
      content: [
        { type: 'clause', attrs: { id: 's1', title: 'Scope', number: '1' }, content: [] },
      ],
    }
    expect(buildToc(doc)[0].title).toBe('1 Scope')
  })

  it('tracks depth correctly', () => {
    const doc: MirrorNode = {
      type: 'doc',
      content: [clause('s1', 'Parent', clause('s1.1', 'Child'))],
    }
    expect(buildToc(doc)).toEqual([
      { id: 's1', title: 'Parent', depth: 0 },
      { id: 's1.1', title: 'Child', depth: 1 },
    ])
  })

  it('skips sections without title or id', () => {
    const doc: MirrorNode = {
      type: 'doc',
      content: [
        { type: 'clause', attrs: { title: 'No ID' }, content: [] },
        { type: 'clause', attrs: { id: 'no-title' }, content: [] },
        clause('s1', 'Valid'),
      ],
    }
    expect(buildToc(doc)).toHaveLength(1)
  })

  it('finds sections nested inside structural containers', () => {
    const doc: MirrorNode = {
      type: 'doc',
      content: [
        { type: 'sections', content: [clause('s1', 'Inside sections')] },
      ],
    }
    expect(buildToc(doc)).toEqual([{ id: 's1', title: 'Inside sections', depth: 0 }])
  })
})
