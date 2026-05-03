import { cp, mkdir, readdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { build } from 'esbuild';
import {
  docsDistDir,
  docsSrcDir,
  getComponentPackages,
  getDocsComponents,
  rootDir,
} from './lib/workspace.mjs';

const packageComponents = await getComponentPackages();
const components = await getDocsComponents(packageComponents);
const assetsDir = path.join(docsDistDir, 'assets');
const manifest = [];

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

for (const component of components) {
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

  manifest.push({
    packageName: component.packageName,
    displayName: component.displayName,
    description: component.description,
    tagName: component.tagName,
    bundlePath: `./assets/${component.dirName}/${component.bundleName}`,
    browserBundleName: component.bundleName,
    summary: component.summary,
    preview: component.preview,
    gettingStarted: component.gettingStarted,
  });
}

await writeFile(
  path.join(docsDistDir, 'components.json'),
  `${JSON.stringify(manifest, null, 2)}\n`
);

console.log(`Built docs app in ${path.relative(rootDir, docsDistDir)}/`);
