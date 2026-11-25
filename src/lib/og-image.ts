/**
 * A imagem de compartilhamento do site.
 *
 * POR QUE ISTO EXISTE (24/08/2026 — incidente)
 *
 * O site não declarava `og:image` em lugar nenhum. Colado no LinkedIn, o link
 * do Rook aparecia com o LOGO DA OMIE.
 *
 * O motivo é específico e vale registrar, porque a armadilha volta: sem
 * `og:image`, o scraper varre a página e escolhe uma imagem sozinho. As duas
 * primeiras do documento são os logos do Rook em `.webp`, formato que o
 * scraper do LinkedIn não consome; a terceira é `/partners/omie.png` — o
 * primeiro PNG. O compartilhamento do Rook anunciava um parceiro.
 *
 * A SEGUNDA armadilha, que este módulo existe para fechar: no Next, uma página
 * que declara `openGraph` SUBSTITUI o objeto do layout inteiro, sem merge campo
 * a campo. Cada página com metadata própria precisa repetir a imagem — e
 * repetir um literal em cinco arquivos é como o primeiro defeito nasce de novo.
 * Aqui é um lugar só.
 *
 * A arte vive em `public/og/`, e não em `public/brand/`, de propósito: o teste
 * de performance limita arte de marca a 20 KB porque ela é baixada por todo
 * visitante. Esta nunca é carregada pela página — só por scraper — e 20 KB
 * inviabilizariam 1200×630 legível. É PNG, e não WebP, pelo mesmo motivo que
 * causou o problema original.
 *
 * A trava está em `tests/og-image.test.mjs`.
 */

/** Caminho da arte. Relativo: o `metadataBase` do layout resolve para absoluto. */
export const OG_IMAGE_PATH = "/og/rook-og.png";

/** Descritor completo, para o campo `openGraph.images`. */
export const OG_IMAGE = {
  url: OG_IMAGE_PATH,
  width: 1200,
  height: 630,
  alt: "Rook — Faturar não é lucrar.",
  type: "image/png",
} as const;

/**
 * Arte da Rook Health (`/health/`), em Floresta. (25/11/2026)
 *
 * Quem cola o link da Health num grupo de médicos não pode ver "Faturar não é
 * lucrar" e a palavra "restaurante": a arte é o primeiro texto da página que a
 * pessoa lê. Mesmas regras da arte principal — PNG, 1200×630, em `public/og/`.
 */
export const HEALTH_OG_IMAGE = {
  url: "/og/rook-health-og.png",
  width: 1200,
  height: 630,
  alt: "Rook Health — Atender não é receber.",
  type: "image/png",
} as const;

/**
 * Ícones da aba em `/health/`: o mesmo losango, em Floresta.
 *
 * O layout não declara `icons` (o navegador pega `/favicon.ico` sozinho), então
 * declarar aqui só nesta rota troca o ícone da Health sem tocar o resto do site.
 * Ficam em `public/health/`, com nome próprio: arquivo de `public/` tem cache
 * de 30 dias, e reaproveitar o nome do favicon da Rook prenderia o antigo.
 */
export const HEALTH_ICONS = {
  icon: [
    { url: "/health/favicon.ico", sizes: "48x48" },
    { url: "/health/icon-192.png", type: "image/png", sizes: "192x192" },
  ],
  apple: [{ url: "/health/apple-touch-icon.png", sizes: "180x180" }],
};

/**
 * Cartão do Twitter/X.
 *
 * `summary_large_image` e não `summary`: o `summary` recorta num quadrado
 * pequeno, e a arte é 1200×630. Com o recorte errado, a frase some.
 */
export const TWITTER_CARD = "summary_large_image" as const;
