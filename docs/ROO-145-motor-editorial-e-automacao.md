# ROO-145 — Motor editorial e automação de publicação

Documento complementar à ROO-117 e à ROO-138.

Este documento define como o Rook deve gerar, revisar, aprovar e publicar conteúdo para blog, LinkedIn e Instagram sem virar uma fábrica genérica de texto. A ROO-145 deve ser entendida como a camada de publicação automática após aprovação; o motor editorial é a camada anterior, responsável por escolher pauta, gerar pacote de conteúdo e garantir qualidade.

## Resumo executivo

O Rook já tem a base do blog publicada em produção:

- `/blog`;
- `/blog/[slug]`;
- RSS em `/feed.xml`;
- sitemap dinâmico;
- modelo `BlogPost`;
- tabela Supabase `public.blog_posts`;
- fallback local para posts iniciais.

O próximo passo não deve ser "gerar e publicar automaticamente qualquer texto". O próximo passo deve ser criar um fluxo editorial assistido:

1. O sistema sugere pautas com base nos pilares financeiros do food service.
2. O sistema gera um pacote de conteúdo com artigo, LinkedIn, Instagram, imagem/matriz e checklist.
3. O sistema valida português, clareza, SEO/GEO, segurança de afirmações e aderência à voz Rook.
4. Gabriel aprova no Content Studio.
5. A ROO-145 publica nos canais permitidos por API ou deixa fallback manual-assistido quando a API exigir aprovação externa.

Princípio central: o Rook deve parecer útil, claro e próximo do dono de restaurante. Não deve parecer conteúdo técnico demais, nem conteúdo automático demais.

## O que a ROO-145 deve ser

A ROO-145 deve cuidar de publicação, não da decisão editorial inteira.

Escopo recomendado:

- publicar post aprovado no blog;
- disparar revalidação/cache quando necessário;
- gerar ou enfileirar newsletter;
- publicar ou preparar post de LinkedIn;
- publicar ou preparar post de Instagram;
- registrar logs de publicação;
- permitir rollback ou reprocessamento quando algum canal falhar.

Fora do escopo direto da ROO-145:

- escolher a pauta sozinha sem regra editorial;
- publicar sem aprovação humana;
- prometer benchmarks sem base anonimizada suficiente;
- criar conteúdo fiscal/tributário definitivo sem revisão.

## Relação entre ROO-117, ROO-138 e ROO-145

ROO-117 é o épico: Content Operating System.

ROO-138 entregou a fundação pública:

- blog navegável;
- posts estruturados;
- CMS mínimo via Supabase;
- RSS;
- sitemap;
- schema;
- API de leitura.

ROO-145 deve entregar a automação de publicação:

- `approved` vira `published`;
- variações por canal são publicadas ou preparadas;
- logs ficam disponíveis no Studio;
- falhas voltam para revisão com erro legível.

Entre ROO-138 e ROO-145 existe uma camada necessária: motor editorial e Content Studio. Sem essa camada, a automação publica, mas não governa qualidade.

## Matriz editorial do Rook

O quadro enviado deve ser usado como matriz de geração de assuntos. Ele não deve virar uma lista literal de artigos técnicos. Cada item deve ser traduzido para uma pergunta simples que um dono de restaurante reconhece.

### 1. Vendas

Tema de origem:

- faturamento total;
- análise YoY, MoM, WoW;
- faturamento por turno;
- faturamento por categoria;
- ticket médio;
- mapa de calor;
- curva ABC;
- cross selling;
- metas de vendas;
- prazo médio de recebimento.

Tradução editorial:

- "Seu almoço e seu jantar dão o mesmo lucro?"
- "Você sabe quais produtos realmente puxam seu faturamento?"
- "Ticket médio alto é bom ou pode esconder margem ruim?"
- "Como saber se a casa cheia está pagando a operação?"
- "Quais pratos ajudam a vender mais sem aumentar custo?"

Formatos recomendados:

- artigo prático;
- carrossel "5 perguntas para olhar suas vendas";
- matriz produto campeão vs produto enganoso;
- gráfico simples de faturamento por turno;
- checklist semanal para dono.

