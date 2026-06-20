import { execSync } from 'child_process';

const STRAPI_URL = 'http://localhost:1337';
const EMAIL = 'syedhashimabbas218@gmail.com';
const PASSWORD = 'Admin123!';
const FILE_ID_TO_DELETE = 170; // old pl-fs40.webp

async function login() {
  const res = await fetch(`${STRAPI_URL}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  const d = await res.json();
  return d.data?.token;
}

async function deleteFile(token, fileId) {
  const res = await fetch(`${STRAPI_URL}/upload/files/${fileId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  const text = await res.text();
  try { return JSON.parse(text); } catch { return text; }
}

async function main() {
  const token = await login();
  if (!token) { console.log('Login failed'); return; }
  console.log('Logged in');
  const r = await deleteFile(token, FILE_ID_TO_DELETE);
  console.log('Delete response:', JSON.stringify(r).slice(0, 200));
}

main().catch(e => { console.error('Error:', e.message); process.exit(1); });
