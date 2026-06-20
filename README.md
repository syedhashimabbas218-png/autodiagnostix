# Autodiagnostix

Pakistan's authorized dealer for **LAUNCH**, **SMARTSAFE**, **UNITE**, **Liberty Lifts**, and **GTI.tools** — automotive diagnostic and workshop equipment.

- **Frontend**: Astro 5 (hybrid SSR) with React islands
- **CMS**: Strapi v5 (PostgreSQL)
- **PDFs**: Generated on-demand with Puppeteer (server-side)
- **Hosting**: Docker Compose — designed for Coolify

## Project structure

```
/
├── astro/                  # Astro frontend (port 4321)
│   ├── src/                # Pages, components, lib
│   ├── public/             # Static assets (logos, images)
│   ├── scripts/            # One-off import & PDF scripts
│   ├── Dockerfile
│   └── .env.example
├── strapi/                 # Strapi v5 CMS (port 1337)
│   ├── config/             # Server, database, plugins
│   ├── src/api/            # Content-types (product, brand, category)
│   ├── database/           # Migrations
│   ├── public/uploads/     # User-uploaded media (gitignored)
│   ├── Dockerfile
│   └── .env.example
├── docker-compose.yml      # All three services (postgres, strapi, astro)
└── .gitignore
```

## Quick start (local dev)

```bash
# 1. Start everything
docker compose up -d

# 2. Create first admin user
# Visit http://localhost:1337/admin and complete the setup wizard

# 3. Frontend
open http://localhost:4321
```

## Quick start (without Docker)

```bash
# Strapi
cd strapi
cp .env.example .env
npm install
npm run develop            # http://localhost:1337

# Astro (in another terminal)
cd astro
cp .env.example .env       # edit STRAPI_URL if needed
npm install
npm run dev                # http://localhost:4321
```

## Required environment variables

### `strapi/.env`

| Variable | Description |
|---|---|
| `APP_KEYS` | Comma-separated keys (generate with `openssl rand -base64 16`) |
| `API_TOKEN_SALT` | Random salt (generate with `openssl rand -base64 16`) |
| `ADMIN_JWT_SECRET` | Random secret (generate with `openssl rand -base64 16`) |
| `TRANSFER_TOKEN_SALT` | Random salt (generate with `openssl rand -base64 16`) |
| `JWT_SECRET` | Random secret (generate with `openssl rand -base64 16`) |
| `ENCRYPTION_KEY` | Random key (generate with `openssl rand -base64 16`) |
| `DATABASE_URL` | Postgres connection string (handled by docker-compose) |

Generate all secrets at once:
```bash
for k in APP_KEYS API_TOKEN_SALT ADMIN_JWT_SECRET TRANSFER_TOKEN_SALT JWT_SECRET ENCRYPTION_KEY; do
  echo "$k=$(openssl rand -base64 24)"
done
```

### `astro/.env`

| Variable | Description |
|---|---|
| `STRAPI_URL` | Public URL of Strapi (e.g. `http://strapi:1337` in docker, `http://localhost:1337` locally) |
| `SITE_URL` | Public site URL for SEO/sitemap (e.g. `https://autodiagnostix.com`) |

## Deploying to Coolify

The repo is already wired up for Coolify. Two recommended approaches:

### Option A — Single docker-compose service (recommended)

1. In Coolify, create a new resource → **Docker Compose**
2. Point it at the GitHub repo (`syedhashimabbas218-png/autodiagnostix-site`) and branch `migrate/astro`
3. Set the compose file path: `docker-compose.yml`
4. Add environment variables in Coolify's "Environment Variables" tab:
   - `POSTGRES_PASSWORD` — strong random password
   - `STRAPI_APP_KEYS` — comma-separated, e.g. `key1,key2,key3,key4`
   - `STRAPI_API_TOKEN_SALT`
   - `STRAPI_ADMIN_JWT_SECRET`
   - `STRAPI_TRANSFER_TOKEN_SALT`
   - `STRAPI_JWT_SECRET`
   - `SITE_URL` — your public domain
5. Configure domains:
   - `strapi.yourdomain.com` → strapi service (port 1337)
   - `www.yourdomain.com` → astro service (port 4321)
6. Deploy. After first boot, visit `https://strapi.yourdomain.com/admin` and create the admin user.

### Option B — Three separate services

Create one Coolify resource per service and wire them via a private network:

- `postgres` (resource type: **Database** → PostgreSQL)
- `strapi` (resource type: **Application** → Docker, `Dockerfile` in `./strapi`)
- `astro` (resource type: **Application** → Docker, `Dockerfile` in `./astro`)

For the astro service, set `STRAPI_URL=http://strapi:1337` (Coolify internal DNS).

## Generating secure Strapi secrets

```bash
# Single secret
openssl rand -base64 32

# All required keys (run this once)
node -e "
  for (const k of ['APP_KEYS','API_TOKEN_SALT','ADMIN_JWT_SECRET','TRANSFER_TOKEN_SALT','JWT_SECRET','ENCRYPTION_KEY']) {
    console.log(k + '=' + (k === 'APP_KEYS' ? Array.from({length:4}, () => require('crypto').randomBytes(32).toString('base64')).join(',') : require('crypto').randomBytes(32).toString('base64')));
  }
}"
```

## Notes

- **First Strapi boot** is slow (~2 min) because it compiles the admin panel.
- **Astro build** runs inside the container — the public dist is generated at build time.
- The first PDF request after deploy may take a few extra seconds because Puppeteer launches headless Chrome.
- Strapi uploads are persisted in the `strapi_uploads` Docker volume.

## Branches

- `main` — legacy SPA, kept for reference
- `migrate/astro` — current production branch (Astro + Strapi v5)
