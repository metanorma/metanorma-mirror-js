export const MARK_TYPES = [
  'emphasis', 'strong', 'subscript', 'superscript', 'code',
  'underline', 'strike', 'smallcap', 'link', 'xref', 'eref',
  'footnote', 'stem', 'concept', 'bcp14', 'span',
] as const

export type MirrorMarkType = typeof MARK_TYPES[number]

export interface MirrorMark {
  type: MirrorMarkType
  attrs?: Record<string, unknown>
}

export const STRUCTURAL_TYPES = ['doc', 'preface', 'sections', 'bibliography'] as const
export const SECTION_TYPES = [
  'clause', 'annex', 'content_section', 'abstract', 'foreword',
  'introduction', 'acknowledgements', 'terms', 'definitions', 'references',
] as const
export const BLOCK_TYPES = [
  'paragraph', 'note', 'admonition', 'example', 'sourcecode',
  'formula', 'quote', 'review',
] as const
export const LIST_TYPES = ['bullet_list', 'ordered_list', 'list_item', 'dl', 'dt', 'dd'] as const
export const TABLE_TYPES = ['table', 'table_head', 'table_body', 'table_foot', 'table_row', 'table_cell'] as const
export const MEDIA_TYPES = ['figure', 'image'] as const
export const FOOTNOTE_TYPES = ['footnotes', 'footnote_marker', 'footnote_entry'] as const
export const LEAF_TYPES = ['text', 'soft_break', 'floating_title'] as const

export type MirrorNodeType =
  | typeof STRUCTURAL_TYPES[number]
  | typeof SECTION_TYPES[number]
  | typeof BLOCK_TYPES[number]
  | typeof LIST_TYPES[number]
  | typeof TABLE_TYPES[number]
  | typeof MEDIA_TYPES[number]
  | typeof FOOTNOTE_TYPES[number]
  | typeof LEAF_TYPES[number]

export interface MirrorNode {
  type: string
  attrs?: Record<string, unknown>
  content?: MirrorNode[]
  marks?: MirrorMark[]
  text?: string
}

export type MirrorDocument = MirrorNode

export interface DocumentPart {
  id: string
  label: string
  title: string
}

export interface DocumentManifest {
  [standardId: string]: {
    parts: DocumentPart[]
  }
}
