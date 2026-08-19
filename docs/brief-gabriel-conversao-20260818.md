# Brief para o rook-landing — conversão e narrativa

**Para:** Daniel Fontes (autor do redesenho “Produto vivo”, ROO-1103)
**De:** Gabriel Abdala
**Data:** 18/08/2026
**Repo:** `rook-system-agentic/rook-landing`
**Issue irmã:** ROO-1103 (em Revisão)

Este documento é demanda de produto e copy, **não um PR**. A implementação fica no `rook-landing`, no vocabulário visual e na estrutura que você já construiu. O preview que circula com este brief é laboratório de conteúdo — referência de intenção, não código para merge.

---

## 1. Princípio

Não descaracterizar o que já está bom.

- Paleta `data-lp-home`, spark, funil das seis etapas, DRE, gap chart, reveal, progresso de leitura, carrossel de logos, `EXEMPLO_DRE`, planos/billing, blog, GTM, checkout e CMV **ficam**.
- Não substituir a home por outro site. **Acrescentar seções e trocar copy** nos componentes existentes (`LpHero`, `LpFunnel`, `LpManifesto`, `LpPartners`, `lp-content.ts`).
- Números da casa-exemplo só do `EXEMPLO_DRE` (receita R$ 412.800, impostos 9%, CMV 31%, despesas 36%, dívidas 9%, resultado 15%). Sem cliente real, sem CNPJ, sem nome de colaborador.

---

## 2. Problema de conversão

O mercado lê o Rook como ERP ou PDV. Não somos. Somos a camada que **lê, interpreta e aponta a decisão** — inteligência financeira para food service. Autoridade de controladoria, sem usar o jargão “CFO as a Service” no site.

Não resolver isso com frase de defesa (“Não é PDV. Não é ERP.”). Resolver **mostrando o produto** e falando de resultado.

---

## 3. O que **não** fazer

- Página, aba ou badge “Não é ERP”.
- Comparativo com nome de ERP/PDV (Omie, Saipos etc. só no carrossel de **parceiros**).
- Contador tratado como sistema.
- Repetir no rodapé “não substitui PDV/ERP/contador”. Fica defensivo e reduz o Rook a “BI bonitinho”.
- Trocar o formato de cálculo/apresentação do diagnóstico e da calculadora de CMV.
- Inventar dado que o produto não tem.

---

## 4. Copy aprovada (usar à risca)

**Categoria / kicker:** Inteligência financeira para food service

**Headline do hero:** Faturar não é lucrar.

**Lede do hero:**
> Num setor de **R$ 495 bilhões**, 6 em cada 10 casas não lucram. O Rook lê a operação, interpreta as seis etapas e aponta, em reais, a próxima decisão.

**CTAs do hero:** primário “Ver o diagnóstico do meu restaurante” → `/diagnostico`. Secundário “Testar 7 dias” → `/planos`.

**Método:** Coleta. Interpreta. Decide.
- Coleta — Lê o que a casa já produz. PDV, ERP, Open Finance, SEFAZ, eSocial e adquirentes no mesmo tabuleiro — sem recadastrar a operação.
- Interpretação — Seis etapas, um diagnóstico. Vendas, impostos, custos, despesas, dívidas e resultado.
- Decisão — Recomendação em reais. Não é painel para contemplar.

**Captura:**
> Não é só o sistema da casa. É tudo que a operação já emite.
> Open Finance monta o fluxo de caixa pelo extrato. A SEFAZ entrega a nota. O eSocial, a folha. A adquirente, a taxa. O PDV continua no salão.

**Pergunta do dono:** Você sabe quanto **sobrou** no final do mês?

**Contrastes (manter o trio):** Receita ≠ Lucro · Movimento ≠ Margem · Dívida ≠ Estratégia

**Módulos:**
> A casa inteira, na mesma tela.
> Vendas, CMV, imposto, folha, dívida e o que sobrou — o número que o gestor usa para decidir o mês.

**WhatsApp:**
> Todo dia às 7h, o resumo no WhatsApp.
> Não é chat. É o informe da operação: faturamento, compras e budget restante. Segunda-feira chega o limite da semana. Dia 1, o fechamento.

**Rook.AI:**
> O Rook.AI mora no produto.
> O Rook.AI é a inteligência do negócio. Interliga o que a casa já emite e responde o gestor no momento da pergunta — com o número, o contexto e o que fazer agora. Sem esperar o fechamento. Sem montar a planilha.

**Footer:**
> Software de inteligência financeira para food service. Coleta, interpreta e aponta a próxima decisão do gestor — em reais.

