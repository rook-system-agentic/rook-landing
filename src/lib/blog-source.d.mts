import type { BlogPost } from "./blog-types";

/** Ver `blog-source.mjs` para o porquê de cada estado. */
export type BlogSourceState = "live" | "empty" | "fallback" | "unconfigured";

export type BlogFetchOutcome = "ok" | "failed" | "unconfigured";

export type BlogSourceStatus = {
  source: BlogSourceState;
  degraded: boolean;
  remotePostCount: number;
  localPostCount: number;
  servedPostCount: number;
  /** Motivo curto e sem segredo da falha. `null` quando a origem está sã. */
  reason: string | null;
  checkedAt: string;
};

export type BlogCollection = {
  posts: BlogPost[];
  status: BlogSourceStatus;
};

export type MissingSlugBehavior = "not-found" | "temporarily-unavailable";

export type BlogListState =
  | "has-posts"
  | "category-empty"
  | "catalog-empty"
  | "source-unavailable";

export const BLOG_SOURCE_STATES: BlogSourceState[];

export function isDegradedBlogSource(source: string): boolean;

export function classifyBlogSource(
  outcome: BlogFetchOutcome,
  remoteCount: number,
): BlogSourceState;

export function mergeBlogPosts(
  localPosts: BlogPost[],
  remotePosts: BlogPost[],
): BlogPost[];

export function resolveBlogCollection(input: {
  outcome: BlogFetchOutcome;
  remotePosts?: BlogPost[];
  localPosts?: BlogPost[];
  reason?: string | null;
  checkedAt?: string;
}): BlogCollection;

export function resolveMissingSlugBehavior(
  status: BlogSourceStatus,
): MissingSlugBehavior;

export function resolveBlogListState(input: {
  postCount: number;
  hasCategoryFilter: boolean;
  status: BlogSourceStatus;
}): BlogListState;
