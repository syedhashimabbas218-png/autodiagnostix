import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createServer } from 'node:http';
import { connect } from 'node:net';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildRouteTable, loadData, makeAPIHandler, prerender } from './prerender.mjs';

const app = fileURLToPath(new URL('../', import.meta.url));
const product = { id: 'sample', name: 'Original product name', brand: 'Launch', category: 'Scanners' };
const catalogue = { products: [product], categories: [{ id: 'scanners', name: 'Scanners' }], brands: [{ id: 'launch', name: 'Launch' }] };

async function fixture(run, { crash = false } = {}) {
  await fs.mkdir(path.join(app, '.tmp'), { recursive: true });
  const directory = await fs.mkdtemp(path.join(app, '.tmp', 'prerender-test-'));
  const distDir = path.join(directory, 'dist');
  const dataDir = path.join(directory, 'data');
  await fs.mkdir(distDir);
  await fs.mkdir(dataDir);
  await fs.writeFile(path.join(dataDir, 'products.json'), JSON.stringify(catalogue.products));
  await fs.writeFile(path.join(dataDir, 'categories.json'), JSON.stringify(catalogue.categories));
  const html = `<!doctype html><html><head><title>Not ready</title><link rel="canonical" href="https://example.test/pending"></head><body>
    <div id="root"><nav>Navigation</nav><h1>Loading</h1><footer>Footer</footer></div>
    <script type="module">
      const response = await fetch('http://cms.test/api/products?where[id][equals]=sample');
      const data = await response.json();
      document.querySelector('h1').textContent = data.docs[0].name;
      document.title = 'Fixture ' + location.pathname;
      document.querySelector('[rel=canonical]').href = 'https://example.test' + location.pathname;
      if (${crash} && location.pathname.startsWith('/product/')) throw new Error('Fixture render failure');
    </script></body></html>`;
  await fs.writeFile(path.join(distDir, 'index.html'), html);
  try { await run({ directory, distDir, dataDir, html }); }
  finally { await fs.rm(directory, { recursive: true, force: true }); }
}

async function handle(url) {
  let result;
  await makeAPIHandler(catalogue)({ request: () => ({ url: () => url }), fulfill: async value => { result = value; } });
  return result;
}

async function occupiedPort(run) {
  const server = createServer((request, response) => response.end('existing server'));
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  try { await run(server.address().port); }
  finally { await new Promise(resolve => server.close(resolve)); }
}

async function assertClosed(port) {
  await new Promise((resolve, reject) => {
    const socket = connect({ host: '127.0.0.1', port });
    socket.once('connect', () => { socket.destroy(); reject(new Error('Preview server leaked')); });
    socket.once('error', error => { assert.equal(error.code, 'ECONNREFUSED'); resolve(); });
  });
}

test('route table deduplicates routes and rejects output traversal', () => {
  const routes = buildRouteTable({ ...catalogue, products: [product, product] });
  assert.equal(routes.length, 6);
  assert(routes.some(route => route.path === '/category/scanners'));
  assert.throws(() => buildRouteTable({ products: [{ ...product, id: '../escape' }] }), /Invalid product route ID/);
  assert.throws(() => buildRouteTable({ products: [{ ...product, category: '../../escape' }] }), /escapes the output directory/);
});

test('API interception handles actual Payload filter syntax and JSON headers', async () => {
  const found = await handle('http://cms.test/api/products?where[id][equals]=sample');
  assert.equal(found.headers['Content-Type'], 'application/json');
  assert.equal(JSON.parse(found.body).docs[0].name, product.name);
  const missing = await handle('http://cms.test/api/products?where%5Bid%5D%5Bequals%5D=missing');
  assert.deepEqual(JSON.parse(missing.body).docs, []);
  assert.equal((await handle('http://cms.test/api/unknown')).status, 404);
});

test('data loading validates the export and does not silently invent a catalogue', async () => {
  await fixture(async ({ dataDir }) => {
    assert.equal(loadData(dataDir).products[0].name, product.name);
    await fs.writeFile(path.join(dataDir, 'products.json'), '{}');
    assert.throws(() => loadData(dataDir), /must contain arrays/);
    assert.equal(loadData(path.join(dataDir, 'missing')), null);
  });
});

test('real Chromium captures every route using the unchanged original entry', async () => {
  await fixture(async ({ distDir, dataDir }) => {
    assert.equal(await prerender({ distDir, dataDir, port: 0 }), 6);
    for (const route of buildRouteTable(catalogue)) {
      const html = await fs.readFile(path.join(distDir, route.file), 'utf8');
      assert(html.includes(product.name));
      assert(html.includes(`Fixture ${route.path}`));
      assert(!html.includes('<title>Not ready</title>'));
    }
  });
});

