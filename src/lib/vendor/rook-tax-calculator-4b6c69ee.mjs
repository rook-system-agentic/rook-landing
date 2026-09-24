/**
 * Snapshot do motor de diagnóstico Rook — não editar fórmulas neste arquivo.
 * Origem: https://github.com/rook-system-agentic/rook-system/blob/4b6c69ee6d20c16c4e21099f2315ab6f0d7abdcf/apps/web/src/lib/tax-calculator.ts
 * Commit de origem: 4b6c69ee6d20c16c4e21099f2315ab6f0d7abdcf
 * SHA-256 do TypeScript de origem: 877ded5a2d2dc2ddd684025738970aa8bf66df4af22fb98f99a40c4c052687dc
 * Extraído em 2026-09-24 com node:module.stripTypeScriptTypes(mode='strip').
 * Tipos removidos e espaços finais limpos; fórmulas e constantes são as da origem.
 * Este snapshot é versionado e não consulta fiscal.tax_parameters em tempo real.
 * Atualizações devem partir de uma nova revisão da origem e repetir a validação.
 */

/**
 * Tax Calculator v2.2 — Motor de Cálculo Tributário Avançado
 *
 * Implementa regras tributárias completas para restaurantes:
 * - Simples Nacional (Anexos I-V com Fator R e sublimite)
 * - Lucro Presumido (PIS, COFINS, IRPJ, CSLL + ICMS + LC 224/2025 majoração)
 * - Lucro Real (PIS/COFINS não-cumulativo com créditos + IRPJ, CSLL + ICMS)
 * - ICMS por UF com Regime Especial de Apuração (REA) dual (rea/normal)
 * - Encargos sobre pró-labore (INSS com teto + IRRF progressivo)
 * - Provisões gerenciais (férias, 13º, FGTS, INSS patronal)
 * - Custos de pessoal diferenciados por regime (CPP no DAS vs encargos separados)
 *
 * Baseado na legislação vigente 2025/2026
 * Referência canônica: Tese Tributária Rook v2.2
 *
 * GOVERNANÇA:
 * - Todos os parâmetros são versionados com effective_date
 * - Cada simulação registra tax_calculator_version e parameter_versions
 * - Créditos PIS/COFINS rastreiam source (manual vs assisted)
 */

export const TAX_CALCULATOR_VERSION = '2.2.0'

// ============================================
// TIPOS
// ============================================












































































































// ============================================
// PARÂMETROS VERSIONÁVEIS (v2025)
// Estes valores são carregados como constantes com versão.
// Em produção, podem ser substituídos por dados do banco
// (fiscal.tax_parameters) via a API /api/tax-parameters.
// ============================================

export const PARAMETER_VERSION = '2025'
export const PARAMETER_EFFECTIVE_DATE = '2025-01-01'

// ────────────────────────────────────────────
// SIMPLES NACIONAL — Todos os 5 Anexos
// ────────────────────────────────────────────









export const SIMPLES_NACIONAL_ANNEXES                                       = {
  'I': [
    { limit: 180000, nominalRate: 0.04, deduction: 0, name: 'Até R$ 180.000' },
    { limit: 360000, nominalRate: 0.073, deduction: 5940, name: 'R$ 180.001 - R$ 360.000' },
    { limit: 720000, nominalRate: 0.095, deduction: 13860, name: 'R$ 360.001 - R$ 720.000' },
    { limit: 1800000, nominalRate: 0.107, deduction: 22500, name: 'R$ 720.001 - R$ 1.800.000' },
    { limit: 3600000, nominalRate: 0.143, deduction: 87300, name: 'R$ 1.800.001 - R$ 3.600.000' },
    { limit: 4800000, nominalRate: 0.19, deduction: 378000, name: 'R$ 3.600.001 - R$ 4.800.000' },
  ],
  'II': [
    { limit: 180000, nominalRate: 0.045, deduction: 0, name: 'Até R$ 180.000' },
    { limit: 360000, nominalRate: 0.078, deduction: 5940, name: 'R$ 180.001 - R$ 360.000' },
    { limit: 720000, nominalRate: 0.10, deduction: 13860, name: 'R$ 360.001 - R$ 720.000' },
    { limit: 1800000, nominalRate: 0.112, deduction: 22500, name: 'R$ 720.001 - R$ 1.800.000' },
    { limit: 3600000, nominalRate: 0.147, deduction: 85500, name: 'R$ 1.800.001 - R$ 3.600.000' },
    { limit: 4800000, nominalRate: 0.30, deduction: 720000, name: 'R$ 3.600.001 - R$ 4.800.000' },
  ],
  'III': [
    { limit: 180000, nominalRate: 0.06, deduction: 0, name: 'Até R$ 180.000' },
    { limit: 360000, nominalRate: 0.112, deduction: 9360, name: 'R$ 180.001 - R$ 360.000' },
    { limit: 720000, nominalRate: 0.135, deduction: 17640, name: 'R$ 360.001 - R$ 720.000' },
    { limit: 1800000, nominalRate: 0.16, deduction: 35640, name: 'R$ 720.001 - R$ 1.800.000' },
    { limit: 3600000, nominalRate: 0.21, deduction: 125640, name: 'R$ 1.800.001 - R$ 3.600.000' },
    { limit: 4800000, nominalRate: 0.33, deduction: 648000, name: 'R$ 3.600.001 - R$ 4.800.000' },
  ],
  'IV': [
    { limit: 180000, nominalRate: 0.045, deduction: 0, name: 'Até R$ 180.000' },
    { limit: 360000, nominalRate: 0.09, deduction: 8100, name: 'R$ 180.001 - R$ 360.000' },
    { limit: 720000, nominalRate: 0.102, deduction: 12420, name: 'R$ 360.001 - R$ 720.000' },
    { limit: 1800000, nominalRate: 0.14, deduction: 39780, name: 'R$ 720.001 - R$ 1.800.000' },
    { limit: 3600000, nominalRate: 0.22, deduction: 183780, name: 'R$ 1.800.001 - R$ 3.600.000' },
    { limit: 4800000, nominalRate: 0.33, deduction: 828000, name: 'R$ 3.600.001 - R$ 4.800.000' },
  ],
  'V': [
    { limit: 180000, nominalRate: 0.155, deduction: 0, name: 'Até R$ 180.000' },
    { limit: 360000, nominalRate: 0.18, deduction: 4500, name: 'R$ 180.001 - R$ 360.000' },
    { limit: 720000, nominalRate: 0.195, deduction: 9900, name: 'R$ 360.001 - R$ 720.000' },
    { limit: 1800000, nominalRate: 0.205, deduction: 17100, name: 'R$ 720.001 - R$ 1.800.000' },
    { limit: 3600000, nominalRate: 0.23, deduction: 62100, name: 'R$ 1.800.001 - R$ 3.600.000' },
    { limit: 4800000, nominalRate: 0.305, deduction: 540000, name: 'R$ 3.600.001 - R$ 4.800.000' },
  ],
}

// Retrocompatibilidade: manter SIMPLES_NACIONAL_RANGES como alias do Anexo I
export const SIMPLES_NACIONAL_RANGES = SIMPLES_NACIONAL_ANNEXES['I']

// Fator R: threshold para migração Anexo V → Anexo III
export const FATOR_R_THRESHOLD = 0.28

// Sublimite do Simples Nacional para ICMS/ISS
export const SIMPLES_SUBLIMITE = 3600000
export const SIMPLES_TETO = 4800000

// ────────────────────────────────────────────
// REPARTIÇÃO ICMS/ISS POR ANEXO E FAIXA (LC 123/2006)
// Usado para calcular sublimite: DAS_Federal = aliq_efetiva × (1 - icms_iss_share)
// Faixa 6: ICMS/ISS sai do DAS — share mantido = faixa 5 (para fórmula de transição)
// ────────────────────────────────────────────

export const ICMS_ISS_SHARE_BY_ANNEX                                 = {
  // Anexo I — Comércio (food service): ICMS share por faixa (1-6)
  'I':   [0.34, 0.34, 0.335, 0.335, 0.335, 0.335],
  // Anexo II — Indústria: ICMS share (uniforme 32%)
  'II':  [0.32, 0.32, 0.32, 0.32, 0.32, 0.32],
  // Anexo III — Serviços gerais: ISS share por faixa
  'III': [0.335, 0.32, 0.325, 0.325, 0.335, 0.335],
  // Anexo IV — Serviços sem CPP: ISS share por faixa
  'IV':  [0.445, 0.40, 0.40, 0.40, 0.40, 0.40],
  // Anexo V — Serviços TI/engenharia: ISS share por faixa
  'V':   [0.14, 0.17, 0.19, 0.21, 0.235, 0.235],
}

