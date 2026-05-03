import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { build } from 'esbuild';
import {
  docsDistDir,
  docsSrcDir,
  getComponentPackages,
  rootDir,
} from './lib/workspace.mjs';

const components = await getComponentPackages();
const assetsDir = path.join(docsDistDir, 'assets');
const manifest = [];

await rm(docsDistDir, { force: true, recursive: true });
await mkdir(assetsDir, { recursive: true });

await cp(
  path.join(docsSrcDir, 'index.html'),
  path.join(docsDistDir, 'index.html')
);

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
    docs: component.docs,
  });
}

await writeFile(
  path.join(docsDistDir, 'components.json'),
  `${JSON.stringify(manifest, null, 2)}\n`
);

console.log(`Built docs app in ${path.relative(rootDir, docsDistDir)}/`);
