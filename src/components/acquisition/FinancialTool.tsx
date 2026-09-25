'use client';

import { FormEvent, useCallback, useEffect, useId, useRef, useState } from 'react';
import { NumericFormat } from 'react-number-format';
import { segmentsData } from '@/lib/cmv-benchmarks.mjs';
import { CMV_TAX_MODEL_VERSION, TAX_STATES } from '@/lib/cmv-tax-estimate.mjs';
import { buildSimulationInput } from '@/lib/acquisition.mjs';
import { DIAGNOSTIC_CONTEXT_EVENT } from '@/lib/diagnostic-context.mjs';
import { financialReferenceLabel } from '@/lib/financial-reference.mjs';
import { formatPastedFinancialNumber } from '@/lib/financial-number-input.mjs';
import {
  calculateFinancialSimulation,
  type FinancialResponse,
  type FinancialSuccess,
  type FinancialTool as FinancialToolKind,
} from '@/lib/financial-simulation.mjs';
import styles from './financial-tool.module.css';

type NumericField = { key: string; label: string; help: string; unit: 'R$' | '%' };

const FIXED_AND_VARIABLE_FIELDS: NumericField[] = [
  { key: 'fixedCosts', label: 'Custos fixos mensais', unit: 'R$', help: 'Folha, aluguel e pró-labore. Separe os custos que variam com as vendas.' },
  { key: 'taxPercent', label: 'Impostos', unit: '%', help: 'Percentual sobre a receita bruta da referência escolhida.' },
  { key: 'feesPercent', label: 'Taxas de cartão e delivery', unit: '%', help: 'Percentual sobre a receita bruta total, sem repetir valores do CMV.' },
  { key: 'otherVariablePercent', label: 'Outros custos variáveis', unit: '%', help: 'Comissões e demais custos variáveis, sobre a mesma receita bruta.' },
];

const currency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const percent = (value: number, maximumFractionDigits = 3) => `${value.toLocaleString('pt-BR', { maximumFractionDigits })}%`;

/**
 * Ferramenta financeira independente da aquisição. Calcular não cadastra lead.
 * O cenário concluído fica disponível no formulário desta página, mesmo sem
 * clique no CTA. Editar ou sair da ferramenta retira o cenário anterior; os
 * dados só são enviados quando a pessoa confirma o formulário com consentimento.
 */
