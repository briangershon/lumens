import { access, readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const rootDir = path.resolve(__dirname, '../..');
export const packagesDir = path.join(rootDir, 'packages');
export const docsAppDir = path.join(rootDir, 'apps', 'docs');
export const docsSrcDir = path.join(docsAppDir, 'src');
export const docsDistDir = path.join(docsAppDir, 'dist');

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
    const webComponent = manifest.webComponent ?? {};
    const docs = webComponent.docs ?? {};

    components.push({
      dirName: entry.name,
      dir: packageDir,
      distDir: path.join(packageDir, 'dist'),
      manifest,
      packageName: manifest.name,
      description: manifest.description ?? '',
      sourceEntry: path.join(packageDir, 'src', 'index.ts'),
      tsconfigPath: path.join(packageDir, 'tsconfig.json'),
      bundleName: webComponent.bundleName ?? `${entry.name}.bundle.js`,
      tagName: webComponent.tagName ?? entry.name,
      displayName: webComponent.displayName ?? entry.name,
      docs: {
        summary: docs.summary ?? manifest.description ?? '',
        slotText: docs.slotText ?? webComponent.displayName ?? entry.name,
        initialMode: docs.initialMode ?? 'light',
      },
    });
  }

  components.sort((left, right) => left.dirName.localeCompare(right.dirName));

  return components;
}
