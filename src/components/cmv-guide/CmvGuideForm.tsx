"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { normalizePhone } from "@/lib/acquisition-input.mjs";
import { CMV_GUIDE_CONTENT } from "@/lib/cmv-guide-content";
import type { LeadAttribution } from "@/lib/lead-attribution.mjs";
import { captureVisitAttribution } from "@/lib/lead-attribution-client";
import { track, TRACKING_EVENTS } from "@/lib/track";
import styles from "./cmv-guide.module.css";

type GuideValues = {
  name: string;
  email: string;
  phone: string;
  restaurant: string;
};

type GuideField = keyof GuideValues | "commercialContactRequested" | "form";
type FieldErrors = Partial<Record<GuideField, string>>;

type GuideState =
  | "queued"
  | "provider_accepted"
  | "delivered"
  | "failed"
  | "needs_reconciliation";

type GuideResponse = {
  success?: boolean;
  state?: GuideState;
  message?: string;
  error?: string;
  fieldErrors?: Record<string, unknown>;
};

type GuideSnapshot = GuideValues & {
  submissionId: string;
  commercialContactRequested: boolean;
  // Atribuição autodeclarada da visita (ROO-1642): UTMs permitidas, caminho
  // público e host do referrer, capturados na primeira entrada da SPA. Nunca
  // a URL completa nem os dados do formulário; o servidor normaliza de novo.
  attribution: LeadAttribution | null;
};

type Challenge = {
  token: string;
  difficulty: number;
};

const EMPTY_VALUES: GuideValues = {
  name: "",
  email: "",
  phone: "",
  restaurant: "",
};

const GUIDE_STATES: readonly GuideState[] = [
  "queued",
  "provider_accepted",
  "delivered",
  "failed",
  "needs_reconciliation",
];

function isGuideState(value: unknown): value is GuideState {
  return typeof value === "string" && GUIDE_STATES.includes(value as GuideState);
}

function validate(values: GuideValues): FieldErrors {
  const errors: FieldErrors = {};
  const name = values.name.trim();
  const restaurant = values.restaurant.trim();
  const email = values.email.trim();

  if (name.length < 2 || name.length > 120) {
    errors.name = "Informe seu nome (entre 2 e 120 caracteres).";
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    errors.email = "Informe um e-mail válido.";
  }
  if (!normalizePhone(values.phone)) {
    errors.phone = "Informe um telefone válido com DDD.";
  }
  if (restaurant.length < 2 || restaurant.length > 120) {
    errors.restaurant = "Informe o nome do restaurante (entre 2 e 120 caracteres).";
  }

  return errors;
}

function fieldId(field: GuideField) {
  return `cmv-guide-${field}`;
}

function errorId(field: GuideField) {
  return `${fieldId(field)}-error`;
}

// Estados em que o pedido segue o caminho normal até o e-mail. A copy não
// promete entrega: diz para onde o material segue e o que fazer enquanto isso.
const ON_ITS_WAY: readonly GuideState[] = ["queued", "provider_accepted", "delivered"];

function firstName(value: string) {
  return value.trim().split(/\s+/)[0] || "";
}

function statusTitle(state: GuideState, name: string) {
  if (ON_ITS_WAY.includes(state)) {
    return name ? `Pronto, ${name}! O material está a caminho.` : "Pronto! O material está a caminho.";
  }
  return state === "failed" ? "Cadastro salvo, envio pendente" : "Cadastro salvo, confirmação pendente";
}

function statusFallbackBody(state: GuideState) {
  if (state === "failed") {
    return "Seu cadastro está salvo, mas o envio do material não pôde ser concluído agora. A equipe Rook precisa reprocessar esta solicitação; você não precisa preencher de novo.";
  }
  return "Seu cadastro está salvo, mas a confirmação do envio precisa ser conferida pela equipe Rook. Não há link público para baixar o material; você não precisa preencher de novo.";
}

