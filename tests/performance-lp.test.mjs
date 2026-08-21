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
    const conteudo = semComentarios(await readFile(arquivo, "utf8"));

    // Um `<Script beforeInteractive>` INLINE de primeira parte é legítimo e às
    // vezes obrigatório: o bootstrap do dataLayer precisa existir antes do
    // contêiner GTM, senão o contêiner não sabe em que página está. O que a
    // regra proíbe é BAIXAR script de terceiro nessa posição — aí a rede de
    // outro host entra na frente da pintura da tela.
    const blocos = conteudo.match(/<Script[^>]*strategy="beforeInteractive"[^>]*>/g) || [];
    for (const bloco of blocos) {
      const carregaDeFora = /\bsrc=/.test(bloco);
      if (carregaDeFora) infratores.push(`${relativo(arquivo)} → ${bloco.slice(0, 80)}`);
    }
  }
  assert.deepEqual(infratores, [], `beforeInteractive com src de terceiro bloqueia a renderização — use afterInteractive ou lazyOnload em: ${infratores.join(", ")}`);
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
 * ACOPLAMENTO INVISÍVEL COM O CLOUDFLARE (ROO-1124, 21/08/2026).
 *
 * O HTML das páginas passou a ser cacheado na borda do Cloudflare por uma Cache
 * Rule cuja expressão é:
 *
 *   ends_with(http.request.uri.path, "/") and not starts_with(..., "/api/")
 *
 * Ela distingue "página" de "arquivo" pela BARRA FINAL, e a barra final só
 * existe porque `trailingSlash: true` está aqui. Tirar essa linha faz as URLs
 * de página deixarem de terminar em `/`, a regra deixa de casar, e o HTML volta
 * a fazer round trip até `iad1` a cada visita — sem erro, sem teste vermelho e
 * sem nada na tela. Só o TTFB triplica.
 *
 * Este teste é o único lugar do repositório onde essa regra existe escrita, já
 * que ela mora no painel do Cloudflare e não no código. Se `trailingSlash` tiver
 * que sair, a Cache Rule tem que ser reescrita ANTES.
 */
test("trailingSlash continua ligado — a Cache Rule do Cloudflare depende dele", async () => {
  const conteudo = semComentarios(
    await readFile(path.join(RAIZ, "next.config.mjs"), "utf8"),
  );
  assert.match(
    conteudo,
    /trailingSlash:\s*true/,
    "trailingSlash: true foi removido — a Cache Rule do Cloudflare casa páginas pela barra final e vai parar de cachear o HTML. Ver docs/performance-lp-roo1124.md §8.",
  );
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

    // Dados estruturados (JSON-LD) NÃO entram: o `"logo"` do schema da
    // Organização e o do editor do artigo são lidos por buscador, não são
    // baixados na pintura da página. E ali o PNG é a escolha certa — é o
    // formato que todo rastreador entende. Medir peso de rede num campo que
    // não é rede reprovaria a decisão correta.
    // A chave aparece com e sem aspas nos dois schemas do repositório
    // (`"logo":` no layout, `url:` no schema do editor do artigo).
    const ehDadoEstruturado = (linha) =>
      /"?(?:logo|image|url)"?\s*:/.test(linha) || /@type|schema\.org/.test(linha);

    for (const linha of conteudo.split("\n")) {
      if (ehDadoEstruturado(linha)) continue;
      for (const m of linha.matchAll(/"(\/(?:brand|partners)\/[^"]+\.(?:png|webp|jpg|jpeg|svg|avif))"/g)) {
        referenciados.add(m[1]);
      }
      for (const m of linha.matchAll(/`\$\{siteUrl\}(\/(?:brand|partners)\/[^`]+?)`/g)) {
        referenciados.add(m[1]);
      }
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
