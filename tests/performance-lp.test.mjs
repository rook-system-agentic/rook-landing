/**
 * Guardas de performance da LP (ROO-1124).
 *
 * Cada teste aqui trava uma regressão que JÁ ACONTECEU e que não aparece em
 * nenhum outro lugar: o `tsc` não vê, o `next build` não vê, e a tela continua
 * bonita. Só o PageSpeed acusa, semanas depois, quando alguém lembra de rodar.
 *
 * Os testes leem o CÓDIGO-FONTE, e não o build. É de propósito: o que se quer
 * proteger é a decisão escrita no arquivo, e ela precisa quebrar no momento em
 * que é desfeita, não no deploy.
 */
import assert from "node:assert/strict";
import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

async function arquivosDe(dir, extensoes) {
  const encontrados = [];
  async function andar(atual) {
    for (const entrada of await readdir(atual, { withFileTypes: true })) {
      const completo = path.join(atual, entrada.name);
      if (entrada.isDirectory()) await andar(completo);
      else if (extensoes.some((e) => entrada.name.endsWith(e))) encontrados.push(completo);
    }
  }
  await andar(dir);
  return encontrados;
}

const relativo = (p) => path.relative(RAIZ, p);

/**
 * Apaga comentários de bloco preservando quebras de linha (para o número da
 * linha continuar batendo no relatório de erro).
 *
 * Sem isto os testes acusam a si mesmos: os comentários que explicam cada
 * decisão citam textualmente o trecho proibido — é o que os torna úteis para
 * quem for mexer depois.
 */
function semComentarios(conteudo) {
  return conteudo.replace(/\/\*[\s\S]*?\*\//g, (bloco) => bloco.replace(/[^\n]/g, " "));
}

/*
 * `beforeInteractive` faz o Next injetar o script no <head> e BLOQUEAR a
 * renderização até ele baixar e executar. Nenhuma tag de medição precisa
 * disso: analytics, pixel de anúncio e gravador de sessão medem igual carregando
 * depois, e carregar antes atrasa a primeira tela de quem chegou pelo anúncio
 * que a tag deveria medir.
 */
test("nenhuma tag de terceiro usa strategy beforeInteractive", async () => {
  const arquivos = await arquivosDe(path.join(RAIZ, "src"), [".tsx", ".ts"]);
  const infratores = [];
  for (const arquivo of arquivos) {
    const conteudo = await readFile(arquivo, "utf8");
    if (conteudo.includes('strategy="beforeInteractive"')) infratores.push(relativo(arquivo));
  }
  assert.deepEqual(infratores, [], `beforeInteractive bloqueia a renderização — use afterInteractive ou lazyOnload em: ${infratores.join(", ")}`);
});

/*
 * O Clarity é gravador de sessão e mapa de calor, não pixel de conversão. Foi
 * medido em 17/08/2026 abrindo quatro hosts (www./scripts./c./i..clarity.ms) —
 * um terço de todos os hosts de terceiro da home. Ele espera a página pintar.
 */
test("Microsoft Clarity carrega em lazyOnload", async () => {
  const conteudo = await readFile(path.join(RAIZ, "src/components/MicrosoftClarity.tsx"), "utf8");
  assert.match(conteudo, /strategy="lazyOnload"/);
});

/*
 * Escrito como <img> de JSX dentro de <noscript>, o varredor do Next emitia
 * `<link rel="preload" as="image">` para o facebook.com como PRIMEIRA tag do
 * <head> — na frente da folha de estilo. Também fazia o PageView do Meta ser
 * contado duas vezes. O pixel de fallback tem que ir como HTML cru.
 */
test("o pixel <noscript> do Meta não é um <img> que o Next possa pré-carregar", async () => {
  const conteudo = semComentarios(
    await readFile(path.join(RAIZ, "src/components/MetaPixel.tsx"), "utf8"),
  );
  assert.match(conteudo, /<noscript\s+dangerouslySetInnerHTML/);
  assert.doesNotMatch(
    conteudo,
    /<noscript>[\s\S]*<img/,
    "<img> de JSX dentro de <noscript> vira preload de imagem no <head>",
  );
});

/*
 * Sem estes cabeçalhos, tudo que sai de `public/` é servido com
 * `max-age=0, must-revalidate` — medido em produção em 17/08/2026. O navegador
 * já tem o logo e mesmo assim pergunta de novo a cada visita.
 */
test("next.config declara cache para os arquivos estáticos de public/", async () => {
  const conteudo = await readFile(path.join(RAIZ, "next.config.mjs"), "utf8");
  assert.match(conteudo, /source: "\/brand\/:path\*"/);
  assert.match(conteudo, /source: "\/partners\/:path\*"/);
  assert.match(conteudo, /max-age=2592000/);
});

/*
 * `images: { unoptimized: true }` está ligado (a imagem de homologação em k3s
 * não roda o otimizador do Next). Com ele, `next/image` é um <img> simples: o
 * arquivo vai para o celular do jeito que está em `public/`. Então o tamanho do
 * arquivo É o tamanho entregue, e um PNG de 1961px para desenhar 40px de altura
 * é 37 KB de download por visita.
 *
 * O limite de 20 KB é folgado de propósito: não é meta de design, é rede de
 * segurança contra alguém devolver um PNG gigante para dentro da marca.
 */
test("nenhuma arte de marca ou de parceiro referenciada no código passa de 20 KB", async () => {
  const LIMITE = 20 * 1024;
  const arquivos = await arquivosDe(path.join(RAIZ, "src"), [".tsx", ".ts"]);
  const referenciados = new Set();
  for (const arquivo of arquivos) {
    const conteudo = await readFile(arquivo, "utf8");
    for (const m of conteudo.matchAll(/"(\/(?:brand|partners)\/[^"]+\.(?:png|webp|jpg|jpeg|svg|avif))"/g)) {
      referenciados.add(m[1]);
    }
  }
  assert.ok(referenciados.size > 0, "nenhuma arte encontrada — o padrão de busca quebrou");

  const pesados = [];
  for (const ref of referenciados) {
    const { size } = await stat(path.join(RAIZ, "public", ref));
    if (size > LIMITE) pesados.push(`${ref} (${(size / 1024).toFixed(1)} KB)`);
  }
  assert.deepEqual(pesados, [], `arte servida ao navegador acima de 20 KB: ${pesados.join(", ")}`);
});

