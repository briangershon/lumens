# Lumens

Lumens is a monorepo for building, previewing, and distributing multiple open-source web components with shared tooling, a shared docs site, and independent package releases.

## What it includes

- `pnpm` workspaces for component packages and apps
- independently releasable scoped component packages in `packages/`
- a shared docs/playground app in `apps/docs`
- standalone browser bundles for direct `<script type="module">` usage
- Changesets for versioning and release automation
- GitHub Actions for GitHub Pages deployment, npm publishing, and release assets
- MIT licensing at the repo level

## Current packages

- `@briangershon/lumens-theme-button`

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
import '@briangershon/lumens-theme-button';

document
  .querySelector('lumens-theme-button')
  ?.addEventListener('clicked', (event) => {
    console.log(event.detail.mode);
  });
```

```html
<lumens-theme-button mode="dark">Theme toggle</lumens-theme-button>
```

### Browser bundle

```html
<script type="module" src="./lumens-theme-button.bundle.js"></script>
<lumens-theme-button mode="dark">Theme toggle</lumens-theme-button>
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

## Releasing a package

### First-time setup

1. Ensure the npm scope `@briangershon` is ready for publishing.
2. Run `npm login` locally with an account that has publish access to the `@briangershon` scope.
3. Build the package you want to publish:

```bash
pnpm run build
```

4. Publish that package manually once so it is established on npm. For the current package:

```bash
cd packages/lumens-theme-button
npm publish --access public
```

5. In npm package settings, enable Trusted Publishing for this GitHub repository/workflow so GitHub Actions can publish future releases without a stored npm token.
6. Ensure GitHub Actions is enabled for the repository.

Notes for the first manual publish:

- `npm publish --access public` is required for new scoped public packages.
- The package publishes from its own directory because each workspace package is released independently.
- You only need this manual bootstrap once per new package name.

### Standard release flow

1. Make changes to the package you want to release.
2. Create a changeset:

```bash
pnpm changeset
```

3. Select the package to release, such as `@briangershon/lumens-theme-button`.
4. Choose the version bump type: `patch`, `minor`, or `major`.
5. Commit the package changes and the generated changeset file.
6. Merge that branch to `main`.

Once the change reaches `main`, GitHub Actions will:

- build the workspace
- publish only the changed package to npm
- create the GitHub Release for that package version
- upload the package browser bundle as a release asset

This automated publish flow assumes npm Trusted Publishing has already been configured for the package.

### Manual fallback

If you ever need to publish manually instead of using the GitHub workflow:

```bash
pnpm changeset
pnpm run version-packages
pnpm run build
pnpm run release
```

This publishes from your local machine, so the GitHub Actions flow should remain the default.

## GitHub Pages

The GitHub Pages workflow builds `apps/docs/dist` and deploys it as the shared public demo site for all workspace components.
