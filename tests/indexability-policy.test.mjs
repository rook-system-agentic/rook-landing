import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  indexabilityDecision,
  normalizeInternalCanonical,
  normalizeOrigin,
} from "../src/lib/indexability-policy.mjs";

const ROOT = new URL("..", import.meta.url);

async function readRepoFile(relativePath) {
  return readFile(new URL(relativePath, ROOT), "utf8");
}

test("somente produção no host www é indexável", () => {
  assert.deepEqual(
    indexabilityDecision({ environment: "production", host: "www.rook.com.br" }),
    { indexable: true, reason: "official-production" },
  );
  assert.equal(indexabilityDecision({ environment: "production", host: "rook.com.br" }).indexable, false);
  assert.equal(indexabilityDecision({ environment: "production", host: "www.rooksystem.com.br" }).indexable, false);
  assert.equal(indexabilityDecision({ environment: "production", host: "www.rook.com.br:443" }).indexable, false);
  assert.equal(indexabilityDecision({ environment: "production", host: undefined }).indexable, false);
});

test("build sem produção explícita fecha a indexação, inclusive no www", () => {
  for (const environment of [undefined, "", "homolog", "preview", "development"]) {
    assert.deepEqual(
      indexabilityDecision({ environment, host: "www.rook.com.br" }),
      { indexable: false, reason: "build-not-production" },
    );
  }
});

test("preview explícito da plataforma fecha a indexação mesmo com build e host oficiais", () => {
  for (const deploymentEnvironment of ["preview", "development", "", "unknown"]) {
    assert.equal(indexabilityDecision({ environment: "production", host: "www.rook.com.br", deploymentEnvironment }).indexable, false);
  }
  assert.equal(indexabilityDecision({ environment: "production", host: "www.rook.com.br", deploymentEnvironment: "production" }).indexable, true);
});

test("origens institucionais antigas são promovidas ao www", () => {
  for (const origin of [
    "https://rook.com.br",
    "https://rooksystem.com.br/",
    "https://www.rooksystem.com.br///",
    "http://rooksystem.com.br",
  ]) {
    assert.equal(normalizeOrigin(origin), "https://www.rook.com.br");
  }
  assert.equal(normalizeOrigin("https://preview.example.test/"), "https://preview.example.test");
  assert.equal(normalizeOrigin("not-an-origin"), "https://www.rook.com.br");
});

test("canonical editorial de alias interno preserva caminho e query", () => {
  assert.equal(
    normalizeInternalCanonical("https://rooksystem.com.br/blog/margem/?utm_source=arquivo", "fallback"),
    "https://www.rook.com.br/blog/margem/?utm_source=arquivo",
  );
  assert.equal(
    normalizeInternalCanonical("https://www.rook.com.br/blog/margem/", "fallback"),
    "https://www.rook.com.br/blog/margem/",
  );
  assert.equal(
    normalizeInternalCanonical("https://editorial.example/blog/margem/", "fallback"),
    "https://editorial.example/blog/margem/",
  );
  assert.equal(normalizeInternalCanonical("não é URL", "fallback"), "fallback");
});

test("next.config cobre homologação e hosts que não são o oficial com X-Robots-Tag", async () => {
  const source = await readRepoFile("next.config.mjs");
  assert.match(source, /isIndexableBuild\(process\.env\.NEXT_PUBLIC_ENV, process\.env\.VERCEL_ENV\)/);
  assert.match(source, /missing:\s*\[\{\s*type:\s*["']host["']/);
  assert.match(source, /www\\\\\.rook\\\\\.com\\\\\.br/);
  assert.match(source, /X-Robots-Tag/);
  assert.match(source, /noindex, nofollow, nosnippet/);
});

test("headers reais fecham preview e mantêm o contrato exato de noindex", async () => {
  const { default: config } = await import("../next.config.mjs");
  const previous = { environment: process.env.NEXT_PUBLIC_ENV, deployment: process.env.VERCEL_ENV };
  try {
    process.env.NEXT_PUBLIC_ENV = "production";
    process.env.VERCEL_ENV = "preview";
    const preview = (await config.headers()).find((rule) => rule.source === "/:path*");
    assert.equal(preview.missing, undefined);
    assert.deepEqual(preview.headers, [{ key: "X-Robots-Tag", value: "noindex, nofollow, nosnippet" }]);
    process.env.VERCEL_ENV = "production";
    const production = (await config.headers()).find((rule) => rule.source === "/:path*");
    assert.deepEqual(production.missing, [{ type: "host", value: "www\\.rook\\.com\\.br" }]);
    assert.deepEqual(production.headers, preview.headers);
  } finally {
    if (previous.environment === undefined) delete process.env.NEXT_PUBLIC_ENV;
    else process.env.NEXT_PUBLIC_ENV = previous.environment;
    if (previous.deployment === undefined) delete process.env.VERCEL_ENV;
    else process.env.VERCEL_ENV = previous.deployment;
  }
});

test("robots e sitemap consultam host efetivo sem tornar páginas globais dinâmicas", async () => {
  const robots = await readRepoFile("src/app/robots.ts");
  const sitemap = await readRepoFile("src/app/sitemap.ts");
  assert.match(robots, /headers\(\)/);
  assert.match(robots, /indexabilityDecision/);
  assert.match(robots, /allow: "\/"/);
  assert.match(robots, /noindex/);
  assert.match(sitemap, /headers\(\)/);
  assert.match(sitemap, /indexabilityDecision/);
  assert.match(sitemap, /return \[\]/);
});

test("artigos normalizam canonical_url de alias sem remover canonical editorial externo", async () => {
  const source = await readRepoFile("src/app/blog/[slug]/page.tsx");
  assert.match(source, /normalizeInternalCanonical/);
  assert.match(source, /const canonical = normalizeInternalCanonical\(/);
  assert.match(source, /const url = normalizeInternalCanonical\(/);
});
