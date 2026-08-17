import { NextRequest, NextResponse } from "next/server";
import { findPostBySlug } from "@/lib/blog";

export const revalidate = 60;

export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  const { post, status, missingBehavior } = await findPostBySlug(params.slug);

  if (!post) {
    // ROO-1116: 404 diz "esse artigo não existe". Só podemos afirmar isso
    // quando a consulta respondeu. Com a origem caída a resposta honesta é
    // 503 — "não consegui perguntar, tente de novo" —, que nem o leitor nem
    // um crawler leem como "removido". Ver `resolveMissingSlugBehavior`.
    const unavailable = missingBehavior === "temporarily-unavailable";
    return NextResponse.json(
      {
        error: unavailable
          ? "Origem dos artigos indisponível; não é possível confirmar este slug"
          : "Post não encontrado",
        source: status,
      },
      {
        status: unavailable ? 503 : 404,
        headers: {
          "x-rook-blog-source": status.source,
          ...(unavailable ? { "Retry-After": "60" } : {}),
        },
      },
    );
  }

  return NextResponse.json(
    { post, source: status },
    { headers: { "x-rook-blog-source": status.source } },
  );
}