### 2. Compras

Tema de origem:

- compras totais;
- abertura por categoria;
- CMV do período;
- CMV meta;
- notas de compras;
- curva ABC de fornecedores;
- curva ABC de insumos;
- perdas;
- projeção de compras;
- CMV por categoria culinária;
- tamanho saudável de adega;
- limpeza e reposição de louças.

Tradução editorial:

- "Seu lucro está indo embora na carne, bebida ou embalagem?"
- "Comprar mais barato é diferente de comprar melhor."
- "Como saber se um fornecedor está ficando caro demais?"
- "CMV alto nem sempre é culpa do ingrediente."
- "Você está comprando para vender ou para estocar problema?"

Formatos recomendados:

- artigo com exemplo numérico;
- carrossel "onde o CMV escapa";
- matriz fornecedor crítico vs fornecedor substituível;
- planilha/checklist simples de compras;
- imagem conceitual: mapa de vazamento de CMV.

### 3. Despesas

Tema de origem:

- total de despesas mensais;
- custo fixo;
- ponto de equilíbrio;
- despesas em marketing, pessoal e administrativo;
- despesas por funcionário;
- delivery e taxa;
- benchmarking de despesas.

Tradução editorial:

- "Quanto seu restaurante precisa vender antes de começar a lucrar?"
- "Delivery está trazendo lucro ou só movimento?"
- "Custo fixo é o peso invisível do restaurante."
- "Sua folha está compatível com o faturamento?"
- "Marketing está gerando venda ou apenas despesa?"

Formatos recomendados:

- artigo explicativo com cálculo simples;
- matriz custo fixo vs custo variável;
- carrossel "o ponto de equilíbrio em linguagem simples";
- calculadora visual;
- checklist de despesas que merecem revisão mensal.

### 4. Impostos

Tema de origem:

- opção tributária correta;
- estimativa de imposto mensal via faturamento;
- receita operacional líquida;
- planejamento financeiro considerando ROL.

Tradução editorial:

- "Seu restaurante sabe quanto sobra depois dos impostos?"
- "Faturamento não é dinheiro disponível."
- "Regime tributário errado pode corroer lucro sem aparecer no salão."
- "Receita bruta e receita líquida: a diferença que muda a decisão."

Formatos recomendados:

- conteúdo educativo, sem promessa tributária agressiva;
- glossário simples;
- comparação visual bruta vs líquida;
- checklist de perguntas para levar ao contador;
- artigo com nota metodológica e limite claro.

Cuidados:

- não prometer redução de imposto;
- não sugerir planejamento tributário específico sem contexto;
- usar linguagem de educação financeira e encaminhar para avaliação contábil.

### 5. Endividamento

Tema de origem:

- consolidação do endividamento real;
- tipo de endividamento;
- dívida / EBITDA;
- tempo de amortização;
- valor máximo de parcela;
- custo mensal de capital;
- taxas de administração e antecipação.

Tradução editorial:

- "Sua dívida cabe no lucro do restaurante?"
- "Parcela pequena também pode quebrar o caixa."
- "Antecipar recebíveis é solução ou armadilha?"
- "Quanto da sua margem já está comprometida antes do mês começar?"
- "Dívida saudável existe, mas precisa caber na operação."

Formatos recomendados:

- artigo de educação financeira;
- matriz dívida boa vs dívida perigosa;
- carrossel "3 sinais de que a parcela ficou pesada";
- checklist de endividamento;
- imagem tipo termômetro de pressão no caixa.

### 6. Resultado

Tema de origem:

- ROB;
- lucro bruto e margem bruta;
- EBITDA e margem EBITDA;
- lucro líquido e margem líquida;
- margem de contribuição;
- pró-labore máximo;
- performance por benchmarking;
- sensibilidade para custos e despesas.

Tradução editorial:

