export interface CelulaDoMapa {
  /** Média de receita do dia×turno, em reais. */
  valor: number;
  /** Variação contra a média das 8 semanas anteriores do mesmo dia×turno. */
  desvio: number;
}

export interface LinhaDoMapa {
  dia: string;
  celulas: readonly CelulaDoMapa[];
}

export interface PrecoMensal {
  mes: string;
  /** Preço médio do quilo, em reais. */
  preco: number;
  /** Quilos comprados no mês. */
  qtd: number;
}

export interface FornecedorDoInsumo {
  nome: string;
  notas: number;
  ultima: string;
  preco: number;
  tendencia: "up" | "down" | "stable";
}

export interface ExtremoDoMapa {
  dia: string;
  turno: string;
  valor: number;
}

export interface ResumoDoInsumo {
  medio: number;
  minimo: number;
  maximo: number;
  variacaoPct: number;
  ultimoDegrauPct: number;
}

export declare const RECEITA_MENSAL: number;
export declare const DIAS_DO_MES: number;
export declare const MELHOR_DIA: number;
export declare const PIOR_DIA: number;
export declare const ALTA_INSUMO_30D_PCT: number;
export declare const TURNOS: readonly string[];
export declare const MAPA_DE_CALOR: readonly LinhaDoMapa[];
export declare const PRECO_INSUMO: readonly PrecoMensal[];
export declare const FORNECEDORES_INSUMO: readonly FornecedorDoInsumo[];

export declare function totalDoDia(linha: LinhaDoMapa): number;
export declare function totalDaSemana(): number;
export declare function extremosDoMapa(): { melhor: ExtremoDoMapa; menor: ExtremoDoMapa };
export declare function resumoDoInsumo(): ResumoDoInsumo;
export declare function variacoesMensais(): readonly (number | null)[];

export interface TransacaoDoExtrato {
  data: string;
  descricao: string;
  valor: number;
  tipo: "credito" | "debito";
  conta: string | null;
  metodo: "auto" | "manual" | "pendente";
}

export declare const CLASSIFICACAO_PCT: number;
export declare const TXNS_CREDITO: number;
export declare const TXNS_DEBITO: number;
export declare const EXTRATO_TXNS: readonly TransacaoDoExtrato[];
export declare function resumoDaClassificacao(): {
  total: number;
  classificadas: number;
  pendentes: number;
  pct: number;
};
