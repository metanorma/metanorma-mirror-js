# @metanorma/mirror

TypeScript library and optional Vue 3 components for the **Metanorma Mirror** document format — a JSON tree representation of standards documents (clauses, terms, tables, formulas, lists, etc.).

The library is framework-agnostic. The Vue layer is opt-in via a separate subpath export.

## Install

```bash
npm install @metanorma/mirror
```

For the Vue components, Vue 3 (`>=3.4`) is a peer dependency:

```bash
npm install @metanorma/mirror vue
```

## Entry points

| Subpath | Description |
| --- | --- |
| `@metanorma/mirror` | Core types, traversal, mark registry, math helpers |
| `@metanorma/mirror/vue` | `<MirrorNode>` and `<MirrorText>` Vue 3 components |

## Core usage

```ts
import {
  buildToc,
  findNodes,
  getNodeText,
  type MirrorDocument,
} from '@metanorma/mirror'

const doc: MirrorDocument = {
  type: 'doc',
  content: [
    {
      type: 'clause',
      attrs: { id: 'scope', title: 'Scope', number: '1' },
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'Hello ' },
            { type: 'text', text: 'world', marks: [{ type: 'strong' }] },
          ],
        },
      ],
    },
  ],
}

buildToc(doc)
// => [{ id: 'scope', title: '1 Scope', depth: 0 }]

findNodes(doc, n => n.type === 'paragraph').length
// => 1

getNodeText(doc)
// => 'Hello world'
```

### Mark registry

Inline marks (`strong`, `emphasis`, `link`, `xref`, `footnote`, `stem`, …) are resolved through a registry. Built-ins can be overridden and custom marks can be added via `registerMark`:

```ts
import { registerMark, resolveMark } from '@metanorma/mirror'

registerMark('highlight', { tag: 'mark', classes: 'hl' })
resolveMark({ type: 'highlight' })
// => { tag: 'mark', classes: 'hl' }
```

`getMarkHref` extracts the URL from `link` and `xref` marks (reads `attrs.target`, falls back to `attrs.href` for `link`).

### Math formulas

Formula nodes may carry pre-computed MathML in `attrs.mathml`, or AsciiMath in `attrs.asciimath` / `attrs.math_text`. `renderFormula` returns MathML when available, otherwise lazily converts AsciiMath → MathML via [`@plurimath/plurimath`](https://www.npmjs.com/package/@plurimath/plurimath), falling back to the raw AsciiMath string if conversion fails.

```ts
import { renderFormula } from '@metanorma/mirror'

await renderFormula({ type: 'formula', attrs: { asciimath: 'E = mc^2' } })
```

## Vue usage

```vue
<script setup lang="ts">
import { MirrorNode } from '@metanorma/mirror/vue'
import type { MirrorDocument } from '@metanorma/mirror'

const doc: MirrorDocument = /* … */
</script>

<template>
  <MirrorNode :node="doc" :depth="0" />
</template>
```

`<MirrorNode>` walks the node tree recursively and emits semantic HTML with `mirror-<type>` class names (e.g. `mirror-paragraph`, `mirror-section`, `mirror-table`). `<MirrorText>` renders a text node with the first matching mark as the appropriate HTML element (`<strong>`, `<em>`, `<a>`, `<sub>`, `<sup>`, etc.).

CSS is intentionally not bundled — apply your own styles to the `.mirror-*` classes, or override the component templates.

## Node model

Every node shares the shape `{ type, attrs?, content?, marks?, text? }`. Node types are partitioned into disjoint categories exported from the core:

- `STRUCTURAL_TYPES` — `doc`, `preface`, `sections`, `bibliography`
- `SECTION_TYPES` — `clause`, `annex`, `terms`, `definitions`, `references`, …
- `BLOCK_TYPES` — `paragraph`, `note`, `admonition`, `example`, `quote`, `formula`, `sourcecode`, `review`
- `LIST_TYPES`, `TABLE_TYPES`, `MEDIA_TYPES`, `FOOTNOTE_TYPES`, `LEAF_TYPES`

`SECTION_TYPES` is used by `buildToc` to decide which nodes become TOC entries.

## Development

```bash
npm install
npm run build          # vite build → dist + .d.ts via vite-plugin-dts
npm test               # vitest unit tests
npm run test:e2e       # puppeteer e2e
npm run test:all       # both suites
```

Requires **Node.js 20+**. See [CONTRIBUTING.md](./CONTRIBUTING.md) for release flow and conventions.

## License

BSD-3-Clause — see [LICENSE](./LICENSE).
