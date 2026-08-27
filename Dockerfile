# syntax=docker/dockerfile:1

# ------------------------------------------------------------------------------
# Stage 1 — build the Vite bundle
#
# Vite inlines `import.meta.env.VITE_*` at build time, so anything the app needs
# to know about its environment has to arrive as a build argument, not a runtime
# env var. Dokploy passes these through under "Build Args".
# ------------------------------------------------------------------------------
FROM node:22-alpine AS build

WORKDIR /app

# Install dependencies first so this layer is cached until the lockfile changes.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG VITE_API_BASE_URL=http://localhost:8000/api
ARG VITE_APP_NAME=PEA
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_APP_NAME=$VITE_APP_NAME

# `npm run build` runs `tsc -b && vite build`, so a type error fails the image
# rather than shipping a broken bundle.
RUN npm run build

# ------------------------------------------------------------------------------
# Stage 2 — serve the static bundle
# ------------------------------------------------------------------------------
FROM nginx:1.27-alpine AS runtime

# The listen port comes from $PORT so the image drops into any host that expects
# a particular one — Dokploy defaults new applications to 3000, other platforms
# to 8080. Override with `-e PORT=3000`; nothing else has to change.
ENV PORT=80

# The nginx image's entrypoint runs envsubst over /etc/nginx/templates/*.template
# at startup. It substitutes only names that exist as environment variables, so
# nginx's own $uri and $host are left untouched.
#
# Client-side routing needs every unknown path to fall back to index.html,
# otherwise a refresh on /exam-admin/dashboard returns a 404 from nginx.
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider "http://127.0.0.1:${PORT}/healthz" || exit 1

CMD ["nginx", "-g", "daemon off;"]
