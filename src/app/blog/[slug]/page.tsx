import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ArticleMeta from "@/components/blog/ArticleMeta";
import BlogCard from "@/components/blog/BlogCard";
import DataSources from "@/components/blog/DataSources";
import FaqSection from "@/components/blog/FaqSection";
import MarkdownContent from "@/components/blog/MarkdownContent";
import {
  getAllPublishedPosts,
  getPostBySlug,
  getRelatedPosts,
  markdownToPlainText,
  postUrl,
  siteUrl,
} from "@/lib/blog";

export const revalidate = 60;

type ArticlePageProps = {
  params: {
    slug: string;
  };
};

export async function generateStaticParams() {
  const posts = await getAllPublishedPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const post = await getPostBySlug(params.slug);
  if (!post) return {};

  const canonical = post.canonicalUrl || postUrl(post);
  const title = post.seoTitle || post.title;
  const description = post.seoDescription || post.excerpt;
  const image = post.coverImageUrl?.startsWith("http") ? post.coverImageUrl : `${siteUrl}${post.coverImageUrl || "/og-image-default.png"}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      type: "article",
      url: canonical,
      publishedTime: post.publishedAt || undefined,
      modifiedTime: post.updatedAt || undefined,
      authors: [post.authorName],
      images: [{ url: image, alt: post.coverImageAlt || post.title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

function jsonLd(post: Awaited<ReturnType<typeof getPostBySlug>>) {
  if (!post) return [];
  const url = post.canonicalUrl || postUrl(post);
  const image = post.coverImageUrl?.startsWith("http") ? post.coverImageUrl : `${siteUrl}${post.coverImageUrl || "/og-image-default.png"}`;

  const article = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.seoDescription || post.excerpt,
    image,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt || post.publishedAt,
    author: {
      "@type": "Person",
      name: post.authorName,
      jobTitle: post.authorRole || undefined,
    },
    publisher: {
      "@type": "Organization",
      name: "Rook System",
      url: siteUrl,
      logo: {
        "@type": "ImageObject",
        // A versão `-light` é a colorida, e é a que serve para dado
        // estruturado: `rook-logo-horizontal.png` passou a ser o logo BRANCO,
        // usado só no tema escuro. Antes os dois arquivos eram idênticos e
        // isso não fazia diferença; agora faria, e o Google receberia um logo
        // invisível. O layout.tsx já apontava para o `-light`.
        url: `${siteUrl}/brand/rook-logo-horizontal-light.png`,
      },
    },
    mainEntityOfPage: url,
    articleSection: post.category,
    keywords: post.tags.join(", "),
    wordCount: markdownToPlainText(post.contentMarkdown).split(/\s+/).filter(Boolean).length,
  };

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Início", item: `${siteUrl}/` },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${siteUrl}/blog/` },
      { "@type": "ListItem", position: 3, name: post.title, item: url },
    ],
  };

  const faq =
    post.schemaFaq && post.schemaFaq.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: post.schemaFaq.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: item.answer,
            },
          })),
        }
      : null;

  return [article, breadcrumb, faq].filter(Boolean);
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const post = await getPostBySlug(params.slug);
  if (!post) notFound();

  const relatedPosts = await getRelatedPosts(post);
  const jsonLdItems = jsonLd(post);

  return (
    <>
      {jsonLdItems.map((item, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item).replace(/</g, "\\u003c") }}
        />
      ))}

      <article className="py-20">
        <div className="max-w-3xl mx-auto px-6">
          <Link href="/blog/" className="text-sm text-terracota hover:text-ocre">
            ← Voltar ao blog
          </Link>

          <div className="mt-8">
            <p className="section-label mb-4">— {post.category}</p>
            <h1 className="text-3xl lg:text-5xl font-bold leading-tight text-cream mb-5">{post.title}</h1>
            {post.subtitle && <p className="text-lg text-ocre/90 leading-relaxed mb-5">{post.subtitle}</p>}
            <ArticleMeta post={post} />
          </div>

          {post.coverImageUrl && (
            <figure className="mt-10 overflow-hidden rounded-2xl border border-border bg-white/[0.03]">
              {/* A capa é o maior elemento da primeira tela do artigo, então é
                  ela que define o LCP. `fetchPriority="high"` tira a imagem da
                  fila de prioridade baixa em que o navegador põe imagem por
                  padrão. O espaço já é reservado pelo `aspect-[3/2]`, então
                  isso não desloca nada (ROO-1124). */}
              <img
                src={post.coverImageUrl}
                alt={post.coverImageAlt || post.title}
                className="aspect-[3/2] w-full object-cover"
                fetchPriority="high"
                decoding="async"
              />
            </figure>
          )}

          {post.directAnswer && (
            <div className="my-10 rounded-2xl border border-terracota/30 bg-terracota/10 p-6">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-ocre mb-3">Resposta direta</p>
              <p className="text-lg leading-relaxed text-cream">{post.directAnswer}</p>
            </div>
          )}

          <MarkdownContent content={post.contentMarkdown} />
          <DataSources sources={post.dataSources} methodologyNote={post.methodologyNote} />
          <FaqSection faqs={post.schemaFaq || []} />

          <section className="mt-14 rounded-2xl border border-border bg-white/[0.03] p-6">
            <p className="section-label mb-3">— Próximo passo</p>
            <h2 className="text-2xl font-bold text-cream mb-3">Quer enxergar estes números no seu restaurante?</h2>
            <p className="text-sm text-muted leading-relaxed mb-5">
              Teste o Rook por 7 dias e transforme faturamento, compras e margem em uma leitura mais clara.
            </p>
            <Link href="/planos/" className="btn-primary">
              Ver planos e testar
            </Link>
          </section>
        </div>
      </article>

      {relatedPosts.length > 0 && (
        <section className="border-t border-border py-16">
          <div className="max-w-7xl mx-auto px-6">
            <p className="section-label mb-8">— Artigos relacionados</p>
            <div className="grid md:grid-cols-3 gap-5">
              {relatedPosts.map((relatedPost) => (
                <BlogCard key={relatedPost.slug} post={relatedPost} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
