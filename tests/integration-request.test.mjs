/**
 * Solicitação de integração — a borda do formulário.
 *
 * O botão abria um `mailto:`: dependia de cliente de e-mail configurado, não
 * registrava nada, e chegava ao Comercial sem dizer qual sistema foi pedido.
 * Virou formulário, e o que se protege aqui é o contrato dele.
 *
 * A regra que mais importa é a da LISTA: ela existe para que o mesmo ERP não
 * chegue escrito de cinco jeitos. Se ela deixar de agrupar, a priorização por
 * volume de pedidos — que é como o time decide o que integrar — volta a ser
 * contagem manual.
 */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
  SISTEMAS,
  validarSolicitacaoIntegracao,
} from "../src/lib/integration-request-validation.mjs";
import { buildIntegrationRequestSourceId } from "../src/lib/integration-request-store.mjs";

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const VALIDO = {
  nome: "Maria",
  email: "maria@casaexemplo.com.br",
  telefone: "(61) 99999-9999",
  sistema: "totvs",
};

test("aceita um pedido completo e devolve o nome legível do sistema", () => {
  const r = validarSolicitacaoIntegracao(VALIDO);
  assert.equal(r.ok, true);
  assert.equal(r.value.sistemaNome, "TOTVS");
  assert.equal(r.value.email, "maria@casaexemplo.com.br");
});

test("normaliza e-mail e apara texto", () => {
  const r = validarSolicitacaoIntegracao({ ...VALIDO, email: "  MARIA@Casa.com.BR ", nome: "  Maria  " });
  assert.equal(r.value.email, "maria@casa.com.br");
  assert.equal(r.value.nome, "Maria");
});

test("recusa sistema fora da lista — o campo é fechado por um motivo", () => {
  const r = validarSolicitacaoIntegracao({ ...VALIDO, sistema: "sistema_inventado" });
  assert.equal(r.ok, false);
  assert.ok(r.errors.sistema);
});

test('"outro" exige o nome escrito, senão o pedido não diz o que integrar', () => {
  const semNome = validarSolicitacaoIntegracao({ ...VALIDO, sistema: "outro" });
  assert.equal(semNome.ok, false);
  assert.ok(semNome.errors.sistemaOutro);

  const comNome = validarSolicitacaoIntegracao({ ...VALIDO, sistema: "outro", sistemaOutro: "Sistema da Casa" });
  assert.equal(comNome.ok, true);
  assert.equal(comNome.value.sistemaNome, "Sistema da Casa");
});

test("recusa contato inválido", () => {
  assert.ok(validarSolicitacaoIntegracao({ ...VALIDO, nome: "M" }).errors.nome);
  assert.ok(validarSolicitacaoIntegracao({ ...VALIDO, email: "sem-arroba" }).errors.email);
  assert.ok(validarSolicitacaoIntegracao({ ...VALIDO, telefone: "999" }).errors.telefone);
});

test("o honeypot devolve ok sem valor — bot não recebe 4xx para aprender", () => {
  const r = validarSolicitacaoIntegracao({ ...VALIDO, website: "http://spam" });
  assert.equal(r.ok, true);
  assert.equal(r.honeypot, true);
  assert.equal(r.value, null);
});

test("recusa corpo que não é objeto", () => {
  for (const corpo of [null, "texto", 42, ["a"]]) {
    assert.equal(validarSolicitacaoIntegracao(corpo).ok, false);
  }
});

test("a lista não oferece sistema que JÁ é parceiro", async () => {
  // Pedir integração com quem já está integrado é a pior resposta possível ao
  // visitante — e faria o Comercial perseguir um pedido que não existe.
  const conteudo = await readFile(path.join(RAIZ, "src/lib/lp-content.ts"), "utf8");
  const parceiros = [...conteudo.matchAll(/\{ name: "([^"]+)", categoria:/g)].map((m) =>
    m[1].toLowerCase(),
  );
  assert.ok(parceiros.length > 0, "não achei a lista de parceiros — o padrão de busca quebrou");

  const conflitos = SISTEMAS.filter((s) => parceiros.includes(s.rotulo.toLowerCase()));
  assert.deepEqual(
    conflitos.map((c) => c.rotulo),
    [],
    "A lista de sistemas oferece um parceiro já integrado. Remova de SISTEMAS.",
  );
});

test("a lista tem valores únicos e termina em 'outro'", () => {
  const valores = SISTEMAS.map((s) => s.valor);
  assert.equal(new Set(valores).size, valores.length, "valor repetido na lista");
  assert.equal(valores[valores.length - 1], "outro", "'outro' precisa ser a última opção");
});

test("o mesmo pedido gera a mesma identidade, pedidos diferentes não", () => {
  const a = validarSolicitacaoIntegracao(VALIDO).value;
  const b = validarSolicitacaoIntegracao({ ...VALIDO, sistema: "linx" }).value;
  assert.equal(buildIntegrationRequestSourceId(a), buildIntegrationRequestSourceId(a));
  assert.notEqual(buildIntegrationRequestSourceId(a), buildIntegrationRequestSourceId(b));
});
