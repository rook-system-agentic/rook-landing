import * as React from "react";
import { Button, Heading, Hr, Link, Section, Text } from "@react-email/components";
import { EmailLayout, styles } from "./components/Layout";

export type DigestItem = {
  title: string;
  url: string;
  excerpt?: string | null;
};

export type WeeklyDigestEmailProps = {
  name?: string | null;
  periodLabel?: string;
  posts: DigestItem[];
  ctaUrl?: string;
  unsubscribeUrl?: string;
};

/** ROO-139 · Bloco 2 — resumo semanal com os artigos recentes. */
export function WeeklyDigestEmail({
  name,
  periodLabel,
  posts,
  ctaUrl = "https://rooksystem.com.br/blog",
  unsubscribeUrl,
}: WeeklyDigestEmailProps) {
  const firstName = name?.trim().split(/\s+/)[0];

  return (
    <EmailLayout
      preview={`Resumo da semana no Rook${periodLabel ? ` · ${periodLabel}` : ""}`}
      unsubscribeUrl={unsubscribeUrl}
    >
      <Heading style={styles.h1}>Resumo da semana 📊</Heading>
      <Hr style={styles.accentBar} />
      <Text style={styles.p}>
        {firstName ? `Olá, ${firstName}! ` : "Olá! "}
        Selecionamos o que saiu de mais útil para a sua gestão
        {periodLabel ? ` (${periodLabel})` : ""}:
      </Text>

      {posts.map((post, index) => (
        <Section key={index} style={styles.card}>
          <Link href={post.url} style={styles.cardTitle}>
            {post.title}
          </Link>
          {post.excerpt ? <Text style={styles.cardText}>{post.excerpt}</Text> : null}
        </Section>
      ))}

      <Section style={{ textAlign: "center", margin: "8px 0 4px" }}>
        <Button style={styles.button} href={ctaUrl}>
          Ver todos os artigos
        </Button>
      </Section>
    </EmailLayout>
  );
}

export default WeeklyDigestEmail;
