import { segmentsData } from './cmv-benchmarks.mjs';
import { calculateFinancialSimulation } from './financial-simulation.mjs';
import { CMV_TAX_MODEL_VERSION, TAX_STATES } from './cmv-tax-estimate.mjs';
import { FINANCIAL_REFERENCE_BASES, validateFinancialReference } from './financial-reference.mjs';

const periodPattern = '^[0-9]{4}-(0[1-9]|1[0-2])$';
const percent = description => ({ type: 'number', minimum: 0, maximum: 100, description });
const amount = (description, minimum = 0) => ({ type: 'number', minimum, maximum: 1_000_000_000, description });
const sharedProperties = {
  referenceBasis: { type: 'string', enum: [...FINANCIAL_REFERENCE_BASES], description: 'Prefira last_month (último mês) ou monthly_average_12m (média mensal dos últimos 12 meses), conforme o visitante. Não peça nem invente data. Receita e custos devem usar a mesma janela; médias mensais já estão em valores mensais.' },
  period: { type: 'string', minLength: 7, maxLength: 7, pattern: periodPattern, description: 'Compatibilidade: mês YYYY-MM somente se informado e confirmado pelo visitante. Use period OU referenceBasis, nunca ambos.' },
  currency: { type: 'string', const: 'BRL', description: 'Valores monetários em reais.' },
  revenue: amount('Faturamento mensal na base indicada, do último mês ou média mensal dos mesmos 12 meses dos custos.', 0.01),
  cmvPercent: percent('CMV já apurado, com base explicitamente confirmada. Não inferir consumo a partir das compras. Na média mensal, use custo total / receita total da janela, não a média simples dos percentuais.'),
  confirmed: { type: 'boolean', const: true, description: 'True somente após mostrar e obter confirmação de receita e sua base, CMV e sua base/valor, referência e custos na mesma janela e, para CMV bruto, UF e uso de impostos estimados. Toda correção exige nova confirmação.' },
};
const commonRequired = ['currency', 'revenue', 'revenueBasis', 'confirmed'];
const referenceChoice = {
  oneOf: [
    { required: ['referenceBasis'], not: { required: ['period'] } },
    { required: ['period'], not: { required: ['referenceBasis'] } },
  ],
};
const forbiddenFields = fields => ({ not: { anyOf: fields.map(field => ({ required: [field] })) } });
const cmvChoice = {
  oneOf: [
    {
      properties: { revenueBasis: { const: 'net' } }, required: ['cmvPercent'],
      ...forbiddenFields(['cmvInputMode', 'cmvAmount', 'taxState', 'taxModelVersion']),
    },
    ...['amount', 'gross_percent', 'net_percent'].map(mode => ({
      properties: { revenueBasis: { const: 'gross' }, cmvInputMode: { const: mode } },
      required: ['cmvInputMode', 'taxState', 'taxModelVersion', mode === 'amount' ? 'cmvAmount' : 'cmvPercent'],
      ...forbiddenFields([mode === 'amount' ? 'cmvPercent' : 'cmvAmount']),
    })),
  ],
};

const taxChoice = {
  oneOf: [
    { properties: { taxInputMode: { const: 'percent' } }, required: ['taxPercent'], ...forbiddenFields(['taxAmount']) },
    { properties: { taxInputMode: { const: 'amount' } }, required: ['taxInputMode', 'taxAmount'], ...forbiddenFields(['taxPercent']) },
  ],
};

