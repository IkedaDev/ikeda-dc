
FROM --platform=$BUILDPLATFORM node:22-alpine AS builder

WORKDIR /app

COPY package.json pnpm-lock.yaml tsconfig.json tsup.config.ts* ./

# Usamos la variable de configuración exacta que acepta pnpm v11 de manera nativa
RUN pnpm_config_only_built_dependencies=esbuild pnpm install --frozen-lockfile

COPY src/ ./src
RUN pnpm build


# --- Etapa 2: Imagen de producción final (ARM64 para tu clúster) ---
# Al quitar el build de aquí, el runner no necesita levantar tsup ni esbuild, evitando el error de QEMU
FROM node:22-alpine AS runner

WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./

# Instalamos únicamente dependencias limpias de producción (no compila binarios complejos)
RUN pnpm install --prod --frozen-lockfile

# Copiamos los archivos generados del build nativo
COPY --from=builder /app/dist ./dist

ENV NODE_ENV=production

CMD ["node", "dist/index.js"]