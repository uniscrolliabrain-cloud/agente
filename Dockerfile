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
RUN pnpm build:server

# ---------- runtime ----------
FROM node:22-bookworm-slim AS runtime
ENV NODE_ENV=production
WORKDIR /app
RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates tini \
    && rm -rf /var/lib/apt/lists/*
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/apps/computer/workspace-template ./dist/apps/computer/workspace-template
RUN mkdir -p /data && chown -R node:node /data
ENV DATA_DIR=/data
USER node
EXPOSE 8787
ENTRYPOINT ["/usr/bin/tini","--"]
CMD ["node","dist/apps/server/src/index.js"]