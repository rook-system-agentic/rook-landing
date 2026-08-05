import "server-only";

import type { CommercialLead } from "@/lib/commercial-lead-validation.mjs";
import { createCommercialLeadPersistence } from "@/lib/commercial-lead-store.mjs";
import { supabaseAdminRequest } from "@/lib/supabase-admin";

const persistence = createCommercialLeadPersistence(supabaseAdminRequest);

export function createOrUpdateCommercialLead(lead: CommercialLead) {
  return persistence.createOrUpdateCommercialLead(lead);
}
