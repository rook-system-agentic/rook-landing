# Imagem da landing de produção servida em https://www.rook.com.br pelo k3s da
# Hostinger. Construída pelo workflow deploy-production.yml a partir da `main`.
FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat
RUN corepack enable && corepack prepare pnpm@9.1.0 --activate
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm-store-landing-production,target=/pnpm/store \
    pnpm config set store-dir /pnpm/store --global \
 && pnpm install --frozen-lockfile

FROM deps AS builder
COPY . .

ARG NEXT_PUBLIC_ENV=production
ARG NEXT_PUBLIC_SITE_URL=https://www.rook.com.br
ARG NEXT_PUBLIC_ASAFLOW_CHAT_ENABLED=false
ARG NEXT_PUBLIC_ASAFLOW_CHAT_TENANT
ARG NEXT_PUBLIC_ASAFLOW_CHAT_FLOW
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG SUPABASE_URL
ARG SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_ENV=$NEXT_PUBLIC_ENV \
    NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL \
    NEXT_PUBLIC_ASAFLOW_CHAT_ENABLED=$NEXT_PUBLIC_ASAFLOW_CHAT_ENABLED \
    NEXT_PUBLIC_ASAFLOW_CHAT_TENANT=$NEXT_PUBLIC_ASAFLOW_CHAT_TENANT \
    NEXT_PUBLIC_ASAFLOW_CHAT_FLOW=$NEXT_PUBLIC_ASAFLOW_CHAT_FLOW \
    NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL \
    NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY \
    SUPABASE_URL=$SUPABASE_URL \
    SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY \
    NEXT_TELEMETRY_DISABLED=1 \
    NODE_OPTIONS=--max-old-space-size=4096

RUN test "$NEXT_PUBLIC_ENV" = production
RUN test "$NEXT_PUBLIC_SITE_URL" = https://www.rook.com.br
# Os slugs são públicos. Precisam chegar ao Next antes do build; envFrom no
# Deployment não altera as constantes já incorporadas no JavaScript do browser.
RUN case "$NEXT_PUBLIC_ASAFLOW_CHAT_ENABLED" in \
      true) test -n "$NEXT_PUBLIC_ASAFLOW_CHAT_TENANT" && test -n "$NEXT_PUBLIC_ASAFLOW_CHAT_FLOW" ;; \
      false) ;; \
      *) exit 1 ;; \
    esac
RUN --mount=type=cache,id=next-landing-production,target=/app/.next/cache \
    npx next build

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