- "Por que vender muito ainda pode dar prejuízo?"
- "Lucro bruto não paga tudo."
- "Qual margem realmente importa para o dono?"
- "Quanto o sócio pode tirar sem machucar o restaurante?"
- "O lucro some antes do caixa? Veja onde procurar."

Formatos recomendados:

- artigo evergreen;
- matriz faturamento alto vs lucro real;
- carrossel "receita, margem e lucro sem complicar";
- visual de funil: venda bruta até lucro líquido;
- checklist mensal de resultado.

## Tipos de conteúdo que o motor deve gerar

Cada pauta deve virar um `content_pack`, não apenas um artigo.

Pacote mínimo:

- artigo blog;
- post LinkedIn;
- carrossel Instagram;
- legenda Instagram;
- story/enquete;
- imagem ou matriz;
- FAQ para schema;
- resumo para newsletter;
- CTA recomendado;
- tags e categoria;
- nota de segurança/metodologia.

Exemplo:

Tema: CMV por categoria.

Pacote:

- Blog: "Seu lucro está indo embora na carne, bebida ou embalagem?"
- LinkedIn: texto curto com exemplo de restaurante que tem CMV total estável, mas categoria de carnes fora de controle.
- Instagram: carrossel "3 lugares onde o CMV escapa".
- Imagem: matriz "categoria controlada vs categoria crítica".
- Story: enquete "Você sabe qual categoria mais pesa no seu CMV?"
- CTA: "Veja como o Rook organiza compras e margem por categoria."

## Critérios de geração

Todo conteúdo deve passar por estes filtros antes de ir para revisão:

1. Clareza para dono de restaurante.
2. Utilidade prática em menos de 30 segundos.
3. Uma ideia central, sem tentar explicar tudo.
4. Exemplo em reais sempre que fizer sentido.
5. Linguagem simples, sem jargão desnecessário.
6. Sem prometer economia, lucro, redução fiscal ou benchmark sem base.
7. Conexão natural com o Rook.
8. Possibilidade de reaproveitamento visual.
9. Português com acentuação e coerência verbal.
10. Título com apelo humano, não apenas keyword.

## Voz editorial

O Rook deve falar como um conselheiro financeiro claro para food service.

Características:

- direto;
- útil;
- visual;
- respeitoso com a realidade operacional;
- sem tom professoral excessivo;
- sem alarmismo;
- sem promessas mágicas;
- com foco em decisão.

Evitar:

- "otimize sua operação" como frase genérica;
- excesso de siglas sem explicação;
- conteúdo que pareça aula contábil;
- benchmark inventado;
- tom de consultoria distante;
- artigo longo sem exemplo prático.

Preferir:

- "vender muito não significa lucrar bem";
- "o problema pode não estar na venda, mas no que sobra";
- "antes de cortar qualidade, encontre onde o dinheiro escapa";
- "olhe em reais, não só em percentual";
- "o dono precisa enxergar onde agir primeiro".

## Calendário recomendado

Primeiros 90 dias:

- 2 artigos de blog por semana;
- cada artigo gera 1 post LinkedIn;
- cada artigo gera 1 carrossel Instagram;
- 1 story/enquete por artigo;
- 1 visual reaproveitável por artigo.

Após 90 dias:

- 1 artigo profundo por semana;
- 1 atualização mensal de artigo antigo;
- 2 a 3 posts sociais por semana;
- 1 carrossel por semana;
- reciclagem dos melhores temas.

Sugestão semanal:

| Dia | Canal | Conteúdo |
| --- | --- | --- |
| Segunda | LinkedIn | Insight curto com dor financeira |
| Terça | Blog | Artigo principal |
| Quarta | Instagram | Carrossel derivado do artigo |
| Quinta | LinkedIn | Exemplo numérico ou bastidor de método |
| Sexta | Instagram Story | Enquete ou pergunta para dono de restaurante |

## Roteiro dos primeiros 30 dias

Semana 1:

- "Por que vender muito ainda pode dar prejuízo?"
- "O que é CMV em restaurantes e onde ele escapa?"

Semana 2:

- "Seu almoço e seu jantar dão o mesmo resultado?"
- "Delivery está trazendo lucro ou só movimento?"

