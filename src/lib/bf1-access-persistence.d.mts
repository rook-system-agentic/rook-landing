import type { Bf1AccessRequest } from "./bf1-access-validation.mjs";

export declare const BF1_ACCESS_RPC: "register_bf1_community_access_v1";
export declare const BF1_ACCESS_RPC_PARAMS: readonly string[];
export declare class Bf1AccessPersistenceError extends Error {
  code: string;
  constructor(code: string);
}
export interface Bf1AccessReceipt {
  result: "created" | "existing";
  requestId: string;
  attributionRecorded: boolean;
}
export declare function createBf1AccessPersistence(options: {
  adminRequest: (path: string, init?: RequestInit) => Promise<unknown>;
}): { register(request: Bf1AccessRequest, recordKind: "test" | "live"): Promise<Bf1AccessReceipt> };
