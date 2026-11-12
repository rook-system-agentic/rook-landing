import type { CampaignPhase } from "./bf1-community.mjs";
export interface Bf1OfferPresentation {
  phase: CampaignPhase;
  checkoutHref: string | null;
  offer: { title: string; summary: string; period: string; terms: string; payment: string } | null;
}
export declare function buildBf1OfferPresentation(nowMs: number): Bf1OfferPresentation;
