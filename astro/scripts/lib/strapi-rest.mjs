// Small Strapi v5 REST helpers shared by the catalog maintenance scripts
// (replace-new-products.mjs, update-catalog-products.mjs).
import fs from 'node:fs';
import path from 'node:path';

export const STRAPI_URL = (process.env.STRAPI_URL || 'https://strapi.autodiagnostix.com.pk').replace(/\/$/, '');
const TOKEN = process.env.STRAPI_KEY || process.env.STRAPI_API_TOKEN || '';

export function requireToken() {
  if (!TOKEN) {
    console.error('Missing STRAPI_KEY (or STRAPI_API_TOKEN). Aborting.');
    process.exit(1);
  }
}

export const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

export function parseArgs(argv = process.argv.slice(2)) {
  const flags = new Set(argv.filter(a => !a.includes('=')));
  const opts = Object.fromEntries(argv.filter(a => a.includes('=')).map(a => a.replace(/^--/, '').split('=')));
  const list = name => (opts[name] ? new Set(opts[name].split(',').filter(Boolean)) : null);
  return { flags, opts, list };
}

export async function api(method, route, body, { raw = false, retries = 3 } = {}) {
  for (let attempt = 1; ; attempt++) {
    const headers = { Authorization: `Bearer ${TOKEN}` };
    let payload = body;
    if (body && !(body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
      payload = JSON.stringify(body);
    }
    const response = await fetch(`${STRAPI_URL}${route}`, { method, headers, body: payload });
    if (response.status >= 500 && attempt < retries) { await sleep(1500 * attempt); continue; }
    const text = await response.text();
    if (!response.ok) throw new Error(`${method} ${route} -> ${response.status}: ${text.slice(0, 500)}`);
    if (raw) return text;
    return text ? JSON.parse(text) : null;
  }
}

export async function listAll(route) {
  const rows = [];
  for (let page = 1; page < 50; page++) {
    const sep = route.includes('?') ? '&' : '?';
    const res = await api('GET', `${route}${sep}pagination[pageSize]=100&pagination[page]=${page}`);
    rows.push(...res.data);
    if (page >= (res.meta?.pagination?.pageCount ?? 1)) break;
  }
  return rows;
}

export const FULL_POPULATE = 'populate[heroImages][populate][image]=true&populate[features][fields][0]=title&populate[features][fields][1]=description&populate[functions][fields][0]=title&populate[functions][fields][1]=description&populate[technicalTable]=true&populate[specs]=true&populate[brand]=true&populate[category]=true';

export function featureItems(list = []) {
  // Same convention as the existing catalog: short title, full text in description.
  return list.filter(Boolean).map(text => {
    const clean = String(text).replace(/\s+/g, ' ').trim();
    const title = clean.length > 60 ? `${clean.slice(0, 57).trimEnd()}...` : clean;
    return { title, description: clean };
  });
}

export async function uploadImage(file, alt, name = path.basename(file)) {
  const buffer = fs.readFileSync(file);
  const ext = path.extname(file).slice(1).toLowerCase();
  const type = { webp: 'image/webp', png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg' }[ext] || 'application/octet-stream';
  const form = new FormData();
  form.append('files', new Blob([buffer], { type }), name);
  form.append('fileInfo', JSON.stringify({ name, alternativeText: alt, caption: alt }));
  const res = await api('POST', '/api/upload', form);
  return Array.isArray(res) ? res[0] : res;
}

export function writeBackup(dir, prefix, data) {
  fs.mkdirSync(dir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const file = path.join(dir, `${prefix}-${stamp}.json`);
  fs.writeFileSync(file, JSON.stringify(data, null, 1));
  return file;
}
