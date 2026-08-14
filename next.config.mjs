/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  images: { unoptimized: true },
  // Empacota só o necessário para rodar, com as dependências resolvidas — é o
  // que permite a imagem de homologação ser pequena e não carregar o
  // node_modules inteiro. Não afeta a Vercel, que ignora este modo.
  output: "standalone",

  /**
   * Homologação não pode ser indexada: sem isto o Google pode ranquear
   * lp-homolog acima do site real e canibalizar a busca por "Rook System".
   *
   * A primeira tentativa colocou isso no ingress, via `configuration-snippet`,
   * e o admission webhook do ingress-nginx recusou — snippets são desabilitados
   * por padrão nas versões recentes. Aqui é melhor lugar de qualquer forma:
   * viaja com o código, é versionado, e não depende de permissão do cluster.
   *
   * Em produção `NEXT_PUBLIC_ENV` não é definido, então nenhum cabeçalho extra
   * é emitido e nada muda.
   */
  async headers() {
    if (process.env.NEXT_PUBLIC_ENV !== "homolog") return [];
    return [
      {
        source: "/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
};

export default nextConfig;
