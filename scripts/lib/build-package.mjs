import { build } from 'esbuild';
import { mkdir, readdir, readFile, rm } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import path from 'node:path';
import { promisify } from 'node:util';
import { rootDir } from './workspace.mjs';

const execFileAsync = promisify(execFile);

async function removeExtraDeclarationFiles(distDir) {
  const indexDeclarationPath = path.join(distDir, 'index.d.ts');
  const declarationSource = await readFile(indexDeclarationPath, 'utf8');

  if (/from ['"]\.\.?\//.test(declarationSource)) {
    throw new Error(
      `Expected ${path.relative(rootDir, indexDeclarationPath)} to be self-contained before pruning extra declaration files.`
    );
  }

  async function walk(currentDir) {
    const entries = await readdir(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const entryPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        await walk(entryPath);
        continue;
      }

      if (entry.name.endsWith('.d.ts.map')) {
        await rm(entryPath, { force: true });
        continue;
      }

      if (entry.name.endsWith('.d.ts') && entryPath !== indexDeclarationPath) {
        await rm(entryPath, { force: true });
      }
    }
  }

  await walk(distDir);
}

export async function buildPackage(component) {
  await rm(component.distDir, { force: true, recursive: true });
  await mkdir(component.distDir, { recursive: true });

  await build({
    bundle: true,
    entryPoints: [component.sourceEntry],
    format: 'esm',
    minify: true,
    outfile: path.join(component.distDir, 'index.js'),
    platform: 'browser',
    target: ['es2022'],
  });

  await build({
    bundle: true,
    entryPoints: [component.sourceEntry],
    format: 'esm',
    minify: true,
    outfile: path.join(component.distDir, component.bundleName),
    platform: 'browser',
    target: ['es2022'],
  });

  await execFileAsync(
    'pnpm',
    ['exec', 'tsc', '--project', component.tsconfigPath],
    { cwd: rootDir }
  );

  await removeExtraDeclarationFiles(component.distDir);
}
