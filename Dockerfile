# syntax=docker/dockerfile:1.7
# Imagen del API de OpenMuse (backend + packages compartidos).
# El browser worker (Playwright) y el computer (Docker Linux) son contenedores aparte.

# ---------- build ----------
FROM node:22-bookworm-slim AS build
ENV PNPM_HOME=/pnpm PATH=/pnpm:$PATH
RUN corepack enable && corepack prepare pnpm@11.19.0 --activate
WORKDIR /app
COPY . .
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm install --frozen-lockfile
# DOCKER_BUILD_WEB_V1 - el API sirve apps/web/dist en el mismo origen
# (app.ts, serveStatic). Sin este build la imagen arranca solo con API y el
# panel da 404, que es peor que un fallo de build visible.
RUN pnpm build:server && pnpm --filter @openmuse/web build

# ---------- runtime ----------
FROM node:22-bookworm-slim AS runtime
ENV NODE_ENV=production
WORKDIR /app
RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates tini \
    && rm -rf /var/lib/apt/lists/*
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
# app.ts resuelve ../apps/web/dist desde dist/apps/server/src.
COPY --from=build /app/apps/web/dist ./dist/apps/web/dist
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/apps/computer/workspace-template ./dist/apps/computer/workspace-template
RUN mkdir -p /data && chown -R node:node /data
ENV DATA_DIR=/data
USER node
EXPOSE 8787
ENTRYPOINT ["/usr/bin/tini","--"]
CMD ["node","dist/apps/server/src/index.js"]