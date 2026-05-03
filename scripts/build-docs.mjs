import { cp, mkdir, readdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { build } from 'esbuild';
import {
  docsDistDir,
  docsSrcDir,
  getComponentPackages,
  rootDir,
} from './lib/workspace.mjs';

const packageComponents = await getComponentPackages();
const assetsDir = path.join(docsDistDir, 'assets');

async function copyDocsSource() {
  await mkdir(docsDistDir, { recursive: true });
  const entries = await readdir(docsSrcDir, { withFileTypes: true });

  for (const entry of entries) {
    await cp(
      path.join(docsSrcDir, entry.name),
      path.join(docsDistDir, entry.name),
      { recursive: entry.isDirectory() }
    );
  }
}

await rm(docsDistDir, { force: true, recursive: true });
await copyDocsSource();
await mkdir(assetsDir, { recursive: true });

for (const component of packageComponents) {
  const componentAssetDir = path.join(assetsDir, component.dirName);
  const componentBundlePath = path.join(
    componentAssetDir,
    component.bundleName
  );

  await mkdir(componentAssetDir, { recursive: true });
  await build({
    bundle: true,
    entryPoints: [component.sourceEntry],
    format: 'esm',
    minify: true,
    outfile: componentBundlePath,
    platform: 'browser',
    target: ['es2022'],
  });
}

console.log(`Built docs app in ${path.relative(rootDir, docsDistDir)}/`);
