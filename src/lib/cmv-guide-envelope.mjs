import { createHash } from "node:crypto";

export const CMV_GUIDE_MATERIAL_VERSION = "cmv-guide-v2";
export const CMV_GUIDE_SUBJECT = "Seu Guia Prático de CMV + planilha da Rook";
export const CMV_GUIDE_IDEMPOTENCY_PREFIX = "cmv-guide-v2";

export const CMV_GUIDE_MANIFEST = Object.freeze([
  Object.freeze({
    objectPath: "cmv-guide-v2/Guia_Pratico_CMV_Rook.pdf",
    filename: "Guia_Pratico_CMV_Rook.pdf",
    sha256: "a856f3a96bcb49721f6f25685ff33864438107e050606d834385cfb3ce135b7a",
    bytes: 237658,
  }),
  Object.freeze({
    objectPath: "cmv-guide-v2/Planilha_Apoio_Guia_Pratico_CMV_Rook.xlsx",
    filename: "Planilha_Apoio_Guia_Pratico_CMV_Rook.xlsx",
    sha256: "02dadc3fa73a43f319da50ff4ba8f69b2b9aadd6fc25379d10adf9ea9294f5c4",
    bytes: 35909,
  }),
]);

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function firstName(value) {
  return value.trim().split(/\s+/u)[0] || "";
}

function canonicalJson(value) {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

export function sha256Hex(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

export function verifyCmvGuideMaterial(material, manifestEntry) {
  if (!material || !manifestEntry || !(material.bytes instanceof Uint8Array)) return false;
  return material.bytes.byteLength === manifestEntry.bytes
    && sha256Hex(material.bytes) === manifestEntry.sha256;
}

export function buildCmvGuideEmail({ request, recordKind, requestId, from, replyTo, attachments }) {
  if (!request || !requestId || !["test", "live"].includes(recordKind) || !from || !Array.isArray(attachments)) {
    throw new Error("invalid_cmv_guide_envelope_input");
  }
  const name = firstName(request.name);
  const safeName = escapeHtml(name);
  const greeting = `Olá, ${name}.`;
  const text = [
    greeting,
    "",
    "Aqui estão os materiais que você solicitou para acompanhar o CMV do seu restaurante:",
    "",
    "Guia Prático de CMV — PDF e Planilha de Apoio — Excel, anexados a este email.",
    "",
    "Comece pela aba “Leia-me” da planilha. Os valores são exemplos, não benchmarks: substitua pelos dados da sua operação e mantenha a mesma base de comparação.",
    "",
    "Lembrete: CMV real = estoque inicial + compras − estoque final.",
    "",
    "Rook — Visão, Estratégia e Controle para bares e restaurantes.",
  ].join("\n");
  const html = [
    "<!doctype html><html lang=\"pt-BR\"><body>",
    `<p>Olá, ${safeName}.</p>`,
    "<p>Aqui estão os materiais que você solicitou para acompanhar o CMV do seu restaurante:</p>",
    "<p><strong>Guia Prático de CMV — PDF</strong> e <strong>Planilha de Apoio — Excel</strong>, anexados a este email.</p>",
    "<p>Comece pela aba <strong>Leia-me</strong> da planilha. Os valores são exemplos, não benchmarks: substitua pelos dados da sua operação e mantenha a mesma base de comparação.</p>",
    "<p><strong>Lembrete:</strong> CMV real = estoque inicial + compras − estoque final.</p>",
    "<p>Rook — Visão, Estratégia e Controle para bares e restaurantes.</p>",
    "</body></html>",
  ].join("");
  const payload = {
    from,
    to: [request.email],
    subject: CMV_GUIDE_SUBJECT,
    html,
    text,
    attachments: attachments.map(({ filename, content }) => ({ filename, content })),
    ...(replyTo ? { reply_to: replyTo } : {}),
  };
  const idempotencyKey = `${CMV_GUIDE_IDEMPOTENCY_PREFIX}/${recordKind}/${requestId}`;
  return Object.freeze({
    payload: Object.freeze(payload),
    idempotencyKey,
    envelopeHash: sha256Hex(Buffer.from(canonicalJson(payload), "utf8")),
    materialVersion: CMV_GUIDE_MATERIAL_VERSION,
  });
}
