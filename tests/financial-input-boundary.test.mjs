import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { culinarySegments } from '../src/lib/culinary-segments.mjs';
import { validateFinancialInput } from '../src/lib/financial-input.mjs';
import { CMV_TAX_MODEL_VERSION } from '../src/lib/cmv-input-options.mjs';

const lib = fileURLToPath(new URL('../src/lib/', import.meta.url));

test('entradas públicas não alcançam motor, benchmarks nem parâmetros fiscais', async () => {
  const pending = ['financial-input.mjs', 'financial-number.mjs', 'financial-number-input.mjs',
    'culinary-segments.mjs', 'cmv-input-options.mjs', 'acquisition-input.mjs'];
  const visited = new Set();
  while (pending.length) {
    const name = pending.pop();
    if (visited.has(name)) continue;
    visited.add(name);
    assert.doesNotMatch(name, /(?:financial-simulation|cmv-gross-simulation|cmv-tax-estimate|cmv-benchmarks|vendor\/|acquisition\.mjs)/);
    const source = await readFile(path.join(lib, name), 'utf8');
    for (const match of source.matchAll(/(?:from\s*|import\s*\()\s*['"](\.[^'"]+)['"]/g)) {
      pending.push(path.normalize(path.join(path.dirname(name), match[1])));
    }
  }
});

test('seletor público contém somente nome e slug de cada segmento', () => {
  assert.ok(culinarySegments.length > 0);
  for (const segment of culinarySegments) assert.deepEqual(Object.keys(segment).sort(), ['name', 'slug']);
});

test('validação pública não aceita resultados enviados como parte da entrada', () => {
  const parsed = validateFinancialInput({ tool: 'cmv', revenueBasis: 'gross', revenue: 100000.505,
    cmvInputMode: 'amount', cmvAmount: 0, segment: 'hamburgueria', taxState: 'SP',
    taxModelVersion: CMV_TAX_MODEL_VERSION, referenceBasis: 'monthly_average_12m',
    result: { estimatedNetRevenue: 1 }, assumptions: ['inventado'], summary: 'Lucro garantido',
  });
  assert.deepEqual(parsed, { ok: true, inputs: { tool: 'cmv', revenueBasis: 'gross', revenue: 100000.51,
    cmvInputMode: 'amount', cmvAmount: 0, segment: 'hamburgueria', taxState: 'SP',
    taxModelVersion: CMV_TAX_MODEL_VERSION, referenceBasis: 'monthly_average_12m' } });
});
