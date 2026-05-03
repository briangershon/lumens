import * as esbuild from 'esbuild';
import {
  cp,
  mkdir,
  readFile,
  rm,
  stat,
  watch,
  writeFile,
} from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import {
  docsDistDir,
  docsSrcDir,
  getComponentPackages,
  rootDir,
} from './lib/workspace.mjs';

const port = Number(process.env.PORT || 4173);
const mimeTypes = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.map', 'application/json; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
]);

const components = await getComponentPackages();
let syncQueue = Promise.resolve();

async function syncDocsSite() {
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
    const bundlePath = path.join(component.distDir, component.bundleName);
    const sourcemapPath = `${bundlePath}.map`;

    await mkdir(componentAssetDir, { recursive: true });
    await cp(bundlePath, path.join(componentAssetDir, component.bundleName));
    await cp(
      sourcemapPath,
      path.join(componentAssetDir, `${component.bundleName}.map`)
    );

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
}

function queueDocsSync() {
  syncQueue = syncQueue.then(() => syncDocsSite());
  return syncQueue;
}

const contexts = [];

for (const component of components) {
  await rm(component.distDir, { force: true, recursive: true });
  await mkdir(component.distDir, { recursive: true });

  const context = await esbuild.context({
    bundle: true,
    entryPoints: [component.sourceEntry],
    format: 'esm',
    outfile: path.join(component.distDir, component.bundleName),
    platform: 'browser',
    sourcemap: true,
    target: ['es2022'],
    plugins: [
      {
        name: `sync-docs-${component.dirName}`,
        setup(build) {
          build.onEnd(async (result) => {
            if (result.errors.length > 0) {
              return;
            }

            await esbuild.build({
              bundle: true,
              entryPoints: [component.sourceEntry],
              format: 'esm',
              minify: false,
              outfile: path.join(component.distDir, 'index.js'),
              platform: 'browser',
              sourcemap: true,
              target: ['es2022'],
            });

            await queueDocsSync();
            console.log(
              `Rebuilt ${component.packageName} and synced docs app.`
            );
          });
        },
      },
    ],
  });

  await context.watch();
  await esbuild.build({
    bundle: true,
    entryPoints: [component.sourceEntry],
    format: 'esm',
    minify: false,
    outfile: path.join(component.distDir, 'index.js'),
    platform: 'browser',
    sourcemap: true,
    target: ['es2022'],
  });
  contexts.push(context);
}

await queueDocsSync();

const docsWatcher = watch(docsSrcDir);

void (async () => {
  for await (const _ of docsWatcher) {
    await queueDocsSync();
    console.log('Synced docs app source changes.');
  }
})();

const server = http.createServer(async (req, res) => {
  const requestedPath =
    req.url === '/' ? '/index.html' : req.url || '/index.html';
  const safePath = path.normalize(requestedPath).replace(/^(\.\.[/\\])+/, '');
  const filePath = path.join(docsDistDir, safePath);

  try {
    const fileStat = await stat(filePath);
    if (!fileStat.isFile()) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }

    const ext = path.extname(filePath);
    const body = await readFile(filePath);

    res.writeHead(200, {
      'Content-Type': mimeTypes.get(ext) || 'application/octet-stream',
      'Cache-Control': 'no-store',
    });
    res.end(body);
  } catch {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(port, () => {
  console.log(`Docs playground running at http://localhost:${port}`);
});

const shutdown = async () => {
  docsWatcher.close();
  await Promise.all(contexts.map((context) => context.dispose()));
  server.close(() => process.exit(0));
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

console.log(
  `Watching ${components.length} component package(s) from ${path.relative(rootDir, docsSrcDir)}/.`
);
