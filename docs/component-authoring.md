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
- `src/index.ts`
- `tsconfig.json`

Expected output is written to `dist/` by the shared build scripts.

## package.json pattern

Follow the same structure used by `packages/lumens-theme-button/package.json`:

- `name` set to the scoped package name
- `type: "module"`
- `license: "MIT"`
- `publishConfig.access: "public"`
- `files: ["dist"]`
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
  - `docs.initialMode`

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

Follow the same component authoring style used in `packages/lumens-theme-button/src/index.ts`:

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

## Checklist for a new component

1. Create `packages/lumens-<name>/`.
2. Add `package.json`, `src/index.ts`, and `tsconfig.json`.
3. Fill in `webComponent` metadata for docs rendering.
4. Implement and register the custom element.
5. Run:

```bash
pnpm run build
pnpm run check
```

6. Verify the new component appears in the shared docs app.
7. Add a changeset when the package is ready to release.