export default function FinancialTool({ tool, embedded = false }: { tool: FinancialToolKind; embedded?: boolean }) {
  const id = useId();
  const [answers, setAnswers] = useState<Record<string, string>>((): Record<string, string> => tool === 'cmv'
    ? { revenueBasis: 'gross', cmvInputMode: 'amount', taxState: 'SP', taxModelVersion: CMV_TAX_MODEL_VERSION }
    : {});
  const [unknown, setUnknown] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [result, setResult] = useState<FinancialSuccess | null>(null);
  const [incomplete, setIncomplete] = useState(false);
  const [busy, setBusy] = useState(false);
  const resultHeading = useRef<HTMLHeadingElement>(null);
  const errorSummary = useRef<HTMLParagraphElement>(null);
  const isCmv = tool === 'cmv';
  const isAverage = answers.referenceBasis === 'monthly_average_12m';
  const cmvInputMode = answers.cmvInputMode || 'amount';
  const ContentHeading = embedded ? 'h3' : 'h2';

  const shareWithForm = useCallback(() => {
    window.dispatchEvent(new CustomEvent(DIAGNOSTIC_CONTEXT_EVENT, {
      detail: { sourceId: id, intent: tool, answers, unknown, simulation: result?.inputs || null },
    }));
  }, [id, tool, answers, unknown, result]);

  useEffect(() => {
    if (!result && !incomplete) return;
    shareWithForm();
    // O formulário vive no layout e permanece entre rotas. O contexto pertence
    // à ferramenta que o produziu: edição, novo cálculo ou saída o invalidam.
    return () => {
      window.dispatchEvent(new CustomEvent(DIAGNOSTIC_CONTEXT_EVENT, {
        detail: { sourceId: id, clear: true },
      }));
    };
  }, [id, result, incomplete, shareWithForm]);

  const fields: NumericField[] = [
    {
      key: 'revenue', label: isAverage ? 'Quanto seu restaurante vendeu por mês, em média?' : 'Quanto seu restaurante vendeu no último mês?', unit: 'R$',
      help: isCmv ? 'Informe o total das vendas antes dos impostos. Nós estimamos os impostos para fazer a comparação.' : 'Faturamento antes dos impostos. Use essa base em todos os percentuais.',
    },
    isCmv && cmvInputMode === 'amount' ? {
      key: 'cmvAmount', label: isAverage ? 'Custo médio mensal dos ingredientes consumidos' : 'Custo dos ingredientes consumidos no último mês', unit: 'R$',
      help: isAverage
        ? 'Use o consumo total dos mesmos 12 meses dividido por 12. Consumo = estoque inicial + compras − estoque final. Só as compras não medem consumo.'
        : 'Use o custo do que foi consumido no último mês: estoque inicial + compras − estoque final. Só as compras do mês não medem esse consumo.',
    } : isCmv ? {
      key: 'cmvPercent', label: cmvInputMode === 'gross_percent' ? 'CMV sobre o faturamento bruto' : 'CMV sobre a receita líquida', unit: '%',
      help: cmvInputMode === 'gross_percent'
        ? 'Percentual do custo dos ingredientes consumidos sobre as vendas antes dos impostos. Nós ajustamos a base para comparar.'
        : 'Use apenas se seu relatório já calcula o CMV sobre a receita após impostos. Nesta simulação, aplicaremos esse percentual à receita líquida estimada.',
    } : {
      key: 'cmvPercent', label: 'CMV apurado', unit: '%',
      help: 'CMV em percentual da receita bruta da referência escolhida. Compras, sozinhas, não medem o consumo do estoque.',
    },
    ...(isCmv ? [] : FIXED_AND_VARIABLE_FIELDS),
  ];
  const missingFields = fields.filter(field => unknown[field.key]);

  function resetResult() {
    setResult(null);
    setIncomplete(false);
    setErrors({});
  }

  function change(key: string, value: string) {
    setAnswers(previous => ({ ...previous, [key]: value }));
    resetResult();
  }

  function changeReferenceBasis(value: string) {
    setAnswers(previous => {
      const next: Record<string, string> = { ...previous, referenceBasis: value };
      delete next.period;
      for (const key of ['revenue', 'cmvAmount', 'cmvPercent', 'fixedCosts', 'taxPercent', 'feesPercent', 'otherVariablePercent']) delete next[key];
      return next;
    });
    setUnknown({});
    resetResult();
  }

  function toggleUnknown(key: string, checked: boolean) {
    setUnknown(previous => ({ ...previous, [key]: checked }));
    resetResult();
  }

  function changeCmvInputMode(value: string) {
    setAnswers(previous => {
      const next: Record<string, string> = { ...previous, cmvInputMode: value };
      delete next.cmvAmount;
      delete next.cmvPercent;
      return next;
    });
    setUnknown(previous => {
      const next = { ...previous };
      delete next.cmvAmount;
      delete next.cmvPercent;
      return next;
    });
    resetResult();
  }

  function scenarioAnswers() {
    const values = { ...answers };
    // Um valor marcado como desconhecido nunca vira zero nem um valor anterior.
    for (const field of fields) if (unknown[field.key]) delete values[field.key];
    if (isCmv) delete values[cmvInputMode === 'amount' ? 'cmvPercent' : 'cmvAmount'];
    return values;
  }

  function focusResult() {
    window.requestAnimationFrame(() => resultHeading.current?.focus());
  }

  function showErrors(next: Record<string, string>) {
    setErrors(next);
    window.requestAnimationFrame(() => errorSummary.current?.focus());
  }

  async function calculate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setErrors({});
    setResult(null);
    setIncomplete(false);

    const input = buildSimulationInput(scenarioAnswers(), tool);
    const validated = calculateFinancialSimulation(input);
    const nextErrors: Record<string, string> = {};
    if (!['last_month', 'monthly_average_12m'].includes(answers.referenceBasis || '')) {
      nextErrors.referenceBasis = 'Escolha entre o último mês e a média mensal dos últimos 12 meses.';
    }
    if (!validated.ok) {
      for (const [key, message] of Object.entries(validated.errors)) {
        if (!unknown[key]) nextErrors[key] = message;
      }
    }
    if (Object.keys(nextErrors).length) {
      showErrors(nextErrors);
      return;
    }
    if (missingFields.length) {
      setIncomplete(true);
      focusResult();
      return;
    }

    setBusy(true);
    try {
      const response = await fetch('/api/financial-simulations/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
        signal: AbortSignal.timeout(20_000),
      });
      const data = await response.json() as FinancialResponse;
      if (!response.ok || !data.ok) {
        showErrors(!data.ok && data.errors ? data.errors : { form: 'Não foi possível calcular agora. Tente novamente.' });
        return;
      }
      setResult(data);
      focusResult();
    } catch {
      showErrors({ form: 'Não foi possível calcular agora. Seus valores foram preservados; tente novamente.' });
    } finally {
      setBusy(false);
    }
  }

  const breakEven = result?.result.breakEvenRevenue;
  const difference = result?.result.monthlyDifference;
  const reference = result?.result.referencePercent;
  const comparisonCmv = result?.result.comparisonCmvPercent ?? result?.inputs.cmvPercent;
  const estimatedTaxAmount = result?.result.estimatedTaxAmount;
  const estimatedTaxPercent = result?.result.estimatedTaxPercent;
  const estimatedNetRevenue = result?.result.estimatedNetRevenue;
  const grossCmvResult = isCmv && result?.inputs.revenueBasis === 'gross';
  const hasErrors = Object.keys(errors).length > 0;

  function numericField(field: NumericField) {
    return <div key={field.key} className={styles.field}>
      <label htmlFor={`${id}-${field.key}`}>{field.label}</label>
      <div className={styles.inputGroup}>
        <span aria-hidden="true">{field.unit}</span>
        <NumericFormat
          id={`${id}-${field.key}`}
          type="text"
          inputMode="decimal"
          thousandSeparator="."
          decimalSeparator=","
          allowedDecimalSeparators={[',', '.']}
          decimalScale={2}
          fixedDecimalScale
          value={unknown[field.key] ? '' : answers[field.key] || ''}
          isAllowed={({ formattedValue }) => formattedValue.length <= 40}
          onValueChange={({ formattedValue }, source) => {
            // Mudanças de referência/estado não são novas entradas do visitante.
            if (source.source === 'event') change(field.key, formattedValue);
          }}
          onPaste={event => {
            const input = event.currentTarget;
            const text = event.clipboardData.getData('text');
            const replacesAll = !input.value || (input.selectionStart === 0 && input.selectionEnd === input.value.length);
            // Inserções parciais de dígitos ficam com o controle de cursor da máscara.
            if (!replacesAll && /^\d+$/.test(text)) return;
            event.preventDefault();
            const formatted = replacesAll ? formatPastedFinancialNumber(text) : null;
            if (formatted === null) {
              resetResult();
              setErrors({ [field.key]: replacesAll ? 'Cole um número válido com até duas casas decimais.' : 'Selecione todo o valor para colar um número com separadores.' });
              return;
            }
            change(field.key, formatted);
            window.requestAnimationFrame(() => input.setSelectionRange(formatted.length, formatted.length));
          }}
          disabled={unknown[field.key]}
          placeholder={unknown[field.key] ? 'Não informado' : 'Informe o valor'}
          aria-label={`${field.label} ${field.unit === '%' ? 'em percentual' : 'em reais'}`}
          aria-invalid={!!errors[field.key]}
          aria-describedby={`${id}-${field.key}-help${errors[field.key] ? ` ${id}-${field.key}-error` : ''}`}
          required={!unknown[field.key]}
        />
      </div>
      <p id={`${id}-${field.key}-help`} className={styles.fieldHelp}>{field.help}</p>
      <label className={styles.unknown}><input type="checkbox" checked={!!unknown[field.key]} onChange={event => toggleUnknown(field.key, event.target.checked)} />Não sei informar<span className={styles.srOnly}>: {field.label}</span></label>
      {errors[field.key] && <p id={`${id}-${field.key}-error`} className={styles.fieldError}>{errors[field.key]}</p>}
    </div>;
  }

  return (
    <section className={`${styles.section}${embedded ? ` ${styles.embedded}` : ''}`} aria-labelledby={embedded ? undefined : `${id}-title`} aria-label={embedded ? 'Calculadora de CMV' : undefined}>
      {!embedded && <header className={styles.header}>
        <p className={styles.eyebrow}>{isCmv ? 'Calculadora de CMV' : 'Ponto de equilíbrio'}</p>
        <h1 id={`${id}-title`}>{isCmv ? 'Entenda o CMV da sua operação.' : 'Quanto sua operação precisa faturar?'}</h1>
        <p>{isCmv
          ? 'Informe quanto vendeu e o custo dos ingredientes consumidos. Nós estimamos os impostos e comparamos seu CMV com a referência do segmento.'
          : 'Estime a receita mensal necessária para cobrir os custos, a partir dos números da sua operação.'}</p>
      </header>}

      <div className={styles.layout}>
        <form className={styles.form} onSubmit={calculate} noValidate aria-busy={busy}>
          <ContentHeading>Dados do cenário</ContentHeading>
          <p className={styles.hint}>Escolha a referência e use a mesma para todos os valores. Se não souber um número, marque “Não sei informar”.{!isCmv && ' Informe zero somente quando esse custo não existir.'}</p>
          <fieldset disabled={busy} className={styles.fields}>
            <legend className={styles.srOnly}>Valores mensais para {isCmv ? 'análise de CMV' : 'ponto de equilíbrio'}</legend>
            <div className={styles.field}>
              <label htmlFor={`${id}-referenceBasis`}>Quais números você prefere usar?</label>
              <select id={`${id}-referenceBasis`} value={answers.referenceBasis || ''} onChange={event => changeReferenceBasis(event.target.value)} aria-invalid={!!errors.referenceBasis} aria-describedby={`${id}-referenceBasis-help${errors.referenceBasis ? ` ${id}-referenceBasis-error` : ''}`} required>
                <option value="">Selecione a referência</option>
                <option value="last_month">Último mês</option>
                <option value="monthly_average_12m">Média mensal dos últimos 12 meses</option>
              </select>
              <p id={`${id}-referenceBasis-help`} className={styles.fieldHelp}>{isAverage
                ? 'Informe as médias mensais de vendas e custos dos mesmos 12 meses, não os totais do ano. Nos percentuais, use o custo total dividido pela receita total dessa mesma referência. Ao trocar a referência, os valores são limpos.'
                : answers.referenceBasis === 'last_month'
                  ? 'Use vendas e custos do último mês. Não precisa informar mês e ano. Ao trocar a referência, os valores são limpos.'
                  : 'Escolha o último mês ou a média mensal dos últimos 12 meses. Depois, informe vendas e custos da mesma referência, sem precisar indicar mês e ano.'}</p>
              {errors.referenceBasis && <p id={`${id}-referenceBasis-error`} className={styles.fieldError}>{errors.referenceBasis}</p>}
            </div>
            {isCmv && <div className={styles.field}>
              <label htmlFor={`${id}-segment`}>Segmento culinário</label>
              <select id={`${id}-segment`} value={answers.segment || ''} onChange={event => change('segment', event.target.value)} aria-invalid={!!errors.segment} aria-describedby={errors.segment ? `${id}-segment-error` : undefined} required>
                <option value="">Selecione o segmento</option>
                {segmentsData.map(segment => <option key={segment.slug} value={segment.slug}>{segment.name}</option>)}
                <option value="other">Outro segmento</option>
              </select>
              {errors.segment && <p id={`${id}-segment-error`} className={styles.fieldError}>{errors.segment}</p>}
            </div>}
            {numericField(fields[0])}
            {isCmv && <>
              <div className={styles.field}>
                <label htmlFor={`${id}-taxState`}>Estado para a estimativa de impostos</label>
                <select id={`${id}-taxState`} value={answers.taxState} onChange={event => change('taxState', event.target.value)} aria-invalid={!!errors.taxState} aria-describedby={`${id}-taxState-help${errors.taxState ? ` ${id}-taxState-error` : ''}`} required>
                  {TAX_STATES.map(state => <option key={state.code} value={state.code}>{state.label} ({state.code})</option>)}
                </select>
                <p id={`${id}-taxState-help`} className={styles.fieldHelp}>Selecione o estado da sua operação. A estimativa usa o faturamento informado e as premissas Rook para esse estado. O imposto efetivo da sua empresa pode ser diferente.</p>
                {errors.taxState && <p id={`${id}-taxState-error`} className={styles.fieldError}>{errors.taxState}</p>}
              </div>
              <div className={styles.field}>
                <label htmlFor={`${id}-cmvInputMode`}>Como você conhece seu custo com ingredientes?</label>
                <select id={`${id}-cmvInputMode`} value={cmvInputMode} onChange={event => changeCmvInputMode(event.target.value)} aria-invalid={!!errors.cmvInputMode} aria-describedby={errors.cmvInputMode ? `${id}-cmvInputMode-error` : undefined} required>
                  <option value="amount">Em reais (R$)</option>
                  <option value="gross_percent">Em % das vendas antes dos impostos</option>
                  <option value="net_percent">Já tenho o CMV sobre a receita líquida</option>
                </select>
                {errors.cmvInputMode && <p id={`${id}-cmvInputMode-error`} className={styles.fieldError}>{errors.cmvInputMode}</p>}
              </div>
            </>}
            {fields.slice(1).map(numericField)}
          </fieldset>
          {hasErrors && <p className={styles.error} role="alert" tabIndex={-1} ref={errorSummary}>{errors.form || errors.taxModelVersion || 'Revise os campos indicados para continuar.'}</p>}
          <button className={`btn-primary ${styles.calculate}`} type="submit" disabled={busy}>{busy ? 'Calculando…' : missingFields.length ? 'Continuar com os dados disponíveis' : isCmv ? 'Analisar meu CMV' : 'Calcular ponto de equilíbrio'}</button>
        </form>

        <aside className={styles.result} aria-live="polite" aria-atomic="true">
          {result ? <>
            <p className={styles.eyebrow}>Resultado do cenário · {financialReferenceLabel(answers)}</p>
            <ContentHeading ref={resultHeading} tabIndex={-1}>{result.result.status === 'non_positive_margin'
              ? 'A margem precisa de atenção.'
              : result.result.status === 'no_reference' ? 'Ainda não há referência para esse segmento.'
                : isCmv ? 'Seu CMV em perspectiva.' : 'Seu ponto de equilíbrio estimado.'}</ContentHeading>
            {typeof breakEven === 'number' && <p className={styles.figure}>{currency(breakEven)}<span>de receita por mês para cobrir os custos</span></p>}
            {isCmv && typeof difference === 'number' && difference > 0 && <p className={styles.figure}>{currency(difference)}<span>de diferença mensal estimada para investigar</span></p>}
            {grossCmvResult && typeof estimatedTaxAmount === 'number' && typeof estimatedNetRevenue === 'number' && <section className={styles.estimate} aria-label="Faturamento e impostos estimados">
              <h3>Como chegamos à base da comparação</h3>
              <dl className={styles.revenueBreakdown}>
                <div><dt>Faturamento bruto informado</dt><dd>{currency(result.inputs.revenue)}</dd></div>
                <div><dt>− Impostos estimados{typeof estimatedTaxPercent === 'number' ? ` (${percent(estimatedTaxPercent)})` : ''}</dt><dd>{currency(estimatedTaxAmount)}</dd></div>
                <div className={styles.netRevenue}><dt>= Receita líquida estimada</dt><dd>{currency(estimatedNetRevenue)}</dd></div>
              </dl>
              <p>Usamos essa receita após os impostos estimados para comparar seu CMV. Esta simulação não apura o imposto efetivo da sua empresa.</p>
            </section>}
            <p className={styles.summary}>{result.summary}</p>
            {isCmv && typeof comparisonCmv === 'number' && <dl className={styles.metrics}>
              <div><dt>{grossCmvResult ? 'CMV sobre a receita líquida estimada' : 'CMV informado'}</dt><dd>{percent(comparisonCmv, grossCmvResult ? 2 : 3)}</dd></div>
              {typeof reference === 'number' && <div><dt>Referência do segmento</dt><dd>{percent(reference)}</dd></div>}
            </dl>}
            <details className={styles.assumptions}>
              <summary>Ver a conta e as premissas</summary>
              {result.assumptions.map(assumption => <p key={assumption}>{assumption}</p>)}
              <p>{isCmv
                ? grossCmvResult
                  ? 'Diferença mensal = custo dos ingredientes consumidos − (receita líquida estimada × referência do segmento ÷ 100).'
                  : 'Diferença mensal = receita líquida × (CMV informado − referência) ÷ 100.'
                : 'Ponto de equilíbrio = custos fixos ÷ [1 − (CMV + impostos + taxas + outros variáveis) ÷ 100].'}</p>
            </details>
            <div className={styles.nextStep}><h3>Vamos conversar sobre esse resultado?</h3><p>O cenário será incluído no formulário abaixo. O envio acontece quando você confirmar sua solicitação.</p><a href="#cadastro" className="btn-primary" onClick={shareWithForm}>Solicitar demonstração</a></div>
          </> : incomplete ? <>
            <p className={styles.eyebrow}>Cenário incompleto</p>
            <ContentHeading ref={resultHeading} tabIndex={-1}>Podemos começar pelo que você já sabe.</ContentHeading>
            <p className={styles.summary}>Ainda faltam dados para calcular. Os campos desconhecidos foram mantidos sem valor, e nenhum resultado financeiro foi estimado.</p>
            <ul className={styles.missing}>{missingFields.map(field => <li key={field.key}>{field.label}</li>)}</ul>
            <div className={styles.nextStep}><p>Leve os dados disponíveis ao formulário para conversar com a equipe sobre os próximos passos.</p><a href="#cadastro" className="btn-primary" onClick={shareWithForm}>Solicitar demonstração</a></div>
          </> : <>
            <p className={styles.eyebrow}>Como usar</p>
            <ContentHeading>Um cenário para orientar a próxima decisão.</ContentHeading>
            <ol className={styles.steps}><li>Escolha o último mês ou a média mensal dos últimos 12 meses e informe os números da operação.</li><li>Confira o resultado e as premissas da conta.</li><li>Se quiser, leve esse contexto a uma demonstração do Rook.</li></ol>
            <p className={styles.note}>A análise é gratuita. Você pode calcular antes de informar seus dados de contato.</p>
          </>}
        </aside>
      </div>
    </section>
  );
}
