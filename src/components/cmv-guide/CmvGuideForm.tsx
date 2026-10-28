"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { normalizePhone } from "@/lib/acquisition-input.mjs";
import { CMV_GUIDE_CONTENT } from "@/lib/cmv-guide-content";
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

function statusCopy(state: GuideState) {
  switch (state) {
    case "queued":
      return {
        title: "Solicitação registrada",
        body: "Seu cadastro foi registrado. O guia e a planilha entraram na fila de envio por e-mail e ainda estão pendentes de processamento.",
      };
    case "provider_accepted":
      return {
        title: "Solicitação registrada",
        body: "Seu cadastro foi registrado e o envio foi aceito para processamento. Isso ainda não é uma confirmação de entrega do e-mail.",
      };
    case "delivered":
      return {
        title: "Solicitação registrada",
        body: "Seu cadastro foi registrado e o processamento do envio foi confirmado pelo sistema. O material segue destinado ao e-mail informado.",
      };
    case "failed":
      return {
        title: "Cadastro registrado, envio pendente",
        body: "Seu cadastro foi preservado, mas o envio do material não pôde ser concluído. A equipe precisa reprocessar esta solicitação.",
      };
    case "needs_reconciliation":
      return {
        title: "Cadastro registrado, confirmação pendente",
        body: "Seu cadastro foi preservado, mas a confirmação do envio precisa ser conferida pela equipe. Não há link público para baixar o material.",
      };
  }
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
  const [ready, setReady] = useState(false);
  const submissionId = useRef("");
  const snapshot = useRef<GuideSnapshot | null>(null);
  const inFlight = useRef(false);
  const completed = useRef(false);
  const receiptHeading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    submissionId.current = crypto.randomUUID();
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
      setReceiptState(responseData.state);
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

  return (
    <section className={styles.formSection} id="cmv-guide-form" aria-labelledby="cmv-guide-form-title">
      <div className={styles.formGrid}>
        <div className={styles.formIntro}>
          <p className={styles.sectionEyebrow}>{CMV_GUIDE_CONTENT.form.eyebrow}</p>
          <h2 id="cmv-guide-form-title">{CMV_GUIDE_CONTENT.form.title}</h2>
          <p>{CMV_GUIDE_CONTENT.form.description}</p>
          <p className={styles.formAside}>
            <strong>O que você recebe:</strong> um guia prático e uma planilha editável para começar o cálculo com seus dados. Pedir o material não obriga você a contratar o Rook nem a receber contato comercial.
          </p>
        </div>

        <div className={styles.formCard}>
          {receiptState ? (
            <div className={styles.status} role="status" aria-live="polite">
              <span className={styles.statusMark} aria-hidden="true">✓</span>
              <h3 ref={receiptHeading} tabIndex={-1}>{statusCopy(receiptState).title}</h3>
              <p>{statusCopy(receiptState).body}</p>
            </div>
          ) : (
            <form onSubmit={submit} noValidate aria-busy={busy}>
              <div className={styles.formHeading}>
                <h3>Seus dados para o envio</h3>
                <p>Os quatro campos abaixo são necessários para registrar a solicitação.</p>
              </div>

              <fieldset className={styles.fields} disabled={readOnly}>
                <legend className="sr-only">Dados para receber o guia CMV</legend>
                <div className={styles.field}>
                  <label htmlFor={fieldId("name")}>Nome</label>
                  <input {...fieldProps("name")} autoComplete="name" maxLength={120} required />
                  {fieldError("name")}
                </div>
                <div className={styles.field}>
                  <label htmlFor={fieldId("email")}>E-mail</label>
                  <input {...fieldProps("email")} type="email" autoComplete="email" maxLength={254} required />
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
                <div className={`${styles.field} ${styles.full}`}>
                  <label htmlFor={fieldId("restaurant")}>Nome do restaurante</label>
                  <input {...fieldProps("restaurant")} autoComplete="organization" maxLength={120} required />
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
                <span>Também quero receber contato comercial sobre o Rook.</span>
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
                <span>{busy ? "Registrando solicitação…" : hasSnapshot ? "Tentar enviar novamente" : "Receber guia e planilha por email"}</span>
                <span aria-hidden="true">↗</span>
              </button>
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
