/**
 * ROO-209 — Fonte única dos dados cadastrais da entidade operacional do Rook.
 *
 * Trocar a titularidade da empresa (razão social, CNPJ, endereço, foro, DPO)
 * deve ser feito APENAS aqui — as superfícies (rodapé, /termos, /privacidade)
 * consomem deste módulo. Valores conforme o cartão CNPJ oficial.
 */
export const COMPANY_INFO = {
  razaoSocial: "ROOK SYSTEM INTELIGÊNCIA FINANCEIRA LTDA",
  nomeFantasia: "ROOK SYSTEM LTDA",
  cnpj: "67.537.706/0001-68",
  naturezaJuridica: "Sociedade Empresária Limitada",
  endereco:
    "ST SIG Quadra 4, Lote 75, Bloco C, Pavimento 1, Sala 02, Edifício Capital Financial Center, Zona Industrial, Brasília/DF, CEP 70.610-440",
  foro: "Comarca de Brasília/DF",
  dpoResponsavel: "Abdala Vega Advogados",
  dpoEmail: "juliana.abdala@abdalavega.adv.br",
  site: "rooksystem.com.br",
} as const;
