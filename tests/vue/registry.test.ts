import { describe, it, expect, beforeEach } from 'vitest'
import { registerNodeRenderer, resolveNodeRenderer } from '../../src/vue/registry'

describe('registerNodeRenderer / resolveNodeRenderer', () => {
  it('returns undefined for an unregistered type', () => {
    expect(resolveNodeRenderer('definitely_not_registered_type_xyz')).toBeUndefined()
  })

  it('round-trips a registered component', () => {
    const component = { name: 'TestComponent', template: '<div />' }
    registerNodeRenderer('test_type_a', component as never)
    expect(resolveNodeRenderer('test_type_a')).toBe(component)
  })

  it('override replaces the previous registration', () => {
    const first = { name: 'First', template: '<div />' }
    const second = { name: 'Second', template: '<span />' }
    registerNodeRenderer('test_type_b', first as never)
    registerNodeRenderer('test_type_b', second as never)
    expect(resolveNodeRenderer('test_type_b')).toBe(second)
  })
})

describe('built-in registrations', () => {
  beforeEach(async () => {
    await import('../../src/vue')
  })

  it.each([
    'doc',
    'preface', 'sections', 'bibliography',
    'clause', 'annex', 'terms', 'definitions', 'references',
    'paragraph',
    'note', 'example', 'review', 'admonition',
    'quote', 'figure', 'image', 'sourcecode', 'formula',
    'table', 'table_head', 'table_body', 'table_foot', 'table_row', 'table_cell',
    'bullet_list', 'ordered_list', 'list_item',
    'dl', 'dt', 'dd',
    'footnotes', 'footnote_entry', 'footnote_marker',
    'floating_title', 'soft_break', 'text',
  ])('registers built-in renderer for %s', (type) => {
    expect(resolveNodeRenderer(type)).toBeDefined()
  })

  it('shares the section renderer across all section types', () => {
    const clauseRenderer = resolveNodeRenderer('clause')
    const annexRenderer = resolveNodeRenderer('annex')
    const termsRenderer = resolveNodeRenderer('terms')
    expect(clauseRenderer).toBe(annexRenderer)
    expect(clauseRenderer).toBe(termsRenderer)
  })

  it('shares the structural renderer across container types', () => {
    const prefaceRenderer = resolveNodeRenderer('preface')
    const sectionsRenderer = resolveNodeRenderer('sections')
    const bibliographyRenderer = resolveNodeRenderer('bibliography')
    expect(prefaceRenderer).toBe(sectionsRenderer)
    expect(prefaceRenderer).toBe(bibliographyRenderer)
  })

  it('shares the table section renderer across head/body/foot', () => {
    const headRenderer = resolveNodeRenderer('table_head')
    const bodyRenderer = resolveNodeRenderer('table_body')
    const footRenderer = resolveNodeRenderer('table_foot')
    expect(headRenderer).toBe(bodyRenderer)
    expect(headRenderer).toBe(footRenderer)
  })

  it('allows consumers to override a built-in', () => {
    const original = resolveNodeRenderer('paragraph')
    const custom = { name: 'CustomParagraph', template: '<p />' }
    registerNodeRenderer('paragraph', custom as never)
    expect(resolveNodeRenderer('paragraph')).toBe(custom)
    expect(resolveNodeRenderer('paragraph')).not.toBe(original)
  })
})
