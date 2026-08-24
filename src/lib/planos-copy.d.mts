export interface CopyDePlano {
  /** Frase de uma linha, exibida sob o nome do plano. */
  descricao: string;
  /** Bullets do cartão. */
  features: readonly string[];
}

export declare const LIMIAR_KNIGHT_CENTAVOS_ESPERADO: number;

export declare const PLANOS_COPY: Readonly<Record<string, CopyDePlano>>;

export declare function copyDoPlano(productCode: string): CopyDePlano | undefined;

export interface PlanoExibido {
  productCode: string;
  displayName: string;
  formattedPrice: string;
  descricao: string;
  features: readonly string[];
}

export declare function planoParaExibicao(plano: {
  productCode: string;
  displayName: string;
  formattedPrice: string;
  description: string;
  publicFeatures: readonly string[];
}): PlanoExibido;