const definitions = [
  {
    name: 'analisar_cmv',
    calculation: 'cmv',
    description: 'Peça faturamento bruto e CMV em reais ou percentual com base confirmada. Estima impostos pelo modelo Rook e compara o CMV sobre receita líquida estimada. Prefira último mês ou média mensal dos últimos 12 meses, sem pedir data. Receita líquida informada permanece aceita no contrato legado. Não cadastra contato.',
    required: [...commonRequired, 'segment'],
    choices: [referenceChoice, cmvChoice],
    properties: {
      ...sharedProperties,
      revenueBasis: { type: 'string', enum: ['gross', 'net'], description: 'Prefira gross: faturamento antes de impostos. net é somente para receita líquida informada e explicitamente confirmada com CMV sobre ela; não deduzir impostos novamente.' },
      cmvInputMode: { type: 'string', enum: ['amount', 'gross_percent', 'net_percent'], description: 'No cenário bruto, amount = ingredientes consumidos em reais; gross_percent = percentual do faturamento bruto; net_percent = percentual da receita líquida estimada. Confirme a base; nunca suponha que compras são consumo.' },
      cmvAmount: amount('Custo dos ingredientes efetivamente consumidos, em reais, no mesmo último mês ou como média mensal da mesma janela de 12 meses da receita. Não equivale às compras isoladas.'),
      taxState: { type: 'string', enum: TAX_STATES.map(state => state.code), description: 'UF explicitamente confirmada para a estimativa de impostos. Não presumir SP ou o regime tributário real do visitante.' },
      taxModelVersion: { type: 'string', const: CMV_TAX_MODEL_VERSION, description: 'Versão das premissas internas usadas pelo motor, preenchida pela integração. Não perguntar este código ao visitante; informar que os impostos são estimados.' },
      segment: { type: 'string', enum: [...segmentsData.map(segment => segment.slug), 'other'], description: 'Segmento confirmado. Use other quando não houver correspondência; não escolha uma referência por aproximação.' },
    },
  },
  {
    name: 'estimar_ponto_equilibrio',
    calculation: 'breakeven',
    description: 'Estima o ponto de equilíbrio mensal usando custos fixos e variáveis separados. Aceita impostos em reais ou percentual do faturamento bruto. Prefira último mês ou média mensal dos últimos 12 meses, sem pedir data; receita e custos precisam da mesma janela. Não cadastra contato.',
    required: [...commonRequired, 'cmvPercent', 'fixedCosts', 'feesPercent', 'otherVariablePercent'],
    choices: [referenceChoice, taxChoice],
    properties: {
      ...sharedProperties,
      revenueBasis: { type: 'string', const: 'gross', description: 'Receita bruta e todos os percentuais sobre essa mesma base, explicitamente confirmados.' },
      confirmed: { ...sharedProperties.confirmed, description: `${sharedProperties.confirmed.description} Confirme também o modo e o valor dos impostos sobre vendas, sem duplicá-los nos custos fixos.` },
      fixedCosts: amount('Custos fixos do último mês ou média mensal dos mesmos 12 meses da receita. Zero somente se informado; desconhecido não é zero.'),
      taxInputMode: { type: 'string', enum: ['amount', 'percent'], description: 'Modo confirmado pelo visitante: valor dos impostos sobre vendas em reais ou percentual do faturamento bruto. Sem modo, apenas taxPercent legado é aceito. Nunca confundir reais com percentual.' },
      taxAmount: amount('Impostos sobre vendas em reais referentes ao mesmo último mês da receita ou média mensal dos mesmos 12 meses. Não incluir guias atrasadas, multas ou tributos de folha já nos custos fixos. Zero somente se informado. O motor converte para percentual sem arredondamento antecipado.'),
      taxPercent: percent('Impostos sobre a receita bruta da mesma janela. Na média, impostos totais / receita total, não média simples das alíquotas.'),
      feesPercent: percent('Taxas de cartão e delivery sobre a receita bruta total da mesma janela, sem repetir custos.'),
      otherVariablePercent: percent('Outros custos variáveis sobre a mesma receita bruta e janela, sem repetir custos.'),
    },
  },
];

/** Descritores independentes de provedor; registrar no agente exige uma integração real. */
export const FINANCIAL_CHAT_TOOLS = definitions.map(({ name, description, properties, required, choices }) => ({
  name,
  description,
  inputSchema: { type: 'object', properties, required, allOf: choices, additionalProperties: false },
}));

function fieldError(field, value, schema) {
  if (schema.type === 'number') {
    return typeof value !== 'number' || !Number.isFinite(value) || value < schema.minimum || value > schema.maximum
      ? `Informe um número entre ${schema.minimum} e ${schema.maximum}.` : null;
  }
  if (field === 'period') return typeof value !== 'string' || value.length !== 7 || !new RegExp(periodPattern).test(value)
    ? 'Informe um mês válido no formato YYYY-MM.' : null;
  if (field === 'currency') return value !== 'BRL' ? 'Use a moeda BRL.' : null;
  if (field === 'revenueBasis') return !(schema.enum ?? [schema.const]).includes(value)
    ? (schema.const === 'gross' ? 'Confirme a base bruta da receita e dos percentuais.' : 'Confirme a base da receita: prefira faturamento bruto; líquida somente se informada explicitamente.') : null;
  if (schema.enum && !schema.enum.includes(value)) return {
    referenceBasis: 'Escolha o último mês ou a média mensal dos últimos 12 meses.',
    segment: 'Selecione um segmento da lista ou other.',
    cmvInputMode: 'Confirme se o CMV é informado em reais, percentual do bruto ou percentual do líquido estimado.',
    taxState: 'Confirme uma UF válida para estimar os impostos.',
    taxInputMode: 'Confirme se os impostos são informados em reais ou percentual.',
  }[field] ?? 'Selecione uma opção válida.';
  if (field === 'taxModelVersion' && value !== schema.const) return 'Atualize a integração para usar a versão atual das premissas de impostos.';
  return null;
}