// ────────────────────────────────────────────
// ICMS POR ESTADO — Estrutura Dual (REA / Normal)
//
// REA = Regime Especial de Apuração para bares/restaurantes.
// A maioria dos restaurantes adere ao REA, que reduz
// significativamente a carga de ICMS.
//
// Fontes legais (principais UFs):
//   DF: Lei 3.168/2003 → 2% + 0,03% FITUR + 0,02% PROUNIV = 2,05%
//   SP: Decreto 51.597/2007 → crédito outorgado → carga líquida 3,2%
//   RJ: Lei 7.000/2015 + FECP → carga líquida 4%
//   MG: Decreto 43.080/2002 → crédito presumido → carga líquida 3,6%
// ────────────────────────────────────────────








export const ICMS_RATES_BY_STATE_DUAL                                = {
  'AC': { rea: 0.17,   normal: 0.17  },
  'AL': { rea: 0.17,   normal: 0.17  },
  'AP': { rea: 0.18,   normal: 0.18  },
  'AM': { rea: 0.18,   normal: 0.18  },
  'BA': { rea: 0.04,   normal: 0.19  }, // REA: regime especial bares/restaurantes
  'CE': { rea: 0.037,  normal: 0.18  }, // REA: carga líquida estimada
  'DF': { rea: 0.0205, normal: 0.20  }, // REA: Lei 3.168/2003 (2% + 0,03% FITUR + 0,02% PROUNIV)
  'ES': { rea: 0.032,  normal: 0.17  }, // REA: Compete-ES
  'GO': { rea: 0.07,   normal: 0.17  },
  'MA': { rea: 0.18,   normal: 0.18  },
  'MT': { rea: 0.07,   normal: 0.17  },
  'MS': { rea: 0.07,   normal: 0.17  },
  'MG': { rea: 0.036,  normal: 0.18  }, // REA: Decreto 43.080/2002 (crédito presumido)
  'PA': { rea: 0.17,   normal: 0.17  },
  'PB': { rea: 0.024,  normal: 0.18  }, // REA: regime diferenciado
  'PR': { rea: 0.032,  normal: 0.19  }, // REA: 3,2% refeições
  'PE': { rea: 0.025,  normal: 0.18  }, // REA: Prodepe ou similar
  'PI': { rea: 0.18,   normal: 0.18  },
  'RJ': { rea: 0.04,   normal: 0.20  }, // REA: Lei 8.165/2018 (FECP incluso)
  'RN': { rea: 0.18,   normal: 0.18  },
  'RS': { rea: 0.035,  normal: 0.17  }, // REA: cesta básica/redução
  'RO': { rea: 0.175,  normal: 0.175 },
  'RR': { rea: 0.17,   normal: 0.17  },
  'SC': { rea: 0.032,  normal: 0.17  }, // REA: 3,2% refeições
  'SP': { rea: 0.032,  normal: 0.18  }, // REA: Decreto 51.597/2007 (crédito outorgado)
  'SE': { rea: 0.18,   normal: 0.18  },
  'TO': { rea: 0.18,   normal: 0.18  },
}

/**
 * Retrocompatibilidade: ICMS_RATES_BY_STATE como Record<string, number>.
 * Retorna alíquota REA (default para restaurantes).
 */
export const ICMS_RATES_BY_STATE                         = Object.fromEntries(
  Object.entries(ICMS_RATES_BY_STATE_DUAL).map(([state, rates]) => [state, rates.rea])
)

// ────────────────────────────────────────────
// LUCRO PRESUMIDO
// ────────────────────────────────────────────

export const LUCRO_PRESUMIDO = {
  PIS: 0.0065,
  COFINS: 0.03,
  IRPJ_BASE: 0.08,
  IRPJ_RATE: 0.15,
  IRPJ_ADICIONAL_RATE: 0.10,
  IRPJ_ADICIONAL_LIMITE_MENSAL: 20000,
  CSLL_BASE: 0.12,
  CSLL_RATE: 0.09,
}

// ────────────────────────────────────────────
// LUCRO REAL
// ────────────────────────────────────────────

export const LUCRO_REAL = {
  PIS: 0.0165,
  COFINS: 0.076,
  PIS_COFINS_CREDITO_ESTIMADO: 0.40,
  IRPJ_RATE: 0.15,
  IRPJ_ADICIONAL_RATE: 0.10,
  IRPJ_ADICIONAL_LIMITE_MENSAL: 20000,
  CSLL_RATE: 0.09,
  MARGEM_LUCRO_ESTIMADA: 0.10,
}

// ────────────────────────────────────────────
// ENCARGOS SOBRE PRÓ-LABORE
// ────────────────────────────────────────────

export const INSS_TETO = 7786.02 // Portaria MPS/MF nº 6, de 10/01/2025
export const INSS_RATE_CONTRIBUINTE_INDIVIDUAL = 0.11

export const IRRF_TABLE = [
  { limit: 2259.20, rate: 0, deduction: 0 },
  { limit: 2826.65, rate: 0.075, deduction: 169.44 },
  { limit: 3751.05, rate: 0.15, deduction: 381.44 },
  { limit: 4664.68, rate: 0.225, deduction: 662.77 },
  { limit: Infinity, rate: 0.275, deduction: 896.00 },
]

// ────────────────────────────────────────────
// PROVISÕES GERENCIAIS (sobre folha CLT)
// ────────────────────────────────────────────

export const PROVISOES = {
  FERIAS_RATE: 1 / 12,           // 8,33%
  FERIAS_TERCO_RATE: 1 / 36,    // 2,78%
  DECIMO_TERCEIRO_RATE: 1 / 12, // 8,33%
  INSS_PATRONAL_RATE: 0.20,     // 20%
  FGTS_RATE: 0.08,              // 8%
  FGTS_MULTA_RATE: 0.40,        // 40% sobre saldo FGTS (provisão)
  RAT_RATE: 0.03,               // 3% (risco médio)
  SISTEMA_S_RATE: 0.058,        // 5,8%
}

// ============================================
// FUNÇÕES DE CÁLCULO — SIMPLES NACIONAL
// ============================================

/**
 * Calcula o RBT12 (Receita Bruta Total dos últimos 12 meses).
 * Para empresas com menos de 12 meses, aplica proporcionalização.
 *
 * @param revenueHistory - Array de receitas mensais (até 12 meses, do mais recente ao mais antigo)
 * @param monthsInOperation - Número de meses desde a abertura (se < 12, aplica proporcional)
 */
export function calculateRBT12(
  revenueHistory          ,
  monthsInOperation
)                                                                 {
  const months = revenueHistory.slice(0, 12)
  const totalRevenue = months.reduce((sum, r) => sum + r, 0)
  const monthsUsed = months.length

  // Se empresa tem menos de 12 meses, proporcionalizar
  if (monthsInOperation !== undefined && monthsInOperation > 0 && monthsInOperation < 12) {
    const avgMonthly = totalRevenue / monthsInOperation
    return {
      rbt12: avgMonthly * 12,
      isProportional: true,
      monthsUsed: monthsInOperation,
    }
  }

  return {
    rbt12: totalRevenue,
    isProportional: false,
    monthsUsed,
  }
}

/**
 * Determina o Anexo do Simples Nacional com base no Fator R.
 * Se o CNAE principal indica serviços (Anexo V), verifica se o Fator R >= 28%
 * para migrar para o Anexo III (mais vantajoso).
 *
 * @param baseAnnex - Anexo base determinado pelo CNAE
 * @param payroll12m - Folha de pagamento dos últimos 12 meses
 * @param rbt12 - Receita Bruta Total dos últimos 12 meses
 */
export function determineFatorR(
  baseAnnex              ,
  payroll12m        ,
  rbt12
)                                                             {
  // Fator R só se aplica quando o CNAE indica Anexo V
  if (baseAnnex !== 'V') {
    return { annex: baseAnnex, fatorR: 0, migrated: false }
  }

  if (rbt12 <= 0) {
    return { annex: 'V', fatorR: 0, migrated: false }
  }

  const fatorR = payroll12m / rbt12

  if (fatorR >= FATOR_R_THRESHOLD) {
    return { annex: 'III', fatorR, migrated: true }
  }

  return { annex: 'V', fatorR, migrated: false }
}

