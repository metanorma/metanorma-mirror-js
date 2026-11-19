# Contributing

Contributions are welcome! Here's how to get started.

## Setup

```bash
git clone https://github.com/metanorma/metanorma-mirror-js.git
cd metanorma-mirror-js
npm install
```

Requires **Node.js 20+**.

## Development

```bash
npm run build          # vite build → dist/ + .d.ts via vite-plugin-dts
npm test               # vitest unit tests
npm run test:e2e       # puppeteer e2e
npm run test:all       # both suites
npm run clean          # rm -rf dist
```

Run a single unit test file:

```bash
npx vitest run tests/marks.test.ts
```

Filter tests by name:

```bash
npx vitest run tests/traversal.test.ts -t "buildToc"
```

## Project layout

- `src/` — TypeScript source for the core library
- `src/vue/` — Vue 3 components (`MirrorNode`, `MirrorText`)
- `tests/` — vitest unit tests
- `tests/e2e/` — Puppeteer-driven browser tests against a real Vite dev server

The library is built with Vite in lib mode and emits dual ESM/CJS outputs plus `.d.ts` declarations via `vite-plugin-dts`. Only `dist/` is published to npm.

## Pull requests

- Keep PRs focused on a single concern.
- Add or update tests for any changed behavior.
- Run `npm run build && npm test` before pushing — CI runs the same checks.
- When adding a new node type, update the appropriate `_TYPES` array in `src/types.ts`, add a branch in `src/vue/MirrorNode.vue`, and extend `tests/e2e/sample-data.ts` if the e2e suite should cover it.

## Releasing

Releases are automated through GitHub Actions on `v*` tag push. To cut a release:

1. Update `version` in `package.json` (use semver; beta tags like `0.1.0-beta.1` are allowed).
2. Commit the version bump on `main` through a PR.
3. Tag as `vX.Y.Z` (or `v0.1.0-beta.1`) and push the tag — the **Release** workflow will publish to npm with provenance and create the GitHub release.
4. For ad-hoc releases (e.g. republishing after a failed publish), use the workflow's `workflow_dispatch` input.

## Ribose Contributor License Agreement

Before your first pull request can be merged in any Ribose GitHub
organization, you need to be covered by the Ribose Contributor License
Agreement (CLA). Sign once; one signature covers every Ribose
organization.

- **Individual contributors** — sign the Individual CLA at
  <https://cla.ribose.com/icla>. The `cla/ribose` check on your pull
  request reports the state, and you can also sign from the pull request
  by commenting `@ribose-cla agree` and completing the one-click link
  the App replies with.
- **Corporate contributors** — if your employer has an executed
  Organization CLA, the employer's Point of Contact adds your GitHub
  handle to its Schedule A at
  <https://cla.ribose.com/organizations>, or you can request coverage
  there yourself. No individual signature is then needed.
- **The full guide** — the signing flows and the agreement text are at
  <https://github.com/riboseinc/cla/blob/main/docs/SIGNING.md>.
