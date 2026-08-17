import type { Metadata } from "next";
import Link from "next/link";
import NewsletterForm from "@/components/NewsletterForm";
import BlogCard from "@/components/blog/BlogCard";
import { resolveBlogListState } from "@/lib/blog-source.mjs";
import { getBlogCategories, getBlogSourceStatus, getPublishedPosts } from "@/lib/blog";
import { siteUrl } from "@/lib/site-origin";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Blog Rook | Inteligência financeira para restaurantes",
  description:
    "Artigos sobre CMV, DRE, compras, impostos e gestão financeira para restaurantes. Conteúdo editorial para transformar faturamento em lucro.",
  alternates: {
    canonical: siteUrl("/blog/"),
    types: {
      "application/rss+xml": siteUrl("/feed.xml"),
    },
  },
};

/**
 * Os três jeitos de a lista estar vazia. Eles são diferentes para quem lê:
 * um pede outro filtro, o outro pede paciência, o terceiro só avisa que ainda
 * não há conteúdo. Nenhum deles pode dizer "não há artigo" quando a verdade é
 * "não conseguimos carregar os artigos" (ROO-1116).
 */
function EmptyState({ state }: { state: "category-empty" | "catalog-empty" | "source-unavailable" }) {
  if (state === "source-unavailable") {
    return (
      <div className="card p-8 text-center">
        <h2 className="text-2xl font-bold text-cream mb-3">Não conseguimos carregar os artigos agora.</h2>
        <p className="text-muted mb-6">
          O problema é do nosso lado e costuma durar poucos minutos. Tente atualizar a página — ou
          assine a newsletter para receber os próximos artigos direto no e-mail.
        </p>
        <Link href="/blog/" className="btn-ghost">
          Tentar de novo
        </Link>
      </div>
    );
  }

  if (state === "category-empty") {
    return (
      <div className="card p-8 text-center">
        <h2 className="text-2xl font-bold text-cream mb-3">Nenhum artigo publicado nesta categoria.</h2>
        <p className="text-muted mb-6">Volte para todos os artigos ou assine a newsletter para receber os próximos.</p>
        <Link href="/blog/" className="btn-ghost">
          Ver todos
        </Link>
      </div>
    );
  }

  return (
    <div className="card p-8 text-center">
      <h2 className="text-2xl font-bold text-cream mb-3">Ainda não publicamos nenhum artigo.</h2>
      <p className="text-muted mb-6">
        O primeiro conteúdo sobre CMV, DRE, compras e margem sai em breve. Assine a newsletter para
        ser avisado quando chegar.
      </p>
      <Link href="/" className="btn-ghost">
        Voltar ao início
      </Link>
    </div>
  );
}

type BlogPageProps = {
  searchParams?: {
    category?: string;
  };
};

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const selectedCategory = searchParams?.category;
  const [posts, categories, sourceStatus] = await Promise.all([
    getPublishedPosts({ category: selectedCategory }),
    getBlogCategories(),
    getBlogSourceStatus(),
  ]);
  const [featuredPost, ...otherPosts] = posts;

  // ROO-1116 — a lista vazia tinha uma explicação só, e ela era falsa em dois
  // dos três casos: dizia "nesta categoria" mesmo sem filtro, e dizia
  // "nenhum artigo publicado" quando na verdade não tínhamos conseguido
  // perguntar. Regra e justificativa em `resolveBlogListState`.
  const listState = resolveBlogListState({
    postCount: posts.length,
    hasCategoryFilter: Boolean(selectedCategory),
    status: sourceStatus,
  });

  return (
    <>
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <p className="section-label mb-4">— Blog Rook</p>
          <div className="max-w-3xl">
            <h1 className="text-3xl lg:text-[2.8rem] font-bold leading-tight mb-5">
              Inteligência financeira para quem quer{" "}
              <em className="not-italic text-terracota">lucrar de verdade.</em>
            </h1>
            <p className="text-muted leading-relaxed">
              Guias, métodos e análises para donos de restaurante que querem entender CMV, DRE, compras,
              impostos e margem com clareza. Menos achismo, mais decisão em reais.
            </p>
          </div>
        </div>
      </section>

      <section className="border-t border-border py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap gap-3">
          <Link
            href="/blog/"
            className={`rounded-full border px-4 py-2 text-sm transition-colors ${
              !selectedCategory ? "border-terracota bg-terracota text-white" : "border-border text-muted hover:text-cream"
            }`}
          >
            Todos
          </Link>
          {categories.map((category) => (
            <Link
              key={category}
              href={`/blog/?category=${encodeURIComponent(category)}`}
              className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                selectedCategory === category
                  ? "border-terracota bg-terracota text-white"
                  : "border-border text-muted hover:text-cream"
              }`}
            >
              {category}
            </Link>
          ))}
        </div>
      </section>

      <section className="py-16 border-t border-border">
        <div className="max-w-7xl mx-auto px-6">
          {listState === "has-posts" ? (
            <div className="grid lg:grid-cols-2 gap-5">
              {featuredPost && <BlogCard post={featuredPost} featured />}
              <div className="card p-6 flex flex-col justify-between">
                <div>
                  <p className="section-label mb-4">— Pulse do food service</p>
                  <h2 className="text-2xl font-bold mb-3">Receba os próximos artigos.</h2>
                  <p className="text-sm text-muted leading-relaxed mb-6">
                    Uma curadoria direta sobre CMV, DRE, compras e gestão financeira para restaurantes.
                    Sem spam, sem conteúdo genérico.
                  </p>
                </div>
                <NewsletterForm />
              </div>
              {otherPosts.map((post) => (
                <BlogCard key={post.slug} post={post} />
              ))}
            </div>
          ) : (
            <EmptyState state={listState} />
          )}
        </div>
      </section>
    </>
  );
}
