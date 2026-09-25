/** Referências internas de CMV. Importar somente no servidor.
 * Os nomes e slugs públicos ficam em culinary-segments para que seletores
 * não levem os parâmetros de comparação ao navegador.
 */
import { culinarySegments } from './culinary-segments.mjs';

/**
 * @typedef {object} SegmentoCmv
 * @property {string} name Nome exibido ao usuário.
 * @property {string} slug Identificador estável — usado no seletor e nas âncoras.
 * @property {number} defaultCmvTarget CMV de referência do segmento, em % da receita.
 * @property {number} cmvMin Piso da faixa saudável, em %.
 * @property {number} cmvMax Teto da faixa saudável, em %.
 */

const benchmarkBySlug = {
  "a_la_carte": { defaultCmvTarget: 32.0, cmvMin: 30.9, cmvMax: 33.1 },
  "fine_dining": { defaultCmvTarget: 27.5, cmvMin: 26.5, cmvMax: 28.5 },
  "italiana": { defaultCmvTarget: 33.0, cmvMin: 31.8, cmvMax: 34.2 },
  "japonesa_sushi": { defaultCmvTarget: 35.8, cmvMin: 34.5, cmvMax: 37.1 },
  "self_service_kilo": { defaultCmvTarget: 36.6, cmvMin: 35.3, cmvMax: 37.9 },
  "pizzaria": { defaultCmvTarget: 28.4, cmvMin: 27.4, cmvMax: 29.4 },
  "hamburgueria": { defaultCmvTarget: 31.7, cmvMin: 30.5, cmvMax: 32.8 },
  "fast_food": { defaultCmvTarget: 30.8, cmvMin: 29.6, cmvMax: 31.9 },
  "bar_boteco": { defaultCmvTarget: 25.0, cmvMin: 24.1, cmvMax: 25.9 },
  "padaria_cafeteria": { defaultCmvTarget: 34.8, cmvMin: 33.6, cmvMax: 36.1 },
  "delivery_especializado": { defaultCmvTarget: 30.3, cmvMin: 29.2, cmvMax: 31.4 },
};

/** @type {readonly SegmentoCmv[]} */
export const segmentsData = culinarySegments.map(segment => ({
  ...segment, ...benchmarkBySlug[segment.slug],
}));

/** Rótulo da fonte, exibido junto de qualquer número desta tabela. */
export const BENCHMARK_FONTE = "Benchmark Rook 2026";

/**
 * Busca um segmento pelo slug.
 *
 * Devolve `undefined` em vez de cair no primeiro item da lista: quem chama
 * decide o que fazer com o desconhecido, e um slug errado precisa aparecer como
 * erro, não como "à la carte" silencioso.
 *
 * @param {string} slug
 * @returns {SegmentoCmv | undefined}
 */
export function segmentoPorSlug(slug) {
  return segmentsData.find((s) => s.slug === slug);
}

/**
 * Formata um percentual no padrão brasileiro, com uma casa: `32,0%`.
 *
 * @param {number} pct
 * @returns {string}
 */
export function pctBr(pct) {
  return `${pct.toFixed(1).replace(".", ",")}%`;
}
