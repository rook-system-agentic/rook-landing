import { NextRequest, NextResponse } from "next/server";
import { getAllPublishedPosts } from "@/lib/blog";

export const revalidate = 60;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Number(searchParams.get("page") || "1"));
  const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") || "10")));
  const category = searchParams.get("category");
  const tag = searchParams.get("tag");
  const allPosts = await getAllPublishedPosts();

  const filtered = allPosts.filter((post) => {
    if (category && post.category.toLowerCase() !== category.toLowerCase()) return false;
    if (tag && !post.tags.some((postTag) => postTag.toLowerCase() === tag.toLowerCase())) return false;
    return true;
  });

  const offset = (page - 1) * limit;
  const posts = filtered.slice(offset, offset + limit);

  return NextResponse.json({
    posts,
    pagination: {
      page,
      limit,
      total: filtered.length,
      totalPages: Math.ceil(filtered.length / limit),
    },
  });
}

