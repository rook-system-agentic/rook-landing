"use client";
import { useState } from "react";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter/", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
      if (res.ok) { setStatus("success"); setEmail(""); }
      else setStatus("error");
    } catch { setStatus("error"); }
  };

  if (status === "success") {
    return <p className="text-floresta font-medium">Inscrito com sucesso. Bem-vindo ao Rook.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 max-w-md mx-auto">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="seu@email.com"
        required
        className="flex-1 bg-bg-card border border-border rounded-lg px-4 py-3 text-sm text-cream placeholder:text-muted outline-none focus:border-terracota transition-colors"
      />
      <button type="submit" disabled={status === "loading"} className="btn-primary whitespace-nowrap">
        {status === "loading" ? "..." : "Quero Receber"}
      </button>
    </form>
  );
}
