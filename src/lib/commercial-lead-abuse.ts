import "server-only";

import {
  CommercialLeadAbuseProtectionError,
  createCommercialLeadAbuseProtection,
  type CommercialLeadChallengeAnswer,
  type HeaderReader,
} from "@/lib/commercial-lead-abuse-protection.mjs";
import type { CommercialLead } from "@/lib/commercial-lead-validation.mjs";
import {
  isSupabaseAdminConfigured,
  supabaseAdminRequest,
} from "@/lib/supabase-admin";

function abuseSecret() {
  return process.env.COMMERCIAL_LEAD_ABUSE_SECRET
    || process.env.SUPABASE_SERVICE_ROLE_KEY
    || "";
}

export function isCommercialLeadAbuseProtectionConfigured() {
  return isSupabaseAdminConfigured() && abuseSecret().length >= 32;
}

function protection() {
  return createCommercialLeadAbuseProtection({
    adminRequest: supabaseAdminRequest,
    secret: abuseSecret(),
  });
}

export function issueCommercialLeadChallenge(headers: HeaderReader) {
  return protection().issueChallenge(headers);
}

export function consumeCommercialLeadAbuseGate(
  headers: HeaderReader,
  lead: CommercialLead,
  challenge: CommercialLeadChallengeAnswer | null,
) {
  return protection().consumeAbuseGate(headers, lead, challenge);
}

export { CommercialLeadAbuseProtectionError };
