export type DiagnosticoValidado =
  | { ok: true; registro: Record<string, unknown> }
  | { ok: false; erros: string[] };

export declare function validarDiagnostico(corpo: unknown): DiagnosticoValidado;
