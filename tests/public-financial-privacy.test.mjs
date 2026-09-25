import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import ts from 'typescript';
import * as engine from '../src/lib/financial-simulation.mjs';
import * as projection from '../src/lib/public-financial-simulation.mjs';
import { handleFinancialChatToolRequest } from '../src/lib/financial-chat-http.mjs';
import { CMV_TAX_MODEL_VERSION } from '../src/lib/cmv-tax-estimate.mjs';
import { segmentsData } from '../src/lib/cmv-benchmarks.mjs';
import { buildSimulationInput, validateAcquisition } from '../src/lib/acquisition.mjs';
import { readDiagnosticContext } from '../src/lib/diagnostic-context.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const gross = { tool: 'cmv', referenceBasis: 'last_month', revenueBasis: 'gross', revenue: 100000,
  cmvInputMode: 'amount', cmvAmount: 35000, segment: 'hamburgueria', taxState: 'SP', taxModelVersion: CMV_TAX_MODEL_VERSION };
const pe = { tool: 'breakeven', referenceBasis: 'last_month', revenueBasis: 'gross', revenue: 150000,
  cmvPercent: 35, fixedCosts: 60000, taxPercent: 8, feesPercent: 2, otherVariablePercent: 5 };
const forbidden = /assumptions|formulaVersion|taxModelVersion|taxRegime|referencePercent|differencePoints|monthlyDifference|estimatedTaxPercent|defaultCmvTarget|cmvMin|cmvMax|Benchmark Rook|Sublimite|DAS federal|hipótese anual|Parâmetros internos/;
function publicOnly(value) { assert.doesNotMatch(JSON.stringify(value), forbidden); }

const compiled = ts.transpileModule(readFileSync(path.join(root, 'src/app/api/financial-simulations/route.ts'), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
}).outputText;
const module = { exports: {} };
vm.runInNewContext(compiled, { module, exports: module.exports, Buffer,
  require(name) {
    const dependencies = { 'next/server': { NextResponse: Response }, '@/lib/financial-simulation.mjs': engine,
      '@/lib/public-financial-simulation.mjs': projection };
    assert.ok(name in dependencies, name);
    return dependencies[name];
  },
});
const request = data => new Request('http://localhost/api/financial-simulations/', {
  method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
});

test('rota real expõe apenas resultado público em todos os segmentos e bases de CMV', async () => {
  for (const segment of [...segmentsData.map(item => item.slug), 'other']) {
    for (const input of [
      { ...gross, segment }, { ...gross, segment, cmvInputMode: 'gross_percent', cmvAmount: undefined, cmvPercent: 35 },
      { tool: 'cmv', segment, revenueBasis: 'net', revenue: 91175, cmvPercent: 38, referenceBasis: 'last_month' },
    ]) {
      const response = await module.exports.POST(request(input));
      assert.equal(response.status, 200);
      assert.equal(response.headers.get('cache-control'), 'no-store');
      const body = await response.json();
      publicOnly(body);
      assert.equal(body.inputs.revenue, input.revenue);
      assert.ok(body.result.comparisonCmvPercent > 0);
      assert.equal(body.result.assessment === 'no_reference', segment === 'other');
    }
  }
});

test('saída pública preserva CMV, ponte de receita e PE sem copiar texto ou novos campos internos', () => {
  const internal = engine.calculateFinancialSimulation(gross);
  const result = projection.toPublicFinancialSimulation({ ...internal,
    summary: 'SEGREDO INTERNO', assumptions: ['SEGREDO INTERNO'],
    result: { ...internal.result, futureInternalField: 'SEGREDO INTERNO' },
    inputs: { ...internal.inputs, futureInternalField: 'SEGREDO INTERNO' },
  });
  publicOnly(result);
  assert.equal(JSON.stringify(result).includes('SEGREDO INTERNO'), false);
  assert.equal(result.result.estimatedTaxAmount, 8825);
  assert.equal(result.result.estimatedNetRevenue, 91175);
  assert.equal(result.result.comparisonCmvPercent, 35000 / 91175 * 100);
  assert.equal(result.result.assessment, 'attention');
  assert.equal(projection.toPublicFinancialSimulation(engine.calculateFinancialSimulation({ ...gross, cmvAmount: 20000 })).result.assessment, 'within_reference');
  const breakEven = projection.toPublicFinancialSimulation(engine.calculateFinancialSimulation(pe));
  publicOnly(breakEven);
  assert.equal(breakEven.result.breakEvenRevenue, 120000);
});

test('APIs públicas do chat ocultam premissas tanto no sucesso quanto na confirmação', async () => {
  for (const [toolName, input] of [['analisar_cmv', gross], ['estimar_ponto_equilibrio', pe]]) {
    const { tool, ...fields } = input;
    for (const confirmed of [false, true]) {
      const response = await handleFinancialChatToolRequest(request({ ...fields, currency: 'BRL', confirmed }), toolName);
      assert.equal(response.status, 200);
      const body = await response.json();
      publicOnly(body);
      assert.equal(body.status, confirmed ? 'success' : 'needs_confirmation');
    }
  }
});

test('erros e cenários sem margem continuam explícitos sem expor a implementação', async () => {
  const response = await module.exports.POST(request({ ...gross, revenue: -1 }));
  assert.equal(response.status, 422);
  assert.ok((await response.json()).errors.revenue);
  const body = projection.toPublicFinancialSimulation(engine.calculateFinancialSimulation({ ...pe, cmvPercent: 90 }));
  publicOnly(body);
  assert.equal(body.result.status, 'non_positive_margin');
  assert.equal(body.result.breakEvenRevenue, null);
});

