"use client";

import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import { validateBf1AccessInput } from "@/lib/bf1-access-validation.mjs";
import { BF1_CONTENT } from "@/lib/bf1-content";
import { captureVisitAttribution } from "@/lib/lead-attribution-client";
import type { LeadAttribution } from "@/lib/lead-attribution.mjs";
import { track, TRACKING_EVENTS } from "@/lib/track";
import { rememberBf1Access } from "./bf1-access-storage";
import styles from "./bf1.module.css";

/*
 * Cadastro antes do grupo Black Rook 2026 (ROO-1848).
 *
 * Fluxo: nome, WhatsApp, e-mail e restaurante → desafio antiabuso → gravação
 * → botão real para o grupo (+ redirecionamento automático). O botão real
 * existe porque abrir uma aba depois de uma chamada assíncrona é bloqueado
 * como pop-up em vários navegadores.
 *
 * Falha de gravação não deixa a pessoa de fora (decisão F2): mostra o convite
 * direto. Erro de campo (422) não cai nessa alternativa: pede correção.
 *
 * Nada do formulário vai para analytics: o evento bf1_access_request não tem
 * campos (allowlist em tracking-events.mjs).
 */

const ENDPOINT = "/api/bf1-community-access/";
const REDIRECT_DELAY_MS = 1_500;

type Field = "name" | "phone" | "email" | "restaurant";
type Values = Record<Field, string>;
type Errors = Partial<Record<Field | "commercialContactRequested" | "form", string>>;
type Phase = "form" | "success" | "fallback";
type Snapshot = Values & { submissionId: string; commercialContactRequested: boolean; attribution: LeadAttribution | null };

const FIELDS: readonly Field[] = ["name", "phone", "email", "restaurant"];
const EMPTY: Values = { name: "", phone: "", email: "", restaurant: "" };
const AUTOCOMPLETE: Record<Field, string> = { name: "name", phone: "tel", email: "email", restaurant: "organization" };
const INPUT_TYPE: Record<Field, string> = { name: "text", phone: "tel", email: "email", restaurant: "text" };

async function fetchWithTimeout(input: string, init?: RequestInit) {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), 20_000);
  try {
    return await fetch(input, { ...init, cache: "no-store", signal: controller.signal });
  } finally {
    window.clearTimeout(timer);
  }
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function firstName(value: string) {
  return value.trim().split(/\s+/)[0] || "";
}

class RetryableError extends Error {}