function messageFromResponse(data: GuideResponse, status: number) {
  if (status === 503) {
    return "O cadastro e o envio do material estão temporariamente indisponíveis. Seus dados permanecem nesta página; tente novamente mais tarde.";
  }
  if (status === 429) {
    return "Muitas tentativas em pouco tempo. Aguarde alguns minutos e tente novamente.";
  }
  if (status === 409) {
    return "Esta solicitação já foi registrada com outros dados. Recomece a página para iniciar uma nova solicitação.";
  }
  if (status === 400 || status === 403) {
    return data.error || "A verificação expirou. Tente novamente.";
  }
  return data.error || "Não foi possível registrar a solicitação agora. Tente novamente.";
}

async function fetchWithTimeout(input: RequestInfo | URL, init?: RequestInit) {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), 20_000);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    window.clearTimeout(timer);
  }
}

function parseChallenge(value: unknown): Challenge | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const candidate = value as Record<string, unknown>;
  if (typeof candidate.token !== "string" || typeof candidate.difficulty !== "number") return null;
  return { token: candidate.token, difficulty: candidate.difficulty };
}

function parseResponse(value: unknown): GuideResponse {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as GuideResponse;
}

export default function CmvGuideForm() {
  const [values, setValues] = useState<GuideValues>(EMPTY_VALUES);
  const [commercialContactRequested, setCommercialContactRequested] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [hasSnapshot, setHasSnapshot] = useState(false);
  const [receiptState, setReceiptState] = useState<GuideState | null>(null);
  const [receiptContact, setReceiptContact] = useState<{ name: string; email: string } | null>(null);
  const [ready, setReady] = useState(false);
  const submissionId = useRef("");
  const attribution = useRef<LeadAttribution | null>(null);
  const snapshot = useRef<GuideSnapshot | null>(null);
  const inFlight = useRef(false);
  const completed = useRef(false);
  const receiptHeading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    submissionId.current = crypto.randomUUID();
    attribution.current = captureVisitAttribution({ href: window.location.href, referrer: document.referrer });
    setReady(true);
  }, []);

  useEffect(() => {
    if (receiptState) receiptHeading.current?.focus();
  }, [receiptState]);

  function change(field: keyof GuideValues, value: string) {
    setValues((previous) => ({ ...previous, [field]: value }));
    setErrors((previous) => {
      const next = { ...previous };
      delete next[field];
      delete next.form;
      return next;
    });
    setMessage("");
  }

  function focusFirstError(nextErrors: FieldErrors) {
    const first = Object.keys(nextErrors)[0] as GuideField | undefined;
    if (!first || first === "form") return;
    requestAnimationFrame(() => document.getElementById(fieldId(first))?.focus());
  }

  function showErrors(nextErrors: FieldErrors) {
    setErrors(nextErrors);
    focusFirstError(nextErrors);
  }

  function resetSnapshotForEditing() {
    if (busy || completed.current) return;
    snapshot.current = null;
    // Editar depois de uma tentativa confirmada é uma nova solicitação; o
    // retry normal nunca passa por aqui e conserva o UUID congelado.
    submissionId.current = crypto.randomUUID();
    setHasSnapshot(false);
    setMessage("");
    setErrors({});
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inFlight.current || completed.current || !submissionId.current) return;

    setMessage("");
    const validationErrors = validate(values);
    if (Object.keys(validationErrors).length > 0) {
      showErrors(validationErrors);
      return;
    }

    const existingSnapshot = snapshot.current;
    const nextSnapshot: GuideSnapshot = existingSnapshot || {
      submissionId: submissionId.current,
      name: values.name.trim(),
      email: values.email.trim().toLowerCase(),
      phone: normalizePhone(values.phone) as string,
      restaurant: values.restaurant.trim(),
      commercialContactRequested,
      attribution: attribution.current,
    };

    if (!existingSnapshot) {
      // O snapshot congela os quatro dados e o UUID antes do desafio. Um retry
      // renova apenas o antiBot; nunca cria uma segunda solicitação por acidente.
      snapshot.current = nextSnapshot;
      setHasSnapshot(true);
    }

    inFlight.current = true;
    setBusy(true);
    try {
      const challengeResponse = await fetchWithTimeout("/api/cmv-guide/", {
        cache: "no-store",
      });
      const challengeData = parseResponse(await challengeResponse.json().catch(() => null));
      if (!challengeResponse.ok) {
        throw new Error(messageFromResponse(challengeData, challengeResponse.status));
      }
      const challenge = parseChallenge(challengeData);
      if (!challenge) throw new Error("Não foi possível iniciar a verificação. Tente novamente.");

      const { solveCommercialLeadChallenge } = await import(
        "@/lib/commercial-lead-challenge-client.mjs"
      );
      const solution = await solveCommercialLeadChallenge(challenge);
      const postResponse = await fetchWithTimeout("/api/cmv-guide/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...nextSnapshot,
          antiBot: { token: challenge.token, solution },
        }),
      });
      const responseData = parseResponse(await postResponse.json().catch(() => null));

      if (postResponse.status === 422) {
        const fieldErrors: FieldErrors = {};
        for (const [field, value] of Object.entries(responseData.fieldErrors || {})) {
          if (
            ["name", "email", "phone", "restaurant", "commercialContactRequested", "form"].includes(field)
            && typeof value === "string"
          ) {
            fieldErrors[field as GuideField] = value;
          }
        }
        snapshot.current = null;
        setHasSnapshot(false);
        setMessage(responseData.error || "Revise os campos destacados.");
        showErrors(fieldErrors);
        return;
      }

      if (!postResponse.ok || responseData.success !== true || !isGuideState(responseData.state)) {
        throw new Error(messageFromResponse(responseData, postResponse.status));
      }

      completed.current = true;
      setReceiptContact({ name: firstName(nextSnapshot.name), email: nextSnapshot.email });
      setReceiptState(responseData.state);
      // Pedido gravado no servidor: um evento, sem campos. O gate de ambiente e
      // a allowlist anti-PII ficam em track()/tracking-events.mjs.
      track(TRACKING_EVENTS.cmvGuideRequest);
    } catch (problem) {
      setMessage(
        problem instanceof Error && problem.name !== "AbortError"
          ? problem.message
          : "Não foi possível confirmar agora. Seus dados permanecem nesta página; tente novamente.",
      );
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  }

  const readOnly = busy || hasSnapshot || Boolean(receiptState);
  const fieldProps = (field: keyof GuideValues) => ({
    id: fieldId(field),
    value: values[field],
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => change(field, event.target.value),
    "aria-invalid": errors[field] ? true : undefined,
    "aria-describedby": errors[field] ? errorId(field) : undefined,
  });
  const fieldError = (field: GuideField) =>
    errors[field] ? <p className={styles.fieldError} id={errorId(field)}>{errors[field]}</p> : null;
  const copy = CMV_GUIDE_CONTENT.form;

  return (
    <section className={styles.formSection} id="cmv-guide-form" aria-labelledby="cmv-guide-form-title">
      <div className={styles.formGrid}>
        <div className={styles.formIntro}>
          <p className={styles.formEyebrow}>{copy.eyebrow}</p>
          <h2 id="cmv-guide-form-title">
            {copy.title.before}
            <em>{copy.title.highlight}</em>
            {copy.title.after}
          </h2>
          <p>{copy.description}</p>
        </div>

        <div className={styles.pack} aria-hidden="true">
          <Image
            className={styles.packCover}
            src="/brand/cmv-guide/guia-cmv-capa-v1.webp"
            alt=""
            width={360}
            height={509}
          />
          <div className={styles.packSheet}>
            <div className={styles.packSheetHead}>
              <span>{copy.preview.sheetTitle}</span>
              <span>{copy.preview.sheetTabs}</span>
            </div>
            <table>
              <tbody>
                {copy.preview.rows.map(([label, value]) => (
                  <tr key={label}>
                    <td>{label}</td>
                    <td>{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <span className={styles.packBadge}>{copy.preview.badge}</span>
          <small className={styles.packCaption}>{copy.preview.caption}</small>
        </div>

        <div className={styles.inside}>
          <h3>{copy.insideTitle}</h3>
          <ul>
            {copy.inside.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <ol className={styles.steps} aria-label="Como funciona">
            {copy.steps.map((step) => (
              <li key={step.number}>
                <span>{step.number}</span>
                {step.text}
              </li>
            ))}
          </ol>
        </div>

        <div className={styles.formCard}>
          {receiptState ? (
            <div className={styles.status} role="status" aria-live="polite">
              <span className={styles.statusMark} aria-hidden="true">✓</span>
              <h3 ref={receiptHeading} tabIndex={-1}>{statusTitle(receiptState, receiptContact?.name || "")}</h3>
              {ON_ITS_WAY.includes(receiptState) ? (
                <>
                  <p>
                    O guia e a planilha seguem para <strong className={styles.statusEmail}>{receiptContact?.email}</strong> e devem chegar em alguns minutos, enviados por <strong>{copy.card.sender}</strong>. Se não aparecer na caixa de entrada, confira Promoções ou Spam.
                  </p>
                  <div className={styles.prep}>
                    <p className={styles.prepTitle}>{copy.success.prepTitle}</p>
                    <ul>
                      {copy.success.prepItems.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                    <p className={styles.prepNote}>{copy.success.prepNote}</p>
                  </div>
                  <Link className={styles.statusLink} href="/calculadora-cmv/">{copy.success.calculatorLabel}</Link>
                </>
              ) : (
                <p>{statusFallbackBody(receiptState)}</p>
              )}
            </div>
          ) : (
            <form onSubmit={submit} noValidate aria-busy={busy}>
              <div className={styles.formHeading}>
                <h3>{copy.card.title}</h3>
                <p>{copy.card.description}</p>
              </div>

              <fieldset className={styles.fields} disabled={readOnly}>
                <legend className="sr-only">Dados para receber o guia CMV</legend>
                <div className={styles.field}>
                  <label htmlFor={fieldId("name")}>Seu nome</label>
                  <input {...fieldProps("name")} autoComplete="name" placeholder="Como podemos te chamar" maxLength={120} required />
                  {fieldError("name")}
                </div>
                <div className={styles.field}>
                  <label htmlFor={fieldId("email")}>Seu melhor e-mail</label>
                  <input {...fieldProps("email")} type="email" autoComplete="email" placeholder="voce@restaurante.com.br" maxLength={254} required />
                  {fieldError("email")}
                </div>
                <div className={styles.field}>
                  <label htmlFor={fieldId("phone")}>Telefone com DDD</label>
                  <input
                    {...fieldProps("phone")}
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="(11) 99999-9999"
                    maxLength={24}
                    required
                  />
                  {fieldError("phone")}
                </div>
                <div className={styles.field}>
                  <label htmlFor={fieldId("restaurant")}>Nome do restaurante</label>
                  <input {...fieldProps("restaurant")} autoComplete="organization" placeholder="Ex.: Cantina do Bairro" maxLength={120} required />
                  {fieldError("restaurant")}
                </div>
              </fieldset>

              <label className={styles.commercial} htmlFor={fieldId("commercialContactRequested")}>
                <input
                  id={fieldId("commercialContactRequested")}
                  type="checkbox"
                  checked={commercialContactRequested}
                  disabled={readOnly}
                  onChange={(event) => setCommercialContactRequested(event.target.checked)}
                />
                <span>Quero que a Rook entre em contato para conversar sobre a gestão do meu restaurante. <strong>(opcional)</strong></span>
              </label>

              <p className={styles.privacy}>
                Ao solicitar o material, você concorda com o tratamento dos dados para esta finalidade, conforme a <Link href="/privacidade/">Política de Privacidade</Link>.
              </p>

              {message && <div className={styles.error} role="alert">{message}</div>}
              {hasSnapshot && !busy && (
                <p className={styles.retryNote}>
                  Mantivemos os mesmos dados e o mesmo identificador para tentar esta solicitação novamente.
                </p>
              )}
              <button className={styles.submit} type="submit" disabled={busy || !ready}>
                <span>{busy ? "Registrando seu pedido…" : hasSnapshot ? "Tentar enviar novamente" : copy.card.submit}</span>
                <span aria-hidden="true">↗</span>
              </button>
              {!hasSnapshot && (
                <>
                  <p className={styles.trust}>{copy.card.trust}</p>
                  <p className={styles.sender}>Enviado por <strong>{copy.card.sender}</strong> em alguns minutos.</p>
                </>
              )}
              {hasSnapshot && !busy && (
                <button className={styles.editButton} type="button" onClick={resetSnapshotForEditing}>
                  Editar dados e iniciar outra solicitação
                </button>
              )}
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
