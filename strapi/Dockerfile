FROM node:22-slim

WORKDIR /app

# Install dev dependencies needed for strapi build (admin panel compilation)
COPY package.json package-lock.json ./
RUN npm ci

# Build the application (admin panel + TypeScript compilation)
COPY . .
RUN npm run build

# Prune dev dependencies — they are not needed at runtime
RUN mkdir -p /app/public/uploads

RUN npm prune --omit=dev

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=1337

EXPOSE 1337

CMD ["npm", "run", "start"]
