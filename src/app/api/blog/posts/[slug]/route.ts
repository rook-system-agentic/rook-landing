import { NextRequest, NextResponse } from "next/server";
import { getPostBySlug } from "@/lib/blog";

export const revalidate = 60;

export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  const post = await getPostBySlug(params.slug);
  if (!post) return NextResponse.json({ error: "Post não encontrado" }, { status: 404 });
  return NextResponse.json({ post });
}
