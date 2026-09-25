import { CMV_TAX_MODEL_VERSION } from './cmv-input-options.mjs';
import type { TaxStateCode } from './cmv-input-options.mjs';
export { CMV_TAX_MODEL_VERSION, TAX_STATES } from './cmv-input-options.mjs';
export type { TaxStateCode } from './cmv-input-options.mjs';
export const CMV_TAX_MODEL_SOURCE: Readonly<{
  repository: string;
  path: string;
  commit: string;
  sourceSha256: string;
  calculatorVersion: string;
  parameterVersion: string;
  parameterEffectiveDate: string;
  snapshotDate: string;
}>;

export interface CmvRevenueEstimate {
  grossRevenue: number;
  taxAmount: number;
  netRevenue: number;
  taxPercent: number;
  regime: 'simples_nacional' | 'lucro_presumido';
  regimeLabel: string;
  state: TaxStateCode;
  /** Hipótese mensal × 12; não representa histórico fiscal observado. */
  annualRevenue: number;
  sublimitApplied: boolean;
  taxModelVersion: typeof CMV_TAX_MODEL_VERSION;
  assumptions: string[];
}

/** Lança RangeError para faturamento ou UF inválidos. */
export function estimateCmvRevenue(grossRevenue: number, state?: string): CmvRevenueEstimate;
