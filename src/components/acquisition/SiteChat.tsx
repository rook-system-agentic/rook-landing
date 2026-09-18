'use client';

import Script from 'next/script';
import Link from 'next/link';
import Image from 'next/image';
import {useEffect, useRef, useState} from 'react';
import styles from './site-chat.module.css';

const WIDGET_SRC = 'https://app.asaflow.com.br/widget.js';
const CHAT_OPEN = '[data-asaflow-chat-open], a[href="#data-asaflow-chat-open"]';

/** O provedor controla a conversa. O site só monta seu widget uma vez. */
export default function SiteChat() {
  const enabled = process.env.NEXT_PUBLIC_ASAFLOW_CHAT_ENABLED === 'true';
  const chatKey = process.env.NEXT_PUBLIC_ASAFLOW_CHAT_KEY || '';
  // Homologação não carrega o canal real. A conversa é testada no Playground
  // do provedor; nenhum atraso de hidratação da query pode iniciar uma sessão.
  const configured = enabled && Boolean(chatKey) && process.env.NEXT_PUBLIC_ENV !== 'homolog';
  const preview = process.env.NEXT_PUBLIC_ENV === 'homolog';
  const [open, setOpen] = useState(false);
  const [teaser, setTeaser] = useState(true);
  const [unavailable, setUnavailable] = useState(false);
  const [mounted, setMounted] = useState(false);
  const closeButton = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLElement>(null);
  const opener = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const onOpen = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target.closest(CHAT_OPEN) : null;
      if (!target || (configured && document.querySelector('.asaflow-chat-root'))) return;
      event.preventDefault();
      opener.current = target as HTMLElement;
      setOpen(true);
    };
    document.addEventListener('click', onOpen);
    return () => document.removeEventListener('click', onOpen);
  }, [configured]);

  useEffect(() => {
    if (!configured) return;
    // O script oficial não emite um evento de prontidão do painel. Sua raiz
    // permite distinguir instalação concluída de erro/restrição de domínio.
    const inspect = () => setMounted(Boolean(document.querySelector('.asaflow-chat-root')));
    const observer = new MutationObserver(inspect);
    observer.observe(document.body, {childList: true});
    inspect();
    const timer = window.setTimeout(() => {
      if (!document.querySelector('.asaflow-chat-root')) setUnavailable(true);
    }, 12000);
    return () => {observer.disconnect(); window.clearTimeout(timer);};
  }, [configured]);

  useEffect(() => {if (open) closeButton.current?.focus();}, [open]);
  useEffect(() => {
    if (!open) return;
    const keys = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {setOpen(false); opener.current?.focus(); return;}
      if (event.key !== 'Tab' || !window.matchMedia('(max-width:480px)').matches || !panel.current) return;
      const items = Array.from(panel.current.querySelectorAll<HTMLElement>('button:not(:disabled),a[href],input:not(:disabled)'));
      const first = items[0], last = items[items.length - 1];
      if (event.shiftKey && (document.activeElement === first || !panel.current.contains(document.activeElement))) {event.preventDefault(); last?.focus();}
      if (!event.shiftKey && (document.activeElement === last || !panel.current.contains(document.activeElement))) {event.preventDefault(); first?.focus();}
    };
    document.addEventListener('keydown', keys);
    return () => document.removeEventListener('keydown', keys);
  }, [open]);
  function close() {setOpen(false); opener.current?.focus();}
  const showFallback = !mounted && (preview || unavailable || open);

  return <>
    {configured && <Script id="rook-asaflow-chat" src={WIDGET_SRC} strategy="afterInteractive"
      data-asaflow-chat-key={chatKey} data-asaflow-chat-api="https://app.asaflow.com.br"
      data-no-minify="1" onError={() => setUnavailable(true)}/>}
    {showFallback && <aside className={styles.root} data-rook-chat-fallback onKeyDown={event => {if (event.key === 'Escape' && open) close();}}>
      {open ? <section ref={panel} className={styles.panel} role="dialog" aria-label="Rook AI — assistente virtual">
        <header className={styles.header}><span className={styles.avatar} aria-hidden><Image src="/brand/rook-icon-branco.webp" alt="" width={42} height={42}/></span><div><strong>Rook AI</strong><span>Assistente virtual do Rook</span></div><button ref={closeButton} type="button" aria-label="Fechar chat" onClick={close}>×</button></header>
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
      </section> : teaser && <div className={styles.teaser}><button type="button" className={styles.dismiss} aria-label="Dispensar convite do chat" onClick={() => setTeaser(false)}>×</button><button type="button" onClick={event => {opener.current = event.currentTarget; setOpen(true);}}><strong>Rook AI</strong><span>Vamos conversar sobre os números da sua casa?</span></button></div>}
      <button type="button" className={styles.launcher} aria-label={open ? 'Fechar chat' : 'Abrir chat Rook AI'} aria-expanded={open} onClick={event => {opener.current = event.currentTarget; if (open) close(); else setOpen(true);}}>
        {open ? <span aria-hidden>×</span> : <Image src="/brand/rook-icon-branco.webp" alt="" width={40} height={40}/>}
      </button>
    </aside>}
  </>;
}
