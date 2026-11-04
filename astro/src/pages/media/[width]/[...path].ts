import type { APIRoute } from 'astro';
import { CMS_URL, CMS_PUBLIC_ORIGIN } from '../../../lib/strapi';
import { parseMediaRequest, createByteLru } from '../../../lib/media.mjs';

export const prerender = false;

const cache = createByteLru(64 * 1024 * 1024);
const inFlight = new Map<string, Promise<Uint8Array>>();
let sharpModule: any = null;

async function transform(path: string, width: number): Promise<Uint8Array> {
  const response = await fetch(`${CMS_URL}/${path}`, { signal: AbortSignal.timeout(10_000) });
  if (!response.ok) throw new Error(`CMS image ${response.status}`);
  const input = Buffer.from(await response.arrayBuffer());
  sharpModule ??= (await import('sharp')).default;
  const output = await sharpModule(input)
    .rotate()
    .resize({ width, withoutEnlargement: true })
    .webp({ quality: 76, effort: 4 })
    .toBuffer();
  return new Uint8Array(output);
}

export const GET: APIRoute = async ({ params }) => {
  const request = parseMediaRequest(params.width, params.path);
  if (!request) return new Response('Not found', { status: 404 });
  const key = `${request.width}/${request.path}`;

  let body = cache.get(key);
  if (!body) {
    let pending = inFlight.get(key);
    if (!pending) {
      pending = transform(request.path, request.width).finally(() => inFlight.delete(key));
      inFlight.set(key, pending);
    }
    try {
      body = await pending;
      cache.set(key, body);
    } catch (error) {
      // Never break an image: fall back to the original CMS file.
      console.error('Media transform failed:', key, (error as Error)?.message);
      return new Response(null, {
        status: 302,
        headers: { Location: `${CMS_PUBLIC_ORIGIN || CMS_URL}/${request.path}`, 'Cache-Control': 'no-store' },
      });
    }
  }

  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'image/webp',
      'Cache-Control': 'public, max-age=31536000, immutable',
      'X-Content-Type-Options': 'nosniff',
    },
  });
};
