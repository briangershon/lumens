# AGENTS.md

## Project Purpose

This repository is Lumens, a monorepo for building, testing, previewing, and releasing multiple web components from one shared workspace. The intended workflow is:

1. Author components inside `packages/`
2. Build each package into npm-consumable module output and a standalone browser bundle
3. Preview packages together through the shared docs app in `apps/docs`
4. Publish the docs app to GitHub Pages
5. Publish changed packages to npm with Changesets
6. Attach package browser bundles to GitHub Releases

## Design Principles

- Keep components frameworkless unless a deliberate scope change is requested.
- Refer to Lumens as a library or collection of web components, not as a company, person, or actor that "builds" things.
- Prefix Lumens-owned component names consistently with `lumens`.
- Preserve independent package releases.
- Preserve the standalone browser bundle for every published component package.
- Treat `apps/docs` as both the development playground and the public Pages site.
- Keep docs aligned with built package artifacts, not source-only imports.
- Prefer shared tooling at the root over per-package custom tooling unless divergence is justified.
- Keep dependencies minimal and explicit per package.
- Maintain native accessibility behavior where possible.

## Documentation Split

- `README.md` is the repo-level human entrypoint: what Lumens is, the current package set, quick-start guidance, and development/release flow.
- `AGENTS.md` is for AI agents: repo intent, guardrails, and implementation conventions.
- `apps/docs` is the canonical consumer install-and-use documentation surface for both humans and LLMs.
- package `README.md` files are npm-facing package summaries and API reference surfaces, not the main end-to-end usage tutorial.
- `docs/component-authoring.md` is the reusable package-authoring playbook for creating new Lumens components.
- `docs/publishing.md` is the canonical publishing playbook for first-time npm publishes, Trusted Publishing setup, and subsequent Changesets releases.

Do not move agent-specific instructions into `README.md` unless there is a human-facing reason.

## Docs Conventions

- Treat `apps/docs/src/index.html` as the visual docs index: discovery, positioning, preview, and links into component-specific guides.
- Give each published component its own dedicated canonical docs page under `apps/docs/src/components/`.
- Optimize each component page to work as an LLM base and a human reference from one URL.
- Keep the component page structure explicit and stable. At minimum include:
  - component identity
  - one-sentence purpose
  - install command
  - import statement
  - minimal markup example
  - browser-bundle usage
  - attributes
  - properties
  - events
  - one starter integration example
  - behavior or host-layout expectations when relevant
- Prefer explicit HTML content on component pages over manifest-driven API generation.
- Use stable fragment anchors on component pages for key sections such as install, properties, events, and example.
- If a package API changes, update its dedicated docs page, package `README.md`, and relevant index links together.

## Editing Guardrails

- Preserve the `pnpm` workspace structure.
- Preserve `packages/` for publishable components and `apps/docs` for the shared docs app.
- When creating a new component package, follow `docs/component-authoring.md`.
- Preserve Changesets as the release/versioning mechanism unless the release strategy is intentionally redesigned.
- Use Node.js 24 consistently in GitHub Actions unless the repo intentionally changes its runtime baseline.
- Keep GitHub Actions dependencies on Node-24-compatible majors; currently that means `actions/checkout@v6`, `actions/setup-node@v6`, `pnpm/action-setup@v6`, and `actions/upload-pages-artifact@v4`.
- Name Lumens component packages and custom element tags with the `lumens` prefix, for example `@briangershon/lumens-starmap-banner` and `lumens-starmap-banner`.
- Keep public package usage centered on importing scoped packages or per-package browser bundles.
- Prefer linking duplicated consumer install/use guidance back to `apps/docs` instead of copying the same walkthrough into multiple files.
- If a package API changes, update its docs/demo presentation in `apps/docs` and the root `README.md`.
- Preserve the docs pattern of one visual index plus one canonical page per component unless the docs architecture is intentionally redesigned.
- When rendering code examples inside the docs page's inline script, do not embed a literal `</script>` sequence in the source; generate it indirectly so the browser does not terminate the script early.
- If bundle paths or dist contracts change, update the docs build and release workflows together.
- GitHub Pages may require a one-time manual enablement in GitHub before the workflow can publish successfully. In repository settings, use `Settings > Pages > Build and deployment > Source > GitHub Actions` as the publishing source; preserve that assumption when troubleshooting Pages setup.
- Avoid introducing Turborepo, Nx, or a framework-heavy docs stack without a clear scaling reason.
