export interface SistemaOpcao {
  valor: string;
  rotulo: string;
}

export declare const SISTEMAS: readonly SistemaOpcao[];

export interface SolicitacaoIntegracao {
  nome: string;
  email: string;
  telefone: string;
  sistema: string;
  sistemaNome: string;
}

export type ResultadoValidacao =
  | { ok: true; honeypot: true; value: null }
  | { ok: true; honeypot?: false; value: SolicitacaoIntegracao }
  | { ok: false; errors: Record<string, string> };

export declare function validarSolicitacaoIntegracao(candidato: unknown): ResultadoValidacao;
