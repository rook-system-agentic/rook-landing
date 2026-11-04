# ROO-1557 — política candidata de indexação por host

> Este documento descreve o código e o rollout candidato da ROO-1557. Ele **não afirma publicação, merge ou deploy**. A abertura e a revisão do PR ficam para o responsável pelo repositório.

## Decisão

- `https://www.rook.com.br` é o único host indexável, e somente em build com `NEXT_PUBLIC_ENV=production`.
- A comparação do host é fechada: aliases, `lp-homolog.rooksystem.com.br`, previews `*.vercel.app`, IPs, localhost e hosts desconhecidos recebem `X-Robots-Tag: noindex, nofollow, nosnippet`.
- Build sem `NEXT_PUBLIC_ENV=production` também fecha a indexação, inclusive se for acessado pelo host `www`.
- `VERCEL_ENV=preview`, desenvolvimento ou valor desconhecido também fecha a indexação mesmo com build/host oficiais. Ausência dessa variável é aceita somente para o caminho não-Vercel já existente.
- `robots.txt` de build/host não indexável mantém o crawl permitido, para que robôs consigam ler o `X-Robots-Tag` e retirar URLs antigas do índice; não anuncia sitemap.
- O sitemap oficial continua com origem `https://www.rook.com.br/`, incluindo `/blog/` e `/diagnostico/`; o sitemap de host não indexável fica vazio.
- Canonicals não são declaradas no layout raiz. Aliases institucionais antigos em `canonical_url` editorial são promovidos para o `www` preservando caminho, query e fragmento. Canonicals editoriais de outros domínios permanecem intencionais e inalteradas.

## Limites desta mudança

- Não há alteração de middleware, experimento, UI, APIs de aquisição/diagnóstico, autenticação, tracking, dependências ou dados.
- Não há redirect de host implementado no Next. Os redirects de aliases continuam sendo responsabilidade do edge/Ingress existente; este código não redireciona aplicações para a home.
- A regra de headers usa as condições `host`/`missing` do `next.config.mjs`; a política pura está em `src/lib/indexability-policy.mjs` com declaração `.d.mts`.
- `robots` e `sitemap` consultam somente o host efetivo destas duas rotas. Nenhuma página de conteúdo foi tornada dinâmica globalmente.
- O Next 14 mantém em metadata dinâmica `Cache-Control: public, max-age=0, must-revalidate` e sobrescreve um `Vary: Host` tentado via config; o guard ineficaz foi removido, sem mudar cache de imagens/ativos. O smoke local alterna oficial/preview/oficial e confirma conteúdo separado e revalidação zero. A chave por Host e a revalidação do CDN real continuam gate após publicação, não evidência já concluída. Não confiar em `x-forwarded-host` fornecido pelo cliente.

## Contrato de build

A imagem de produção deve continuar construindo com:

```text
NEXT_PUBLIC_ENV=production
NEXT_PUBLIC_SITE_URL=https://www.rook.com.br
```

A imagem de homologação deve continuar com `NEXT_PUBLIC_ENV=homolog`. Na Vercel, produção exige `VERCEL_ENV=production`; preview fecha independentemente de `NEXT_PUBLIC_ENV`. Preview/local sem `NEXT_PUBLIC_ENV` são deliberadamente tratados como não indexáveis. Não carregar env ou credenciais de produção para validar este contrato.

## Rollout candidato

1. Revisar o diff e os testes no branch de trabalho.
2. Abrir PR para `homolog`, sem merge/deploy automático por esta implementação.
3. Validar a imagem de homologação: páginas com `X-Robots-Tag`, `robots.txt` com `Allow: /` sem anúncio de sitemap e sitemap vazio. O rastreamento permanece permitido para que o Google consiga processar o `noindex`.
4. Promover o código pelo fluxo documentado (`homolog` → `main`) somente após revisão.
5. Depois da publicação, validar no edge, apenas com status/headers e sem conteúdo sensível:

   ```bash
   curl -sS -D - -o /dev/null https://www.rook.com.br/
   curl -sS -D - -o /dev/null https://www.rook.com.br/robots.txt
   curl -sS -D - -o /dev/null https://www.rook.com.br/sitemap.xml
   curl -sS -D - -o /dev/null 'https://rook.com.br/blog/abc/?utm_source=x'
   curl -sS -D - -o /dev/null 'https://rooksystem.com.br/diagnostico/?utm_source=x'
   ```

   Espera-se `200` no `www`, `robots`/`sitemap` oficiais e `308` dos aliases com path/query preservados. A existência do redirect do apex `rooksystem.com.br` deve ser confirmada no edge, pois não é configurada neste repositório.

## Risco residual

O código não prova o comportamento de DNS, Cloudflare, Ingress ou Vercel até que os GETs acima sejam executados após publicação. Em particular, a proteção de host não substitui o redirect canônico no edge: ela impede indexação quando a requisição chega ao Next, mas não corrige um alias que o edge ainda sirva sem redirect.
