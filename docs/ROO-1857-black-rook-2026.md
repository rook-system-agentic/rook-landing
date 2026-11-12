# ROO-1857 — Black Rook 2026 e contratação paga

Pedido de Gabriel Abdala em 12/11/2026. Encerramento confirmado em 04/12/2026.

- 26/11, 00h00: revelar a oferta de primeiro ciclo mensal por R$49,90; acesso antecipado da comunidade.
- 27/11, 00h00: abrir o CTA público para `/contratar`.
- 05/12, 00h00: encerrar novas reservas, incluindo todo o dia 04/12. Todos os horários são de Brasília.
- O checkout pode ser aberto até 04/12, às 23h59. A reserva emitida na janela vale por até uma hora para pagamento, conforme o prazo exibido pela Stripe. Não há corte antecipado às 23h29.
- Próximas mensalidades: catálogo vigente, plano e faixa de faturamento. A tela de contratação deve mostrar valor e data antes do pagamento.
- R$49,90 por estabelecimento, nos planos Knight ou Rook. O adicional Chess fica fora do desconto e é cobrado à parte (confirmado pelo Gabriel).
- Novas contratações são pagas; o fim da Black não restaura o teste grátis.

## Implementação da landing

`bf1-community.mjs` concentra as datas. `bf1-campaign-server.ts` é protegido por `server-only`; a oferta só integra o HTML/RSC a partir do lançamento. `/bl1/` é dinâmica para não servir uma fase congelada pelo build ou por ISR. Ao atravessar uma data com a página aberta, a contagem solicita atualização do servidor. A comunidade, captura de cadastro e regras existentes da mentoria são preservadas.

O parser do catálogo aceita `trial.durationDays` igual a 0 (nova política) ou 7 (envelope legado durante a promoção). Isso não faz a landing anunciar teste: o CTA foi alterado para contratação e a descrição de aquisição não usa duração de trial. O componente sem consumidores que estimava cobrança depois do teste foi removido.

## Dependências de entrega

A landing descreve a política, mas não concede desconto nem valida participação no WhatsApp. O backend da ROO-1857 deve validar elegibilidade, primeira cobrança, renovação e datas. O acesso de 26/11 é distribuído na comunidade pelo fluxo de checkout definido no app. Não inserir esse acesso reservado na página pública.

Promover em conjunto com o app; a oferta não deve ser publicada apontando para um checkout que ainda cobre o preço antigo ou conceda trial. O trabalho local e os testes não comprovam cobrança real ou publicação.

Não há variável de ambiente nem flag nova na landing. As datas são fixas para esta campanha. As variáveis já existentes da captura da comunidade permanecem iguais; a retirada do teste e a concessão do desconto pertencem ao app.
