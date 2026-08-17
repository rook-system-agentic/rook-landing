/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  images: { unoptimized: true },
  // Empacota só o necessário para rodar, com as dependências resolvidas — é o
  // que permite a imagem de homologação ser pequena e não carregar o
  // node_modules inteiro. Não afeta a Vercel, que ignora este modo.
  output: "standalone",

  /**
   * Cabeçalhos.
   *
   * 1) CACHE DOS ARQUIVOS DE `public/` (ROO-1124)
   *
   * Medido em produção em 17/08/2026: tudo que sai de `public/` era servido com
   * `cache-control: public, max-age=0, must-revalidate`. Ou seja, logo, ícone da
   * marca, logos de parceiro e favicons voltavam a ser revalidados a CADA visita
   * — 96 KB de imagem na home que o navegador já tinha e mesmo assim ia
   * perguntar de novo. É a oportunidade "cache" que o PageSpeed aponta.
   *
   * O que o Next gera (`/_next/static/*`) já vem com `immutable` de um ano,
   * porque o nome do arquivo carrega o hash do conteúdo. `public/` não tem esse
   * hash, então o prazo aqui é de 30 dias e não de um ano: pega ~90% do
   * benefício de cache e limita a quanto tempo uma arte trocada ficaria velha
   * na máquina de quem já visitou.
   *
   * ⚠️ Se trocar uma arte da marca e precisar que apareça na hora para quem já
   * visitou, troque também o NOME do arquivo. Sobrescrever mantendo o nome
   * respeita o prazo de 30 dias.
   *
   * 2) NOINDEX EM HOMOLOGAÇÃO
   *
   * Homologação não pode ser indexada: sem isto o Google pode ranquear
   * lp-homolog acima do site real e canibalizar a busca por "Rook System".
   *
   * A primeira tentativa colocou isso no ingress, via `configuration-snippet`,
   * e o admission webhook do ingress-nginx recusou — snippets são desabilitados
   * por padrão nas versões recentes. Aqui é melhor lugar de qualquer forma:
   * viaja com o código, é versionado, e não depende de permissão do cluster.
   *
   * Em produção `NEXT_PUBLIC_ENV` não é definido, então o bloco de noindex não
   * é emitido e nada muda.
   */
  async headers() {
    const cacheEstatico = [
      {
        key: "Cache-Control",
        value: "public, max-age=2592000, stale-while-revalidate=86400",
      },
    ];

    const headers = [
      { source: "/brand/:path*", headers: cacheEstatico },
      { source: "/partners/:path*", headers: cacheEstatico },
      { source: "/:favicon(favicon.*|apple-touch-icon.png|android-chrome-.*\\.png|site.webmanifest)", headers: cacheEstatico },
      { source: "/:og(og-image-.*\\.png|twitter-card.png|banner-.*\\.png|avatar-.*\\.png)", headers: cacheEstatico },
    ];

    if (process.env.NEXT_PUBLIC_ENV === "homolog") {
      headers.push({
        source: "/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      });
    }

    return headers;
  },
};

export default nextConfig;