Semana 3:

- "Sua dívida cabe no lucro do restaurante?"
- "Receita bruta e receita líquida: a diferença que muda decisões."

Semana 4:

- "Quais produtos pagam a conta do restaurante?"
- "Quanto o restaurante precisa vender antes de lucrar?"

Cada pauta deve virar um pacote completo: blog, LinkedIn, Instagram, visual e CTA.

## Estrutura recomendada para artigo

Template:

1. Título humano.
2. Subtítulo com promessa clara.
3. Resposta direta em 3 a 5 linhas.
4. Explicação simples.
5. Exemplo numérico.
6. Erro comum.
7. Como o dono pode agir.
8. Como o Rook ajuda.
9. FAQ.
10. Nota metodológica, quando houver número ou benchmark.

Exemplo de título ruim:

- "Análise de CMV por categoria culinária na Base Rook"

Exemplo de título bom:

- "Seu lucro está indo embora na carne, bebida ou embalagem?"

## Estrutura recomendada para LinkedIn

Template:

1. Frase de abertura forte.
2. Contexto em linguagem de negócio.
3. Exemplo prático.
4. Conclusão com aprendizado.
5. CTA leve.

Exemplo:

```text
Vender mais não resolve tudo.

Um restaurante pode crescer 20% em faturamento e ainda assim lucrar menos se compras, despesas e impostos crescerem junto.

Por isso, olhar apenas para vendas cria uma falsa sensação de segurança.

O que importa é entender o caminho completo:
receita -> impostos -> CMV -> despesas -> dívidas -> resultado.

No Rook, chamamos isso de enxergar o lucro real.
```

## Estrutura recomendada para Instagram

Formato carrossel:

1. Capa com pergunta forte.
2. Dor real.
3. Explicação simples.
4. Exemplo em reais.
5. Erro comum.
6. Checklist rápido.
7. CTA leve.

Exemplo:

- Capa: "Seu delivery dá lucro?"
- Slide 2: "Pedido entrando não significa dinheiro sobrando."
- Slide 3: "Taxa, embalagem, comissão e desconto mudam a conta."
- Slide 4: "Um pedido de R$ 80 pode deixar muito menos do que parece."
- Slide 5: "Olhe margem por canal, não só faturamento total."
- Slide 6: "Compare salão, delivery e retirada."
- Slide 7: "O Rook ajuda a enxergar isso em reais."

## Imagens, matrizes e assets visuais

O motor editorial deve poder gerar briefings para imagens, não apenas texto.

Tipos de visual:

- matriz 2x2;
- funil financeiro;
- termômetro de risco;
- mapa de vazamento de lucro;
- checklist visual;
- mini dashboard conceitual;
- carrossel educativo;
- diagrama "da venda ao lucro";
- comparação "parece bom / precisa investigar".

Regras visuais:

- linguagem simples;
- poucos números;
- legibilidade mobile;
- usar paleta Rook;
- não poluir com tabela técnica demais;
- cada visual deve explicar uma ideia em até 5 segundos.

Exemplos de matrizes:

### Matriz de pratos

| | Baixa margem | Alta margem |
| --- | --- | --- |
| Baixa venda | Candidato a remover | Produto de nicho |
| Alta venda | Vilão silencioso | Campeão do cardápio |

### Matriz de fornecedores

| | Baixo impacto no CMV | Alto impacto no CMV |
| --- | --- | --- |
| Baixa substituibilidade | Monitorar | Risco estratégico |
| Alta substituibilidade | Negociar ocasionalmente | Comparar e renegociar |

### Funil do lucro

```text
Faturamento bruto
  - impostos e taxas
  - CMV
  - despesas
  - dívidas
= resultado real
```

## Fluxo operacional recomendado

Estados do pacote:

- `idea`;
- `briefed`;
- `drafted`;
- `review`;
- `approved`;
- `scheduled`;
- `published`;
- `failed`;
- `archived`.

Fluxo:

