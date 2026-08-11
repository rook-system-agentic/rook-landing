"use client";
import { useState } from "react";

const inputCls =
  "w-full bg-bg-card border border-border rounded-lg px-4 py-3 text-sm text-cream placeholder:text-muted outline-none focus:border-terracota transition-colors";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !consent) return;
    setStatus("loading");
    setError("");
    try {
      const res = await fetch("/api/newsletter/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name: name || undefined, consent }),
      });
      if (res.ok) {
        setStatus("success");
        setEmail("");
        setName("");
        setConsent(false);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data?.error || "Não foi possível concluir. Tente novamente.");
        setStatus("error");
      }
    } catch {
      setError("Erro de conexão. Tente novamente.");
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <p className="text-floresta font-medium">
        Inscrito com sucesso. Confira seu e-mail de boas-vindas. 👋
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 max-w-md mx-auto text-left">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Seu nome (opcional)"
        autoComplete="name"
        className={inputCls}
      />
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="seu@email.com"
        required
        autoComplete="email"
        className={inputCls}
      />
      <label className="flex items-start gap-2 text-xs text-muted">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          required
          className="mt-0.5 accent-terracota"
        />
        <span>
          Concordo em receber e-mails do Rook System e com o tratamento dos meus dados
          conforme a{" "}
          <a href="/privacidade" className="text-ocre underline">
            Política de Privacidade
          </a>
          .
        </span>
      </label>
      {status === "error" && error ? (
        <p className="text-xs text-terracota">{error}</p>
      ) : null}
      <button
        type="submit"
        disabled={status === "loading" || !consent}
        className="btn-primary whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {status === "loading" ? "Enviando..." : "Quero Receber"}
      </button>
    </form>
  );
}
