# AGENTS.md

## Project Purpose

This repository is a starter for authoring, previewing, and distributing open-source web components. The intended workflow is:

1. Author the component in `src/`
2. Bundle it into one browser-consumable JavaScript file
3. Exercise that built artifact through the shared demo page
4. Publish the demo to GitHub Pages
5. Publish the bundle as a GitHub Release artifact

## Design Principles

- Keep the project frameworkless unless a deliberate shift in scope is requested.
- Preserve the single-file distribution model for the public component artifact.
- Treat the demo page as both the local development playground and the published example site.
- Keep the demo aligned with the built artifact, not with source-only imports.
- Prefer minimal tooling and small dependency surfaces.
- Maintain native accessibility behavior where possible.
- Keep the starter generic and reusable rather than tailoring it to one app.

## Documentation Split

- `README.md` is for humans: setup, usage, workflows, and release instructions.
- `AGENTS.md` is for AI agents: project intent, guardrails, and implementation principles.

Do not move agent-specific instructions into `README.md` unless a human-facing reason is explicit.

## Editing Guardrails

- Preserve the custom-element-first architecture.
- Preserve the GitHub Pages + GitHub Release workflow unless intentionally redesigned.
- Avoid adding frameworks, transpilation layers, or runtime dependencies without a strong workflow reason.
- Keep public usage centered on importing one bundled JavaScript file in the browser.
- Preserve the example component's toggle behavior unless the example itself is intentionally being replaced.
- If the component API changes, update both the demo page and `README.md`.
- If build output paths change, update the GitHub workflows and the demo import path together.
