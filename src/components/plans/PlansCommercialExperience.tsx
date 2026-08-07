"use client";

import Link from "next/link";
import {
  type FormEvent,
  type RefObject,
  type ReactNode,
  useId,
  useRef,
  useState,
} from "react";
import { solveCommercialLeadChallenge } from "@/lib/commercial-lead-challenge-client.mjs";
import type { CommercialInterest } from "@/lib/commercial-lead-validation.mjs";
import { buildDirectCheckoutHref } from "@/lib/direct-checkout-link.mjs";
import type { BillingCatalogViewModel } from "@/lib/public-billing-catalog.mjs";

type BasePlan = BillingCatalogViewModel["basePlans"][number];
type ChessPlan = BillingCatalogViewModel["chess"];
type FieldErrors = Partial<Record<"name" | "company" | "email" | "phone" | "cnpj", string>>;

const inputClassName =
  "w-full rounded-lg border border-border bg-bg px-4 py-3 text-sm text-cream outline-none transition-colors placeholder:text-muted/70 focus:border-terracota focus:ring-2 focus:ring-terracota/20";

function CommercialLeadDialog({
  dialogRef,
  interest,
  interestLabel,
}: {
  dialogRef: RefObject<HTMLDialogElement>;
  interest: CommercialInterest;
  interestLabel: string;
}) {
  const titleId = useId();
  const descriptionId = useId();
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  function closeDialog() {
    dialogRef.current?.close();
  }

  async function submitLead(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");
    setFieldErrors({});

    const form = event.currentTarget;
    const formData = new FormData(form);
    const lead = {
      name: formData.get("name"),
      company: formData.get("company"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      cnpj: formData.get("cnpj"),
      website: formData.get("website"),
      interest,
    };

    try {
      const challengeResponse = await fetch("/api/commercial-leads/", {
        method: "GET",
        cache: "no-store",
      });
      const challenge = await challengeResponse.json().catch(() => ({}));

      if (
        !challengeResponse.ok
        || typeof challenge?.token !== "string"
        || !Number.isInteger(challenge?.difficulty)
      ) {
        setMessage(
          challenge?.error
            ?? "Não foi possível iniciar a verificação. Tente novamente.",
        );
        setStatus("error");
        return;
      }

      const solution = await solveCommercialLeadChallenge(challenge);
      const response = await fetch("/api/commercial-leads/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...lead,
          antiBot: { token: challenge.token, solution },
        }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setFieldErrors(data?.fieldErrors ?? {});
        setMessage(data?.error ?? "Não foi possível enviar agora. Tente novamente.");
        setStatus("error");
        return;
      }

      form.reset();
      setStatus("success");
    } catch {
      setMessage("Erro de conexão. Verifique sua internet e tente novamente.");
      setStatus("error");
    }
  }

  const fieldErrorId = (field: keyof FieldErrors) =>
    fieldErrors[field] ? `${titleId}-${field}-error` : undefined;

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      className="m-auto w-[min(92vw,620px)] rounded-2xl border border-border bg-bg-card p-0 text-cream shadow-2xl backdrop:bg-black/75"
      onClose={() => {
        setStatus("idle");
        setMessage("");
        setFieldErrors({});
      }}
    >
      <div className="border-b border-border px-6 py-5 sm:px-8">
        <div className="flex items-start justify-between gap-5">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ocre">
              Interesse em {interestLabel}
            </p>
            <h2 id={titleId} className="mt-2 text-2xl font-bold text-cream">
              Falar com especialista
            </h2>
          </div>
          <button
            type="button"
            onClick={closeDialog}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border text-xl text-muted transition-colors hover:bg-white/5 hover:text-cream focus:outline-none focus:ring-2 focus:ring-terracota"
            aria-label="Fechar formulário"
          >
            ×
          </button>
        </div>
        <p id={descriptionId} className="mt-3 text-sm leading-relaxed text-muted">
          Deixe seus dados e nossa equipe entrará em contato para orientar o
          enquadramento e os próximos passos.
        </p>
      </div>

      {status === "success" ? (
        <div className="px-6 py-10 text-center sm:px-8" role="status">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-floresta/15 text-2xl text-floresta" aria-hidden="true">
            ✓
          </div>
          <h3 className="mt-5 text-xl font-bold text-cream">Contato recebido.</h3>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted">
            Recebemos seus dados. Nossa equipe entrará em contato em breve.
          </p>
          <button type="button" onClick={closeDialog} className="btn-primary mt-7">
            Concluir
          </button>
        </div>
      ) : (
        <form onSubmit={submitLead} className="space-y-5 px-6 py-6 sm:px-8 sm:py-8">
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block text-sm font-medium text-cream">
              Nome
              <input
                name="name"
                type="text"
                autoComplete="name"
                required
                minLength={2}
                maxLength={120}
                className={`${inputClassName} mt-2`}
                aria-invalid={Boolean(fieldErrors.name)}
                aria-describedby={fieldErrorId("name")}
              />
              {fieldErrors.name ? (
                <span id={fieldErrorId("name")} className="mt-1 block text-xs text-terracota">
                  {fieldErrors.name}
                </span>
              ) : null}
            </label>

            <label className="block text-sm font-medium text-cream">
              Empresa <span className="font-normal text-muted">(opcional)</span>
              <input
                name="company"
                type="text"
                autoComplete="organization"
                maxLength={160}
                className={`${inputClassName} mt-2`}
              />
            </label>
          </div>

          <label className="block text-sm font-medium text-cream">
            E-mail
            <input
              name="email"
              type="email"
              autoComplete="email"
              required
              maxLength={254}
              className={`${inputClassName} mt-2`}
              aria-invalid={Boolean(fieldErrors.email)}
              aria-describedby={fieldErrorId("email")}
            />
            {fieldErrors.email ? (
              <span id={fieldErrorId("email")} className="mt-1 block text-xs text-terracota">
                {fieldErrors.email}
              </span>
            ) : null}
          </label>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block text-sm font-medium text-cream">
              Telefone
              <input
                name="phone"
                type="tel"
                autoComplete="tel"
                inputMode="tel"
                required
                maxLength={32}
                placeholder="(61) 99999-9999"
                className={`${inputClassName} mt-2`}
                aria-invalid={Boolean(fieldErrors.phone)}
                aria-describedby={fieldErrorId("phone")}
              />
              {fieldErrors.phone ? (
                <span id={fieldErrorId("phone")} className="mt-1 block text-xs text-terracota">
                  {fieldErrors.phone}
                </span>
              ) : null}
            </label>

            <label className="block text-sm font-medium text-cream">
              CNPJ
              <input
                name="cnpj"
                type="text"
                autoComplete="off"
                inputMode="numeric"
                required
                maxLength={24}
                placeholder="00.000.000/0000-00"
                className={`${inputClassName} mt-2`}
                aria-invalid={Boolean(fieldErrors.cnpj)}
                aria-describedby={fieldErrorId("cnpj")}
              />
              {fieldErrors.cnpj ? (
                <span id={fieldErrorId("cnpj")} className="mt-1 block text-xs text-terracota">
                  {fieldErrors.cnpj}
                </span>
              ) : null}
            </label>
          </div>

          <div className="hidden">
            <label>
              Não preencha este campo
              <input name="website" type="text" tabIndex={-1} autoComplete="off" />
            </label>
          </div>

          <p className="text-xs leading-relaxed text-muted">
            Ao enviar, você concorda com o tratamento dos dados para retorno
            comercial, conforme nossa{" "}
            <Link href="/privacidade" className="text-ocre underline underline-offset-2">
              Política de Privacidade
            </Link>
            .
          </p>

          {status === "error" && message ? (
            <p className="rounded-lg border border-terracota/40 bg-terracota/10 px-4 py-3 text-sm text-cream" role="alert">
              {message}
            </p>
          ) : null}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button type="button" onClick={closeDialog} className="btn-ghost">
              Cancelar
            </button>
            <button type="submit" disabled={status === "loading"} className="btn-primary disabled:cursor-not-allowed disabled:opacity-60">
              {status === "loading" ? "Enviando..." : "Solicitar contato"}
            </button>
          </div>
        </form>
      )}
    </dialog>
  );
}

