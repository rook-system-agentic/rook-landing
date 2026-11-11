/**
 * LP de Black Friday `/bl1/` (ROO-1825): o destino do CTA e a data.
 *
 * POR QUE UM MÓDULO SÓ PARA ISSO
 *
 * A página inteira existe para um clique: entrar na comunidade da Rook no
 * WhatsApp. O link aparece no hero, no CTA final e no cabeçalho; repetido em
 * três lugares, um convite trocado (o WhatsApp permite redefinir o link) fica
 * certo em dois e quebrado no terceiro. Aqui é o único lugar.
 *
 * DESTINO: O GRUPO "BLACK ROOK 2026", NÃO O CONVITE DA COMUNIDADE
 * (decisão do Gabriel, 11/11/2026 17:43). A /bl1 é a porta da Black Friday;
 * o convite da comunidade "Rook Insights - Bares e Restaurantes" abria a
 * comunidade inteira e deixava a pessoa escolher o grupo. O convite do grupo
 * leva direto ao Black Rook 2026 e, por ser grupo de comunidade, também põe a
 * pessoa na comunidade e no grupo Avisos (FAQ do WhatsApp: "When you're in a
 * community, you're always added to community Announcements"). O nome da
 * constante ficou `BF1_COMMUNITY_URL` para não espalhar renome; o valor é o
 * convite do grupo. A trava contra voltar ao convite da comunidade está em
 * `tests/bf1-community.test.mjs`.
 *
 * Sem convite válido, `BF1_COMMUNITY_URL` fica `null` e o CTA aparece como
 * "Link da comunidade em breve" — nunca um link para lugar nenhum.
 *
 * Duas datas, uma função cada (decisão de 11/11, feedback da Gabriela):
 * - `BF1_EARLY_ACCESS_START` (quinta, 26/11): o acesso antecipado da
 *   comunidade. É o destaque da página e o alvo da contagem, porque a página
 *   existe para a pessoa entrar ANTES dele.
 * - `BF1_BLACK_FRIDAY_START` (sexta, 27/11): a abertura para o público,
 *   mostrada como linha secundária.
 * A hora do acesso antecipado ainda não foi definida pelo Gabriel; até lá vale
 * 00h00 de 26/11. Trocar aqui e no teste, em nenhum outro lugar.
 *
 * A contagem é decorativa: a data escrita na página é a informação; os números que correm só aparecem depois
 * que o JavaScript monta, então uma página servida dias antes nunca mostra uma
 * contagem velha.
 */

/**
 * Convite do grupo "Black Rook 2026" (comunidade Rook Insights), lido em
 * "Convidar via link" no WhatsApp Web em 11/11/2026 17:46; og:title do convite
 * confere "Black Rook 2026". Redefinir o link no WhatsApp invalida este valor.
 */
export const BF1_COMMUNITY_URL = "https://chat.whatsapp.com/DBVioSBnT9O4cPDpIlfXCP";

/** Abertura da Black Friday 2026 para o público, horário de Brasília. */
export const BF1_BLACK_FRIDAY_START = "2026-11-27T00:00:00-03:00";
/** Acesso antecipado da comunidade (alvo da contagem), horário de Brasília. */
export const BF1_EARLY_ACCESS_START = "2026-11-26T00:00:00-03:00";

/**
 * Destino registrado no `cta_click`. Valor fixo, sem dado pessoal. Mantido
 * igual após a troca para o grupo, para não quebrar a série do GA4/GTM.
 */
export const BF1_TRACKING_DESTINATION = "bf1_whatsapp_community";

const CONVITE_WHATSAPP = /^https:\/\/chat\.whatsapp\.com\/[A-Za-z0-9]{16,40}$/;

/**
 * Estado do CTA a partir do link configurado.
 * Qualquer coisa que não seja um convite do WhatsApp vira "em breve".
 */
export function communityLink(url = BF1_COMMUNITY_URL) {
  if (typeof url !== "string" || !CONVITE_WHATSAPP.test(url)) {
    return { ready: false, href: null };
  }
  return { ready: true, href: url };
}

/** Partes da contagem regressiva até `targetIso`. `done` depois da data. */
export function countdownParts(nowMs, targetIso = BF1_EARLY_ACCESS_START) {
  const alvo = Date.parse(targetIso);
  const restante = alvo - nowMs;
  if (!Number.isFinite(restante) || restante <= 0) {
    return { done: true, days: 0, hours: 0, minutes: 0, seconds: 0 };
  }
  const total = Math.floor(restante / 1000);
  return {
    done: false,
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  };
}
