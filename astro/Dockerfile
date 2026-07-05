FROM node:22-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ENV STRAPI_URL=http://strapi:1337
ENV SITE_URL=https://autodiagnostix.com
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=4321

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 astro

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules

RUN chown -R astro:nodejs /app

USER astro
EXPOSE 4321

# OPTIMIZATION NOTE: For production, deploy behind nginx or Caddy as a reverse proxy
# to enable gzip/brotli compression, Cache-Control headers for static assets,
# security headers (CSP, HSTS, X-Frame-Options), and HTTP/2.
# See https://docs.astro.build/en/guides/deploy/ for deployment guides.
CMD ["node", "dist/server/entry.mjs"]
