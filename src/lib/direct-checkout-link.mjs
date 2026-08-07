const DIRECT_CHECKOUT_URL = "https://app.rook.com.br/contratar";
const ALLOWED_REVENUE_BANDS = new Set(["knight", "rook"]);

export function buildDirectCheckoutHref(revenueBand) {
  if (!ALLOWED_REVENUE_BANDS.has(revenueBand)) {
    throw new TypeError("Faixa de faturamento inválida para contratação direta.");
  }

  const url = new URL(DIRECT_CHECKOUT_URL);
  url.searchParams.set("revenue_band", revenueBand);
  return url.toString();
}
