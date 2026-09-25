import { parseBrazilianNumber } from './financial-number.mjs';

/** Colagem usa o mesmo contrato do cálculo, inclusive ponto decimal móvel. */
export function formatPastedFinancialNumber(text) {
  const value = parseBrazilianNumber(text);
  if (value === null) return null;
  return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
