export declare const BF1_ACCESS_HOMOLOG_DATABASE_HOSTS: readonly string[];
export declare const BF1_ACCESS_PRODUCTION_DATABASE_HOSTS: readonly string[];
export interface Bf1AccessConfig {
  environment: "homolog" | "production" | null;
  ready: boolean;
  source: "dedicated" | "cmv_guide";
  recordKind: "test" | "live";
  databaseUrl: string | null;
  serviceRoleKey: string | null;
  abuseSecret: string | null;
  errors: readonly string[];
}
export declare function readBf1AccessConfig(env?: Record<string, string | undefined>): Bf1AccessConfig;
