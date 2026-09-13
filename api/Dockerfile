FROM node:24-bookworm-slim AS builder

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./

# Torna o npm mais tolerante a oscilações de rede.
RUN npm config set fetch-retries 5 \
    && npm config set fetch-retry-mintimeout 20000 \
    && npm config set fetch-retry-maxtimeout 120000 \
    && npm config set fetch-timeout 300000

RUN --mount=type=cache,target=/root/.npm \
    npm ci \
      --legacy-peer-deps \
      --no-audit \
      --no-fund

COPY prisma.config.ts ./
COPY prisma ./prisma
COPY nest-cli.json ./
COPY tsconfig.json ./
COPY tsconfig.build.json ./
COPY src ./src

# Usada apenas pelo prisma generate durante o build.
# Não conecta nesse banco.
ENV DATABASE_URL="postgresql://devflow:devflow@localhost:5432/devflow?schema=devflow"

RUN npx prisma generate

RUN npm run build

# Depois do build, conserva apenas dependências de produção.
RUN npm prune \
    --omit=dev \
    --legacy-peer-deps \
    --no-audit \
    --no-fund


FROM node:24-bookworm-slim AS runtime

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/main.js"]