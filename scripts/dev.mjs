import * as esbuild from 'esbuild';
import { cp, mkdir, readFile, rm, stat } from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const demoDir = path.join(rootDir, 'demo');
const distDir = path.join(rootDir, 'dist');
const siteDir = path.join(rootDir, 'site');
const siteAssetsDir = path.join(siteDir, 'assets');
const port = Number(process.env.PORT || 4173);

const mimeTypes = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.map', 'application/json; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
]);

async function syncSite() {
  await rm(siteDir, { force: true, recursive: true });
  await mkdir(siteAssetsDir, { recursive: true });
  await cp(path.join(demoDir, 'index.html'), path.join(siteDir, 'index.html'));
  await cp(
    path.join(distDir, 'demo-theme-button.js'),
    path.join(siteAssetsDir, 'demo-theme-button.js')
  );
  await cp(
    path.join(distDir, 'demo-theme-button.js.map'),
    path.join(siteAssetsDir, 'demo-theme-button.js.map')
  );
}

const context = await esbuild.context({
  bundle: true,
  entryPoints: [path.join(rootDir, 'src', 'index.ts')],
  format: 'esm',
  outfile: path.join(distDir, 'demo-theme-button.js'),
  platform: 'browser',
  sourcemap: true,
  target: ['es2022'],
  plugins: [
    {
      name: 'sync-site',
      setup(build) {
        build.onEnd(async (result) => {
          if (result.errors.length > 0) {
            return;
          }

          await syncSite();
          console.log('Rebuilt bundle and synced demo site.');
        });
      },
    },
  ],
});

await mkdir(distDir, { recursive: true });
await context.watch();
await context.rebuild();

const server = http.createServer(async (req, res) => {
  const requestedPath =
    req.url === '/' ? '/index.html' : req.url || '/index.html';
  const safePath = path.normalize(requestedPath).replace(/^(\.\.[/\\])+/, '');
  const filePath = path.join(siteDir, safePath);

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
  console.log(`Demo playground running at http://localhost:${port}`);
});

const shutdown = async () => {
  await context.dispose();
  server.close(() => process.exit(0));
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
