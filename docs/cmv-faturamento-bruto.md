# Calculadora de CMV a partir do faturamento bruto

## Experiência aprovada

O visitante informa quanto vendeu no mês, sem precisar calcular receita líquida.
O resultado explicita a sequência:

1. Faturamento bruto informado.
2. Menos impostos estimados pelo modelo de diagnóstico Rook.
3. Receita líquida estimada usada na comparação de CMV.

O estado da operação fica visível e ajustável. O custo consumido pode ser
informado em reais, em percentual das vendas brutas ou, para quem já possui
esse relatório, como percentual da receita líquida. Compras isoladas não são
tratadas como consumo: a ajuda explica estoque inicial + compras − estoque final.

## Modelo e limites

Aprovação do usuário em 24/09/2026 para reutilizar o modelo atual do diagnóstico.
Origem: `rook-system/apps/web/src/lib/tax-calculator.ts`, commit
`4b6c69ee6d20c16c4e21099f2315ab6f0d7abdcf`.

- Snapshot gerado do TypeScript por remoção de tipos, sem reescrever fórmulas.
- Versão do motor: 2.2.0. Parâmetros da origem: 2025, vigência 01/01/2025.
- Versão desta premissa pública: `rook-cmv-tax-2026-09-24`.
- O mês multiplicado por 12 representa um cenário anual, não o histórico fiscal.
- O enquadramento é inferido pelo motor, com UF e hipótese de regime especial
  de ICMS onde aplicável. Não comprova o regime ou benefício real da empresa.
- A dedução usa `taxOnRevenue`: no Presumido, IRPJ/CSLL não reduzem esta receita
  líquida. No Simples, usa o DAS conforme o modelo de origem.
- As transições do motor em R$ 300 mil e R$ 400 mil mensais foram preservadas,
  inclusive descontinuidades. Alterar essas regras requer revisão na origem.
- Não consulta parâmetros fiscais em tempo real. A data do snapshot não
  significa atualização da legislação. Deduções não informadas, como descontos
  e devoluções, não são inventadas. Cartão/delivery não são deduzidos novamente.

É uma estimativa gerencial explicitada ao usuário, não apuração fiscal.
Atualizações do motor devem gerar outro snapshot e repetir testes de paridade,
fronteiras, UFs e arredondamento. O hash de origem está em `CMV_TAX_MODEL_SOURCE`.

## Conta

```text
líquido estimado = bruto informado − impostos estimados
consumo = valor em reais OU base escolhida × percentual informado / 100
CMV comparável (%) = consumo / líquido estimado × 100
diferença mensal = consumo − líquido estimado × referência do segmento / 100
```

Valores monetários são normalizados para centavos. O percentual exibido do CMV
é arredondado para duas casas, mas a diferença em reais usa o consumo e a base,
sem multiplicar um percentual previamente arredondado. CMV derivado acima de
100% é preservado. Ausência de custo não vira zero.

Exemplo: SP, faturamento de R$ 100.000,00 e consumo de R$ 35.000,00.
Impostos estimados: R$ 8.825,00; líquido: R$ 91.175,00; CMV: 38,39%.
Para referência de 32%, a diferença é R$ 5.824,00, a investigar, sem promessa
de economia ou lucro.

## Contrato e passagem ao comercial

`rook-cmv-gross-1` exige `revenueBasis=gross`, `cmvInputMode`, `taxState` e
`taxModelVersion`. Preserva bruto e o custo na base original. Impostos, líquido
e resultado sempre são recalculados no servidor; valores derivados recebidos
do navegador não são confiados.

O cenário incluído no formulário leva inputs, resultado e premissas ao cadastro
e à descrição do negócio no CRM. O card interno é construído do mesmo cálculo.
Cenários incompletos preservam dados disponíveis, modo do CMV e metadados
validados da estimativa, sem emitir resultados. Alterar valores, modo ou UF
remove o cenário anterior do formulário até um novo cálculo.

O contrato líquido legado `rook-consultivo-1` e o ponto de equilíbrio continuam
compatíveis. A ferramenta HTTP do chatbot ainda usa seu contrato líquido
atual; atualizar o agente AsaFlow e seu contrato é uma etapa separada. Esta
mudança não altera configuração de chat, credenciais ou infraestrutura.

## Verificação

- `npm run test:ci`: suíte completa da landing.
- `npm run build`: catálogo público validado, compilação, lint e tipos.
- Testes de 27 UFs e limites de faixa, paridade com snapshot, zero/ausência,
  conversão das três bases, precisão monetária e proteção contra resultados
  adulterados pelo cliente.
- Contexto → formulário → descrição CRM → card; limites de tamanho e legado.
- Prévia local: resultado real da API local, troca do modo do custo retirando
  contexto antigo e layout em desktop/celular, nos temas claro e escuro.

Não foram cadastrados leads, enviadas mensagens ou publicadas alterações em
produção durante esta verificação local.
