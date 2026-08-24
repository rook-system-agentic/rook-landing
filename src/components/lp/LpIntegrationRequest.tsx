"use client";

import { useId, useRef, useState } from "react";
import { SISTEMAS } from "@/lib/integration-request-validation.mjs";

/**
 * "Não encontrou o seu sistema? Solicite a integração."
 *
 * POR QUE VIROU FORMULÁRIO (24/08/2026)
 *
 * O botão abria um `mailto:`. Três problemas, e o terceiro é o pior:
 *   - depende de o visitante ter cliente de e-mail configurado — no celular,
 *     boa parte não tem;
 *   - o pedido não fica registrado em lugar nenhum;
 *   - o e-mail chega sem estrutura, então ninguém consegue responder a pergunta
 *     que importa: QUAL sistema é mais pedido.
 *
 * A LISTA DE SISTEMAS é fechada com escape para texto livre. Sem lista, o mesmo
 * ERP chega escrito de cinco jeitos e a priorização por volume vira contagem
 * manual. Com lista, agrupa sozinho; com o escape, ninguém fica sem pedir.
 *
 * Segue o padrão de diálogo que a página de planos já usa: `<dialog>` nativo
 * com `showModal()`, que entrega foco preso, Esc para fechar e backdrop de
 * graça — sem biblioteca e sem reimplementar acessibilidade à mão.
 */
type Status = "idle" | "enviando" | "ok" | "erro";

