FROM node:24-bookworm-slim AS builder

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm config set fetch-retries 5 \
    && npm config set fetch-retry-mintimeout 20000 \
    && npm config set fetch-retry-maxtimeout 120000 \
    && npm config set fetch-timeout 300000

RUN --mount=type=cache,target=/root/.npm \
    npm ci \
      --legacy-peer-deps \
      --no-audit \
      --no-fund

COPY . .

RUN npm run build

FROM nginx:1.29-alpine AS runtime

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder \
    /app/dist/dashboard/browser \
    /usr/share/nginx/html

RUN cp \
    /usr/share/nginx/html/index.csr.html \
    /usr/share/nginx/html/index.html

EXPOSE 80

HEALTHCHECK \
  --interval=10s \
  --timeout=5s \
  --retries=5 \
  --start-period=10s \
  CMD wget -q --spider http://127.0.0.1/ || exit 1

CMD ["nginx", "-g", "daemon off;"]