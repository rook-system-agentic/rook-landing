'use client';

import Script from 'next/script';
import Link from 'next/link';
import Image from 'next/image';
import {useEffect, useRef, useState} from 'react';
import styles from './site-chat.module.css';

const WIDGET_SRC = 'https://app.asaflow.com.br/widget.js';
const CHAT_OPEN = '[data-asaflow-chat-open], a[href="#data-asaflow-chat-open"]';
const STARTUP_TIMEOUT_MS = 12000;

type StandaloneRenderer = (options: {
  apiBase: string;
  tenantSlug: string;
  flowSlug: string;
  el: HTMLElement;
}) => unknown;

declare global {
  interface Window {
    AsaFlow?: {chat?: {renderStandalone?: StandaloneRenderer}};
  }
}

/** A conversa pertence ao SDK. Fechar a caixa apenas oculta seu DOM. */
export default function SiteChat() {
  const enabled = process.env.NEXT_PUBLIC_ASAFLOW_CHAT_ENABLED === 'true';
  const tenant = process.env.NEXT_PUBLIC_ASAFLOW_CHAT_TENANT?.trim() || '';
  const flow = process.env.NEXT_PUBLIC_ASAFLOW_CHAT_FLOW?.trim() || '';
  // Homologação mantém a prévia: nenhuma abertura pode iniciar o canal real.
  const preview = process.env.NEXT_PUBLIC_ENV === 'homolog';
  const configured = enabled && Boolean(tenant && flow) && !preview;
  const [open, setOpen] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const [teaser, setTeaser] = useState(true);
  const [unavailable, setUnavailable] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [sdkReady, setSdkReady] = useState(false);
  const rendered = useRef(false);
  const closeButton = useRef<HTMLButtonElement>(null);
  const launcher = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLElement>(null);
  const providerHost = useRef<HTMLDivElement>(null);
  const opener = useRef<HTMLElement | null>(null);

  function show(source: HTMLElement) {
    opener.current = source;
    setHasOpened(true);
    setOpen(true);
  }

  function close() {setOpen(false);}

  useEffect(() => {
    const onOpen = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target.closest(CHAT_OPEN) : null;
      if (!target) return;
      event.preventDefault();
      show(target as HTMLElement);
    };
    document.addEventListener('click', onOpen);
    return () => document.removeEventListener('click', onOpen);
  }, []);

  useEffect(() => {
    const host = providerHost.current;
    if (!configured || !hasOpened || !host) return;
    let poll: number | undefined;
    const inspect = () => {
      if (host.querySelector('.asaflow-chat-standalone-error')) {
        setUnavailable(true);
      } else if (host.querySelector('.asaflow-chat-root.asaflow-chat-standalone')) {
        setMounted(true);
        setUnavailable(false);
      }
    };
    const observer = new MutationObserver(inspect);
    observer.observe(host, {childList: true, subtree: true});
    inspect();
    const start = () => {
      if (rendered.current) return;
      const render = window.AsaFlow?.chat?.renderStandalone;
      if (typeof render !== 'function') {
        poll = window.setTimeout(start, 100);
        return;
      }
      // Ref antes da chamada evita montagem duplicada, inclusive no Strict Mode.
      // Não usamos open/close do SDK: reabrir não deve reaplicar inputMode antigo.
      rendered.current = true;
      try {
        render({apiBase: 'https://app.asaflow.com.br', tenantSlug: tenant, flowSlug: flow, el: host});
      } catch {
        setUnavailable(true);
      }
      inspect();
    };
    start();
    const timeout = window.setTimeout(() => {
      window.clearTimeout(poll);
      if (!host.querySelector('.asaflow-chat-root.asaflow-chat-standalone')) setUnavailable(true);
    }, STARTUP_TIMEOUT_MS);
    return () => {
      observer.disconnect();
      window.clearTimeout(poll);
      window.clearTimeout(timeout);
      // O host e a instância continuam vivos enquanto este layout estiver montado.
    };
  }, [configured, hasOpened, tenant, flow, sdkReady]);

  useEffect(() => {
    if (open) {
      closeButton.current?.focus();
    } else if (hasOpened) {
      // Aguarda o render tornar o launcher visível também no celular.
      // O convite sai do DOM ao abrir, então seu botão não é um destino válido.
      const source = opener.current;
      if (source?.isConnected && source.getClientRects().length > 0) source.focus();
      else launcher.current?.focus();
    }
  }, [open, hasOpened]);
  useEffect(() => {
    if (!open) return;
    const keys = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {event.preventDefault(); close(); return;}
      if (event.key !== 'Tab' || !window.matchMedia('(max-width:480px)').matches || !panel.current) return;
      const items = Array.from(panel.current.querySelectorAll<HTMLElement>('button:not(:disabled),a[href],input:not(:disabled),select:not(:disabled),textarea:not(:disabled),[tabindex="0"]'))
        .filter(item => item.getClientRects().length > 0 && !item.closest('[hidden]'));
      const first = items[0], last = items[items.length - 1];
      if (event.shiftKey && (document.activeElement === first || !panel.current.contains(document.activeElement))) {event.preventDefault(); last?.focus();}
      if (!event.shiftKey && (document.activeElement === last || !panel.current.contains(document.activeElement))) {event.preventDefault(); first?.focus();}
    };
    document.addEventListener('keydown', keys);
    return () => document.removeEventListener('keydown', keys);
  }, [open]);

  const loading = configured && !mounted && !unavailable;
  const showFallback = !configured || unavailable;
  const showWidget = configured || preview || hasOpened;

  return <>
    {configured && hasOpened && <Script id="rook-asaflow-chat" src={WIDGET_SRC} strategy="afterInteractive"
      data-no-minify="1" onReady={() => setSdkReady(true)} onError={() => setUnavailable(true)}/>}
    {showWidget && <aside className={styles.root} data-rook-chat data-rook-chat-fallback={showFallback ? '' : undefined}>
      {hasOpened && <section ref={panel} id="rook-ai-panel" hidden={!open} className={styles.panel} role="dialog" aria-label="Rook AI — assistente virtual">
        <header className={styles.header}><span className={styles.avatar} aria-hidden><Image src="/brand/rook-icon-branco.webp" alt="" width={42} height={42}/></span><div><strong>Rook AI</strong><span>Assistente virtual do Rook</span></div><button ref={closeButton} type="button" aria-label="Fechar chat" onClick={close}>×</button></header>
        <p className={styles.privacy}>Você está conversando com o Rook AI, assistente virtual. As informações fornecidas serão usadas para este atendimento e, se você solicitar, para contato comercial. <a href="/privacidade/" target="_blank" rel="noopener noreferrer">Política de Privacidade</a>.</p>
        {/* Este elemento nunca é desmontado ao minimizar a conversa. */}
        {configured && <div ref={providerHost} className={styles.providerHost} hidden={!mounted || unavailable} data-rook-chat-provider/>}
        {loading && <div className={styles.loading} role="status">Conectando ao Rook AI…</div>}
        {showFallback && <>
          <div className={styles.messages}>
            <p className={styles.note}>{preview ? 'Prévia visual · conversa e cálculos em preparação' : 'Chat indisponível neste momento'}</p>
            <p className={styles.bubble}>Olá! Sou o Rook AI. Vamos entender o que está acontecendo com os números do seu restaurante?</p>
            <p className={styles.explanation}>{preview ? 'O Rook AI deverá conversar, entender os dados que faltam e apresentar os cálculos aqui. Essa conexão ainda está em preparação. Por enquanto, as ferramentas abaixo funcionam em páginas próprias.' : 'Você pode usar nossas ferramentas ou solicitar uma demonstração enquanto o chat está indisponível.'}</p>
            <div className={styles.tools}>
              <Link href="/calculadora-cmv/" onClick={close}>Abrir calculadora de CMV <span aria-hidden>↗</span></Link>
              <Link href="/diagnostico/" onClick={close}>Estimar ponto de equilíbrio <span aria-hidden>↗</span></Link>
              <a href="#cadastro" onClick={close}>Solicitar demonstração <span aria-hidden>↓</span></a>
            </div>
          </div>
          <div className={styles.composer}><input aria-label="Mensagem" placeholder={preview ? 'Conversa em preparação' : 'Tente novamente mais tarde'} disabled/><button type="button" aria-label="Enviar mensagem" disabled>↑</button></div>
        </>}
      </section>}
      {!open && teaser && <div className={styles.teaser}><button type="button" className={styles.dismiss} aria-label="Dispensar convite do chat" onClick={() => setTeaser(false)}>×</button><button type="button" onClick={event => show(event.currentTarget)}><strong>Rook AI</strong><span>Vamos conversar sobre os números da sua casa?</span></button></div>}
      <button ref={launcher} type="button" className={styles.launcher} aria-label={open ? 'Fechar chat' : 'Abrir chat Rook AI'} aria-expanded={open} aria-controls={hasOpened ? 'rook-ai-panel' : undefined} onClick={event => {if (open) close(); else show(event.currentTarget);}}>
        {open ? <span aria-hidden>×</span> : <Image src="/brand/rook-icon-branco.webp" alt="" width={40} height={40}/>}
      </button>
    </aside>}
  </>;
}
