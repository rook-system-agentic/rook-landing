/**
 * Travas da LP da Rook Health — `/health/` (25/11/2026).
 *
 * O QUE ESTA SUÍTE PROTEGE
 *
 * 1. O botão de WhatsApp só existe com número válido. A variável é digitada à
 *    mão no painel da Vercel; um dígito a menos não pode virar um link público
 *    para o telefone de um desconhecido.
 * 2. A página é de teste: `noindex` e fora do sitemap. Entrar no índice
 *    prometendo um produto que ainda não existe é exatamente o que ela não
 *    pode fazer. Quando a Health virar oferta, esta trava muda junto, de
 *    propósito.
 * 3. O funil de restaurantes (demonstração e chat do rodapé) não aparece para
 *    quem tem clínica.
 * 4. A página não promete no presente o que ainda está em construção.
 */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  HEALTH_CONTACT_ANCHOR,
  HEALTH_TRACKING_DESTINATION,
  HEALTH_WHATSAPP_MESSAGE,
  healthWhatsappHref,
  normalizeHealthWhatsappNumber,
} from "../src/lib/health-whatsapp.mjs";
import { buildTrackingEvent, TRACKING_EVENTS } from "../src/lib/tracking-events.mjs";

const ler = (caminho) => readFile(new URL(`../${caminho}`, import.meta.url), "utf8");

test("número de WhatsApp aceita celular e fixo brasileiros, com ou sem máscara", () => {
  assert.equal(normalizeHealthWhatsappNumber("5561999990000"), "5561999990000");
  assert.equal(normalizeHealthWhatsappNumber("+55 (61) 9 9999-0000"), "5561999990000");
  assert.equal(normalizeHealthWhatsappNumber("55 61 3333-0000"), "556133330000");
});

test("número ausente, curto, sem DDI ou de outro país não vira link", () => {
  for (const invalido of [undefined, null, "", "61999990000", "556199999000", "55619999900001", "5501999990000", "15551234567", 5561999990000]) {
    assert.equal(healthWhatsappHref(invalido), null, `deveria recusar ${String(invalido)}`);
  }
});

test("o link abre a conversa com a mensagem pronta codificada", () => {
  const href = healthWhatsappHref("5561999990000");
  assert.equal(href, `https://wa.me/5561999990000?text=${encodeURIComponent(HEALTH_WHATSAPP_MESSAGE)}`);
  assert.doesNotMatch(href, / /);
  assert.equal(new URL(href).searchParams.get("text"), HEALTH_WHATSAPP_MESSAGE);
});

test("o clique medido cabe na allowlist e não leva nada do visitante", () => {
  assert.deepEqual(
    buildTrackingEvent(TRACKING_EVENTS.ctaClick, { destination: HEALTH_TRACKING_DESTINATION }),
    { event: "cta_click", destination: "health_whatsapp" },
  );
  return ler("src/components/health/HealthWhatsappCta.tsx").then((fonte) => {
    assert.match(fonte, /track\(TRACKING_EVENTS\.ctaClick, \{ destination: HEALTH_TRACKING_DESTINATION \}\)/);
    assert.match(fonte, /rel="noopener noreferrer"/);
  });
});

test("a página é noindex, tem canonical própria e fica fora do sitemap", async () => {
  const [pagina, sitemap] = await Promise.all([ler("src/app/health/page.tsx"), ler("src/app/sitemap.ts")]);
  assert.match(pagina, /robots: \{ index: false, follow: true \}/);
  assert.match(pagina, /canonical: PAGE_URL/);
  assert.match(pagina, /siteUrl\("\/health\/"\)/);
  assert.doesNotMatch(sitemap, /health/);
});

