import { readFile, writeFile } from 'node:fs/promises';

const origin = process.env.AUDIT_URL || 'http://127.0.0.1:4327';
const data = JSON.parse(await readFile(process.env.AUDIT_RESULTS || '.playwright-mcp/ux-audit/release-build-chromium/results.json', 'utf8'));
const paths = [...new Set(data.results.flatMap(r => r.links).map(p => p.split('#')[0]))]
  .filter(p => p && !p.startsWith('/api/') && p !== '/admin');
const results = [];
let next = 0;
await Promise.all(Array.from({ length: 3 }, async () => {
  while (next < paths.length) {
    const path = paths[next++];
    try {
      const response = await fetch(origin + path, { method: 'HEAD', redirect: 'manual', signal: AbortSignal.timeout(20000) });
      results.push({ path, status: response.status, location: response.headers.get('location') });
    } catch (error) { results.push({ path, error: error.message }); }
  }
}));
await writeFile('.playwright-mcp/ux-audit/links.json', JSON.stringify(results, null, 2));
console.log(JSON.stringify({ checked: results.length, issues: results.filter(r => r.error || r.status >= 300) }, null, 2));
