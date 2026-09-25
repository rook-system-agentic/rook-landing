/**
 * Aceita pt-BR e o ponto decimal dos teclados móveis, sem perder sinais.
 * Um ponto seguido de três dígitos continua sendo separador de milhar pt-BR;
 * decimais com ponto têm uma ou duas casas e não misturam agrupamento.
 */
export function parseBrazilianNumber(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value !== 'string' || value.length > 40) return null;
  const raw = value.trim().replace(/^R\$\s*/, '').replace(/\s*%$/, '');
  if (/^-?\d+\.\d{1,2}$/.test(raw)) return Number(raw);
  if (!/^-?(?:\d+|\d{1,3}(?:\.\d{3})+)(?:,\d{1,2})?$/.test(raw)) return null;
  const parsed = Number(raw.replace(/\./g, '').replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : null;
}