export default function LpIntegrationRequest({ label }: { label: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [erros, setErros] = useState<Record<string, string>>({});
  const [mensagem, setMensagem] = useState("");
  const [sistema, setSistema] = useState("");
  const idBase = useId();
  const tituloId = `${idBase}-titulo`;

  function abrir() {
    setStatus("idle");
    setErros({});
    setMensagem("");
    dialogRef.current?.showModal();
  }

  function fechar() {
    dialogRef.current?.close();
  }

  async function enviar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const form = evento.currentTarget;
    const dados = new FormData(form);

    setStatus("enviando");
    setErros({});
    setMensagem("");

    try {
      const resposta = await fetch("/api/integration-requests/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: dados.get("nome"),
          email: dados.get("email"),
          telefone: dados.get("telefone"),
          sistema: dados.get("sistema"),
          sistemaOutro: dados.get("sistemaOutro"),
          website: dados.get("website"), // honeypot
        }),
      });

      /*
       * A checagem que faltou no diagnóstico e custou 17 dias de lead:
       * `fetch()` não rejeita em 4xx/5xx.
       */
      if (resposta.status === 422) {
        const corpo = await resposta.json();
        setErros(corpo.campos ?? {});
        setMensagem("Confira os campos destacados.");
        setStatus("erro");
        return;
      }

      if (!resposta.ok) {
        setMensagem("Não conseguimos registrar agora. Tente de novo em instantes.");
        setStatus("erro");
        return;
      }

      form.reset();
      setSistema("");
      setStatus("ok");
    } catch {
      setMensagem("Erro de conexão. Verifique sua internet e tente novamente.");
      setStatus("erro");
    }
  }

  const erroDe = (campo: string) =>
    erros[campo] ? (
      <p className="mt-1 text-xs text-terracota" id={`${idBase}-${campo}-erro`}>
        {erros[campo]}
      </p>
    ) : null;

  return (
    <>
      <button type="button" onClick={abrir} className="btn-ghost text-sm">
        {label}
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby={tituloId}
        className="m-auto w-[min(92vw,560px)] rounded-2xl border border-border bg-bg-card p-0 text-cream shadow-2xl backdrop:bg-black/75"
        onClose={() => {
          setStatus("idle");
          setErros({});
          setMensagem("");
        }}
      >
        <div className="flex items-start justify-between gap-5 border-b border-border px-6 py-5">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ocre">
              Integrações
            </p>
            <h2 id={tituloId} className="mt-2 text-2xl font-bold text-cream">
              Qual sistema você usa?
            </h2>
          </div>
          <button
            type="button"
            onClick={fechar}
            aria-label="Fechar"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border text-xl text-muted transition-colors hover:bg-white/5 hover:text-cream focus:outline-none focus:ring-2 focus:ring-terracota"
          >
            ×
          </button>
        </div>

        {status === "ok" ? (
          <div className="px-6 py-10 text-center" role="status">
            <h3 className="text-xl font-bold text-cream">Pedido registrado.</h3>
            <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-muted">
              Obrigado. A gente prioriza as integrações pelo volume de pedidos — o seu acabou de
              entrar na conta. Avisamos você assim que esse sistema estiver no Rook.
            </p>
            <button type="button" onClick={fechar} className="btn-primary mt-6">
              Fechar
            </button>
          </div>
        ) : (
          <form onSubmit={enviar} className="space-y-4 px-6 py-6">
            <p className="text-sm leading-relaxed text-muted">
              Deixe seu contato e diga qual sistema a casa usa. É por aqui que a gente decide o que
              integrar primeiro.
            </p>

            <div>
              <label htmlFor={`${idBase}-nome`} className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-muted">
                Seu nome
              </label>
              <input id={`${idBase}-nome`} name="nome" required maxLength={120} className="input-base w-full" placeholder="Nome do responsável" />
              {erroDe("nome")}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor={`${idBase}-email`} className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-muted">
                  E-mail
                </label>
                <input id={`${idBase}-email`} name="email" type="email" required maxLength={254} className="input-base w-full" placeholder="voce@restaurante.com.br" />
                {erroDe("email")}
              </div>
              <div>
                <label htmlFor={`${idBase}-telefone`} className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-muted">
                  WhatsApp
                </label>
                {/* Instrução, não máscara. A trava de
                    `tests/mock-whatsapp-sem-telefone.test.mjs` reprova qualquer
                    telefone em formato brasileiro no conteúdo da LP — inclusive
                    "(00) 00000-0000" — e ela está certa: placeholder é texto que
                    o visitante lê na tela igual a qualquer outro. */}
                <input id={`${idBase}-telefone`} name="telefone" type="tel" required maxLength={32} className="input-base w-full" placeholder="DDD + número" />
                {erroDe("telefone")}
              </div>
            </div>

            <div>
              <label htmlFor={`${idBase}-sistema`} className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-muted">
                Sistema que você usa
              </label>
              <select
                id={`${idBase}-sistema`}
                name="sistema"
                required
                value={sistema}
                onChange={(e) => setSistema(e.target.value)}
                className="input-base w-full cursor-pointer"
              >
                <option value="" disabled>
                  Selecione…
                </option>
                {SISTEMAS.map((s) => (
                  <option key={s.valor} value={s.valor}>
                    {s.rotulo}
                  </option>
                ))}
              </select>
              {erroDe("sistema")}
            </div>

            {/* O escape para quem usa algo fora da lista. */}
            {sistema === "outro" && (
              <div>
                <label htmlFor={`${idBase}-outro`} className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-muted">
                  Qual sistema?
                </label>
                <input id={`${idBase}-outro`} name="sistemaOutro" maxLength={120} className="input-base w-full" placeholder="Escreva o nome do sistema" autoFocus />
                {erroDe("sistemaOutro")}
              </div>
            )}

            {/* Campo-armadilha para bots. Escondido de gente e de leitor de tela. */}
            <input
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              className="absolute h-0 w-0 overflow-hidden opacity-0"
            />

            {mensagem && (
              <p className="text-sm text-terracota" role="alert">
                {mensagem}
              </p>
            )}

            <button type="submit" disabled={status === "enviando"} className="btn-primary w-full disabled:opacity-60">
              {status === "enviando" ? "Enviando…" : "Solicitar integração"}
            </button>
          </form>
        )}
      </dialog>
    </>
  );
}
