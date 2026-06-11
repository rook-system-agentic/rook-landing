import type { BlogDataSource } from "@/lib/blog-types";

export default function DataSources({
  sources = [],
  methodologyNote,
}: {
  sources?: BlogDataSource[];
  methodologyNote?: string | null;
}) {
  if (!sources.length && !methodologyNote) return null;

  return (
    <aside className="mt-12 rounded-xl border border-border bg-white/[0.03] p-6">
      <p className="section-label mb-4">— Fontes e metodologia</p>
      {methodologyNote && <p className="mb-4 text-sm leading-relaxed text-muted">{methodologyNote}</p>}
      {sources.length > 0 && (
        <ul className="space-y-3 text-sm text-muted">
          {sources.map((source) => (
            <li key={`${source.title}-${source.type}`}>
              <span className="font-semibold text-cream">{source.title}</span>
              <span className="ml-2 rounded-full border border-border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-ocre">
                {source.type}
              </span>
              {source.note && <p className="mt-1">{source.note}</p>}
              {source.url && (
                <a href={source.url} target="_blank" rel="noopener" className="text-terracota hover:text-ocre">
                  {source.url}
                </a>
              )}
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}

