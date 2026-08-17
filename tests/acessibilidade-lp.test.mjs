/**
 * ROO-1125 — contrato de acessibilidade do site público (P1 e P2).
 *
 * O PageSpeed deu 86/100 em acessibilidade na home. Três defeitos, todos
 * medidos com o site rodando em 17/08/2026 (`next build && next start`, DOM
 * real, tema claro e escuro):
 *
 *   CONTRASTE
 *     branco sobre o terracota do botão ....... 3,91:1  (piso 4,5)
 *     linha de fontes do hero, opacity 0.7 .... 2,97:1 claro / 3,85:1 escuro
 *     numeração do funil, opacity 0.6 ......... 2,40:1 claro / 2,72:1 escuro
 *     nota do plano, opacity 0.7 .............. 3,07:1 claro / 3,55:1 escuro
 *     percentual final do funil (#e54c00) ..... 3,45:1 claro / 3,32:1 escuro
 *     rótulo de seção (alpha 0.55) ............ 4,00:1 claro
 *
 *   LISTA
 *     o `<ol>` das seis etapas tinha `<div>` como filho — o wrapper de
 *     animação — e os seis `<li>` ficavam pendurados fora de qualquer lista.
 *
 *   HIERARQUIA
 *     os três títulos do rodapé eram `<h4>`. Como o rodapé fecha TODA página,
 *     isso criava um salto h2 → h4 em nove das dez rotas, e h1 → h4 em
 *     /diagnostico.
 *
 * O que esta trava faz e o que ela NÃO faz: ela lê o código-fonte, como a
 * `canonical-origin.test.mjs`. Ela não abre o navegador — a verificação em DOM
 * real foi feita à mão e não roda no CI. O que ela garante é que os valores e
 * as decisões que fizeram o DOM ficar correto continuem no lugar.
 */
import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const RAIZ = new URL("../src/", import.meta.url).pathname;
const GLOBALS = path.join(RAIZ, "app/globals.css");
const TAILWIND = new URL("../tailwind.config.ts", import.meta.url).pathname;

/* ────────────────────────────────────────────────────────────────────────────
   Contraste — WCAG 2.1 relative luminance
   ──────────────────────────────────────────────────────────────────────────── */

const PISO_TEXTO_NORMAL = 4.5;

function paraRgb(cor) {
  const hex = cor.trim().match(/^#([0-9a-f]{6})$/i);
  if (hex) {
    const n = hex[1];
    return [0, 2, 4].map((i) => parseInt(n.slice(i, i + 2), 16)).concat(1);
  }
  const rgba = cor.trim().match(/^rgba?\(([^)]+)\)$/i);
  if (rgba) {
    const p = rgba[1].split(",").map((x) => parseFloat(x));
    return [p[0], p[1], p[2], p.length > 3 ? p[3] : 1];
  }
  throw new Error(`Cor não reconhecida: "${cor}"`);
}

