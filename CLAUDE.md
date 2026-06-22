# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

TypeScript library plus optional Vue 3 components for the **Metanorma Mirror** document format — a JSON tree representation of standards documents (ISO-style: clauses, terms, tables, formulas, etc.). The library is framework-agnostic; the Vue layer is opt-in via a separate subpath export.

Published as a dual-entry-point package under the `@metanorma` scope:
- `@metanorma/mirror` — core types, traversal, mark registry, math rendering
- `@metanorma/mirror/vue` — `<MirrorNode>` / `<MirrorText>` components

BSD-3-Clause (Ribose, 2026). Repo: `metanorma/metanorma-mirror-js`.

## Common commands

```bash
npm run build         # vite build → dist/{mirror,vue}.{js,cjs} + d.ts via vite-plugin-dts
npm run clean         # rm -rf dist (prepublishOnly runs this first)
npm test              # vitest unit tests (tests/*.test.ts)
npm run test:e2e      # Puppeteer e2e (tests/e2e/rendering.test.ts) — separate vite config
npm run test:all      # both suites sequentially
npm publish           # prepublishOnly auto-runs clean + build + test:all

# Run a single unit test file:
npx vitest run tests/marks.test.ts
# Filter by name within a file:
npx vitest run tests/traversal.test.ts -t "buildToc"
```

Type declarations are emitted by `vite-plugin-dts` during `vite build` — the source `tsconfig.json` only drives editor typechecking. Source-level `tsc --noEmit` requires the Vue shim at `src/vue/shims-vue.d.ts` (already present) so `.vue` imports resolve; without it `src/vue/index.ts` errors with TS2307.

## Release flow

Releases are automated via `.github/workflows/release.yml`. Tag push of `v*` (e.g. `v0.1.0`) triggers `npm publish --provenance --access public --tag <dist-tag>` and creates a GitHub release. Ad-hoc releases can be triggered via `workflow_dispatch` with a version input. The dist-tag is derived from the version: prerelease identifiers become the dist-tag (`0.1.0-beta.1` → `beta`, `0.9.0-rc.2` → `rc`), full releases go to `latest`.

Publishing uses npm's Trusted Publisher (OIDC) — no `NPM_TOKEN` secret is required. The npm package must list this repository's `release.yml` workflow as a Trusted Publisher in its package settings. The workflow already carries `permissions.id-token: write`, which is what npm's OIDC exchange needs.

CI runs on push/PR to main (`.github/workflows/ci.yml`) with four jobs: `lint`, `build`, `test` (Node 20/22/24 matrix), and `test-e2e` (Puppeteer with the runner's system Chrome). Dependabot submits weekly PRs for npm and GitHub Actions updates.

## Architecture

### Two build outputs from one source tree

`vite.config.ts` defines two library entries (`src/index.ts`, `src/vue/index.ts`), each emitted in both ES and CJS. `vue` and `@plurimath/plurimath` are externalized — they are peer/optional runtime deps, not bundled. The Vue subpath is only consumed if the host app provides Vue 3.

### Node-tree model (`src/types.ts`)

`MirrorNode` is the universal shape: `{ type, attrs?, content?, marks?, text? }`. Node types are partitioned into disjoint const arrays — `STRUCTURAL_TYPES`, `SECTION_TYPES`, `BLOCK_TYPES`, `LIST_TYPES`, `TABLE_TYPES`, `MEDIA_TYPES`, `FOOTNOTE_TYPES`, `LEAF_TYPES` — plus `MARK_TYPES` for inline marks. `types.test.ts` asserts these categories remain disjoint; if you add a new type, place it in exactly one array and update the test.

`SECTION_TYPES` is treated specially by `traversal.ts` (TOC building) — it's the set used to decide what counts as a numbered, titled section.

### Mark registry (`src/marks.ts`)

Inline marks (`strong`, `link`, `xref`, `footnote`, `stem`, …) are resolved through a `Map<string, MarkRenderer>` rather than a switch. `registerMark(type, renderer)` is an exported public API — downstream consumers can register custom marks or override built-ins. `resolveFirstMark` walks a mark list and returns the first registered one (relevant when text carries multiple marks; `<MirrorText>` renders only one element per text run). The `link` and `xref` renderers carry an `extractHref` function — `link` reads `attrs.target` first, then falls back to `attrs.href`.

### Vue layer (`src/vue/`)

`<MirrorNode>` is a recursive component that renders the node tree. It is a flat chain of `v-if`/`v-else-if` keyed on `node.type`, ending in a fallback `<div>` that renders children for any unrecognized type. Heading depth is tracked via the `depth` prop and capped at `h6`. Text nodes delegate to `<MirrorText>`, which picks a single HTML tag based on the first matching mark (with link/xref taking priority over formatting marks).

When adding a new node type: add it to the appropriate `_TYPES` array in `src/types.ts`, add a branch in `MirrorNode.vue`, and extend `tests/e2e/sample-data.ts` if the e2e suite should cover it.

### Math rendering (`src/math.ts`)

Formula nodes carry either pre-computed `mathml` (rendered directly via `v-html`) or `asciimath`/`math_text` (rendered as plain text by the Vue component). `renderFormula()` lazily `import()`s `@plurimath/plurimath` to convert asciimath → MathML; if the package isn't installed it falls back to the raw asciimath string. This dynamic import is why plurimath is a regular (non-optional) dependency but still externalized from the bundle.

### E2E test harness (`tests/e2e/`)

The e2e suite is isolated from the unit suite by a separate `vitest.config.e2e.ts` and `vite.config.e2e.ts`. The test boots a real Vite dev server serving `tests/e2e/{index.html,App.vue,main.ts}`, launches headless Puppeteer, then asserts on rendered DOM (`article.mirror-doc`, `.mirror-section h2`, `sub`/`sup` marks, anchor `href`s, etc.). Sample document lives in `sample-data.ts` — when component output changes, that file is the canonical fixture to update.

CSS classes follow a `mirror-<type>` convention (e.g. `mirror-paragraph`, `mirror-table`, `mirror-figure-caption`); the e2e selectors depend on these names.
