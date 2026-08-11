import * as React from "react";
import { Button, Heading, Hr, Section, Text } from "@react-email/components";
import { EmailLayout, styles, theme } from "./components/Layout";

export type ContentAlertEmailProps = {
  name?: string | null;
  title: string;
  url: string;
  excerpt?: string | null;
  category?: string | null;
  unsubscribeUrl?: string;
};

/** ROO-139 · Bloco 2 — alerta de novo artigo publicado. */
export function ContentAlertEmail({
  name,
  title,
  url,
  excerpt,
  category,
  unsubscribeUrl,
}: ContentAlertEmailProps) {
  const firstName = name?.trim().split(/\s+/)[0];

  return (
    <EmailLayout
      preview={`Novo no blog do Rook: ${title}`}
      unsubscribeUrl={unsubscribeUrl}
    >
      {category ? (
        <Text
          style={{
            margin: "0 0 8px",
            color: theme.accent,
            fontSize: "12px",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.6px",
          }}
        >
          {category}
        </Text>
      ) : null}
      <Heading style={styles.h1}>{title}</Heading>
      <Hr style={styles.accentBar} />
      <Text style={styles.p}>
        {firstName ? `Olá, ${firstName}. ` : ""}Acabamos de publicar um artigo
        novo que pode te ajudar a decidir com mais clareza:
      </Text>
      {excerpt ? <Text style={styles.muted}>{excerpt}</Text> : null}
      <Section style={{ textAlign: "center", margin: "8px 0 4px" }}>
        <Button style={styles.button} href={url}>
          Ler o artigo
        </Button>
      </Section>
    </EmailLayout>
  );
}

export default ContentAlertEmail;
