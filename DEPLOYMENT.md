# Deployment Guide (Coolify — Dockerfiles)

This monorepo contains three deployables. All deploy from the **`main`** branch.

> **Why Dockerfiles?** The Coolify host uses Docker on fuse-overlayfs (inside a LXD
> container). Nixpacks' Nix setup phase extracts hundreds of thousands of tiny files
> and triggers OOM kills. Simple Dockerfiles avoid this entirely.

---

## 1. Astro — Production Frontend

| Setting | Value |
|---------|-------|
| **Base directory** | `astro/` |
| **Branch** | `main` |
| **Build command** | `npm ci && npm run build` |
| **Start command** | `node ./dist/server/entry.mjs` |
| **Output directory** | `astro/dist/` (SSR: `dist/server/` + `dist/client/`) |
| **Port** | `4321` |
| **Host** | `0.0.0.0` (set via `ASTRO_HOST` env or server config) |
| **Type** | Node.js SSR (`@astrojs/node` adapter, `output: 'server'`) |
| **Dockerfile** | `astro/Dockerfile` |
| **Suggested watch paths** | `astro/**` |

### Required environment variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PUBLIC_STRAPI_URL` | URL of the Strapi CMS API | `http://strapi:1337` |
| `SITE_URL` | Canonical site URL | `https://autodiagnostix.com.pk` |

### Content updates

Astro is SSR and fetches content from Strapi on every request. Published content appears immediately — **no rebuild is needed** when Strapi data changes.

### Runtime dependencies

**Puppeteer (Chromium)** is used for on-demand PDF generation at `GET /api/product-pdf/:slug`.

The `astro/Dockerfile` installs Debian's `chromium` package at build time and sets
`PUPPETEER_SKIP_DOWNLOAD=true` (avoiding the bundled Chromium download) and
`PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium` so Puppeteer uses the system binary.
The Puppeteer launch code (`[slug].ts`) does not pass an explicit `executablePath`,
so it automatically respects the env var; local development continues to use the
bundled Chromium.

> **Warning**: The `--no-sandbox` flag is set in the launch args. This is acceptable
> only inside the isolated deployment container. Do **not** use `--no-sandbox` for
> local development or on untrusted networks.

---

## 2. Strapi — Headless CMS

| Setting | Value |
|---------|-------|
| **Base directory** | `strapi/` |
| **Branch** | `main` |
| **Build command** | `npm ci && npm run build` |
| **Start command** | `npm run start` |
| **Port** | `1337` |
| **Host** | `0.0.0.0` (reads `HOST` env var) |
| **Type** | Node.js service |
| **Dockerfile** | `strapi/Dockerfile` |
| **Suggested watch paths** | `strapi/**` |

### Required environment variables

All variables are listed in `strapi/.env.example`. Key ones:

| Variable | Description |
|----------|-------------|
| `HOST` | Bind address (`0.0.0.0`) |
| `PORT` | Listen port (`1337`) |
| `PUBLIC_URL` | Public URL for admin panel (behind Coolify proxy) |
| `DATABASE_CLIENT` | `postgres` |
| `DATABASE_URL` | PostgreSQL connection string |
| `DATABASE_HOST` / `DATABASE_PORT` / `DATABASE_NAME` / `DATABASE_USERNAME` / `DATABASE_PASSWORD` | Discrete database settings (fallback when `DATABASE_URL` is not set) |
| `DATABASE_SSL` | Set to `true` if using SSL connections |
| `APP_KEYS` | Comma-separated session keys (generate with `openssl rand -base64 32` × 4) |
| `API_TOKEN_SALT` | API token salt |
| `ADMIN_JWT_SECRET` | Admin JWT secret |
| `TRANSFER_TOKEN_SALT` | Transfer token salt |
| `JWT_SECRET` | JWT secret |
| `ENCRYPTION_KEY` | Encryption key |
| `CORS_ORIGINS` | Comma-separated allowed origins (e.g. `https://autodiagnostix.com.pk,https://www.autodiagnostix.com.pk`; set to `*` for development) |

### Database

PostgreSQL 16. The app reads `DATABASE_CLIENT` and either `DATABASE_URL` or discrete `DATABASE_HOST`/`PORT`/`NAME`/`USERNAME`/`PASSWORD`.

### Persistent storage

Uploaded media is stored on local disk at `strapi/public/uploads/`. **A persistent volume must be configured** in Coolify, or switch to an S3-compatible provider.

No custom upload config is set — the default local-disk provider is active.

### CORS

The CORS middleware reads the `CORS_ORIGINS` env var (comma-separated). In development it falls back to `*`. In production, set it to your frontend domain(s):
```
CORS_ORIGINS=https://autodiagnostix.com.pk,https://www.autodiagnostix.com.pk
```

---

## 3. Legacy SPA (not deployed)

| Setting | Value |
|---------|-------|
| **Base directory** | `app/` |
| **Status** | **Not deployed** — targets the retired Payload CMS |

This React 19 + Vite 8 SPA is kept in the repo for reference only. It uses `VITE_CMS_URL` to reach the old Payload CMS on `http://localhost:3000`. No deployment configuration is maintained.

---

## Verification

| App | `npm ci` | `npm run build` | Status |
|-----|----------|-----------------|--------|
| `astro/` | ✓ | ✓ | SSR build produces `dist/` |
| `strapi/` | ✓ | ✓ | Admin panel compiles, TS compiles |
| `app/` | ✓ | ✓ (vite) | Core build works (prerender step fails locally — requires `npx` on PATH; not a deployment blocker since app is not deployed) |
