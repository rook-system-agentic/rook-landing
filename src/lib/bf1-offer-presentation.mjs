import { campaignPhase } from "./bf1-community.mjs";
import { DIRECT_CHECKOUT_URL } from "./direct-checkout-link.mjs";

/**
 * ROO-1857: somente o servidor importa este módulo, via bf1-campaign-server.
 * O preço só integra a resposta a partir do lançamento, em 26/11. Não
 * escondemos a oferta com CSS nem enviamos a copy futura para componentes
 * cliente. O checkout é a autoridade de preço e elegibilidade.
 */
export function buildBf1OfferPresentation(nowMs) {
  const phase = campaignPhase(nowMs);
  if (phase === "upcoming") return { phase, offer: null, checkoutHref: null };
  if (phase === "ended") return { phase, offer: null, checkoutHref: null };
  return {
    phase,
    checkoutHref: phase === "public" ? DIRECT_CHECKOUT_URL : null,
    offer: {
      title: "Seu primeiro mês por R$49,90.",
      summary: "Por estabelecimento, nos planos Knight ou Rook. Depois, mensalidade conforme a faixa de faturamento. Chess à parte.",
      period: phase === "early"
        ? "Hoje, 26/11, o acesso é antecipado para a comunidade. A abertura para o público é em 27/11."
        : "A Black Rook continua até 04/12, às 23h59, horário de Brasília.",
      terms: "R$49,90 no primeiro ciclo mensal completo, por estabelecimento, nos planos Knight ou Rook. A partir do segundo mês, vale a mensalidade do plano conforme a faixa de faturamento do seu restaurante. O adicional Chess é cobrado à parte. O valor e a data da próxima cobrança são apresentados antes do pagamento.",
      payment: "Contratação paga, sem teste grátis. Abra o checkout até 04/12, às 23h59 (Brasília). A reserva vale por até uma hora para concluir o pagamento, conforme o prazo mostrado na Stripe. O primeiro ciclo começa após a confirmação do pagamento.",
    },
  };
}
