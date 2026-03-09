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

RUN npm run build

# ── Stage 3: Production runner ────────────────────────────────────────────────
FROM node:22-alpine AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nuxt

# Nuxt output is self-contained — no node_modules needed at runtime
COPY --from=builder --chown=nuxt:nodejs /app/.output ./.output

USER nuxt

EXPOSE 4000

ENV PORT=4000
ENV HOST=0.0.0.0

CMD ["node", ".output/server/index.mjs"]
