/**
 * A copy da /planos é da landing page, não do catálogo de billing.
 *
 * POR QUE ISTO EXISTE (24/08/2026)
 *
 * Até aqui a página exibia `description` e `publicFeatures` vindos do catálogo
 * servido por `app.rook.com.br/api/billing/catalog`. Quatro dessas frases
 * estavam sem acento — "faturamento mensal de ate", "consolidacao
 * multiunidade", "Consolidacao multiunidade" e "Acesso completo a plataforma"
 * — e apareciam assim para o visitante E dentro do JSON-LD que o buscador lê.
 *
 * O conserto óbvio seria corrigir na origem. Ele não existe pelo caminho
 * barato: o texto vive em `billing.offer_versions`, e a release `p0-monthly`
 * v1 está `published`. O trigger `offer_versions_guard` recusa qualquer UPDATE
 * com "Content in a published or retired catalog release is immutable."
 * Corrigir pelo desenho significa publicar uma release nova do catálogo —
 * operação que mexe em `provider_bindings` e no checkout. Caro demais para
 * acerto de acento, e com risco no lugar errado.
 *
 * A saída é separar o que estava junto por acidente. O catálogo continua sendo
 * a fonte do que é COMERCIAL e não pode divergir: preço, limiar de faturamento,
 * dias de teste, quais ofertas existem. O que é TEXTO DE MARKETING passa a
 * morar aqui, junto do resto da copy do site — onde a landing page conserta sem
 * depender de uma release de billing.
 *
 * ⚠️ O QUE NÃO FAZER AQUI: repetir número que o catálogo já entrega. Preço e
 * dias de teste NÃO entram neste arquivo. O "R$ 250 mil" da frase do Knight é a
 * única exceção, porque a frase precisa dele para fazer sentido em português —
 * e ele está amarrado ao catálogo por `tests/planos-copy-propria.test.mjs`. Se
 * o limiar mudar lá, o teste quebra aqui, em vez de a página passar a mentir em
 * silêncio.
 */

/**
 * Limiar que separa Knight de Rook, em centavos.
 *
 * Espelho do `classification.knightMaxMonthlyRevenueCents` do catálogo. Existe
 * só para o teste conseguir comparar a frase com o número oficial — a página
 * NÃO lê este valor para exibir nada; para exibir, ela usa o do catálogo.
 */
export const LIMIAR_KNIGHT_CENTAVOS_ESPERADO = 25_000_000;

/**
 * @typedef {object} CopyDePlano
 * @property {string} descricao Frase de uma linha, exibida sob o nome do plano.
 * @property {readonly string[]} features Bullets do cartão.
 */

/** @type {Readonly<Record<string, CopyDePlano>>} */
export const PLANOS_COPY = Object.freeze({
  knight: Object.freeze({
    descricao:
      "Acesso completo para estabelecimentos com faturamento mensal de até R$ 250 mil.",
    features: Object.freeze(["Acesso completo à plataforma"]),
  }),
  rook: Object.freeze({
    descricao:
      "Acesso completo para estabelecimentos com faturamento mensal acima de R$ 250 mil.",
    features: Object.freeze(["Acesso completo à plataforma"]),
  }),
  chess: Object.freeze({
    descricao: "Add-on organizacional para consolidação multiunidade.",
    features: Object.freeze(["Consolidação multiunidade"]),
  }),
});

/**
 * Copy de um plano pelo código do produto.
 *
 * Devolve `undefined` para código desconhecido, de propósito. Se o billing
 * publicar uma oferta nova antes de alguém escrever a copy dela, a página
 * degrada para o texto do catálogo — que é exatamente o comportamento que ela
 * tinha antes desta mudança, e é melhor que um cartão com a descrição em
 * branco. O barulho fica no CI: `tests/planos-copy-propria.test.mjs` exige que
 * toda oferta do catálogo tenha copy aqui.
 *
 * @param {string} productCode
 * @returns {CopyDePlano | undefined}
 */
export function copyDoPlano(productCode) {
  return PLANOS_COPY[productCode];
}

/**
 * Plano do catálogo -> objeto que a página entrega ao componente de cartões.
 *
 * Faz DUAS coisas, e a segunda é o motivo de existir:
 *
 *   1. Resolve a copy do site, caindo no texto do catálogo se faltar copy.
 *   2. ESTREITA o objeto. `description` e `publicFeatures` do catálogo não
 *      atravessam para o cliente.
 *
 * O (2) não é economia de bytes. Antes disso, o componente de cartões era
 * cliente e recebia o view model inteiro — então o Next serializava o objeto
 * cru dentro do HTML, e as quatro frases sem acento continuavam lá, achaveis
 * com um `grep` no fonte da página, mesmo com o texto visível já corrigido.
 * Parecia conserto pela metade porque era: o dado errado seguia sendo
 * publicado, só não estava sendo pintado.
 *
 * @param {{ productCode: string, displayName: string, formattedPrice: string,
 *           description: string, publicFeatures: readonly string[] }} plano
 */
export function planoParaExibicao(plano) {
  const copy = copyDoPlano(plano.productCode);
  return {
    productCode: plano.productCode,
    displayName: plano.displayName,
    formattedPrice: plano.formattedPrice,
    descricao: copy?.descricao ?? plano.description,
    features: copy?.features ?? plano.publicFeatures,
  };
}

/**
 * Complemento que só faz sentido no dado estruturado, não no cartão.
 *
 * O cartão da /planos já está dentro de uma seção que fala de multiunidade;
 * repetir "para redes e franquias" ali seria redundante. No JSON-LD não há
 * seção nem contexto — o buscador lê a frase sozinha.
 */
const COMPLEMENTO_BUSCADOR = Object.freeze({
  chess: "Para redes e franquias.",
});

/**
 * Descrição do plano para o dado estruturado (JSON-LD do `layout.tsx`).
 *
 * POR QUE ELA NASCE DA MESMA COPY DO CARTÃO
 *
 * Antes desta função, o `layout.tsx` trazia as três frases DIGITADAS À MÃO,
 * junto com o preço, o limiar de faturamento e os dias de teste — tudo em
 * literal, dentro do bloco que vai em TODA página do site e é lido pelo
 * Google. Os valores batiam com o catálogo por coincidência de terem sido
 * escritos no mesmo dia.
 *
 * O dia em que deixassem de bater seria silencioso e caro: a /planos lê o
 * catálogo e mudaria sozinha; o JSON-LD continuaria anunciando o preço
 * antigo para o buscador, em todas as páginas. Preço errado em dado
 * estruturado não é erro de texto — é promessa comercial que a própria
 * página de planos contradiz.
 *
 * `diasDeTeste` vem do catálogo (`trial.durationDays`) e só é passado para os
 * planos-base; o Chess é adicional de organização e não tem teste próprio.
 * Passe `null` e a frase sai sem essa parte.
 *
 * @param {string} productCode
 * @param {number | null} [diasDeTeste]
 * @returns {string | undefined} `undefined` para código sem copy escrita.
 */
export function descricaoParaBuscador(productCode, diasDeTeste = null) {
  const copy = copyDoPlano(productCode);
  if (!copy) return undefined;
  const partes = [copy.descricao];
  const complemento = COMPLEMENTO_BUSCADOR[productCode];
  if (complemento) partes.push(complemento);
  if (typeof diasDeTeste === "number" && diasDeTeste > 0) {
    partes.push(`${diasDeTeste} dias de teste grátis.`);
  }
  return partes.join(" ");
}
