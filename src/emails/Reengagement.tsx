import * as React from "react";
import { Button, Heading, Hr, Section, Text } from "@react-email/components";
import { EmailLayout, styles } from "./components/Layout";

export type ReengagementEmailProps = {
  name?: string | null;
  ctaUrl?: string;
  unsubscribeUrl?: string;
};

/** ROO-139 · Bloco 2 — reengajamento de lead inativo (30+ dias). */
export function ReengagementEmail({
  name,
  ctaUrl = "https://rooksystem.com.br/blog",
  unsubscribeUrl,
}: ReengagementEmailProps) {
  const firstName = name?.trim().split(/\s+/)[0];

  return (
    <EmailLayout
      preview="Faz um tempo que a gente não se fala — tem novidade no Rook."
      unsubscribeUrl={unsubscribeUrl}
    >
      <Heading style={styles.h1}>
        {firstName ? `${firstName}, ` : ""}ainda dá pra apertar a margem 📉
      </Heading>
      <Hr style={styles.accentBar} />
      <Text style={styles.p}>
        Faz um tempo que você não abre nossos e-mails — e tudo bem. Mas a gente
        continuou produzindo material para quem leva o caixa do restaurante a
        sério: diagnóstico de CMV, recebíveis (cartão/iFood) e precificação.
      </Text>
      <Text style={styles.p}>
        Quer continuar recebendo? É só clicar abaixo e dar uma olhada no que
        saiu de mais recente. Se preferir, pode cancelar a inscrição no rodapé —
        sem ressentimentos. 🙂
      </Text>
      <Section style={{ textAlign: "center", margin: "8px 0 4px" }}>
        <Button style={styles.button} href={ctaUrl}>
          Ver as novidades
        </Button>
      </Section>
    </EmailLayout>
  );
}

export default ReengagementEmail;
