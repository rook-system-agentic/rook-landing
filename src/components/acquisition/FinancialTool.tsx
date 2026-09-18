'use client';

import { FormEvent, useId, useRef, useState } from 'react';
import { segmentsData } from '@/lib/cmv-benchmarks.mjs';
import { buildSimulationInput } from '@/lib/acquisition.mjs';
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
  { key: 'taxPercent', label: 'Impostos', unit: '%', help: 'Alíquota efetiva sobre a receita bruta do mês.' },
  { key: 'feesPercent', label: 'Taxas de cartão e delivery', unit: '%', help: 'Percentual sobre a receita bruta total, sem repetir valores do CMV.' },
  { key: 'otherVariablePercent', label: 'Outros custos variáveis', unit: '%', help: 'Comissões e demais custos variáveis, sobre a mesma receita bruta.' },
];

const currency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const percent = (value: number) => `${value.toLocaleString('pt-BR')}%`;

/**
 * Ferramenta financeira independente da aquisição. Calcular não cadastra lead.
 * O contexto só chega ao formulário no clique explícito depois do resultado ou
 * de um cenário incompleto; as contas continuam no mesmo motor validado da API.
 */
export default function FinancialTool({ tool }: { tool: FinancialToolKind }) {
  const id = useId();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [unknown, setUnknown] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [result, setResult] = useState<FinancialSuccess | null>(null);
  const [incomplete, setIncomplete] = useState(false);
  const [busy, setBusy] = useState(false);
  const resultHeading = useRef<HTMLHeadingElement>(null);
  const errorSummary = useRef<HTMLParagraphElement>(null);
  const isCmv = tool === 'cmv';

  const fields: NumericField[] = [
    {
      key: 'revenue', label: isCmv ? 'Receita líquida mensal' : 'Receita bruta mensal', unit: 'R$',
      help: isCmv ? 'Receita após deduções. O CMV precisa usar essa mesma base.' : 'Faturamento antes dos impostos. Use essa base em todos os percentuais.',
    },
    {
      key: 'cmvPercent', label: 'CMV apurado', unit: '%',
      help: `CMV em percentual da receita ${isCmv ? 'líquida' : 'bruta'}. Compras do mês, sozinhas, não medem o consumo do estoque.`,
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

  function toggleUnknown(key: string, checked: boolean) {
    setUnknown(previous => ({ ...previous, [key]: checked }));
    resetResult();
  }

  function scenarioAnswers() {
    const values = { ...answers };
    // Um valor marcado como desconhecido nunca vira zero nem um valor anterior.
    for (const field of fields) if (unknown[field.key]) delete values[field.key];
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
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(answers.period || '')) {
      nextErrors.period = 'Selecione o mês dos valores informados.';
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

  function shareWithForm() {
    window.dispatchEvent(new CustomEvent('rook:diagnostic-context', {
      detail: { intent: tool, answers: scenarioAnswers(), simulation: result?.inputs || null },
    }));
  }

  const breakEven = result?.result.breakEvenRevenue;
  const difference = result?.result.monthlyDifference;
  const reference = result?.result.referencePercent;
  const hasErrors = Object.keys(errors).length > 0;

  return (
    <section className={styles.section} aria-labelledby={`${id}-title`}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>{isCmv ? 'Calculadora de CMV' : 'Ponto de equilíbrio'}</p>
        <h1 id={`${id}-title`}>{isCmv ? 'Entenda o CMV da sua operação.' : 'Quanto sua operação precisa faturar?'}</h1>
        <p>{isCmv
          ? 'Compare o CMV que você já apurou com a referência do seu segmento e veja o que a diferença representa em reais.'
          : 'Estime a receita mensal necessária para cobrir os custos, a partir dos números da sua operação.'}</p>
      </header>

      <div className={styles.layout}>
        <form className={styles.form} onSubmit={calculate} noValidate aria-busy={busy}>
          <h2>Dados do cenário</h2>
          <p className={styles.hint}>Use valores do mesmo mês. Se não souber um número, marque “Não sei informar”.{!isCmv && ' Informe zero somente quando esse custo não existir.'}</p>
          <fieldset disabled={busy} className={styles.fields}>
            <legend className={styles.srOnly}>Valores mensais para {isCmv ? 'análise de CMV' : 'ponto de equilíbrio'}</legend>
            <div className={styles.field}>
              <label htmlFor={`${id}-period`}>Mês de referência</label>
              <input id={`${id}-period`} type="month" value={answers.period || ''} onChange={event => change('period', event.target.value)} aria-invalid={!!errors.period} aria-describedby={errors.period ? `${id}-period-error` : undefined} required />
              {errors.period && <p id={`${id}-period-error`} className={styles.fieldError}>{errors.period}</p>}
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
            {fields.map(field => <div key={field.key} className={styles.field}>
              <label htmlFor={`${id}-${field.key}`}>{field.label}</label>
              <div className={styles.inputGroup}>
                <span aria-hidden="true">{field.unit}</span>
                <input id={`${id}-${field.key}`} type="text" inputMode="decimal" maxLength={40} value={unknown[field.key] ? '' : answers[field.key] || ''} onChange={event => change(field.key, event.target.value)} disabled={unknown[field.key]} placeholder={unknown[field.key] ? 'Não informado' : 'Informe o valor'} aria-label={`${field.label} ${field.unit === '%' ? 'em percentual' : 'em reais'}`} aria-invalid={!!errors[field.key]} aria-describedby={`${id}-${field.key}-help${errors[field.key] ? ` ${id}-${field.key}-error` : ''}`} required={!unknown[field.key]} />
              </div>
              <p id={`${id}-${field.key}-help`} className={styles.fieldHelp}>{field.help}</p>
              <label className={styles.unknown}><input type="checkbox" checked={!!unknown[field.key]} onChange={event => toggleUnknown(field.key, event.target.checked)} />Não sei informar<span className={styles.srOnly}>: {field.label}</span></label>
              {errors[field.key] && <p id={`${id}-${field.key}-error`} className={styles.fieldError}>{errors[field.key]}</p>}
            </div>)}
          </fieldset>
          {hasErrors && <p className={styles.error} role="alert" tabIndex={-1} ref={errorSummary}>{errors.form || 'Revise os campos indicados para continuar.'}</p>}
          <button className={`btn-primary ${styles.calculate}`} type="submit" disabled={busy}>{busy ? 'Calculando…' : missingFields.length ? 'Continuar com os dados disponíveis' : isCmv ? 'Analisar meu CMV' : 'Calcular ponto de equilíbrio'}</button>
        </form>

        <aside className={styles.result} aria-live="polite" aria-atomic="true">
          {result ? <>
            <p className={styles.eyebrow}>Resultado do cenário · {answers.period}</p>
            <h2 ref={resultHeading} tabIndex={-1}>{result.result.status === 'non_positive_margin'
              ? 'A margem precisa de atenção.'
              : result.result.status === 'no_reference' ? 'Ainda não há referência para esse segmento.'
                : isCmv ? 'Seu CMV em perspectiva.' : 'Seu ponto de equilíbrio estimado.'}</h2>
            {typeof breakEven === 'number' && <p className={styles.figure}>{currency(breakEven)}<span>de receita por mês para cobrir os custos</span></p>}
            {isCmv && typeof difference === 'number' && difference > 0 && <p className={styles.figure}>{currency(difference)}<span>de diferença mensal estimada para investigar</span></p>}
            <p className={styles.summary}>{result.summary}</p>
            {isCmv && typeof reference === 'number' && <dl className={styles.metrics}>
              <div><dt>CMV informado</dt><dd>{percent(result.inputs.cmvPercent)}</dd></div>
              <div><dt>Referência do segmento</dt><dd>{percent(reference)}</dd></div>
            </dl>}
            <details className={styles.assumptions}>
              <summary>Ver a conta e as premissas</summary>
              {result.assumptions.map(assumption => <p key={assumption}>{assumption}</p>)}
              <p>{isCmv
                ? 'Diferença mensal = receita líquida × (CMV informado − referência) ÷ 100.'
                : 'Ponto de equilíbrio = custos fixos ÷ [1 − (CMV + impostos + taxas + outros variáveis) ÷ 100].'}</p>
            </details>
            <div className={styles.nextStep}><h3>Vamos conversar sobre esse resultado?</h3><p>O cenário será incluído no formulário abaixo. O envio acontece quando você confirmar sua solicitação.</p><a href="#cadastro" className="btn-primary" onClick={shareWithForm}>Solicitar demonstração</a></div>
          </> : incomplete ? <>
            <p className={styles.eyebrow}>Cenário incompleto</p>
            <h2 ref={resultHeading} tabIndex={-1}>Podemos começar pelo que você já sabe.</h2>
            <p className={styles.summary}>Ainda faltam dados para calcular. Os campos desconhecidos foram mantidos sem valor, e nenhum resultado financeiro foi estimado.</p>
            <ul className={styles.missing}>{missingFields.map(field => <li key={field.key}>{field.label}</li>)}</ul>
            <div className={styles.nextStep}><p>Leve os dados disponíveis ao formulário para conversar com a equipe sobre os próximos passos.</p><a href="#cadastro" className="btn-primary" onClick={shareWithForm}>Solicitar demonstração</a></div>
          </> : <>
            <p className={styles.eyebrow}>Como usar</p>
            <h2>Um cenário para orientar a próxima decisão.</h2>
            <ol className={styles.steps}><li>Escolha o mês e informe os números da operação.</li><li>Confira o resultado e as premissas da conta.</li><li>Se quiser, leve esse contexto a uma demonstração do Rook.</li></ol>
            <p className={styles.note}>A análise é gratuita. Você pode calcular antes de informar seus dados de contato.</p>
          </>}
        </aside>
      </div>
    </section>
  );
}
