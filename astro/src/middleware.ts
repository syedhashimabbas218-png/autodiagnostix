import { defineMiddleware } from 'astro/middleware';
import { gzip as gzipFn } from 'node:zlib';

const gzip = (buf: Buffer): Promise<Buffer> =>
  new Promise((resolve, reject) => {
    gzipFn(buf, (err, result) => (err ? reject(err) : resolve(result)));
  });

export const onRequest = defineMiddleware(async (context, next) => {
  const response = await next();

  if (response.headers.get('Content-Encoding') || response.headers.get('content-encoding')) {
    return response;
  }

  const contentType = response.headers.get('Content-Type') || response.headers.get('content-type') || '';
  const shouldCompress = /text|javascript|json|xml|svg/.test(contentType);
  const body = response.body;
  if (!shouldCompress || !body) {
    return response;
  }

  try {
    const reader = body.getReader();
    const chunks: Uint8Array[] = [];
    let total = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      total += value.length;
    }
    const full = new Uint8Array(total);
    let offset = 0;
    for (const chunk of chunks) {
      full.set(chunk, offset);
      offset += chunk.length;
    }
    if (total < 1024) {
      return new Response(full, response);
    }
    const compressed = await gzip(Buffer.from(full));
    return new Response(compressed, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        ...Object.fromEntries(response.headers),
        'Content-Encoding': 'gzip',
        'Content-Length': compressed.length.toString(),
      },
    });
  } catch {
    return response;
  }
});
