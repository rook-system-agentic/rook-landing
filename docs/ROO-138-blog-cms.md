# ROO-138 — Blog Editorial + CMS Minimo

Esta implementacao transforma `/blog` em um produto editorial dinamico para a fase 1 da ROO-117.

## O que foi implementado

- Modelo editorial `BlogPost` em `src/lib/blog-types.ts`.
- Seed editorial local com 3 artigos publicados em `src/content/blog-posts.ts`.
- Camada server-side `src/lib/blog.ts`:
  - busca posts publicados no Supabase REST quando `SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_URL` e chave estao configuradas;
  - usa seed local como fallback quando Supabase nao esta configurado ou retorna vazio;
  - nunca expõe drafts.
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
- Sitemap dinamico com posts publicados.
- RSS em `/feed.xml`.
- Migration Supabase em `supabase/migrations/20260611000100_create_blog_posts.sql`.

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