export default function Bf1AccessDialog({ href, onClose }: { href: string; onClose: () => void }) {
  const copy = BF1_CONTENT.access;
  const dialog = useRef<HTMLDialogElement>(null);
  const submissionId = useRef("");
  const attribution = useRef<LeadAttribution | null>(null);
  const snapshot = useRef<Snapshot | null>(null);
  const inFlight = useRef(false);
  const redirectTimer = useRef<number | null>(null);
  const resultHeading = useRef<HTMLHeadingElement>(null);
  const [values, setValues] = useState<Values>(EMPTY);
  const [commercialContactRequested, setCommercialContactRequested] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [phase, setPhase] = useState<Phase>("form");
  const [name, setName] = useState("");

  useEffect(() => {
    submissionId.current = crypto.randomUUID();
    attribution.current = captureVisitAttribution({ href: window.location.href, referrer: document.referrer });
    const element = dialog.current;
    if (element && !element.open) element.showModal();
    return () => {
      if (redirectTimer.current) window.clearTimeout(redirectTimer.current);
      if (element?.open) element.close();
    };
  }, []);

  useEffect(() => {
    if (phase !== "form") resultHeading.current?.focus();
  }, [phase]);

  function change(field: Field, value: string) {
    setValues((previous) => ({ ...previous, [field]: value }));
    setErrors((previous) => {
      const next = { ...previous };
      delete next[field];
      delete next.form;
      return next;
    });
    setMessage("");
  }

  function showFieldErrors(next: Errors) {
    setErrors(next);
    const first = FIELDS.find((field) => next[field]);
    if (first) requestAnimationFrame(() => document.getElementById(`bf1-access-${first}`)?.focus());
  }

  function cancelRedirect() {
    if (redirectTimer.current) window.clearTimeout(redirectTimer.current);
    redirectTimer.current = null;
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inFlight.current || phase === "success" || !submissionId.current) return;
    setMessage("");

    const frozen: Snapshot = snapshot.current || {
      submissionId: submissionId.current,
      ...values,
      commercialContactRequested,
      attribution: attribution.current,
    };
    // Mesma validação do servidor: a regra vive em bf1-access-validation.mjs.
    const local = validateBf1AccessInput(frozen);
    if (!local.ok) {
      snapshot.current = null;
      showFieldErrors(local.errors as Errors);
      return;
    }
    // Congela dados + UUID antes do desafio: retry nunca vira segundo cadastro.
    snapshot.current = frozen;

    inFlight.current = true;
    setBusy(true);
    try {
      const challengeResponse = await fetchWithTimeout(ENDPOINT);
      const challenge = asRecord(await challengeResponse.json().catch(() => null));
      if (!challengeResponse.ok || typeof challenge.token !== "string" || typeof challenge.difficulty !== "number") {
        throw new RetryableError("challenge_unavailable");
      }
      const { solveCommercialLeadChallenge } = await import("@/lib/commercial-lead-challenge-client.mjs");
      const solution = await solveCommercialLeadChallenge({ token: challenge.token, difficulty: challenge.difficulty });
      const response = await fetchWithTimeout(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...frozen, antiBot: { token: challenge.token, solution } }),
      });
      const data = asRecord(await response.json().catch(() => null));

      if (response.status === 422) {
        const fieldErrors: Errors = {};
        for (const [field, value] of Object.entries(asRecord(data.fieldErrors))) {
          if ((FIELDS as readonly string[]).includes(field) && typeof value === "string") fieldErrors[field as Field] = value;
        }
        snapshot.current = null;
        setMessage(typeof data.error === "string" ? data.error : "Revise os campos destacados.");
        showFieldErrors(fieldErrors);
        return;
      }
      if (response.status === 400) {
        // Desafio expirado/reutilizado: novo envio com os mesmos dados resolve.
        setMessage(typeof data.error === "string" ? data.error : "A verificação expirou. Tente novamente.");
        return;
      }
      if (!response.ok || data.success !== true) throw new RetryableError(`status_${response.status}`);

      rememberBf1Access();
      track(TRACKING_EVENTS.bf1AccessRequest);
      setName(firstName(frozen.name));
      setPhase("success");
      redirectTimer.current = window.setTimeout(() => window.location.assign(href), REDIRECT_DELAY_MS);
    } catch {
      setPhase("fallback");
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  }

  const locked = busy || phase !== "form";

  return (
    <dialog
      ref={dialog}
      className={styles.accessDialog}
      aria-labelledby="bf1-access-title"
      onClose={() => {
        cancelRedirect();
        onClose();
      }}
    >
      <div className={styles.accessPanel}>
        <button type="button" className={styles.accessClose} onClick={() => dialog.current?.close()} aria-label={copy.close}>
          <span aria-hidden="true">×</span>
        </button>

        {phase === "form" ? (
          <>
            <p className={styles.accessEyebrow}>Black Rook 2026</p>
            <h2 id="bf1-access-title" className={styles.accessTitle}>{copy.title}</h2>
            <p className={styles.accessLead}>{copy.lead}</p>
            <form className={styles.accessForm} onSubmit={submit} noValidate aria-busy={busy}>
              {FIELDS.map((field) => (
                <div key={field} className={styles.accessField}>
                  <label htmlFor={`bf1-access-${field}`} className={styles.accessLabel}>{copy.fields[field].label}</label>
                  <input
                    id={`bf1-access-${field}`}
                    name={field}
                    type={INPUT_TYPE[field]}
                    inputMode={field === "phone" ? "tel" : field === "email" ? "email" : undefined}
                    autoComplete={AUTOCOMPLETE[field]}
                    placeholder={copy.fields[field].placeholder}
                    className={styles.accessInput}
                    value={values[field]}
                    readOnly={locked}
                    required
                    maxLength={field === "email" ? 254 : field === "phone" ? 40 : 120}
                    autoFocus={field === "name"}
                    onChange={(event) => change(field, event.target.value)}
                    aria-invalid={errors[field] ? true : undefined}
                    aria-describedby={errors[field] ? `bf1-access-${field}-error` : undefined}
                  />
                  {errors[field] ? <p id={`bf1-access-${field}-error`} className={styles.accessError}>{errors[field]}</p> : null}
                </div>
              ))}
              <label className={styles.accessCheck}>
                <input
                  type="checkbox"
                  checked={commercialContactRequested}
                  disabled={locked}
                  onChange={(event) => setCommercialContactRequested(event.target.checked)}
                />
                <span>{copy.commercialOptIn}</span>
              </label>
              <p className={styles.accessNotice}>
                {copy.notice.before}
                <Link href="/privacidade/" target="_blank" rel="noopener">{copy.notice.linkLabel}</Link>
                {copy.notice.after}
              </p>
              {message ? <p className={styles.accessError} role="alert">{message}</p> : null}
              <button type="submit" className={`${styles.cta} ${styles.accessSubmit}`} disabled={busy}>
                <span>{busy ? copy.busy : copy.submit}</span>
              </button>
            </form>
          </>
        ) : null}

        {phase === "success" ? (
          <div className={styles.accessResult} role="status" aria-live="polite">
            <h2 id="bf1-access-title" ref={resultHeading} tabIndex={-1} className={styles.accessTitle}>
              {name ? `${copy.successTitle}, ${name}!` : `${copy.successTitle}!`}
            </h2>
            <p className={styles.accessLead}>{copy.successBody}</p>
            <a href={href} target="_blank" rel="noopener noreferrer" className={`${styles.cta} ${styles.accessSubmit}`} onClick={cancelRedirect}>
              <span>{copy.successCta}</span>
            </a>
          </div>
        ) : null}

        {phase === "fallback" ? (
          <div className={styles.accessResult} role="alert">
            <h2 id="bf1-access-title" ref={resultHeading} tabIndex={-1} className={styles.accessTitle}>{copy.title}</h2>
            <p className={styles.accessLead}>{copy.fallbackBody}</p>
            <a href={href} target="_blank" rel="noopener noreferrer" className={`${styles.cta} ${styles.accessSubmit}`}>
              <span>{copy.fallbackCta}</span>
            </a>
          </div>
        ) : null}
      </div>
    </dialog>
  );
}