**FAQ principal:**
- O que o Rook faz, na prática? Organiza as seis etapas entre o caixa e o bolso e devolve diagnóstico com recomendação em reais.
- Preciso trocar o sistema que já uso? Não. Se o sistema não está na lista, peça — priorizamos pelo volume de indicações.
- Preços: Knight R$ 479,90 / Rook R$ 779,90 / Chess + R$ 279,90. 7 dias, uma vez por CNPJ.

---

## 5. Seções novas na home (encaixar, não substituir)

Ordem sugerida depois do hero + funil que já existem:

1. **Método** (Coleta / Interpreta / Decide) — três cards.
2. **Captura viva** — seletor Open Finance · SEFAZ · eSocial · Adquirentes · PDV/ERP/delivery. Cada item abre um **mock da Central de Dados**, não um card genérico.
   - Open Finance → Detalhe do extrato (saldo anterior, créditos, débitos, saldo atual, classificação automática).
   - SEFAZ → NF-e de compra com aceite, emitente/destinatário, tributos e **resumo por categoria na extração**.
   - eSocial → folha e CMO.
   - Adquirentes → bruto × taxa × líquido (Stone/Rede só aqui, como fonte — não como “versus o Rook”).
   - PDV → tiles da Central de Dados (notas de compra/venda, extratos, faturas).
3. **Gap + contrastes** — o `LpGapChart` já cobre; só alinhar copy.
4. **Módulos interativos** — hover no desktop, toque no mobile. Painéis: Vendas (turno + melhor/pior dia), Compras/CMV (meta + inflação de insumo + limite da semana), Impostos, Despesas, Endividamento, Resultado (DRE).
5. **WhatsApp** — mock do template Twilio real (`rook_daily_v3` / semanal / mensal). Número +55 61 3686-6728. Opt-in no onboarding.
6. **Rook.AI** — mock de conversa no chrome do produto (escuro). Pergunta de CMV, benchmark do segmento, decisão em R$. **Não** contrastar com “não é o WhatsApp”.
7. Stats do setor (Abrasel / IBGE) **depois** do produto, não no primeiro fold.
8. Parceiros — **manter o carrossel atual**. CTA extra: “Seu sistema não está aqui? Indique.”
9. Planos / FAQ / CTA — os de hoje.

Referência visual dos mocks de captura: telas reais da Central de Dados (`/central-de-dados`, `/fiscal/documentos`, `/banking/statements`). Anonimizar. O insight já nasce na extração — é isso que o mock precisa mostrar.

---

## 6. Diagnóstico (`DiagnosticoFlow.tsx`)

O fluxo de produção **já tem A/B**:
- A = lead primeiro
- B = números da casa primeiro, gate (nome, e-mail, telefone) **antes do resultado**

**Decisão:** usar só o B. Melhorar a copy do hero (convencimento). **Não** mudar fórmula, segmentos, benchmark, tela de resultado nem o POST no Supabase.

Hero sugerido:
> Comece pelo diagnóstico. Sem cartão.
> Informe os números da casa. O resultado aparece depois do seu contato.

---

## 7. Sobre

Manter a rota. Melhorar storytelling (já rascunhado no preview):

- Headline: Visão. Estratégia. Controle.
- História: o Rook começou em planilhas. 20 anos de controladoria. A frase que se repetia: *“Eu vendo bem, mas não sei para onde o dinheiro está indo.”*
- 2026: o método virou produto.
- Não transformar Sobre em página de “não somos ERP”.

---

## 8. LP de restaurantes (fase 2)

Rota `/para/restaurantes` (ou o padrão de URL que o landing já usar).

- Headline: Casa cheia. CMV em 34%. Sobra 8%.
- Reusar o funil + o explorador de módulos.
- Sem aba “Não é ERP”.

Bares, padarias, redes: depois. Só restaurantes agora.

---

## 9. Ordem de implementação sugerida

1. Copy no `lp-content.ts` + hero + footer (sem seção nova).
2. Diagnóstico: forçar variante B + copy do hero.
3. `LpSources` (Central de Dados).
4. `LpWhatsapp` + `LpRookAi`.
5. Explorador de módulos (pode viver na home e na LP de restaurantes).
6. Sobre + `/para/restaurantes`.

Homolog a cada passo. Gabriel valida.

---

## 10. Preview

O preview vivo desta rodada está na conversa do Grok com o Gabriel (sandbox de conteúdo). Se o link expirar, este brief + os prints que ele encaminhar são a fonte.

O que o preview **não** é: stack de produção, paleta final, merge. É a narrativa e os mocks validados.

---

## 11. Tom

Autoridade. Número. Decisão. Sem defesa. Sem “passe o mouse”. Sem “não é X”.
