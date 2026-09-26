'use client';

import { FormEvent, Fragment, useCallback, useEffect, useId, useRef, useState } from 'react';
import { NumericFormat, PatternFormat } from 'react-number-format';
import { culinarySegments } from '@/lib/culinary-segments.mjs';
import { CMV_TAX_MODEL_VERSION, TAX_STATES } from '@/lib/cmv-input-options.mjs';
import { buildSimulationInput, normalizePhone } from '@/lib/acquisition-input.mjs';
import type { LeadAttribution } from '@/lib/lead-attribution.mjs';
import { captureVisitAttribution } from '@/lib/lead-attribution-client';
import { track, TRACKING_EVENTS } from '@/lib/track';
import { DIAGNOSTIC_CONTEXT_EVENT } from '@/lib/diagnostic-context.mjs';
import { financialReferenceLabel } from '@/lib/financial-reference.mjs';
import { formatPastedFinancialNumber } from '@/lib/financial-number-input.mjs';
import { validateFinancialInput, type FinancialTool as FinancialToolKind } from '@/lib/financial-input.mjs';
import type { PublicFinancialSuccess } from '@/lib/public-financial-simulation.mjs';
import styles from './financial-tool.module.css';

type NumericField = { key: string; label: string; help: string; unit: 'R$' | '%' };

const FIXED_AND_VARIABLE_FIELDS: NumericField[] = [
  { key: 'fixedCosts', label: 'Custos fixos mensais', unit: 'R$', help: 'Folha, aluguel e pró-labore. Não repita ingredientes, impostos sobre vendas ou taxas já informados nos outros campos.' },
  { key: 'feesPercent', label: 'Taxas de cartão e delivery', unit: '%', help: 'Use o total pago em taxas de cartão e delivery como percentual de todas as vendas. A taxa do aplicativo, aplicada só ao delivery, não é esse percentual.' },
  { key: 'otherVariablePercent', label: 'Outros custos variáveis', unit: '%', help: 'Comissões e demais custos variáveis, sobre a mesma receita bruta.' },
];

const currency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const percent = (value: number, maximumFractionDigits = 3) => `${value.toLocaleString('pt-BR', { maximumFractionDigits })}%`;

/**
 * Primeiro valida os números, depois identifica o visitante. O clique final
 * grava a análise no CRM e só a confirmação do servidor libera o resultado.
 * Um retry preserva os mesmos dados e identificador para não duplicar o envio.
 */
