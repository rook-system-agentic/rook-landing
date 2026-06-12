"use client";

import { useEffect, useMemo, useState } from "react";
import type { ContentChannel, ContentPack, ContentPillar, ContentVariation, ContentVariationStatus, PublicationJob } from "@/lib/content-types";
import type { ContentHandoff } from "@/lib/content-handoff";
import type { ContentStudioPack } from "@/lib/content-studio";

type StudioResponse = {
  success?: boolean;
  error?: string;
  packs?: ContentStudioPack[];
  pack?: ContentStudioPack | ContentPack | null;
  handoff?: ContentHandoff;
  publication?: {
    contentPackId: string;
    results: Array<{
      channel: ContentChannel;
      variationId: string;
      status: string;
      externalUrl?: string;
      errorMessage?: string;
    }>;
  };
};

type PackDraft = {
  pillar: ContentPillar;
  topic: string;
  angle: string;
  notes: string;
};

type VariationDraft = {
  channel: ContentChannel;
  title: string;
  body: string;
  asset_brief: string;
  slug: string;
  category: string;
  tags: string;
  status: ContentVariationStatus;
};

const secretStorageKey = "rook.contentStudio.secret";

const pillars: Array<{ value: ContentPillar; label: string }> = [
  { value: "vendas", label: "Vendas" },
  { value: "compras", label: "Compras" },
  { value: "impostos", label: "Impostos" },
  { value: "despesas", label: "Despesas" },
  { value: "endividamento", label: "Endividamento" },
  { value: "resultado", label: "Resultado" },
  { value: "produto", label: "Produto" },
  { value: "marca", label: "Marca" },
  { value: "outro", label: "Outro" },
];

const channels: Array<{ value: ContentChannel; label: string }> = [
  { value: "blog", label: "Blog" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "instagram_carousel", label: "Instagram Carrossel" },
  { value: "instagram_caption", label: "Instagram Legenda" },
  { value: "story", label: "Stories" },
  { value: "newsletter", label: "Newsletter" },
];

const statusStyles: Record<string, string> = {
  idea: "border-white/10 text-muted",
  briefed: "border-ocre/40 text-ocre",
  drafted: "border-sky-300/40 text-sky-200",
  review: "border-fuchsia-300/40 text-fuchsia-200",
  approved: "border-floresta/60 text-emerald-200",
  scheduled: "border-blue-300/50 text-blue-200",
  published: "border-emerald-300/60 text-emerald-100",
  failed: "border-red-300/60 text-red-200",
  manual_required: "border-amber-300/60 text-amber-100",
  archived: "border-white/10 text-muted",
};

const emptyPackDraft: PackDraft = {
  pillar: "vendas",
  topic: "",
  angle: "",
  notes: "",
};

const emptyVariationDraft: VariationDraft = {
  channel: "blog",
  title: "",
  body: "",
  asset_brief: "",
  slug: "",
  category: "",
  tags: "",
  status: "draft",
};

