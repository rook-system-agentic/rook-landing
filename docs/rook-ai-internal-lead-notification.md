# Aviso interno de novo lead — contrato preparado

> Recorte de interface de produção (18/09/2026): o formatter continua sem chamador na landing. A UI incorpora o formulário e o widget; os avisos operacionais no Slack pertencem à integração do ADM. Este documento preserva o contrato histórico e não comprova ativação de WhatsApp. A validação de 15/09 não substitui os checks desta entrega.

**Estado em 15/09/2026:** formatter puro e testes locais. Nenhum envio, destinatário, credencial, template, fila ou ativação. A rota de cadastro permanece como está; não importa este módulo.

## Entrada e saída

`src/lib/internal-lead-card.mjs` exporta `buildInternalLeadCard({lead, receipt})`.

- `lead`: resultado aprovado por `validateAcquisition`, no servidor. Não usar corpo HTTP bruto nem a prosa do agente.
- `receipt`: `contactId`, `dealId` e `persistedAt` ISO UTC normalizado. O chamador deve obtê-lo após resposta válida de persistência do CRM. Os IDs têm validação sintática UUID; o formatter, por ser puro, **não consulta nem prova a existência do registro**.
- Saída: versão, `deliveryState: prepared`, `source: site_form`, `notificationKey`, referências, proveniência do diagnóstico e `body` em texto simples.
- O módulo não tem parâmetro de destinatário, API key, template ou URL externa. Não faz rede, gravação ou agendamento.

A chave de notificação usa a solicitação do formulário e permanece igual em reenvios. Ela é uma identidade proposta para a futura fila; não é prova de deduplicação ou entrega. O chamador não deve interpretar `prepared` como `sent`.

O texto contém estabelecimento, responsável, telefone, e-mail, cidade/UF/IBGE, segmento, faixa de faturamento bruto, ERP/PDV, intenção e contexto financeiro. Ausência de diagnóstico aparece como ausência; dados parciais não se tornam zero nem resultado confirmado.

O cenário completo é recalculado a partir das entradas com o motor determinístico atual do Rook. O texto inclui período, base, entradas, fórmula e premissas. `simulation.summary` e `simulation.result` recebidos são ignorados. Resultado nativo do AsaFlow não deve ser enviado por este caminho como se tivesse sido verificado pelo Rook; precisará de um adaptador do contexto SDR com proveniência própria.

O único link construído é a rota de contato observada no AsaFlow: `https://app.asaflow.com.br/contatos/{contactId}`. O negócio aparece pelo identificador. Nenhuma rota de card ADM, negócio ou agendamento foi inventada. O contrato não possui campo para afirmar reunião confirmada.

## Onde ligar quando a infraestrutura estiver definida

1. O formulário valida e grava contato/negócio pelo adaptador existente. A resposta do CRM fornece os IDs.
2. Um componente de servidor com armazenamento durável registra a intenção de aviso, com referência da solicitação e destinatário interno verificado. Não confiar em tarefa sem `await` depois de responder HTTP.
3. Uma fila/outbox impõe unicidade por evento de cadastro e destinatário; reenvio do formulário não produz outro aviso. Correção de diagnóstico é outro tipo de evento, ainda fora deste contrato.
4. Um worker monta o card e usa o canal oficial escolhido. Falha do aviso não apaga nem recria o lead que já foi salvo. A reconciliação precisa recuperar cadastro salvo quando houver falha antes de gravar a outbox.
5. Persistir identificador da mensagem do fornecedor e estados separados: preparado, enviado/aceito, entregue ou falhou. Timeout exige reconciliação antes de repetir; `200` de aceite não é confirmação de entrega.

Essa infraestrutura, o provedor, o destinatário, a eventual exigência de template e a confirmação de entrega **ainda não estão implementados**. Não foi presumida autorização ou configuração de um número de WhatsApp. A mensagem contém dados pessoais e financeiros e deve ficar restrita ao destinatário interno definido.

## Configuração que falta validar no formulário

O código da rota `/api/acquisition/` exige:

| Item | Verificação necessária |
| --- | --- |
| `ASAFLOW_ACQUISITION_ENABLED` | Habilitar apenas no ambiente de teste delimitado, quando destinos estiverem conferidos. Atualmente o exemplo do projeto é `false`. |
| `ASAFLOW_ACQUISITION_API_KEY` | Credencial somente de servidor; conferir escopos de leitura/gravação de contatos e negócios conforme contrato público adotado. Nunca usar a chave pública do widget aqui. |
| `ASAFLOW_ACQUISITION_PIPELINE_ID` | ID do funil de aquisição escolhido. Confirmar a qual workspace pertence. |
| `ASAFLOW_ACQUISITION_STAGE_ID` | ID de etapa aberta pertencente a esse funil; não presumir que um UUID isolado é o destino correto. |
| `SUPABASE_URL` ou `NEXT_PUBLIC_SUPABASE_URL` | Projeto que contém a proteção distribuída utilizada pela landing. |
| `SUPABASE_SERVICE_ROLE_KEY` | Somente servidor, com acesso à RPC `consume_commercial_lead_abuse_gate`. A existência da variável não comprova que a RPC funciona. |
| `COMMERCIAL_LEAD_ABUSE_SECRET` | Segredo de pelo menos 32 caracteres; o código atual usa a service role como alternativa quando ele não existe. Conferir a configuração sem imprimir valores. |
| IP encaminhado | O ambiente precisa fornecer um dos cabeçalhos IP aceitos; sem IP, o desafio falha fechado. |

Para o chat são outros controles: `NEXT_PUBLIC_ASAFLOW_CHAT_ENABLED`, `NEXT_PUBLIC_ASAFLOW_CHAT_TENANT` e `NEXT_PUBLIC_ASAFLOW_CHAT_FLOW`. Tenant e flow são os slugs públicos do link externo do fluxo. A chave antiga do snippet não é mais usada pelo wrapper. `NEXT_PUBLIC_ENV=homolog` bloqueia o widget real no código atual; a prévia visual não testa a integração. `?preview=1` só impede envio do formulário quando o ambiente é homolog. Ver [montagem persistente do chat](rook-ai-chat-persistente.md).

Inspeção local desta rodada verificou somente existência dos arquivos `.env`, `.env.local`, `.env.development` e `.env.development.local`: **todos ausentes**. Não foram lidos valores secretos, não foram editadas variáveis e não foi inspecionada a configuração do Vercel ou do processo já em execução. Portanto, não se conclui que o ambiente remoto está sem configuração.

## Prova de integração ainda necessária

Com dados fictícios identificados e destinos de teste definidos:

1. GET da rota emite desafio; POST com prova válida registra contato e negócio. Conferir a existência pelos IDs retornados ao servidor, sem expor esses dados em analytics.
2. Repetir a mesma solicitação após simular perda da resposta e conferir uma oportunidade, dentro das garantias de idempotência do fornecedor. Novo cadastro com nova solicitação é outro evento; identidade única entre formulário e chat ainda depende da integração.
3. Conferir webhook autenticado, projeção no ADM e contexto exibido, inclusive correções posteriores.
4. Registrar outbox uma única vez para o destinatário interno e confrontar resposta/recibo do canal. Só então classificar como aviso entregue.

O formatter não conclui essas quatro etapas. O adapter público atual limita sua idempotência ao período documentado pelo fornecedor; a nova chave de notificação não amplia essa garantia do CRM.

## Validação local

`node --test tests/internal-lead-card.test.mjs`

Dez testes cobrem cadastro completo, chave estável, recibo inválido, ERP, cálculo independente de texto recebido, correção de entrada, base/período/segmento incoerentes, diagnóstico incompleto, dados livres em uma linha e consentimento/perfil ausentes. A suíte entra automaticamente no executor `test:ci`. Não usa rede nem envia mensagens.

Também executados: `node scripts/run-ci-tests.mjs` (**180/180 testes em 23 suítes**), `tsc --noEmit --incremental false` e `git diff --check`, todos aprovados. A exclusão preexistente de `billing-catalog.test.mjs` foi mantida; nenhum build ou sync de catálogo foi executado.
