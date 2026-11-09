/**
 * ROO-1828 — armazenamento do navegador nunca derruba a página.
 *
 * O DEFEITO: com "bloquear cookies e dados de sites" (Chrome, Safari), em
 * alguns webviews e em páginas embutidas num iframe, LER `localStorage` ou
 * `sessionStorage` lança `SecurityError`. O `ThemeToggle` do cabeçalho lia o
 * tema sem try/catch dentro de um `useEffect`: o erro subia, o React desmontava
 * a árvore inteira e o Next mostrava só "Application error". Como o cabeçalho
 * está em todas as páginas, o site inteiro caía para essas pessoas — inclusive
 * as páginas de captação. Medido em 09/11/2026 em www.rook.com.br: `/`,
 * `/guia-cmv/` e `/sobre/` sem conteúdo com o bloqueio ligado.
 *
 * Os outros acessos já estavam protegidos (CookieConsent, script de tema do
 * layout, GoogleTagManager, lp-experiment-client, submission-recovery). O
 * cabeçalho ficou de fora porque nada obrigava. Esta trava obriga: todo acesso
 * a `localStorage`/`sessionStorage` em `src/` fica dentro de um bloco `try`
 * ainda aberto. Dentro de `catch` não conta.
 *
 * Limite conhecido (heurística de texto, não de AST): uma função criada dentro
 * do `try` e executada depois passaria. Por isso o padrão é ler e gravar o
 * armazenamento direto no corpo do `try`, como nos arquivos acima.
 */
import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const RAIZ = new URL("../src/", import.meta.url).pathname;
const ACESSO = /\b(?:localStorage|sessionStorage)\b/g;
const INICIO_TRY = /\btry\s*\{/g;

async function arquivosDeCodigo(dir = RAIZ, acc = []) {
  for (const entrada of await readdir(dir, { withFileTypes: true })) {
    const completo = path.join(dir, entrada.name);
    if (entrada.isDirectory()) await arquivosDeCodigo(completo, acc);
    else if (/\.(ts|tsx|mjs)$/.test(entrada.name)) acc.push(completo);
  }
  return acc;
}

/** Remove comentários mantendo as quebras de linha (os números de linha batem). */
function semComentarios(codigo) {
  return codigo
    .replace(/\/\*[\s\S]*?\*\//g, (bloco) => bloco.replace(/[^\n]/g, " "))
    .replace(/(^|\s)\/\/.*$/gm, (_, antes) => antes);
}

/** O bloco `try` que abre em `chave` ainda está aberto na posição `alvo`? */
function tryAbertoEm(codigo, chave, alvo) {
  let profundidade = 0;
  for (let i = chave; i < alvo; i += 1) {
    if (codigo[i] === "{") profundidade += 1;
    else if (codigo[i] === "}") {
      profundidade -= 1;
      if (profundidade === 0) return false;
    }
  }
  return profundidade > 0;
}

/** Linhas (1-based) com acesso a armazenamento fora de um `try` aberto. */
export function acessosSemTry(fonte) {
  const codigo = semComentarios(fonte);
  const chaves = [...codigo.matchAll(INICIO_TRY)].map((m) => m.index + m[0].length - 1);
  const linhas = [];
  for (const m of codigo.matchAll(ACESSO)) {
    const protegido = chaves.some((chave) => chave < m.index && tryAbertoEm(codigo, chave, m.index));
    if (!protegido) linhas.push(codigo.slice(0, m.index).split("\n").length);
  }
  return linhas;
}

test("o verificador reconhece acesso protegido, desprotegido e dentro de catch", () => {
  assert.deepEqual(acessosSemTry('const t = localStorage.getItem("x");'), [1]);
  assert.deepEqual(acessosSemTry('try { const t = localStorage.getItem("x"); } catch {}'), []);
  assert.deepEqual(acessosSemTry("try {\n  if (a) { sessionStorage.setItem(k, v); }\n} catch {}"), []);
  assert.deepEqual(acessosSemTry("try { x(); } catch {\n  localStorage.clear();\n}"), [2]);
  assert.deepEqual(acessosSemTry("try { x(); } catch {}\nlocalStorage.clear();"), [2]);
  assert.deepEqual(acessosSemTry("// localStorage em comentário\n/* sessionStorage */ const a = 1;"), []);
  // Script inline em template string (layout, GTM): o try está dentro da própria string.
  assert.deepEqual(acessosSemTry("const s = `(function(){try{var t=localStorage.getItem('k')}catch(e){}})()`;"), []);
});

test("todo acesso a localStorage/sessionStorage em src/ está dentro de try", async () => {
  const arquivos = await arquivosDeCodigo();
  const infratores = [];
  let acessos = 0;
  for (const arquivo of arquivos) {
    const fonte = await readFile(arquivo, "utf8");
    acessos += (semComentarios(fonte).match(ACESSO) || []).length;
    const linhas = acessosSemTry(fonte);
    if (linhas.length) infratores.push(`${path.relative(RAIZ, arquivo)}:${linhas.join(",")}`);
  }
  // Sem acessos, a trava passaria por não olhar nada.
  assert.ok(acessos >= 5, `esperava ao menos 5 acessos a armazenamento em src/, achei ${acessos}`);
  assert.deepEqual(
    infratores,
    [],
    "acesso a armazenamento do navegador fora de try: com cookies bloqueados ele lança e derruba a página",
  );
});
