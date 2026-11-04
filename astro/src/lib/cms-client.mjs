export class CMSUnavailableError extends Error {
  constructor(message = 'The catalog service is temporarily unavailable', options) {
    super(message, options);
    this.name = 'CMSUnavailableError';
  }
}

// Strict public, read-only CMS access. An outage is not an empty collection or
// evidence that a previously indexed product has been deleted.
//
// Optional response cache (off unless freshMs > 0):
// - within `freshMs` a successful response is reused without a request;
// - for a further `staleMs` it is still served immediately while one
//   background request refreshes it (stale-while-revalidate);
// - failures are never cached. If a background refresh fails the last good
//   response keeps being served until the stale window ends, after which the
//   caller sees the normal CMSUnavailableError.
export function createCmsClient(cmsUrl, fetcher = fetch, { freshMs = 0, staleMs = 0, maxEntries = 500, now = Date.now } = {}) {
  const pending = new Map();
  const cache = new Map();

  function fetchFresh(endpoint) {
    if (pending.has(endpoint)) return pending.get(endpoint);
    const request = (async () => {
      try {
        const response = await fetcher(`${cmsUrl.replace(/\/$/, '')}/api${endpoint}`, { signal: AbortSignal.timeout(5000) });
        if (!response.ok) throw new Error(`CMS HTTP ${response.status}`);
        const payload = await response.json();
        if (!Array.isArray(payload.data)) throw new Error('Invalid CMS collection response');
        if (freshMs > 0) {
          cache.delete(endpoint);
          cache.set(endpoint, { payload, at: now() });
          while (cache.size > maxEntries) cache.delete(cache.keys().next().value);
        }
        return payload;
      } catch (cause) {
        throw new CMSUnavailableError(undefined, { cause });
      }
    })();
    pending.set(endpoint, request);
    request.then(() => pending.delete(endpoint), () => pending.delete(endpoint));
    return request;
  }

  async function read(endpoint) {
    const entry = freshMs > 0 ? cache.get(endpoint) : undefined;
    if (entry) {
      const age = now() - entry.at;
      if (age < freshMs) return entry.payload;
      if (age < freshMs + staleMs) {
        fetchFresh(endpoint).catch(() => {});
        return entry.payload;
      }
    }
    return fetchFresh(endpoint);
  }

  async function list(endpoint, pageSize = 100) {
    const rows = [];
    const separator = endpoint.includes('?') ? '&' : '?';
    for (let page = 1; page <= 1000; page++) {
      const payload = await read(`${endpoint}${separator}pagination[pageSize]=${pageSize}&pagination[page]=${page}`);
      rows.push(...payload.data);
      const meta = payload.meta?.pagination;
      if (meta?.page !== undefined && meta.page !== page) throw new CMSUnavailableError('CMS returned an unexpected page');
      if (meta?.pageCount !== undefined) {
        if (!Number.isInteger(meta.pageCount) || meta.pageCount < 0) throw new CMSUnavailableError('Invalid CMS page count');
        if (page >= meta.pageCount) {
          if (meta.total !== undefined && rows.length !== meta.total) throw new CMSUnavailableError('Incomplete CMS catalog');
          return rows;
        }
      } else if (meta?.total !== undefined) {
        if (!Number.isInteger(meta.total) || meta.total < rows.length) throw new CMSUnavailableError('Invalid CMS total');
        if (rows.length === meta.total) return rows;
      } else if (payload.data.length < pageSize) {
        return rows;
      }
      if (!payload.data.length) throw new CMSUnavailableError('Empty intermediate CMS page');
    }
    throw new CMSUnavailableError('CMS pagination limit exceeded');
  }
  return { read, list };
}
