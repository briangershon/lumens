import path from 'node:path';
import { appendFile } from 'node:fs/promises';
import { getComponentPackages, rootDir } from './lib/workspace.mjs';

const tagName = process.argv[2];

if (!tagName) {
  throw new Error('Expected a release tag name argument.');
}

const versionSeparator = tagName.lastIndexOf('@');
const packageName = tagName.slice(0, versionSeparator);
const components = await getComponentPackages();
const component = components.find((entry) => entry.packageName === packageName);

if (!component) {
  throw new Error(
    `Could not resolve a component package for tag "${tagName}".`
  );
}

const assetPath = path.relative(
  rootDir,
  path.join(component.distDir, component.bundleName)
);

if (process.env.GITHUB_OUTPUT) {
  await appendFile(process.env.GITHUB_OUTPUT, `path=${assetPath}\n`);
} else {
  console.log(assetPath);
}
