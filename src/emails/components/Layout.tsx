import * as React from "react";
import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

import { SITE_ORIGIN } from "@/lib/site-origin";

/**
 * ROO-139 — paleta e shell compartilhados dos e-mails da newsletter.
 * Mantém a identidade de marca (marrom Rook + acento ocre) e um layout
 * claro/responsivo de boa entregabilidade (inbox, não spam).
 */
export const theme = {
  brand: "#5D4037",
  brandSoft: "#8D6E63",
  accent: "#E79F4A",
  bg: "#f5f4f2",
  card: "#ffffff",
  text: "#2b2b2b",
  muted: "#6b6b6b",
  border: "#e7e2dc",
} as const;

const main: React.CSSProperties = {
  backgroundColor: theme.bg,
  margin: 0,
  padding: "24px 0",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  color: theme.text,
  lineHeight: 1.6,
};

const container: React.CSSProperties = {
  maxWidth: "600px",
  margin: "0 auto",
  backgroundColor: theme.card,
  borderRadius: "12px",
  overflow: "hidden",
  border: `1px solid ${theme.border}`,
};

const header: React.CSSProperties = {
  background: `linear-gradient(135deg, ${theme.brand} 0%, ${theme.brandSoft} 100%)`,
  padding: "32px 32px 24px",
  textAlign: "center",
};

const logo: React.CSSProperties = {
  margin: 0,
  color: "#ffffff",
  fontSize: "22px",
  fontWeight: 700,
  letterSpacing: "0.2px",
};

const tagline: React.CSSProperties = {
  margin: "6px 0 0",
  color: "rgba(255,255,255,0.88)",
  fontSize: "13px",
};

const content: React.CSSProperties = { padding: "32px" };

const hr: React.CSSProperties = {
  borderColor: theme.border,
  margin: "0 32px",
};

const footer: React.CSSProperties = {
  padding: "20px 32px 28px",
  textAlign: "center",
};

const footerText: React.CSSProperties = {
  margin: "4px 0",
  color: theme.muted,
  fontSize: "12px",
};

const footerLink: React.CSSProperties = {
  color: theme.brandSoft,
  textDecoration: "underline",
};

/** Estilos reutilizáveis pelos templates (corpo do e-mail). */
export const styles = {
  h1: {
    margin: "0 0 16px",
    color: theme.brand,
    fontSize: "24px",
    fontWeight: 700,
    lineHeight: 1.3,
  } as React.CSSProperties,
  p: {
    margin: "0 0 16px",
    color: theme.text,
    fontSize: "16px",
  } as React.CSSProperties,
  muted: {
    margin: "0 0 16px",
    color: theme.muted,
    fontSize: "14px",
  } as React.CSSProperties,
  button: {
    display: "inline-block",
    backgroundColor: theme.brand,
    color: "#ffffff",
    fontSize: "15px",
    fontWeight: 600,
    textDecoration: "none",
    padding: "13px 28px",
    borderRadius: "8px",
  } as React.CSSProperties,
  card: {
    backgroundColor: theme.bg,
    border: `1px solid ${theme.border}`,
    borderRadius: "10px",
    padding: "18px 20px",
    margin: "0 0 16px",
  } as React.CSSProperties,
  cardTitle: {
    margin: "0 0 6px",
    color: theme.brand,
    fontSize: "17px",
    fontWeight: 600,
  } as React.CSSProperties,
  cardText: {
    margin: 0,
    color: theme.muted,
    fontSize: "14px",
  } as React.CSSProperties,
  accentBar: {
    height: "3px",
    backgroundColor: theme.accent,
    border: "none",
    margin: "0 0 24px",
    width: "48px",
  } as React.CSSProperties,
};

export type EmailLayoutProps = {
  preview: string;
  unsubscribeUrl?: string;
  children: React.ReactNode;
};

export function EmailLayout({ preview, unsubscribeUrl, children }: EmailLayoutProps) {
  return (
    <Html lang="pt-BR">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={logo}>♜ Rook System</Text>
            <Text style={tagline}>Inteligência financeira para restaurantes</Text>
          </Section>
          <Section style={content}>{children}</Section>
          <Hr style={hr} />
          <Section style={footer}>
            <Text style={footerText}>
              Rook System · Controladoria estratégica para food service
            </Text>
            {unsubscribeUrl ? (
              <Text style={footerText}>
                <Link href={unsubscribeUrl} style={footerLink}>
                  Cancelar inscrição
                </Link>{" "}
                ·{" "}
                <Link href={SITE_ORIGIN} style={footerLink}>
                  rook.com.br
                </Link>
              </Text>
            ) : null}
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export default EmailLayout;