export default function FinancialTool({ tool, embedded = false }: { tool: FinancialToolKind; embedded?: boolean }) {
  const id = useId();
  const [answers, setAnswers] = useState<Record<string, string>>((): Record<string, string> => tool === 'cmv'
    ? { revenueBasis: 'gross', cmvInputMode: 'amount', taxState: 'SP', taxModelVersion: CMV_TAX_MODEL_VERSION }
    : { taxInputMode: 'amount' });
  const [unknown, setUnknown] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [result, setResult] = useState<PublicFinancialSuccess | null>(null);
  const [incomplete, setIncomplete] = useState(false);
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState<'numbers' | 'identity'>('numbers');
  const [profile, setProfile] = useState<Record<string, string>>({});
  const [commercialContactRequested, setCommercialContactRequested] = useState(false);
  const [locked, setLocked] = useState(false);
  const inFlight = useRef(false);
  const completed = useRef(false);
  const frozen = useRef<Record<string, unknown> | null>(null);
  const submissionId = useRef('');
  const attribution = useRef<LeadAttribution | null>(null);
  const identityHeading = useRef<HTMLHeadingElement>(null);
  const resultHeading = useRef<HTMLHeadingElement>(null);
  const errorSummary = useRef<HTMLParagraphElement>(null);
  const isCmv = tool === 'cmv';
  const isAverage = answers.referenceBasis === 'monthly_average_12m';
  const cmvInputMode = answers.cmvInputMode || 'amount';
  const taxInputMode = answers.taxInputMode || 'amount';
  const ContentHeading = embedded ? 'h3' : 'h2';

  useEffect(() => {
    submissionId.current = crypto.randomUUID();
    attribution.current = captureVisitAttribution({ href: window.location.href, referrer: document.referrer });
  }, []);

  useEffect(() => {
    // Esperar o commit da etapa evita focar um cabeçalho ainda não montado.
    if (result || incomplete) resultHeading.current?.focus();
    else if (step === 'identity') identityHeading.current?.focus();
  }, [step, result, incomplete]);

  const shareWithForm = useCallback(() => {
    window.dispatchEvent(new CustomEvent(DIAGNOSTIC_CONTEXT_EVENT, {
      detail: { sourceId: id, intent: tool, answers, unknown, simulation: result ? buildSimulationInput(answers, tool) : null },
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

  const taxField: NumericField = taxInputMode === 'amount' ? {
    key: 'taxAmount', label: isAverage ? 'Impostos sobre as vendas, em média por mês' : 'Impostos sobre as vendas no último mês', unit: 'R$',
    help: `${isAverage ? 'Use a média mensal dos impostos sobre as vendas dos mesmos 12 meses.' : 'Use o valor da guia dos impostos sobre as vendas do último mês.'} Deixe de fora guias atrasadas, multas e tributos da folha já incluídos nos custos fixos.`,
  } : {
    key: 'taxPercent', label: 'Impostos sobre o faturamento', unit: '%',
    help: `${isAverage ? 'Use o percentual dos impostos sobre o faturamento total dos mesmos 12 meses.' : 'Use o percentual dos impostos sobre o faturamento do último mês.'} Deixe de fora guias atrasadas, multas e tributos da folha já incluídos nos custos fixos.`,
  };

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
      help: 'Use o custo dos ingredientes consumidos como percentual das vendas antes dos impostos, não da receita líquida. Compras, sozinhas, não medem o consumo do estoque.',
    },
    ...(isCmv ? [] : [FIXED_AND_VARIABLE_FIELDS[0], taxField, ...FIXED_AND_VARIABLE_FIELDS.slice(1)]),
  ];
  const missingFields = fields.filter(field => unknown[field.key]);

  function resetResult() {
    setResult(null);
    setIncomplete(false);
    setErrors({});
  }

  function change(key: string, value: string) {
    if (inFlight.current || frozen.current || completed.current) return;
    setAnswers(previous => ({ ...previous, [key]: value }));
    resetResult();
  }

  function changeReferenceBasis(value: string) {
    if (inFlight.current || frozen.current || completed.current) return;
    setAnswers(previous => {
      const next: Record<string, string> = { ...previous, referenceBasis: value };
      delete next.period;
      for (const key of ['revenue', 'cmvAmount', 'cmvPercent', 'fixedCosts', 'taxAmount', 'taxPercent', 'feesPercent', 'otherVariablePercent']) delete next[key];
      return next;
    });
    setUnknown({});
    resetResult();
  }

  function toggleUnknown(key: string, checked: boolean) {
    if (inFlight.current || frozen.current || completed.current) return;
    setUnknown(previous => ({ ...previous, [key]: checked }));
    resetResult();
  }

  function changeCmvInputMode(value: string) {
    if (inFlight.current || frozen.current || completed.current) return;
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

  function changeTaxInputMode(value: string) {
    if (inFlight.current || frozen.current || completed.current) return;
    setAnswers(previous => {
      const next: Record<string, string> = { ...previous, taxInputMode: value };
      delete next.taxAmount;
      delete next.taxPercent;
      return next;
    });
    setUnknown(previous => {
      const next = { ...previous };
      delete next.taxAmount;
      delete next.taxPercent;
      return next;
    });
    resetResult();
  }

  function scenarioAnswers() {
    const values = { ...answers };
    // Um valor marcado como desconhecido nunca vira zero nem um valor anterior.
    for (const field of fields) if (unknown[field.key]) delete values[field.key];
    if (isCmv) delete values[cmvInputMode === 'amount' ? 'cmvPercent' : 'cmvAmount'];
    else delete values[taxInputMode === 'amount' ? 'taxPercent' : 'taxAmount'];
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
    if (inFlight.current) return;
    if (completed.current) { focusResult(); return; }
    setErrors({});
    setResult(null);
    setIncomplete(false);

    const input = buildSimulationInput(scenarioAnswers(), tool);
    if (!frozen.current) {
      const validated = validateFinancialInput(input);
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
        setStep('numbers');
        showErrors(nextErrors);
        return;
      }
      if (missingFields.length) {
        setIncomplete(true);
        focusResult();
        return;
      }
      if (step === 'numbers') {
        setStep('identity');
        window.requestAnimationFrame(() => identityHeading.current?.focus());
        return;
      }
      if ((profile.name || '').trim().length < 2) nextErrors.name = 'Informe seu nome.';
      if (!normalizePhone(profile.phone)) nextErrors.phone = 'Informe um WhatsApp válido com DDD.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((profile.email || '').trim())) nextErrors.email = 'Informe um e-mail válido.';
      if (Object.keys(nextErrors).length) { showErrors(nextErrors); return; }
    }

    // A prévia de homologação nunca cria um lead fictício nem simula entrega.
    if (process.env.NEXT_PUBLIC_ENV === 'homolog' && new URLSearchParams(window.location.search).get('preview') === '1') {
      showErrors({ form: 'Esta é uma prévia. O envio de dados está desativado e nenhum cadastro foi criado.' });
      return;
    }
    inFlight.current = true;
    setBusy(true);
    try {
      const challengeResponse = await fetch('/api/financial-simulations/', { cache: 'no-store', signal: AbortSignal.timeout(20_000) });
      const challenge = await challengeResponse.json();
      if (!challengeResponse.ok) throw new Error(challenge.error || 'Não foi possível iniciar o envio. Tente novamente.');
      const { solveCommercialLeadChallenge } = await import('@/lib/commercial-lead-challenge-client.mjs');
      const solution = await solveCommercialLeadChallenge(challenge);
      if (!frozen.current) {
        frozen.current = {
          ...profile, commercialContactRequested, simulation: input,
          submissionId: submissionId.current || (submissionId.current = crypto.randomUUID()),
          attribution: attribution.current,
        };
      }
      setLocked(true);
      const response = await fetch('/api/financial-simulations/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...frozen.current, antiBot: { token: challenge.token, solution } }),
        signal: AbortSignal.timeout(20_000),
      });
      const data = await response.json();
      if (response.status === 422) {
        // A validação precede qualquer gravação. É seguro liberar a edição.
        frozen.current = null;
        setLocked(false);
        const nextErrors: Record<string, string> = {};
        for (const [key, message] of Object.entries(data.fieldErrors || {})) {
          if (typeof message !== 'string') continue;
          const field = key.startsWith('simulation.') ? key.slice('simulation.'.length) : key;
          nextErrors[field === 'simulation' ? 'form' : field] = message;
          if (key.startsWith('simulation')) setStep('numbers');
        }
        showErrors(Object.keys(nextErrors).length ? nextErrors : { form: 'Revise os dados para continuar.' });
        return;
      }
      if (!response.ok || data.success !== true || data.simulation?.ok !== true || data.simulation.tool !== tool) {
        throw new Error(data.error || 'Não foi possível confirmar o cadastro. Seus dados estão preservados; tente novamente.');
      }
      completed.current = true;
      setResult(data.simulation);
      focusResult();
      // Só a confirmação do CRM conta como lead. Nenhum dado pessoal ou
      // financeiro é enviado ao rastreamento; canal é uma constante do fluxo.
      track(TRACKING_EVENTS.lead, { channel: tool === 'cmv' ? 'cmv' : 'diagnostico' });
    } catch (problem) {
      showErrors({ form: problem instanceof Error && problem.name !== 'TimeoutError'
        ? problem.message : 'Não foi possível confirmar o cadastro agora. Seus dados estão preservados; tente novamente.' });
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  }

  function changeProfile(key: string, value: string) {
    if (inFlight.current || frozen.current || completed.current) return;
    setProfile(previous => ({ ...previous, [key]: value }));
    setErrors(previous => { const next = { ...previous }; delete next[key]; delete next.form; return next; });
  }

  function newAnalysis() {
    if (inFlight.current || !completed.current) return;
    completed.current = false;
    frozen.current = null;
    submissionId.current = crypto.randomUUID();
    setLocked(false);
    setStep('numbers');
    resetResult();
  }

  const breakEven = result?.result.breakEvenRevenue;
  const comparisonCmv = result?.result.comparisonCmvPercent ?? result?.inputs.cmvPercent;
  const estimatedTaxAmount = result?.result.estimatedTaxAmount;
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
          <p className={styles.eyebrow}>{result ? 'Etapa 3 de 3 · Resultado' : step === 'numbers' ? 'Etapa 1 de 3 · Números da operação' : 'Etapa 2 de 3 · Seus dados'}</p>
          <div hidden={step !== 'numbers'}>
          <ContentHeading>Dados do cenário</ContentHeading>
          <p className={styles.hint}>Escolha a referência e use a mesma para todos os valores. Se não souber um número, marque “Não sei informar”.{!isCmv && ' Informe zero somente quando esse custo não existir.'}</p>
          <fieldset disabled={busy || locked} className={styles.fields}>
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
                {culinarySegments.map(segment => <option key={segment.slug} value={segment.slug}>{segment.name}</option>)}
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
                <p id={`${id}-taxState-help`} className={styles.fieldHelp}>Selecione o estado da sua operação para estimar os impostos. O valor efetivo da sua empresa pode ser diferente.</p>
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
            {fields.slice(1).map(field => <Fragment key={field.key}>
              {!isCmv && field.key === taxField.key && <div className={styles.field}>
                <label htmlFor={`${id}-taxInputMode`}>Como você prefere informar os impostos?</label>
                <select id={`${id}-taxInputMode`} value={taxInputMode} onChange={event => changeTaxInputMode(event.target.value)} aria-invalid={!!errors.taxInputMode} aria-describedby={`${id}-taxInputMode-help${errors.taxInputMode ? ` ${id}-taxInputMode-error` : ''}`} required>
                  <option value="amount">Valor da guia em reais (R$)</option>
                  <option value="percent">Percentual sobre o faturamento (%)</option>
                </select>
                <p id={`${id}-taxInputMode-help`} className={styles.fieldHelp}>Use a mesma referência das vendas. Ao trocar a forma de informar, o valor dos impostos é limpo.</p>
                {errors.taxInputMode && <p id={`${id}-taxInputMode-error`} className={styles.fieldError}>{errors.taxInputMode}</p>}
              </div>}
              {numericField(field)}
            </Fragment>)}
          </fieldset>
          </div>
          {step === 'identity' && <>
            <ContentHeading ref={identityHeading} tabIndex={-1}>{result ? 'Cadastro confirmado' : 'Como podemos identificar sua análise?'}</ContentHeading>
            <p className={styles.hint}>{result
              ? 'Seus dados e os números da análise foram registrados. O resultado está disponível nesta página.'
              : 'Falta só esta etapa. Informe seu nome, WhatsApp e e-mail para ver o resultado gratuito.'}</p>
            <fieldset className={styles.fields} disabled={busy || locked}>
              <legend className={styles.srOnly}>Identificação da análise</legend>
              {(['name', 'phone', 'email'] as const).map(key => {
                const label = key === 'name' ? 'Nome' : key === 'phone' ? 'WhatsApp com DDD' : 'E-mail';
                const props = {
                  id: `${id}-${key}`, name: key, value: profile[key] || '', maxLength: key === 'email' ? 254 : 120,
                  required: true, onChange: (event: React.ChangeEvent<HTMLInputElement>) => changeProfile(key, event.target.value),
                  'aria-invalid': !!errors[key], 'aria-describedby': errors[key] ? `${id}-${key}-error` : undefined,
                };
                return <div key={key} className={styles.field}>
                  <label htmlFor={`${id}-${key}`}>{label}</label>
                  {key === 'phone'
                    ? <PatternFormat {...props} type="tel" inputMode="tel" autoComplete="tel-national" format="(##) #####-####" placeholder="(11) 99999-9999" />
                    : <input {...props} type={key === 'email' ? 'email' : 'text'} autoComplete={key === 'email' ? 'email' : 'name'} />}
                  {errors[key] && <p id={`${id}-${key}-error`} className={styles.fieldError}>{errors[key]}</p>}
                </div>;
              })}
              <label className={styles.contactChoice}>
                <input id={`${id}-commercialContactRequested`} type="checkbox" checked={commercialContactRequested}
                  onChange={event => setCommercialContactRequested(event.target.checked)} />
                <span>Quero que a equipe Rook entre em contato comigo para conversar sobre esta análise. <small>Opcional.</small></span>
              </label>
            </fieldset>
            {!result && <p className={styles.privacy}>Ao clicar em “Ver {isCmv ? 'minha análise de CMV' : 'meu diagnóstico'}”, você envia seus dados e os números informados à Rook para registrar e apresentar sua análise. Consulte nossa <a href="/privacidade/" target="_blank" rel="noopener noreferrer">Política de Privacidade</a>.</p>}
            {!locked && <button type="button" className={styles.back} disabled={busy} onClick={() => { setStep('numbers'); setErrors({}); }}>Voltar aos números</button>}
            {locked && !result && !busy && <p className={styles.retryNote}>Seus dados foram mantidos para repetir a mesma solicitação. Clique abaixo para tentar confirmar o envio.</p>}
          </>}
          {hasErrors && <p className={styles.error} role="alert" tabIndex={-1} ref={errorSummary}>{errors.form || errors.taxModelVersion || 'Revise os campos indicados para continuar.'}</p>}
          <button className={`btn-primary ${styles.calculate}`} type="submit" disabled={busy}>{busy ? 'Registrando sua análise…' : result ? 'Ver resultado registrado' : locked ? 'Tentar novamente' : step === 'numbers' ? missingFields.length ? 'Continuar com os dados disponíveis' : 'Continuar para identificação' : isCmv ? 'Ver minha análise de CMV' : 'Ver meu diagnóstico'}</button>
          {result && <button type="button" className={styles.back} onClick={newAnalysis}>Fazer nova análise</button>}
        </form>

        <aside className={styles.result} aria-live="polite" aria-atomic="true">
          {result ? <>
            <p className={styles.eyebrow}>Resultado do cenário · {financialReferenceLabel(answers)}</p>
            <ContentHeading ref={resultHeading} tabIndex={-1}>{result.result.status === 'non_positive_margin'
              ? 'A margem precisa de atenção.'
              : result.result.status === 'no_reference' ? 'Ainda não há referência para esse segmento.'
                : isCmv ? 'Seu CMV em perspectiva.' : 'Seu ponto de equilíbrio estimado.'}</ContentHeading>
            {typeof breakEven === 'number' && <p className={styles.figure}>{currency(breakEven)}<span>de receita por mês para cobrir os custos</span></p>}
            {grossCmvResult && typeof estimatedTaxAmount === 'number' && typeof estimatedNetRevenue === 'number' && <section className={styles.estimate} aria-label="Faturamento e impostos estimados">
              <h3>Resumo dos seus números</h3>
              <dl className={styles.revenueBreakdown}>
                <div><dt>Faturamento bruto informado</dt><dd>{currency(result.inputs.revenue)}</dd></div>
                <div><dt>− Impostos estimados</dt><dd>{currency(estimatedTaxAmount)}</dd></div>
                <div className={styles.netRevenue}><dt>= Receita líquida estimada</dt><dd>{currency(estimatedNetRevenue)}</dd></div>
              </dl>
              <p>Usamos essa receita após os impostos estimados para comparar seu CMV. Esta simulação não apura o imposto efetivo da sua empresa.</p>
            </section>}
            <p className={styles.summary}>{result.summary}</p>
            {isCmv && typeof comparisonCmv === 'number' && <dl className={styles.metrics}>
              <div><dt>{grossCmvResult ? 'CMV sobre a receita líquida estimada' : 'CMV informado'}</dt><dd>{percent(comparisonCmv, grossCmvResult ? 2 : 3)}</dd></div>
            </dl>}
            <p className={styles.notice}>{result.notice}</p>
            <div className={styles.nextStep}><h3>Vamos conversar sobre esse resultado?</h3><p>Sua análise já foi registrada. {commercialContactRequested ? 'Você também autorizou o contato da equipe. ' : ''}Se quiser conhecer o Rook em uma demonstração, preencha a solicitação abaixo. Levaremos os números desta análise junto.</p><a href="#cadastro" className="btn-primary" onClick={shareWithForm}>Solicitar demonstração</a></div>
          </> : incomplete ? <>
            <p className={styles.eyebrow}>Cenário incompleto</p>
            <ContentHeading ref={resultHeading} tabIndex={-1}>Podemos começar pelo que você já sabe.</ContentHeading>
            <p className={styles.summary}>Ainda faltam dados para calcular. Os campos desconhecidos foram mantidos sem valor, e nenhum resultado financeiro foi estimado.</p>
            <ul className={styles.missing}>{missingFields.map(field => <li key={field.key}>{field.label}</li>)}</ul>
            <div className={styles.nextStep}><p>Leve os dados disponíveis ao formulário para conversar com a equipe sobre os próximos passos.</p><a href="#cadastro" className="btn-primary" onClick={shareWithForm}>Solicitar demonstração</a></div>
          </> : <>
            <p className={styles.eyebrow}>Como usar</p>
            <ContentHeading>Um cenário para orientar a próxima decisão.</ContentHeading>
            <ol className={styles.steps}><li>Escolha o último mês ou a média mensal dos últimos 12 meses e informe os números da operação.</li><li>Preencha seu nome, WhatsApp e e-mail.</li><li>Clique em “Ver resultado” para registrar os dados e acessar sua análise.</li></ol>
            <p className={styles.note}>A análise é gratuita. Pediremos seus dados de contato antes de mostrar o resultado. Você escolhe se deseja receber contato comercial.</p>
          </>}
        </aside>
      </div>
    </section>
  );
}
