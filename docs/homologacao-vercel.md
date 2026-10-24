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
```

Push ou merge na `homolog` publica a homologação pela integração Git da
Vercel. Não há workflow do GitHub Actions nem runner próprio.

## POR QUE É ASSIM

**Projeto próprio, não o preview do `rook-landing`.** É o mesmo desenho dos
outros apps (`rook-system-hml`, `rook-admin-hml`, `rook-marketing-hml`): as
variáveis de homologação ficam num projeto que não tem nenhum domínio nem
variável de produção. Mexer na homologação nunca toca no projeto que serve o
site real.

**Só a `homolog` constrói.** O projeto tem o *Ignored Build Step*
`[ "$VERCEL_GIT_COMMIT_REF" != "homolog" ]`: para qualquer outra branch o
comando sai com 0 e a Vercel pula o build. Sem isso, cada PR e cada push na
`main` gerariam um segundo deploy, com as variáveis de homologação.

**A homologação é um deploy de *preview*.** A branch de produção do projeto
continua a padrão (`main`), que nunca constrói por causa da regra acima. O
domínio `lp-homolog.rooksystem.com.br` está ligado à branch `homolog`
(domínio de branch), então sempre aponta para o último deploy dela. Efeito
desejado: o cron do `vercel.json` (`publish-scheduled`) só roda em deploy de
produção, e por isso não roda aqui. A homologação não publica nada sozinha.

**Variáveis (Production e Preview, mesmo valor):**

| Variável | Valor | Por quê |
|---|---|---|
| `NEXT_PUBLIC_ENV` | `homolog` | desliga o rastreamento (`src/lib/tracking.ts`) e liga o `noindex` (`next.config.mjs`) |
| `NEXT_PUBLIC_SITE_URL` | `https://lp-homolog.rooksystem.com.br` | canonical, sitemap e origem aceita nos formulários |
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
