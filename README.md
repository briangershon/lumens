# Web Components Monorepo

Monorepo for building, previewing, and distributing multiple open-source web components with shared tooling, a shared docs site, and independent package releases.

## What it includes

- `pnpm` workspaces for component packages and apps
- independently releasable scoped component packages in `packages/`
- a shared docs/playground app in `apps/docs`
- standalone browser bundles for direct `<script type="module">` usage
- Changesets for versioning and release automation
- GitHub Actions for GitHub Pages deployment, npm publishing, and release assets
- MIT licensing at the repo level

## Current packages

- `@web-components-monorepo/demo-theme-button`

The first package is a theme-toggle web component that:

- supports `light` and `dark` modes
- tracks its own current mode and flips on click
- shows a sun icon in light mode and a moon icon in dark mode
- emits a `clicked` event with the newly selected mode

## Workspace layout

```text
apps/docs            Shared GitHub Pages docs and development playground
packages/*           Publishable web component packages
scripts/             Shared build, dev, and release tooling
```

## Local development

Install dependencies:

```bash
pnpm install
```

Run the shared docs playground:

```bash
pnpm run dev
```

This starts the docs app at `http://localhost:4173` and watches component source files so the browser-bundle demos stay current.

## Build

Build all component packages and the docs app:

```bash
pnpm run build
```

Useful build targets:

```bash
pnpm run build:packages
pnpm run build:docs
```

Outputs:

- `packages/*/dist/` for package entrypoints, types, and browser bundles
- `apps/docs/dist/` for the publishable GitHub Pages site

## Formatting

Format the repository:

```bash
pnpm run format
```

Check formatting:

```bash
pnpm run format:check
```

## Using a component

### npm package

```ts
import '@web-components-monorepo/demo-theme-button';

document
  .querySelector('demo-theme-button')
  ?.addEventListener('clicked', (event) => {
    console.log(event.detail.mode);
  });
```

```html
<demo-theme-button mode="dark">Theme toggle</demo-theme-button>
```

### Browser bundle

```html
<script type="module" src="./demo-theme-button.bundle.js"></script>
<demo-theme-button mode="dark">Theme toggle</demo-theme-button>
```

## Versioning and releases

Create a changeset for package changes:

```bash
pnpm changeset
```

Version packages locally:

```bash
pnpm run version-packages
```

Release automation is driven by Changesets on `main`:

- changed packages are versioned independently
- packages are published to npm
- GitHub Releases are created for published package tags
- each published package gets its standalone browser bundle attached as a release asset

## GitHub Pages

The GitHub Pages workflow builds `apps/docs/dist` and deploys it as the shared public demo site for all workspace components.
