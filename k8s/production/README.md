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
  usa `Rook <comunicacao@rook.com.br>` na newsletter e lê `RESEND_API_KEY` e a
  integração comercial AsaFlow do arquivo root-only
  `/etc/rook-production/runtime/landing.production.env`.
- O job de deploy chama o wrapper root-owned
  `/usr/local/bin/rook-lp-runtime-secret-reconcile`, que só aceita a revisão Git
  publicada e executa a cópia root-owned de `generate-secret.sh`. O workflow
  compara o SHA-256 dessa cópia com o arquivo versionado antes de prosseguir; ele
  nunca executa código privilegiado direto do checkout. O runner continua sem
  permissão genérica para ler ou alterar Secrets do cluster.
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

## Rook AI: configuração de compilação

O workflow de produção preserva o canal público ativado em 21/09:
`NEXT_PUBLIC_ASAFLOW_CHAT_ENABLED=true`, tenant `hook` e fluxo
`rook-ai-validacao-por-link`. Esses três valores são públicos e seguem por
`--build-arg` para o estágio builder antes de `next build`. Não são a chave da
API do CRM nem precisam ser copiados para o Secret de runtime.

Na migração de 22/09 os argumentos não eram passados; o site continuava
respondendo HTTP 200, mas o JavaScript era compilado com o chat desativado.
Alterar variáveis na Vercel ou apenas reiniciar o pod não corrige esse artefato:
é necessário recompilar e publicar a imagem. O CI verifica o encaminhamento
das variáveis e o smoke de produção exige o botão do chat no HTML quando a
flag estiver ligada. Isso verifica a montagem; a resposta da IA deve ser
conferida separadamente no navegador, sem cadastrar contatos reais de teste.

Para desligar deliberadamente o chat, alterar a flag pública no workflow para
`'false'` e publicar uma nova imagem. Homologação continua usando seu próprio
Dockerfile e mantém o canal real bloqueado. Esta correção não ativa checkout,
agenda, pagamentos ou novos fluxos no AsaFlow.

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

`RESEND_API_KEY`, `ASAFLOW_ACQUISITION_ENABLED`,
`ASAFLOW_ACQUISITION_API_KEY`, `ASAFLOW_ACQUISITION_PIPELINE_ID` e
`ASAFLOW_ACQUISITION_STAGE_ID` vêm da fonte de runtime da Hostinger
`/etc/rook-production/runtime/landing.production.env` (root:root, modo `600`).
A chave AsaFlow é dedicada à landing e limitada a `contacts:write` e
`deals:write`. A antiga configuração da Vercel não é fonte de verdade. O GTM
usa um ID versionado no código.

O deploy só é considerado saudável quando, além da home, o `GET
/api/acquisition/` responde `200` com um desafio antiabuso. O teste não cria
contato nem negócio. A validação ponta a ponta de um `POST` deve usar dados
claramente identificados como teste, confirmar o negócio no funil correto e
remover o registro ao fim.

## Aplicação

```bash
KUBECONFIG=/etc/rancher/k3s/k3s.yaml ./generate-secret.sh
kubectl apply -f lp.yaml
kubectl -n rook-production rollout status deployment/rook-lp --timeout=180s
```

O `Service` é `ClusterIP`; o tráfego externo entra só pelo Ingress `rook-lp`
via ingress-nginx.

## Cache do kubectl no runner

O wrapper privilegiado executa o gerador com ambiente limpo e fixa
`KUBECACHEDIR=/var/cache/rook-lp/kubectl`, fora do checkout. Sem esse caminho,
o kubectl pode criar `.kube/cache` no diretório de trabalho quando `HOME` não
está definido. Como o gerador roda como root com `umask 077`, esse resíduo
impede a limpeza do checkout pelo usuário do runner no próximo deploy.

A correção versionada precisa ser instalada na cópia root-owned
`/usr/local/bin/rook-lp-runtime-secret-reconcile`; o merge não substitui esse
arquivo no host. Ela preserva o kubeconfig, os namespaces e as permissões do
comando. Se já houver `.kube` dentro do checkout, conferir com o runner ocioso
que se trata apenas de cache e movê-lo para quarentena fora do workspace.
Manter a limpeza do `actions/checkout` habilitada e as permissões restritas;
não tornar o cache root-owned acessível ao runner para contornar a falha.

`bash k8s/production/tests/verify-lp.sh` testa o ambiente entregue pelo wrapper
com um gerador fictício, incluindo cache herdado e revisão/checksum inválidos.
O teste não executa kubectl nem modifica o servidor.
