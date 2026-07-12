# --- Stage 1: Base & Build ---
FROM node:22-alpine AS builder

# Instalar pnpm de forma global e independiente
RUN npm install -g pnpm

WORKDIR /app

COPY package.json pnpm-lock.yaml tsconfig.json tsup.config.ts* ./

RUN pnpm install --frozen-lockfile --ignore-scripts=false


COPY src/ ./src

RUN pnpm build

RUN pnpm prune --prod

FROM node:22-alpine AS runner

WORKDIR /app

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

ENV NODE_ENV=production

CMD ["npm", "run", "start"]