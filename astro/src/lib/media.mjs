// Responsive, same-origin versions of CMS product photos.
//
// Several CMS uploads are large PNGs (up to 343 KB for a card thumbnail) on a
// separate origin. /media/w{width}/uploads/{file}.webp resizes and converts
// them once with sharp, keeps the result in a bounded in-memory cache, and
// marks it immutable (Strapi file names are content-hashed). The .webp
// extension lets the CDN cache it with default rules.

export const MEDIA_WIDTHS = [320, 480, 640, 960];

const UPLOAD_PATH = /^uploads\/[A-Za-z0-9._-]+\.(png|jpe?g|webp|avif)$/i;

// Map a CMS upload URL to its media path, or null when it is not a CMS upload.
export function uploadPath(url, cmsOrigins) {
  if (!url) return null;
  try {
    const parsed = new URL(url, 'https://placeholder.invalid');
    const sameCms = url.startsWith('/uploads/') || cmsOrigins.includes(parsed.origin);
    const path = parsed.pathname.replace(/^\//, '');
    return sameCms && UPLOAD_PATH.test(path) && !parsed.search ? path : null;
  } catch {
    return null;
  }
}

export function mediaUrl(path, width) {
  return `/media/w${width}/${path}.webp`;
}

// { src, srcset } for a CMS photo, or { src: original } when not applicable.
export function responsiveImage(url, cmsOrigins, widths = [320, 480, 640]) {
  const path = uploadPath(url, cmsOrigins);
  if (!path) return { src: url || '', srcset: undefined };
  return {
    src: mediaUrl(path, widths[Math.min(1, widths.length - 1)]),
    srcset: widths.map(w => `${mediaUrl(path, w)} ${w}w`).join(', '),
  };
}

// Parse /media/w{width}/{path}.webp route params into a validated request.
export function parseMediaRequest(widthParam, restParam) {
  const width = Number(/^w(\d+)$/.exec(widthParam || '')?.[1]);
  if (!MEDIA_WIDTHS.includes(width)) return null;
  const rest = String(restParam || '');
  if (!rest.endsWith('.webp')) return null;
  const path = rest.slice(0, -'.webp'.length);
  if (path.includes('..') || !UPLOAD_PATH.test(path)) return null;
  return { width, path };
}

export function createByteLru(maxBytes) {
  const entries = new Map();
  let total = 0;
  return {
    get(key) {
      const value = entries.get(key);
      if (value) { entries.delete(key); entries.set(key, value); }
      return value;
    },
    set(key, value) {
      if (value.byteLength > maxBytes) return;
      if (entries.has(key)) { total -= entries.get(key).byteLength; entries.delete(key); }
      entries.set(key, value);
      total += value.byteLength;
      while (total > maxBytes) {
        const [oldestKey, oldest] = entries.entries().next().value;
        entries.delete(oldestKey);
        total -= oldest.byteLength;
      }
    },
    get size() { return entries.size; },
    get bytes() { return total; },
  };
}
