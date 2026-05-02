# Web Component Starter

Starter repository for building, previewing, and distributing an open-source web component with a single-file JavaScript bundle.

## What it includes

- A frameworkless custom element written in TypeScript
- A single bundled browser artifact in `dist/`
- A shared demo/playground page used locally and published to GitHub Pages
- A GitHub Actions workflow for deploying the demo page
- A GitHub Actions workflow for attaching the built bundle to GitHub Releases
- An MIT license

## Included example

The initial component is `demo-theme-button`, a theme-toggle web component that:

- supports `light` and `dark` modes
- keeps track of its current mode and flips modes on click
- shows a sun icon in light mode and a moon icon in dark mode
- emits a `clicked` event with the newly selected mode when activated

## Local development

Install dependencies:

```bash
npm install
```

Run the local playground:

```bash
npm run dev
```

This starts a local server at `http://localhost:4173` and rebuilds the bundle when `src/` changes. The served page is the same demo that gets published to GitHub Pages.

## Build

Create the release bundle and demo site:

```bash
npm run build
```

Build output:

- `dist/demo-theme-button.js`
- `site/index.html`
- `site/assets/demo-theme-button.js`

## Formatting

Format the repository:

```bash
npm run format
```

Check formatting in CI:

```bash
npm run format:check
```

## Using the component

Import the bundled file in a browser page:

```html
<script type="module" src="./demo-theme-button.js"></script>

<demo-theme-button mode="dark">Theme toggle</demo-theme-button>

<script type="module">
  document
    .querySelector('demo-theme-button')
    ?.addEventListener('clicked', (event) => {
      console.log('clicked detail', event.detail);
    });
</script>
```

Public API:

- Tag name: `demo-theme-button`
- Attribute/property: `mode="light" | "dark"` for the current selected mode
- Event: `clicked` with `detail.mode` set to the selected mode after toggle

## GitHub Pages

The GitHub Pages workflow builds the component and publishes the generated `site/` directory. The demo page consumes the built bundle from `site/assets/`, so the published site exercises the same output shape as local development.

## GitHub Releases

The release workflow runs when you push a version tag such as:

```bash
git tag v0.1.0
git push origin v0.1.0
```

On tag builds, GitHub Actions creates or updates a GitHub Release and uploads `dist/demo-theme-button.js` as the release artifact.
