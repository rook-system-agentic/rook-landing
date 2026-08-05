import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  buildCommercialLeadSourceId,
  createCommercialLeadPersistence,
} from "../src/lib/commercial-lead-store.mjs";
import { validateCommercialLeadInput } from "../src/lib/commercial-lead-validation.mjs";

const validCandidate = {
  name: "Maria Silva",
  company: "Restaurante Exemplo",
  email: "MARIA@EXEMPLO.COM.BR",
  phone: "(61) 99999-9999",
  cnpj: "11.222.333/0001-81",
  interest: "chess",
  website: "",
};

const normalizedLead = {
  name: "Maria Silva",
  company: "Restaurante Exemplo",
  email: "maria@exemplo.com.br",
  phone: "(61) 99999-9999",
  cnpj: "11222333000181",
  interest: "chess",
};

function createPostgrestMock({ deals = [], conflictWinner = null } = {}) {
  const state = {
    calls: [],
    deals: deals.map((deal) => structuredClone(deal)),
    events: [],
  };
  let conflict = conflictWinner ? structuredClone(conflictWinner) : null;
  let sequence = state.deals.length + 1;

  async function adminRequest(path, options = {}) {
    const method = options.method ?? "GET";
    state.calls.push({ path, method, body: options.body ?? null });

    if (method === "GET" && path.startsWith("crm_deals?source=eq.")) {
      const sourceId = path.match(/source_id=eq\.([^&]+)/)?.[1];
      return state.deals
        .filter(
          (deal) =>
            deal.source === "landing_planos" && deal.source_id === sourceId,
        )
        .slice(0, 1)
        .map(({ id, stage }) => ({ id, stage }));
    }

    if (method === "GET" && path.startsWith("crm_deals?stage=eq.lead")) {
      const positions = state.deals
        .filter((deal) => deal.stage === "lead")
        .map((deal) => Number(deal.position) || 0)
        .sort((left, right) => right - left);
      return positions.length > 0 ? [{ position: positions[0] }] : [];
    }

    if (method === "POST" && path === "crm_deals") {
      const [row] = JSON.parse(options.body);
      if (conflict) {
        state.deals.push({ ...row, ...conflict });
        conflict = null;
        throw new Error("[supabase-admin] 409 Conflict: duplicate key value");
      }

      const saved = { ...row, id: `deal-${sequence}` };
      sequence += 1;
      state.deals.push(saved);
      return [{ id: saved.id, stage: saved.stage }];
    }

    if (method === "POST" && path === "crm_deal_events") {
      state.events.push(...JSON.parse(options.body));
      return null;
    }

    if (method === "PATCH") {
      throw new Error("Submissões públicas não podem executar PATCH no CRM.");
    }

    throw new Error(`Chamada PostgREST inesperada: ${method} ${path}`);
  }

  return { adminRequest, state };
}

test("normaliza e valida um lead comercial completo", () => {
  const result = validateCommercialLeadInput(validCandidate);

  assert.equal(result.ok, true);
  assert.equal(result.honeypot, false);
  assert.deepEqual(result.value, normalizedLead);
});

test("rejeita CNPJ, telefone, e-mail e interesse inválidos", () => {
  const result = validateCommercialLeadInput({
    ...validCandidate,
    name: "A",
    email: "invalido",
    phone: "123",
    cnpj: "11.111.111/1111-11",
    interest: "pawn",
  });

  assert.equal(result.ok, false);
  assert.deepEqual(Object.keys(result.errors).sort(), [
    "cnpj",
    "email",
    "interest",
    "name",
    "phone",
  ]);
});

test("honeypot encerra a submissão sem produzir lead", () => {
  const result = validateCommercialLeadInput({
    ...validCandidate,
    website: "https://spam.example",
  });

  assert.deepEqual(result, { ok: true, honeypot: true, value: null });
});

test("PostgREST cria leads separados para contatos distintos do mesmo CNPJ", async () => {
  const mock = createPostgrestMock();
  const persistence = createCommercialLeadPersistence(mock.adminRequest);
  const secondContact = {
    ...normalizedLead,
    name: "João Souza",
    email: "joao@exemplo.com.br",
    phone: "(61) 98888-7777",
  };

  const first = await persistence.createOrUpdateCommercialLead(normalizedLead);
  const second = await persistence.createOrUpdateCommercialLead(secondContact);

  assert.equal(first.created, true);
  assert.equal(second.created, true);
  assert.equal(mock.state.deals.length, 2);
  assert.notEqual(mock.state.deals[0].source_id, mock.state.deals[1].source_id);
  assert.deepEqual(
    mock.state.deals.map(({ stage, source, product, tags }) => ({ stage, source, product, tags })),
    [
      {
        stage: "lead",
        source: "landing_planos",
        product: "chess",
        tags: ["LP", "Chess"],
      },
      {
        stage: "lead",
        source: "landing_planos",
        product: "chess",
        tags: ["LP", "Chess"],
      },
    ],
  );
  assert.deepEqual(
    mock.state.events.map(({ from_stage, to_stage, actor_email }) => ({
      from_stage,
      to_stage,
      actor_email,
    })),
    [
      { from_stage: null, to_stage: "lead", actor_email: "landing:planos" },
      { from_stage: null, to_stage: "lead", actor_email: "landing:planos" },
    ],
  );
});

