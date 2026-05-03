# Publishing Guide

Use this guide when publishing a Lumens package to npm for the first time or cutting subsequent releases through Changesets.

## Release model

- Each package in `packages/` is published independently.
- Shared workspace builds produce both npm-consumable module output and a standalone browser bundle.
- Changesets drives versioning and release automation on `main`.
- Package `CHANGELOG.md` files are generated and updated automatically during versioning.
- GitHub Actions publishes changed packages to npm, creates GitHub Releases, and attaches package browser bundles as release assets.

## Before publishing any package

Verify the package's npm-facing contract before either a manual or automated publish:

```bash
pnpm run build
pnpm run check
cd packages/lumens-<name>
npm pack --dry-run
```

Check that:

- `dist/` contains the expected module entrypoint, types, and browser bundle.
- The package `README.md` matches the shipped API and examples.
- `repository`, `homepage`, and `bugs` metadata are valid.
- The packed tarball does not include unrelated workspace files, secrets, or local-only fixtures.

## First-time publish for a new package

Use a one-time manual publish to establish a new scoped package on npm before CI takes over future releases.

1. Ensure the npm scope `@briangershon` is ready for publishing.
2. Run `npm login` locally with an account that has publish access to the `@briangershon` scope.
3. Build and verify the workspace from the repo root:

```bash
pnpm run build
pnpm run check
```

4. Review the package contents from the package directory:

```bash
cd packages/lumens-<name>
npm pack --dry-run
```

5. Publish the package manually once from that package directory:

```bash
npm publish --access public --provenance=false
```

Notes:

- `npm publish --access public` is required for a new scoped public package.
- `--provenance=false` is required for the first manual local publish because npm cannot generate provenance outside a supported CI provider.
- npm may open or print an `Authenticate your account at ...` link during publish; complete that browser verification flow if prompted.
- Publish from the package directory because workspace packages are released independently.
- You only need this manual bootstrap once per package name.

## Configure Trusted Publishing

After the first manual publish succeeds:

1. Open the package settings in npm.
2. Enable Trusted Publishing for this GitHub repository and its release workflow.
3. Ensure GitHub Actions is enabled for the repository.
4. In GitHub repository settings, allow GitHub Actions to create pull requests:
   `Settings > Actions > General > Workflow permissions > Allow GitHub Actions to create and approve pull requests`

The release workflow already expects Trusted Publishing and requests `id-token: write` so npm provenance can be generated automatically.
The Changesets release workflow also needs pull request creation enabled so it can open and update the release PR on `main`.

## Subsequent releases with Changesets

After Trusted Publishing is configured, use the normal release flow:

1. Make changes to the package you want to release.
2. Create a changeset:

```bash
pnpm changeset
```

3. Select the package, such as `@briangershon/lumens-starmap-banner`.
4. Choose the version bump type: `patch`, `minor`, or `major`.
5. Commit the package changes and the generated changeset file.
6. Merge that branch to `main`.

Once the change reaches `main`, GitHub Actions will:

- build the workspace
- open or update the Changesets release PR with the bumped package versions
- update or create the released package `CHANGELOG.md` files

When you are ready to publish, merge the generated release PR. On that subsequent `main` run, GitHub Actions will:

- build the workspace again
- publish only the changed package to npm
- create the GitHub Release for that package version
- upload the package browser bundle as a release asset

This is the recommended default because the `.changeset/*.md` file stays visible in feature PR review and release timing remains explicit.

If you intentionally want publish-on-merge for a specific release, you can still run `pnpm run version-packages` locally before merging. That bypasses the release PR for that branch and lets the next `main` push publish immediately.

## Manual fallback release

If CI cannot publish and you intentionally need a local release instead:

```bash
pnpm changeset
pnpm run version-packages
pnpm run build
pnpm run release
```

This publishes from your local machine. Keep the GitHub Actions flow as the default path when possible.