/**
 * Calcula a alíquota efetiva do Simples Nacional para qualquer Anexo.
 * Fórmula: (RBT12 × Alíquota Nominal - Dedução) / RBT12
 *
 * SUBLIMITE (LC 123/2006, Art. 18 §14):
 * Quando RBT12 > R$ 3,6M (sublimite), ICMS/ISS sai do DAS e é cobrado
 * separadamente pela alíquota estadual/municipal. O DAS passa a conter
 * apenas os tributos federais (DAS_Federal = aliq_efetiva × (1 - icms_iss_share)).
 * O ICMS/ISS por fora é cobrado pela alíquota do estado (ICMS_RATES_BY_STATE).
 *
 * @param rbt12 - Receita Bruta Total dos últimos 12 meses
 * @param monthlyRevenue - Receita do mês para cálculo do imposto
 * @param annex - Anexo do Simples Nacional (I-V)
 * @param state - UF do estabelecimento (para ICMS por fora no sublimite)
 * @param dbIcmsIssShares - Array de icms_share/iss_share do DB (opcional, fallback para hardcoded)
 */
export function calculateSimplesForAnnex(
  rbt12        ,
  monthlyRevenue        ,
  annex               = 'I',
  state         = 'SP',
  dbIcmsIssShares
)                                                                                                             {
  const ranges = SIMPLES_NACIONAL_ANNEXES[annex]
  const rangeIndex = ranges.findIndex(r => rbt12 <= r.limit)
  const effectiveIndex = rangeIndex >= 0 ? rangeIndex : ranges.length - 1
  const range = ranges[effectiveIndex]

  let effectiveRate = rbt12 > 0
    ? ((rbt12 * range.nominalRate) - range.deduction) / rbt12
    : range.nominalRate

  // Proteção: mínimo é a menor alíquota nominal do anexo
  const minRate = ranges[0].nominalRate
  if (effectiveRate < minRate) effectiveRate = minRate

  // ─── SUBLIMITE: RBT12 > R$ 3,6M e <= R$ 4,8M ───
  const sublimiteApplied = rbt12 > SIMPLES_SUBLIMITE && rbt12 <= SIMPLES_TETO

  if (sublimiteApplied) {
    // Determinar icms/iss share para a faixa atual
    const shares = dbIcmsIssShares || ICMS_ISS_SHARE_BY_ANNEX[annex]
    const icmsIssShare = shares[effectiveIndex] || shares[shares.length - 1]

    // DAS Federal = alíquota efetiva × (1 - icms_iss_share)
    const dasFederalRate = effectiveRate * (1 - icmsIssShare)

    // ICMS/ISS por fora: usar alíquota estadual (para Anexos I e II = ICMS)
    // Para Anexos III, IV, V = ISS (fixo 5% por município, cap legal)
    let icmsIssOutsideRate
    if (annex === 'I' || annex === 'II') {
      // ICMS por fora: alíquota do estado
      icmsIssOutsideRate = ICMS_RATES_BY_STATE[state.toUpperCase()] || 0.18
    } else {
      // ISS por fora: alíquota municipal (cap 5% pela LC 116/2003)
      icmsIssOutsideRate = 0.05
    }

    const dasFederal = monthlyRevenue * dasFederalRate
    const icmsIssOutside = monthlyRevenue * icmsIssOutsideRate
    const totalTax = dasFederal + icmsIssOutside
    const totalRate = dasFederalRate + icmsIssOutsideRate

    return {
      rate: totalRate * 100,
      bracket: `${range.name} (sublimite)`,
      annex,
      sublimiteApplied: true,
      breakdown: {
        pis: 0,
        cofins: 0,
        irpj: 0,
        csll: 0,
        icms: annex === 'I' || annex === 'II' ? icmsIssOutside : 0,
        iss: annex === 'III' || annex === 'IV' || annex === 'V' ? icmsIssOutside : 0,
        total: totalTax,
        taxOnRevenue: totalTax,
        taxOnProfit: 0,
      },
    }
  }

  // ─── CASO NORMAL: RBT12 <= R$ 3,6M ───
  const taxAmount = monthlyRevenue * effectiveRate

  return {
    rate: effectiveRate * 100,
    bracket: range.name,
    annex,
    sublimiteApplied: false,
    breakdown: {
      pis: 0,
      cofins: 0,
      irpj: 0,
      csll: 0,
      icms: 0,
      iss: 0,
      total: taxAmount,
      taxOnRevenue: taxAmount,
      taxOnProfit: 0,
    },
  }
}

/**
 * Calcula a alíquota efetiva do Simples Nacional (retrocompatível).
 * Usa Anexo I e monthlyRevenue * 12 como RBT12.
 */
export function calculateSimplesRate(monthlyRevenue        )                                                             {
  // Trava: RBT12 não pode exceder o teto do Simples Nacional (R$ 4.800.000)
  // Se exceder, empresa deveria estar em LP/LR — usar última faixa como cap
  const rbt12 = Math.min(monthlyRevenue * 12, SIMPLES_TETO)
  const result = calculateSimplesForAnnex(rbt12, monthlyRevenue, 'I')
  return {
    rate: result.rate,
    bracket: result.bracket,
    breakdown: result.breakdown,
  }
}

/**
 * Verifica se o RBT12 ultrapassa o sublimite estadual/municipal.
 * Acima do sublimite (R$ 3,6M), ICMS e ISS são cobrados separadamente.
 */
export function checkSublimite(rbt12        )



  {
  return {
    exceedsSublimite: rbt12 > SIMPLES_SUBLIMITE,
    exceedsTeto: rbt12 > SIMPLES_TETO,
    icmsIssOutside: rbt12 > SIMPLES_SUBLIMITE && rbt12 <= SIMPLES_TETO,
  }
}

// ============================================
// FUNÇÕES DE CÁLCULO — LUCRO PRESUMIDO
// ============================================

// ────────────────────────────────────────────
// LC 224/2025 + ROO-579/ROO-731 — Bases de presunção
//
// Decisão fiscal João/Polla (ROO-731, 22/07/2026):
//   1) CSLL majorada só a partir de 01/04/2026 (noventena)
//   2) Acréscimo de 10% só sobre a parcela da receita que EXCEDE o teto
//      (proporção mensal do limite anual) — não sobre toda a receita
//   3) Teto IRPJ: R$ 5 mi/ano-calendário; teto CSLL 2026: R$ 3,75 mi
//      (3 trimestres × R$ 1,25 mi — CSLL só a partir de abr)
//   4) Rook NÃO segrega por atividade (alimentação vs serviço)
//   5) Adicional IRPJ 10% incide sobre a base já majorada (cascata)
//   6) Calcula conforme a lei vigente + aviso de contencioso ao cliente
// ────────────────────────────────────────────

export const LC_224_2025 = {
  /** Limite anual IRPJ (LC 224/2025 art. 4º §5º; IN 2.305/2025) */
  THRESHOLD_ANUAL: 5_000_000,
  /** Alias explícito do teto IRPJ */
  THRESHOLD_ANUAL_IRPJ: 5_000_000,
  /**
   * Limite anual CSLL no ano-calendário 2026 (decisão ROO-731 / João):
   * 3 trimestres × R$ 1.250.000 = R$ 3.750.000 (CSLL só a partir de abr/2026).
   */
  THRESHOLD_ANUAL_CSLL: 3_750_000,
  /** Percentual de majoração sobre a base de presunção (10%) */
  MAJORACAO: 0.10,
  /** Base IRPJ majorada: 8% × 1,10 = 8,8% */
  IRPJ_BASE_MAJORADA: 0.088,
  /** Base CSLL majorada: 12% × 1,10 = 13,2% */
  CSLL_BASE_MAJORADA: 0.132,
  /** Vigência IRPJ (exceção à noventena — art. 150, §1º CF) */
  VIGENCIA_IRPJ: '2026-01-01',
  /** Vigência CSLL (noventena — IN RFB 2.305/2025 art. 3º, II) */
  VIGENCIA_CSLL: '2026-04-01',
  /**
   * Aviso ao cliente (ROO-731): lei vigente + contencioso.
   * Não é opinião do Rook — há liminares divergentes e ADIs no STF.
   */
  CONTENCIOSO_AVISO:
    'Estimativa conforme a LC 224/2025 e as INs RFB 2.305/2025 e 2.306/2026. ' +
    'Há contencioso judicial sobre a majoração das bases de presunção do IRPJ/CSLL ' +
    '(liminares divergentes nos TRFs e ADIs 7936, 7944 e 7982 no STF, sem decisão ' +
    'definitiva com efeito geral). O Rook calcula pela lei como está; confirme com ' +
    'seu contador a postura da empresa e eventuais liminares do seu caso.',
}

