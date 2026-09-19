'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { segmentsData } from '@/lib/cmv-benchmarks.mjs';
import { ERP_SYSTEMS, REVENUE_BANDS, normalizePhone } from '@/lib/acquisition.mjs';
import { DIAGNOSTIC_CONTEXT_EVENT, readDiagnosticContext, type DiagnosticContext } from '@/lib/diagnostic-context.mjs';
import CityPicker from './CityPicker';
import PreviewModeWatcher from './PreviewModeWatcher';
import styles from './demo.module.css';

type Profile = Record<string, string>;
type Errors = Record<string, string>;
const fieldId = (key: string) => `demo-${key}`;
const errorId = (key: string) => `demo-${key}-error`;

function validateProfile(profile: Profile, consent: boolean): Errors {
  const errors: Errors = {};
  if ((profile.name || '').trim().length < 2) errors.name = 'Informe seu nome completo.';
  if ((profile.company || '').trim().length < 2) errors.company = 'Informe o nome do estabelecimento.';
  if (!normalizePhone(profile.phone)) errors.phone = 'Informe um telefone válido com DDD.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((profile.email || '').trim())) errors.email = 'Informe um e-mail válido.';
  if (!profile.cityId) errors.cityId = 'Selecione a cidade e a UF na lista de sugestões.';
  if (!segmentsData.some(segment => segment.slug === profile.segment) && profile.segment !== 'other') errors.segment = 'Selecione o segmento culinário.';
  if (profile.segment === 'other' && (profile.segmentOther || '').trim().length < 2) errors.segmentOther = 'Informe o segmento do estabelecimento.';
  if (!REVENUE_BANDS.some(band => band.value === profile.revenueBand)) errors.revenueBand = 'Selecione a faixa de faturamento.';
  if (!['yes', 'no'].includes(profile.usesErp)) errors.usesErp = 'Selecione sim ou não.';
  if (profile.usesErp === 'yes' && !ERP_SYSTEMS.includes(profile.erp) && profile.erp !== 'other') errors.erp = 'Selecione o sistema utilizado.';
  if (profile.usesErp === 'yes' && profile.erp === 'other' && (profile.erpOther || '').trim().length < 2) errors.erpOther = 'Informe o nome do sistema.';
  if (!consent) errors.consent = 'Confirme que deseja receber o contato da equipe.';
  return errors;
}

