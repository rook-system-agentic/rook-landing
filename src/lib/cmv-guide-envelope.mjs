import { createHash } from "node:crypto";

export const CMV_GUIDE_MATERIAL_VERSION = "cmv-guide-v2";
export const CMV_GUIDE_IDEMPOTENCY_PREFIX = "cmv-guide-v2";

/*
 * ROO-1642 — template v3 do email de entrega (aprovado em 04/11/2026).
 *
 * POR QUE ISTO EXISTE
 *
 * A v2 era uma confirmação de sistema: sem identidade, sem motivo para abrir
 * os anexos agora e sem ponto de partida. A v3 mantém o mesmo contrato
 * transacional e muda só a apresentação:
 *  - assunto com benefício no início e preheader explícito;
 *  - os dois materiais descritos pelo que resolvem;
 *  - três passos para a primeira leitura (a primeira vitória do usuário);
 *  - a conta que o guia ensina, rotulada como exemplo ilustrativo — números
 *    tirados do próprio PDF (pág. 3 e seção 4), nunca benchmark;
 *  - uma ponte passiva para o Rook, sem contato ativo.
 *
 * Regras que NÃO mudam: sem pixel, sem link com UTM ou redirecionamento de
 * tracking, sem newsletter. HTML em tabelas com CSS inline, legível com
 * imagens bloqueadas e muito abaixo do corte do Gmail (~102 KB). A origem dos
 * links e imagens vem de `siteOrigin` (site-origin.ts é a fonte única) e os
 * dados da empresa de `company` (company.ts). O nome do restaurante só aparece
 * no rodapé: "o/a {restaurante}" quebraria a concordância em frase corrida.
 *
 * Mudar qualquer byte do payload muda o envelopeHash. Um pedido que já gravou
 * hash na v2 e for reprocessado na v3 cai em reconciliação: publique a troca de
 * template somente com a fila sem pedidos em processing/provider_accepted.
 */
export const CMV_GUIDE_EMAIL_TEMPLATE_VERSION = "cmv-guide-email-v3";
export const CMV_GUIDE_SUBJECT = "Chegou: seu Guia de CMV + planilha para encontrar as fugas";
export const CMV_GUIDE_PREHEADER =
  "Comece pela aba Leia-me e faça a primeira conta de CMV com os números da sua operação.";

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

const COLOR = Object.freeze({
  page: "#F7F8FA",
  card: "#FFFFFF",
  ink: "#10151C",
  muted: "#5A6675",
  faint: "#8A94A1",
  line: "#E3E7EC",
  terracota: "#C24100",
  ocre: "#E79F4A",
  brown: "#3B2313",
  brownSoft: "#5A3A22",
  sand: "#FBF6F1",
  cream: "#F3E6D8",
  night: "#141B23",
  nightInk: "#EEF3F8",
  nightMuted: "#8FA0B2",
  nightLine: "#33414F",
  green: "#2E7D32",
  greenSoft: "#CFE6D1",
});
const SANS = "Manrope, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
const MONO = "'JetBrains Mono', SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace";

const MATERIALS = Object.freeze([
  Object.freeze({
    title: "Guia Prático de CMV",
    meta: "PDF · 10 páginas",
    body: "A fórmula completa, por que a ficha técnica engana, quanto vale 1 ponto de CMV e um plano para os próximos 30 dias.",
  }),
  Object.freeze({
    title: "Planilha de Apoio",
    meta: "Excel · 6 abas",
    body: "Você preenche as células claras; as verdes calculam sozinhas o CMV do mês, o impacto de cada insumo e o teto de compras da semana.",
  }),
]);

const STEPS = Object.freeze([
  Object.freeze({
    number: "01",
    title: "Abra a planilha na aba Leia-me.",
    body: "Ela mostra a ordem das abas. Os valores preenchidos são exemplos: troque pelos dados da sua operação.",
  }),
  Object.freeze({
    number: "02",
    title: "Escolha de 5 a 10 insumos que mais pesam.",
    body: "Proteínas, queijos, bebidas, óleo, farinha. Na aba Insumos, compare a nota de hoje com a de 3 meses atrás.",
  }),
  Object.freeze({
    number: "03",
    title: "Feche o CMV do mês com a fórmula inteira.",
    body: "Estoque inicial + compras − estoque final, sempre sobre a mesma base de receita. A aba CMV Mensal faz a conta.",
  }),
]);

