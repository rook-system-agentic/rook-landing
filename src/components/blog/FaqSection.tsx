import type { BlogFaq } from "@/lib/blog-types";

export default function FaqSection({ faqs }: { faqs: BlogFaq[] }) {
  if (!faqs.length) return null;

  return (
    <section className="mt-14 border-t border-border pt-10">
      <p className="section-label mb-4">— Perguntas frequentes</p>
      <div className="space-y-4">
        {faqs.map((faq) => (
          <details key={faq.question} className="card p-5 group">
            <summary className="cursor-pointer font-semibold text-cream flex items-center justify-between gap-4">
              {faq.question}
              <span className="text-ocre group-open:rotate-45 transition-transform text-xl">+</span>
            </summary>
            <p className="mt-3 text-sm text-muted leading-relaxed">{faq.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

