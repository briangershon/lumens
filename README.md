# Lumens

Lumens distributes open-source web components that focus on visualizations. The aim is to make browser-native components that add motion, atmosphere, and interactive discovery to editorial pages, product surfaces, and exploratory interfaces without requiring a framework.

## What Lumens is for

- visualization-driven custom elements for storytelling and interface ornament
- installable npm packages with browser-ready standalone bundles
- components that stay transparent to the host layout instead of owning the whole page
- open-source primitives that can be reused across sites, demos, and experiments

## Current direction

Lumens currently leads with `@briangershon/lumens-starmap-banner`, an interactive astronomical banner component:

- visible stars and constellations layered into a transparent animated sky
- exotic unseen objects such as black holes mixed into the same field
- hover interactions that surface richer astronomical object details
- light and dark host support through attribute-level configuration

The starmap banner is the first package, but it represents the broader design direction for the repo: expressive web components that turn visual systems into reusable browser-native building blocks.

## Using a component

### npm package

```ts
import '@briangershon/lumens-starmap-banner';

document
  .querySelector('lumens-starmap-banner')
  ?.addEventListener('starmap-object-selected', (event) => {
    if (!event.detail.selected) return;
    console.log(event.detail.name, event.detail.type);
  });
```

```html
<lumens-starmap-banner
  dark-mode
  speed="1800"
  label-limit="14"
  start-time="2026-01-15T05:00:00Z"
></lumens-starmap-banner>
```

### Browser bundle

```html
<script type="module" src="./lumens-starmap-banner.bundle.js"></script>

<lumens-starmap-banner
  speed="1800"
  label-limit="14"
  start-time="2026-01-15T05:00:00Z"
></lumens-starmap-banner>
```

## Explore the docs

`apps/docs` is the shared public showcase and development playground. It loads built package artifacts rather than source-only imports so the demos reflect what consumers actually install.

Run it locally:

```bash
pnpm install
pnpm run dev
```

This starts the docs app at `http://localhost:4173` and watches component source files so the browser-bundle demos stay current.

## Development and publishing

Lumens uses a shared workspace so multiple visualization components can be authored, previewed, and released from one repository while preserving independent package versions.

```text
apps/docs            Shared GitHub Pages showcase and development playground
packages/*           Publishable visualization component packages
scripts/             Shared build, dev, and release tooling
```

Build everything:

```bash
pnpm run build
```

Useful targets:

```bash
pnpm run build:packages
pnpm run build:docs
```

Outputs:

- `packages/*/dist/` for package entrypoints, types, and browser bundles
- `apps/docs/dist/` for the publishable GitHub Pages site

Format the repository:

```bash
pnpm run format
pnpm run format:check
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
cd packages/lumens-starmap-banner
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

3. Select the package to release, such as `@briangershon/lumens-starmap-banner`.
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

The GitHub Pages workflow builds `apps/docs/dist` and deploys it as the shared public showcase for Lumens components.
