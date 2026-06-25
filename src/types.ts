export const MARK_TYPES = [
  'emphasis', 'strong', 'subscript', 'superscript', 'code',
  'underline', 'strike', 'smallcap', 'link', 'xref', 'eref',
  'footnote', 'stem', 'concept', 'bcp14', 'span',
] as const

export type MirrorMarkType = typeof MARK_TYPES[number]

export interface BaseAttrs {
  id?: string
  number?: string
  [key: string]: unknown
}

export interface SectionAttrs extends BaseAttrs {
  title?: string
}

export interface FigureAttrs extends BaseAttrs {
  title?: string
  src?: string
  alt?: string
}

export interface TableAttrs extends BaseAttrs {
  title?: string
}

export interface TableCellAttrs {
  colspan?: number
  rowspan?: number
  [key: string]: unknown
}

export interface FormulaAttrs {
  asciimath?: string
  mathml?: string
  math_text?: string
  number?: string
  [key: string]: unknown
}

export interface ImageAttrs {
  src: string
  alt?: string
  [key: string]: unknown
}

export interface AdmonitionAttrs {
  type?: string
  [key: string]: unknown
}

export interface SourcecodeAttrs {
  text?: string
  language?: string
  [key: string]: unknown
}

export interface LinkMarkAttrs {
  target?: string
  href?: string
  [key: string]: unknown
}

export interface XrefMarkAttrs {
  target?: string
  [key: string]: unknown
}

export interface NodeAttrsByType {
  clause: SectionAttrs
  annex: SectionAttrs
  content_section: SectionAttrs
  abstract: SectionAttrs
  foreword: SectionAttrs
  introduction: SectionAttrs
  acknowledgements: SectionAttrs
  terms: SectionAttrs
  definitions: SectionAttrs
  references: SectionAttrs
  floating_title: SectionAttrs
  formula: FormulaAttrs
  figure: FigureAttrs
  table: TableAttrs
  table_cell: TableCellAttrs
  image: ImageAttrs
  admonition: AdmonitionAttrs
  sourcecode: SourcecodeAttrs
}

export interface MarkAttrsByType {
  link: LinkMarkAttrs
  xref: XrefMarkAttrs
}

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

export type AttrsFor<T extends string> =
  T extends keyof NodeAttrsByType ? NodeAttrsByType[T] : Record<string, unknown>

export type TypedMirrorNode<T extends MirrorNodeType> =
  Omit<MirrorNode, 'type' | 'attrs'> & { type: T; attrs?: AttrsFor<T> }

export type ClauseNode = TypedMirrorNode<'clause'>
export type AnnexNode = TypedMirrorNode<'annex'>
export type ContentSectionNode = TypedMirrorNode<'content_section'>
export type AbstractNode = TypedMirrorNode<'abstract'>
export type ForewordNode = TypedMirrorNode<'foreword'>
export type IntroductionNode = TypedMirrorNode<'introduction'>
export type AcknowledgementsNode = TypedMirrorNode<'acknowledgements'>
export type TermsNode = TypedMirrorNode<'terms'>
export type DefinitionsNode = TypedMirrorNode<'definitions'>
export type ReferencesNode = TypedMirrorNode<'references'>
export type FloatingTitleNode = TypedMirrorNode<'floating_title'>
export type FormulaNode = TypedMirrorNode<'formula'>
export type FigureNode = TypedMirrorNode<'figure'>
export type TableNode = TypedMirrorNode<'table'>
export type TableCellNode = TypedMirrorNode<'table_cell'>
export type ImageNode = TypedMirrorNode<'image'>
export type AdmonitionNode = TypedMirrorNode<'admonition'>
export type SourcecodeNode = TypedMirrorNode<'sourcecode'>

export function hasType<T extends MirrorNodeType>(
  node: MirrorNode,
  type: T,
): node is TypedMirrorNode<T> {
  return node.type === type
}

function makeTypePredicate<T extends string>(values: readonly T[]) {
  const set: ReadonlySet<string> = new Set(values)
  return (type: string): type is T => set.has(type)
}

export const isMarkType = makeTypePredicate(MARK_TYPES)
export const isStructuralType = makeTypePredicate(STRUCTURAL_TYPES)
export const isSectionType = makeTypePredicate(SECTION_TYPES)
export const isBlockType = makeTypePredicate(BLOCK_TYPES)
export const isListType = makeTypePredicate(LIST_TYPES)
export const isTableType = makeTypePredicate(TABLE_TYPES)
export const isMediaType = makeTypePredicate(MEDIA_TYPES)
export const isFootnoteType = makeTypePredicate(FOOTNOTE_TYPES)
export const isLeafType = makeTypePredicate(LEAF_TYPES)

export function isTextNode(node: MirrorNode): boolean {
  return node.type === 'text'
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