test('a browser rendering error rejects the build without replacing any entry', async () => {
  await fixture(async ({ distDir, dataDir, html }) => {
    await assert.rejects(prerender({ distDir, dataDir, port: 0 }), /no prerendered files were written/);
    assert.equal(await fs.readFile(path.join(distDir, 'index.html'), 'utf8'), html);
    await assert.rejects(fs.access(path.join(distDir, 'products/index.html')), { code: 'ENOENT' });
  }, { crash: true });
});

test('an occupied port is not reused and the existing server is left alone', async () => {
  await fixture(async ({ distDir, dataDir }) => {
    await occupiedPort(async port => {
      let launched = false;
      await assert.rejects(prerender({ distDir, dataDir, port, launchBrowser: () => { launched = true; } }), /already in use/);
      assert.equal(launched, false);
      assert.equal(await (await fetch(`http://127.0.0.1:${port}`)).text(), 'existing server');
    });
  });
});

test('browser launch failure always closes the preview server', async () => {
  await fixture(async ({ distDir, dataDir }) => {
    let port;
    await occupiedPort(async assigned => { port = assigned; });
    await assert.rejects(prerender({ distDir, dataDir, port, launchBrowser: async () => { throw new Error('Fixture launch failure'); } }), /Fixture launch failure/);
    await assertClosed(port);
  });
});

test('failed catalogue requests are not published as empty successful pages', async () => {
  await fixture(async ({ distDir, dataDir, html }) => {
    let closedPages = 0;
    let closedBrowser = false;
    const launchBrowser = async () => ({
      newPage: async () => {
        const events = {};
        return {
          on: (name, listener) => { events[name] = listener; },
          route: async () => {},
          goto: async () => {
            events.requestfailed({ url: () => 'http://cms.test/api/products?depth=2', failure: () => ({ errorText: 'net::ERR_FAILED' }) });
            return { ok: () => true };
          },
          waitForFunction: async () => {},
          content: async () => { throw new Error('Failed requests must be rejected before capture'); },
          close: async () => { closedPages++; },
        };
      },
      close: async () => { closedBrowser = true; },
    });
    await assert.rejects(prerender({ distDir, dataDir, port: 0, launchBrowser }), /6 of 6 routes failed/);
    assert.equal(closedPages, 6);
    assert.equal(closedBrowser, true);
    assert.equal(await fs.readFile(path.join(distDir, 'index.html'), 'utf8'), html);
  });
});

test('HTTP error pages are rejected even though browser navigation resolves', async () => {
  await fixture(async ({ distDir, dataDir, html }) => {
    const launchBrowser = async () => ({
      newPage: async () => ({
        on: () => {}, route: async () => {},
        goto: async () => ({ ok: () => false, status: () => 503 }),
        close: async () => {},
      }),
      close: async () => {},
    });
    await assert.rejects(prerender({ distDir, dataDir, port: 0, launchBrowser }), /6 of 6 routes failed/);
    assert.equal(await fs.readFile(path.join(distDir, 'index.html'), 'utf8'), html);
  });
});

test('CLI missing-data failures return a nonzero exit code', async () => {
  await fixture(async ({ dataDir }) => {
    const result = spawnSync(process.execPath, [fileURLToPath(new URL('./prerender.mjs', import.meta.url))], {
      env: { ...process.env, PRERENDER_DATA_DIR: path.join(dataDir, 'missing') }, encoding: 'utf8', timeout: 15000,
    });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /Missing legacy catalogue/);
  });
});

test('sitemap and prerender read the same optional catalogue directory', async () => {
  await fixture(async ({ directory, distDir, dataDir }) => {
    const scripts = path.join(directory, 'scripts');
    await fs.mkdir(scripts);
    const generator = path.join(scripts, 'generate-sitemap.mjs');
    await fs.copyFile(fileURLToPath(new URL('./generate-sitemap.mjs', import.meta.url)), generator);
    const result = spawnSync(process.execPath, [generator], {
      env: { ...process.env, PRERENDER_DATA_DIR: dataDir }, encoding: 'utf8', timeout: 15000,
    });
    assert.equal(result.status, 0, result.stderr);
    const sitemap = await fs.readFile(path.join(distDir, 'sitemap.xml'), 'utf8');
    for (const route of buildRouteTable(catalogue)) assert(sitemap.includes(`<loc>https://autodiagnostix.com${route.path}</loc>`));
  });
});
