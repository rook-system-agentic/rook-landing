interface Integration {
  name: string;
  category: string;
  logo: string;
  w: number;
  h: number;
  requestId?: string;
}

export declare const INTEGRATIONS: readonly Integration[];
