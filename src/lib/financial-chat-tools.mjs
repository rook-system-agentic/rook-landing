import { segmentsData } from './cmv-benchmarks.mjs';
import { calculateFinancialSimulation } from './financial-simulation.mjs';

const periodPattern = '^[0-9]{4}-(0[1-9]|1[0-2])$';
const percent = description => ({ type: 'number', minimum: 0, maximum: 100, description });
const amount = (description, minimum = 0) => ({ type: 'number', minimum, maximum: 1_000_000_000, description });
const sharedProperties = {
  period: { type: 'string', minLength: 7, maxLength: 7, pattern: periodPattern, description: 'Mês dos valores, confirmado pelo visitante, no formato YYYY-MM.' },
  currency: { type: 'string', const: 'BRL', description: 'Valores monetários em reais.' },
  revenue: amount('Receita mensal na base indicada; todos os dados devem ser do mesmo mês.', 0.01),
  cmvPercent: percent('CMV já apurado, em percentual da mesma receita. Não inferir a partir das compras.'),
  confirmed: { type: 'boolean', const: true, description: 'True somente após o visitante confirmar este cenário. Uma correção exige nova confirmação.' },
};

const definitions = [
  {
    name: 'analisar_cmv',
    calculation: 'cmv',
    description: 'Compara o CMV já apurado com a referência indicativa do segmento. Não calcula consumo de estoque e não cadastra contato.',
    properties: {
      ...sharedProperties,
      revenueBasis: { type: 'string', const: 'net', description: 'Receita líquida e CMV sobre essa mesma base, explicitamente confirmados.' },
      segment: { type: 'string', enum: [...segmentsData.map(segment => segment.slug), 'other'], description: 'Segmento confirmado. Use other quando não houver correspondência; não escolha uma referência por aproximação.' },
    },
  },
  {
    name: 'estimar_ponto_equilibrio',
    calculation: 'breakeven',
    description: 'Estima o ponto de equilíbrio mensal usando custos fixos e percentuais variáveis separados. Não cadastra contato.',
    properties: {
      ...sharedProperties,
      revenueBasis: { type: 'string', const: 'gross', description: 'Receita bruta e todos os percentuais sobre essa mesma base, explicitamente confirmados.' },
      fixedCosts: amount('Custos fixos mensais em reais. Zero somente se informado; desconhecido não é zero.'),
      taxPercent: percent('Impostos sobre a receita bruta do mês.'),
      feesPercent: percent('Taxas de cartão e delivery sobre a receita bruta total, sem repetir custos.'),
      otherVariablePercent: percent('Outros custos variáveis sobre a mesma receita bruta, sem repetir custos.'),
    },
  },
];

/** Descritores independentes de provedor; registrar no agente exige uma integração real. */
export const FINANCIAL_CHAT_TOOLS = definitions.map(({ name, description, properties }) => ({
  name,
  description,
  inputSchema: { type: 'object', properties, required: Object.keys(properties), additionalProperties: false },
}));

function fieldError(field, value, schema) {
  if (schema.type === 'number') {
    return typeof value !== 'number' || !Number.isFinite(value) || value < schema.minimum || value > schema.maximum
      ? `Informe um número entre ${schema.minimum} e ${schema.maximum}.` : null;
  }
  if (field === 'period') return typeof value !== 'string' || value.length !== 7 || !new RegExp(periodPattern).test(value)
    ? 'Informe um mês válido no formato YYYY-MM.' : null;
  if (field === 'currency') return value !== 'BRL' ? 'Use a moeda BRL.' : null;
  if (field === 'revenueBasis') return value !== schema.const
    ? `Confirme a base ${schema.const === 'net' ? 'líquida' : 'bruta'} da receita e dos percentuais.` : null;
  if (field === 'segment') return !schema.enum.includes(value) ? 'Selecione um segmento da lista ou other.' : null;
  return null;
}

/**
 * A conversa pode trazer dados em qualquer ordem. Este adaptador não conduz um
 * roteiro: informa o que falta e só chama o motor após a confirmação do cenário.
 * Não aceita nomes, contato, texto livre, resultados anteriores nem defaults.
 *
 * confirmed é uma barreira do contrato, não prova de uma mensagem real: quem
 * orquestra a conversa deve vinculá-lo à confirmação do visitante e removê-lo
 * sempre que houver correção. Não há estado, armazenamento ou efeito externo.
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
  const missingFields = [];
  for (const field of fields) {
    if (field === 'confirmed') continue;
    if (!Object.hasOwn(candidate, field) || candidate[field] === undefined || candidate[field] === null) {
      missingFields.push(field);
      continue;
    }
    const error = fieldError(field, candidate[field], definition.properties[field]);
    if (error) errors[field] = error;
  }
  if (Object.hasOwn(candidate, 'confirmed') && candidate.confirmed != null && typeof candidate.confirmed !== 'boolean') {
    errors.confirmed = 'A confirmação precisa ser true ou false.';
  }
  if (Object.keys(errors).length) return { status: 'invalid_input', errors };
  if (missingFields.length) return { status: 'needs_information', toolName, missingFields };

  const inputs = { tool: definition.calculation };
  for (const field of fields) {
    if (!['period', 'currency', 'confirmed'].includes(field)) inputs[field] = candidate[field];
  }
  const context = { toolName, period: candidate.period, currency: candidate.currency };
  if (!Object.hasOwn(candidate, 'confirmed') || candidate.confirmed !== true) {
    return { status: 'needs_confirmation', ...context, inputs };
  }

  const calculation = calculateFinancialSimulation(inputs);
  if (!calculation.ok) return { status: 'invalid_input', errors: calculation.errors };
  return { status: 'success', ...context, ...calculation };
}
