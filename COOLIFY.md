# Coolify Deployment Guide

This repo is configured to deploy on Coolify using the root `docker-compose.yml`.

## Recommended Coolify Setup (Single Docker Compose Resource)

### 1. Create the resource in Coolify

- Go to your Coolify dashboard
- Click **+ New Resource** → **Docker Compose**
- **Source**: GitHub → `syedhashimabbas218-png/autodiagnostix-site`
- **Branch**: `migrate/astro`
- **Docker Compose Location**: `docker-compose.yml` (root)
- **Name**: `autodiagnostix-prod`

### 2. Configure environment variables

In the Coolify resource → **Environment Variables** tab, set:

```env
# Postgres
POSTGRES_PASSWORD=<strong-password-32-chars>

# Strapi secrets (generate with openssl rand -base64 32)
STRAPI_APP_KEYS=<key1>,<key2>,<key3>,<key4>
STRAPI_API_TOKEN_SALT=<random>
STRAPI_ADMIN_JWT_SECRET=<random>
STRAPI_TRANSFER_TOKEN_SALT=<random>
STRAPI_JWT_SECRET=<random>

# Astro
SITE_URL=https://autodiagnostix.com
```

The `STRAPI_*` vars are consumed by the `strapi` service (see `docker-compose.yml`).

### 3. Set up domains

In Coolify, configure two domain mappings:

| Service | Domain | Port |
|---------|--------|------|
| astro | `autodiagnostix.com`, `www.autodiagnostix.com` | 4321 |
| strapi | `strapi.autodiagnostix.com` | 1337 |

(Or use Coolify's automatic Traefik labels — see below.)

### 4. Persistent storage

Coolify automatically persists Docker named volumes:
- `pgdata` → Postgres data
- `strapi_uploads` → User-uploaded media

Make sure these are set to **persistent** in the resource settings.

### 5. First deploy

Click **Deploy**. Watch the logs:

1. `postgres` becomes healthy first
2. `strapi` builds (~2-3 min first time) and starts on port 1337
3. `astro` builds (~1-2 min) and starts on port 4321

After `strapi` is up, visit `https://strapi.autodiagnostix.com/admin` and create the first admin user.

### 6. CORS (optional but recommended)

For production, update `strapi/config/middlewares.ts` to allow only your Astro domain:

```ts
{
  name: 'strapi::cors',
  config: {
    origin: ['https://autodiagnostix.com', 'https://www.autodiagnostix.com']
  }
}
```

(Already configured for local dev with `http://localhost:4321`.)

## Health checks

- Frontend: `https://autodiagnostix.com/`
- Strapi: `https://strapi.autodiagnostix.com/_health`
- Postgres: internal healthcheck (handled by docker-compose)

## Updating

1. Push changes to `migrate/astro` branch on GitHub
2. In Coolify, click **Redeploy** on the resource
3. Coolify pulls the latest code and rebuilds the affected services

## Troubleshooting

### Strapi boots but admin shows 502
The Strapi admin panel takes ~2 minutes to compile on first boot. Wait and refresh.

### Astro shows "Failed to fetch products"
Check that `STRAPI_URL` env var in the astro service points to a reachable Strapi (`http://strapi:1337` for internal docker network, or `https://strapi.yourdomain.com` for external).

### PDFs don't generate
Puppeteer needs headless Chromium. The Astro Dockerfile installs it via `node:22-alpine` + apt deps. If you customized the base image, ensure `chromium` is available.

## Backup strategy

To backup the database:
```bash
docker exec -t autodiagnostix_postgres pg_dump -U autodiagnostix autodiagnostix_strapi > backup-$(date +%F).sql
```

To backup uploads:
```bash
docker run --rm -v autodiagnostix_strapi_uploads:/data -v $PWD:/backup alpine tar czf /backup/uploads-$(date +%F).tar.gz /data
```

Schedule these via Coolify's scheduled tasks or an external cron.