/**
 * ROO-731: base de presunção progressiva.
 * Majoração só na fatia da receita do período que excede o limite residual
 * (teto anual − receita já acumulada no ano antes deste mês).
 * Sem receita anual informada: usa proporção mensal (teto/12).
 */
export function computeProgressivePresumptionBase(params







 )






  {
  const { periodRevenue, baseNormal, baseMajorada, majoradaActive, thresholdAnual } = params
  const rev = Math.max(0, periodRevenue)

  if (rev <= 0) {
    return {
      calcBase: 0,
      effectiveRate: baseNormal,
      normalRevenue: 0,
      excessRevenue: 0,
      majoradaApplied: false,
      thresholdRemaining: thresholdAnual / 12,
    }
  }

  if (!majoradaActive) {
    return {
      calcBase: rev * baseNormal,
      effectiveRate: baseNormal,
      normalRevenue: rev,
      excessRevenue: 0,
      majoradaApplied: false,
      thresholdRemaining: thresholdAnual / 12,
    }
  }

  let thresholdRemaining
  if (params.annualRevenue != null && params.annualRevenue > 0) {
    // YTD antes deste período (proxy: annual − period)
    const ytdBefore = Math.max(0, params.annualRevenue - rev)
    thresholdRemaining = Math.max(0, thresholdAnual - ytdBefore)
  } else {
    // Proporção mensal do limite anual (decisão João: “há proporção mensal”)
    thresholdRemaining = thresholdAnual / 12
  }

  const normalRevenue = Math.min(rev, thresholdRemaining)
  const excessRevenue = Math.max(0, rev - normalRevenue)
  const calcBase = normalRevenue * baseNormal + excessRevenue * baseMajorada
  const effectiveRate = calcBase / rev

  return {
    calcBase,
    effectiveRate,
    normalRevenue,
    excessRevenue,
    majoradaApplied: excessRevenue > 0,
    thresholdRemaining,
  }
}

/**
 * ROO-579/731: quais alíquotas majoradas estão vigentes na data
 * (ainda sem aplicar o teto de receita — progressivo em calculatePresumidoTaxes).
 */
export function getPresumptionBases(referenceDate       = new Date())





  {
  const day = referenceDate.toISOString().slice(0, 10)
  const irpjMajorada = day >= LC_224_2025.VIGENCIA_IRPJ
  const csllMajorada = day >= LC_224_2025.VIGENCIA_CSLL
  return {
    irpjBase: irpjMajorada ? LC_224_2025.IRPJ_BASE_MAJORADA : LUCRO_PRESUMIDO.IRPJ_BASE,
    csllBase: csllMajorada ? LC_224_2025.CSLL_BASE_MAJORADA : LUCRO_PRESUMIDO.CSLL_BASE,
    irpjMajorada,
    csllMajorada,
  }
}

/**
 * Calcula os impostos do Lucro Presumido com detalhamento.
 *
 * @param monthlyRevenue - Receita mensal
 * @param state - UF do estabelecimento
 * @param options.isREA - Se o restaurante é optante pelo Regime Especial de ICMS (default: true)
 * @param options.annualRevenue - Receita bruta do ano-calendário (YTD). Se omitida, usa mensal×12.
 * @param options.referenceDate - Data de referência (vigência IRPJ 01/01 e CSLL 01/04/2026)
 */
export function calculatePresumidoTaxes(
  monthlyRevenue        ,
  state         = 'SP',
  options


























)                                                                    {
  const isREA = options?.isREA ?? true
  const refDate = options?.referenceDate ?? new Date()
  const rates = options?.rates

  const pisRate = rates?.pis ?? rates?.PIS ?? LUCRO_PRESUMIDO.PIS
  const cofinsRate = rates?.cofins ?? rates?.COFINS ?? LUCRO_PRESUMIDO.COFINS
  const irpjRate = rates?.irpj_rate ?? rates?.IRPJ_RATE ?? LUCRO_PRESUMIDO.IRPJ_RATE
  const irpjBaseNormal = rates?.irpj_base_comercio ?? LUCRO_PRESUMIDO.IRPJ_BASE
  const csllRate = rates?.csll_rate ?? LUCRO_PRESUMIDO.CSLL_RATE
  const csllBaseNormal = rates?.csll_base_comercio ?? LUCRO_PRESUMIDO.CSLL_BASE
  const irpjAdicionalRate = rates?.irpj_adicional_rate ?? LUCRO_PRESUMIDO.IRPJ_ADICIONAL_RATE
  const irpjAdicionalLimiteMensal = rates?.irpj_adicional_limite_mensal ?? LUCRO_PRESUMIDO.IRPJ_ADICIONAL_LIMITE_MENSAL

  // Proxy anual: se o caller não informou YTD, anualiza o mês (proporção mensal do teto).
  const annualRevenue =
    options?.annualRevenue != null && options.annualRevenue > 0
      ? options.annualRevenue
      : monthlyRevenue * 12

  // ── Base de cálculo PIS/COFINS (Lucro Presumido) ──
  // Exclusões: receita monofásica + ICMS destacado nas vendas
  // Adições: ICMS das compras de insumos
  // Ref: Lei 10.637/02, Lei 10.833/03, IN RFB 2.121/2022
  const monofasicoExcluded = options?.monofasicoRevenue ?? 0
  const icmsVendasExcluded = options?.icmsVendas ?? 0
  const icmsComprasAdded = options?.icmsComprasInsumo ?? 0
  const pisCofinsBase = Math.max(0, monthlyRevenue - monofasicoExcluded - icmsVendasExcluded + icmsComprasAdded)

  const pis = pisCofinsBase * pisRate
  const cofins = pisCofinsBase * cofinsRate

  // ── ROO-731: presunção progressiva (majoração só no excedente ao teto) ──
  const { irpjMajorada, csllMajorada } = getPresumptionBases(refDate)

  const irpjProg = computeProgressivePresumptionBase({
    periodRevenue: monthlyRevenue,
    baseNormal: irpjBaseNormal,
    baseMajorada: LC_224_2025.IRPJ_BASE_MAJORADA,
    majoradaActive: irpjMajorada,
    thresholdAnual: LC_224_2025.THRESHOLD_ANUAL_IRPJ,
    annualRevenue,
  })
  const csllProg = computeProgressivePresumptionBase({
    periodRevenue: monthlyRevenue,
    baseNormal: csllBaseNormal,
    baseMajorada: LC_224_2025.CSLL_BASE_MAJORADA,
    majoradaActive: csllMajorada,
    thresholdAnual: LC_224_2025.THRESHOLD_ANUAL_CSLL,
    annualRevenue,
  })

  const irpjPresumptionRate = irpjProg.effectiveRate
  const csllPresumptionRate = csllProg.effectiveRate
  const baseIRPJ = irpjProg.calcBase
  const baseCSLL = csllProg.calcBase

  let irpj = baseIRPJ * irpjRate
  let irpjAdicional = 0
  // Adicional 10% sobre a base já majorada (cascata confirmada ROO-731)
  if (baseIRPJ > irpjAdicionalLimiteMensal) {
    irpjAdicional =
      (baseIRPJ - irpjAdicionalLimiteMensal) * irpjAdicionalRate
    irpj += irpjAdicional
  }

  const csll = baseCSLL * csllRate

  // ICMS: usar alíquota dual (REA vs normal)
  const icmsRate = getICMSRate(state, isREA)
  const icms = monthlyRevenue * icmsRate

  const taxOnRevenue = pis + cofins + icms
  const taxOnProfit = irpj + csll
  const total = taxOnRevenue + taxOnProfit
  const effectiveRate = monthlyRevenue > 0 ? (total / monthlyRevenue) * 100 : 0

  return {
    rate: effectiveRate,
    breakdown: {
      pis, cofins, irpj, csll, icms, iss: 0, total, taxOnRevenue, taxOnProfit,
      pisCofinsBase,
      monofasicoExcluded: monofasicoExcluded > 0 ? monofasicoExcluded : undefined,
      icmsVendasExcluded: icmsVendasExcluded > 0 ? icmsVendasExcluded : undefined,
      icmsComprasAdded: icmsComprasAdded > 0 ? icmsComprasAdded : undefined,
      irpjPresumptionRate,
      csllPresumptionRate,
      irpjCalcBase: baseIRPJ,
      csllCalcBase: baseCSLL,
      irpjAdicional: irpjAdicional > 0 ? irpjAdicional : undefined,
    },
    // True se a majoração entrou em alguma fatia de receita (não só se a data permite)
    lc224Applied: irpjProg.majoradaApplied || csllProg.majoradaApplied,
  }
}

