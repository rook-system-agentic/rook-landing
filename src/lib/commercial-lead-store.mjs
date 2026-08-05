import { createHash } from "node:crypto";

const SOURCE = "landing_planos";
const AUTOMATION_ACTOR = "landing:planos";

const INTEREST_LABELS = {
  knight: "Knight",
  rook: "Rook",
  chess: "Chess",
  general: "Planos",
};

const INTEREST_NOTES = {
  knight: "Faixa declarada na landing: faturamento mensal até o limite do plano Knight.",
  rook: "Faixa declarada na landing: faturamento mensal acima do limite do plano Rook.",
  chess: "Interesse declarado na landing: adicional Chess para grupo multiunidade.",
  general: "Interesse declarado na página pública de planos.",
};

const INTEREST_PRODUCTS = {
  knight: "knight",
  rook: "rook",
  chess: "chess",
  general: null,
};

export function buildCommercialLeadSourceId(lead) {
  const identity = `${SOURCE}:${lead.cnpj}:${lead.email}:${lead.interest}`;
  return createHash("sha256").update(identity).digest("hex");
}

function leadTags(interest) {
  return ["LP", INTEREST_LABELS[interest]];
}

export function createCommercialLeadPersistence(adminRequest) {
  async function findExisting(sourceId) {
    const rows = await adminRequest(
      `crm_deals?source=eq.${SOURCE}&source_id=eq.${sourceId}&select=id,stage&limit=1`,
    );
    return rows?.[0] ?? null;
  }

  async function recordEvent(dealId, fromStage, toStage) {
    await adminRequest("crm_deal_events", {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify([
        {
          deal_id: dealId,
          from_stage: fromStage,
          to_stage: toStage,
          actor_email: AUTOMATION_ACTOR,
        },
      ]),
      allowEmpty: true,
    });
  }

  async function preserveExisting(existing, lead) {
    // Uma submissão pública não é autenticação suficiente para alterar um
    // contato ou uma oportunidade já acompanhada pelo Comercial. O evento
    // de estágio para o mesmo estágio registra o reenvio sem tocar no card.
    await recordEvent(existing.id, existing.stage, existing.stage);
    return { id: existing.id, created: false, stage: existing.stage };
  }

  async function createOrUpdateCommercialLead(lead) {
    const sourceId = buildCommercialLeadSourceId(lead);
    const existing = await findExisting(sourceId);
    if (existing) return preserveExisting(existing, lead);

    const lastPosition = await adminRequest(
      "crm_deals?stage=eq.lead&select=position&order=position.desc&limit=1",
    );
    const position = (Number(lastPosition?.[0]?.position) || 0) + 1000;
    const row = {
      name: lead.name,
      company: lead.company,
      product: INTEREST_PRODUCTS[lead.interest],
      email: lead.email,
      phone: lead.phone,
      cnpj: lead.cnpj,
      stage: "lead",
      position,
      source: SOURCE,
      source_id: sourceId,
      tags: leadTags(lead.interest),
      notes: INTEREST_NOTES[lead.interest],
      created_by: "landing:planos",
    };

    let inserted;
    try {
      inserted = await adminRequest("crm_deals", {
        method: "POST",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify([row]),
      });
    } catch (error) {
      // O índice único (source, source_id) resolve a corrida. O contato que
      // perdeu a disputa é preservado e este reenvio ganha evento próprio.
      if (error instanceof Error && error.message.includes(" 409 ")) {
        const raced = await findExisting(sourceId);
        if (raced) return preserveExisting(raced, lead);
      }
      throw error;
    }

    const deal = inserted?.[0];
    if (!deal) throw new Error("CRM não retornou o negócio criado.");

    await recordEvent(deal.id, null, "lead");
    return { id: deal.id, created: true, stage: deal.stage };
  }

  return { createOrUpdateCommercialLead };
}
