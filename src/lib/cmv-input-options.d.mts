export const CMV_TAX_MODEL_VERSION: 'rook-cmv-tax-2026-09-24';
export type TaxStateCode = 'AC' | 'AL' | 'AP' | 'AM' | 'BA' | 'CE' | 'DF' | 'ES'
  | 'GO' | 'MA' | 'MT' | 'MS' | 'MG' | 'PA' | 'PB' | 'PR' | 'PE' | 'PI'
  | 'RJ' | 'RN' | 'RS' | 'RO' | 'RR' | 'SC' | 'SP' | 'SE' | 'TO';
export const TAX_STATES: readonly Readonly<{ code: TaxStateCode; label: string }>[];

