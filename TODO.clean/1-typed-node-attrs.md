# Candidate 1 — Typed node attrs

## Problem

`MirrorNode.attrs` is `Record<string, unknown>`. Every consumer casts independently:

- `src/marks.ts:24,29` — `m.attrs?.target as string` for link/xref
- `src/math.ts:12-14` — `attrs.mathml as string` etc. for formula
- `src/traversal.ts:46-49` — `node.attrs.id as string`, `node.attrs.title` for sections
- `src/vue/MirrorNode.vue` — repeated `node.attrs?.id as string`, `node.attrs?.src as string`, etc.

This is an MECE violation: the contract for per-type attrs is smeared across every call site as casts. Knowledge of "what attrs does a clause node have?" lives nowhere central — it lives implicitly in the union of all the casts.

## Design

### Per-type Attrs interfaces

New in `src/types.ts`, all optional where the field may be absent:

- `BaseAttrs` — `{ id?: string; number?: string }`. Common to most typed nodes.
- `SectionAttrs extends BaseAttrs` — adds `title?: string`. Used by every type in `SECTION_TYPES` plus `floating_title`.
- `FigureAttrs extends BaseAttrs` — adds `title?`, `src?`, `alt?`.
- `TableAttrs extends BaseAttrs` — adds `title?`. (Other table cell attrs live on `TableCellAttrs`.)
- `TableCellAttrs` — `{ colspan?: number; rowspan?: number }`.
- `FormulaAttrs` — `{ asciimath?; mathml?; math_text?; number? }`. Note: doesn't extend `BaseAttrs` because formulas use `number` for the displayed formula number, which is already inlined here.
- `ImageAttrs` — `{ src: string; alt?: string }`.
- `AdmonitionAttrs` — `{ type?: string }`.
- `SourcecodeAttrs` — `{ text?: string; language?: string }`.

Mark attrs (for `extractHref`):

- `LinkMarkAttrs` — `{ target?: string; href?: string }`.
- `XrefMarkAttrs` — `{ target?: string }`.

### NodeAttrsByType map (TS type only)

```ts
type NodeAttrsByType = {
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
```

Types not in this map (e.g. `paragraph`, `note`, `text`) fall back to `Record<string, unknown>` — they don't currently need typed attrs.

### Typed node aliases

The existing `MirrorNode` interface stays non-generic (backward compat — every existing usage still compiles). We add a typed overlay:

```ts
type AttrsFor<T extends MirrorNodeType> =
  T extends keyof NodeAttrsByType ? NodeAttrsByType[T] : Record<string, unknown>

export type TypedMirrorNode<T extends MirrorNodeType> =
  Omit<MirrorNode, 'type' | 'attrs'> & { type: T; attrs?: AttrsFor<T> }

export type ClauseNode = TypedMirrorNode<'clause'>
export type FormulaNode = TypedMirrorNode<'formula'>
// … etc for every type in NodeAttrsByType
```

Consumers can opt in: `function f(node: ClauseNode) { … node.attrs.title … }` — no cast.

### hasType type guard

```ts
export function hasType<T extends MirrorNodeType>(
  node: MirrorNode,
  type: T,
): node is TypedMirrorNode<T> {
  return node.type === type
}
```

Lets call sites narrow an untyped `MirrorNode` to a typed alias in a single check, then access `attrs` without casts.

### Mark attrs without casts

`extractHref` currently casts. Replace with runtime type checks:

```ts
extractHref: m => {
  const target = m.attrs?.target
  if (typeof target === 'string') return target
  const href = m.attrs?.href
  return typeof href === 'string' ? href : undefined
}
```

This drops the `as string` cast and is genuinely safer (returns `undefined` if the attr is a number or object, instead of being coerced into a string at the cast site).

## Out of scope

- **Vue template casts in `MirrorNode.vue`** — Vue's template compiler doesn't do control-flow narrowing, so eliminating casts there needs computed properties or a different component shape. Candidate 2 will split `MirrorNode.vue` into per-category renderer components with typed props, at which point the casts dissolve naturally. Touching them here would be wasted work.
- **Generic `MirrorNode<T>` / `MirrorMark<T>` interfaces** — would force every consumer to either pass a type parameter or accept the union-wide attrs (which collapses to `Record<string, unknown>`). The typed-overlay approach (`TypedMirrorNode<T>` as an opt-in alias) gives the same value without breaking existing code.
- **`_TYPES` derivation from a runtime registry** — Candidate 2 introduces a node registry; making the category arrays derived from it belongs there.
- **Bonus B3/B4** (silent undefined href, single-mark rendering) — separate concerns.

## Plan: two commits in one PR

### Commit A — `feat(types): introduce per-type node attrs and typed aliases`

Files: `src/types.ts`, `src/index.ts` (re-exports), `tests/types.test.ts`.

- Add the Attrs interfaces, `NodeAttrsByType`, `AttrsFor<T>`, `TypedMirrorNode<T>`, the per-type aliases, and `hasType`.
- Existing call sites still compile — `MirrorNode` is unchanged.
- Tests:
  - Extend the disjointness assertion to cover `MEDIA_TYPES`, `FOOTNOTE_TYPES`, `LEAF_TYPES` (audit item B1).
  - `expectTypeOf` assertions that `hasType(node, 'clause')` narrows to `ClauseNode` with typed attrs (type-level, runs in vitest).
  - A runtime test that `hasType` returns true/false correctly.

### Commit B — `refactor: tighten call sites with hasType and typed attrs`

Files: `src/marks.ts`, `src/math.ts`, `src/traversal.ts`, `tests/marks.test.ts`, `tests/math.test.ts`.

- `marks.ts` — `extractHref` for link and xref uses runtime type checks (no `as`).
- `math.ts` — `extractFormulaAttrs` narrows internally with `hasType(node, 'formula')` and returns typed `FormulaAttrs` fields (no `as`).
- `traversal.ts` — `walkForToc` uses `hasType`-shaped narrowing on sections (no `as`).
- Tests: add cases that exercise typed access on non-string attrs (e.g. link mark with `target: 42` returns `undefined`, not `"42"`).

## Acceptance

- `npm run lint` clean.
- `npm test` green.
- `npm run test:e2e` green (no behavior change — only types/structure shift).
- `npx tsc --noEmit` clean.
- No new runtime behavior — same HTML output, same mark href extraction, same TOC entries.
- No AI attribution in commit messages or PR description.