/*
 * O `@import` de fonte estava escrito DEPOIS das diretivas do Tailwind. O
 * Tailwind expande no lugar, então no CSS publicado o @import cai no byte
 * 27.445 de 32.436 — e a especificação manda o navegador ignorar @import que
 * não venha antes de qualquer regra. Verificado no Chrome em 17/08/2026:
 * zero requisições a fonts.googleapis.com; Manrope e JetBrains Mono nunca
 * carregam e o site inteiro renderiza na fonte do sistema.
 *
 * Esta guarda existe para o dia em que alguém notar a fonte errada e "corrigir"
 * movendo o @import para o topo. Isso funcionaria — e colocaria DOIS hosts de
 * terceiro (fonts.googleapis.com e fonts.gstatic.com) no caminho crítico da
 * primeira pintura no celular, piorando o LCP que a ROO-1124 foi aberta para
 * melhorar. O caminho certo é `next/font/google`, que hospeda a fonte junto com
 * o site. Ver docs/performance-lp-roo1124.md.
 */
test("nenhuma fonte é importada por @import de terceiro no CSS", async () => {
  const conteudo = semComentarios(
    await readFile(path.join(RAIZ, "src/app/globals.css"), "utf8"),
  );

  const linhas = conteudo
    .split("\n")
    .map((linha, i) => [i + 1, linha])
    .filter(([, linha]) => /@import[^;]*fonts\.(googleapis|gstatic)\.com/.test(linha));

  assert.deepEqual(
    linhas.map(([n]) => n),
    [],
    "@import de fonte no CSS: use next/font/google — ver docs/performance-lp-roo1124.md",
  );
});
