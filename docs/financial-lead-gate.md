# ROO-1207 — Cadastro antes do resultado financeiro

## Objetivo aprovado

Nas páginas de diagnóstico e CMV, transformar a conclusão da análise em uma
captação identificada: números da operação → nome, WhatsApp e e-mail → clique
em **Ver resultado** → confirmação do registro no AsaFlow → resultado.

## Comportamento

- A primeira etapa valida os números no navegador, sem gravar contato ou negócio.
- A segunda solicita somente nome, WhatsApp com DDD e e-mail. A finalidade e a
  política de privacidade aparecem antes do envio. Contato comercial é opcional,
  desmarcado inicialmente e registrado separadamente.
- O clique final envia perfil, entradas financeiras e atribuição da visita. O
  servidor valida, recalcula e grava contato/negócio pelo contrato AsaFlow existente.
- O resultado público só retorna depois da confirmação do CRM. Premissas e
  memória de cálculo continuam no servidor e no contexto interno do negócio.
- O negócio identifica análise de CMV ou ponto de equilíbrio. Não presume empresa,
  cidade, ERP, solicitação de demonstração ou autorização de contato não informados.
- A solicitação posterior de demonstração continua sendo uma ação comercial
  explícita, com seu formulário próprio. O cadastro da análise já foi realizado;
  não depende desse formulário. Não é feita alteração anônima em negócios existentes.
- Valores desconhecidos não viram zero. Cenário incompleto orienta a completar os
  dados ou solicitar ajuda; não apresenta resultado nem dispara captação automática.

## Critérios de aceite

1. Digitar ou avançar para identificação não dispara escrita no CRM.
2. Ambos os fluxos bloqueiam resultado sem nome, telefone, e-mail e números válidos.
3. O endpoint financeiro não fornece resultado ao receber apenas números.
4. Um duplo clique não cria duas solicitações. Retry usa o mesmo identificador e
   snapshot, com novo desafio antirrobô. Não há sobrescrita de contato preexistente.
5. Falha/timeout preserva os dados, não exibe resultado nem mede conversão.
6. O evento de lead ocorre só após confirmação, sem perfil ou números em analytics.
7. Retornar à etapa financeira antes de enviar preserva respostas e contato.
8. Após sucesso, repetir o clique reapresenta o mesmo resultado sem novo envio.
9. Dados, erro, foco, telefone e botões funcionam em desktop e celular.

## Limites desta entrega

Sem mudança de fórmulas, tabelas internas, agente Rook AI, pagamento, CS ou envio de
mensagens. O pipeline/etapa configurados são reaproveitados. Validação automatizada
usa fornecedores simulados; comprovação de entrega real é registrada separadamente.

## Medição

Reaproveitar `generate_lead` com canal fixo da ferramenta após resposta confirmada,
respeitando o bloqueio de analytics em homologação e o consentimento existente.
Sem meta de conversão inventada: comparar conclusão e falhas após publicação.

## Validação da implementação

- `pnpm test:ci`: 333 testes passaram, incluindo validação do cadastro, resposta
  perdida após escrita, retry, clique duplo, privacidade e regressão de demonstração.
- Build Next.js com `NEXT_PUBLIC_ENV=homolog` e captação desativada: concluído,
  incluindo checagem de tipos. Blog usou a semente local por não haver Supabase
  configurado no ambiente de revisão.
- Contrato de publicação Hostinger e `git diff --check`: aprovados.
- Navegador local: CMV e diagnóstico avançam para identificação sem liberar o
  resultado; campos obrigatórios, máscara, retorno preservando os dados e bloqueio
  de envio em prévia conferidos. CMV conferido também em largura de 390 px.
- Nenhum lead real foi enviado. A entrega em AsaFlow e o comportamento das
  automações do pipeline precisam de comprovação após publicação/configuração.
