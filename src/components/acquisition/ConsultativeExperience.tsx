'use client';
import {FormEvent,useEffect,useRef,useState} from 'react';
import {segmentsData} from '@/lib/cmv-benchmarks.mjs';
import {buildSimulationInput,deriveRevenueBand,ERP_SYSTEMS,REVENUE_BANDS,normalizePhone} from '@/lib/acquisition.mjs';
import {parseBrazilianNumber,type FinancialSuccess} from '@/lib/financial-simulation.mjs';
import CityPicker from './CityPicker';
import styles from './consultative.module.css';

type Intent='demo'|'cmv'|'breakeven';
type Question={key:string;label:string;help?:string;type?:string;options?:{value:string;label:string}[]};
const profile:Question[]=[
 {key:'name',label:'Como posso chamar você?',help:'Nome do responsável pelo estabelecimento.'},
 {key:'company',label:'Qual é o nome do seu estabelecimento?'},
 {key:'segment',label:'Qual segmento melhor representa a sua operação?',options:[...segmentsData.map(s=>({value:s.slug,label:s.name})),{value:'other',label:'Outro segmento'}]},
 {key:'segmentOther',label:'Qual é o segmento do estabelecimento?'},
 {key:'cityId',label:'Em qual cidade fica o estabelecimento?',help:'Escolha a cidade e a UF para padronizar o cadastro.'},
 {key:'usesErp',label:'Utiliza algum sistema ERP ou PDV?',options:[{value:'yes',label:'Sim'},{value:'no',label:'Não'}]},
 {key:'erp',label:'Qual sistema vocês utilizam?',options:[...ERP_SYSTEMS.map(value=>({value,label:value})),{value:'other',label:'Outro — informar qual'}]},
 {key:'erpOther',label:'Qual é o nome do sistema?'},
 {key:'revenueBand',label:'Qual é a faixa de faturamento bruto mensal?',options:REVENUE_BANDS},
 {key:'phone',label:'Qual é o seu WhatsApp com DDD?',type:'tel',help:'Usaremos para retornar sobre sua solicitação.'},
 {key:'email',label:'Qual é o seu e-mail?',type:'email'},
];
const fiscal:Question[]=[
 {key:'fixedCosts',label:'Quanto somam os custos fixos por mês?',type:'number',help:'Inclua folha, aluguel e pró-labore. Deixe taxas, comissões, impostos e custos que variam com as vendas para os próximos campos. Informe zero apenas se não houver.'},
 {key:'taxPercent',label:'Qual percentual da receita bruta corresponde aos impostos?',type:'percent',help:'Use a alíquota efetiva do mês. Se não souber, podemos continuar com a equipe.'},
 {key:'feesPercent',label:'Quanto representam as taxas de cartão e delivery?',type:'percent',help:'Percentual sobre a receita bruta total. Não repita custos incluídos no CMV.'},
 {key:'otherVariablePercent',label:'Há outros custos variáveis? Qual o percentual?',type:'percent',help:'Comissões e demais custos que acompanham as vendas, sobre a receita bruta total. Se não houver, informe zero.'},
];
const money=(value:number)=>value.toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
export default function ConsultativeExperience({initialIntent='demo',initialMode='chat',preview=false}:{initialIntent?:Intent;initialMode?:'chat'|'form';preview?:boolean}){
 const [intent,setIntent]=useState<Intent>(initialIntent);const [mode,setMode]=useState(initialMode);
 const [answers,setAnswers]=useState<Record<string,string>>({});const [draft,setDraft]=useState('');
 const [editing,setEditing]=useState<string|null>(null);const [capture,setCapture]=useState(false);
 const [result,setResult]=useState<FinancialSuccess|null>(null);const [busy,setBusy]=useState(false);const [error,setError]=useState('');const [consent,setConsent]=useState(false);const [sent,setSent]=useState(false);
 const [submissionId,setSubmissionId]=useState('');const frozen=useRef<Record<string,unknown>|null>(null);const focus=useRef<HTMLHeadingElement>(null);
 useEffect(()=>setSubmissionId(crypto.randomUUID()),[]);
 function change(key:string,value:string){
  setError('');setAnswers(previous=>{
   const next={...previous,[key]:value};
   if(key==='segment'&&value!=='other')delete next.segmentOther;
   if(key==='usesErp'&&value==='no'){delete next.erp;delete next.erpOther;}
   if(key==='erp'&&value!=='other')delete next.erpOther;
   if(key==='revenue'&&intent==='breakeven')next.revenueBand=deriveRevenueBand(value);
   return next;
  });
  if(['revenue','cmvPercent','segment','fixedCosts','taxPercent','feesPercent','otherVariablePercent','period'].includes(key))setResult(null);
 }
 const visible=(q:Question)=>q.key!=='segmentOther'||answers.segment==='other';
 const conditional=(q:Question)=>visible(q)&&(q.key!=='erp'||answers.usesErp==='yes')&&(q.key!=='erpOther'||(answers.usesErp==='yes'&&answers.erp==='other'));
 const finances:Question[]=[
  {key:'period',label:'Qual mês você quer analisar?',type:'month',help:'Use valores do mesmo mês em toda a análise.'},
  {key:'revenue',label:intent==='cmv'?'Qual foi a receita líquida desse mês?':'Qual foi o faturamento bruto desse mês?',type:'number',help:intent==='cmv'?'Informe a receita após deduções e use um CMV calculado sobre essa mesma base.':'Informe a receita antes de impostos. Os percentuais seguintes devem usar essa mesma base.'},
  {key:'cmvPercent',label:intent==='cmv'?'Qual foi o CMV em percentual da receita líquida?':'Qual foi o CMV em percentual da receita bruta?',type:'percent',help:'Use o CMV já apurado. Compras do mês, sozinhas, não medem o consumo do estoque.'},
  ...(intent==='breakeven'?fiscal:[]),
 ];
 const diagnostic=[...profile.slice(0,4).filter(conditional),...finances,...profile.slice(4,8).filter(conditional)];
 const questions=(intent==='demo'||capture?profile.filter(conditional):diagnostic);
 const current=editing?questions.find(q=>q.key===editing):questions.find(q=>!answers[q.key]);
 useEffect(()=>{setDraft(current?answers[current.key]||'':'');focus.current?.focus();},[current?.key,editing]); // a troca de pergunta orienta teclado e leitor de tela
 function valid(question:Question,value:string){
  if(question.type==='number'||question.type==='percent'){
   const numeric=parseBrazilianNumber(value);return numeric!==null&&numeric>=0&&(question.key!=='revenue'||numeric>0)&&(question.type!=='percent'||numeric<=100)?'':'Informe um número válido, usando vírgula para decimais.';
  }
  if(question.key==='cityId')return answers.cityId?'':'Selecione a cidade na lista.';
  if(question.key==='phone')return normalizePhone(value)?'':'Informe um WhatsApp válido com DDD.';
  if(question.type==='email')return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)?'':'Informe um e-mail válido.';
  if(question.type==='month')return /^\d{4}-(0[1-9]|1[0-2])$/.test(value)?'':'Selecione o mês.';
  return value.trim().length>=(question.options?1:2)?'':'Preencha este campo.';
 }
 function advance(event:FormEvent){event.preventDefault();if(!current)return;const value=current.key==='cityId'?answers.cityId:draft;const problem=valid(current,value||'');if(problem){setError(problem);return;}change(current.key,value.trim());setEditing(null);setDraft('');}
 function label(question:Question){const value=answers[question.key];return question.key==='cityId'?answers.cityLabel:question.options?.find(o=>o.value===value)?.label||value;}
 function field(question:Question,value:string,onChange:(value:string)=>void){
  if(question.key==='cityId')return <CityPicker value={answers.cityLabel||''} onChange={(id,text)=>{change('cityId',id);change('cityLabel',text);}}/>;
  if(question.key==='usesErp')return <div role="radiogroup" aria-label={question.label} className={styles.yesNo}>{question.options!.map(option=><label key={option.value}><input type="radio" name="usesErp" checked={value===option.value} onChange={()=>onChange(option.value)}/>{option.label}</label>)}</div>;
  if(question.options)return <select id={`field-${question.key}`} value={value} onChange={event=>onChange(event.target.value)} aria-label={question.label}><option value="">Selecione</option>{question.options.map(option=><option key={option.value} value={option.value}>{option.label}</option>)}</select>;
  return <input id={`field-${question.key}`} aria-label={question.label} type={question.type==='number'||question.type==='percent'?'text':question.type||'text'} inputMode={question.type==='number'||question.type==='percent'?'decimal':undefined} value={value} maxLength={question.type==='number'||question.type==='percent'?40:254} onChange={event=>onChange(event.target.value)} autoComplete={question.key==='name'?'name':question.key==='phone'?'tel':question.key==='email'?'email':'off'}/>;
 }
 async function calculate(){setBusy(true);setError('');try{
  const response=await fetch('/api/financial-simulations/',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(buildSimulationInput(answers,intent))});
  const data=await response.json();if(!response.ok||!data.ok)throw new Error('Revise os valores do cenário.');setResult(data);
 }catch{setError('Não foi possível calcular agora. Confira os valores e tente novamente.');}finally{setBusy(false);}}
 async function submit(event:FormEvent){event.preventDefault();setError('');
  if(!frozen.current){for(const q of profile.filter(conditional)){const problem=valid(q,answers[q.key]||'');if(problem){setError(`${q.label} ${problem}`);return;}}if(!consent){setError('Confirme o contato comercial.');return;}}
  if(preview){setSent(true);return;}
  setBusy(true);try{
   const challengeResponse=await fetch('/api/acquisition/',{cache:'no-store'});const challenge=await challengeResponse.json();if(!challengeResponse.ok)throw new Error(challenge.error);
   const {solveCommercialLeadChallenge}=await import('@/lib/commercial-lead-challenge-client.mjs');
   const solution=await solveCommercialLeadChallenge(challenge);
   const antiBot={token:challenge.token,solution};
   if(!frozen.current)frozen.current={...answers,intent,consent,submissionId,simulation:result?.inputs||null};
   const response=await fetch('/api/acquisition/',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...frozen.current,antiBot})});
   const data=await response.json();if(!response.ok)throw new Error(data.error||'Não foi possível enviar.');setSent(true);
  }catch(problem){setError(problem instanceof Error?problem.message:'Não foi possível enviar agora. Tente novamente.');}finally{setBusy(false);}
 }
 function switchIntent(next:Intent){setIntent(next);setCapture(false);setResult(null);setEditing(null);setError('');setAnswers(previous=>{const copy={...previous};for(const key of ['revenue','cmvPercent','fixedCosts','taxPercent','feesPercent','otherVariablePercent'])delete copy[key];return copy;});}
 const readonly=busy||sent||!!frozen.current;
 return <section className={styles.experience} id="cadastro">
  {preview&&<div className={styles.notice}>Prévia para revisão. Nenhum dado será enviado ao CRM.</div>}
  <div className={styles.layout}>
   <aside className={styles.intro}><p className={styles.signature}>ROOK · Assistente virtual</p><h1>Vamos entender os números da sua casa.</h1><p>Conte um pouco da sua operação. A conversa avança com o que você já sabe e ajuda a preparar o próximo passo.</p>
    <div className={styles.intents} aria-label="O que você quer fazer?">{[{value:'demo',label:'Quero conhecer o Rook'},{value:'cmv',label:'Analisar meu CMV'},{value:'breakeven',label:'Ver meu ponto de equilíbrio'}].map(option=><button type="button" disabled={readonly} key={option.value} aria-pressed={intent===option.value} onClick={()=>switchIntent(option.value as Intent)}>{option.label}<span aria-hidden>↗</span></button>)}</div>
    <a href="mailto:contato@rook.com.br">Falar com a equipe</a>
    <p className={styles.support}>Já é cliente? <a href="https://app.rook.com.br/login">Acesse sua conta</a>.</p>
    {answers.company&&<div className={styles.context}><strong>{answers.company}</strong><p>{answers.cityLabel||'Conhecendo sua operação'}</p><p>{answers.usesErp==='no'?'Sem ERP/PDV':answers.erp==='other'?answers.erpOther:answers.erp}</p></div>}
   </aside>
   <div className={styles.panel}>
    <div className={styles.tabs}><button type="button" aria-pressed={mode==='chat'} onClick={()=>{setMode('chat');setError('');}}>Conversar</button><button type="button" aria-pressed={mode==='form'} onClick={()=>{setMode('form');setError('');}}>Preencher formulário</button></div>
    {sent?<div className={styles.result}><h2>{preview?'Prévia do cadastro concluída':'Solicitação recebida'}</h2><p>{preview?'Esta simulação não enviou dados.':'A equipe do Rook recebeu sua solicitação com os dados e o cenário informado.'}</p><strong>{answers.company}</strong>{result&&<p>{result.summary}</p>}</div>:mode==='form'?<form onSubmit={submit}><h2>Conheça o Rook</h2><p className={styles.hint}>Preencha seus dados para solicitar uma demonstração.</p><fieldset disabled={readonly} className={styles.grid}>{profile.filter(conditional).map(q=><div key={q.key}><label htmlFor={`field-${q.key}`}>{q.label}</label>{field(q,answers[q.key]||'',value=>change(q.key,value))}</div>)}</fieldset>{result&&<p className={styles.hint}>O resultado da sua análise será incluído no contato.</p>}<label className={styles.consent}><input type="checkbox" checked={consent} disabled={readonly} onChange={event=>setConsent(event.target.checked)}/>Quero receber contato comercial sobre o Rook, conforme a <a href="/privacidade/" target="_blank" rel="noreferrer">Política de Privacidade</a>.</label><button className={styles.primary} disabled={busy||!submissionId}>{busy?'Enviando…':frozen.current?'Tentar enviar novamente':'Solicitar demonstração'}</button></form>:<>
     <div className={styles.transcript} aria-label="Informações da conversa">{questions.filter(q=>answers[q.key]).map(q=><div className={styles.exchange} key={q.key}><p>{q.label}</p><div><strong>{label(q)}</strong><button type="button" disabled={readonly} onClick={()=>{setEditing(q.key);setDraft(answers[q.key]);}}>Corrigir</button></div></div>)}</div>
     {current&&!frozen.current?<form onSubmit={advance} className={styles.question}><h2 tabIndex={-1} ref={focus}>{current.label}</h2>{current.help&&<p className={styles.hint}>{current.help}</p>}{field(current,draft,setDraft)}<div className={styles.actions}><button className={styles.primary}>Continuar</button>{(current.type==='number'||current.type==='percent')&&<button type="button" onClick={()=>{setCapture(true);setResult(null);setError('Tudo bem. Vamos completar seu contato para conversar com a equipe sobre os dados que faltam.');}}>Não sei esse número</button>}</div></form>:intent!=='demo'&&!capture&&!result?<div className={styles.question}><h2>Vamos conferir antes de calcular?</h2><p>Confira as respostas acima. Todos os valores devem ser do mesmo mês e da mesma base de receita.</p><button className={styles.primary} disabled={busy} onClick={calculate}>{busy?'Calculando…':'Confirmar e calcular'}</button></div>:result&&!capture?<div className={styles.result} role="status"><p className={styles.signature}>Sua análise</p><h2>{result.result.status==='non_positive_margin'?'A margem precisa de atenção':result.tool==='cmv'?'Uma referência para investigar':'Seu ponto de equilíbrio estimado'}</h2>{typeof result.result.breakEvenRevenue==='number'&&<p className={styles.number}>{money(result.result.breakEvenRevenue)}</p>}<p>{result.summary}</p><details><summary>Ver a conta e as premissas</summary>{result.assumptions.map(line=><p key={line}>{line}</p>)}<p>{result.tool==='cmv'?'Diferença mensal = receita × (CMV informado − referência) ÷ 100.':'Ponto de equilíbrio = fixos ÷ [1 − (CMV + impostos + taxas + demais variáveis) ÷ 100].'}</p></details><button className={styles.primary} onClick={()=>setCapture(true)}>Conversar sobre esse resultado</button></div>:<form onSubmit={submit} className={styles.question}><h2>Podemos entrar em contato?</h2><p>Seu cadastro e o contexto da conversa serão encaminhados à equipe do Rook.</p><label className={styles.consent}><input type="checkbox" checked={consent} disabled={readonly} onChange={event=>setConsent(event.target.checked)}/>Quero receber contato comercial, conforme a <a href="/privacidade/" target="_blank" rel="noreferrer">Política de Privacidade</a>.</label><button className={styles.primary} disabled={busy||!submissionId}>{busy?'Enviando…':frozen.current?'Tentar enviar novamente':'Solicitar demonstração'}</button></form>}
    </>}
    {error&&<p className={styles.error} role="alert">{error}</p>}
   </div>
  </div>
 </section>;
}