function splitTags(value: string) {
  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function formatDate(value?: string | null) {
  if (!value) return "sem data";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function statusClass(status?: string | null) {
  return statusStyles[status || ""] || "border-white/10 text-muted";
}

function channelLabel(channel: ContentChannel) {
  return channels.find((entry) => entry.value === channel)?.label || channel;
}

export default function ContentStudioApp() {
  const [secret, setSecret] = useState("");
  const [packs, setPacks] = useState<ContentStudioPack[]>([]);
  const [selectedPackId, setSelectedPackId] = useState<string | null>(null);
  const [handoff, setHandoff] = useState<ContentHandoff | null>(null);
  const [packDraft, setPackDraft] = useState<PackDraft>(emptyPackDraft);
  const [variationDraft, setVariationDraft] = useState<VariationDraft>(emptyVariationDraft);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");

  const selectedPack = useMemo(
    () => packs.find((pack) => pack.id === selectedPackId) || packs[0] || null,
    [packs, selectedPackId],
  );

  useEffect(() => {
    const stored = window.localStorage.getItem(secretStorageKey);
    if (stored) setSecret(stored);
  }, []);

  useEffect(() => {
    if (!secret) return;
    window.localStorage.setItem(secretStorageKey, secret);
  }, [secret]);

  async function api(path: string, init: RequestInit = {}) {
    const response = await fetch(path, {
      ...init,
      headers: {
        Authorization: `Bearer ${secret}`,
        "Content-Type": "application/json",
        ...(init.headers || {}),
      },
    });

    const data = (await response.json()) as StudioResponse;
    if (!response.ok) {
      throw new Error(data.error || `Falha ${response.status}`);
    }
    return data;
  }

  async function run(label: string, task: () => Promise<void>) {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await task();
      setMessage(label);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado");
    } finally {
      setBusy(false);
    }
  }

  async function loadPacks() {
    await run("Packs atualizados.", async () => {
      const data = await api("/api/content/studio?limit=40");
      const nextPacks = data.packs || [];
      setPacks(nextPacks);
      setSelectedPackId((current) => current || nextPacks[0]?.id || null);
    });
  }

  async function createPack() {
    if (!packDraft.topic.trim()) {
      setError("Informe o tema do pacote.");
      return;
    }

    await run("Pacote criado.", async () => {
      const data = await api("/api/content/studio", {
        method: "POST",
        body: JSON.stringify({
          action: "createPack",
          pack: {
            pillar: packDraft.pillar,
            topic: packDraft.topic,
            angle: packDraft.angle || null,
            notes: packDraft.notes || null,
            status: "briefed",
            source_issue: "ROO-117",
          },
        }),
      });

      setPackDraft(emptyPackDraft);
      await refreshAfterMutation((data.pack as ContentPack | null)?.id);
    });
  }

  async function createVariation() {
    if (!selectedPack) return;
    if (!variationDraft.title.trim() || !variationDraft.body.trim()) {
      setError("Informe título e texto da variação.");
      return;
    }

    await run("Variação adicionada.", async () => {
      await api("/api/content/studio", {
        method: "POST",
        body: JSON.stringify({
          action: "createVariation",
          variation: {
            content_pack_id: selectedPack.id,
            channel: variationDraft.channel,
            title: variationDraft.title,
            body: variationDraft.body,
            asset_brief: variationDraft.asset_brief || null,
            slug: variationDraft.slug || null,
            category: variationDraft.category || null,
            tags: splitTags(variationDraft.tags),
            status: variationDraft.status,
          },
        }),
      });
      setVariationDraft(emptyVariationDraft);
      await refreshAfterMutation(selectedPack.id);
    });
  }

  async function refreshAfterMutation(contentPackId?: string | null) {
    const data = await api("/api/content/studio?limit=40");
    const nextPacks = data.packs || [];
    setPacks(nextPacks);
    if (contentPackId) setSelectedPackId(contentPackId);
  }

  async function updatePackStatus(status: ContentPack["status"]) {
    if (!selectedPack) return;

    await run(`Pacote marcado como ${status}.`, async () => {
      await api("/api/content/studio", {
        method: "POST",
        body: JSON.stringify({
          action: "updatePack",
          contentPackId: selectedPack.id,
          packPatch: { status, approved_by: "Content Studio" },
        }),
      });
      await refreshAfterMutation(selectedPack.id);
    });
  }

  async function approvePackAndVariations() {
    if (!selectedPack) return;

    await run("Pacote e variações aprovados.", async () => {
      await Promise.all(
        selectedPack.variations
          .filter((variation) => !["published", "manual_required"].includes(variation.status))
          .map((variation) =>
            api("/api/content/studio", {
              method: "POST",
              body: JSON.stringify({
                action: "updateVariation",
                variationId: variation.id,
                variationPatch: { status: "approved" },
              }),
            }),
          ),
      );

      await api("/api/content/studio", {
        method: "POST",
        body: JSON.stringify({
          action: "updatePack",
          contentPackId: selectedPack.id,
          packPatch: { status: "approved", approved_by: "Content Studio" },
        }),
      });
      await refreshAfterMutation(selectedPack.id);
    });
  }

  async function publishSelectedPack() {
    if (!selectedPack) return;

    await run("Publicação executada.", async () => {
      const data = await api("/api/content/publish/", {
        method: "POST",
        body: JSON.stringify({ contentPackId: selectedPack.id, actor: "Content Studio" }),
      });
      setMessage(`Publicação executada: ${data.publication?.results.map((result) => `${result.channel}:${result.status}`).join(" | ")}`);
      await refreshAfterMutation(selectedPack.id);
    });
  }

  async function loadHandoff() {
    if (!selectedPack) return;

    await run("Handoff carregado.", async () => {
      const data = await api("/api/content/handoff/", {
        method: "POST",
        body: JSON.stringify({ contentPackId: selectedPack.id }),
      });
      setHandoff(data.handoff || null);
    });
  }

  async function updateVariationStatus(variation: ContentVariation, status: ContentVariationStatus) {
    await run(`Variação marcada como ${status}.`, async () => {
      await api("/api/content/studio", {
        method: "POST",
        body: JSON.stringify({
          action: "updateVariation",
          variationId: variation.id,
          variationPatch: { status },
        }),
      });
      await refreshAfterMutation(variation.content_pack_id);
    });
  }

  async function copyText(id: string, value: string) {
    await navigator.clipboard.writeText(value);
    setCopied(id);
    window.setTimeout(() => setCopied(""), 1600);
  }

  return (
    <section className="min-h-screen border-t border-border bg-[#0d0e0a]">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:py-8">
        <div className="mb-6 grid gap-4 border-b border-white/10 pb-5 lg:grid-cols-[1fr_420px]">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-ocre">Content Studio</p>
            <h1 className="mt-2 text-2xl font-bold leading-tight text-cream lg:text-4xl">
              Operação editorial Rook
            </h1>
          </div>

          <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
            <input
              type="password"
              value={secret}
              onChange={(event) => setSecret(event.target.value)}
              placeholder="CONTENT_AUTOMATION_SECRET"
              className="h-11 rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-cream outline-none transition focus:border-ocre/70"
            />
            <button
              type="button"
              onClick={loadPacks}
              disabled={!secret || busy}
              className="h-11 rounded-lg bg-terracota px-4 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Atualizar
            </button>
          </div>
        </div>

        {(message || error) && (
          <div
            className={`mb-5 rounded-lg border px-4 py-3 text-sm ${
              error ? "border-red-300/30 bg-red-950/30 text-red-100" : "border-emerald-300/30 bg-emerald-950/25 text-emerald-100"
            }`}
          >
            {error || message}
          </div>
        )}

        <div className="grid gap-5 xl:grid-cols-[340px_1fr]">
          <aside className="space-y-5">
            <section className="rounded-lg border border-white/10 bg-[#16140f] p-4">
              <h2 className="mb-4 text-sm font-semibold text-cream">Novo pacote</h2>
              <div className="space-y-3">
                <select
                  value={packDraft.pillar}
                  onChange={(event) => setPackDraft((draft) => ({ ...draft, pillar: event.target.value as ContentPillar }))}
                  className="h-10 w-full rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-cream outline-none focus:border-ocre/70"
                >
                  {pillars.map((pillar) => (
                    <option key={pillar.value} value={pillar.value}>
                      {pillar.label}
                    </option>
                  ))}
                </select>
                <input
                  value={packDraft.topic}
                  onChange={(event) => setPackDraft((draft) => ({ ...draft, topic: event.target.value }))}
                  placeholder="Tema"
                  className="h-10 w-full rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-cream outline-none focus:border-ocre/70"
                />
                <input
                  value={packDraft.angle}
                  onChange={(event) => setPackDraft((draft) => ({ ...draft, angle: event.target.value }))}
                  placeholder="Ângulo"
                  className="h-10 w-full rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-cream outline-none focus:border-ocre/70"
                />
                <textarea
                  value={packDraft.notes}
                  onChange={(event) => setPackDraft((draft) => ({ ...draft, notes: event.target.value }))}
                  placeholder="Notas editoriais"
                  rows={3}
                  className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-cream outline-none focus:border-ocre/70"
                />
                <button
                  type="button"
                  onClick={createPack}
                  disabled={!secret || busy}
                  className="h-10 w-full rounded-lg bg-cream px-4 text-sm font-semibold text-bg transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Criar pacote
                </button>
              </div>
            </section>

            <section className="rounded-lg border border-white/10 bg-[#16140f]">
              <div className="border-b border-white/10 px-4 py-3">
                <h2 className="text-sm font-semibold text-cream">Fila editorial</h2>
              </div>
              <div className="max-h-[620px] overflow-y-auto">
                {packs.map((pack) => (
                  <button
                    key={pack.id}
                    type="button"
                    onClick={() => {
                      setSelectedPackId(pack.id);
                      setHandoff(null);
                    }}
                    className={`block w-full border-b border-white/10 px-4 py-3 text-left transition hover:bg-white/[0.04] ${
                      selectedPack?.id === pack.id ? "bg-white/[0.06]" : ""
                    }`}
                  >
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <span className={`rounded-full border px-2 py-0.5 text-[11px] ${statusClass(pack.status)}`}>{pack.status}</span>
                      <span className="font-mono text-[11px] text-muted">{pack.variations.length} var.</span>
                    </div>
                    <p className="line-clamp-2 text-sm font-semibold leading-snug text-cream">{pack.topic}</p>
                    <p className="mt-1 line-clamp-1 text-xs text-muted">{pack.angle || pack.pillar}</p>
                  </button>
                ))}
                {packs.length === 0 && (
                  <div className="px-4 py-8 text-center text-sm text-muted">
                    {secret ? "Nenhum pacote carregado." : "Informe o segredo para carregar."}
                  </div>
                )}
              </div>
            </section>
          </aside>

          <main className="space-y-5">
            {selectedPack ? (
              <>
                <section className="rounded-lg border border-white/10 bg-[#15130f] p-5">
                  <div className="grid gap-5 lg:grid-cols-[1fr_auto]">
                    <div>
                      <div className="mb-3 flex flex-wrap items-center gap-2">
                        <span className={`rounded-full border px-2.5 py-1 text-xs ${statusClass(selectedPack.status)}`}>
                          {selectedPack.status}
                        </span>
                        <span className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-muted">
                          {selectedPack.pillar}
                        </span>
                        <span className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-muted">
                          {formatDate(selectedPack.updated_at)}
                        </span>
                      </div>
                      <h2 className="text-xl font-bold leading-tight text-cream lg:text-2xl">{selectedPack.topic}</h2>
                      {selectedPack.angle && <p className="mt-2 text-sm leading-relaxed text-muted">{selectedPack.angle}</p>}
                      {selectedPack.notes && <p className="mt-3 rounded-lg border border-white/10 bg-black/20 p-3 text-sm text-cream/80">{selectedPack.notes}</p>}
                    </div>

                    <div className="grid min-w-[230px] gap-2">
                      <button
                        type="button"
                        onClick={approvePackAndVariations}
                        disabled={busy}
                        className="h-10 rounded-lg bg-floresta px-4 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-50"
                      >
                        Aprovar
                      </button>
                      <button
                        type="button"
                        onClick={publishSelectedPack}
                        disabled={busy}
                        className="h-10 rounded-lg bg-terracota px-4 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-50"
                      >
                        Publicar
                      </button>
                      <button
                        type="button"
                        onClick={loadHandoff}
                        disabled={busy}
                        className="h-10 rounded-lg border border-white/10 px-4 text-sm font-semibold text-cream transition hover:bg-white/5 disabled:opacity-50"
                      >
                        Handoff
                      </button>
                      <button
                        type="button"
                        onClick={() => updatePackStatus("review")}
                        disabled={busy}
                        className="h-10 rounded-lg border border-white/10 px-4 text-sm font-semibold text-muted transition hover:bg-white/5 hover:text-cream disabled:opacity-50"
                      >
                        Revisão
                      </button>
                    </div>
                  </div>
                </section>

                <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
                  <div className="space-y-4">
                    {selectedPack.variations.map((variation) => (
                      <VariationPanel
                        key={variation.id}
                        variation={variation}
                        latestJob={selectedPack.latestJobs[variation.id]}
                        busy={busy}
                        copied={copied}
                        onCopy={copyText}
                        onStatus={updateVariationStatus}
                      />
                    ))}
                    {selectedPack.variations.length === 0 && (
                      <div className="rounded-lg border border-white/10 bg-[#15130f] p-8 text-center text-sm text-muted">
                        Nenhuma variação neste pacote.
                      </div>
                    )}
                  </div>

                  <section className="rounded-lg border border-white/10 bg-[#15130f] p-4">
                    <h3 className="mb-4 text-sm font-semibold text-cream">Nova variação</h3>
                    <div className="space-y-3">
                      <select
                        value={variationDraft.channel}
                        onChange={(event) => setVariationDraft((draft) => ({ ...draft, channel: event.target.value as ContentChannel }))}
                        className="h-10 w-full rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-cream outline-none focus:border-ocre/70"
                      >
                        {channels.map((channel) => (
                          <option key={channel.value} value={channel.value}>
                            {channel.label}
                          </option>
                        ))}
                      </select>
                      <input
                        value={variationDraft.title}
                        onChange={(event) => setVariationDraft((draft) => ({ ...draft, title: event.target.value }))}
                        placeholder="Título"
                        className="h-10 w-full rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-cream outline-none focus:border-ocre/70"
                      />
                      <textarea
                        value={variationDraft.body}
                        onChange={(event) => setVariationDraft((draft) => ({ ...draft, body: event.target.value }))}
                        placeholder="Texto"
                        rows={9}
                        className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-cream outline-none focus:border-ocre/70"
                      />
                      <textarea
                        value={variationDraft.asset_brief}
                        onChange={(event) => setVariationDraft((draft) => ({ ...draft, asset_brief: event.target.value }))}
                        placeholder="Brief de arte"
                        rows={3}
                        className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-cream outline-none focus:border-ocre/70"
                      />
                      <input
                        value={variationDraft.slug}
                        onChange={(event) => setVariationDraft((draft) => ({ ...draft, slug: event.target.value }))}
                        placeholder="Slug"
                        className="h-10 w-full rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-cream outline-none focus:border-ocre/70"
                      />
                      <input
                        value={variationDraft.category}
                        onChange={(event) => setVariationDraft((draft) => ({ ...draft, category: event.target.value }))}
                        placeholder="Categoria"
                        className="h-10 w-full rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-cream outline-none focus:border-ocre/70"
                      />
                      <input
                        value={variationDraft.tags}
                        onChange={(event) => setVariationDraft((draft) => ({ ...draft, tags: event.target.value }))}
                        placeholder="Tags separadas por vírgula"
                        className="h-10 w-full rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-cream outline-none focus:border-ocre/70"
                      />
                      <button
                        type="button"
                        onClick={createVariation}
                        disabled={busy}
                        className="h-10 w-full rounded-lg bg-cream px-4 text-sm font-semibold text-bg transition hover:bg-white disabled:opacity-50"
                      >
                        Adicionar
                      </button>
                    </div>
                  </section>
                </section>

                {handoff && (
                  <section className="rounded-lg border border-ocre/30 bg-[#15130f] p-5">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <h3 className="text-lg font-bold text-cream">Handoff</h3>
                      <span className="font-mono text-xs text-muted">{formatDate(handoff.generatedAt)}</span>
                    </div>
                    <div className="grid gap-3">
                      {handoff.items.map((item) => (
                        <div key={item.variationId} className="rounded-lg border border-white/10 bg-black/20 p-4">
                          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                            <div>
                              <p className="text-sm font-semibold text-cream">{item.channelLabel}</p>
                              <p className="text-xs text-muted">{item.title}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => copyText(item.variationId, item.copyMarkdown)}
                              className="h-9 rounded-lg border border-white/10 px-3 text-xs font-semibold text-cream transition hover:bg-white/5"
                            >
                              {copied === item.variationId ? "Copiado" : "Copiar"}
                            </button>
                          </div>
                          <pre className="max-h-56 overflow-auto whitespace-pre-wrap rounded-lg bg-black/30 p-3 text-xs leading-relaxed text-cream/80">
                            {item.copyMarkdown}
                          </pre>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </>
            ) : (
              <section className="rounded-lg border border-white/10 bg-[#15130f] p-12 text-center text-muted">
                Nenhum pacote selecionado.
              </section>
            )}
          </main>
        </div>
      </div>
    </section>
  );
}

type VariationPanelProps = {
  variation: ContentVariation;
  latestJob?: PublicationJob;
  busy: boolean;
  copied: string;
  onCopy: (id: string, value: string) => Promise<void>;
  onStatus: (variation: ContentVariation, status: ContentVariationStatus) => Promise<void>;
};

function VariationPanel({ variation, latestJob, busy, copied, onCopy, onStatus }: VariationPanelProps) {
  const qualityItems = [
    { label: `${variation.body.split(/\s+/).filter(Boolean).length} palavras`, good: variation.body.length > 180 },
    { label: variation.asset_brief ? "arte" : "sem arte", good: Boolean(variation.asset_brief) || variation.channel === "newsletter" },
    { label: variation.tags?.length ? `${variation.tags.length} tags` : "sem tags", good: Boolean(variation.tags?.length) },
  ];

  return (
    <article className="rounded-lg border border-white/10 bg-[#15130f] p-4">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-white/10 px-2 py-0.5 text-xs text-muted">{channelLabel(variation.channel)}</span>
            <span className={`rounded-full border px-2 py-0.5 text-xs ${statusClass(variation.status)}`}>{variation.status}</span>
            {latestJob && <span className={`rounded-full border px-2 py-0.5 text-xs ${statusClass(latestJob.status)}`}>job {latestJob.status}</span>}
          </div>
          <h3 className="text-base font-bold leading-tight text-cream">{variation.title}</h3>
          {latestJob?.external_url && (
            <a href={latestJob.external_url} className="mt-1 block text-xs text-ocre hover:text-cream">
              {latestJob.external_url}
            </a>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onStatus(variation, "approved")}
            disabled={busy || variation.status === "published"}
            className="h-8 rounded-lg border border-floresta/40 px-3 text-xs font-semibold text-emerald-100 transition hover:bg-floresta/20 disabled:opacity-50"
          >
            Aprovar
          </button>
          <button
            type="button"
            onClick={() => onCopy(variation.id, variation.body)}
            className="h-8 rounded-lg border border-white/10 px-3 text-xs font-semibold text-cream transition hover:bg-white/5"
          >
            {copied === variation.id ? "Copiado" : "Copiar"}
          </button>
        </div>
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
        {qualityItems.map((item) => (
          <span
            key={item.label}
            className={`rounded-full border px-2 py-0.5 text-[11px] ${
              item.good ? "border-emerald-300/30 text-emerald-100" : "border-amber-300/30 text-amber-100"
            }`}
          >
            {item.label}
          </span>
        ))}
      </div>

      <pre className="max-h-72 overflow-auto whitespace-pre-wrap rounded-lg bg-black/25 p-3 text-sm leading-relaxed text-cream/80">
        {variation.body}
      </pre>

      {variation.asset_brief && (
        <div className="mt-3 rounded-lg border border-white/10 bg-black/20 p-3">
          <p className="mb-1 font-mono text-[11px] uppercase tracking-[0.16em] text-ocre">Brief de arte</p>
          <p className="text-sm leading-relaxed text-cream/80">{variation.asset_brief}</p>
        </div>
      )}
    </article>
  );
}
