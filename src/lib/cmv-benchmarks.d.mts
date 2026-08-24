export interface SegmentoCmv {
  /** Nome exibido ao usuário. */
  name: string;
  /** Identificador estável — usado no seletor e nas âncoras. */
  slug: string;
  /** CMV de referência do segmento, em % da receita. */
  defaultCmvTarget: number;
  /** Piso da faixa saudável, em %. */
  cmvMin: number;
  /** Teto da faixa saudável, em %. */
  cmvMax: number;
}

export declare const segmentsData: readonly SegmentoCmv[];

export declare const BENCHMARK_FONTE: string;

export declare function segmentoPorSlug(slug: string): SegmentoCmv | undefined;

export declare function pctBr(pct: number): string;
