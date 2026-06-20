const STRAPI_URL = 'http://localhost:1337';
const EMAIL = 'syedhashimabbas218@gmail.com';
const PASSWORD = 'Admin123!';

function cleanSpec(label, value) {
  let l = (label || '').trim();
  let v = (value || '').trim();

  // Drop section-header rows (label="Spec" with a value that doesn't look like a real spec)
  // e.g. "Spec | TLT440W Parameters" or "Spec | Secondary lift" — value is a category name, not a measurement
  if (l === 'Spec' && v) {
    // If value contains a colon, treat as data
    if (/[：:]/.test(v)) {
      // fall through to parsing below
    } else if (/\d/.test(v)) {
      // No colon but has digits — likely a real spec without separator
      return [{ label: 'Spec', value: v }];
    } else {
      // Pure category header (e.g. "TLT440W Parameters", "Secondary lift") — drop
      return [];
    }
  }

  // If the value holds the actual data (label is "Spec" or starts with -), parse it
  const COLON_RE = /[：:]/;

  if ((l === 'Spec' || l === '' || l === '-') && v) {
    const parts = v.split(/\s*\|\s*/).map(p => p.trim()).filter(Boolean);
    const cleaned = [];
    for (const part of parts) {
      const stripped = part.replace(/^-\s*/, '').trim();
      if (COLON_RE.test(stripped)) {
        const m = stripped.match(/^([^：:]+)[：:]\s*(.+)$/);
        if (m) {
          cleaned.push({ label: m[1].trim(), value: m[2].trim() });
          continue;
        }
      }
      cleaned.push({ label: 'Spec', value: stripped });
    }
    return cleaned.length === 1 ? cleaned[0] : cleaned;
  }

  // Otherwise just clean up the existing label/value
  if (l.startsWith('- ')) l = l.slice(2).trim();
  if (COLON_RE.test(l) && !v) {
    const m = l.match(/^([^：:]+)[：:]\s*(.+)$/);
    if (m) { l = m[1].trim(); v = m[2].trim(); }
  }
  return [{ label: l, value: v }];
}

async function login() {
  const res = await fetch(`${STRAPI_URL}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  return (await res.json()).data.token;
}

async function api(path, options = {}) {
  const res = await fetch(`${STRAPI_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  const text = await res.text();
  try { return JSON.parse(text); } catch { return text; }
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  const token = await login();
  console.log('Logged in');

  const res = await api('/content-manager/collection-types/api::product.product?pageSize=100', {
    headers: { Authorization: `Bearer ${token}` },
  });
  const products = res.results || [];

  let productsUpdated = 0;
  for (const p of products) {
    if (!p.technicalTable || p.technicalTable.length === 0) continue;

    const newTable = [];
    let changed = false;
    for (const spec of p.technicalTable) {
      const cleaned = cleanSpec(spec.label, spec.value);
      if (Array.isArray(cleaned)) {
        if (cleaned.length !== 1) changed = true;
        for (const c of cleaned) {
          if (c.label !== spec.label || c.value !== spec.value) changed = true;
          newTable.push(c);
        }
      } else {
        if (cleaned.label !== spec.label || cleaned.value !== spec.value) changed = true;
        newTable.push(cleaned);
      }
    }
    // Detect removals too
    if (newTable.length !== p.technicalTable.length) changed = true;

    if (!changed) continue;

    const r = await api(`/content-manager/collection-types/api::product.product/${p.documentId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ technicalTable: newTable }),
    });
    if (r.error) { console.log(`  ! Failed ${p.slug}: ${r.error.message}`); continue; }
    await api(`/content-manager/collection-types/api::product.product/${p.documentId}/actions/publish`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    productsUpdated++;
    console.log(`  ✓ ${p.slug} (${p.technicalTable.length} -> ${newTable.length} rows)`);
    await sleep(200);
  }

  console.log(`\nDone. Products updated: ${productsUpdated}`);
}

main().catch(e => { console.error('Error:', e.message); process.exit(1); });
