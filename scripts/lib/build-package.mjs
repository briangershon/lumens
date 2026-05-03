import { build } from 'esbuild';
import { mkdir, rm } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import path from 'node:path';
import { promisify } from 'node:util';
import { rootDir } from './workspace.mjs';

const execFileAsync = promisify(execFile);

export async function buildPackage(component) {
  await rm(component.distDir, { force: true, recursive: true });
  await mkdir(component.distDir, { recursive: true });

  await build({
    bundle: true,
    entryPoints: [component.sourceEntry],
    format: 'esm',
    minify: false,
    outfile: path.join(component.distDir, 'index.js'),
    platform: 'browser',
    sourcemap: true,
    target: ['es2022'],
  });

  await build({
    bundle: true,
    entryPoints: [component.sourceEntry],
    format: 'esm',
    minify: false,
    outfile: path.join(component.distDir, component.bundleName),
    platform: 'browser',
    sourcemap: true,
    target: ['es2022'],
  });

  await execFileAsync(
    'pnpm',
    ['exec', 'tsc', '--project', component.tsconfigPath],
    { cwd: rootDir }
  );
}