// ============================================
// FUNÇÕES DE CÁLCULO — LUCRO REAL
// ============================================

/**
 * Calcula os impostos do Lucro Real com detalhamento.
 * Suporta créditos PIS/COFINS dinâmicos (Camada A/B).
 *
 * @param options.isREA - Se o restaurante é optante pelo Regime Especial de ICMS (default: true)
 */
export function calculateRealTaxes(
  monthlyRevenue        ,
  state         = 'SP',
  estimatedProfitMargin         = 0.10,
  creditableExpenses         ,
  cmv         ,
  operationalExpenses         ,
  options
)                                                                      {
  const isREA = options?.isREA ?? true

  const pisGross = monthlyRevenue * LUCRO_REAL.PIS
  const cofinsGross = monthlyRevenue * LUCRO_REAL.COFINS
  const totalGross = pisGross + cofinsGross

  let pis
  let cofins
  let creditPercentage

  if (creditableExpenses !== undefined && creditableExpenses > 0) {
    const creditoPIS = creditableExpenses * LUCRO_REAL.PIS
    const creditoCOFINS = creditableExpenses * LUCRO_REAL.COFINS
    pis = Math.max(0, pisGross - creditoPIS)
    cofins = Math.max(0, cofinsGross - creditoCOFINS)
    creditPercentage = totalGross > 0
      ? ((creditoPIS + creditoCOFINS) / totalGross) * 100
      : 0
  } else {
    pis = pisGross * (1 - LUCRO_REAL.PIS_COFINS_CREDITO_ESTIMADO)
    cofins = cofinsGross * (1 - LUCRO_REAL.PIS_COFINS_CREDITO_ESTIMADO)
    creditPercentage = LUCRO_REAL.PIS_COFINS_CREDITO_ESTIMADO * 100
  }

  const icmsRate = getICMSRate(state, isREA)
  const icms = monthlyRevenue * icmsRate
  const taxOnRevenue = pis + cofins + icms

  let lucroEstimado
  if (cmv !== undefined && operationalExpenses !== undefined) {
    const netRevenueLR = monthlyRevenue - taxOnRevenue
    const grossProfitLR = netRevenueLR - cmv
    const ebitdaLR = grossProfitLR - operationalExpenses
    lucroEstimado = Math.max(0, ebitdaLR)
  } else {
    lucroEstimado = monthlyRevenue * estimatedProfitMargin
  }

  let irpj = lucroEstimado > 0 ? lucroEstimado * LUCRO_REAL.IRPJ_RATE : 0
  if (lucroEstimado > LUCRO_REAL.IRPJ_ADICIONAL_LIMITE_MENSAL) {
    irpj += (lucroEstimado - LUCRO_REAL.IRPJ_ADICIONAL_LIMITE_MENSAL) * LUCRO_REAL.IRPJ_ADICIONAL_RATE
  }
  const csll = lucroEstimado > 0 ? lucroEstimado * LUCRO_REAL.CSLL_RATE : 0

  const taxOnProfit = irpj + csll
  const total = taxOnRevenue + taxOnProfit
  const effectiveRate = monthlyRevenue > 0 ? (total / monthlyRevenue) * 100 : 0

  return {
    rate: effectiveRate,
    breakdown: { pis, cofins, irpj, csll, icms, iss: 0, total, taxOnRevenue, taxOnProfit },
    creditPercentage,
  }
}

// ============================================
// ENCARGOS SOBRE PRÓ-LABORE
// ============================================

/**
 * Calcula o INSS do contribuinte individual (pró-labore).
 * Aplica alíquota de 11% limitada ao teto.
 */
export function calculateINSSProLabore(proLabore        )         {
  const base = Math.min(proLabore, INSS_TETO)
  return base * INSS_RATE_CONTRIBUINTE_INDIVIDUAL
}

/**
 * Calcula o IRRF sobre pró-labore usando tabela progressiva.
 * Base de cálculo = pró-labore - INSS descontado.
 */
export function calculateIRRFProLabore(proLabore        )         {
  const inss = calculateINSSProLabore(proLabore)
  const baseCalculo = proLabore - inss

  if (baseCalculo <= 0) return 0

  const faixa = IRRF_TABLE.find(f => baseCalculo <= f.limit) || IRRF_TABLE[IRRF_TABLE.length - 1]
  const irrf = (baseCalculo * faixa.rate) - faixa.deduction

  return Math.max(0, irrf)
}

// ============================================
// PROVISÕES GERENCIAIS (sobre folha CLT)
// ============================================

/**
 * Calcula provisões gerenciais mensais sobre a folha CLT.
 * Inclui: férias + 1/3, 13º, INSS patronal, FGTS, RAT, Sistema S.
 * Visão do gestor: quanto realmente custa cada funcionário.
 */
export function calculateProvisoes(cltPayrollMonthly        )










  {
  const ferias = cltPayrollMonthly * PROVISOES.FERIAS_RATE
  const feriasTermConstitucional = cltPayrollMonthly * PROVISOES.FERIAS_TERCO_RATE
  const decimoTerceiro = cltPayrollMonthly * PROVISOES.DECIMO_TERCEIRO_RATE
  const inssPatronal = cltPayrollMonthly * PROVISOES.INSS_PATRONAL_RATE
  const fgts = cltPayrollMonthly * PROVISOES.FGTS_RATE
  const fgtsMulta = fgts * PROVISOES.FGTS_MULTA_RATE
  const rat = cltPayrollMonthly * PROVISOES.RAT_RATE
  const sistemaS = cltPayrollMonthly * PROVISOES.SISTEMA_S_RATE

  const total = ferias + feriasTermConstitucional + decimoTerceiro + inssPatronal + fgts + fgtsMulta + rat + sistemaS
  const totalRate = cltPayrollMonthly > 0 ? (total / cltPayrollMonthly) * 100 : 0

  return {
    ferias,
    feriasTermConstitucional,
    decimoTerceiro,
    inssPatronal,
    fgts,
    fgtsMulta,
    rat,
    sistemaS,
    total,
    totalRate,
  }
}

/**
 * Calcula todos os custos de pessoal (pró-labore + CLT).
 * NOTA: Esta função calcula encargos COMPLETOS (LP/LR). Para Simples Nacional,
 * use calculatePayrollCostsForRegime() que exclui encargos já embutidos no DAS.
 */
export function calculatePayrollCosts(
  proLaboreMonthly        ,
  cltPayrollMonthly
)               {
  const inssProLabore = calculateINSSProLabore(proLaboreMonthly)
  const irrfProLabore = calculateIRRFProLabore(proLaboreMonthly)
  const totalProLabore = inssProLabore + irrfProLabore

  const prov = calculateProvisoes(cltPayrollMonthly)

  return {
    inssProLabore,
    irrfProLabore,
    totalProLabore,
    provisoesFerias: prov.ferias + prov.feriasTermConstitucional,
    provisoes13: prov.decimoTerceiro,
    inssPatronal: prov.inssPatronal,
    fgts: prov.fgts,
    fgtsMulta: prov.fgtsMulta,
    rat: prov.rat,
    totalProvisoes: prov.total,
    totalEncargos: totalProLabore + prov.total,
  }
}

/**
 * Calcula custos de pessoal DIFERENCIADOS por regime tributário.
 *
 * No Simples Nacional, a CPP (Contribuição Patronal Previdenciária) já está
 * embutida no DAS — portanto INSS patronal (20%), RAT (3%) e Sistema S (5,8%)
 * NÃO devem ser somados separadamente. Apenas FGTS, férias, 13º e FGTS multa
 * são custos adicionais ao DAS.
 *
 * No Lucro Presumido e Real, todos os encargos são devidos separadamente.
 *
 * Referência legal: LC 123/2006, Art. 13, §3º — A CPP do Simples Nacional
 * substitui a contribuição patronal previdenciária de que trata o art. 22 da
 * Lei 8.212/91.
 */