1. Gerar pauta a partir da matriz editorial.
2. Criar briefing com público, dor, promessa, CTA e formato visual.
3. Gerar variações de conteúdo.
4. Rodar validações automáticas.
5. Enviar para revisão humana.
6. Aprovar.
7. ROO-145 publica ou agenda.
8. Registrar logs por canal.
9. Medir performance e retroalimentar pautas futuras.

## Validações automáticas antes da aprovação

Checklist obrigatório:

- português com acentos;
- sem erros graves de concordância;
- título claro;
- CTA presente;
- categoria e tags definidas;
- FAQ quando o artigo responder pergunta evergreen;
- schema compatível;
- slug limpo;
- `seo_title` e `seo_description`;
- nota metodológica quando houver número;
- ausência de promessa indevida;
- ausência de benchmark sem fonte;
- leitura mobile dos carrosséis;
- imagem com alt text.

## Modelo de dados sugerido

A tabela `blog_posts` já existe. Para o motor editorial e ROO-145, sugerem-se tabelas adicionais.

### `content_packs`

Campos sugeridos:

- `id`;
- `pillar`;
- `topic`;
- `angle`;
- `audience`;
- `status`;
- `scheduled_at`;
- `approved_at`;
- `approved_by`;
- `created_by`;
- `source_issue`;
- `notes`;
- `created_at`;
- `updated_at`.

### `content_variations`

Campos sugeridos:

- `id`;
- `content_pack_id`;
- `channel`: `blog`, `linkedin`, `instagram_carousel`, `instagram_caption`, `story`, `newsletter`;
- `title`;
- `body`;
- `asset_brief`;
- `asset_url`;
- `status`;
- `metadata`;
- `created_at`;
- `updated_at`.

### `publication_jobs`

Campos sugeridos:

- `id`;
- `content_pack_id`;
- `variation_id`;
- `channel`;
- `status`: `queued`, `publishing`, `published`, `failed`, `skipped`;
- `scheduled_at`;
- `published_at`;
- `external_id`;
- `external_url`;
- `error_message`;
- `retry_count`;
- `created_at`;
- `updated_at`.

## Implementação ROO-145 recomendada

### Bloco 1: Blog auto-publish

Quando uma variação `blog` for aprovada:

1. Inserir ou atualizar `public.blog_posts`.
2. Definir `status = published`.
3. Definir `published_at`.
4. Revalidar `/blog`, `/blog/[slug]`, `/feed.xml` e `/sitemap.xml`.
5. Registrar job como `published`.

Critério de aceite:

- post aparece no blog em até 5 minutos após aprovação;
- feed e sitemap incluem o post;
- falha gera log legível.

### Bloco 2: LinkedIn

Preferência:

- publicar via API quando OAuth e permissões estiverem aprovados.

Fallback:

- gerar post pronto para copiar;
- gerar imagem/carrossel pronto;
- registrar como `manual_required`.

Critério de aceite:

- se API disponível, publicar e salvar `external_url`;
- se API bloqueada, deixar pacote manual com texto e asset final.

### Bloco 3: Instagram

Preferência:

- publicar via Meta Graph API quando Business Verification e App Review estiverem concluídos.

Fallback:

- gerar carrossel e legenda;
- exportar imagens finais;
- registrar publicação manual pendente.

Critério de aceite:

- carrossel precisa ser legível em mobile;
- legenda deve ter CTA leve;
- se API falhar, job deve ficar em `failed` ou `manual_required`, não sumir.

### Bloco 4: Newsletter

Quando houver variação `newsletter`:

- enfileirar disparo via Resend;
- usar assunto curto;
- linkar para artigo;
- respeitar lista e descadastro.

## Critérios de aceite do sistema editorial

P0:

- nenhum conteúdo é publicado sem aprovação humana;
- blog publica pacote aprovado;
- logs por canal existem;
- falhas são visíveis;
- conteúdo publicado aparece no RSS e sitemap.

P1:

- geração de pacote completo a partir de pauta;
- checklist automático de português e segurança;
- preview por canal;
- agendamento por data/hora.

P2:

