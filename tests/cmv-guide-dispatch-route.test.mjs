import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";

const compiled = ts.transpileModule(readFileSync(new URL("../src/app/api/internal/cmv-guide-dispatch/route.ts", import.meta.url), "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
}).outputText;

function load({ authorized = true, configured = true, dispatch = async () => ({ claimed: 1, accepted: 1, retried: 0, failed: 0, delivered: 0, bounced: 0, reconciled: 0, needsReconciliation: 0 }) } = {}) {
  const deps = {
    "next/server": { NextResponse: Response },
    "@/lib/cmv-guide-delivery": { isCmvGuideDispatchAuthorized: () => authorized, dispatchCmvGuide: dispatch },
    "@/lib/cmv-guide": { isCmvGuideDeliveryConfigured: () => configured },
  };
  const module = { exports: {} };
  vm.runInNewContext(compiled, {
    module, exports: module.exports, Request, Response,
    require(name) { if (!(name in deps)) throw new Error(name); return deps[name]; },
  }, { filename: "api/internal/cmv-guide-dispatch/route.cjs" });
  return module.exports;
}

test("endpoint interno exige bearer e falha fechado antes de claim", async () => {
  assert.equal((await load({ authorized: false }).GET(new Request("https://rook.test/api/internal/cmv-guide-dispatch/"))).status, 401);
  assert.equal((await load({ configured: false }).POST(new Request("https://rook.test/api/internal/cmv-guide-dispatch/"))).status, 503);
});

test("endpoint interno retorna ok e somente contadores numéricos", async () => {
  const route = load({ dispatch: async () => ({ claimed: "2", accepted: 1.8, retried: -2, failed: null, delivered: 1, bounced: 0, reconciled: 1, needsReconciliation: 0, private: "x" }) });
  const response = await route.POST(new Request("https://rook.test/api/internal/cmv-guide-dispatch/", { method: "POST" }));
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ok: true, claimed: 2, accepted: 1, retried: 0, failed: 0, delivered: 1, bounced: 0, reconciled: 1, needsReconciliation: 0 });
});
