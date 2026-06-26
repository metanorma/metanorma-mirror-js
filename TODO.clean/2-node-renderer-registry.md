# Candidate 2 — Node renderer registry

## Problem

`MirrorNode.vue` is a ~173-line chain of `v-if`/`v-else-if` keyed on `node.type`. Adding a new node type requires editing the chain — an OCP violation. This is asymmetric with `marks.ts`, which already uses a registry (`registerMark`) for the same purpose on inline marks.

The chain also keeps per-type rendering knowledge smeared across one file. Each branch carries its own depth-handling quirks (the original code has three different depth formulas for headings, captured faithfully below). Candidate 5 will clean up depth semantics; this candidate preserves them exactly.

## Design

### Registry

New `src/vue/registry.ts`:

```ts
import type { Component } from 'vue'

const registry = new Map<string, Component>()

export function registerNodeRenderer(type: string, component: Component): void {
  registry.set(type, component)
}

export function resolveNodeRenderer(type: string): Component | undefined {
  return registry.get(type)
}
```

Mirrors `src/marks.ts`. `registerNodeRenderer(type, component)` is a public API — consumers can override built-ins or register custom types.

### Dispatcher

`MirrorNode.vue` shrinks to a thin dispatcher:

```vue
<script setup lang="ts">
import { computed } from 'vue'
import type { MirrorNode as MirrorNodeType } from '../types'
import { resolveNodeRenderer } from './registry'

defineOptions({ name: 'MirrorNode' })
const props = defineProps<{ node: MirrorNodeType; depth?: number }>()

const resolved = computed(() => resolveNodeRenderer(props.node.type))
</script>

<template>
  <component v-if="resolved" :is="resolved" :node="node" :depth="depth" />
</template>
```

Every type — including the unknown-type fallback — is handled by a registered renderer. There is no inline `v-if` chain left.

### Renderer components

Per-category renderers under `src/vue/renderers/`. Each receives `{ node: MirrorNode; depth?: number }` and recurses by importing `MirrorNode` itself.

The split mirrors the categories from `src/types.ts` plus a few practical groupings. Each renderer switches on `node.type` for any per-type element tag or CSS class (e.g. `bullet_list` → `<ul>`, `ordered_list` → `<ol>`).

| Renderer                     | Handles                                                                              |
| ---                          | ---                                                                                  |
| `DocumentRenderer`           | `doc` (article wrapper)                                                              |
| `StructuralRenderer`         | `preface`, `sections`, `bibliography`                                                |
| `SectionRenderer`            | all `SECTION_TYPES` (clause, annex, terms, definitions, references, …)               |
| `ParagraphRenderer`          | `paragraph`                                                                          |
| `BlockRenderer`              | `note`, `example`, `review` (div with fixed label + content)                         |
| `AdmonitionRenderer`         | `admonition` (variable type label from `attrs.type`)                                 |
| `QuoteRenderer`              | `quote` (blockquote)                                                                 |
| `FigureRenderer`             | `figure` (with caption)                                                              |
| `ImageRenderer`              | `image` (img)                                                                        |
| `SourcecodeRenderer`         | `sourcecode` (pre > code)                                                            |
| `FormulaRenderer`            | `formula` (mathml v-html + asciimath fallback + number)                              |
| `TableRenderer`              | `table` (with title + table wrapper)                                                 |
| `TableSectionRenderer`       | `table_head`, `table_body`, `table_foot` → thead/tbody/tfoot                         |
| `TableRowRenderer`           | `table_row` → tr                                                                     |
| `TableCellRenderer`          | `table_cell` → td (with colspan/rowspan)                                             |
| `ListRenderer`               | `bullet_list` → ul, `ordered_list` → ol                                              |
| `ListItemRenderer`           | `list_item` → li                                                                     |
| `DefinitionListRenderer`     | `dl` → dl, `dt` → dt, `dd` → dd                                                      |
| `FootnoteRenderer`           | `footnotes`, `footnote_entry`, `footnote_marker`                                     |
| `FloatingTitleRenderer`      | `floating_title` (dynamic heading level)                                             |
| `LeafRenderer`               | `soft_break` → br                                                                    |
| `TextNodeRenderer`           | `text` (delegates to `<MirrorText>`)                                                 |

22 renderer components. Granularity is per the original plan (one renderer per category, switches internally for closely-related types). Unknown types fall through to an inline `<div class="mirror-${type}">` block in the dispatcher (preserves the prior fallback behavior).

### Registration

Built-ins are registered in `src/vue/index.ts` as a side effect of import. Consumers who import `MirrorNode` from `@metanorma/mirror/vue` automatically get the registrations; consumers who register their own via `registerNodeRenderer` override built-ins.

The subpath export in `package.json` only exposes `./vue` (not `./vue/MirrorNode.vue` directly), so this side effect is guaranteed for any documented usage.

### Behavior preservation (the killer test)

Every renderer preserves the exact HTML output and `depth` pass-down of the current `MirrorNode.vue`:

- `doc` passes `depth ?? 0` to children.
- `preface`, `sections`, `bibliography` pass `(depth ?? 0) + 1`.
- Sections pass `(depth ?? 1) + 1`.
- `floating_title` heading uses `(depth ?? 2) + 1`.
- Everything else passes `depth` unchanged.

This means the **e2e suite (`tests/e2e/rendering.test.ts`) must pass unchanged**. If any of the 12 e2e assertions fails, the refactor broke something. No new e2e tests are added in this candidate — the existing suite is the regression contract.

## Out of scope

- **Depth semantics cleanup** — Candidate 5 renames `depth` to `headingLevel` and consolidates the formulas. This candidate preserves the existing quirks.
- **`footnote_marker` renderer** — Candidate 4 adds it. The `FOOTNOTE_TYPES` array currently has `footnote_marker` with no renderer; the FallbackRenderer will handle it as a div-with-children (same as today).
- **Typed renderer props (`FormulaRenderer` accepts `FormulaNode`)** — would require the dispatcher to cast or use a typed registry. The cost outweighs the value; renderers accept `MirrorNode` and narrow internally with `hasType` where needed.
- **Removing `extractFormulaAttrs` from the public API** — Candidate 3 consolidates the formula path.

## Plan: two commits in one PR

### Commit A — `feat(vue): split MirrorNode into a registry-driven dispatcher`

Files:
- `src/vue/registry.ts` (new)
- `src/vue/renderers/*.vue` (22 new files)
- `src/vue/MirrorNode.vue` (rewritten as dispatcher)
- `src/vue/index.ts` (registers built-ins, re-exports registry)

### Commit B — `test(vue): add registry register/resolve/override coverage`

Files:
- `tests/vue/registry.test.ts` (new)

Pure unit tests for the registry — register a type, resolve it, override it. No Vue mounting needed; the e2e suite covers end-to-end rendering.

## Acceptance

- `npm run lint` clean.
- `npm test` green.
- `npm run test:e2e` green — **this is the regression contract**. All 12 assertions must pass unchanged.
- `npx tsc --noEmit` clean.
- `MirrorNode.vue` is no longer a chain of `v-if`s; adding a new type no longer requires editing the dispatcher.
- No AI attribution in commit messages or PR description.
