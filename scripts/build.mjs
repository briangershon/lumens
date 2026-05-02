import { build } from 'esbuild';
import { cp, mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const siteDir = path.join(rootDir, 'site');
const siteAssetsDir = path.join(siteDir, 'assets');

async function bundleComponent() {
  await build({
    bundle: true,
    entryPoints: [path.join(rootDir, 'src', 'index.ts')],
    format: 'esm',
    minify: false,
    outfile: path.join(distDir, 'demo-theme-button.js'),
    platform: 'browser',
    sourcemap: true,
    target: ['es2022'],
  });
}

async function buildSite() {
  await rm(siteDir, { force: true, recursive: true });
  await mkdir(siteAssetsDir, { recursive: true });
  await cp(
    path.join(rootDir, 'demo', 'index.html'),
    path.join(siteDir, 'index.html')
  );
  await cp(
    path.join(distDir, 'demo-theme-button.js'),
    path.join(siteAssetsDir, 'demo-theme-button.js')
  );
  await cp(
    path.join(distDir, 'demo-theme-button.js.map'),
    path.join(siteAssetsDir, 'demo-theme-button.js.map')
  );
}

await mkdir(distDir, { recursive: true });
await bundleComponent();
await buildSite();

console.log(`Built component bundle in ${path.relative(rootDir, distDir)}/`);
console.log(`Built demo site in ${path.relative(rootDir, siteDir)}/`);
