import type { APIRoute } from 'astro';
import { getProducts, sortByAvailability } from '../../lib/strapi';

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  const q = url.searchParams.get('q') || '';
  if (q.length < 2) {
    return new Response(JSON.stringify({ results: [] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const products = sortByAvailability(await getProducts());
    const query = q.toLowerCase();
    const results = products
      .filter((p) =>
        p.name.toLowerCase().includes(query) ||
        p.brand.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query) ||
        p.summary.toLowerCase().includes(query)
      )
      .slice(0, 12)
      .map((p) => ({
        id: p.id,
        name: p.name,
        image: p.heroImages?.[0] || '',
        brand: p.brand,
        price: p.price ? `PKR ${p.price.toLocaleString()}` : 'Contact for Quote',
        category: p.category,
      }));

    return new Response(JSON.stringify({ results }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ results: [], error: 'Search unavailable' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
