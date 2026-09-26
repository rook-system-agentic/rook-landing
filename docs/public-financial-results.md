# Resultados financeiros públicos e premissas internas

## Limite de exposição

A calculadora de CMV e o diagnóstico apresentam os números do cenário e uma orientação. Tabelas de referência, parâmetros fiscais, fórmulas e memória de cálculo pertencem ao servidor.

- O navegador importa apenas seletores, parser, normalizadores e validação de entrada. Não importa `financial-simulation`, `cmv-gross-simulation`, `cmv-tax-estimate`, `cmv-benchmarks` ou o módulo fiscal em `vendor`.
- `/api/financial-simulations/` exige cadastro e grava o lead antes de devolver a projeção explícita em `public-financial-simulation.mjs`. Novos campos internos não se tornam públicos automaticamente. O fluxo está documentado em [financial-lead-gate.md](financial-lead-gate.md).
- As rotas `/api/ai/tools/analisar-cmv/` e `/api/ai/tools/estimar-ponto-equilibrio/` aplicam a mesma projeção, inclusive nas entradas devolvidas para confirmação.
- O contexto da calculadora enviado ao formulário contém entradas validadas. A captação recalcula no servidor; CRM e cards internos continuam recebendo os detalhes completos.

## Resultado público

CMV: faturamento informado, impostos estimados em reais, receita líquida estimada, CMV da operação e orientação qualitativa. A versão legada de receita líquida continua aceita.

A referência numérica e a diferença mensal em reais não são publicadas. O valor exato da diferença, combinado com os valores informados, permitiria reconstruir a referência interna.

Ponto de equilíbrio: receita mensal necessária para cobrir os custos, orientação e aviso de estimativa. Os cenários sem margem positiva continuam explícitos, sem um ponto de equilíbrio inventado.

O visitante continua sabendo que os impostos são estimados e que a análise não comprova lucro, economia ou apuração fiscal. Nenhuma alíquota, referência ou fórmula foi alterada.

## Contrato HTTP v2

`rook-ai-financial-tools.openapi.json` documenta a resposta pública v2. A confirmação permanece obrigatória. O ponto de equilíbrio aceita impostos em reais (`taxInputMode=amount`, `taxAmount`) ou percentual (`taxInputMode=percent`, `taxPercent`); o percentual legado sem modo continua válido. A entrada em reais é um dado do visitante, preservado como tal no contexto e na saída pública, sem expor a taxa derivada ou a memória de cálculo. A saída contém `inputs`, `result`, `summary` e `notice`; deixa de devolver `assumptions`, `formulaVersion`, benchmarks e demais detalhes internos. Integrações devem guardar as entradas originais para correções e confirmações, em vez de reconstruir a requisição a partir da resposta filtrada. O identificador público do modelo continua sendo exigido na entrada; não contém a tabela fiscal.

O adaptador puro interno mantém o objeto completo; a filtragem ocorre na fronteira HTTP. Consumidores de HTTP devem utilizar o resumo e o aviso públicos. A alteração do contrato não comprova conexão das ferramentas com o agente nativo do AsaFlow.

## Verificação e limites

Os testes cobrem os campos permitidos nas APIs, dependências transitivas de todos os componentes cliente, preservação do cálculo interno na captação e os contratos de entrada. Após compilar, conferir também os bundles de `.next/static` e testar CMV e ponto de equilíbrio pelo navegador.

Resultados individuais continuam permitindo inferências sobre o cenário; esta separação impede a distribuição direta das tabelas e do motor. Não remove arquivos de versões anteriormente publicadas. Publicação e validação em produção são etapas posteriores ao merge.
