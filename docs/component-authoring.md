# Component Authoring Guide

Use this guide when creating a new Lumens component package.

## Naming

- Package directory: `packages/lumens-<name>`
- npm package name: `@briangershon/lumens-<name>`
- Custom element tag: `lumens-<name>`
- Browser bundle name: `lumens-<name>.bundle.js`

Keep the package name, tag name, and bundle name aligned.

## Required package layout

Each component package should include:

- `package.json`
- `README.md`
- `src/index.ts`
- `tsconfig.json`

Expected output is written to `dist/` by the shared build scripts.

## Package README

Each published package should include a package-root `README.md`.

- npm renders the package-root `README.md` on that package's registry page
- keep it package-specific rather than workspace-wide
- update it when the package API, examples, or usage guidance changes
- note that npm only refreshes the rendered README when you publish a new version

At minimum, each package README should include:

- what the component does
- install/import instructions for the scoped package
- browser-bundle usage for direct `<script type="module">` consumers
- a basic HTML example
- important attributes, properties, and emitted events
- a link back to the shared docs/demo site
- a short license note or link

## package.json pattern

Follow the same structure used by existing packages in `packages/`:

- `name` set to the scoped package name
- `description` set to a concise npm-facing summary
- `type: "module"`
- `license: "MIT"`
- `publishConfig.access: "public"`
- `repository` pointed at the GitHub repo
- `homepage` pointed at the public docs or repo README
- `bugs` pointed at the repo issue tracker
- `files: ["dist"]`
- `keywords` chosen for npm search relevance
- `exports` for:
  - the main module entry (`./dist/index.js`)
  - the standalone browser bundle (`./dist/lumens-<name>.bundle.js`)
- `main`, `module`, and `types` pointed at `dist`
- `webComponent` metadata with:
  - `tagName`
  - `bundleName`
  - `displayName`
  - `docs.summary`
  - `docs.slotText`
  - `docs.preview`

The docs app consumes this `webComponent` metadata through the generated `components.json` manifest.

## tsconfig pattern

Follow the same package-local `tsconfig.json` shape:

- extend `../../tsconfig.base.json`
- set `rootDir` to `src`
- set `outDir` to `dist`
- enable declaration output with:
  - `declaration`
  - `declarationMap`
  - `emitDeclarationOnly`

## Component implementation pattern

Follow the same component authoring style used in existing package entrypoints under `packages/*/src/index.ts`:

- define the component in `src/index.ts`
- register one custom element from that entrypoint
- use Shadow DOM
- render from a `template` element
- keep attribute/property synchronization explicit
- use `observedAttributes` when the component reflects attributes
- guard `customElements.define(...)` so repeated imports do not throw
- emit `CustomEvent`s with stable, minimal payloads
- preserve native accessibility behavior whenever possible

## Release and docs expectations

Every component package should work with the shared monorepo flows without package-specific build scripts:

- shared build scripts create:
  - module output in `dist/index.js`
  - declaration output in `dist/index.d.ts`
  - standalone browser bundle in `dist/lumens-<name>.bundle.js`
- shared docs build copies the browser bundle into `apps/docs/dist/assets/...`
- the docs app should automatically render a component card from package metadata

## npm publishing expectations

Before publishing a package, verify the npm-facing package contract:

- run `pnpm run build` and `pnpm run check`
- review the publish contents with `npm pack --dry-run` from the package directory
- keep the published archive minimal with `files` and ignore rules
- do not publish secrets, local fixtures, or unrelated workspace files
- ensure the package README matches the shipped API and examples
- keep `repository`, `homepage`, and `bugs` links valid
- use `npm publish --access public` for the first manual publish of a scoped public package
- prefer trusted publishing in GitHub Actions so npm provenance is generated automatically
- keep maintainer publishing access protected with npm 2FA

## Checklist for a new component

1. Create `packages/lumens-<name>/`.
2. Add `package.json`, `README.md`, `src/index.ts`, and `tsconfig.json`.
3. Fill in npm-facing metadata, including `description`, `keywords`, `repository`, `homepage`, and `bugs`.
4. Fill in `webComponent` metadata for docs rendering.
5. Implement and register the custom element.
6. Run:

```bash
pnpm run build
pnpm run check
```

7. Review package contents with `npm pack --dry-run`.
8. Verify the new component appears in the shared docs app.
9. Add a changeset when the package is ready to release.
