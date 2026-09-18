# ROO-1207 — interface de captação para produção

## Recorte de publicação em 18/09/2026

Base: `origin/main` em `a977b6422af529c056263ed953292424a781a947`, que já contém o servidor da PR #133.
Branch: `hotfix/roo-1207-landing-publicacao`.
Origem: patch incremental da interface aprovada, preparado sobre a árvore de `a3217e3`, idêntica à base atual. O histórico `docs/ROO-1207-entrega-producao.md` foi preservado.

Este recorte adiciona a interface ao servidor já publicado e permite ponto decimal dos teclados móveis na leitura dos campos numéricos. Não altera rotas de API, normalização de perfil, adaptador do AsaFlow, fórmulas ou proteção contra abuso. **A publicação exige `/api/acquisition` operacional e validação própria do widget.** A autorização para produção foi dada por Gabriel na sessão; a integração e os canários são verificados separadamente da compilação.

## Interface incluída

- Preços removidos da home, da página de planos, do FAQ e do JSON-LD público.
- Formulário independente no final das páginas, acionado pelos CTAs de demonstração em `#cadastro`.
- Nome, estabelecimento, WhatsApp, e-mail, cidade/UF padronizada pelo IBGE, segmento, faturamento e ERP/PDV, com opção de informar outro sistema.
- Rook AI global, com logo negativa e paleta do site. A conversa pertence ao widget nativo do AsaFlow.
- Calculadoras independentes de CMV e ponto de equilíbrio; o contexto só acompanha o formulário após um clique explícito do visitante.
- Rotas existentes preservadas; `/assistente/` e `/cadastro/` incluídas no sitemap.

## Isolamento das mudanças paralelas

- `globals.css`: somente regras do widget acrescentadas; não foram trazidos os tokens de ocre da branch homolog.
- `layout.tsx`: metadata, head, canonical, Open Graph, Twitter e Organization de main preservados. Foram removidas apenas as ofertas públicas e montados formulário/chat; não foi trazida a refatoração de catálogo/identidade de homolog.
- `lp-content.ts`: somente copy de aquisição, CTAs, FAQ e remoção de preços; os blocos `SOBRE_*` de homolog não foram importados.
- Testes de planos: preservada a suíte de main e acrescentadas as verificações de ausência de preços públicos. Não foi introduzida dependência de `descricaoParaBuscador`.
- `/sobre`, `planos-copy.mjs`, `planos-copy.d.mts` e testes de procedência permanecem na versão de main.

## Configuração e limites

O exemplo de ambiente mantém `ASAFLOW_ACQUISITION_ENABLED=false` e `NEXT_PUBLIC_ASAFLOW_CHAT_ENABLED=false`; não contém credenciais reais. A rota de aquisição exige flag, chave dedicada, funil, etapa inicial aberta e proteção contra abuso configurados. A flag do chat e sua chave pública não habilitam o cadastro, agenda ou WhatsApp.

Em `NEXT_PUBLIC_ENV=homolog`, o widget nativo é deliberadamente bloqueado. `?preview=1` simula somente o formulário, sem enviar dados. Portanto, um build local em homolog comprova compilação e prévia; não comprova conversa incorporada, cadastro no CRM, agenda ou entrega ao ADM.

O núcleo financeiro e suas rotas são determinísticos e não gravam contatos. O adaptador de aquisição só reaproveita identidade inequívoca por e-mail e telefone normalizados, não altera contato existente e usa chave por solicitação para a criação de oportunidade. Não há deduplicação durável entre chat e formulário. O formatter de aviso interno não está ligado a uma fila ou canal WhatsApp.

## Antes da publicação

1. Confirmar o ambiente de destino, chave dedicada, funil, etapa aberta e proteção contra abuso, sem expor segredos.
2. Validar o formulário real: desafio, contato, oportunidade, webhook autenticado e contexto no ADM.
3. Validar incorporação do canal Rook AI e conversa completa, incluindo correções e agendamento confirmado na agenda do responsável.
4. Concluir a configuração de aviso interno e comprovar entrega/deduplicação de forma separada.
5. Revisar a experiência visual e publicar somente com a configuração correspondente validada.

O merge em `main` publica a landing automaticamente na Vercel. O canal/fluxo do AsaFlow e a aquisição devem estar configurados antes desse merge. A contratação direta no chat e a passagem de uma compra ao CS não são implementadas por este recorte.

## Verificação local em 18/09/2026

- `./node_modules/.bin/tsc --noEmit --incremental false`: aprovado.
- `node scripts/run-ci-tests.mjs`: 180/180 testes aprovados após as correções da revisão. A exclusão de `billing-catalog.test.mjs` por validade temporal do snapshot já existe em main e não foi alterada.
- Build direto Next.js em modo `production`, aquisição e widget desligados: aprovado. O comando direto evita o prebuild de sincronização remota do catálogo; o build da Vercel ainda deve validar esse prebuild. O blog usou a semente local por ausência de Supabase configurado.
- Segundo build em `production`, com widget habilitado e a chave pública do canal confirmado no AsaFlow: aprovado. A chave é fornecida pelo ambiente de build, não gravada no código; o bundle contém a configuração esperada. Aquisição local permaneceu desligada.
- GET somente leitura de `https://app.rook.com.br/api/billing/catalog`: HTTP 200, validado por `parsePublicBillingCatalog`, release `p0-monthly` versão 1. O snapshot não foi alterado; a disponibilidade no instante do deploy continua sendo verificada pelo prebuild.
- `git diff --check`: aprovado.
- Comparação direta confirmou metadata e `<head>` iguais aos de main, além de ausência de mudanças em `/sobre`, `planos-copy.mjs` e `planos-copy.d.mts`.
- HTML gerado de home, planos, cadastro, assistente, diagnóstico, calculadora, sobre, restaurantes, funcionalidades, privacidade e termos: uma seção `#cadastro` por rota, uma referência ao script do widget e nenhuma oferta/preço de assinatura no JSON-LD ou nos cards. Outros formulários existentes, como calculadoras e newsletter, permanecem independentes.

Só existe `.env.local.example` nesta árvore; nenhum segredo real foi copiado. Testes locais não comprovam entrega no CRM/ADM/Slack, conversa ou agendamento. Essas evidências devem ser registradas na publicação, após os testes reais correspondentes.

## Ajustes da revisão automática

- `/funcionalidades/` incorpora a calculadora sem repetir o título principal ou o espaçamento da página própria. A copy explica a comparação indicativa do CMV e os títulos internos respeitam a hierarquia da seção.
- O parser aceita `38.5` e `150000.50` dos teclados móveis, mantendo `1.234` como milhar pt-BR e rejeitando formatos misturados. A regressão percorre o parser e o cálculo real; 28 testes focados de simulação, aquisição e ferramentas passaram antes da suíte completa.
