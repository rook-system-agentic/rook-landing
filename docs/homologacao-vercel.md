# Homologação do site na Vercel

`https://lp-homolog.rooksystem.com.br` — a homologação do site, servida pelo
projeto Vercel **`rook-landing-hml`** (time Rook System, `gru1`) desde
24/10/2026. Antes disso ela rodava no k3s da Hostinger (`rook-lp` no namespace
`rook-homolog`, publicada pelo antigo `deploy-homolog.yml` no runner
`rook-vps`), que foi desmontado na ROO-1585.

## Fluxo

```
branch de trabalho  →  homolog  →  main
                        │            │
                        │            └─ projeto rook-landing publica www.rook.com.br
                        └─ projeto rook-landing-hml publica lp-homolog.rooksystem.com.br

branch mkt/*  →  preview próprio no rook-landing-hml (link no PR)  →  homolog  →  main
```

Push ou merge na `homolog` publica a homologação pela integração Git da
Vercel. Não há workflow do GitHub Actions nem runner próprio.

## POR QUE É ASSIM

**Projeto próprio, não o preview do `rook-landing`.** É o mesmo desenho dos
outros apps (`rook-system-hml`, `rook-admin-hml`, `rook-marketing-hml`): as
variáveis de homologação ficam num projeto que não tem nenhum domínio nem
variável de produção. Mexer na homologação nunca toca no projeto que serve o
site real.

**Só a `homolog` e as branches `mkt/*` constroem.** O projeto tem o *Ignored
Build Step* `case "$VERCEL_GIT_COMMIT_REF" in homolog|mkt/*) exit 1;; *) exit 0;; esac`:
para qualquer outra branch o comando sai com 0 e a Vercel pula o build. Sem
isso, cada PR e cada push na `main` gerariam um segundo deploy, com as
variáveis de homologação. Até 17/11/2026 o comando era
`[ "$VERCEL_GIT_COMMIT_REF" != "homolog" ]` (só a `homolog`).

**Preview das branches `mkt/*` (17/11/2026, decisão do Gabriel).** Quem edita
texto pelo navegador (marketing) só via a mudança depois do merge na
`homolog`, que é compartilhada com o time técnico e vai inteira para a `main`
na promoção. Agora cada push numa branch `mkt/*` gera um deploy de preview
neste projeto, e o bot da Vercel comenta o link no PR: é a linha
`rook-landing-hml` → **Preview**. A linha `rook-landing` aparece como
*Ignored* (o projeto de produção só constrói a `main`), e o link dela não
serve. O preview usa as variáveis sem filtro de branch da tabela abaixo
(`NEXT_PUBLIC_ENV=homolog`, portanto sem rastreamento e com `noindex`) e fica
aberto sem login, como a homologação.

As variáveis com escopo de branch `homolog` **não** chegam às branches
`mkt/*`, de propósito: o cadastro `BF1_ACCESS_ENABLED` e o conjunto
`CMV_GUIDE_*` (chave do Resend, service role do Supabase e destinatário de
teste). No preview, `/api/bf1-community-access/` responde 503, o CTA da /bl1
leva direto ao grupo e o Guia CMV fica desligado. Não recadastre essas
variáveis sem branch: elas passariam a valer para qualquer preview. Validado
no PR #221, em 17/11/2026: preview público com HTTP 200,
`X-Robots-Tag: noindex, nofollow, nosnippet`, GTM ausente no HTML e cadastro
BF1 respondendo 503.

**A homologação é um deploy de *preview*.** A branch de produção do projeto
continua a padrão (`main`), que nunca constrói por causa da regra acima. O
domínio `lp-homolog.rooksystem.com.br` está ligado à branch `homolog`
(domínio de branch), então sempre aponta para o último deploy dela. Efeito
desejado: o cron do `vercel.json` (`publish-scheduled`) só roda em deploy de
produção, e por isso não roda aqui. A homologação não publica nada sozinha.

**Sem a tela de login da Vercel (decisão do João, 24/10/2026).** A proteção
padrão (*Standard Protection*, `all_except_custom_domains`) só libera domínio
próprio de deploy de produção; num deploy de preview, até o
`lp-homolog.rooksystem.com.br` caía na tela de login da Vercel. Por isso a
*Vercel Authentication* está desligada neste projeto. Não expõe nada novo: o
conteúdo é o mesmo do site público, sem dado de cliente, e o k3s também
servia a homologação aberta. Quem precisa conferir uma mudança (ou um parceiro,
como a BeeFood) abre o link sem conta na Vercel; o `noindex` continua tirando o
endereço das buscas. Religar a proteção exige antes mudar a branch de produção
do projeto para `homolog` (e desligar o Cron Jobs no painel).

**Variáveis (Production e Preview, mesmo valor):**

| Variável | Valor | Por quê |
|---|---|---|
| `NEXT_PUBLIC_ENV` | `homolog` | desliga o rastreamento (`src/lib/tracking.ts`) e liga o `noindex` (`next.config.mjs`) |
| `NEXT_PUBLIC_SITE_URL` | `https://lp.homolog.rook.com.br` (antes `https://lp-homolog.rooksystem.com.br`, ROO-1611) | canonical, sitemap e origem aceita nos formulários |
| `ASAFLOW_ACQUISITION_ENABLED` | `false` | nenhum lead de teste vira negócio no AsaFlow |
| `NEXT_PUBLIC_ASAFLOW_CHAT_ENABLED` | `false` | o chat real não é montado |

Elas valem também para Production porque o primeiro deploy de um projeto novo
pela API sai como produção; com o valor nos dois alvos, nenhum deploy deste
projeto é construído sem `NEXT_PUBLIC_ENV=homolog`.

**Sem Supabase, de propósito.** O banco de homologação (`APP.ROOKSYSTEM-HML`)
não tem as tabelas do site (`blog_posts`, `commercial_leads`, automação de
conteúdo). Por isso o blog roda no seed local e `/api/blog/status` responde
`unconfigured`, o mesmo conteúdo que o k3s servia (lá respondia `fallback`,
com HTTP 401). Formulários de newsletter e de lead não gravam. Se um dia a
homologação precisar testar esses fluxos, o caminho é aplicar
`supabase/migrations/` no HML primeiro e só então cadastrar `SUPABASE_URL` e a
chave do HML no projeto. Nunca as do projeto de produção.

**A imagem e o build não são promovíveis.** Os `NEXT_PUBLIC_*` entram no
bundle do navegador em tempo de build. Promove-se código, pela branch.

## DNS

`lp-homolog` em `rooksystem.com.br` (Cloudflare) é um CNAME para
`cname.vercel-dns.com`, como `homolog`, `adm-homolog` e `site-homolog`. Antes
da mudança o nome caía no curinga `*`, que aponta para a VPS.
