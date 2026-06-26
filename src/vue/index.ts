import { registerNodeRenderer } from './registry'

import DocumentRenderer from './renderers/DocumentRenderer.vue'
import StructuralRenderer from './renderers/StructuralRenderer.vue'
import SectionRenderer from './renderers/SectionRenderer.vue'
import ParagraphRenderer from './renderers/ParagraphRenderer.vue'
import BlockRenderer from './renderers/BlockRenderer.vue'
import AdmonitionRenderer from './renderers/AdmonitionRenderer.vue'
import QuoteRenderer from './renderers/QuoteRenderer.vue'
import FigureRenderer from './renderers/FigureRenderer.vue'
import ImageRenderer from './renderers/ImageRenderer.vue'
import SourcecodeRenderer from './renderers/SourcecodeRenderer.vue'
import FormulaRenderer from './renderers/FormulaRenderer.vue'
import TableRenderer from './renderers/TableRenderer.vue'
import TableSectionRenderer from './renderers/TableSectionRenderer.vue'
import TableRowRenderer from './renderers/TableRowRenderer.vue'
import TableCellRenderer from './renderers/TableCellRenderer.vue'
import ListRenderer from './renderers/ListRenderer.vue'
import ListItemRenderer from './renderers/ListItemRenderer.vue'
import DefinitionListRenderer from './renderers/DefinitionListRenderer.vue'
import FootnoteRenderer from './renderers/FootnoteRenderer.vue'
import FloatingTitleRenderer from './renderers/FloatingTitleRenderer.vue'
import LeafRenderer from './renderers/LeafRenderer.vue'
import TextNodeRenderer from './renderers/TextNodeRenderer.vue'

registerNodeRenderer('doc', DocumentRenderer)

registerNodeRenderer('preface', StructuralRenderer)
registerNodeRenderer('sections', StructuralRenderer)
registerNodeRenderer('bibliography', StructuralRenderer)

for (const type of [
  'clause', 'annex', 'content_section', 'abstract', 'foreword',
  'introduction', 'acknowledgements', 'terms', 'definitions', 'references',
]) {
  registerNodeRenderer(type, SectionRenderer)
}

registerNodeRenderer('paragraph', ParagraphRenderer)

registerNodeRenderer('note', BlockRenderer)
registerNodeRenderer('example', BlockRenderer)
registerNodeRenderer('review', BlockRenderer)
registerNodeRenderer('admonition', AdmonitionRenderer)

registerNodeRenderer('quote', QuoteRenderer)
registerNodeRenderer('figure', FigureRenderer)
registerNodeRenderer('image', ImageRenderer)
registerNodeRenderer('sourcecode', SourcecodeRenderer)
registerNodeRenderer('formula', FormulaRenderer)

registerNodeRenderer('table', TableRenderer)
registerNodeRenderer('table_head', TableSectionRenderer)
registerNodeRenderer('table_body', TableSectionRenderer)
registerNodeRenderer('table_foot', TableSectionRenderer)
registerNodeRenderer('table_row', TableRowRenderer)
registerNodeRenderer('table_cell', TableCellRenderer)

registerNodeRenderer('bullet_list', ListRenderer)
registerNodeRenderer('ordered_list', ListRenderer)
registerNodeRenderer('list_item', ListItemRenderer)

registerNodeRenderer('dl', DefinitionListRenderer)
registerNodeRenderer('dt', DefinitionListRenderer)
registerNodeRenderer('dd', DefinitionListRenderer)

registerNodeRenderer('footnotes', FootnoteRenderer)
registerNodeRenderer('footnote_entry', FootnoteRenderer)
registerNodeRenderer('footnote_marker', FootnoteRenderer)

registerNodeRenderer('floating_title', FloatingTitleRenderer)
registerNodeRenderer('soft_break', LeafRenderer)
registerNodeRenderer('text', TextNodeRenderer)

export { default as MirrorNode } from './MirrorNode.vue'
export { default as MirrorText } from './MirrorText.vue'
export { registerNodeRenderer, resolveNodeRenderer } from './registry'
