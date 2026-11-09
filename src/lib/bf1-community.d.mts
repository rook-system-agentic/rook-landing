export declare const BF1_COMMUNITY_URL: string | null;
export declare const BF1_BLACK_FRIDAY_START: string;
export declare const BF1_TRACKING_DESTINATION: string;

export type CommunityLink = { ready: true; href: string } | { ready: false; href: null };
export declare function communityLink(url?: string | null): CommunityLink;

export interface CountdownParts {
  done: boolean;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}
export declare function countdownParts(nowMs: number, targetIso?: string): CountdownParts;