export function calculatePayrollCostsForRegime(
  proLaboreMonthly        ,
  cltPayrollMonthly        ,
  regime
)               {
  const inssProLabore = calculateINSSProLabore(proLaboreMonthly)
  const irrfProLabore = calculateIRRFProLabore(proLaboreMonthly)
  const totalProLabore = inssProLabore + irrfProLabore

  if (regime === 'simples_nacional') {
    // No Simples: INSS patronal, RAT e Sistema S já estão no DAS (via CPP)
    // Encargos adicionais: apenas FGTS, provisões de férias/13º e FGTS multa
    const ferias = cltPayrollMonthly * PROVISOES.FERIAS_RATE
    const feriasTermConstitucional = cltPayrollMonthly * PROVISOES.FERIAS_TERCO_RATE
    const decimoTerceiro = cltPayrollMonthly * PROVISOES.DECIMO_TERCEIRO_RATE
    const fgts = cltPayrollMonthly * PROVISOES.FGTS_RATE
    const fgtsMulta = fgts * PROVISOES.FGTS_MULTA_RATE

    const totalProvisoes = ferias + feriasTermConstitucional + decimoTerceiro + fgts + fgtsMulta

    return {
      inssProLabore,
      irrfProLabore,
      totalProLabore,
      provisoesFerias: ferias + feriasTermConstitucional,
      provisoes13: decimoTerceiro,
      inssPatronal: 0, // Já no DAS
      fgts,
      fgtsMulta,
      rat: 0, // Já no DAS
      totalProvisoes,
      totalEncargos: totalProLabore + totalProvisoes,
    }
  }

  // LP/LR: todos os encargos são devidos separadamente
  const prov = calculateProvisoes(cltPayrollMonthly)

  return {
    inssProLabore,
    irrfProLabore,
    totalProLabore,
    provisoesFerias: prov.ferias + prov.feriasTermConstitucional,
    provisoes13: prov.decimoTerceiro,
    inssPatronal: prov.inssPatronal,
    fgts: prov.fgts,
    fgtsMulta: prov.fgtsMulta,
    rat: prov.rat,
    totalProvisoes: prov.total,
    totalEncargos: totalProLabore + prov.total,
  }
}

// ============================================
// SIMULAÇÃO COMPLETA POR REGIME
// ============================================

/**
 * Executa simulação completa para um regime, incluindo impostos + encargos.
 */
export function simulateRegime(
  regime           ,
  monthlyRevenue        ,
  state        ,
  proLaboreMonthly        ,
  cltPayrollMonthly        ,
  options









)                    {
  let taxAmount
  let taxRate
  let breakdown

  const rbt12 = options?.rbt12 || monthlyRevenue * 12

  switch (regime) {
    case 'simples_nacional': {
      const annex = options?.annex || 'I'
      const result = calculateSimplesForAnnex(rbt12, monthlyRevenue, annex)
      taxAmount = result.breakdown.total
      taxRate = result.rate
      breakdown = result.breakdown
      break
    }
    case 'lucro_presumido': {
      const result = calculatePresumidoTaxes(monthlyRevenue, state, {
        isREA: options?.isREA,
        annualRevenue: options?.annualRevenue,
      })
      taxAmount = result.breakdown.total
      taxRate = result.rate
      breakdown = result.breakdown
      break
    }
    case 'lucro_real': {
      const margin = options?.estimatedProfitMargin ?? LUCRO_REAL.MARGEM_LUCRO_ESTIMADA
      const result = calculateRealTaxes(
        monthlyRevenue, state, margin,
        options?.creditableExpenses, options?.cmv, options?.operationalExpenses,
        { isREA: options?.isREA }
      )
      taxAmount = result.breakdown.total
      taxRate = result.rate
      breakdown = result.breakdown
      break
    }
    default: {
      const result = calculateSimplesForAnnex(rbt12, monthlyRevenue, 'I')
      taxAmount = result.breakdown.total
      taxRate = result.rate
      breakdown = result.breakdown
    }
  }

  const payrollCosts = calculatePayrollCostsForRegime(proLaboreMonthly, cltPayrollMonthly, regime)
  const totalCostGovernment = taxAmount + payrollCosts.totalEncargos
  const totalCostGovernmentRate = monthlyRevenue > 0
    ? (totalCostGovernment / monthlyRevenue) * 100
    : 0

  const regimeNames                         = {
    simples_nacional: 'Simples Nacional',
    lucro_presumido: 'Lucro Presumido',
    lucro_real: 'Lucro Real',
  }

  return {
    regime,
    regimeName: regimeNames[regime] || regime,
    taxAmount,
    taxRate,
    payrollCosts,
    totalCostGovernment,
    totalCostGovernmentRate,
    breakdown,
  }
}

// ============================================
// FUNÇÕES RETROCOMPATÍVEIS (API pública existente)
// ============================================

/**
 * Calcula o imposto baseado no regime tributário informado.
 * Retrocompatível com a API v1.
 */
