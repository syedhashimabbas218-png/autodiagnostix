import type { APIRoute } from 'astro';
import { validateContact, composeMessage, subjectLabel } from '../../lib/contact.mjs';

export const prerender = false;

// Delivery is configured, not hard-coded: set CONTACT_WEBHOOK_URL to any
// endpoint that accepts a JSON POST (Zapier/Make/n8n webhook, a Google Apps
// Script that emails the team, a Slack workflow, a CRM). Without it the
// endpoint answers 501 and the page hands the message to the visitor's mail
// app instead, so no enquiry is silently dropped.
const WEBHOOK_URL = process.env.CONTACT_WEBHOOK_URL || import.meta.env.CONTACT_WEBHOOK_URL || '';
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const MAX_BODY_BYTES = 16 * 1024;
const recent = new Map<string, number[]>();

const json = (status: number, body: Record<string, unknown>) => new Response(JSON.stringify(body), {
  status,
  headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' },
});

function rateLimited(ip: string) {
  const now = Date.now();
  const hits = (recent.get(ip) || []).filter(time => now - time < WINDOW_MS);
  hits.push(now);
  recent.set(ip, hits);
  if (recent.size > 5000) recent.delete(recent.keys().next().value!);
  return hits.length > MAX_PER_WINDOW;
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
  // Same-site browsers only (the form posts with fetch, which sends Origin).
  const origin = request.headers.get('origin');
  if (origin) {
    let allowed = false;
    try {
      const { host, hostname } = new URL(origin);
      allowed = host === new URL(request.url).host || /(^|\.)autodiagnostix\.com\.pk$/.test(hostname);
    } catch { /* "null" or malformed origin */ }
    if (!allowed) return json(403, { ok: false, reason: 'origin' });
  }
  if (!(request.headers.get('content-type') || '').includes('application/json')) {
    return json(415, { ok: false, reason: 'content-type' });
  }
  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) return json(413, { ok: false, reason: 'too-large' });

  let input: Record<string, unknown>;
  try { input = JSON.parse(raw); } catch { return json(400, { ok: false, reason: 'invalid-json' }); }

  // Honeypot: real visitors never see or fill this field.
  if (typeof input.website === 'string' && input.website.trim()) return json(200, { ok: true, delivered: true });

  const { values, errors, valid } = validateContact(input) as { values: Record<string, string>; errors: Record<string, string>; valid: boolean };
  if (!valid) return json(400, { ok: false, reason: 'invalid', errors });

  const ip = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || clientAddress || 'unknown';
  if (rateLimited(ip)) return json(429, { ok: false, reason: 'rate-limited' });

  if (!WEBHOOK_URL) return json(501, { ok: false, reason: 'not-configured' });

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...values,
        subjectLabel: subjectLabel(values.subject),
        text: composeMessage(values),
        page: typeof input.page === 'string' ? input.page.slice(0, 300) : '',
        receivedAt: new Date().toISOString(),
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) throw new Error(`Webhook HTTP ${response.status}`);
    return json(200, { ok: true, delivered: true });
  } catch (error) {
    console.error('Contact delivery failed:', (error as Error)?.message);
    return json(502, { ok: false, reason: 'delivery-failed' });
  }
};

export const ALL: APIRoute = () => json(405, { ok: false, reason: 'method' });
