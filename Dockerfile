# --- Etapa 1: Build nativo en el Host (AMD64 en GitHub) ---
FROM --platform=$BUILDPLATFORM node:22-alpine AS builder

WORKDIR /app

# INSTALACIÓN CRUCIAL: Necesitamos pnpm en el builder para compilar
RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml tsconfig.json tsup.config.ts* ./

# Forzar la aprobación nativa compatible con pnpm v11
RUN pnpm_config_only_built_dependencies=esbuild pnpm install --frozen-lockfile

COPY src/ ./src
RUN pnpm build


# --- Etapa 2: Imagen de producción final (ARM64 para tu clúster) ---
FROM node:22-alpine AS runner

WORKDIR /app

# También necesitamos pnpm aquí para descargar las dependencias de producción
RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./

# Instalar solo dependencias puras sin scripts binarios molestos de desarrollo
RUN pnpm install --prod --frozen-lockfile

# Copiar el compilado JS plano generado en la primera etapa nativa
COPY --from=builder /app/dist ./dist

ENV NODE_ENV=production

CMD ["node", "dist/index.js"]