- LinkedIn via API;
- Instagram via API;
- newsletter automatizada;
- dashboard de performance.

P3:

- aprendizado por performance;
- sugestão automática de novas pautas;
- atualização de artigos antigos;
- testes de títulos e formatos.

## Métricas de sucesso

Operacionais:

- tempo de briefing até aprovação;
- tempo de aprovação até publicação;
- taxa de falha por canal;
- quantidade de publicações por semana;
- percentual de conteúdo reaproveitado em múltiplos canais.

Editorial:

- posts publicados sem correção ortográfica pós-deploy;
- taxa de aprovação sem retrabalho;
- clareza percebida;
- aderência aos pilares Rook;
- quantidade de conteúdos com visual/matriz/checklist.

Marketing:

- impressões;
- cliques;
- salvamentos;
- compartilhamentos;
- cadastros;
- tráfego para `/blog`;
- tráfego para `/planos`;
- conversões para cadastro/teste.

SEO/GEO:

- páginas indexadas;
- queries no Search Console;
- presença em respostas de buscadores/assistentes;
- CTR orgânico;
- artigos com schema válido.

## Riscos e mitigação

### Conteúdo genérico

Risco: parecer material automatizado sem personalidade.

Mitigação:

- sempre usar dor real;
- sempre usar exemplo;
- sempre conectar com food service;
- revisão humana obrigatória.

### Conteúdo técnico demais

Risco: afastar o dono de restaurante.

Mitigação:

- traduzir indicador em pergunta prática;
- limitar jargão;
- usar glossário quando necessário;
- priorizar decisão em reais.

### Promessa indevida

Risco: prometer economia, benchmark ou resultado sem base.

Mitigação:

- checklist de segurança;
- nota metodológica;
- linguagem educativa;
- revisão de temas fiscais/tributários.

### Dependência de APIs sociais

Risco: LinkedIn e Instagram exigirem aprovação, OAuth ou App Review.

Mitigação:

- fallback manual-assistido;
- logs de `manual_required`;
- priorizar blog como fonte canônica.

## Recomendação de produto

O Content Studio deve mostrar cada pacote como uma peça única com abas:

- Briefing;
- Blog;
- LinkedIn;
- Instagram;
- Visual;
- Newsletter;
- Checklist;
- Publicação;
- Logs.

Gabriel deve conseguir:

- aprovar tudo;
- pedir revisão;
- editar texto;
- trocar data de publicação;
- bloquear canal específico;
- publicar apenas blog;
- marcar LinkedIn/Instagram como manual;
- ver erro de API em linguagem simples.

## Próximo passo recomendado

Implementar a camada mínima de `content_packs`, `content_variations` e `publication_jobs` antes de tentar publicar em todos os canais.

Ordem sugerida:

1. Criar tabelas do Content Studio.
2. Criar tela simples de revisão/aprovação.
3. Gerar primeiro pacote manualmente ou via script controlado.
4. Publicar automaticamente no blog após aprovação.
5. Adicionar logs.
6. Adicionar fallback LinkedIn/Instagram.
7. Só depois ativar APIs sociais completas.

Essa ordem reduz risco e já entrega valor: Gabriel aprova, o sistema publica no blog e prepara os canais sociais.

## MVP técnico implementado nesta branch

Esta branch inicia a execução P0 da ROO-145.

Arquivos adicionados:

- `supabase/migrations/20260611000200_create_content_automation.sql`;
- `src/lib/content-types.ts`;
- `src/lib/supabase-admin.ts`;
- `src/lib/content-automation.ts`;
- `src/app/api/content/publish/route.ts`.

O que o MVP faz:

- cria as tabelas `content_packs`, `content_variations` e `publication_jobs`;
- lê um pacote aprovado no Supabase;
- publica variação `blog` aprovada em `public.blog_posts`;
- marca variações sociais como `manual_required`;
- registra jobs de publicação;
- revalida `/blog`, `/blog/[slug]`, `/feed.xml` e `/sitemap.xml`;
- mantém proteção por segredo via header.