const BRIDGE_TEXT =
  "No guia, o orçamento semanal de compras é feito à mão. O Rook conecta as vendas, as notas e o banco do restaurante e mostra, todo dia, quanto ainda dá para comprar na semana e onde a margem está escapando.";

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

function parseSiteOrigin(value) {
  if (typeof value !== "string" || value.length === 0) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.username || url.password || url.search || url.hash) return null;
    if (url.pathname !== "/" && url.pathname !== "") return null;
    return { origin: url.origin, host: url.hostname.replace(/^www\./u, "") };
  } catch {
    return null;
  }
}

export function sha256Hex(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

export function verifyCmvGuideMaterial(material, manifestEntry) {
  if (!material || !manifestEntry || !(material.bytes instanceof Uint8Array)) return false;
  return material.bytes.byteLength === manifestEntry.bytes
    && sha256Hex(material.bytes) === manifestEntry.sha256;
}

function eyebrow(text, color = COLOR.terracota) {
  return `<div style="font-family:${MONO};font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${color};margin:0 0 10px 0;">${text}</div>`;
}

function stepRow({ number, title, body }) {
  return `<tr><td style="padding:0 0 18px 0;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>`
    + `<td width="44" valign="top" style="font-family:${MONO};font-size:20px;font-weight:700;color:${COLOR.terracota};line-height:24px;">${number}</td>`
    + `<td valign="top" style="font-family:${SANS};"><div style="font-size:16px;line-height:22px;font-weight:700;color:${COLOR.ink};">${title}</div>`
    + `<div style="font-size:14px;line-height:21px;color:${COLOR.muted};padding-top:4px;">${body}</div></td>`
    + `</tr></table></td></tr>`;
}

function insightRow(label, value, strong = false) {
  return `<tr><td style="font-family:${MONO};font-size:13px;line-height:20px;color:${COLOR.nightMuted};padding:5px 0;">${label}</td>`
    + `<td align="right" style="font-family:${MONO};font-size:${strong ? 15 : 13}px;line-height:20px;color:${strong ? COLOR.ocre : COLOR.nightInk};font-weight:${strong ? 700 : 400};padding:5px 0;white-space:nowrap;">${value}</td></tr>`;
}

function materialRow(visual, { title, meta, body }) {
  return `<tr><td style="padding:0 0 12px 0;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid ${COLOR.line};border-radius:12px;"><tr>`
    + `<td width="96" valign="top" class="vis" style="padding:16px 0 16px 16px;">${visual}</td>`
    + `<td valign="top" style="padding:16px 18px 16px 14px;font-family:${SANS};">`
    + `<div style="font-size:16px;line-height:22px;font-weight:800;color:${COLOR.ink};">${title}</div>`
    + `<div style="font-family:${MONO};font-size:11px;letter-spacing:1px;text-transform:uppercase;color:${COLOR.terracota};padding:3px 0 6px 0;">${meta}</div>`
    + `<div style="font-size:14px;line-height:21px;color:${COLOR.muted};">${body}</div>`
    + `</td></tr></table></td></tr>`;
}

function sheetIcon() {
  const row = `<tr><td style="background:#FFFFFF;height:12px;"></td><td style="background:#FFFFFF;"></td><td style="background:${COLOR.greenSoft};"></td></tr>`;
  return `<table role="presentation" cellpadding="0" cellspacing="2" border="0" width="64" height="64" style="background:${COLOR.green};border-radius:6px;">`
    + `<tr><td colspan="3" height="14" style="background:${COLOR.green};font-family:${MONO};font-size:9px;font-weight:700;color:#FFFFFF;text-align:center;">XLSX</td></tr>`
    + `${row}${row}${row}</table>`;
}

function buildHtml({ name, restaurant, site, company, replyEnabled }) {
  const logo = escapeHtml(`${site.origin}/brand/rook-logo-horizontal-light.png`);
  const cover = escapeHtml(`${site.origin}/brand/cmv-guide/guia-cmv-capa-email-v1.png`);
  const home = escapeHtml(`${site.origin}/`);
  const privacy = escapeHtml(`${site.origin}/privacidade/`);
  const coverImage = `<img src="${cover}" width="64" height="90" alt="Capa do Guia Prático de CMV" style="display:block;border:0;border-radius:4px;width:64px;height:90px;background:${COLOR.brown};color:#FFFFFF;font-family:${SANS};font-size:10px;">`;
  const privacyLink = `<a href="${privacy}" style="color:${COLOR.faint};">Política de Privacidade</a>`;
  const legal = company && company.legalName && company.cnpj
    ? `${escapeHtml(company.legalName)} · CNPJ ${escapeHtml(company.cnpj)} · ${privacyLink}`
    : privacyLink;
  return [
    "<!doctype html>",
    "<html lang=\"pt-BR\"><head>",
    "<meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">",
    "<meta name=\"color-scheme\" content=\"light\"><meta name=\"supported-color-schemes\" content=\"light\">",
    "<title>Seu Guia de CMV + planilha</title>",
    "<!--[if mso]><style>table,td,div{font-family:Arial,sans-serif!important;}</style><![endif]-->",
    "<style>@media only screen and (max-width:480px){.px{padding-left:20px!important;padding-right:20px!important;}.vis{width:76px!important;padding-left:12px!important;}.h1{font-size:26px!important;line-height:32px!important;}}</style>",
    "</head>",
    `<body style="margin:0;padding:0;background:${COLOR.page};-webkit-text-size-adjust:100%;">`,
    `<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:${COLOR.page};">${escapeHtml(CMV_GUIDE_PREHEADER)}&#8199;&#65279;&#847;&#8199;&#65279;&#847;&#8199;&#65279;&#847;</div>`,
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${COLOR.page}" style="background:${COLOR.page};"><tr><td align="center" style="padding:24px 12px;">`,
    "<!--[if mso]><table role=\"presentation\" width=\"600\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\"><tr><td><![endif]-->",
    "<table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" style=\"max-width:600px;\">",
    // Cabeçalho: logo, com alt legível se a imagem for bloqueada.
    `<tr><td style="padding:0 4px 16px 4px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>`,
    `<td valign="middle"><img src="${logo}" width="118" height="40" alt="ROOK — Visão | Estratégia | Controle" style="display:block;border:0;height:40px;width:118px;font-family:${SANS};font-size:16px;font-weight:800;color:${COLOR.brown};"></td>`,
    `<td align="right" valign="middle" style="font-family:${MONO};font-size:10px;letter-spacing:2px;color:${COLOR.muted};text-transform:uppercase;">Guia prático de CMV</td>`,
    "</tr></table></td></tr>",
    // Topo: mesma paleta da capa do guia, para email e anexo parecerem um produto só.
    `<tr><td class="px" bgcolor="${COLOR.brown}" style="background:${COLOR.brown};background-image:linear-gradient(135deg,${COLOR.brown} 0%,${COLOR.brownSoft} 100%);border-radius:16px 16px 0 0;border-top:6px solid ${COLOR.ocre};padding:36px 32px 32px 32px;">`,
    eyebrow("Material prático · PDF + Excel", COLOR.ocre),
    `<div class="h1" style="font-family:${SANS};font-size:30px;line-height:36px;font-weight:800;color:#FFFFFF;margin:0 0 14px 0;">${escapeHtml(name)}, agora você tem o mapa do seu CMV.</div>`,
    `<div style="font-family:${SANS};font-size:16px;line-height:24px;color:${COLOR.cream};margin:0 0 22px 0;">Entenda o número, encontre as fugas e defina quanto pode comprar por semana. Está tudo nos dois anexos deste email.</div>`,
    `<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td bgcolor="${COLOR.ocre}" style="background:${COLOR.ocre};border-radius:999px;padding:7px 14px;font-family:${MONO};font-size:11px;font-weight:700;letter-spacing:1px;color:${COLOR.brown};text-transform:uppercase;">2 anexos neste email</td></tr></table>`,
    "</td></tr>",
    // O que você recebeu.
    `<tr><td class="px" bgcolor="${COLOR.card}" style="background:${COLOR.card};padding:30px 32px 18px 32px;">`,
    eyebrow("— O que você recebeu"),
    "<table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\">",
    materialRow(coverImage, MATERIALS[0]),
    materialRow(sheetIcon(), MATERIALS[1]),
    "</table></td></tr>",
    // Comece por aqui.
    `<tr><td class="px" bgcolor="${COLOR.card}" style="background:${COLOR.card};padding:30px 32px 12px 32px;border-top:1px solid ${COLOR.line};">`,
    eyebrow("— Comece por aqui"),
    `<div style="font-family:${SANS};font-size:22px;line-height:28px;font-weight:800;color:${COLOR.ink};margin:0 0 20px 0;">Três passos para a primeira leitura</div>`,
    "<table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\">",
    ...STEPS.map(stepRow),
    "</table></td></tr>",
    // A conta do guia: exemplo ilustrativo com os números do próprio PDF.
    `<tr><td class="px" bgcolor="${COLOR.card}" style="background:${COLOR.card};padding:6px 32px 30px 32px;">`,
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${COLOR.night}" style="background:${COLOR.night};border-radius:14px;">`,
    `<tr><td style="padding:22px 22px 8px 22px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>`,
    `<td style="font-family:${MONO};font-size:11px;letter-spacing:2px;color:${COLOR.ocre};text-transform:uppercase;">A conta do guia</td>`,
    `<td align="right" style="font-family:${MONO};font-size:10px;letter-spacing:1px;color:${COLOR.nightMuted};text-transform:uppercase;">Exemplo ilustrativo</td>`,
    "</tr></table></td></tr>",
    `<tr><td style="padding:6px 22px 4px 22px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">`,
    insightRow("Muçarela", "R$ 30 → R$ 36/kg"),
    insightRow("Diferença por pizza (300 g)", "+ R$ 1,80"),
    insightRow("Em 1.000 pizzas por mês", "+ R$ 1.800", true),
    `<tr><td colspan="2" style="border-top:1px dashed ${COLOR.nightLine};font-size:0;line-height:0;padding:6px 0 0 0;">&nbsp;</td></tr>`,
    insightRow("1 ponto de CMV em R$ 400 mil/mês", "R$ 4.000/mês"),
    insightRow("2 pontos em 12 meses", "R$ 96.000", true),
    "</table></td></tr>",
    `<tr><td style="padding:10px 22px 22px 22px;font-family:${SANS};font-size:13px;line-height:20px;color:${COLOR.nightMuted};">Nenhum desses números é benchmark. A planilha faz a mesma conta com os seus insumos e o seu faturamento.</td></tr>`,
    "</table></td></tr>",
    // Ponte passiva para o Rook: link limpo, sem UTM nem redirecionamento.
    `<tr><td class="px" bgcolor="${COLOR.sand}" style="background:${COLOR.sand};padding:28px 32px 30px 32px;border-top:1px solid ${COLOR.line};">`,
    eyebrow("— Depois da planilha"),
    `<div style="font-family:${SANS};font-size:20px;line-height:27px;font-weight:800;color:${COLOR.ink};margin:0 0 10px 0;">Quer essa leitura todo dia, sem planilha?</div>`,
    `<div style="font-family:${SANS};font-size:15px;line-height:23px;color:${COLOR.muted};margin:0 0 20px 0;">${BRIDGE_TEXT}</div>`,
    `<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td bgcolor="${COLOR.terracota}" style="background:${COLOR.terracota};border-radius:10px;">`,
    `<a href="${home}" style="display:inline-block;padding:13px 22px;font-family:${SANS};font-size:15px;font-weight:700;color:#FFFFFF;text-decoration:none;">Conhecer o Rook ↗</a>`,
    "</td></tr></table></td></tr>",
    // Rodapé: motivo do envio, sem newsletter, dados da empresa.
    `<tr><td class="px" bgcolor="${COLOR.card}" style="background:${COLOR.card};border-radius:0 0 16px 16px;padding:22px 32px 26px 32px;border-top:1px solid ${COLOR.line};font-family:${SANS};font-size:13px;line-height:20px;color:${COLOR.muted};">`,
    replyEnabled ? `<div style="color:${COLOR.ink};font-weight:700;margin:0 0 6px 0;">Dúvida sobre a planilha? Responda este email.</div>` : "",
    `<div style="margin:0 0 14px 0;">Você recebeu este email porque pediu o Guia Prático de CMV${restaurant ? ` para <strong style="color:${COLOR.ink};">${escapeHtml(restaurant)}</strong>` : ""} em ${escapeHtml(site.host)}. Pedir o material não inscreve você em newsletter.</div>`,
    `<div style="font-family:${MONO};font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:${COLOR.ink};">Rook — Visão, Estratégia e Controle</div>`,
    `<div style="font-size:11px;line-height:17px;color:${COLOR.faint};padding-top:4px;">${legal}</div>`,
    "</td></tr>",
    "</table>",
    "<!--[if mso]></td></tr></table><![endif]-->",
    "</td></tr></table>",
    "</body></html>",
  ].join("");
}

function buildText({ name, restaurant, site, replyEnabled }) {
  return [
    `${name}, agora você tem o mapa do seu CMV.`,
    "",
    "Entenda o número, encontre as fugas e defina quanto pode comprar por semana. Está tudo nos dois anexos deste email.",
    "",
    "O QUE VOCÊ RECEBEU",
    ...MATERIALS.map(({ title, meta, body }) => `- ${title} (${meta}): ${body}`),
    "",
    "COMECE POR AQUI",
    "1. Abra a planilha na aba Leia-me. Os valores preenchidos são exemplos: troque pelos dados da sua operação.",
    "2. Escolha de 5 a 10 insumos que mais pesam e, na aba Insumos, compare a nota de hoje com a de 3 meses atrás.",
    "3. Feche o CMV do mês com a fórmula inteira: estoque inicial + compras − estoque final, sempre sobre a mesma base de receita.",
    "",
    "A CONTA QUE O GUIA ENSINA (exemplo ilustrativo)",
    "Muçarela de R$ 30 para R$ 36/kg = + R$ 1,80 por pizza de 300 g = + R$ 1.800 por mês em 1.000 pizzas.",
    "1 ponto de CMV em R$ 400 mil/mês = R$ 4.000/mês; 2 pontos em 12 meses = R$ 96.000.",
    "Nenhum desses números é benchmark. A planilha faz a mesma conta com os seus insumos e o seu faturamento.",
    "",
    "DEPOIS DA PLANILHA",
    BRIDGE_TEXT,
    `Conhecer o Rook: ${site.origin}/`,
    "",
    ...(replyEnabled ? ["Dúvida sobre a planilha? Responda este email.", ""] : []),
    `Você recebeu este email porque pediu o Guia Prático de CMV${restaurant ? ` para ${restaurant}` : ""} em ${site.host}. Pedir o material não inscreve você em newsletter.`,
    "Rook — Visão, Estratégia e Controle para bares e restaurantes.",
  ].join("\n");
}

export function buildCmvGuideEmail({ request, recordKind, requestId, from, replyTo, attachments, siteOrigin, company }) {
  const site = parseSiteOrigin(siteOrigin);
  if (!request || !requestId || !["test", "live"].includes(recordKind) || !from || !Array.isArray(attachments) || !site) {
    throw new Error("invalid_cmv_guide_envelope_input");
  }
  const name = firstName(String(request.name || ""));
  const restaurant = String(request.restaurant || "").trim();
  const replyEnabled = Boolean(replyTo);
  const payload = {
    from,
    to: [request.email],
    subject: CMV_GUIDE_SUBJECT,
    html: buildHtml({ name, restaurant, site, company, replyEnabled }),
    text: buildText({ name, restaurant, site, replyEnabled }),
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
