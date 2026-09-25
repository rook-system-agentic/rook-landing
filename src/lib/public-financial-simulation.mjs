const currency = value => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const pick = (value, fields) => Object.fromEntries(fields.filter(field => Object.hasOwn(value, field)).map(field => [field, value[field]]));

// A lista é deliberadamente explícita: um novo parâmetro no motor não passa a
// ser público por acidente. O servidor recalcula o cenário no envio do lead.
export function publicFinancialInputs(inputs) {
  return pick(inputs, [
    'tool', 'revenueBasis', 'revenue', 'referenceBasis', 'period', 'segment',
    'cmvInputMode', 'cmvAmount', 'cmvPercent', 'taxState', 'fixedCosts',
    'taxPercent', 'feesPercent', 'otherVariablePercent',
  ]);
}

/** Projeção pública; premissas, tabelas e memória de cálculo ficam no servidor. */
export function toPublicFinancialSimulation(calculation) {
  if (!calculation.ok) return { ok: false, errors: { ...calculation.errors } };
  const inputs = publicFinancialInputs(calculation.inputs);
  const internal = calculation.result;
  const result = { status: internal.status };
  let summary;
  if (calculation.tool === 'cmv') {
    if (inputs.revenueBasis === 'gross') {
      Object.assign(result, pick(internal, ['comparisonCmvPercent', 'estimatedTaxAmount', 'estimatedNetRevenue']));
    } else result.comparisonCmvPercent = inputs.cmvPercent;
    // O valor exato da diferença permitiria recompor o benchmark por uma
    // subtração. No site a comparação é qualitativa; o detalhe fica no card interno.
    result.assessment = internal.status === 'no_reference' ? 'no_reference'
      : internal.monthlyDifference > 0 ? 'attention' : 'within_reference';
    summary = result.assessment === 'no_reference'
      ? 'Seu CMV foi calculado. Para avaliar esse segmento, a equipe pode analisar o contexto da sua operação.'
      : result.assessment === 'attention'
        ? 'Seu custo com ingredientes merece atenção. Podemos ajudar a investigar consumo, desperdícios e composição das vendas na sua operação.'
        : 'Seu CMV está dentro da referência usada nesta análise. Esse indicador sozinho não determina o lucro do restaurante.';
  } else {
    result.breakEvenRevenue = internal.breakEvenRevenue;
    summary = internal.status === 'non_positive_margin'
      ? 'Os custos variáveis consomem toda a receita ou mais. Nessas condições, aumentar as vendas não cobre os custos fixos. Revise os percentuais com a equipe.'
      : `Neste cenário, a receita mensal estimada para cobrir os custos é ${currency(internal.breakEvenRevenue)}. Sua receita está ${currency(Math.abs(inputs.revenue - internal.breakEvenRevenue))} ${inputs.revenue >= internal.breakEvenRevenue ? 'acima' : 'abaixo'} desse ponto. Essa diferença de receita não é o valor do lucro ou prejuízo.`;
  }
  return {
    ok: true, tool: calculation.tool, inputs, result, summary,
    notice: 'Estimativa para orientar a análise da operação. Não representa apuração fiscal, lucro ou economia garantida.',
  };
}

/** As ferramentas HTTP também são públicas; não podem devolver o objeto interno. */
export function toPublicFinancialChatResponse(response) {
  if (response.status === 'invalid_input') return { status: response.status, errors: { ...response.errors } };
  if (response.status === 'needs_information') return { status: response.status, toolName: response.toolName, missingFields: [...response.missingFields] };
  const context = pick(response, ['status', 'toolName', 'referenceBasis', 'period', 'currency']);
  if (response.status === 'needs_confirmation') return { ...context, inputs: publicFinancialInputs(response.inputs) };
  return { ...context, ...toPublicFinancialSimulation(response) };
}
