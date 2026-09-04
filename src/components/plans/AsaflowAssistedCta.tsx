"use client";

import { useEffect, useId, useRef, useState } from "react";
import { buildAsaflowFormUrl } from "@/lib/lp-experiment.mjs";
import {
  currentLpVariant,
  lpExperimentDims,
  marcarExposicao,
} from "@/lib/lp-experiment-client";
import { track, TRACKING_EVENTS } from "@/lib/track";

/*
 * Variante B do experimento de /planos (ROO-1207): o CTA principal abre o
 * chat do AsaFlow; o formulário do AsaFlow fica como alternativa para quem
 * prefere deixar os dados. Preço e copy do plano não mudam — só a ação.
 *
 * O snippet do widget e a URL do formulário vêm de variáveis de ambiente
 * públicas (são públicas por natureza: vão para o bundle e para o HTML). Sem
 * elas o middleware não sorteia ninguém para a B, e este componente fica
 * escondido pelo CSS de `[data-lp-only]`.
 *
 * O SCRIPT DO WIDGET SÓ É BAIXADO NO PRIMEIRO CLIQUE. A issue trava CLS, LCP e
 * INP após o carregamento do widget; a maneira mais barata de respeitar isso é
 * não carregar terceiro nenhum antes de a pessoa pedir. Ad blocker, script
 * indisponível e timeout caem no mesmo lugar: o painel de fallback, com
 * "tentar de novo" e o formulário como saída — nada disso toca a Variante A.
 */

const WIDGET_SRC = process.env.NEXT_PUBLIC_ASAFLOW_WIDGET_SRC ?? "";
const FORM_URL = process.env.NEXT_PUBLIC_ASAFLOW_FORM_URL ?? "";
const WIDGET_TIMEOUT_MS = 8000;

type ChatState = "idle" | "loading" | "open" | "error";

function carregarWidget(): Promise<void> {
  return new Promise((resolve, reject) => {
    const existente = document.querySelector<HTMLScriptElement>(`script[src="${WIDGET_SRC}"]`);
    if (existente?.dataset.loaded === "1") return resolve();

    const script = existente ?? document.createElement("script");
    const timer = window.setTimeout(() => reject(new Error("timeout")), WIDGET_TIMEOUT_MS);

    script.addEventListener("load", () => {
      window.clearTimeout(timer);
      script.dataset.loaded = "1";
      resolve();
    });
    script.addEventListener("error", () => {
      window.clearTimeout(timer);
      script.remove();
      reject(new Error("load_error"));
    });

    if (!existente) {
      script.src = WIDGET_SRC;
      script.async = true;
      document.body.appendChild(script);
    }
  });
}

export function AsaflowAssistedCta({ plan }: { plan: string }) {
  const [chat, setChat] = useState<ChatState>("idle");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [formSrc, setFormSrc] = useState("");
  const statusId = useId();
  const titleId = useId();

  // Exposição: uma vez por sessão, só para quem está de fato numa variante.
  useEffect(() => {
    if (!currentLpVariant()) return;
    if (!marcarExposicao()) return;
    track(TRACKING_EVENTS.experimentExposure, { page_type: "planos", ...lpExperimentDims() });
  }, []);

  async function abrirChat() {
    track(TRACKING_EVENTS.ctaClick, { destination: "chat", plan, ...lpExperimentDims() });
    setChat("loading");
    try {
      await carregarWidget();
      // ponytail: o snippet do AsaFlow ainda não foi entregue; quando vier,
      // chamar aqui a API de abrir do widget (uma linha) em vez de só carregá-lo.
      setChat("open");
      track(TRACKING_EVENTS.chatOpen, { page_type: "planos", ...lpExperimentDims() });
    } catch (erro) {
      setChat("error");
      track(TRACKING_EVENTS.integrationError, {
        component: "asaflow_widget",
        error_code: erro instanceof Error ? erro.message : "unknown",
        ...lpExperimentDims(),
      });
    }
  }

  function abrirFormulario() {
    const variant = currentLpVariant() ?? "assisted";
    setFormSrc(
      buildAsaflowFormUrl(FORM_URL, {
        currentHref: window.location.href,
        referrer: document.referrer,
        variant,
      }),
    );
    track(TRACKING_EVENTS.ctaClick, { destination: "form", plan, ...lpExperimentDims() });
    track(TRACKING_EVENTS.formView, { page_type: "planos", ...lpExperimentDims() });
    dialogRef.current?.showModal();
  }

  return (
    <div data-lp-only="assisted" className="mt-8 flex flex-col gap-3">
      <button
        type="button"
        className="btn-primary text-center"
        onClick={abrirChat}
        disabled={chat === "loading"}
        aria-describedby={statusId}
      >
        {chat === "loading" ? "Abrindo o atendimento…" : "Falar com o Rook agora"}
      </button>

      <p id={statusId} className="text-center text-xs text-muted" role="status" aria-live="polite">
        {chat === "idle" && "Atendimento em minutos, direto pelo chat."}
        {chat === "loading" && "Carregando o chat…"}
        {chat === "open" && "O chat abriu no canto da tela. Se não apareceu, use o formulário abaixo."}
        {chat === "error" && "O chat não carregou agora. Você pode tentar de novo ou deixar seus dados."}
      </p>

      {chat === "error" && (
        <button type="button" className="btn-ghost text-center" onClick={abrirChat}>
          Tentar de novo
        </button>
      )}

      <button
        type="button"
        className="text-center text-sm underline underline-offset-4 text-cream"
        onClick={abrirFormulario}
      >
        Prefere deixar seus dados? Preencha o formulário
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        className="w-[min(92vw,640px)] rounded-2xl border border-border bg-bg-card p-0 text-cream backdrop:bg-black/70"
        onClose={() => setFormSrc("")}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h3 id={titleId} className="text-lg font-semibold">
            Fale com a equipe Rook
          </h3>
          <button
            type="button"
            className="btn-ghost px-3 py-1 text-sm"
            onClick={() => dialogRef.current?.close()}
          >
            Fechar
          </button>
        </div>
        {formSrc && (
          <iframe
            src={formSrc}
            title="Formulário de contato comercial"
            className="block h-[min(75vh,720px)] w-full"
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            sandbox="allow-scripts allow-forms allow-same-origin allow-popups"
          />
        )}
      </dialog>
    </div>
  );
}
