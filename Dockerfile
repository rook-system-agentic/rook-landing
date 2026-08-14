# ============================================================
# rook-landing — imagem de HOMOLOGAÇÃO
#
# Contexto de build = raiz deste repositório:
#   docker build -f Dockerfile .
#
# ⚠️ NÃO PROMOVÍVEL PARA PRODUÇÃO.
# Os `NEXT_PUBLIC_*` entram no bundle do browser em tempo de build, e aqui eles
# declaram o ambiente como homologação — o que desliga o rastreamento (ver
# src/lib/tracking.ts). Promover este artefato para produção publicaria um site
# que não mede nada. O que se promove é código, pela branch.
#
# Espelha o padrão de apps/marketing/Dockerfile no monorepo rook-system, com a
# diferença de que aqui não há workspace: é um repositório de app só.
# ============================================================

# ── dependências ────────────────────────────────────────────────────────────
# Só os manifestos entram nesta camada. Ela só é invalidada quando uma
# dependência muda; mudança de código reaproveita o install inteiro.
FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat
RUN corepack enable && corepack prepare pnpm@9.1.0 --activate
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm-store-landing,target=/pnpm/store \
    pnpm config set store-dir /pnpm/store --global \
 && pnpm install --frozen-lockfile

# ── build ───────────────────────────────────────────────────────────────────
FROM deps AS builder
COPY . .

# Precisam existir ANTES do build: é aí que entram no bundle do browser.
ARG NEXT_PUBLIC_ENV=homolog
ARG NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_ENV=$NEXT_PUBLIC_ENV \
    NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL \
    NEXT_TELEMETRY_DISABLED=1 \
    NODE_OPTIONS=--max-old-space-size=4096

RUN test -n "$NEXT_PUBLIC_SITE_URL" || (echo "ERRO: NEXT_PUBLIC_SITE_URL nao foi passado como --build-arg" && exit 1)

# O `prebuild` do package.json busca o catálogo de planos por rede. Numa
# imagem de homologação isso é dependência externa no meio do build: se a
# origem estiver fora do ar, o deploy quebra por algo que não é código. O
# script já cai para o snapshot versionado quando a busca falha, e é esse
# caminho que queremos aqui — daí `--ignore-scripts` valer só para o prebuild,
# chamando o `next build` direto.
RUN --mount=type=cache,id=next-landing,target=/app/.next/cache \
    npx next build

# ── runtime ─────────────────────────────────────────────────────────────────
FROM node:22-alpine AS runner
RUN apk add --no-cache libc6-compat
WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

RUN mkdir -p /app/.next/cache && chown -R node:node /app/.next
USER node
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/').then(r=>process.exit(r.status<400?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server.js"]
