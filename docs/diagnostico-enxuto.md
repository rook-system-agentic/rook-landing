# Diagnóstico com os números do último mês

## Escopo

Simplificar `/diagnostico/` para seis entradas. A referência é sempre o último
mês, sem seletor e sem atribuir uma data que o visitante não informou.

| Entrada | Unidade |
| --- | --- |
| Vendas no último mês | R$ |
| Compras de ingredientes e bebidas no último mês | R$ |
| Custos fixos mensais | R$ |
| Guia de impostos do último mês | R$ |
| Taxas de cartão e delivery | % das vendas totais |
| Outros custos variáveis no último mês | R$ |

Custos fixos e taxas conservam suas orientações. Outros variáveis têm exemplos
de embalagens, descartáveis e comissões por venda, sem repetir despesas já
informadas. A identificação, o contato comercial opcional e a confirmação do
cadastro antes de exibir o resultado permanecem no fluxo existente.

## Cálculo e proveniência

O novo cenário é identificado por `costInputMode: purchases_amount`, com
`referenceBasis: last_month` e `taxInputMode: amount`. As entradas mantêm
`purchasesAmount`, `taxAmount` e `otherVariableAmount` em reais desde o formulário
até o recálculo no servidor, a projeção pública e o contexto interno.

Compras são uma aproximação do consumo, não CMV apurado. Aumento ou redução de
estoque pode distorcer a estimativa. Essa limitação aparece na pergunta e no
resultado; a memória interna registra a versão `rook-breakeven-purchases-1`.

Para projetar o ponto de equilíbrio, o servidor considera constantes os custos
fixos e a proporção dos gastos variáveis em relação às vendas:

`margem = 1 − (compras + impostos + outros variáveis) / vendas − taxas / 100`

`ponto de equilíbrio = custos fixos / margem`

Os valores em reais não são somados novamente aos custos fixos. Proporções
derivadas não são arredondadas antes do cálculo. O resultado é uma estimativa
gerencial, não lucro contábil, fluxo de caixa nem apuração fiscal.

O modo anterior permanece aceito para compatibilidade de integrações existentes.
O novo modo não aceita a mistura de compras em reais com CMV percentual, outros
variáveis percentuais ou impostos percentuais. A calculadora de CMV e o contrato
do chat não passam a tratar compras como consumo apurado.

## Critérios de aceite

1. O diagnóstico apresenta seis campos numéricos; cinco em reais e taxas em %.
2. Não apresenta seletores de referência ou de formato dos impostos.
3. Campos desconhecidos ficam ausentes; não viram zero nem geram resultado.
4. Zero é aceito para custos inexistentes; vendas precisam ser positivas.
5. Margem zero ou negativa não produz ponto de equilíbrio fictício.
6. Vendas de R$ 150.000, compras de R$ 52.500, fixos de R$ 60.000, impostos de
   R$ 12.000, taxas de 2% e outros variáveis de R$ 7.500 resultam em R$ 120.000.
7. Cadastro e demonstração posterior preservam os valores em reais e a referência.
8. A calculadora de CMV e os cenários legados continuam funcionando.
9. Desktop e celular permitem preencher, revisar e avançar para identificação.

## Publicação

Fluxo de entrega: branch de trabalho → PR para `homolog` → validação → `main`.
Testes com transporte simulado comprovam o contrato do código, sem constituir
evidência de cadastro real no CRM. Merge, deploy e validação em produção são
etapas separadas.