test("sem número configurado a página mostra o aviso, não um botão morto", async () => {
  const pagina = await ler("src/app/health/page.tsx");
  assert.match(pagina, /healthWhatsappHref\(process\.env\.HEALTH_WHATSAPP_NUMBER\)/);
  assert.match(pagina, /whatsappHref \? \(/);
  assert.match(pagina, /HEALTH_CONTACT\.unavailable/);
});

test("demonstração e chat de restaurantes não aparecem em /health", async () => {
  const [escopo, cabecalho] = await Promise.all([
    ler("src/components/RouteScopedAcquisition.tsx"),
    ler("src/components/Header.tsx"),
  ]);
  assert.match(escopo, /HEALTH_PATHS = new Set\(\["\/health", "\/health\/"\]\)/);
  assert.match(escopo, /HEALTH_PATHS\.has\(pathname\)/);
  // O CTA do cabeçalho não pode apontar para #cadastro, que não existe nesta rota.
  assert.match(cabecalho, /isHealth \? HEALTH_CONTACT_ANCHOR/);
  assert.equal(HEALTH_CONTACT_ANCHOR, "#contato");
  const pagina = await ler("src/app/health/page.tsx");
  assert.match(pagina, /<section id="contato"/);
});

test("a paleta da Health é escopada e não vaza para o resto do site", async () => {
  const css = await ler("src/app/globals.css");
  assert.match(css, /body:has\(\[data-health\]\) \{\s*--color-cta: #2e7d32;/);
  const pagina = await ler("src/app/health/page.tsx");
  assert.match(pagina, /<div data-health>/);
});

test("o texto trata a Health como construção, não como produto pronto", async () => {
  const conteudo = await ler("src/lib/health-content.ts");
  const semComentarios = conteudo.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
  assert.match(semComentarios, /está sendo construída/);
  assert.match(semComentarios, /Exemplo ilustrativo/);
  // Percentual de mercado sem fonte não entra nesta página.
  assert.doesNotMatch(semComentarios, /\d+\s?%/);
});

test("cabeçalho e rodapé trocam a marca e os links de restaurante em /health", async () => {
  const [cabecalho, rodape, layout, escopo] = await Promise.all([
    ler("src/components/Header.tsx"),
    ler("src/components/Footer.tsx"),
    ler("src/app/layout.tsx"),
    ler("src/components/RouteScopedFooter.tsx"),
  ]);
  // Logo da Health nos dois temas, levando à própria LP e não à home.
  assert.match(cabecalho, /href="\/health\/"[^>]*aria-label="Rook Health - Início"/);
  assert.match(cabecalho, /rook-health-logo-horizontal-light\.webp/);
  assert.match(cabecalho, /rook-health-logo-horizontal\.webp/);
  // Navegação e login do produto de restaurantes não aparecem.
  assert.match(cabecalho, /const links = isHealth \? \[\] : navLinks;/);
  assert.equal(cabecalho.match(/\{isHealth \? null : <a href="https:\/\/app\.rook\.com\.br\/login"/g)?.length, 2);
  // O rodapé da Health não oferece CMV, diagnóstico nem #cadastro.
  const ramoHealth = rodape.slice(rodape.indexOf("{health ? (\n          <>"), rodape.indexOf(") : (\n          <>"));
  assert.match(ramoHealth, /\/health\/#contato/);
  assert.doesNotMatch(ramoHealth, /cadastro|calculadora-cmv|diagnostico|restaurantes\//);
  assert.match(layout, /<RouteScopedFooter health=\{<Footer variant="health" \/>\}><Footer \/><\/RouteScopedFooter>/);
  assert.match(escopo, /HEALTH_PATHS\.has\(usePathname\(\)\) \? health : children/);
});

test("os logos da Health existem e cabem no limite de arte de marca", async () => {
  const { stat } = await import("node:fs/promises");
  for (const arquivo of ["rook-health-logo-horizontal-light.webp", "rook-health-logo-horizontal.webp"]) {
    const { size } = await stat(new URL(`../public/brand/${arquivo}`, import.meta.url));
    assert.ok(size > 0 && size <= 20 * 1024, `${arquivo} tem ${size} bytes`);
  }
});

test("a aba e o compartilhamento de /health usam a arte verde da Health", async () => {
  const { stat } = await import("node:fs/promises");
  const [pagina, og] = await Promise.all([ler("src/app/health/page.tsx"), ler("src/lib/og-image.ts")]);
  assert.match(pagina, /icons: HEALTH_ICONS,/);
  assert.match(pagina, /images: \[HEALTH_OG_IMAGE\],/);
  assert.match(pagina, /images: \[HEALTH_OG_IMAGE\.url\],/);
  // A arte da Rook ("Faturar não é lucrar", restaurante) não volta para esta rota.
  assert.doesNotMatch(pagina, /\bOG_IMAGE\b/);
  // Todo arquivo que o metadata anuncia existe; a arte de OG é PNG (ver og-image.ts).
  const anunciados = [...og.slice(og.indexOf("HEALTH_OG_IMAGE")).matchAll(/url: "(\/(?:og|health)\/[^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(anunciados, [
    "/og/rook-health-og.png",
    "/health/favicon.ico",
    "/health/icon-192.png",
    "/health/apple-touch-icon.png",
  ]);
  for (const caminho of anunciados) {
    const { size } = await stat(new URL(`../public${caminho}`, import.meta.url));
    assert.ok(size > 0, `${caminho} está vazio`);
  }
});

test("os números ilustrativos saem de uma fonte só e a conta fecha", async () => {
  const conteudo = await ler("src/lib/health-content.ts");
  // `recebido` e `sobra` são calculados, não digitados: o painel do hero e o
  // "caminho do dinheiro" não podem divergir (docs/design-v4.md).
  assert.match(conteudo, /recebido: FATURADO - GLOSA,/);
  assert.match(conteudo, /sobra: FATURADO - GLOSA - REPASSE - CUSTOS,/);
  assert.match(conteudo, /value: HEALTH_EXEMPLO\.recebido/);
  const n = (nome) => Number(conteudo.match(new RegExp(`const ${nome} = (\\d+);`))[1]);
  const sobra = n("FATURADO") - n("GLOSA") - n("REPASSE") - n("CUSTOS");
  assert.ok(sobra > 0 && sobra < n("FATURADO"), `sobra ilustrativa incoerente: ${sobra}`);
  // O gráfico é rotulado como exemplo na própria figura.
  assert.match(conteudo, /disclaimer: "Exemplo ilustrativo\. Não é dado de cliente nem média de mercado\."/);
  assert.match(await ler("src/components/health/HealthMoneyPath.tsx"), /<figcaption[^>]*>\{HEALTH_PATH\.disclaimer\}/);
});

test("o movimento da Health respeita as regras da LP", async () => {
  const [css, valor, arte, pagina] = await Promise.all([
    ler("src/app/globals.css"),
    ler("src/components/health/HealthMoney.tsx"),
    ler("src/components/health/HealthArt.tsx"),
    ler("src/app/health/page.tsx"),
  ]);
  // Toda animação da Health vive dentro de `no-preference`: desligar é o padrão.
  const bloco = css.slice(css.indexOf("Movimento da Health"));
  const fora = bloco.slice(0, bloco.indexOf("@media (prefers-reduced-motion: no-preference)"));
  assert.doesNotMatch(fora, /animation:/);
  // O valor final já vai no HTML servido; a contagem só assume depois.
  assert.match(valor, /useState\(valor\)/);
  assert.match(valor, /prefers-reduced-motion: reduce/);
  // Ilustração é decorativa e o balão mostra a mensagem que o link envia.
  assert.match(arte, /aria-hidden="true"/);
  assert.match(pagina, /mensagem=\{HEALTH_WHATSAPP_MESSAGE\}/);
});

test("a foto do hero tem tamanhos próprios, espaço reservado e não finge depoimento", async () => {
  const { stat } = await import("node:fs/promises");
  const [pagina, conteudo] = await Promise.all([ler("src/app/health/page.tsx"), ler("src/lib/health-content.ts")]);
  // `images.unoptimized`: os tamanhos são os arquivos. O maior não passa de 250 KB.
  for (const [arquivo, teto] of [["hero-clinica-800.webp", 110], ["hero-clinica-1400.webp", 250]]) {
    assert.match(conteudo, new RegExp(`/health/${arquivo}`));
    const { size } = await stat(new URL(`../public/health/${arquivo}`, import.meta.url));
    assert.ok(size > 0 && size <= teto * 1024, `${arquivo} tem ${size} bytes`);
  }
  assert.match(pagina, /srcSet=\{HEALTH_HERO\.photo\.srcSet\}/);
  assert.match(pagina, /width=\{1400\}\s+height=\{1045\}/);
  assert.match(pagina, /alt=\{HEALTH_HERO\.photo\.alt\}/);
  // Ambientação gerada por IA: sem legenda que a faça parecer cliente.
  assert.doesNotMatch(pagina, /<figcaption[^>]*>[^<]*(Dra\.|CRM|cliente)/);
});

test("\"De onde vem\" se apoia na consultoria, sem comparar a clínica com restaurante", async () => {
  // Gabriel, 25/11/2026: a credencial para o dono de clínica é a consultoria
  // de controladoria e reestruturação, não o produto de restaurantes.
  const conteudo = await readFile(new URL("../src/lib/health-content.ts", import.meta.url), "utf8");
  const inicio = conteudo.indexOf("export const HEALTH_ORIGIN");
  const origem = conteudo.slice(inicio, conteudo.indexOf("} as const;", inicio));
  assert.doesNotMatch(origem, /restaurante|bares/i);
  assert.match(origem, /controladoria/);
  assert.match(origem, /reestruturação/);
  // Sem detalhe de pessoa nem de cliente, por decisão do Gabriel (25/11/2026).
  assert.doesNotMatch(origem, /Eraldo|Santa Casa|leitos/);
});
