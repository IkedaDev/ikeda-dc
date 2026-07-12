FROM --platform=$BUILDPLATFORM node:22-alpine AS builder

WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.json tsup.config.ts* ./

RUN pnpm install --frozen-lockfile

COPY src/ ./src
RUN pnpm build


# --- Etapa 2: Imagen de producción final (ARM64 para tu clúster) ---
FROM node:22-alpine AS runner

WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Instalamos solo dependencias de producción
RUN pnpm install --prod --frozen-lockfile

# Copiar el empaquetado JS plano generado en la etapa nativa
COPY --from=builder /app/dist ./dist

ENV NODE_ENV=production

CMD ["node", "dist/index.js"]