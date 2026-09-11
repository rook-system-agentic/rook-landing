# Landing candidata a produção na Hostinger

Este diretório descreve a instância interna do site `rook-landing` no namespace
`rook-production`. Ela não cria `Ingress`, certificado ou DNS. A homologação em
`rook-homolog` permanece separada.

## Fonte reproduzida

- deployment Vercel `Production`: `a7b1a939e39a4afd7a05cf15f0733fad74bf1651`;
- imagem local: `rook-lp:prod-a7b1a939`;
- URL canônica compilada: `https://rooksystem.com.br`;
- Supabase de runtime: `supabase-production`, pela rede interna do cluster.

A imagem deve usar o código extraído desse commit e o Dockerfile deste
diretório. Não use a imagem de homologação: os valores `NEXT_PUBLIC_*` são
compilados no bundle e a imagem de homologação desativa rastreamento e indexação.
Durante o build, a URL e a chave pública `anon` do Supabase atual são usadas
para gerar as seis páginas do blog já publicadas. Em runtime, `SUPABASE_URL`
tem precedência e aponta somente para `supabase-production` dentro do cluster.

## Segredos

`generate-secret.sh` lê somente as chaves da instância `supabase-production` e
cria `rook-lp-production-env`. Ele também gera credenciais próprias para as APIs
de leads, automação de conteúdo e cron. Nenhum valor é versionado ou impresso.

`RESEND_API_KEY` permanece ausente durante a validação privada e deve ser
importada do projeto de produção da Vercel antes do cutover. O GTM usa um ID
versionado no código. Sem egress externo, a instância não envia e-mail nem
eventos de analytics acidentalmente.

## Aplicação

```bash
KUBECONFIG=/etc/rancher/k3s/k3s.yaml ./generate-secret.sh
kubectl apply -f lp.yaml
kubectl -n rook-production rollout status deployment/rook-lp --timeout=180s
```

A validação privada deve executar `curl` em `127.0.0.1:3000` dentro do pod. O
`Service` é `ClusterIP`, e a política `default-deny-ingress` impede acesso por
outros pods até a criação explícita das regras de cutover.
