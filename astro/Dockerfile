FROM node:22-slim

# Install system Chromium — Puppeteer uses its bundled download in local dev,
# but in the container we use the Debian package to avoid downloading Chromium
# at npm ci time and to get proper system library integration.
RUN apt-get update && apt-get install -y \
    chromium \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Skip Puppeteer's bundled Chromium download — we use the system package above
ENV PUPPETEER_SKIP_DOWNLOAD=true
COPY package.json package-lock.json ./
RUN npm ci

# Build the Astro SSR application
COPY . .
RUN npm run build

ENV HOST=0.0.0.0
ENV NODE_ENV=production
# Point Puppeteer at the system-installed Chromium binary
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

EXPOSE 4321

CMD ["node", "./dist/server/entry.mjs"]
