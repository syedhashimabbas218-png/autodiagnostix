# Stack Overview — Autodiagnostix

**Monorepo** with 3 subsystems: Frontend (`app/`), Legacy REST API (`api/`), and Payload CMS (`cms/`).

---

## 1. Frontend — `app/`

| Path | What | How it's managed |
|---|---|---|
| `app/src/pages/` | 9 page components (Home, Categories, Products, Brands, Admin) | React Router in `App.jsx` maps routes: `/`, `/category/:id`, `/product/:id`, `/admin`, `/brands`, `/products` |
| `app/src/components/` | 9 reusable UI components (Header, Hero, CategoryNav, ProductGrid, ImageManager, Icons, GsapReveal, SeoHead, HomeComponents) | Imported by pages; Header is global across all routes |
| `app/src/data/` | 2 static JSON files (`homepage-content.json`, `hero-section.json`) | Directly imported by `HomePage.jsx` for static marketing copy |
| `app/src/config.js` | Single `CMS_URL` exported | Reads `VITE_CMS_URL` env var, defaults to `http://localhost:3000` |
| `app/src/payloadApi.js` | API client with normalizers and CRUD helpers | Used by wrapper pages (ProductWrapper, CategoryWrapper, AdminDashboard) |
| `app/src/utils/schema.js` | JSON-LD structured data helpers | Injected by `SeoHead.jsx` component |
| `app/public/` | Static assets served at `/` | Vite mounts this at root; images stored in `images-new/` |
| `app/scripts/` | 3 build/maintenance scripts | `prerender.mjs` (SSG), `generate-sitemap.mjs` (SEO), `stub-api.mjs` (mock API) |
| `app/tailwind.config.js` | Custom color palette (Material 3), 3 font families (Manrope/Inter/Inter), custom border radius | Edited directly for all visual tokens |
| `app/vite.config.js` | Vite + React plugin | Standard dev/build config |

**Stack**: React 19 + Vite 8 + Tailwind CSS + React Router

---

## 2. Legacy REST API — `api/`

| Path | What | How it's managed |
|---|---|---|
| `api/index.js` | Express server on port 3000 | Full CRUD for products & categories, image upload/proxy, bulk import |
| `api/data/products.json` | Product database | Read/written via REST endpoints; editable via Admin Dashboard UI |
| `api/data/categories.json` | Category database | Same pattern — Express JSON file CRUD |

**Endpoints**: `GET/POST/PUT/DELETE /api/products`, `/api/categories`, `POST /api/products/bulk`, `POST /api/upload`, `GET /api/images`, `GET /api/proxy`

---

## 3. Payload CMS — `cms/`

| Path | What | How it's managed |
|---|---|---|
| `cms/collections/` | 7 TS collection definitions | `Products.ts`, `Categories.ts`, `Brands.ts`, `Media.ts`, `Orders.ts`, `Pages.ts`, `Users.ts` |
| `cms/payload.config.ts` | Payload CMS configuration | MongoDB-compatible, auth, admin panel |
| `cms/Dockerfile` | Docker build for CMS | Built via `docker-compose.yml` |

**Stack**: Next.js 15 + Payload CMS 3 + PostgreSQL 16 (Docker)

---

## 4. Infrastructure

| Layer | Tool | How it's managed |
|---|---|---|
| Database | PostgreSQL 16 (Docker) | `docker-compose.yml` — auto-creates `autodiagnostix` DB |
| CMS container | Dockerized Payload | `docker compose up -d` |
| Frontend tunnel | **ngrok** to `localhost:5174` | Manual `ngrok http 5174` |
| Backend tunnel | **Cloudflare Tunnel** (`cloudflared`) | Shell script `restart-backend-tunnel.sh` |
| Execution | `concurrently` | Root `npm run dev` proxies to `app/` which runs both Vite + Express |
| SEO | Prerender + Sitemap | `app/scripts/prerender.mjs` + `app/scripts/generate-sitemap.mjs` |

---

## 5. Data Flow

```
User Browser  →  React SPA (Vite :5174)  →  CMS API (Express :3000)  →  JSON files (api/data/)
                                            └─ or ─→  Payload CMS (Next.js :3000)  →  PostgreSQL
```

- **Wrapper pattern**: Pages like `ProductWrapper.jsx` read URL params, fetch data from the API via `payloadApi.js`, then pass it as props to template pages
- **Admin Dashboard** (`/admin`) provides visual CRUD that writes directly to the Express JSON API
- **Image management**: Uploaded to `app/public/images-new/`, served at `/images-new/...`
