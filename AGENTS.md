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
- Prefix Lumens-owned component names consistently with `lumens`.
- Preserve independent package releases.
- Preserve the standalone browser bundle for every published component package.
- Treat `apps/docs` as both the development playground and the public Pages site.
- Keep docs aligned with built package artifacts, not source-only imports.
- Prefer shared tooling at the root over per-package custom tooling unless divergence is justified.
- Keep dependencies minimal and explicit per package.
- Maintain native accessibility behavior where possible.

## Documentation Split

- `README.md` is for humans: setup, workspace usage, package consumption, and release flow.
- `AGENTS.md` is for AI agents: repo intent, guardrails, and implementation conventions.

Do not move agent-specific instructions into `README.md` unless there is a human-facing reason.

## Editing Guardrails

- Preserve the `pnpm` workspace structure.
- Preserve `packages/` for publishable components and `apps/docs` for the shared docs app.
- Preserve Changesets as the release/versioning mechanism unless the release strategy is intentionally redesigned.
- Use Node.js 24 consistently in GitHub Actions unless the repo intentionally changes its runtime baseline.
- Name Lumens component packages and custom element tags with the `lumens` prefix, for example `@briangershon/lumens-theme-button` and `lumens-theme-button`.
- Keep public package usage centered on importing scoped packages or per-package browser bundles.
- If a package API changes, update its docs/demo presentation in `apps/docs` and the root `README.md`.
- When rendering code examples inside the docs page's inline script, do not embed a literal `</script>` sequence in the source; generate it indirectly so the browser does not terminate the script early.
- If bundle paths or dist contracts change, update the docs build and release workflows together.
- GitHub Pages may require a one-time manual enablement in GitHub before the workflow can publish successfully. In repository settings, use `Settings > Pages > Build and deployment > Source > GitHub Actions` as the publishing source; preserve that assumption when troubleshooting Pages setup.
- Avoid introducing Turborepo, Nx, or a framework-heavy docs stack without a clear scaling reason.
