/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  images: { unoptimized: true },
  // Empacota só o necessário para rodar, com as dependências resolvidas — é o
  // que permite a imagem de homologação ser pequena e não carregar o
  // node_modules inteiro. Não afeta a Vercel, que ignora este modo.
  output: "standalone",
};

export default nextConfig;
