const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

type SupabaseAdminOptions = RequestInit & {
  allowEmpty?: boolean;
};

export function isSupabaseAdminConfigured() {
  return Boolean(supabaseUrl && serviceRoleKey);
}

export function assertSupabaseAdminConfigured() {
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Supabase admin is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
  }
}

export async function supabaseAdminRequest<T>(pathWithQuery: string, options: SupabaseAdminOptions = {}) {
  assertSupabaseAdminConfigured();

  const endpoint = new URL(`${supabaseUrl!.replace(/\/$/, "")}/rest/v1/${pathWithQuery.replace(/^\//, "")}`);
  const headers = new Headers(options.headers);
  headers.set("apikey", serviceRoleKey!);
  headers.set("Authorization", `Bearer ${serviceRoleKey}`);

  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(endpoint.toString(), {
    ...options,
    headers,
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`[supabase-admin] ${response.status} ${response.statusText}: ${body}`);
  }

  if (response.status === 204 || options.allowEmpty) {
    return null as T;
  }

  return (await response.json()) as T;
}
