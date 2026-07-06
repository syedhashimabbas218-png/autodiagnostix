FROM node:22-alpine AS base

FROM base AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ENV NODE_ENV=production
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=1337

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 strapi

COPY --chown=strapi:nodejs package.json package-lock.json ./
RUN npm ci --omit=dev && rm -rf ~/.npm

COPY --chown=strapi:nodejs --from=builder /app/dist ./dist
COPY --chown=strapi:nodejs --from=builder /app/.strapi ./.strapi
COPY --chown=strapi:nodejs --from=builder /app/tsconfig.json ./tsconfig.json
COPY --chown=strapi:nodejs --from=builder /app/public ./public

USER strapi
EXPOSE 1337

CMD ["node", "node_modules/@strapi/strapi/bin/strapi.js", "start"]
