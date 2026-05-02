import path from 'node:path';
import { buildPackage } from './lib/build-package.mjs';
import { getComponentPackages, rootDir } from './lib/workspace.mjs';

const components = await getComponentPackages();

for (const component of components) {
  await buildPackage(component);
  console.log(
    `Built ${component.packageName} in ${path.relative(rootDir, component.distDir)}/`
  );
}