test("PostgREST registra reenvio de lead sem sobrescrever o contato", async () => {
  const sourceId = buildCommercialLeadSourceId(normalizedLead);
  const original = {
    id: "deal-lead",
    name: "Contato original",
    company: "Empresa original",
    email: normalizedLead.email,
    phone: "(61) 90000-0000",
    cnpj: normalizedLead.cnpj,
    interest: normalizedLead.interest,
    stage: "lead",
    source: "landing_planos",
    source_id: sourceId,
    position: 1000,
  };
  const mock = createPostgrestMock({ deals: [original] });
  const persistence = createCommercialLeadPersistence(mock.adminRequest);

  const result = await persistence.createOrUpdateCommercialLead({
    ...normalizedLead,
    name: "Nome não autenticado",
    company: "Empresa não autenticada",
    phone: "(61) 91111-1111",
  });

  assert.deepEqual(result, { id: original.id, created: false, stage: "lead" });
  assert.deepEqual(mock.state.deals[0], original);
  assert.equal(mock.state.calls.some((call) => call.method === "PATCH"), false);
  assert.deepEqual(mock.state.events, [
    {
      deal_id: original.id,
      from_stage: "lead",
      to_stage: "lead",
      actor_email: "landing:planos",
    },
  ]);
});

for (const stage of ["proposta", "fechado", "perdido"]) {
  test(`PostgREST preserva negócio em ${stage} e registra o reenvio`, async () => {
    const sourceId = buildCommercialLeadSourceId(normalizedLead);
    const original = {
      id: `deal-${stage}`,
      name: "Contato acompanhado",
      company: "Empresa acompanhada",
      email: normalizedLead.email,
      phone: "(61) 90000-0000",
      cnpj: normalizedLead.cnpj,
      stage,
      source: "landing_planos",
      source_id: sourceId,
      position: 1000,
    };
    const mock = createPostgrestMock({ deals: [original] });
    const persistence = createCommercialLeadPersistence(mock.adminRequest);

    const result = await persistence.createOrUpdateCommercialLead({
      ...normalizedLead,
      name: "Tentativa pública de alteração",
      phone: "(61) 92222-2222",
    });

    assert.deepEqual(result, { id: original.id, created: false, stage });
    assert.deepEqual(mock.state.deals[0], original);
    assert.equal(mock.state.calls.some((call) => call.method === "PATCH"), false);
    assert.deepEqual(mock.state.events, [
      {
        deal_id: original.id,
        from_stage: stage,
        to_stage: stage,
        actor_email: "landing:planos",
      },
    ]);
  });
}

test("PostgREST resolve corrida 409 sem sobrescrever o contato vencedor", async () => {
  const mock = createPostgrestMock({
    conflictWinner: {
      id: "deal-winner",
      name: "Contato vencedor",
      company: "Empresa vencedora",
      phone: "(61) 93333-3333",
      stage: "lead",
    },
  });
  const persistence = createCommercialLeadPersistence(mock.adminRequest);

  const result = await persistence.createOrUpdateCommercialLead(normalizedLead);

  assert.deepEqual(result, { id: "deal-winner", created: false, stage: "lead" });
  assert.equal(mock.state.deals.length, 1);
  assert.equal(mock.state.deals[0].name, "Contato vencedor");
  assert.equal(mock.state.deals[0].phone, "(61) 93333-3333");
  assert.equal(mock.state.calls.some((call) => call.method === "PATCH"), false);
  assert.deepEqual(mock.state.events, [
    {
      deal_id: "deal-winner",
      from_stage: "lead",
      to_stage: "lead",
      actor_email: "landing:planos",
    },
  ]);
});

test("integração mantém credencial no servidor e contrato canônico do CRM", async () => {
  const [routeSource, wrapperSource, persistenceSource, adminSource] = await Promise.all([
    readFile(new URL("../src/app/api/commercial-leads/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../src/lib/commercial-leads.ts", import.meta.url), "utf8"),
    readFile(new URL("../src/lib/commercial-lead-store.mjs", import.meta.url), "utf8"),
    readFile(new URL("../src/lib/supabase-admin.ts", import.meta.url), "utf8"),
  ]);

  assert.match(routeSource, /MAX_BODY_BYTES/);
  assert.match(routeSource, /validateCommercialLeadInput/);
  assert.match(persistenceSource, /stage:\s*"lead"/);
  assert.match(persistenceSource, /SOURCE\s*=\s*"landing_planos"/);
  assert.match(persistenceSource, /\["LP", INTEREST_LABELS\[interest\]\]/);
  assert.match(persistenceSource, /knight:\s*"knight"/);
  assert.match(persistenceSource, /rook:\s*"rook"/);
  assert.match(persistenceSource, /chess:\s*"chess"/);
  assert.match(persistenceSource, /general:\s*null/);
  assert.match(persistenceSource, /createHash\("sha256"\)/);
  assert.doesNotMatch(persistenceSource, /method:\s*"PATCH"/);
  assert.match(wrapperSource, /^import "server-only";/);
  assert.match(adminSource, /^import "server-only";/);
  assert.doesNotMatch(
    `${routeSource}\n${wrapperSource}\n${persistenceSource}`,
    /NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY/,
  );
});
