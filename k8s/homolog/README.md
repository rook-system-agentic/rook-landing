# Homologação da landing page

`lp-homolog.rooksystem.com.br` — a LP pública rodando na VPS com k3s, ao lado
do app (`homolog.`), do ADM (`adm-homolog.`) e do Marketing OS (`site-homolog.`).

Produção continua na Vercel, a partir da `main`. Este ambiente nunca a toca.

## Fluxo

```
branch de trabalho  →  homolog  →  main
                        │            │
                        │            └─ Vercel publica rook.com.br
                        └─ este workflow publica lp-homolog.rooksystem.com.br
```

Push ou merge na `homolog` dispara `deploy-homolog.yml`. Sem filtro de caminho:
o ambiente reflete a branch inteira.

PR para `main` só é aceito vindo de `homolog`, `hotfix/*` ou `revert-*` — o
check `Base Guard` reprova o resto.

## O que precisa existir antes do primeiro deploy

Nada disto está no git, e é assim que deve ser.

### 1. Runner self-hosted deste repositório

Os runners existentes na VPS estão registrados em
`github.com/rook-system-agentic/rook-system` — este repositório **não os
enxerga**. É preciso registrar um runner próprio, com os mesmos rótulos que o
workflow pede (`self-hosted, linux, x64, rook-vps`), e com acesso ao mesmo
kubeconfig restrito (`/opt/actions-runner/.kube/config`, ServiceAccount
`gha-deployer`, limitada ao namespace `rook-homolog`).

### 2. Secret `rook-lp-secrets` no namespace

```
kubectl -n rook-homolog create secret generic rook-lp-secrets \
  --from-literal=SUPABASE_URL='https://supabase-homolog.rooksystem.com.br' \
  --from-literal=SUPABASE_SERVICE_ROLE_KEY='...' \
  --from-literal=RESEND_API_KEY='...'
```

⚠️ **`SUPABASE_URL` precisa apontar para o Supabase de homologação.** Se
apontar para o de produção, cada teste de newsletter ou de lead comercial nesta
página grava na base real — a LP escreve em `commercial_leads` e
`newsletter_*`.

Sobre o `RESEND_API_KEY`: sem ele o formulário de newsletter falha ao enviar. Se
não houver chave separada para homologação, é preferível deixar a variável
vazia e conviver com o erro no formulário a usar a chave de produção e disparar
e-mail de verdade a partir de um ambiente de teste.

### 3. DNS

Registro `lp-homolog` na zona `rooksystem.com.br`, apontando para
`179.198.109.68`, atrás do Cloudflare como os demais. O TLS é o Origin
Certificate curinga de `*.rooksystem.com.br` já instalado no ingress-nginx; não
há cert-manager no cluster.

## Rastreamento

O Google Analytics e o Microsoft Clarity têm o ID **fixo no código** — não há
variável que os desligue. `NEXT_PUBLIC_ENV=homolog` é o que os silencia, via
`src/lib/tracking.ts`, e é passado como build-arg no Dockerfile.

Sem isso, cada visita de revisão aqui viraria visitante real no Analytics e
sessão gravada no Clarity de produção.

O ingress também devolve `X-Robots-Tag: noindex, nofollow`, para o ambiente não
competir com o site real na busca.

## O que este ambiente não cobre

- Otimização de imagem (`images.unoptimized`), igual à produção
- Os crons da Vercel (`vercel.json`) — aqui não há CronJob
- Envio real de e-mail, se a chave do Resend não for provisionada