export function calculateTax(
  monthlyRevenue        ,
  regime            ,
  state         = 'SP',
  dbParams
)                       {
  if (monthlyRevenue <= 0) {
    const effectiveRegime = regime || determineRegimeByRevenue(monthlyRevenue)
    const regimeNames                            = {
      simples_nacional: 'Simples Nacional',
      lucro_presumido: 'Lucro Presumido',
      lucro_real: 'Lucro Real',
      nao_sei: 'Não Sei',
    }
    return {
      regime: effectiveRegime,
      regimeName: regimeNames[effectiveRegime] || 'Simples Nacional',
      taxRate: effectiveRegime === 'simples_nacional' ? 4.0 : 0,
      taxAmount: 0,
      taxOnRevenue: 0,
      taxOnRevenueRate: 0,
      taxOnProfit: 0,
      taxOnProfitRate: 0,
      bracket: effectiveRegime === 'simples_nacional' ? 'Até R$ 180.000' : undefined,
      explanation: 'Informe o faturamento para calcular o imposto',
      breakdown: {
        pis: 0,
        cofins: 0,
        irpj: 0,
        csll: 0,
        icms: 0,
        iss: 0,
        total: 0,
        taxOnRevenue: 0,
        taxOnProfit: 0,
      },
    }
  }

  const effectiveRegime = regime || determineRegimeByRevenue(monthlyRevenue)

  switch (effectiveRegime) {
    case 'simples_nacional': {
      let result
      if (dbParams?.simples_anexo_i) {
        // Usar parâmetros do banco (fiscal.tax_parameters)
        const teto = dbParams.simples_sublimite?.teto || SIMPLES_TETO
        const sublimite = dbParams.simples_sublimite?.sublimite || SIMPLES_SUBLIMITE
        const rbt12 = Math.min(monthlyRevenue * 12, teto)
        const ranges = dbParams.simples_anexo_i
        const rangeIdx = ranges.findIndex(r => rbt12 <= r.limit)
        const effectiveIdx = rangeIdx >= 0 ? rangeIdx : ranges.length - 1
        const range = ranges[effectiveIdx]
        let effectiveRate = rbt12 > 0
          ? ((rbt12 * range.nominal_rate) - range.deduction) / rbt12
          : range.nominal_rate
        const minRate = ranges[0].nominal_rate
        if (effectiveRate < minRate) effectiveRate = minRate

        // Sublimite: RBT12 > R$ 3,6M — ICMS sai do DAS
        const sublimiteApplied = rbt12 > sublimite && rbt12 <= teto
        if (sublimiteApplied) {
          // Ler icms_share do DB (campo adicionado no Lote 3)
          // Para Anexo I: campo icms_share. Fallback: constante hardcoded.
          const icmsShare = range.icms_share ?? ICMS_ISS_SHARE_BY_ANNEX['I'][effectiveIdx] ?? 0.335
          const dasFederalRate = effectiveRate * (1 - icmsShare)
          const icmsOutsideRate = (dbParams.icms_by_state?.[state.toUpperCase()]) || ICMS_RATES_BY_STATE[state.toUpperCase()] || 0.18
          const dasFederal = monthlyRevenue * dasFederalRate
          const icmsOutside = monthlyRevenue * icmsOutsideRate
          const totalTax = dasFederal + icmsOutside
          const totalRate = (dasFederalRate + icmsOutsideRate) * 100
          const bracketName = `Até R$ ${(range.limit / 1000).toFixed(0)}.000 (sublimite)`
          result = {
            rate: totalRate,
            bracket: bracketName,
            breakdown: { pis: 0, cofins: 0, irpj: 0, csll: 0, icms: icmsOutside, iss: 0, total: totalTax, taxOnRevenue: totalTax, taxOnProfit: 0 },
          }
        } else {
          const taxAmt = monthlyRevenue * effectiveRate
          const bracketName = `Até R$ ${(range.limit / 1000).toFixed(0)}.000`
          result = {
            rate: effectiveRate * 100,
            bracket: bracketName,
            breakdown: { pis: 0, cofins: 0, irpj: 0, csll: 0, icms: 0, iss: 0, total: taxAmt, taxOnRevenue: taxAmt, taxOnProfit: 0 },
          }
        }
      } else {
        // Fallback: usar constantes hardcoded (já inclui sublimite via calculateSimplesForAnnex)
        const rbt12 = Math.min(monthlyRevenue * 12, SIMPLES_TETO)
        const simplesResult = calculateSimplesForAnnex(rbt12, monthlyRevenue, 'I', state)
        result = {
          rate: simplesResult.rate,
          bracket: simplesResult.bracket,
          breakdown: simplesResult.breakdown,
        }
      }
      const taxAmount = monthlyRevenue * (result.rate / 100)
      return {
        regime: 'simples_nacional',
        regimeName: 'Simples Nacional',
        taxRate: result.rate,
        taxAmount,
        taxOnRevenue: taxAmount,
        taxOnRevenueRate: result.rate,
        taxOnProfit: 0,
        taxOnProfitRate: 0,
        bracket: result.bracket,
        explanation: `Faixa: ${result.bracket} | Alíquota efetiva: ${result.rate.toFixed(2)}%`,
        breakdown: result.breakdown,
      }
    }
    case 'lucro_presumido': {
      const result = calculatePresumidoTaxes(monthlyRevenue, state, {
        // ROO-731: anualiza o mês como proxy do teto LC 224 quando não há RBT12
        annualRevenue: monthlyRevenue * 12,
        rates: dbParams?.lucro_presumido_rates,
      })
      return {
        regime: 'lucro_presumido',
        regimeName: 'Lucro Presumido',
        taxRate: result.rate,
        taxAmount: result.breakdown.total,
        taxOnRevenue: result.breakdown.taxOnRevenue,
        taxOnRevenueRate: (result.breakdown.taxOnRevenue / monthlyRevenue) * 100,
        taxOnProfit: result.breakdown.taxOnProfit,
        taxOnProfitRate: (result.breakdown.taxOnProfit / monthlyRevenue) * 100,
        explanation: formatPresumidoExplanation(result.breakdown, monthlyRevenue),
        breakdown: result.breakdown,
      }
    }
    case 'lucro_real': {
      const result = calculateRealTaxes(monthlyRevenue, state)
      return {
        regime: 'lucro_real',
        regimeName: 'Lucro Real',
        taxRate: result.rate,
        taxAmount: result.breakdown.total,
        taxOnRevenue: result.breakdown.taxOnRevenue,
        taxOnRevenueRate: (result.breakdown.taxOnRevenue / monthlyRevenue) * 100,
        taxOnProfit: result.breakdown.taxOnProfit,
        taxOnProfitRate: (result.breakdown.taxOnProfit / monthlyRevenue) * 100,
        explanation: formatRealExplanation(result.breakdown, monthlyRevenue),
        breakdown: result.breakdown,
      }
    }
    case 'nao_sei':
    default: {
      const annualRevenue = monthlyRevenue * 12
      if (annualRevenue <= SIMPLES_TETO) {
        const result = calculateSimplesRate(monthlyRevenue)
        const taxAmount = Number((monthlyRevenue * (result.rate / 100)).toFixed(2))
        return {
          regime: 'simples_nacional',
          regimeName: 'Simples Nacional (estimado)',
          taxRate: Number(result.rate.toFixed(2)),
          taxAmount,
          taxOnRevenue: taxAmount,
          taxOnRevenueRate: Number(result.rate.toFixed(2)),
          taxOnProfit: 0,
          taxOnProfitRate: 0,
          bracket: result.bracket,
          explanation: `Regime estimado baseado no faturamento | Alíquota: ${result.rate.toFixed(2)}%`,
          breakdown: result.breakdown,
        }
      } else {
        const result = calculatePresumidoTaxes(monthlyRevenue, state)
        return {
          regime: 'lucro_presumido',
          regimeName: 'Lucro Presumido (estimado)',
          taxRate: Number(result.rate.toFixed(2)),
          taxAmount: Number(result.breakdown.total.toFixed(2)),
          taxOnRevenue: Number(result.breakdown.taxOnRevenue.toFixed(2)),
          taxOnRevenueRate: Number(((result.breakdown.taxOnRevenue / monthlyRevenue) * 100).toFixed(2)),
          taxOnProfit: Number(result.breakdown.taxOnProfit.toFixed(2)),
          taxOnProfitRate: Number(((result.breakdown.taxOnProfit / monthlyRevenue) * 100).toFixed(2)),
          explanation: `Regime estimado (acima do limite do Simples) | ${formatPresumidoExplanation(result.breakdown, monthlyRevenue)}`,
          breakdown: result.breakdown,
        }
      }
    }
  }
}

/**
 * Calcula o imposto para visão semanal.
 */
export function calculateWeeklyTax(weeklyRevenue        , regime            , state         )                       {
  const projectedMonthlyRevenue = weeklyRevenue * 4.33
  const monthlyTaxResult = calculateTax(projectedMonthlyRevenue, regime, state)
  const weeklyTaxAmount = weeklyRevenue * (monthlyTaxResult.taxRate / 100)
  const weeklyTaxOnRevenue = weeklyRevenue * (monthlyTaxResult.taxOnRevenueRate / 100)
  const weeklyTaxOnProfit = weeklyRevenue * (monthlyTaxResult.taxOnProfitRate / 100)

  return {
    ...monthlyTaxResult,
    taxAmount: weeklyTaxAmount,
    taxOnRevenue: weeklyTaxOnRevenue,
    taxOnProfit: weeklyTaxOnProfit,
    explanation: `Projeção mensal: ${formatCurrency(projectedMonthlyRevenue)} | ${monthlyTaxResult.explanation}`,
  }
}

/**
 * Compara regimes tributários e sugere o mais vantajoso.
 * Retrocompatível com a API v1.
 */
export function compareTaxRegimes(monthlyRevenue        , state         = 'SP')





  {
  const annualRevenue = monthlyRevenue * 12
  const simples = annualRevenue <= SIMPLES_TETO
    ? calculateTax(monthlyRevenue, 'simples_nacional', state)
    : null
  const presumido = calculateTax(monthlyRevenue, 'lucro_presumido', state)
  const real = calculateTax(monthlyRevenue, 'lucro_real', state)

  const options = [
    simples ? { regime: 'simples_nacional'             , amount: simples.taxAmount } : null,
    { regime: 'lucro_presumido'             , amount: presumido.taxAmount },
    { regime: 'lucro_real'             , amount: real.taxAmount },
  ].filter(Boolean)

  const best = options.reduce((a, b) => a.amount < b.amount ? a : b)
  const worst = options.reduce((a, b) => a.amount > b.amount ? a : b)

  return { simples, presumido, real, recommended: best.regime, savings: worst.amount - best.amount }
}

/**
 * Compara todos os regimes com análise completa e recomendação.
 * Retrocompatível com a API v1.
 */
