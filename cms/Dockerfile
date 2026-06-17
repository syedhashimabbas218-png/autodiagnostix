FROM node:22-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY tsconfig.json next.config.mjs next-env.d.ts payload.config.ts payload-types.ts ./
COPY collections/ ./collections/
COPY app/ ./app/
COPY scripts/ ./scripts/
COPY public/ ./public/
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 payload

COPY --from=builder /app/.next/standalone/cms ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

RUN mkdir -p /app/public/media && chown -R payload:nodejs /app

USER payload
EXPOSE 3000

CMD ["node", "server.js"]