export function CommercialLeadButton({
  interest,
  interestLabel,
  children = "Falar com especialista",
  className = "btn-ghost",
}: {
  interest: CommercialInterest;
  interestLabel?: string;
  children?: ReactNode;
  className?: string;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const label = interestLabel ?? (interest === "general" ? "Planos" : interest.charAt(0).toUpperCase() + interest.slice(1));

  return (
    <>
      <button
        type="button"
        className={className}
        onClick={() => dialogRef.current?.showModal()}
      >
        {children}
      </button>
      <CommercialLeadDialog dialogRef={dialogRef} interest={interest} interestLabel={label} />
    </>
  );
}

export function PlansCommercialExperience({
  threshold,
  basePlans,
  chess,
}: {
  threshold: string;
  basePlans: BasePlan[];
  chess: ChessPlan;
}) {
  const [selectedPlan, setSelectedPlan] = useState<"knight" | "rook">("knight");
  const [hasMultipleUnits, setHasMultipleUnits] = useState<boolean | null>(null);
  const selected = basePlans.find((plan) => plan.productCode === selectedPlan) ?? basePlans[0];

  if (!selected) return null;

  return (
    <div className="text-left">
      <div className="mx-auto mb-10 max-w-3xl rounded-2xl border border-border bg-bg-card/60 p-5 text-center md:p-7">
        <label htmlFor="monthly-revenue-range" className="block text-lg font-semibold text-cream">
          Qual é o faturamento bruto mensal do estabelecimento?
        </label>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-muted">
          Selecione uma das duas faixas oficiais para visualizar o enquadramento
          correspondente. Os dois planos oferecem o mesmo acesso funcional.
        </p>
        <select
          id="monthly-revenue-range"
          value={selectedPlan}
          onChange={(event) => setSelectedPlan(event.target.value as "knight" | "rook")}
          className="mt-5 w-full max-w-md rounded-lg border border-terracota bg-bg px-4 py-3 text-base font-semibold text-cream outline-none focus:ring-2 focus:ring-terracota/40"
        >
          <option value="knight">Até {threshold} por mês</option>
          <option value="rook">Acima de {threshold} por mês</option>
        </select>
        <p className="mt-5 text-sm text-muted" role="status" aria-live="polite">
          Plano indicado: <strong className="text-ocre">{selected.displayName}</strong>
          {" · "}
          <span className="text-cream">{selected.formattedPrice}/mês</span>
        </p>
      </div>

      <div className="mx-auto grid max-w-5xl gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(300px,0.85fr)] lg:items-stretch">
        <article
          key={selected.productCode}
          className="card relative flex h-full flex-col border-ocre p-6 ring-1 ring-ocre/70 md:p-8"
          aria-current="true"
        >
          <p className="absolute right-5 top-5 rounded-full bg-ocre/15 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-ocre">
            Plano indicado
          </p>
          <p className="pr-28 font-mono text-xs uppercase tracking-wider text-ocre">
            {selected.productCode === "knight"
              ? `Até ${threshold}`
              : `Acima de ${threshold}`}
          </p>
          <h2 className="mt-3 text-3xl font-bold text-cream">{selected.displayName}</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            {selected.description}
          </p>
          <p className="mt-7 text-3xl font-bold text-cream">
            {selected.formattedPrice}
            <span className="ml-2 text-sm font-normal text-muted">
              /estabelecimento/mês
            </span>
          </p>
          <p className="mt-2 text-xs text-muted">Cobrança mensal recorrente em reais.</p>
          <ul className="mt-7 space-y-3">
            {selected.publicFeatures.map((feature) => (
              <li key={feature} className="flex items-start gap-2 text-sm text-muted">
                <span className="mt-0.5 text-floresta" aria-hidden="true">✓</span>
                <span>{feature}</span>
              </li>
            ))}
            <li className="flex items-start gap-2 text-sm text-muted">
              <span className="mt-0.5 text-floresta" aria-hidden="true">✓</span>
              <span>Mesma cobertura funcional de Knight e Rook</span>
            </li>
          </ul>
          <a
            href={buildDirectCheckoutHref(selected.productCode)}
            className="btn-primary mt-8 text-center"
          >
            Testar por 7 dias
          </a>
        </article>

        <aside
          className="card relative flex h-full flex-col overflow-hidden border-ocre/40 bg-[linear-gradient(145deg,rgba(231,159,74,0.09),rgba(255,255,255,0.015)_52%)] p-6 md:p-8"
          aria-labelledby="chess-bridge-title"
        >
          <div className="absolute inset-y-0 left-0 w-1 bg-ocre/70" aria-hidden="true" />
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ocre">
            Chess · adicional opcional ao {selected.displayName}
          </p>
          <h2 id="chess-bridge-title" className="mt-3 text-2xl font-bold text-cream">
            Seu negócio tem mais de uma unidade?
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Essa resposta indica se o Chess faz sentido para a estrutura do seu grupo.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row" role="group" aria-label="Número de unidades do negócio">
            <button
              type="button"
              className={`btn-ghost flex-1 ${hasMultipleUnits === true ? "border-ocre bg-ocre/10 text-cream" : ""}`}
              aria-pressed={hasMultipleUnits === true}
              onClick={() => setHasMultipleUnits(true)}
            >
              Sim, tenho um grupo
            </button>
            <button
              type="button"
              className={`btn-ghost flex-1 ${hasMultipleUnits === false ? "border-ocre bg-ocre/10 text-cream" : ""}`}
              aria-pressed={hasMultipleUnits === false}
              onClick={() => setHasMultipleUnits(false)}
            >
              Não, uma unidade
            </button>
          </div>

          <div className="mt-6 flex flex-1 flex-col border-t border-border pt-6" aria-live="polite">
            {hasMultipleUnits === null ? (
              <p className="text-sm leading-relaxed text-muted">
                Se houver duas ou mais unidades, mostramos como o Chess complementa o plano indicado.
              </p>
            ) : hasMultipleUnits ? (
              <>
                <h3 className="text-lg font-semibold text-cream">
                  Chess conecta a visão do grupo.
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  É o adicional mensal que organiza matriz e restaurantes em uma visão multiunidade. Cada estabelecimento mantém seu Knight ou Rook; o Chess acrescenta o acompanhamento do grupo.
                </p>
                <p className="mt-5 text-sm text-muted">
                  Adicional de <strong className="text-base text-cream">{chess.formattedPrice}</strong>
                  <span className="ml-1">/organização/mês</span>
                </p>
                <a
                  href="#chess-details"
                  className="btn-ghost mt-6 text-center"
                  aria-controls="chess-details"
                >
                  Conhecer o Chess
                </a>
              </>
            ) : (
              <>
                <h3 className="text-lg font-semibold text-cream">
                  Seu plano indicado já atende esta estrutura.
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  Para uma única unidade, siga com {selected.displayName}. O Chess pode ser avaliado depois, se o negócio crescer para uma operação multiunidade.
                </p>
              </>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
