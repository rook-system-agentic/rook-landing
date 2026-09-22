# Landing de produção na Hostinger

Este diretório descreve o site `rook-landing` servido em `https://www.rook.com.br`
pelo k3s da Hostinger, no namespace `rook-production`. A homologação em
`rook-homolog` permanece separada.

## Fase de corte (21/09/2026)

A landing sai da Vercel. O que muda em relação à validação privada abaixo:

- `Dockerfile` e `lp.yaml` fixam `NEXT_PUBLIC_SITE_URL=https://www.rook.com.br`
  (domínio canônico; `rook.com.br` e `*.rooksystem.com.br` redirecionam para ele
  pelo Ingress `rook-redirects` do rook-system).
- A imagem é `rook-lp:production`, placeholder trocado por `rook-lp:prod-<sha>`
  pelo workflow `.github/workflows/deploy-production.yml` (push em `main` ou
  dispatch; build no runner da VPS, import no containerd, apply, rollout com
  rollback, smoke `--resolve www.rook.com.br:443:127.0.0.1`). Exige o secret de
  repositório `PROD_SUPABASE_ANON_KEY`.
- `lp.yaml` passa a incluir o Ingress `rook-lp` (`www.rook.com.br`, TLS pelo Secret
  `rook-origin`) e o pod ganha o label `rooksystem.com/internet-egress: "true"`
  para Resend e GTM.
- `generate-secret.sh` substitui o Secret existente preservando as credenciais
  já geradas (`COMMERCIAL_LEAD_ABUSE_SECRET`, `CONTENT_AUTOMATION_SECRET`,
  `CRON_SECRET`), aponta `NEXT_PUBLIC_SUPABASE_URL` para `https://supabase.rook.com.br`,
  usa `Rook <comunicacao@rook.com.br>` na newsletter e lê `RESEND_API_KEY` do
  arquivo root-only `/etc/rook-production/vercel/landing.production.env`.
- `cron/publish-scheduled.yaml` substitui o cron da Vercel: CronJob
  `cron-lp-publish-scheduled`, `0 * * * *`, suspenso por padrão. O workflow só o
  liga quando a variável de repositório `PROD_EXTERNAL_EFFECTS=true`.
- `vercel.json` desliga o deploy automático da Vercel na `main`
  (`git.deploymentEnabled.main=false`); o bloco `crons` fica até o projeto ser
  removido da Vercel.

Dependência no rook-system: as NetworkPolicies `allow-cron-to-apps` e
`allow-apps-from-cron` (`k8s/production/bootstrap/05-cutover-network.yaml`)
precisam incluir `rook-lp` entre os alvos; até lá o pod curl do CronJob não
alcança o Service. O Ingress já é aceito por `allow-ingress-nginx`, que lista
`rook-lp`.

Teste de contrato: `bash k8s/production/tests/verify-lp.sh`.

## Validação privada (histórico)

## Fonte reproduzida

- deployment Vercel `Production` da validação: `a7b1a939e39a4afd7a05cf15f0733fad74bf1651`;
- imagem: `rook-lp:production` (placeholder; antes da fase de corte, `prod-a7b1a939`);
- URL canônica compilada: `https://www.rook.com.br`;
- Supabase de runtime: `supabase-production`, pela rede interna do cluster.

A imagem deve usar o código extraído desse commit e o Dockerfile deste
diretório. Não use a imagem de homologação: os valores `NEXT_PUBLIC_*` são
compilados no bundle e a imagem de homologação desativa rastreamento e indexação.
Durante o build, `SUPABASE_URL` e `SUPABASE_ANON_KEY` consultam o Supabase atual
para gerar as seis páginas do blog já publicadas. Essas variáveis existem só no
estágio de compilação. Os valores `NEXT_PUBLIC_SUPABASE_*` são sempre os do
destino, e em runtime `SUPABASE_URL` aponta somente para `supabase-production`
dentro do cluster.

## Segredos

`generate-secret.sh` lê somente as chaves da instância `supabase-production` e
cria `rook-lp-production-env`. Ele também gera credenciais próprias para as APIs
de leads, automação de conteúdo e cron. Nenhum valor é versionado ou impresso.

`RESEND_API_KEY` vem do env de produção puxado da Vercel para a VPS
(root-only). O GTM usa um ID versionado no código.

## Aplicação

```bash
KUBECONFIG=/etc/rancher/k3s/k3s.yaml ./generate-secret.sh
kubectl apply -f lp.yaml
kubectl -n rook-production rollout status deployment/rook-lp --timeout=180s
```

O `Service` é `ClusterIP`; o tráfego externo entra só pelo Ingress `rook-lp`
via ingress-nginx.
