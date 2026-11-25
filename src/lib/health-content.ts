/**
 * Todo o texto da LP `/health/` — Rook Health, a Rook para clínicas.
 *
 * Mesma regra da home (`lp-content.ts`): o texto mora aqui, os componentes só
 * compõem. Trocar uma frase não deve exigir abrir JSX.
 *
 * O QUE ESTA PÁGINA PODE E NÃO PODE DIZER
 *
 * A Rook Health é um teste de interesse (25/11/2026): o produto para clínicas
 * ainda não existe em produção. Por isso o texto descreve O PROBLEMA com
 * precisão e O QUE ESTAMOS CONSTRUINDO como construção — nunca "a Rook Health
 * faz", sempre "a Rook Health vai mostrar". Prometer no presente uma tela que
 * não existe é o tipo de frase que este site não publica.
 *
 * Pelo mesmo motivo não há número de mercado aqui (percentual de glosa, taxa
 * de falta): nenhum foi apurado com fonte. O painel de exemplo é ilustrativo e
 * está rotulado como tal na própria página.
 */

export const HEALTH_META = {
  title: "Rook Health — Inteligência financeira para clínicas | Rook System",
  description:
    "Atender não é receber. A Rook Health está sendo construída para mostrar, em reais, o que a clínica faturou, o que o convênio pagou, o que virou glosa e quanto sobra depois do repasse médico.",
} as const;

export const HEALTH_HERO = {
  label: "— Rook Health · para clínicas",
  // A ênfase (`em`) é a palavra que carrega a tese, como no "Faturar não é
  // lucrar." da home.
  titleBefore: "Atender não é ",
  titleEmphasis: "receber.",
  body: "Agenda cheia, guias enviadas, e no fim do mês a conta não fecha. Entre a consulta e o dinheiro no banco existem a tabela do convênio, a glosa, o prazo de pagamento e o repasse médico.",
  body2:
    "A Rook Health está sendo construída para ler esse caminho inteiro e dizer, em reais, quanto a clínica deixou de receber e o que fazer primeiro.",
  primaryCta: "Quero conhecer a Rook Health",
  secondaryCta: "Ver o que estamos construindo",
  secondaryHref: "#como",
} as const;

/**
 * Painel de exemplo do hero. Números fictícios e coerentes entre si, rotulados
 * na página. Não são dados de cliente nem média de mercado.
 */
export const HEALTH_PANEL = {
  label: "Hoje na clínica",
  disclaimer: "Exemplo ilustrativo",
  headline: "Bom dia, doutora. A agenda está cheia e o caixa fecha positivo.",
  rows: [
    { label: "Recebido de convênios no mês", value: "R$ 84.300" },
    { label: "Repasse médico a pagar", value: "R$ 31.200" },
  ],
  alert: { label: "Glosas com prazo de recurso esta semana", value: "3 guias" },
} as const;

export const HEALTH_LEAKS = {
  label: "— Onde o dinheiro da clínica escapa",
  title: "Quatro lugares em que o faturado ",
  titleEmphasis: "não vira recebido.",
  body: "Nenhum deles aparece na agenda nem no extrato do dia. Aparecem meses depois, somados, quando já não dá para recorrer.",
  items: [
    {
      title: "Glosa",
      text: "O convênio paga menos do que foi faturado e o motivo vem num demonstrativo que ninguém tem tempo de conferir guia por guia. O prazo de recurso passa.",
    },
    {
      title: "Repasse médico",
      text: "Cada profissional tem uma regra, e a conta é feita em planilha sobre o que foi agendado. Quando o convênio paga menos, a clínica já repassou sobre o valor cheio.",
    },
    {
      title: "Falta e horário vago",
      text: "O paciente que não vem não gera guia, mas a sala, a recepção e o profissional continuam custando. O custo do turno vazio não está em relatório nenhum.",
    },
    {
      title: "Particular e convênio",
      text: "O mesmo procedimento tem preços, prazos e custos diferentes em cada tabela. Sem custo por procedimento, não dá para saber qual convênio dá margem e qual só dá movimento.",
    },
  ],
} as const;

export const HEALTH_HOW = {
  label: "— O que estamos construindo",
  title: "O financeiro da clínica não precisa ser um exame que ",
  titleEmphasis: "ninguém sabe ler.",
  items: [
    {
      title: "Convênio conferido",
      text: "O que foi faturado contra o que foi pago, guia por guia, com a glosa aparecendo antes de o prazo de recurso vencer.",
    },
    {
      title: "Repasse sem planilha",
      text: "A regra de cada profissional aplicada sobre o que realmente entrou, não sobre o que foi agendado.",
    },
    {
      title: "Agenda que vira caixa",
      text: "Faltas, horários vagos e valor por atendimento lado a lado, para saber quanto vale cada turno.",
    },
  ],
} as const;

export const HEALTH_ORIGIN = {
  label: "— De onde vem",
  title: "O método que já roda em restaurantes, ",
  titleEmphasis: "agora no consultório.",
  body: "A Rook nasceu de uma consultoria de controladoria e de uma contabilidade, e virou plataforma para bares e restaurantes: ela lê vendas, notas e banco e aponta, em reais, a próxima decisão. A Rook Health leva o mesmo olhar de controller para a clínica, com o vocabulário de quem vive de convênio, glosa e repasse.",
  linkLabel: "Conhecer a história da Rook",
  linkHref: "/sobre/",
} as const;

export const HEALTH_CONTACT = {
  label: "— Primeiras clínicas",
  title: "Estamos abrindo a Rook Health com um grupo pequeno de ",
  titleEmphasis: "clínicas.",
  body: "Se a sua clínica atende convênio e você quer enxergar o que está deixando de receber, fale com a gente. A conversa é com uma pessoa da equipe, pelo WhatsApp.",
  cta: "Falar com a Rook no WhatsApp",
  // Estado sem número configurado: a página não publica botão morto.
  unavailable:
    "O canal de atendimento da Rook Health abre em breve. Volte a esta página nos próximos dias.",
  footnote: "Uma empresa Rook System.",
} as const;