test('contexto carrega entradas e captação interna recalcula o detalhamento completo', () => {
  const answers = Object.fromEntries(Object.entries(gross).filter(([key]) => key !== 'tool').map(([key, value]) => [key, String(value)]));
  const context = readDiagnosticContext({ sourceId: 'privacy-test', intent: 'cmv', answers,
    simulation: buildSimulationInput(answers, 'cmv') });
  assert.ok(context);
  assert.equal(Object.hasOwn(context.result, 'result'), false);
  const captured = validateAcquisition({ ...context.answers, intent: context.intent, simulation: context.result.inputs,
    submissionId: 'bb189bc0-1c1d-4cca-8400-44acb47fbda8', name: 'Pessoa Teste', company: 'Casa Teste',
    email: 'teste@example.invalid', phone: '11999999999', cityId: '3550308', segment: gross.segment,
    revenueBand: 'up_to_100k', usesErp: 'no', consent: true,
  }, [{ id: '3550308', name: 'São Paulo', uf: 'SP' }]);
  assert.equal(captured.ok, true);
  const internal = captured.value.simulation;
  assert.equal(internal.result.referencePercent, 31.7);
  assert.equal(internal.result.monthlyDifference, 6097.53);
  assert.ok(internal.assumptions.length > 0);
  assert.ok(internal.formulaVersion);
});

test('nenhuma entrada use client alcança motor, parâmetros ou tabelas internas por imports transitivos', () => {
  function files(dir) { return readdirSync(dir, { withFileTypes: true }).flatMap(item => item.isDirectory()
    ? files(path.join(dir, item.name)) : [path.join(dir, item.name)]); }
  const sources = files(path.join(root, 'src')).filter(file => /\.(?:[cm]?js|tsx?)$/.test(file));
  const prohibited = new Set(['financial-simulation.mjs', 'cmv-gross-simulation.mjs', 'cmv-tax-estimate.mjs',
    'cmv-benchmarks.mjs', 'rook-tax-calculator-4b6c69ee.mjs', 'acquisition.mjs', 'public-financial-simulation.mjs']);
  function dependencies(file) {
    // Transpilation removes type-only imports before walking the runtime graph.
    const code = ts.transpileModule(readFileSync(file, 'utf8'), { compilerOptions: {
      module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.Preserve,
    } }).outputText;
    const ast = ts.createSourceFile(file, code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    const names = [];
    function visit(node) {
      if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) names.push(node.moduleSpecifier.text);
      if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword && ts.isStringLiteral(node.arguments[0])) names.push(node.arguments[0].text);
      ts.forEachChild(node, visit);
    }
    visit(ast);
    return names.filter(name => name.startsWith('.') || name.startsWith('@/')).flatMap(name => {
      const base = name.startsWith('@/') ? path.join(root, 'src', name.slice(2)) : path.resolve(path.dirname(file), name);
      const resolved = [base, ...['.ts', '.tsx', '.mjs', '.js', '/index.ts', '/index.tsx'].map(ext => base + ext)].find(candidate => sources.includes(candidate));
      return resolved ? [resolved] : [];
    });
  }
  const checked = new Set();
  function walk(file, chain = []) {
    assert.equal(prohibited.has(path.basename(file)), false, [...chain, file].map(p => path.relative(root, p)).join(' -> '));
    if (checked.has(file)) return;
    checked.add(file);
    for (const dependency of dependencies(file)) walk(dependency, [...chain, file]);
  }
  for (const file of sources.filter(file => /^\s*['"]use client['"]/m.test(readFileSync(file, 'utf8')))) walk(file);
  assert.ok(checked.size > 10);
});


test('contrato OpenAPI documenta apenas campos públicos nos resultados e entradas devolvidas', () => {
  const document = JSON.parse(readFileSync(path.join(root, 'docs/rook-ai-financial-tools.openapi.json'), 'utf8'));
  const schemas = document.components.schemas;
  for (const name of ['cmv_valid', 'cmv_no_reference', 'cmv_gross_valid', 'cmv_gross_no_reference',
    'breakeven_valid', 'breakeven_non_positive_margin', 'analisar_cmv_inputs',
    'analisar_cmv_success', 'estimar_ponto_equilibrio_success']) {
    publicOnly(schemas[name]);
  }
  for (const [name, input] of [['analisar_cmv', gross], ['analisar_cmv', { ...gross, segment: 'other' }],
    ['analisar_cmv', { tool: 'cmv', revenueBasis: 'net', revenue: 100000, cmvPercent: 35, segment: 'hamburgueria' }],
    ['estimar_ponto_equilibrio', pe], ['estimar_ponto_equilibrio', { ...pe, cmvPercent: 100 }]]) {
    const response = projection.toPublicFinancialSimulation(engine.calculateFinancialSimulation(input));
    const variants = schemas[`${name}_success`].properties.result.oneOf.map(ref => schemas[ref.$ref.split('/').at(-1)]);
    const matches = variants.filter(schema => response.result.status === schema.properties.status.const
      && schema.required.every(key => Object.hasOwn(response.result, key))
      && Object.keys(response.result).every(key => Object.hasOwn(schema.properties, key)));
    assert.equal(matches.length, 1, JSON.stringify(response.result));
  }
});
