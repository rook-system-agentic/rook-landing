# ROO-1207 — captação consultiva

Escopo da revisão de 15/09/2026: coletar o cadastro gradualmente durante a conversa de diagnóstico, reutilizando respostas. Formulário continua disponível; preço público dá lugar à solicitação de demonstração.

## Contrato da primeira versão

- Entradas: conhecer o Rook, analisar CMV, estimar ponto de equilíbrio, atendimento à equipe.
- Perguntas curtas com correção e caminho explícito para quem não sabe um número.
- Cadastro: responsável, estabelecimento, WhatsApp, e-mail, cidade/UF com ID IBGE, segmento, faturamento e ERP/PDV (sim/não; lista; outro).
- CMV: percentual já conhecido sobre receita líquida. Convenção segue o texto explícito da calculadora atual; referência Rook 2026 é indicativa e sua metodologia continua pendente de validação. Não converter receita bruta em líquida implicitamente.
- PE: receita bruta, CMV na mesma base, fixos em reais, impostos, taxas e outros custos variáveis em %. Sem alíquotas médias ou custo por empregado silenciosos.
- Funções puras compartilhadas, entradas confirmadas, resultado com versão e premissas. Margem não positiva não gera PE zero nem resultado saudável.
- Informações da simulação ficam ligadas ao cadastro. Analytics não recebe dados pessoais/financeiros.
- Resposta de sucesso comercial apenas após confirmação da persistência. Falha de CRM não impede visualizar a simulação.

## Evidência de integração

AsaFlow fornece API pública documentada em https://app.asaflow.com.br/api/v1/openapi.json. Criações exigem Idempotency-Key (24h); escrita de contatos e negócios requer os respectivos escopos. A API v1 explicitamente não envia mensagens de conversa.

O nó Webhook do editor oferece URL, método e assinatura Standard Webhooks, com tentativas por cerca de 24h. Não oferece mapeamento de resposta síncrona na configuração observada. Consequentemente a interface de cálculo Rook será o caminho de cálculo, e o AsaFlow continuará responsável pelo atendimento e CRM. Não duplicar fórmulas no prompt.

A configuração do canal nativo é uma entrega separada. O uso público exige validar o fluxo final e sua integração.

## Entrega e validação

Base homolog 58f9ca122997bd6565f0af87bb5f6edb6a50fb9a; branch isolada codex/roo-1207-captacao-consultiva. PR132 existente preservado. Antes de disponibilizar: testes financeiros e de cadastro, navegação móvel/teclado, falha e reenvio, conexão real com CRM/ADM, prova de contexto e ausência de duplicidade. Main publica Vercel automaticamente; publicação é etapa posterior à revisão.

## Implementação desta revisão

- `/assistente/` oferece conversa guiada determinística, com CMV e ponto de equilíbrio; `/cadastro/` e `/planos/` oferecem o formulário sobre o mesmo componente/estado. Não é um modelo generativo.
- As rotas existentes das duas ferramentas usam o mesmo motor. `POST /api/financial-simulations/` não persiste dados; `POST /api/acquisition/` revalida e recalcula o cenário antes do CRM.
- IDs IBGE vêm do snapshot oficial de municípios, obtido em 15/09/2026 de `https://servicodados.ibge.gov.br/api/v1/localidades/municipios?orderBy=nome` (5.571 registros). Nome/UF são resolvidos pelo ID no servidor.
- Contato novo via API pública AsaFlow; contato existente com e-mail + telefone iguais é reaproveitado sem sobrescrever dados. Negócio recebe perfil, mês, entradas, versão e premissas na descrição.
- Formulário e conversa **na mesma página** compartilham ID e respostas. Retry de uma solicitação mantém corpo/idempotência. A garantia nativa de POST do fornecedor vale 24 horas. Nova aba/sessão e o widget legado ainda exigem regra de reconciliação para não gerar outra oportunidade; não há identidade persistente entre esses canais nesta revisão.
- Preços removidos da home, `/planos/`, navegação e ofertas estruturadas. O catálogo de cobrança interno permanece intacto.

## Configuração para homologação

1. Chave dedicada AsaFlow com `contacts:read`, `contacts:write` e `deals:write`, conforme os escopos de cada operação no OpenAPI oficial. Não ampliar a chave de write-back do ADM.
2. `ASAFLOW_ACQUISITION_API_KEY` somente no servidor. Definir explicitamente `ASAFLOW_ACQUISITION_PIPELINE_ID` e `ASAFLOW_ACQUISITION_STAGE_ID`; confirmar funil e etapa de entrada aberta na conta antes de habilitar. Nunca usar etapa ganha.
3. Proteção distribuída comercial existente configurada no **Supabase de HML**. `ASAFLOW_ACQUISITION_ENABLED=false` por padrão; ativar apenas no ambiente autorizado.
4. Confirmar webhook AsaFlow → ADM de HML e presença de `deal.description` no payload real. O pequeno patch complementar do ADM cria notas com esse contexto apenas no primeiro evento e preserva as anotações posteriores.
5. Teste sintético controlado deve comprovar contato, oportunidade, notas no ADM, reenvio três vezes e ausência de comunicação real. Sem esse E2E, integração não está homologada.

## Evidências locais em 15/09/2026

- `pnpm exec tsc --noEmit`: aprovado.
- `pnpm test:ci`: **141/141 testes aprovados**.
- `NEXT_PUBLIC_ENV=homolog pnpm build`: aprovado. Snapshot de cobrança atualizado pelo prebuild foi restaurado ao conteúdo inicial para não incluir mudança alheia ao escopo.
- Browser: CMV líquido 100.000 / 38% / à la carte → diferença indicativa 6.000; PE bruto 150.000 / CMV 35% / fixos 60.000 / impostos 8% / taxas 2% / outros 5% → PE 120.000.
- Cidade São Paulo/SP selecionada por teclado e por clique; ERP “Outro” com texto e “Não” exercitados; troca para formulário preserva cadastro/cenário. Prévia termina sem enviar ao CRM.
- Mobile 390 × 844 sem rolagem horizontal. Conteúdo não inclui dados financeiros/pessoais em analytics.

## Pendências que impedem ativação pública

Chave e ambiente HML; captura do payload real e E2E CRM/ADM; reconciliação entre sessões/canais; mapeamento de propriedades customizadas para segmentação; revisão humana do benchmark CMV; revisão do prompt/base da IA nativa e substituição do roteiro legado no clone antes de publicá-lo.

O fluxo nativo e a base do SDR precisam passar por revisão própria antes de ativação. Não confundir o assistente guiado deste código com um modelo generativo ou com a publicação de um fluxo AsaFlow.

Notificação interna por WhatsApp permanece no estudo, sem disparador ativado: escolher um responsável, emissor/destinatário e template, com deduplicação por cadastro confirmado e confirmação de entrega. Não houve envio de mensagens nem criação de contato/negócio real.

## Recuperação

Desligar `ASAFLOW_ACQUISITION_ENABLED` interrompe novas gravações comerciais e conserva o cálculo. Falha comercial mostra erro e mantém dados na página; reenvio usa a mesma solicitação. Antes da publicação, preservar a URL da versão anterior e o commit para rollback. Não apagar cards/contatos para reverter código. Nenhum merge, promoção ou deploy de produção foi realizado nesta construção.
