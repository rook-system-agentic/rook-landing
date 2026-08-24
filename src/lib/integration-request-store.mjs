import { createHash } from "node:crypto";

/**
 * Gravação da solicitação de integração no CRM.
 *
 * Vai para `crm_deals`, a mesma tabela do formulário de planos, com `source`
 * próprio. Não é preguiça: o pedido de integração É um lead — alguém deixou
 * nome, e-mail e telefone dizendo qual sistema usa —, e o Comercial já trabalha
 * nesse quadro. Tabela separada significaria uma segunda caixa de entrada que
 * ninguém abre.
 *
 * O `source` distinto é o que permite separar quando interessa: quantos pedidos
 * por sistema, e quais viraram conversa.
 *
 * O padrão de idempotência é o mesmo de `commercial-lead-store`: `source_id`
 * derivado do conteúdo, e reenvio do mesmo pedido NÃO altera um card já em
 * andamento — registra o evento e preserva o que o time estiver acompanhando.
 * Submissão pública não é autenticação suficiente para mexer em oportunidade.
 */

const SOURCE = "landing_integracao";
const AUTOMATION_ACTOR = "landing:integracao";

export function buildIntegrationRequestSourceId(pedido) {
  const identidade = `${SOURCE}:${pedido.email}:${pedido.sistema}:${pedido.sistemaNome.toLowerCase()}`;
  return createHash("sha256").update(identidade).digest("hex");
}

export function createIntegrationRequestPersistence(adminRequest) {
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
        { deal_id: dealId, from_stage: fromStage, to_stage: toStage, actor_email: AUTOMATION_ACTOR },
      ]),
      allowEmpty: true,
    });
  }

  async function preserveExisting(existing) {
    await recordEvent(existing.id, existing.stage, existing.stage);
    return { id: existing.id, created: false, stage: existing.stage };
  }

  async function createOrUpdateIntegrationRequest(pedido) {
    const sourceId = buildIntegrationRequestSourceId(pedido);
    const existing = await findExisting(sourceId);
    if (existing) return preserveExisting(existing);

    const lastPosition = await adminRequest(
      "crm_deals?stage=eq.lead&select=position&order=position.desc&limit=1",
    );
    const position = (Number(lastPosition?.[0]?.position) || 0) + 1000;

    const row = {
      name: pedido.nome,
      email: pedido.email,
      phone: pedido.telefone,
      stage: "lead",
      position,
      source: SOURCE,
      source_id: sourceId,
      /* A etiqueta carrega o sistema: é por ela que o time prioriza. */
      tags: ["LP", "Integração", pedido.sistemaNome],
      notes: `Solicitou integração com ${pedido.sistemaNome}, pela página de integrações da landing.`,
      created_by: AUTOMATION_ACTOR,
    };

    let inserted;
    try {
      inserted = await adminRequest("crm_deals", {
        method: "POST",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify([row]),
      });
    } catch (error) {
      // O índice único (source, source_id) resolve a corrida entre dois envios
      // simultâneos do mesmo pedido.
      if (error instanceof Error && error.message.includes(" 409 ")) {
        const raced = await findExisting(sourceId);
        if (raced) return preserveExisting(raced);
      }
      throw error;
    }

    const deal = inserted?.[0];
    if (deal?.id) await recordEvent(deal.id, null, "lead");
    return { id: deal?.id ?? null, created: true, stage: "lead" };
  }

  return { createOrUpdateIntegrationRequest };
}
