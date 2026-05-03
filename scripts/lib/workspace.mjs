import { access, readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const moduleDir = path.dirname(fileURLToPath(import.meta.url));

export const rootDir = path.resolve(moduleDir, '../..');
export const packagesDir = path.join(rootDir, 'packages');
export const docsAppDir = path.join(rootDir, 'apps', 'docs');
export const docsSrcDir = path.join(docsAppDir, 'src');
export const docsDistDir = path.join(docsAppDir, 'dist');
export const docsComponentsPath = path.join(docsSrcDir, 'components.mjs');

async function fileExists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function getComponentPackages() {
  const directoryEntries = await readdir(packagesDir, { withFileTypes: true });
  const components = [];

  for (const entry of directoryEntries) {
    if (!entry.isDirectory()) {
      continue;
    }

    const packageDir = path.join(packagesDir, entry.name);
    const manifestPath = path.join(packageDir, 'package.json');

    if (!(await fileExists(manifestPath))) {
      continue;
    }

    const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
    const bundleExport = manifest.exports?.['./bundle'];
    const bundlePath =
      typeof bundleExport === 'string'
        ? bundleExport
        : (bundleExport?.default ?? bundleExport?.import);

    components.push({
      dirName: entry.name,
      dir: packageDir,
      distDir: path.join(packageDir, 'dist'),
      manifest,
      packageName: manifest.name,
      description: manifest.description ?? '',
      sourceEntry: path.join(packageDir, 'src', 'index.ts'),
      tsconfigPath: path.join(packageDir, 'tsconfig.json'),
      bundleName: bundlePath
        ? path.basename(bundlePath)
        : `${entry.name}.bundle.js`,
    });
  }

  components.sort((left, right) => left.dirName.localeCompare(right.dirName));

  return components;
}

export async function getDocsComponentDefinitions() {
  const { components } = await import(
    `${pathToFileURL(docsComponentsPath).href}?t=${Date.now()}`
  );

  return components;
}

export async function getDocsComponents(componentPackages = null) {
  const packageComponents = componentPackages ?? (await getComponentPackages());
  const docsComponents = await getDocsComponentDefinitions();
  const packagesByName = new Map(
    packageComponents.map((component) => [component.packageName, component])
  );

  return docsComponents.map((docsComponent) => {
    const packageComponent = packagesByName.get(docsComponent.packageName);

    if (!packageComponent) {
      throw new Error(
        `Docs component "${docsComponent.packageName}" does not match a workspace package.`
      );
    }

    return {
      ...packageComponent,
      ...docsComponent,
    };
  });
}
