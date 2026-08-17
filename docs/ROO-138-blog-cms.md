# ROO-138 — Blog Editorial + CMS Minimo

Esta implementacao transforma `/blog` em um produto editorial dinamico para a fase 1 da ROO-117.

## O que foi implementado

- Modelo editorial `BlogPost` em `src/lib/blog-types.ts`.
- Seed editorial local com 3 artigos publicados em `src/content/blog-posts.ts`.
- Camada server-side `src/lib/blog.ts`:
  - busca posts publicados no Supabase REST quando `SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_URL` e chave estao configuradas;
  - usa seed local como fallback quando Supabase nao esta configurado ou retorna vazio;
  - nunca expõe drafts;
  - desde a ROO-1116, reporta em qual dos quatro estados a origem esta.
- Decisao de estado da origem isolada em `src/lib/blog-source.mjs` (logica pura,
  coberta por `tests/blog-source.test.mjs`).
- `/blog` dinamico com categorias e cards reais.
- `/blog/[slug]` com:
  - resposta direta no topo;
  - metadata por artigo;
  - corpo Markdown;
  - fontes/metodologia;
  - FAQ visivel quando existir;
  - CTA contextual;
  - artigos relacionados;
  - JSON-LD Article, BreadcrumbList e FAQPage opcional.
- APIs:
  - `GET /api/blog/posts/`
  - `GET /api/blog/posts/[slug]/`
  - `GET /api/blog/status/` (ROO-1116; ver secao abaixo)
- Sitemap dinamico com posts publicados.
- RSS em `/feed.xml`.
- Migration Supabase em `supabase/migrations/20260611000100_create_blog_posts.sql`.

## ROO-1116 — como saber se o blog esta servindo dado fresco ou fallback

Ate a ROO-1116 a queda do Supabase era invisivel: a LP servia os 3 posts locais
como se fosse o catalogo real, e o unico vestigio era um `console.warn`. Em
homologacao a tabela `blog_posts` nem existe, entao a LP de homolog esteve
nesse estado o tempo todo sem ninguem perceber.

Para responder a pergunta sem abrir o codigo:

```bash
curl -sS https://rook.com.br/api/blog/status/
```

A resposta e `200` quando a origem esta sa e `503` quando esta degradada, com o
mesmo estado no cabecalho `x-rook-blog-source` (as rotas `/api/blog/posts/` e
`/api/blog/posts/[slug]/` tambem carregam esse cabecalho e o campo `source`).
Os quatro estados:

| `source` | Significado | Degradado |
| --- | --- | --- |
| `live` | consulta respondeu com artigos | nao |
| `empty` | consulta respondeu, nao ha artigo publicado | nao |
| `fallback` | consulta falhou; servindo so a semente local | sim |
| `unconfigured` | sem `SUPABASE_URL`/chave; nao houve consulta | sim |

No log do servidor a queda sai como `[ROO-1116] Blog caiu para os posts locais`,
com o motivo e o corpo do erro. A resposta publica nunca leva o corpo do erro.

Efeitos da decisao, para nao surpreender depois:

- slug ausente com origem sa devolve 404; com origem degradada devolve a pagina
  "Nao conseguimos carregar este artigo agora" com `noindex` (e 503 na API).
  O motivo esta em `resolveMissingSlugBehavior`, em `src/lib/blog-source.mjs`;
- a listagem tem tres textos de lista vazia — categoria sem artigo, catalogo
  sem artigo e origem indisponivel — em vez de um so;
- as paginas tem `revalidate = 60`, entao depois que a origem volta pode levar
  ate um minuto para a pagina "indisponivel" ser substituida pelo artigo.

## Variaveis de ambiente

O blog funciona sem Supabase usando os 3 posts locais. Para usar `public.blog_posts`, configurar:

```env
NEXT_PUBLIC_SITE_URL=https://rooksystem.com.br
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<server-only-key>
```

Alternativamente, para leitura publica via RLS:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
```

Preferencia em producao: usar chave server-side em Vercel, sem expor service role ao cliente. A implementacao usa essas variaveis apenas em server components/route handlers.

## Migration

Aplicar a migration no projeto Supabase da landing/app:

```sql
supabase/migrations/20260611000100_create_blog_posts.sql
```

Ela cria:

- tabela `public.blog_posts`;
- constraints de status;
- indices por publicacao/categoria/tags;
- trigger `updated_at`;
- RLS;
- leitura publica apenas de posts `published`;
- escrita via service role.

## Politica editorial

Os 3 artigos inaugurais evitam promessas estatisticas amplas antes de haver amostra suficiente:

1. `cmv-restaurantes-como-calcular`
2. `como-reduzir-cmv-sem-cortar-qualidade`
3. `dre-restaurantes-faturamento-lucro`

Quando houver base anonima suficiente, o Rook pode publicar benchmarks agregados por segmento/porte/regiao com nota metodologica.

## Validacao recomendada pos-deploy

- `/blog/` retorna status 200.
- Cada `/blog/[slug]/` retorna status 200.
- `/api/blog/posts/` retorna os posts publicados.
- `/sitemap.xml` inclui os 3 posts.
- `/feed.xml` valida como RSS 2.0.
- Lighthouse SEO >= 95 em `/blog/` e em pelo menos 1 artigo.
- Google Search Console:
  - enviar sitemap;
  - inspecionar URLs;
  - solicitar indexacao.

## Limites conhecidos

- Esta fase nao implementa Content Studio, calendario editorial, gerador LLM ou publicacao automatica multi-canal.
- FAQPage e emitido apenas quando ha FAQ visivel no artigo; nao deve ser tratado como garantia de rich result.
- Indexacao em 7 dias depende do Google e deve ser monitorada, nao prometida como criterio controlavel.
