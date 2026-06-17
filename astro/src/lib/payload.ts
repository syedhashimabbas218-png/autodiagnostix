const CMS_URL = import.meta.env.PAYLOAD_URL || 'http://localhost:3000';

export interface PayloadImage {
  id: string;
  filename: string;
  url?: string;
  alt?: string;
  caption?: string;
  thumbnailURL?: string;
  mediumURL?: string;
  sizes?: {
    thumbnail?: { url: string };
    medium?: { url: string };
    large?: { url: string };
  };
}

export interface PayloadBrand {
  id: string;
  name: string;
  description?: string;
  logo?: string | PayloadImage;
  website?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PayloadCategory {
  id: string;
  name: string;
  tagline?: string;
  description?: string;
  icon?: string;
  image?: string | PayloadImage;
  createdAt: string;
  updatedAt: string;
}

export interface PayloadProductFeature {
  title: string;
  description: string;
  image?: string | PayloadImage;
}

export interface PayloadProductSpec {
  value?: string;
}

export interface PayloadTechnicalTableEntry {
  label: string;
  value: string;
}

export interface PayloadHeroImage {
  image: string | PayloadImage;
}

export interface PayloadProduct {
  id: string;
  name: string;
  summary?: string;
  description?: string;
  brand: PayloadBrand | string;
  category: PayloadCategory | string;
  badge?: 'NEW' | 'TRENDING' | 'DISCONTINUED' | null;
  price?: number | null;
  heroImages?: PayloadHeroImage[];
  features?: PayloadProductFeature[];
  technicalTable?: PayloadTechnicalTableEntry[];
  specs?: PayloadProductSpec[];
  createdAt: string;
  updatedAt: string;
}

export interface PayloadPage {
  id: string;
  title: string;
  slug: string;
  content?: Record<string, unknown>;
  metaTitle?: string;
  metaDescription?: string;
  heroImage?: string | PayloadImage;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PayloadListResponse<T> {
  docs: T[];
  totalDocs: number;
  limit: number;
  totalPages: number;
  page: number;
  pagingCounter: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage: number | null;
  nextPage: number | null;
}

// Normalized types for the frontend
export interface Product {
  id: string;
  name: string;
  summary: string;
  description: string;
  brand: string;
  category: string;
  heroImages: string[];
  features: { title: string; description: string; image: string }[];
  specs: string[];
  technicalTable: { label: string; value: string }[];
  badge: string | null;
  price: number | null;
}

export interface Category {
  id: string;
  name: string;
  tagline: string;
  icon: string;
  description: string;
  image: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  description: string;
  productCount: number;
  image: string;
}

function resolveImageUrl(url: string | undefined | null): string {
  if (!url) return '';
  if (url.startsWith('/api/')) return `${CMS_URL}${url}`;
  return url;
}

function resolveImage(obj: string | PayloadImage | undefined | null): string {
  if (!obj) return '';
  if (typeof obj === 'string') return resolveImageUrl(obj);
  if (obj.url) return resolveImageUrl(obj.url);
  if (obj.sizes?.medium?.url) return resolveImageUrl(obj.sizes.medium.url);
  if (obj.sizes?.thumbnail?.url) return resolveImageUrl(obj.sizes.thumbnail.url);
  return '';
}

function resolveName(rel: string | { name: string } | undefined | null): string {
  if (!rel) return '';
  if (typeof rel === 'string') return rel;
  return rel.name;
}

export function normalizeProduct(p: PayloadProduct): Product {
  return {
    id: p.id,
    name: p.name,
    summary: p.summary || '',
    description: p.description || '',
    brand: resolveName(p.brand),
    category: resolveName(p.category),
    heroImages: (p.heroImages || []).map(h => resolveImage(h.image)),
    features: (p.features || []).map(f => ({
      title: f.title,
      description: f.description,
      image: resolveImage(f.image),
    })),
    specs: (p.specs || []).map(s => s.value || ''),
    technicalTable: (p.technicalTable || []).map(t => ({
      label: t.label,
      value: t.value,
    })),
    badge: p.badge || null,
    price: p.price || null,
  };
}

export function normalizeCategory(c: PayloadCategory): Category {
  return {
    id: c.id,
    name: c.name,
    tagline: c.tagline || '',
    icon: c.icon || '',
    description: c.description || '',
    image: resolveImage(c.image),
  };
}

async function fetchAPI<T>(endpoint: string): Promise<T> {
  const res = await fetch(`${CMS_URL}/api${endpoint}`);
  if (!res.ok) throw new Error(`Payload API ${res.status}: ${res.statusText}`);
  return res.json();
}

export async function getProducts(): Promise<Product[]> {
  const data = await fetchAPI<PayloadListResponse<PayloadProduct>>('/products?depth=2&limit=100');
  return (data.docs || []).map(normalizeProduct);
}

export async function getProduct(id: string): Promise<Product | null> {
  const data = await fetchAPI<PayloadListResponse<PayloadProduct>>(`/products?where[id][equals]=${id}&depth=2`);
  const docs = data.docs || [];
  return docs.length > 0 ? normalizeProduct(docs[0]) : null;
}

export async function getCategories(): Promise<Category[]> {
  const data = await fetchAPI<PayloadListResponse<PayloadCategory>>('/categories?depth=1&limit=50');
  return (data.docs || []).map(normalizeCategory);
}

export async function getCategory(id: string): Promise<Category | null> {
  const data = await fetchAPI<PayloadListResponse<PayloadCategory>>(`/categories?where[id][equals]=${id}&depth=1`);
  const docs = data.docs || [];
  return docs.length > 0 ? normalizeCategory(docs[0]) : null;
}

export async function getBrands(): Promise<Brand[]> {
  const products = await getProducts();
  const brandMap = new Map<string, Product[]>();
  for (const p of products) {
    const name = p.brand || 'Other';
    if (!brandMap.has(name)) brandMap.set(name, []);
    brandMap.get(name)!.push(p);
  }
  const toSlug = (str: string) => str.toLowerCase().replace(/[\s/]+/g, '-').replace(/[^a-z0-9-]/g, '');
  return Array.from(brandMap.entries())
    .filter(([name]) => name && name !== 'Other')
    .sort((a, b) => b[1].length - a[1].length)
    .map(([name, prods]) => ({
      id: toSlug(name),
      name,
      slug: toSlug(name),
      description: '',
      productCount: prods.length,
      image: prods[0]?.heroImages?.[0] || '',
    }));
}