export function compareAllRegimes(
  monthlyRevenue        ,
  currentRegime                       ,
  state         = 'SP',
  estimatedProfitMargin         = 0.10,
  creditableExpenses         ,
  cmv         ,
  operationalExpenses
)                      {
  const annualRevenue = monthlyRevenue * 12
  const effectiveCurrentRegime = currentRegime || 'simples_nacional'

  const simplesResult = calculateSimplesRate(monthlyRevenue)
  const presumidoResult = calculatePresumidoTaxes(monthlyRevenue, state)
  const realResult = calculateRealTaxes(monthlyRevenue, state, estimatedProfitMargin, creditableExpenses, cmv, operationalExpenses)

  const comparisons                     = []

  if (annualRevenue <= SIMPLES_TETO) {
    const taxAmount = monthlyRevenue * (simplesResult.rate / 100)
    comparisons.push({
      regime: 'simples_nacional',
      regimeName: 'Simples Nacional',
      taxAmount,
      taxRate: simplesResult.rate,
      breakdown: simplesResult.breakdown,
      netRevenue: monthlyRevenue - taxAmount,
      isCurrentRegime: effectiveCurrentRegime === 'simples_nacional',
      isBestOption: false,
      recommendation: simplesResult.bracket,
    })
  }

  comparisons.push({
    regime: 'lucro_presumido',
    regimeName: 'Lucro Presumido',
    taxAmount: presumidoResult.breakdown.total,
    taxRate: presumidoResult.rate,
    breakdown: presumidoResult.breakdown,
    netRevenue: monthlyRevenue - presumidoResult.breakdown.total,
    isCurrentRegime: effectiveCurrentRegime === 'lucro_presumido',
    isBestOption: false,
    recommendation: `PIS ${(presumidoResult.breakdown.pis / monthlyRevenue * 100).toFixed(2)}% + COFINS ${(presumidoResult.breakdown.cofins / monthlyRevenue * 100).toFixed(2)}% + IRPJ ${(presumidoResult.breakdown.irpj / monthlyRevenue * 100).toFixed(2)}% + CSLL ${(presumidoResult.breakdown.csll / monthlyRevenue * 100).toFixed(2)}% + ICMS ${(presumidoResult.breakdown.icms / monthlyRevenue * 100).toFixed(2)}%`,
  })

  comparisons.push({
    regime: 'lucro_real',
    regimeName: 'Lucro Real',
    taxAmount: realResult.breakdown.total,
    taxRate: realResult.rate,
    breakdown: realResult.breakdown,
    netRevenue: monthlyRevenue - realResult.breakdown.total,
    isCurrentRegime: effectiveCurrentRegime === 'lucro_real',
    isBestOption: false,
    recommendation: `Margem estimada: ${(estimatedProfitMargin * 100).toFixed(1)}% | Créditos PIS/COFINS: ${realResult.creditPercentage.toFixed(0)}%`,
  })

  const bestComparison = comparisons.reduce((best, current) =>
    current.taxAmount < best.taxAmount ? current : best
  )
  const currentComparison = comparisons.find(c => c.isCurrentRegime) || comparisons[0]

  comparisons.forEach(c => {
    c.isBestOption = c.regime === bestComparison.regime
    c.savings = currentComparison.taxAmount - c.taxAmount
    c.savingsPercentage = currentComparison.taxAmount > 0
      ? (c.savings / currentComparison.taxAmount) * 100
      : 0
  })

  const potentialSavings = currentComparison.taxAmount - bestComparison.taxAmount
  const potentialSavingsPercentage = currentComparison.taxAmount > 0
    ? (potentialSavings / currentComparison.taxAmount) * 100
    : 0
  const annualSavings = potentialSavings * 12

  const isLowMargin = estimatedProfitMargin < 0.08
  const realComp = comparisons.find(c => c.regime === 'lucro_real')
  const presumidoComp = comparisons.find(c => c.regime === 'lucro_presumido')

  let recommendation = ''
  if (potentialSavings <= 0) {
    if (isLowMargin && effectiveCurrentRegime === 'lucro_presumido' && realComp && presumidoComp) {
      const diffPercent = presumidoComp.taxAmount > 0
        ? ((presumidoComp.taxAmount - realComp.taxAmount) / presumidoComp.taxAmount * 100).toFixed(1)
        : '0'
      if (Math.abs(Number(diffPercent)) < 15) {
        recommendation = `Seu regime atual (Lucro Presumido) aparece como mais vantajoso, porém sua margem operacional está em ${(estimatedProfitMargin * 100).toFixed(1)}%. Com margens baixas, o Lucro Real pode ser mais vantajoso dependendo do volume real de créditos de PIS/COFINS. Leve esta análise ao seu contador para uma avaliação detalhada.`
      } else {
        recommendation = `Você já está no regime mais vantajoso (${currentComparison.regimeName}). Continue assim!`
      }
    } else {
      recommendation = `Você já está no regime mais vantajoso (${currentComparison.regimeName}). Continue assim!`
    }
  } else if (potentialSavingsPercentage >= 20) {
    recommendation = `Atenção! Você pode economizar ${formatCurrencyBR(potentialSavings)}/mês (${formatCurrencyBR(annualSavings)}/ano) migrando para ${bestComparison.regimeName}. Consulte seu contador para avaliar a migração.`
  } else if (potentialSavingsPercentage >= 10) {
    recommendation = `Há uma oportunidade de economia de ${formatCurrencyBR(potentialSavings)}/mês migrando para ${bestComparison.regimeName}. Vale a pena analisar com seu contador.`
  } else if (isLowMargin && effectiveCurrentRegime === 'lucro_presumido') {
    recommendation = `A diferença entre os regimes é pequena (${potentialSavingsPercentage.toFixed(1)}%), mas sua margem operacional de ${(estimatedProfitMargin * 100).toFixed(1)}% é baixa. Com margens reduzidas, o Lucro Real tende a ser mais vantajoso porque você paga IRPJ/CSLL sobre o que realmente lucra. Leve esta análise ao seu contador.`
  } else {
    recommendation = `A diferença entre os regimes é pequena (${potentialSavingsPercentage.toFixed(1)}%). O ${currentComparison.regimeName} pode ser mantido pela simplicidade operacional.`
  }

  return {
    currentRegime: effectiveCurrentRegime,
    comparisons,
    bestRegime: bestComparison.regime,
    potentialSavings,
    potentialSavingsPercentage,
    recommendation,
    annualSavings,
  }
}

// ============================================
// FUNÇÕES UTILITÁRIAS
// ============================================

function determineRegimeByRevenue(monthlyRevenue        )            {
  return (monthlyRevenue * 12) <= SIMPLES_TETO ? 'simples_nacional' : 'lucro_presumido'
}

function formatPresumidoExplanation(breakdown              , revenue        )         {
  return [
    `PIS: ${((breakdown.pis / revenue) * 100).toFixed(2)}%`,
    `COFINS: ${((breakdown.cofins / revenue) * 100).toFixed(2)}%`,
    `IRPJ: ${((breakdown.irpj / revenue) * 100).toFixed(2)}%`,
    `CSLL: ${((breakdown.csll / revenue) * 100).toFixed(2)}%`,
    `ICMS: ${((breakdown.icms / revenue) * 100).toFixed(2)}%`,
  ].join(' | ')
}

function formatRealExplanation(breakdown              , revenue        )         {
  return [
    `PIS: ${((breakdown.pis / revenue) * 100).toFixed(2)}%`,
    `COFINS: ${((breakdown.cofins / revenue) * 100).toFixed(2)}%`,
    `IRPJ: ${((breakdown.irpj / revenue) * 100).toFixed(2)}%`,
    `CSLL: ${((breakdown.csll / revenue) * 100).toFixed(2)}%`,
    `ICMS: ${((breakdown.icms / revenue) * 100).toFixed(2)}%`,
  ].join(' | ')
}

function formatCurrency(value        )         {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function formatCurrencyBR(value        )         {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

// ============================================
// FUNÇÕES PÚBLICAS UTILITÁRIAS (retrocompatíveis)
// ============================================

export function getRegimeIcon(regime           )         {
  switch (regime) {
    case 'simples_nacional': return '🟢'
    case 'lucro_presumido': return '🔵'
    case 'lucro_real': return '🟣'
    default: return '⚪'
  }
}

export function getRegimeColor(regime           )         {
  switch (regime) {
    case 'simples_nacional': return 'text-green-700'
    case 'lucro_presumido': return 'text-amber-800'
    case 'lucro_real': return 'text-purple-700'
    default: return 'text-gray-700'
  }
}

export function getRegimeBgColor(regime           )         {
  switch (regime) {
    case 'simples_nacional': return 'bg-green-50'
    case 'lucro_presumido': return 'bg-amber-50'
    case 'lucro_real': return 'bg-purple-50'
    default: return 'bg-gray-50'
  }
}

export function getSimplesNacionalBrackets() {
  return SIMPLES_NACIONAL_RANGES.map(bracket => ({
    range: bracket.name,
    nominalRate: bracket.nominalRate * 100,
    deduction: bracket.deduction,
    maxRevenue: bracket.limit,
  }))
}

export function isEligibleForSimplesNacional(monthlyRevenue        )          {
  return (monthlyRevenue * 12) <= SIMPLES_TETO
}

/**
 * Retorna a alíquota de ICMS para o estado, considerando REA.
 * Default: isREA = true (maioria dos restaurantes adere ao regime especial).
 */
export function getICMSRate(state        , isREA          = true)         {
  const rates = ICMS_RATES_BY_STATE_DUAL[state.toUpperCase()]
  if (!rates) return 0.18
  return isREA ? rates.rea : rates.normal
}

export function getICMSRatesByState(isREA          = true)                                                         {
  return Object.entries(ICMS_RATES_BY_STATE_DUAL).map(([state, rates]) => {
    const rate = isREA ? rates.rea : rates.normal
    return {
      state,
      rate,
      ratePercent: `${(rate * 100).toFixed(1)}%`,
    }
  }).sort((a, b) => a.state.localeCompare(b.state))
}

/**
 * Retorna metadados de auditoria para registrar junto com o resultado da simulação.
 */
export function getAuditMetadata()



  {
  return {
    tax_calculator_version: TAX_CALCULATOR_VERSION,
    parameter_version: PARAMETER_VERSION,
    parameter_effective_date: PARAMETER_EFFECTIVE_DATE,
  }
}
