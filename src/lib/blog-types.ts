export type BlogStatus = "draft" | "review" | "scheduled" | "published" | "archived";

export type BlogDataSource = {
  title: string;
  type: "internal" | "public" | "methodology" | "example";
  url?: string;
  note?: string;
};

export type BlogFaq = {
  question: string;
  answer: string;
};

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  subtitle?: string | null;
  excerpt: string;
  directAnswer?: string | null;
  contentMarkdown: string;
  coverImageUrl?: string | null;
  coverImageAlt?: string | null;
  authorId?: string | null;
  authorName: string;
  authorRole?: string | null;
  category: string;
  tags: string[];
  status: BlogStatus;
  primaryKeyword?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  canonicalUrl?: string | null;
  schemaFaq?: BlogFaq[];
  dataSources?: BlogDataSource[];
  methodologyNote?: string | null;
  readingTimeMin: number;
  publishedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type BlogListOptions = {
  category?: string;
  tag?: string;
  limit?: number;
  offset?: number;
};

