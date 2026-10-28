export class CmvGuideStorageError extends Error {
  code: string;
  constructor(code: string);
}

export function readCmvGuideMaterials(options: {
  supabaseUrl: string;
  serviceRoleKey: string;
  fetchImpl?: typeof fetch;
  bucket?: "cmv-guide-private";
  timeoutMs?: number;
}): Promise<Array<{ filename: string; content: string }>>;
