import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const ROOT = new URL("../src/", import.meta.url).pathname;
const FORM = await readFile(`${ROOT}components/cmv-guide/CmvGuideForm.tsx`, "utf8");
const PAGE = await readFile(`${ROOT}app/guia-cmv/page.tsx`, "utf8");
const LAYOUT = await readFile(`${ROOT}app/layout.tsx`, "utf8");
const HEADER = await readFile(`${ROOT}components/Header.tsx`, "utf8");
const CONTENT = await readFile(`${ROOT}lib/cmv-guide-content.ts`, "utf8");
const ROUTE_GUARD = await readFile(`${ROOT}components/RouteScopedAcquisition.tsx`, "utf8");

function occurrences(source, value) {
  return source.split(value).length - 1;
}

test("guia CMV mantém somente os quatro campos educativos obrigatórios", () => {
  for (const label of ["Nome", "E-mail", "Telefone com DDD", "Nome do restaurante"]) {
    assert.match(FORM, new RegExp(label));
  }
  assert.match(FORM, /required/);
  assert.match(FORM, /commercialContactRequested/);
  assert.match(FORM, /useState\(false\)/);
  assert.doesNotMatch(FORM, /cnpj|CNPJ|newsletter|n8n/i);
});

test("guia CMV chama a API pública com desafio renovado e snapshot de submissão", () => {
  assert.equal(occurrences(FORM, '"/api/cmv-guide/"'), 2);
  assert.match(FORM, /solveCommercialLeadChallenge/);
  assert.match(FORM, /submissionId: submissionId\.current/);
  assert.match(FORM, /antiBot: \{ token: challenge\.token, solution \}/);
  assert.match(FORM, /snapshot\.current = nextSnapshot/);
  assert.doesNotMatch(FORM, /localStorage/);
});

test("guia CMV não promete download público nem entrega incondicional", () => {
  assert.match(PAGE, /data-cmv-guide/);
  assert.match(`${FORM}${CONTENT}`, /não há link público/i);
  assert.doesNotMatch(FORM, /entregue/i);
  assert.doesNotMatch(CONTENT, /\.pdf|\.xlsx|youtube|n8n|newsletter/i);
});

test("layout não injeta formulário comercial nem chat na rota do guia", () => {
  assert.match(ROUTE_GUARD, /GUIDE_PATHS = new Set\(\["\/guia-cmv", "\/guia-cmv\/"\]\)/);
  assert.match(LAYOUT, /<RouteScopedAcquisition><DemoSection \/><\/RouteScopedAcquisition>/);
  assert.match(LAYOUT, /<RouteScopedAcquisition><SiteChat \/><\/RouteScopedAcquisition>/);
});

test("CTA do Header só muda a âncora dentro da rota do guia", () => {
  assert.match(HEADER, /pathname === "\/guia-cmv"/);
  assert.match(HEADER, /"#cmv-guide-form"/);
  assert.match(HEADER, /: "#cadastro"/);
});
