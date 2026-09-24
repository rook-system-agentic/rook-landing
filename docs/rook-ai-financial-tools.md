# Rook AI — integração das ferramentas financeiras

Orientação atual do contrato HTTP. O esquema completo está em
[`rook-ai-financial-tools.openapi.json`](./rook-ai-financial-tools.openapi.json)
e os descritores executáveis estão em `src/lib/financial-chat-tools.mjs`.

## Estado da conexão

Na configuração inspecionada em **24/09/2026**, o agente nativo do AsaFlow
conduz a conversa por suas instruções e **não chama as ferramentas HTTP abaixo**.
O código, os testes e a OpenAPI não comprovam essa conexão nem a execução do
motor determinístico pelo chat. Para conectar, a integração precisa enviar o
cenário estruturado ao endpoint e devolver sua resposta à mesma conversa.
Uma conta realizada apenas pelo modelo de IA não é evidência de chamada ao motor.

As rotas de cálculo não cadastram contatos, não persistem dados, não enviam
mensagens e não marcam reuniões. A passagem de contexto ao formulário/CRM é
outro fluxo e não deve ser inferida de um cálculo bem-sucedido.

## Coleta sem pedir mês e ano

Use uma referência confirmada pelo visitante:

| Campo/valor | Significado |
| --- | --- |
| `referenceBasis=last_month` | Valores do último mês informado, sem atribuir data calendário. |
| `referenceBasis=monthly_average_12m` | Médias mensais dos mesmos últimos 12 meses. Não dividir novamente por 12. |
| `period=YYYY-MM` | Compatibilidade com mês já informado e confirmado pelo visitante. |

Use **`referenceBasis` ou `period`**, nunca ambos. A ausência da referência pede
`referenceBasis`; não deve resultar em uma pergunta por mês/ano. Receita e
custos usam a mesma janela. Na média mensal, percentuais são razões entre os
totais dos 12 meses, não médias simples dos percentuais de cada mês.

## CMV: faturamento bruto como entrada preferencial

`POST /api/ai/tools/analisar-cmv/` corresponde a `analisar_cmv`.

Pergunte quanto o restaurante vende, antes dos impostos. Com
`revenueBasis=gross`, informe receita, referência, segmento, moeda `BRL`, UF
confirmada em `taxState`, versão `taxModelVersion=rook-cmv-tax-2026-09-24` e
uma destas formas de consumo:

| `cmvInputMode` | Campo | Base explicitamente confirmada |
| --- | --- | --- |
| `amount` | `cmvAmount` | Ingredientes efetivamente consumidos, em reais. |
| `gross_percent` | `cmvPercent` | Percentual do faturamento bruto. |
| `net_percent` | `cmvPercent` | Percentual da receita líquida estimada. |

Compras isoladas não medem consumo de estoque. Não misture `cmvAmount` e
`cmvPercent`, não complete custo desconhecido com zero e não adivinhe a base
de um percentual. `taxModelVersion` é preenchida pela integração; não se pede
esse código ao visitante. A UF precisa ser confirmada, sem assumir SP no chat.

O motor calcula os impostos estimados e a receita após esses impostos,
converte o CMV conforme a base declarada e faz a comparação por segmento.
Apresente bruto, imposto estimado, líquido estimado e a base do CMV com as
premissas retornadas. Não apresente a estimativa como apuração fiscal ou
promessa de economia. Os detalhes do modelo ficam em
[`cmv-faturamento-bruto.md`](./cmv-faturamento-bruto.md).

### Compatibilidade com líquido informado

`revenueBasis=net` continua aceito quando o visitante já informa receita
líquida e CMV percentual sobre essa mesma receita. Nesse caminho, envie
`cmvPercent` e omita `cmvInputMode`, `cmvAmount`, `taxState` e `taxModelVersion`.
Não desconte impostos novamente. A referência pode ser a nova escolha
relativa ou o mês legado já informado.

## Ponto de equilíbrio

`POST /api/ai/tools/estimar-ponto-equilibrio/` corresponde a
`estimar_ponto_equilibrio`. A matemática permanece a mesma: receita bruta,
CMV, impostos, taxas e outros custos variáveis em percentuais sobre a mesma
receita, mais custos fixos em reais. A referência passa a aceitar as mesmas
duas escolhas sem mês. Não use o CMV percentual sobre líquido diretamente
como se fosse percentual sobre bruto, nem reaplique a dedução de imposto do
CMV à receita desta ferramenta.

## Confirmação e retorno à conversa

1. `needs_information`: perguntar somente o que falta. Se faltar a versão do
   modelo, corrigir a configuração da integração, sem perguntar ao visitante.
2. `needs_confirmation`: mostrar receita e base, consumo e base/valor,
   referência, custos na mesma janela e, no CMV bruto, UF e uso de impostos
   estimados. Ainda não houve cálculo.
3. Somente depois da resposta do visitante, reenviar com `confirmed=true`.
   Qualquer correção invalida a confirmação anterior.
4. `success`: apresentar resultado e premissas retornados pelo motor.
   `no_reference` não autoriza inventar benchmark; `non_positive_margin`
   não autoriza inventar um ponto de equilíbrio.
5. `invalid_input`: corrigir o cenário e obter nova confirmação. Não reutilizar
   o resultado de um cenário anterior.

O campo `confirmed` é uma condição do contrato, não prova autônoma de que a
pessoa confirmou. Essa ligação com a mensagem real pertence à orquestração.
O corpo aceita até 4.096 bytes de JSON, sem dados pessoais ou texto livre.
Use os exemplos da OpenAPI para testar os modos bruto, líquido legado e as
referências, verificando a chamada HTTP e o retorno à conversa antes de declarar
o cálculo conectado ao AsaFlow.
