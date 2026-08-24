/**
 * Todo compartilhamento carrega a marca do Rook. (24/08/2026)
 *
 * O QUE ACONTECEU: o site não declarava `og:image`. Colado no LinkedIn, o link
 * do Rook aparecia com o LOGO DA OMIE. Sem `og:image`, o scraper varre a página
 * e escolhe sozinho: as duas primeiras imagens são os logos do Rook em `.webp`
 * (formato que o scraper do LinkedIn não consome) e a terceira é
 * `/partners/omie.png` — o primeiro PNG do documento.
 *
 * POR QUE UMA TRAVA: o conserto tem uma armadilha embutida. No Next, uma página
 * que declara `openGraph` SUBSTITUI o do layout inteiro — não há merge campo a
 * campo. Toda rota com metadata própria precisa repetir a imagem, e esquecer é
 * silencioso: a página continua funcionando, só compartilha errado. Ninguém
 * descobre até alguém colar o link em algum lugar.
 *
 * Como as outras travas do repositório, este teste lê o CÓDIGO-FONTE.
 */
import assert from "node:assert/strict";
import { access, readdir, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const APP = path.join(RAIZ, "src/app");

async function arquivosDe(dir) {
  const encontrados = [];
  for (const entrada of await readdir(dir, { withFileTypes: true })) {
    const completo = path.join(dir, entrada.name);
    if (entrada.isDirectory()) encontrados.push(...(await arquivosDe(completo)));
    else if (/\.tsx?$/.test(entrada.name)) encontrados.push(completo);
  }
  return encontrados;
}

test("a arte de compartilhamento existe e não é WebP", async () => {
  const arte = path.join(RAIZ, "public/og/rook-og.png");
  await access(arte); // lança se sumiu

  // O formato importa: WebP foi a causa do defeito original.
  assert.ok(arte.endsWith(".png"), "a arte de OG precisa ser PNG — ver o cabeçalho.");
});

test("toda rota que declara openGraph declara também a imagem", async () => {
  const infratores = [];

  for (const arquivo of await arquivosDe(APP)) {
    const fonte = await readFile(arquivo, "utf8");
    if (!/openGraph:\s*\{/.test(fonte)) continue;

    // O bloco openGraph do arquivo precisa conter `images`. O blog usa a capa
    // do próprio post, o que também vale — o que não pode é ficar sem nenhuma.
    const bloco = fonte.slice(fonte.indexOf("openGraph:"));
    const fim = bloco.indexOf("\n  },");
    const corpo = fim === -1 ? bloco : bloco.slice(0, fim);

    if (!/images:/.test(corpo)) {
      infratores.push(path.relative(RAIZ, arquivo));
    }
  }

  assert.deepEqual(
    infratores,
    [],
    "Rota com `openGraph` sem `images`. No Next isso SUBSTITUI o do layout, então " +
      "a rota compartilha sem imagem — e o scraper escolhe uma sozinho (foi assim que " +
      "o link do Rook saiu com o logo da Omie). Importe OG_IMAGE de `@/lib/og-image`.",
  );
});

test("o cartão do Twitter é o grande, não o quadrado", async () => {
  const layout = await readFile(path.join(APP, "layout.tsx"), "utf8");
  assert.ok(
    /card:\s*TWITTER_CARD/.test(layout) || /card:\s*"summary_large_image"/.test(layout),
    "`summary` recorta a arte 1200×630 num quadrado e come a frase.",
  );
});
