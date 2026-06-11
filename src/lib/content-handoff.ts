import type { ContentChannel, ContentPack, ContentVariation, PublicationJob } from "@/lib/content-types";
import { supabaseAdminRequest } from "@/lib/supabase-admin";

type HandoffJob = Pick<
  PublicationJob,
  "id" | "status" | "external_url" | "error_message" | "published_at" | "created_at" | "metadata"
>;

export type ContentHandoffItem = {
  channel: ContentChannel;
  channelLabel: string;
  variationId: string;
  title: string;
  status: ContentVariation["status"];
  body: string;
  copyMarkdown: string;
  assetBrief?: string | null;
  assetUrl?: string | null;
  slug?: string | null;
  tags: string[];
  instructions: string[];
  latestJob?: HandoffJob | null;
};

export type ContentHandoff = {
  contentPack: ContentPack;
  generatedAt: string;
  items: ContentHandoffItem[];
};

const channelOrder: ContentChannel[] = ["blog", "linkedin", "instagram_carousel", "instagram_caption", "story", "newsletter"];

const channelLabels: Record<ContentChannel, string> = {
  blog: "Blog",
  linkedin: "LinkedIn",
  instagram_carousel: "Instagram Carrossel",
  instagram_caption: "Instagram Legenda",
  story: "Stories",
  newsletter: "Newsletter",
};

function first<T>(rows: T[] | T | null) {
  if (!rows) return null;
  if (Array.isArray(rows)) return rows[0] || null;
  return rows;
}

function getInstructions(channel: ContentChannel) {
  const instructions: Record<ContentChannel, string[]> = {
    blog: ["Publicado automaticamente quando o job estiver published.", "Validar URL pública, feed.xml e sitemap.xml após publicação."],
    linkedin: [
      "Publicar pelo perfil pessoal ou página indicada no calendário editorial.",
      "Usar a primeira linha como gancho e manter quebras de parágrafo.",
      "Adicionar imagem se assetBrief ou assetUrl estiver preenchido.",
    ],
    instagram_carousel: [
      "Transformar cada bloco em um slide curto, visual e legível.",
      "Usar o assetBrief como orientação para Canva/design.",
      "Publicar com legenda complementar em instagram_caption quando existir.",
    ],
    instagram_caption: [
      "Usar como legenda principal do post ou carrossel.",
      "Manter CTA final e revisar hashtags antes de publicar.",
    ],
    story: ["Usar como roteiro de sequência de stories.", "Adicionar enquete, caixa de pergunta ou CTA quando fizer sentido."],
    newsletter: [
      "Usar como base de envio no Resend ou newsletter manual.",
      "Revisar assunto, preheader e links antes do disparo.",
    ],
  };

  return instructions[channel];
}

function buildCopyMarkdown(variation: ContentVariation) {
  const blocks = [`# ${variation.title}`, variation.body.trim()];

  if (variation.asset_brief) {
    blocks.push(`## Brief de asset\n\n${variation.asset_brief}`);
  }

  if (variation.tags?.length) {
    blocks.push(`## Tags\n\n${variation.tags.map((tag) => `#${tag.replace(/\s+/g, "")}`).join(" ")}`);
  }

  return blocks.filter(Boolean).join("\n\n");
}

async function getContentPack(contentPackId: string) {
  const rows = await supabaseAdminRequest<ContentPack[]>(
    `content_packs?id=eq.${encodeURIComponent(contentPackId)}&select=*`,
  );
  return first(rows);
}

async function getContentVariations(contentPackId: string) {
  return supabaseAdminRequest<ContentVariation[]>(
    `content_variations?content_pack_id=eq.${encodeURIComponent(contentPackId)}&select=*&order=created_at.asc`,
  );
}

async function getPublicationJobs(contentPackId: string) {
  return supabaseAdminRequest<PublicationJob[]>(
    `publication_jobs?content_pack_id=eq.${encodeURIComponent(contentPackId)}&select=*&order=created_at.desc`,
  );
}

function latestJobForVariation(jobs: PublicationJob[], variationId: string) {
  return jobs.find((job) => job.variation_id === variationId) || null;
}

export async function buildContentHandoff(contentPackId: string): Promise<ContentHandoff> {
  const [contentPack, variations, jobs] = await Promise.all([
    getContentPack(contentPackId),
    getContentVariations(contentPackId),
    getPublicationJobs(contentPackId),
  ]);

  if (!contentPack) {
    throw new Error(`Content pack ${contentPackId} não encontrado.`);
  }

  const items = variations
    .slice()
    .sort((a, b) => channelOrder.indexOf(a.channel) - channelOrder.indexOf(b.channel))
    .map((variation) => ({
      channel: variation.channel,
      channelLabel: channelLabels[variation.channel],
      variationId: variation.id,
      title: variation.title,
      status: variation.status,
      body: variation.body,
      copyMarkdown: buildCopyMarkdown(variation),
      assetBrief: variation.asset_brief,
      assetUrl: variation.asset_url,
      slug: variation.slug,
      tags: variation.tags || [],
      instructions: getInstructions(variation.channel),
      latestJob: latestJobForVariation(jobs, variation.id),
    }));

  return {
    contentPack,
    generatedAt: new Date().toISOString(),
    items,
  };
}