function luminancia([r, g, b]) {
  const f = (v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

/** Compõe uma cor com alpha sobre o fundo, como o navegador pinta. */
function sobre(frente, fundo) {
  const [r, g, b, a] = frente;
  const [br, bg, bb] = fundo;
  return [r * a + br * (1 - a), g * a + bg * (1 - a), b * a + bb * (1 - a), 1];
}

function razao(frenteCss, fundoCss) {
  const fundo = paraRgb(fundoCss);
  const frente = sobre(paraRgb(frenteCss), fundo);
  const [alto, baixo] = [luminancia(frente), luminancia(fundo)].sort((a, b) => b - a);
  return (alto + 0.05) / (baixo + 0.05);
}

const arredonda = (n) => Math.round(n * 100) / 100;

/* ────────────────────────────────────────────────────────────────────────────
   Leitura dos tokens declarados no globals.css
   ──────────────────────────────────────────────────────────────────────────── */

/** Extrai `--token: valor;` do bloco `:root` ou `.dark`. */
function tokensDoBloco(css, seletor) {
  const inicio = css.indexOf(seletor + " {");
  assert.notEqual(inicio, -1, `Bloco "${seletor}" não encontrado em globals.css`);
  const fim = css.indexOf("\n  }", inicio);
  const bloco = css.slice(inicio, fim);
  const tokens = {};
  for (const m of bloco.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
    tokens[m[1]] = m[2].trim();
  }
  return tokens;
}

/** Resolve `var(--x)` e devolve uma cor literal. */
function resolve(valor, tabela, vistos = new Set()) {
  const m = String(valor).trim().match(/^var\((--[\w-]+)\)$/);
  if (!m) return valor;
  assert.ok(!vistos.has(m[1]), `Ciclo de var() em ${m[1]}`);
  vistos.add(m[1]);
  const alvo = tabela[m[1]];
  assert.ok(alvo, `Token ${m[1]} não declarado`);
  return resolve(alvo, tabela, vistos);
}

const css = await readFile(GLOBALS, "utf8");
const claro = tokensDoBloco(css, ":root");
const escuro = { ...claro, ...tokensDoBloco(css, ".dark") };

const SUPERFICIES = ["--color-bg", "--color-bg-card", "--color-bg-elevated"];

test("o fundo do botão primário carrega texto branco com 4,5:1", async () => {
  // Mede o botão como ele está declarado, seja por classe do Tailwind
  // (`bg-terracota`) ou por token (`background-color: var(--color-cta)`) —
  // trocar de mecanismo não escapa da trava.
  const regra = css.slice(css.indexOf(".btn-primary {"));
  const corpo = regra.slice(0, regra.indexOf("}"));

  assert.match(corpo, /text-white/, "O rótulo do botão primário é branco; se mudar, ajuste esta trava.");

  let fundo;
  const porToken = corpo.match(/background-color:\s*(var\(--[\w-]+\)|#[0-9a-f]{6})/i);
  const porClasse = corpo.match(/\bbg-([a-z]+)\b/);
  if (porToken) {
    fundo = resolve(porToken[1], claro);
  } else if (porClasse) {
    const tw = await readFile(TAILWIND, "utf8");
    const cor = tw.match(new RegExp(`${porClasse[1]}:\\s*"(#[0-9a-fA-F]{6})"`));
    assert.ok(cor, `Cor "${porClasse[1]}" não encontrada no tailwind.config.ts`);
    fundo = cor[1];
  } else {
    assert.fail("O .btn-primary não declara cor de fundo reconhecível.");
  }

  const medido = razao("#ffffff", fundo);
  assert.ok(
    medido >= PISO_TEXTO_NORMAL,
    `Branco sobre ${fundo} mede ${arredonda(medido)}:1 e o piso para texto de 15px é ${PISO_TEXTO_NORMAL}:1. ` +
      'É o botão "Testar por 7 dias", que aparece no cabeçalho de todas as páginas.',
  );
});

test("o terracota de texto é legível nas três superfícies dos dois temas", () => {
  for (const [tema, tabela] of [["claro", claro], ["escuro", escuro]]) {
    const cor = resolve("var(--color-terracota-text)", tabela);
    for (const superficie of SUPERFICIES) {
      const fundo = resolve(`var(${superficie})`, tabela);
      const medido = razao(cor, fundo);
      assert.ok(
        medido >= PISO_TEXTO_NORMAL,
        `[${tema}] ${cor} sobre ${superficie} (${fundo}) mede ${arredonda(medido)}:1, abaixo de ${PISO_TEXTO_NORMAL}:1. ` +
          "O terracota da marca (#e54c00) serve para manchete (piso 3:1), não para texto miúdo.",
      );
    }
  }
});

test("o cinza secundário é legível nas três superfícies dos dois temas", () => {
  for (const [tema, tabela] of [["claro", claro], ["escuro", escuro]]) {
    const cor = resolve("var(--color-text-muted)", tabela);
    for (const superficie of SUPERFICIES) {
      const fundo = resolve(`var(${superficie})`, tabela);
      const medido = razao(cor, fundo);
      assert.ok(
        medido >= PISO_TEXTO_NORMAL,
        `[${tema}] cinza ${cor} sobre ${superficie} (${fundo}) mede ${arredonda(medido)}:1.`,
      );
    }
  }
});

test("o rótulo de seção é legível sobre o fundo e sobre o cartão", () => {
  for (const [tema, tabela] of [["claro", claro], ["escuro", escuro]]) {
    const cor = resolve("var(--color-section-label)", tabela);
    for (const superficie of ["--color-bg", "--color-bg-card"]) {
      const fundo = resolve(`var(${superficie})`, tabela);
      const medido = razao(cor, fundo);
      assert.ok(
        medido >= PISO_TEXTO_NORMAL,
        `[${tema}] ${cor} sobre ${superficie} (${fundo}) mede ${arredonda(medido)}:1. ` +
          "O rótulo tem 11px — é texto normal, piso 4,5:1, e o alpha é o que decide.",
      );
    }
  }
});

/* ────────────────────────────────────────────────────────────────────────────
   Código-fonte
   ──────────────────────────────────────────────────────────────────────────── */

async function arquivosTsx(dir = RAIZ, acc = []) {
  for (const entrada of await readdir(dir, { withFileTypes: true })) {
    const completo = path.join(dir, entrada.name);
    if (entrada.isDirectory()) {
      // Os e-mails são documentos próprios, com hierarquia própria.
      if (entrada.name !== "emails") await arquivosTsx(completo, acc);
    } else if (entrada.name.endsWith(".tsx")) {
      acc.push(completo);
    }
  }
  return acc;
}

/** Remove comentários — eles citam o defeito e conteriam as marcações proibidas. */
const semComentarios = (fonte) =>
  fonte
    .replace(/\{\s*\/\*[\s\S]*?\*\/\s*\}/g, "")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "");

const ARQUIVOS = await arquivosTsx();

test("nenhum texto depende de opacity para ficar cinza", async () => {
  // `opacity` multiplica o contraste que o token já entrega. O cinza do site
  // mede entre 4,86:1 e 6,47:1 — com 0.7 cai para 2,97:1. A hierarquia visual
  // vem do corpo, do peso e da fonte, não da transparência.
  const infratores = [];
  for (const arquivo of ARQUIVOS) {
    const fonte = semComentarios(await readFile(arquivo, "utf8"));
    for (const m of fonte.matchAll(/style=\{\{([^}]*)\}\}/g)) {
      const decl = m[1];
      const op = decl.match(/\bopacity:\s*(0?\.\d+|0)\b/);
      if (op && /\bcolor:/.test(decl)) {
        infratores.push(`${path.relative(RAIZ, arquivo)} → color + opacity: ${op[1]}`);
      }
    }
  }
  assert.deepEqual(
    infratores,
    [],
    "Texto com cor e `opacity` no mesmo style. Use a cor direta — o token já é o limite do contraste.",
  );
});

test("o primeiro filho de toda lista é um item de lista", async () => {
  // O defeito: `<ol>` → `<Reveal>` (que renderiza `<div>`) → `<li>`. Para o
  // leitor de tela a lista deixa de existir e os seis itens viram texto solto.
  const infratores = [];

  for (const arquivo of ARQUIVOS) {
    const fonte = semComentarios(await readFile(arquivo, "utf8"));
    const relativo = path.relative(RAIZ, arquivo);

    for (const abertura of fonte.matchAll(/<(ol|ul|menu)[\s>]/g)) {
      const lista = abertura[1];
      const regiao = fonte.slice(abertura.index + abertura[0].length);
      const primeiro = regiao.match(/<([A-Za-z][\w.]*)([^>]*)/);
      if (!primeiro) continue;

      const tag = primeiro[1];
      const atributos = primeiro[2];

      if (tag === "li") continue;
      // Componente que declara ser um item de lista.
      if (/\bas="li"/.test(atributos)) continue;
      // Componente definido no próprio arquivo que retorna <li>.
      if (/^[A-Z]/.test(tag)) {
        const def = fonte.match(new RegExp(`function ${tag}\\s*\\([\\s\\S]*?return\\s*\\(\\s*<(\\w+)`));
        if (def && def[1] === "li") continue;
      }

      infratores.push(`${relativo}: <${lista}> tem <${tag}> como primeiro filho`);
    }
  }

  assert.deepEqual(
    infratores,
    [],
    "Filho direto de lista precisa ser <li>. Um wrapper de animação no meio quebra a lista — " +
      'use `as="li"` no <Reveal> em vez de embrulhar o <li> num <div>.',
  );
});

test("todo <Reveal> dentro de uma lista se declara item de lista", async () => {
  const infratores = [];
  for (const arquivo of ARQUIVOS) {
    const fonte = semComentarios(await readFile(arquivo, "utf8"));
    for (const lista of ["ol", "ul", "menu"]) {
      const re = new RegExp(`<${lista}[\\s>][\\s\\S]*?</${lista}>`, "g");
      for (const bloco of fonte.matchAll(re)) {
        for (const rev of bloco[0].matchAll(/<Reveal([^>]*)>/g)) {
          if (!/\bas="li"/.test(rev[1])) {
            infratores.push(`${path.relative(RAIZ, arquivo)}: <Reveal> dentro de <${lista}> sem as="li"`);
          }
        }
      }
    }
  }
  assert.deepEqual(infratores, [], 'Dentro de <ol>/<ul>, o <Reveal> precisa de as="li".');
});

test("nenhum arquivo abre um heading abaixo de h3", async () => {
  // O rodapé vive no layout e é o ÚLTIMO heading de toda página. Enquanto ele
  // usava <h4>, qualquer rota que parasse no <h2> ganhava um salto h2 → h4, e
  // /diagnostico, que não tem <h2>, saltava h1 → h4.
  //
  // A regra é dura de propósito: um scanner de fonte não consegue provar a
  // ordem dos headings no DOM montado, porque eles vêm de componentes
  // diferentes. Proibir h4+ é a garantia que ele consegue dar. Se um dia uma
  // página precisar mesmo de quatro níveis, a conversa passa por aqui.
  const infratores = [];
  for (const arquivo of ARQUIVOS) {
    const fonte = semComentarios(await readFile(arquivo, "utf8"));
    const achados = fonte.match(/<h[456][\s>]/g);
    if (achados) {
      infratores.push(`${path.relative(RAIZ, arquivo)} → ${[...new Set(achados.map((s) => s.trim()))].join(", ")}`);
    }
  }
  assert.deepEqual(
    infratores,
    [],
    "Heading abaixo de h3 no site público. O rodapé fecha toda página em <h2>; " +
      "um <h4> no meio do caminho vira salto de nível para leitor de tela.",
  );
});

test("o rodapé e o cabeçalho não aprofundam a hierarquia da página", async () => {
  // Chrome compartilhado: o que estiver aqui aparece em TODAS as rotas, então
  // um heading errado aqui é um defeito multiplicado por dez.
  for (const nome of ["components/Footer.tsx", "components/Header.tsx"]) {
    const fonte = semComentarios(await readFile(path.join(RAIZ, nome), "utf8"));
    const headings = [...fonte.matchAll(/<h([1-6])[\s>]/g)].map((m) => Number(m[1]));
    for (const n of headings) {
      assert.equal(
        n,
        2,
        `${nome} usa <h${n}>. O chrome compartilhado só pode usar <h2>: <h1> disputaria com o título ` +
          "da página e <h3>+ criaria salto de nível em toda rota.",
      );
    }
  }
});
