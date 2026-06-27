# Candidate 3 — Formula path consolidation

## Problem

Today there are two parallel paths for getting formula content out of a `formula` node:

1. **Sync extract** — `extractFormulaAttrs(node)` returns `{ mathml, asciimath, number }`.
   `FormulaRenderer.vue` reads this synchronously and renders `mathml` via `v-html`
   when present, otherwise prints the raw asciimath string. AsciiMath → MathML
   conversion never happens in the Vue layer.
2. **Async convert** — `renderFormula(node)` returns a `Promise<string>`. It uses
   `extractFormulaAttrs` internally, then lazy-imports `@plurimath/plurimath` to
   convert asciimath → MathML when no pre-computed `mathml` is present.

Both are exported from `src/index.ts`. Tests cover both. The Vue renderer
quietly ignores the async path, so a formula authored as `asciimath` renders as
the literal string `"E = mc^2"` instead of math.

## Decision

Pick **Option A**: the Vue renderer uses `renderFormula`. `extractFormulaAttrs`
becomes an internal helper (no longer re-exported from the package entry).

This gives every consumer — Vue or not — one consistent behavior: asciimath is
auto-converted to MathML when plurimath is installed, with the raw string as a
fallback. Pre-computed `mathml` short-circuits the conversion.

## Design

### `FormulaRenderer.vue`

- Replace the synchronous computed mathml/asciimath with a single
  `ref<string>` holding the rendered output.
- Call `renderFormula(props.node)` inside a `watch` keyed on `props.node`, so
  re-renders triggered by parent prop changes re-run the conversion.
- **Race protection.** Async conversions can resolve out of order if `props.node`
  changes while a previous plurimath import is still pending. Use a monotonically
  increasing token; only commit results when the resolving call's token still
  matches the latest one.
- Render the committed string via `v-html` (MathML is trusted pre-computed
  output, same trust boundary as today).
- Render `number` synchronously (it's a plain string attr, no async work).
- While the first async resolution is pending, `display.value` is the empty
  string — the surrounding `.mirror-formula` container still renders, just with
  no inner content for a microtask. This matches the existing fallback
  (`v-if="mathml"`) which also renders nothing when mathml is absent.

### `src/math.ts`

No behavioral changes. `extractFormulaAttrs` stays as the internal helper used
by `renderFormula`.

### `src/index.ts`

Drop `extractFormulaAttrs` from the public export list. `renderFormula` and
`FormulaDisplay` remain.

### `tests/math.test.ts`

- Keep the existing `extractFormulaAttrs` block (the function still exists, just
  not exported from the package entry — its direct module export is intact).
- Replace the loose `result.length > 0` assertion with an explicit assertion
  that `renderFormula` of an asciimath-only formula returns MathML when
  plurimath is available: `expect(result).toMatch(/<math[\s>]/)`. The fallback
  path (plurimath missing) still returns the raw string, so also assert that
  the result is non-empty and contains the source characters as a floor.

### `tests/e2e/sample-data.ts`

Add a second `formula` node inside the `#tables` clause carrying only
`asciimath` (no `mathml`). Example:

```ts
{
  type: 'formula',
  attrs: { asciimath: 'MPE_(t) = a + b t + c t^2', number: '2' },
}
```

The existing mathml-carrying formula keeps its `number: '1'` for stability.

### `tests/e2e/rendering.test.ts`

The existing formula assertion uses unscoped selectors
(`.mirror-formula-content math`, `.mirror-formula-number`). After adding the
second formula, scope those to `#tables` and tighten them to be the first
match. Add a second test that waits for the asciimath formula to convert and
asserts its `<math>` element renders — using `waitForSelector` to allow the
async plurimath import to settle.

## Out of scope

- Caching repeated conversions of the same asciimath input — premature until a
  profile shows plurimath cost is real.
- A `<math>` fallback when plurimath is unavailable — already covered by
  `renderFormula` returning the raw string; the existing `.mirror-formula-
  content` text fallback in the template goes away because `v-html="raw
  asciimath"` would render it as text content of the div, which is acceptable
  (the raw string is what we want shown when conversion is impossible).
- Adding number formatting, localization, or styling hooks — separate concern.

## Verification

- `npm run lint`
- `npm test` — unit tests, including the tightened math assertions
- `npm run test:e2e` — both formulas render to `<math>`
- `npx tsc --noEmit` — no leaked type errors from the renderer change
- Manual check: `git diff src/index.ts` should show only the dropped export
  line; `git diff src/vue/renderers/FormulaRenderer.vue` should show the
  watcher swap.