/**
 * A conversa pode trazer dados em qualquer ordem. Este adaptador informa o que
 * falta e só chama o motor após a confirmação do cenário. Não recebe contatos,
 * texto livre, resultados anteriores, datas inferidas ou defaults financeiros.
 *
 * confirmed é uma barreira do contrato, não prova de uma mensagem real: quem
 * orquestra deve apresentar base da receita/CMV, custos, UF e referência, vincular
 * a confirmação à resposta do visitante e removê-la sempre que houver correção.
 * Não há estado, armazenamento ou efeito externo.
 */
export function executeFinancialChatTool(toolName, candidate) {
  const definition = definitions.find(item => item.name === toolName);
  if (!definition) return { status: 'invalid_input', errors: { toolName: 'Ferramenta financeira desconhecida.' } };
  if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) {
    return { status: 'invalid_input', errors: { arguments: 'Informe os campos estruturados do cenário.' } };
  }

  const fields = Object.keys(definition.properties);
  const errors = {};
  if (Object.keys(candidate).some(field => !fields.includes(field))) {
    // Não devolver campos ou valores extras: eles podem conter dados de contato.
    errors.arguments = 'O cenário contém campos não permitidos.';
  }
  const present = field => Object.hasOwn(candidate, field) && candidate[field] != null;
  for (const field of fields) {
    if (field === 'confirmed' || !present(field)) continue;
    const error = fieldError(field, candidate[field], definition.properties[field]);
    if (error) errors[field] = error;
  }
  const referenceCandidate = Object.fromEntries(['referenceBasis', 'period'].filter(present).map(field => [field, candidate[field]]));
  const reference = validateFinancialReference(referenceCandidate, { required: false });
  if (!reference.ok) Object.assign(errors, reference.errors);

  const required = definition.required.filter(field => field !== 'confirmed');
  if (toolName === 'analisar_cmv') {
    const incompatible = candidate.revenueBasis === 'net'
      ? ['cmvInputMode', 'cmvAmount', 'taxState', 'taxModelVersion']
      : candidate.revenueBasis === 'gross' && ['amount', 'gross_percent', 'net_percent'].includes(candidate.cmvInputMode)
        ? [candidate.cmvInputMode === 'amount' ? 'cmvPercent' : 'cmvAmount'] : [];
    for (const field of incompatible.filter(present)) errors[field] = 'Este campo não pertence à base ou ao modo de CMV confirmado.';
    if (candidate.revenueBasis === 'net') required.push('cmvPercent');
    if (candidate.revenueBasis === 'gross') {
      required.push('cmvInputMode', 'taxState', 'taxModelVersion');
      if (candidate.cmvInputMode === 'amount') required.push('cmvAmount');
      else if (['gross_percent', 'net_percent'].includes(candidate.cmvInputMode)) required.push('cmvPercent');
    }
  }
  if (toolName === 'estimar_ponto_equilibrio') {
    if (present('taxAmount') && present('taxPercent')) errors.taxInputMode = 'Informe o imposto em reais ou percentual, sem misturar os dois.';
    if (candidate.taxInputMode === 'amount') {
      required.push('taxAmount');
      if (present('taxPercent')) errors.taxPercent = 'Este campo não pertence ao modo de impostos confirmado.';
    } else {
      required.push('taxPercent');
      if (present('taxAmount')) errors.taxInputMode = 'Confirme o modo amount para informar o valor da guia em reais.';
    }
  }
  if (present('confirmed') && typeof candidate.confirmed !== 'boolean') errors.confirmed = 'A confirmação precisa ser true ou false.';
  if (Object.keys(errors).length) return { status: 'invalid_input', errors };
  const missingFields = required.filter(field => !present(field));
  if (!present('referenceBasis') && !present('period')) missingFields.unshift('referenceBasis');
  if (missingFields.length) return { status: 'needs_information', toolName, missingFields };

  const inputs = { tool: definition.calculation };
  for (const field of fields) {
    if (present(field) && !['period', 'currency', 'confirmed'].includes(field)) inputs[field] = candidate[field];
  }
  // The legacy period remains response context; new references also travel with
  // inputs so the deterministic engine explains the same-window assumptions.
  const context = { toolName, ...reference.value, currency: candidate.currency };
  if (candidate.confirmed !== true) return { status: 'needs_confirmation', ...context, inputs };

  const calculation = calculateFinancialSimulation(inputs);
  if (!calculation.ok) return { status: 'invalid_input', errors: calculation.errors };
  return { status: 'success', ...context, ...calculation };
}
