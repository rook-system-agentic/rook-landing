export const CMV_TAX_MODEL_VERSION: 'rook-cmv-tax-2026-09-24';
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

export type TaxStateCode = 'AC' | 'AL' | 'AP' | 'AM' | 'BA' | 'CE' | 'DF' | 'ES'
  | 'GO' | 'MA' | 'MT' | 'MS' | 'MG' | 'PA' | 'PB' | 'PR' | 'PE' | 'PI'
  | 'RJ' | 'RN' | 'RS' | 'RO' | 'RR' | 'SC' | 'SP' | 'SE' | 'TO';
export const TAX_STATES: readonly Readonly<{ code: TaxStateCode; label: string }>[];

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
