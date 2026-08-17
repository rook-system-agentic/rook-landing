import * as React from "react";
import { Button, Heading, Hr, Section, Text } from "@react-email/components";
import { EmailLayout, styles } from "./components/Layout";
import { siteUrl } from "@/lib/site-origin";

export type WelcomeEmailProps = {
  name?: string | null;
  ctaUrl?: string;
  unsubscribeUrl?: string;
};

/** ROO-139 · Bloco 2 — e-mail de boas-vindas (disparado no signup). */
export function WelcomeEmail({
  name,
  ctaUrl = siteUrl("/blog/"),
  unsubscribeUrl,
}: WelcomeEmailProps) {
  const firstName = name?.trim().split(/\s+/)[0];

  return (
    <EmailLayout
      preview="Bem-vindo à newsletter do Rook System — controladoria para restaurantes."
      unsubscribeUrl={unsubscribeUrl}
    >
      <Heading style={styles.h1}>
        Bem-vindo{firstName ? `, ${firstName}` : ""}! 👋
      </Heading>
      <Hr style={styles.accentBar} />
      <Text style={styles.p}>
        Que bom ter você por aqui. A partir de agora você vai receber, direto no
        e-mail, conteúdos práticos sobre <strong>gestão financeira para food
        service</strong>: CMV, controle de compras, precificação, conciliação de
        recebíveis e os bastidores de quem decide com número na mão.
      </Text>
      <Text style={styles.p}>
        Sem encheção: enviamos quando temos algo realmente útil — e você cancela
        a qualquer momento em um clique.
      </Text>
      <Section style={{ textAlign: "center", margin: "8px 0 4px" }}>
        <Button style={styles.button} href={ctaUrl}>
          Ler o blog do Rook
        </Button>
      </Section>
    </EmailLayout>
  );
}

export default WelcomeEmail;
