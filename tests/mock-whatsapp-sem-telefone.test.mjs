/**
 * O mock do WhatsApp não pode exibir número de telefone. (24/08/2026)
 *
 * O QUE ACONTECEU: o cabeçalho do mock trazia o número real do canal Twilio,
 * como no preview aprovado (brief §5.5). Enquanto a seção do briefing vivia no
 * meio da página, passava batido. Na v6 o informe subiu para o hero e o número
 * virou a segunda coisa mais visível do site — um canal automatizado, de saída,
 * anunciado como se fosse atendimento na primeira dobra da home.
 *
 * POR QUE UMA TRAVA E NÃO SÓ O CONSERTO: o número saiu de `lp-content.ts`, mas
 * a próxima pessoa que quiser "deixar o mock mais realista" vai colocá-lo de
 * volta — foi exatamente assim que ele chegou lá. Este teste falha no momento
 * em que a decisão é desfeita, e não semanas depois, quando alguém reparar no
 * volume de mensagens no número errado.
 *
 * ESCOPO: qualquer telefone brasileiro escrito no conteúdo ou nos componentes
 * da LP. Não vale para `docs/`, que é registro histórico, nem para o e-mail de
 * contato, que é canal legítimo e público.
 *
 * Como as outras travas do repositório, este teste lê o CÓDIGO-FONTE. Ele não
 * abre o navegador: o que se protege é a decisão escrita no arquivo.
 */
import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const ALVOS = [
  path.join(RAIZ, "src/lib/lp-content.ts"),
  path.join(RAIZ, "src/components/lp"),
];

/**
 * Telefone brasileiro em qualquer notação que uma pessoa escreveria à mão:
 * com ou sem +55, com ou sem DDD entre parênteses, separado por hífen, espaço
 * ou traço tipográfico, fixo (8 dígitos) ou celular (9).
 *
 * O que NÃO casa, de propósito: valores em reais ("R$ 198.640,00"), datas
 * ("17/08/2026") e percentuais — nenhum deles tem a assinatura de DDD seguido
 * de bloco de 4-5 dígitos e mais 4.
 */
const TELEFONE = /(\+\s*55[\s.-]*)?\(?\d{2}\)?[\s.-]*\d{4,5}[\s.–—-]\d{4}\b/;

async function arquivosDe(alvo) {
  const info = await readdir(alvo, { withFileTypes: true }).catch(() => null);
  if (!info) return [alvo];
  const encontrados = [];
  for (const entrada of info) {
    const completo = path.join(alvo, entrada.name);
    if (entrada.isDirectory()) encontrados.push(...(await arquivosDe(completo)));
    else if (/\.(ts|tsx|mjs)$/.test(entrada.name)) encontrados.push(completo);
  }
  return encontrados;
}

/** Apaga comentários de bloco preservando as quebras de linha, para o número
 * da linha continuar batendo — e porque o comentário que explica esta regra
 * cita o formato proibido. Mesmo tratamento de `performance-lp.test.mjs`. */
function semComentarios(conteudo) {
  return conteudo
    .replace(/\/\*[\s\S]*?\*\//g, (bloco) => bloco.replace(/[^\n]/g, " "))
    .replace(/^\s*\/\/.*$/gm, "");
}

test("o mock do WhatsApp não exibe número de telefone", async () => {
  const infratores = [];

  for (const alvo of ALVOS) {
    for (const arquivo of await arquivosDe(alvo)) {
      const linhas = semComentarios(await readFile(arquivo, "utf8")).split("\n");
      linhas.forEach((linha, i) => {
        const achado = linha.match(TELEFONE);
        if (achado) {
          infratores.push(`${path.relative(RAIZ, arquivo)}:${i + 1} → "${achado[0].trim()}"`);
        }
      });
    }
  }

  assert.deepEqual(
    infratores,
    [],
    "Telefone no conteúdo da LP. O canal do WhatsApp é de saída, com opt-in no " +
      "onboarding: expor o número na home convida resposta de quem acha que fala " +
      "com atendimento. O cabeçalho do mock usa `contactTag` (rótulo), não número.",
  );
});

test("o rótulo do canal existe e não é discável", async () => {
  const fonte = await readFile(path.join(RAIZ, "src/lib/lp-content.ts"), "utf8");

  const tag = fonte.match(/contactTag:\s*"([^"]+)"/);
  assert.ok(tag, "BRIEFING.contactTag sumiu — o cabeçalho do mock ficaria sem rótulo.");
  assert.ok(
    !/\d{4}/.test(tag[1]),
    `contactTag virou algo com cara de número: "${tag[1]}". É rótulo, não identificador.`,
  );

  assert.ok(
    !/contactNumber/.test(fonte),
    "`contactNumber` voltou a existir. Ver o comentário em BRIEFING antes de reintroduzir.",
  );
});
