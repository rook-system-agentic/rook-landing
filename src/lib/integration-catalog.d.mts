export interface Integration {
  name: string;
  detail: string;
  logo?: string;
  w?: number;
  h?: number;
}

export declare const AVAILABLE_INTEGRATIONS: readonly Integration[];
export declare const UPCOMING_INTEGRATIONS: readonly (Integration & { id: string })[];