export default function DemoSection() {
  const pathname = usePathname();
  const [profile, setProfile] = useState<Profile>({});
  const [consent, setConsent] = useState(false);
  const [context, setContext] = useState<DiagnosticContext | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [message, setMessage] = useState('');
  const [preview, setPreview] = useState(false);
  const [submissionId, setSubmissionId] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [receiptPreview, setReceiptPreview] = useState(false);
  const inFlight = useRef(false);
  const completed = useRef(false);
  const frozen = useRef<Record<string, unknown> | null>(null);
  const segmentEdited = useRef(false);
  const pendingInvalidation = useRef({ navigation: false, sources: new Set<string>() });
  const receipt = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    setSubmissionId(crypto.randomUUID());

    function receiveContext(event: Event) {
      if (completed.current) return;
      const detail = (event as CustomEvent).detail;
      if (detail?.clear === true) {
        if (inFlight.current || frozen.current) {
          if (typeof detail.sourceId === 'string') pendingInvalidation.current.sources.add(detail.sourceId);
          return;
        }
        setContext(previous => previous?.sourceId === detail.sourceId ? null : previous);
        return;
      }
      if (inFlight.current || frozen.current) return;
      const next = readDiagnosticContext(detail);
      if (!next) return;
      // O diagnóstico acrescenta contexto. Nunca substitui nome, contato ou
      // estabelecimento já preenchidos nesta experiência independente.
      if (next.intent === 'cmv') {
        const segment = next.answers.segment;
        if (segmentsData.some(item => item.slug === segment) || segment === 'other') {
          setProfile(previous => segmentEdited.current ? previous : { ...previous, segment });
          setErrors(previous => { const next = { ...previous }; delete next.segment; return next; });
        }
      }
      setContext(next);
    }
    window.addEventListener(DIAGNOSTIC_CONTEXT_EVENT, receiveContext);
    return () => window.removeEventListener(DIAGNOSTIC_CONTEXT_EVENT, receiveContext);
  }, []);

  useEffect(() => {
    // A navegação não leva o cenário de uma página para outra. Uma tentativa já
    // iniciada mantém seu snapshot para que a repetição envie a mesma solicitação.
    if (completed.current) return;
    if (inFlight.current || frozen.current) pendingInvalidation.current.navigation = true;
    else setContext(null);
  }, [pathname]);

  useEffect(() => { if (sent) receipt.current?.focus(); }, [sent]);

  function change(key: string, value: string) {
    if (key === 'segment') segmentEdited.current = true;
    setProfile(previous => {
      const next = { ...previous, [key]: value };
      if (key === 'segment' && value !== 'other') delete next.segmentOther;
      if (key === 'usesErp' && value === 'no') { delete next.erp; delete next.erpOther; }
      if (key === 'erp' && value !== 'other') delete next.erpOther;
      return next;
    });
    setErrors(previous => {
      const next = { ...previous };
      delete next[key];
      if (key === 'segment' && value !== 'other') delete next.segmentOther;
      if (key === 'usesErp' && value === 'no') { delete next.erp; delete next.erpOther; }
      if (key === 'erp' && value !== 'other') delete next.erpOther;
      return next;
    });
    setMessage('');
  }

  function showErrors(next: Errors) {
    setErrors(next);
    const first = Object.keys(next)[0];
    // Aguarda os avisos serem renderizados antes de levar o foco ao campo.
    requestAnimationFrame(() => document.getElementById(fieldId(first))?.focus());
  }

  function removeDiagnostic() {
    setContext(null);
    setMessage('');
    setErrors(previous => {
      const next = { ...previous };
      delete next.simulation;
      delete next.period;
      return next;
    });
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inFlight.current || completed.current || !submissionId) return;
    setMessage('');
    if (!frozen.current) {
      const nextErrors = validateProfile(profile, consent);
      if (Object.keys(nextErrors).length) { showErrors(nextErrors); return; }
      setErrors({});
      if (context?.result?.tool === 'cmv' && context.result.inputs.segment !== profile.segment) {
        setMessage('O segmento do formulário é diferente do usado no diagnóstico. Recalcule para este segmento ou remova o diagnóstico da solicitação.');
        return;
      }
    }
    const isPreview = process.env.NEXT_PUBLIC_ENV === 'homolog' && new URLSearchParams(window.location.search).get('preview') === '1';
    if (isPreview) { completed.current = true; setReceiptPreview(true); setSent(true); return; }

    inFlight.current = true;
    setBusy(true);
    try {
      const challengeResponse = await fetch('/api/acquisition/', { cache: 'no-store', signal: AbortSignal.timeout(20_000) });
      const challenge = await challengeResponse.json();
      if (!challengeResponse.ok) throw new Error(challenge.error || 'Não foi possível iniciar o envio. Tente novamente.');
      const { solveCommercialLeadChallenge } = await import('@/lib/commercial-lead-challenge-client.mjs');
      const solution = await solveCommercialLeadChallenge(challenge);

      // Depois da primeira tentativa de gravação, preservar o mesmo cadastro
      // e identificador permite repetir a entrega sem criar outro lead.
      if (!frozen.current) {
        frozen.current = {
          ...context?.answers,
          ...profile,
          intent: context?.intent || 'demo',
          consent,
          submissionId,
          simulation: context?.result?.inputs || null,
        };
      }
      const response = await fetch('/api/acquisition/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...frozen.current, antiBot: { token: challenge.token, solution } }),
        signal: AbortSignal.timeout(20_000),
      });
      const data = await response.json();
      if (response.status === 422) {
        // A validação ocorre antes de qualquer gravação: os campos podem ser
        // corrigidos com segurança, mantendo o identificador desta solicitação.
        frozen.current = null;
        const fieldErrors: Errors = {};
        for (const [key, value] of Object.entries(data.fieldErrors || {})) {
          if (typeof value === 'string') fieldErrors[key] = value;
        }
        showErrors(fieldErrors);
        throw new Error(data.error || 'Revise os campos indicados.');
      }
      if (!response.ok || data.success !== true) throw new Error(data.error || 'Não foi possível confirmar o envio. Tente novamente.');
      completed.current = true;
      setReceiptPreview(false);
      setSent(true);
    } catch (problem) {
      setMessage(problem instanceof Error && problem.name !== 'TimeoutError'
        ? problem.message
        : 'Não foi possível confirmar o envio agora. Seus dados estão preservados; tente novamente.');
    } finally {
      inFlight.current = false;
      setBusy(false);
      // Se a tentativa falhou antes de congelar dados, ou a validação os
      // liberou (422), aplique a edição/navegação ocorrida durante a espera.
      if (!frozen.current && !completed.current) {
        const pending = pendingInvalidation.current;
        pendingInvalidation.current = { navigation: false, sources: new Set<string>() };
        setContext(previous => pending.navigation || (previous && pending.sources.has(previous.sourceId)) ? null : previous);
      }
    }
  }

  const readonly = busy || sent || Boolean(frozen.current);
  const accessible = (key: string) => ({
    id: fieldId(key),
    'aria-invalid': Boolean(errors[key]) || undefined,
    'aria-describedby': errors[key] ? errorId(key) : undefined,
  });
  const error = (key: string) => errors[key] ? <p className={styles.fieldError} id={errorId(key)}>{errors[key]}</p> : null;

  return (
    <section id="cadastro" className={styles.section} aria-labelledby="demo-title" data-demo-section>
      <PreviewModeWatcher onChange={setPreview} />
      <div className={styles.layout}>
        <div className={styles.intro}>
          <p className={styles.eyebrow}>Vamos conhecer a sua operação</p>
          <h2 id="demo-title">Mais clareza para decidir.<br /><span>Conheça o Rook na prática.</span></h2>
          <p className={styles.description}>Veja como o Rook pode ajudar você a entender o dinheiro do seu restaurante e acompanhar os números que importam.</p>
          <ul className={styles.benefits}>
            <li><span aria-hidden="true">01</span>Conte um pouco sobre o seu estabelecimento.</li>
            <li><span aria-hidden="true">02</span>A equipe prepara uma conversa sobre a sua operação.</li>
            <li><span aria-hidden="true">03</span>Conheça o Rook em uma demonstração.</li>
          </ul>
          <p className={styles.support}>Já utiliza o Rook? <a href="https://app.rook.com.br/login">Acesse sua conta</a>.</p>
        </div>

        <div className={styles.card}>
          {preview && <p className={styles.preview}>Prévia para revisão. Nenhum dado será enviado.</p>}
          {sent ? (
            <div className={styles.receipt} role="status">
              <span className={styles.receiptIcon} aria-hidden="true">✓</span>
              <h3 ref={receipt} tabIndex={-1}>{receiptPreview ? 'Prévia do cadastro concluída' : 'Solicitação recebida'}</h3>
              <p>{receiptPreview ? 'Você concluiu a simulação do formulário. Os dados não foram enviados.' : 'A equipe recebeu sua solicitação e entrará em contato para combinar a demonstração.'}</p>
              <strong>{profile.company}</strong>
              {context && <p>O contexto do seu diagnóstico {receiptPreview ? 'seria incluído' : 'foi incluído'} na solicitação.</p>}
            </div>
          ) : (
            <form onSubmit={submit} noValidate aria-labelledby="demo-form-title" aria-busy={busy}>
              <div className={styles.formHeading}>
                <h3 id="demo-form-title">Agende uma demonstração</h3>
                <p>Preencha seus dados. Nossa equipe combina o melhor momento com você.</p>
              </div>

              {context && (
                <div className={styles.context}>
                  <div><strong>{context.intent === 'cmv' ? 'Diagnóstico de CMV incluído' : 'Diagnóstico do ponto de equilíbrio incluído'}</strong>
                    <button type="button" onClick={removeDiagnostic} disabled={readonly} aria-label="Remover diagnóstico desta solicitação">Remover</button>
                  </div>
                  <p>{context.result?.summary || 'Os valores informados serão incluídos para a equipe continuar a análise com você.'}</p>
                  {context.result?.tool === 'cmv' && <small>Segmento usado no cálculo: {segmentsData.find(segment => segment.slug === context.result?.inputs.segment)?.name || 'Outro segmento'}</small>}
                  {context.answers.period && <small>Mês informado: {context.answers.period.split('-').reverse().join('/')}</small>}
                </div>
              )}

              <fieldset className={styles.fields} disabled={readonly}>
                <legend className={styles.srOnly}>Seus dados e informações do estabelecimento</legend>
                <div className={styles.field}>
                  <label htmlFor={fieldId('name')}>Nome completo</label>
                  <input {...accessible('name')} autoComplete="name" value={profile.name || ''} onChange={event => change('name', event.target.value)} maxLength={120} required />
                  {error('name')}
                </div>
                <div className={styles.field}>
                  <label htmlFor={fieldId('company')}>Nome do estabelecimento</label>
                  <input {...accessible('company')} autoComplete="organization" value={profile.company || ''} onChange={event => change('company', event.target.value)} maxLength={160} required />
                  {error('company')}
                </div>
                <div className={styles.field}>
                  <label htmlFor={fieldId('phone')}>WhatsApp com DDD</label>
                  <input {...accessible('phone')} type="tel" inputMode="tel" autoComplete="tel" placeholder="(11) 99999-9999" value={profile.phone || ''} onChange={event => change('phone', event.target.value)} maxLength={24} required />
                  {error('phone')}
                </div>
                <div className={styles.field}>
                  <label htmlFor={fieldId('email')}>E-mail</label>
                  <input {...accessible('email')} type="email" autoComplete="email" value={profile.email || ''} onChange={event => change('email', event.target.value)} maxLength={254} required />
                  {error('email')}
                </div>
                <div className={styles.field}>
                  <label htmlFor={fieldId('cityId')}>Cidade/UF</label>
                  <CityPicker inputId={fieldId('cityId')} invalid={Boolean(errors.cityId)} describedBy={errors.cityId ? errorId('cityId') : 'demo-city-help'} value={profile.cityLabel || ''} onChange={(id, label) => { change('cityId', id); change('cityLabel', label); }} />
                  {errors.cityId ? error('cityId') : <p id="demo-city-help" className={styles.fieldHelp}>Digite e selecione uma sugestão.</p>}
                </div>
                <div className={styles.field}>
                  <label htmlFor={fieldId('segment')}>Segmento culinário</label>
                  <select {...accessible('segment')} value={profile.segment || ''} onChange={event => change('segment', event.target.value)} required>
                    <option value="">Selecione o segmento</option>
                    {segmentsData.map(segment => <option value={segment.slug} key={segment.slug}>{segment.name}</option>)}
                    <option value="other">Outro segmento</option>
                  </select>
                  {error('segment')}
                </div>
                {profile.segment === 'other' && <div className={`${styles.field} ${styles.full}`}>
                  <label htmlFor={fieldId('segmentOther')}>Qual é o segmento?</label>
                  <input {...accessible('segmentOther')} value={profile.segmentOther || ''} onChange={event => change('segmentOther', event.target.value)} maxLength={100} required />
                  {error('segmentOther')}
                </div>}
                <div className={`${styles.field} ${styles.full}`}>
                  <label htmlFor={fieldId('revenueBand')}>Faturamento bruto mensal</label>
                  <select {...accessible('revenueBand')} value={profile.revenueBand || ''} onChange={event => change('revenueBand', event.target.value)} required>
                    <option value="">Selecione a faixa</option>
                    {REVENUE_BANDS.map(band => <option value={band.value} key={band.value}>{band.label}</option>)}
                  </select>
                  {error('revenueBand')}
                </div>
                <fieldset className={`${styles.erp} ${styles.full}`} aria-describedby={errors.usesErp ? errorId('usesErp') : undefined}>
                  <legend>Utiliza algum sistema ERP ou PDV?</legend>
                  <div className={styles.radioOptions}>
                    {[{ value: 'yes', label: 'Sim' }, { value: 'no', label: 'Não' }].map((option, index) => <label key={option.value}>
                      <input id={index === 0 ? fieldId('usesErp') : 'demo-usesErp-no'} type="radio" name="demo-usesErp" value={option.value} checked={profile.usesErp === option.value} onChange={() => change('usesErp', option.value)} aria-invalid={Boolean(errors.usesErp) || undefined} aria-describedby={errors.usesErp ? errorId('usesErp') : undefined} required />
                      {option.label}
                    </label>)}
                  </div>
                  {error('usesErp')}
                </fieldset>
                {profile.usesErp === 'yes' && <div className={`${styles.field} ${styles.full}`}>
                  <label htmlFor={fieldId('erp')}>Qual sistema você utiliza?</label>
                  <select {...accessible('erp')} value={profile.erp || ''} onChange={event => change('erp', event.target.value)} required>
                    <option value="">Selecione o sistema</option>
                    {ERP_SYSTEMS.map(system => <option value={system} key={system}>{system}</option>)}
                    <option value="other">Outro — informar qual</option>
                  </select>
                  {error('erp')}
                </div>}
                {profile.usesErp === 'yes' && profile.erp === 'other' && <div className={`${styles.field} ${styles.full}`}>
                  <label htmlFor={fieldId('erpOther')}>Nome do sistema</label>
                  <input {...accessible('erpOther')} value={profile.erpOther || ''} onChange={event => change('erpOther', event.target.value)} maxLength={100} required />
                  {error('erpOther')}
                </div>}
              </fieldset>

              <label className={styles.consent} htmlFor={fieldId('consent')}>
                <input {...accessible('consent')} type="checkbox" checked={consent} disabled={readonly} onChange={event => { setConsent(event.target.checked); setErrors(previous => { const next = { ...previous }; delete next.consent; return next; }); }} required />
                <span>Quero receber contato da equipe sobre o Rook, conforme a <a href="/privacidade/" target="_blank" rel="noreferrer">Política de Privacidade</a>.</span>
              </label>
              {error('consent')}
              {(message || Object.keys(errors).length > 0) && <div className={styles.error} role="alert">{message || 'Confira os campos indicados para continuar.'}</div>}
              {frozen.current && !busy && <p className={styles.fieldHelp}>Mantivemos seus dados para tentar confirmar a mesma solicitação.</p>}
              <button className={styles.submit} type="submit" disabled={busy || !submissionId}>
                {busy ? 'Enviando…' : frozen.current ? 'Tentar enviar novamente' : 'Solicitar demonstração'}<span aria-hidden="true">↗</span>
              </button>
              <p className={styles.footnote}>O envio solicita o contato. O horário da demonstração será combinado com a equipe.</p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
