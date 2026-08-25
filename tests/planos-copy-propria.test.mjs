/**
 * A copy da /planos é da landing page, e não pode voltar a ser do billing.
 *
 * POR QUE ESTE TESTE EXISTE (24/08/2026)
 *
 * A página exibia `description` e `publicFeatures` do catálogo de billing.
 * Quatro frases estavam sem acento e chegavam assim ao visitante e ao JSON-LD.
 * A origem não aceita conserto barato: a release `p0-monthly` v1 está
 * `published` e o trigger `offer_versions_guard` recusa UPDATE em release
 * publicada. Por isso a copy passou para `src/lib/planos-copy.mjs`.
 *
 * A regressão que este teste impede é a mais provável de todas: alguém mexe no
 * cartão de planos, escreve `selected.description` de novo porque é o campo que
 * está ali no objeto, e os acentos somem sem ninguém notar — texto errado não
 * quebra build nem teste de estrutura.
 */
import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
  PLANOS_COPY,
  copyDoPlano,
  planoParaExibicao,
  descricaoParaBuscador,
  LIMIAR_KNIGHT_CENTAVOS_ESPERADO,
} from "../src/lib/planos-copy.mjs";

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SNAPSHOT = path.join(RAIZ, "src/data/billing-catalog-v2.snapshot.json");

/** As quatro grafias que o catálogo publicado carrega e não pode corrigir. */
const GRAFIAS_ERRADAS = ["de ate ", "consolidacao", "Consolidacao", "completo a plataforma"];

/** A fonte do catálogo pode citar os campos; ela é quem os entrega. */
const ISENTOS = new Set([
  path.join(RAIZ, "src/lib/public-billing-catalog.mjs"),
  path.join(RAIZ, "src/lib/public-billing-catalog.d.mts"),
  path.join(RAIZ, "src/lib/billing-catalog-server.ts"),
]);

async function arquivosDe(dir) {
  const encontrados = [];
  for (const entrada of await readdir(dir, { withFileTypes: true })) {
    const completo = path.join(dir, entrada.name);
    if (entrada.isDirectory()) encontrados.push(...(await arquivosDe(completo)));
    else if (/\.(ts|tsx|mjs)$/.test(entrada.name)) encontrados.push(completo);
  }
  return encontrados;
}

async function lerSnapshot() {
  return JSON.parse(await readFile(SNAPSHOT, "utf8")).catalog;
}

test("toda oferta do catálogo tem copy própria escrita", async () => {
  const { offers } = await lerSnapshot();
  const semCopy = offers
    .map((o) => o.productCode)
    .filter((code) => copyDoPlano(code) === undefined);
  assert.deepEqual(
    semCopy,
    [],
    "Oferta no catálogo sem copy em `src/lib/planos-copy.mjs`. A página cai no " +
      "texto do catálogo — que é onde os acentos estão errados. Escreva a copy.",
  );
});

/**
 * A regra não é "diferente do catálogo" — a frase do Rook ("faturamento mensal
 * ACIMA de R$ 250 mil") já estava certa lá, e ser idêntica é o correto. A regra
 * é: onde o catálogo está defeituoso, a copy não pode repetir o defeito.
 */
test("a copy não repete nenhuma string defeituosa do catálogo", async () => {
  const { offers } = await lerSnapshot();
  const defeituosas = new Set(
    offers
      .flatMap((o) => [o.description, ...o.publicFeatures])
      .filter((texto) => GRAFIAS_ERRADAS.some((erro) => texto.includes(erro))),
  );
  assert.ok(
    defeituosas.size > 0,
    "Nenhuma string defeituosa no snapshot — se o catálogo foi corrigido na " +
      "origem, esta separação de copy pode ser revista.",
  );
  for (const [code, copy] of Object.entries(PLANOS_COPY)) {
    for (const texto of [copy.descricao, ...copy.features]) {
      assert.ok(
        !defeituosas.has(texto),
        `A copy de ${code} repete a string defeituosa do catálogo: "${texto}".`,
      );
    }
  }
});

test("nenhuma frase da copy tem as grafias sem acento", () => {
  const todo = Object.values(PLANOS_COPY)
    .flatMap((c) => [c.descricao, ...c.features])
    .join(" | ");
  for (const erro of GRAFIAS_ERRADAS) {
    assert.ok(!todo.includes(erro), `A copy ainda contém "${erro}".`);
  }
});

test("o limiar citado na frase do Knight é o do catálogo", async () => {
  const { classification } = await lerSnapshot();
  assert.equal(
    LIMIAR_KNIGHT_CENTAVOS_ESPERADO,
    classification.knightMaxMonthlyRevenueCents,
    "O limiar do catálogo mudou. Reescreva a frase do Knight e do Rook em " +
      "`src/lib/planos-copy.mjs` antes de atualizar esta constante.",
  );

  // "R$ 250 mil" derivado do número, não digitado: se o limiar virar 300 mil,
  // a frase antiga para de casar e o teste aponta a frase, não a constante.
  const emMilhares = classification.knightMaxMonthlyRevenueCents / 100 / 1000;
  const esperado = `R$ ${emMilhares} mil`;
  assert.ok(
    PLANOS_COPY.knight.descricao.includes(esperado),
    `A frase do Knight não cita ${esperado}.`,
  );
  assert.ok(
    PLANOS_COPY.rook.descricao.includes(esperado),
    `A frase do Rook não cita ${esperado}.`,
  );
});

