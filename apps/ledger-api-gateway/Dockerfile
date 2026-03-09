# ── Stage 1: Install dependencies ────────────────────────────────────────────
FROM node:22-alpine AS deps
WORKDIR /app

COPY package*.json ./
RUN npm ci

# ── Stage 2: Build ────────────────────────────────────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# tsc compiles server.ts → dist/server.js
RUN npm run build

# ── Stage 3: Production runner ────────────────────────────────────────────────
FROM node:22-alpine AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 fastify

COPY --from=builder --chown=fastify:nodejs /app/dist        ./dist
COPY --from=deps    --chown=fastify:nodejs /app/node_modules ./node_modules
COPY --chown=fastify:nodejs package.json .

USER fastify

EXPOSE 3000

CMD ["node", "dist/server.js"]
