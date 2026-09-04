"use client";

import { LP_EXPERIMENT_ID, lerVarianteDoCookie, type LpVariant } from "./lp-experiment.mjs";

/**
 * Lado do navegador do experimento (ROO-1207): lê a variante do cookie que o
 * middleware gravou e devolve as dimensões prontas para `track()`.
 *
 * Sem cookie o experimento está desligado para este visitante, e as funções
 * devolvem `{}`/null: nenhum evento ganha `experiment_id`, e o relatório do
 * GA4 não recebe uma "variante" de quem não estava no experimento.
 */
export function currentLpVariant(): LpVariant | null {
  if (typeof document === "undefined") return null;
  try {
    return lerVarianteDoCookie(document.cookie);
  } catch {
    return null;
  }
}

export function lpExperimentDims(): Record<string, string> {
  const variant = currentLpVariant();
  return variant ? { experiment_id: LP_EXPERIMENT_ID, variant } : {};
}

const EXPOSURE_KEY = `${LP_EXPERIMENT_ID}:exposed`;

/**
 * Verdadeiro na PRIMEIRA chamada da sessão do navegador; falso nas seguintes.
 * Reload e navegação client-side não contam a exposição de novo.
 * `sessionStorage` pode lançar (Safari com cookies bloqueados, webview): aí a
 * exposição é contada a cada carregamento — melhor contar a mais do que
 * derrubar a página.
 */
export function marcarExposicao(): boolean {
  try {
    if (sessionStorage.getItem(EXPOSURE_KEY)) return false;
    sessionStorage.setItem(EXPOSURE_KEY, "1");
    return true;
  } catch {
    return true;
  }
}