test("nenhum componente volta a ler o texto do catálogo sem a copy própria", async () => {
  const marcas = /\.publicFeatures|(?:offer|selected|chess)\.description/;
  const infratores = [];
  for (const arquivo of await arquivosDe(path.join(RAIZ, "src"))) {
    if (ISENTOS.has(arquivo)) continue;
    const fonte = await readFile(arquivo, "utf8");
    if (marcas.test(fonte) && !fonte.includes("copyDoPlano")) {
      infratores.push(path.relative(RAIZ, arquivo));
    }
  }
  assert.deepEqual(
    infratores,
    [],
    "Arquivo lê `description`/`publicFeatures` do catálogo sem passar por " +
      "`copyDoPlano`. O texto do catálogo está sem acento e não pode ser " +
      "corrigido na origem — ver `src/lib/planos-copy.mjs`.",
  );
});

test("o texto cru do catálogo não atravessa para o componente de cliente", async () => {
  const { offers } = await lerSnapshot();
  for (const offer of offers) {
    const exibido = planoParaExibicao({ ...offer, formattedPrice: "R$ 0,00" });
    const chaves = Object.keys(exibido);
    assert.ok(
      !chaves.includes("description") && !chaves.includes("publicFeatures"),
      `planoParaExibicao("${offer.productCode}") ainda carrega o texto do ` +
        "catálogo. Ele seria serializado dentro do HTML publicado, onde as " +
        "grafias sem acento voltam a ser achaveis com um grep.",
    );
    const serializado = JSON.stringify(exibido);
    for (const erro of GRAFIAS_ERRADAS) {
      assert.ok(
        !serializado.includes(erro),
        `O objeto entregue ao cliente para "${offer.productCode}" contém "${erro}".`,
      );
    }
  }
});

/**
 * O JSON-LD do layout vai em TODA página e é lido pelo buscador. Preço
 * digitado ali não quebra build nem teste de estrutura — só passa a mentir no
 * dia do reajuste, enquanto a /planos (que lê o catálogo) mostra o certo.
 */
test("o dado estruturado não traz preço, limiar nem teste digitados à mão", async () => {
  const fonte = await readFile(path.join(RAIZ, "src/app/layout.tsx"), "utf8");
  const { offers, classification, trial } = await lerSnapshot();

  const literais = [
    ...offers.map((o) => (o.unitAmountCents / 100).toFixed(2)),
    `R$ ${classification.knightMaxMonthlyRevenueCents / 100 / 1000} mil`,
    `${trial.durationDays} dias de teste`,
  ];

  const encontrados = literais.filter((lit) => fonte.includes(lit));
  assert.deepEqual(
    encontrados,
    [],
    "`src/app/layout.tsx` traz valor do catálogo digitado à mão: " +
      `${encontrados.join(", ")}. Esses números vivem no catálogo de billing e ` +
      "a /planos já os lê de lá. Repetidos aqui, eles passam a mentir para o " +
      "buscador no dia do reajuste — em todas as páginas do site.",
  );
});

test("o layout monta as ofertas a partir do catálogo, não de literal", async () => {
  const fonte = await readFile(path.join(RAIZ, "src/app/layout.tsx"), "utf8");
  for (const marca of ["getLandingBillingCatalog", "descricaoParaBuscador"]) {
    assert.ok(
      fonte.includes(marca),
      `\`layout.tsx\` deixou de usar ${marca} — as ofertas do JSON-LD voltaram a ser literais.`,
    );
  }
});

test("a descrição do buscador nasce da copy do cartão", async () => {
  const { offers, trial } = await lerSnapshot();
  for (const offer of offers) {
    const dias = offer.productCode === "chess" ? null : trial.durationDays;
    const texto = descricaoParaBuscador(offer.productCode, dias);
    assert.ok(texto, `sem descrição para ${offer.productCode}`);
    assert.ok(
      texto.startsWith(PLANOS_COPY[offer.productCode].descricao),
      `A descrição de ${offer.productCode} para o buscador divergiu da copy do ` +
        "cartão. O texto do buscador tem de ser o texto que o visitante lê.",
    );
    for (const erro of GRAFIAS_ERRADAS) {
      assert.ok(!texto.includes(erro), `"${erro}" voltou na descrição de ${offer.productCode}.`);
    }
  }
});

/**
 * A regra "Chess não anuncia teste" mora em quem CHAMA (o layout), porque é
 * lá que existe a distinção entre plano-base e adicional de organização — o
 * catálogo tem um `trial` só, sem dizer a quais produtos se aplica. Então o
 * que se trava aqui é o layout passando `null` para o Chess.
 */
test("o layout não anuncia teste para o Chess", async () => {
  const fonte = await readFile(path.join(RAIZ, "src/app/layout.tsx"), "utf8");
  assert.match(
    fonte,
    /productCode === "chess" \? null :/,
    "O layout deixou de excluir o Chess do período de teste. Ele é adicional " +
      "de organização e não tem teste próprio — anunciar um é promessa falsa.",
  );
});
