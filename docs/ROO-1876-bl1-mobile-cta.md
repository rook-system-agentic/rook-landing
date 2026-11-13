# ROO-1876 — /bl1: CTA visível no celular, mentoria exclusiva e Lead no pixel

Pedido de Gabriel Abdala em 13/11/2026, 09h50, depois da leitura D+1 da campanha Meta BF26.

## Por que

Entre 12/11, 16h34, e 13/11, 09h40, a campanha gastou R$ 75,30, gerou 210 cliques no link e levou 228 visitantes da Meta à /bl1 (Vercel Web Analytics). Ninguém abriu o formulário: foram 0 GET em `/api/bf1-community-access/`, 0 cadastros e 0 entradas no grupo.

O formulário funcionava (testado em WebKit/iPhone e em Chromium com user agent do Instagram, sem envio). As causas encontradas foram quatro:

1. No celular, a primeira tela não tinha CTA. No iPhone 13 (390×664), o primeiro botão ficava em y=751. O banner de cookies cobria a parte de baixo da tela, e a página tem cerca de 15 telas.
2. O hero não dizia para quem é a página. "Black Friday" sozinho atrai quem procura desconto de consumo.
3. O `href` do CTA era o convite do WhatsApp. Um toque antes da hidratação pulava o cadastro.
4. O cadastro só emitia `bf1_access_request`, que não tem tag no GTM. A Meta nunca recebeu `Lead`.

## O que mudou

| Item | Onde fica a regra |
|---|---|
| Todo CTA da /bl1 aponta para `#acesso` (`BF1_ACCESS_ANCHOR`), nunca para o convite | `src/lib/bf1-community.mjs` |
| Um host único (`Bf1AccessHost`) intercepta os cliques, lê o hash depois da hidratação e abre o formulário. Quem já se cadastrou vai direto ao grupo | `src/components/bf1/Bf1AccessHost.tsx` |
| Barra fixa com CTA abaixo de 1024 px. Aparece quando o CTA do hero sai da tela, some no CTA final e fica acima do banner de cookies | `Bf1AccessHost.tsx` + `bf1.module.css` |
| CTA "Participar" no cabeçalho do celular, só na /bl1 | `src/components/Header.tsx` |
| Hero compacto até 640 px | `bf1.module.css` |
| Banner de cookies compacto no celular, com o mesmo texto e as mesmas opções | `src/components/CookieConsent.tsx` |
| O cadastro confirmado emite `generate_lead` com `channel=bf1_comunidade`. O GTM já leva esse evento a `Lead` nos pixels 1060053930335437 e 1088278284898303 (este só com consentimento) e ao GA4 G-M93QYWQ84F | `Bf1AccessDialog.tsx` + GTM-M8ZJ3WTV |
| Copy: público no hero ("Para donos de restaurante") e mentoria de Planejamento Financeiro 2027 exclusiva para quem está na comunidade | `src/lib/bf1-content.ts` |

## Decisões e limites

A exclusividade da mentoria para a comunidade é uma decisão do Gabriel de 13/11. Formato, vagas, janela e como participar continuam a definir e são anunciados na comunidade. Por isso a página não diz "sai primeiro" sobre a mentoria.

A alternativa de falha de gravação (decisão F2 da ROO-1848), que mostra o convite direto, continua igual. Ela é o único caminho até o grupo sem cadastro e só aparece quando a gravação falha.

As fases de oferta da ROO-1857 (26/11 em diante) não foram alteradas. Quando o CTA principal vira o checkout, a barra fixa não aparece.

O `generate_lead` é o mesmo evento usado pelos leads de /planos e pelas ferramentas. O `channel` separa os casos no GA4; na Meta, separar exige conversão personalizada por URL `/bl1`.

## DoD

Em 24h, ou com cerca de 200 visitas vindas da Meta:

- aberturas do formulário ≥ 10% das visitas (GET em `/api/bf1-community-access/`);
- cadastros ≥ 3% das visitas (contagem agregada em `bf1_community_access_requests`);
- `Lead` visível no Gerenciador de Eventos do pixel 1060053930335437;
- 0 entradas no grupo sem cadastro, exceto pela alternativa de falha.