O que ainda não faz:

- não gera conteúdo com IA;
- não cria tela de Content Studio;
- não publica LinkedIn via API;
- não publica Instagram via API;
- não dispara newsletter via Resend;
- não roda cron diário.

## Variáveis de ambiente do MVP

Adicionar na Vercel:

```env
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<server-only-service-role-key>
CONTENT_AUTOMATION_SECRET=<segredo-longo-aleatorio>
```

Observações:

- `SUPABASE_SERVICE_ROLE_KEY` deve ser server-only.
- `CONTENT_AUTOMATION_SECRET` deve ser usado pelo Content Studio, webhook Supabase ou cron.
- O endpoint recusa publicação se o segredo não estiver configurado.

## Endpoint interno de publicação

```http
POST /api/content/publish
Authorization: Bearer <CONTENT_AUTOMATION_SECRET>
Content-Type: application/json
```

Payload:

```json
{
  "contentPackId": "uuid-do-content-pack",
  "actor": "gabriel",
  "force": false
}
```

Comportamento:

- `content_packs.status` precisa estar `approved` ou `scheduled`;
- `content_variations.status` precisa estar `approved` ou `scheduled`;
- variação `channel = blog` vira linha publicada em `blog_posts`;
- variações `linkedin`, `instagram_carousel`, `instagram_caption`, `story` e `newsletter` viram jobs `manual_required`;
- qualquer falha fica registrada em `publication_jobs.error_message`.

Resposta esperada:

```json
{
  "success": true,
  "publication": {
    "contentPackId": "uuid-do-content-pack",
    "results": [
      {
        "channel": "blog",
        "variationId": "uuid-da-variation",
        "status": "published",
        "blogPostId": "uuid-do-blog-post",
        "externalUrl": "https://rooksystem.com.br/blog/slug/"
      }
    ]
  }
}
```

## Exemplo mínimo de dados para teste

Criar um `content_pack`:

```sql
INSERT INTO public.content_packs (
  pillar,
  topic,
  angle,
  status,
  approved_at,
  approved_by,
  source_issue
) VALUES (
  'resultado',
  'Faturamento alto e lucro baixo',
  'Por que vender muito ainda pode dar prejuízo?',
  'approved',
  NOW(),
  'gabriel',
  'ROO-145'
) RETURNING id;
```

Criar uma variação de blog usando o `id` retornado:

```sql
INSERT INTO public.content_variations (
  content_pack_id,
  channel,
  title,
  subtitle,
  excerpt,
  body,
  status,
  slug,
  category,
  tags,
  seo_title,
  seo_description
) VALUES (
  '<content_pack_id>',
  'blog',
  'Por que vender muito ainda pode dar prejuízo?',
  'Faturamento alto só é bom quando sobra dinheiro depois dos custos.',
  'Entenda por que restaurantes podem vender bem e ainda assim perder margem no fim do mês.',
  '## Resposta direta

Vender muito não garante lucro. O restaurante precisa olhar impostos, CMV, despesas e dívidas antes de comemorar o faturamento.

## Exemplo simples

Um restaurante pode faturar R$ 120 mil e gastar quase tudo antes do resultado final. A pergunta certa não é apenas quanto entrou, mas quanto sobrou.

## Como o Rook ajuda

O Rook organiza vendas, compras, despesas, impostos, dívidas e resultado para mostrar onde a margem está escapando.',
  'approved',
  'por-que-vender-muito-pode-dar-prejuizo',
  'Gestão Financeira',
  ARRAY['lucro', 'faturamento', 'resultado'],
  'Por que vender muito ainda pode dar prejuízo?',
  'Veja por que faturamento alto não garante lucro em restaurantes e como olhar o resultado real.'
);
```

Chamada:

```bash
curl -X POST https://www.rooksystem.com.br/api/content/publish \
  -H "Authorization: Bearer <CONTENT_AUTOMATION_SECRET>" \
  -H "Content-Type: application/json" \
  -d '{"contentPackId":"<content_pack_id>","actor":"gabriel"}'
```
