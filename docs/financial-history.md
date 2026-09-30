# ROO-1207 — Histórico financeiro por pessoa

As capturas de ponto de equilíbrio, CMV e demonstração passam a registrar uma
solicitação imutável na base Rook antes de acessar o AsaFlow. Isso permite ao ADM
consultar os números e resultados sem reconstruir dados a partir da descrição do
negócio. O motor financeiro não foi alterado.

## Estados e fonte dos dados

- `none`: demonstração sem contexto financeiro informado.
- `partial`: dados disponíveis, sem resultado financeiro confirmado. Valores
  desconhecidos ficam ausentes; zero informado continua zero. Se todos os números
  foram preenchidos mas não confirmados, `missingFields` inclui
  `resultConfirmation`.
- `complete`: entradas, cálculo completo, projeção pública, versões da fórmula e
  do modelo e premissas preservados no snapshot.

Página de entrada, página de cadastro, tipo da captura e estado financeiro são
campos separados. Visitar `/diagnostico` ou vir de uma campanha não prova que o
cálculo foi concluído. O formulário recebe contexto parcial durante a edição,
mas digitar não cria contato, registro ou evento de conversão.

A identidade é o par e-mail/telefone normalizado, autodeclarado. Não é uma conta
autenticada do produto; não há associação automática a `auth.users`. Dados
comerciais ficam no snapshot e no negócio desta solicitação. Contatos existentes
não são sobrescritos nem recebem a propriedade `diagnostico_rook_ai`.

## Persistência e efeitos externos

`createAcquisitionLedger` usa exclusivamente as RPCs de backend
`claim_financial_submission_v1` e `transition_financial_submission_v1` com service
role. A migração, restrições, RLS, lease e API autenticada do ADM pertencem ao
rook-system, na mesma entrega ROO-1207.

1. Validar perfil e números e consumir a proteção antirrobô.
2. Fazer claim da solicitação e salvar request/snapshot antes de CRM.
3. Usar o snapshot devolvido pela base em todas as tentativas, inclusive quando o
   código da fórmula já mudou. O hash protege o request normalizado; resultados,
   fórmulas e notas geradas pelo servidor não alteram a identidade do request.
4. Persistir `contact_requested` antes de criar contato e `contact_resolved` após
   receber ID válido. Contato já salvo é recuperado por ID; uma edição posterior
   de telefone/e-mail no CRM não altera o snapshot original.
5. Persistir `deal_requested` antes de criar negócio e `deal_created` assim que
   houver ID. O negócio inclui o resumo, o estado da análise e um link para o
   histórico no ADM, que continua exigindo autenticação.
   O ambiente do servidor (`NEXT_PUBLIC_ENV=homolog`) escolhe
   `adm-homolog.rooksystem.com.br`; produção mantém `adm.rook.com.br`.
   O visitante não pode substituir esse host. Negócios anteriores não são editados.
6. Ler `/deals/{id}` e comprovar que `contactIds` inclui o contato solicitado.
   Somente a confirmação dessa prova no ledger libera sucesso/resultado.

Um HTTP 201 ou um ID isolado do AsaFlow não prova vínculo. Se ele estiver ausente,
os IDs e o cálculo ficam preservados em `needs_reconciliation`, sem outro POST de
negócio. Com ambos os IDs conhecidos, o backend pode conceder uma lease de
`verification_only`: o cliente faz apenas GETs e confere novamente o vínculo.
Sem IDs e após a janela conservadora de 23 horas da primeira tentativa de efeito,
o backend exige reconciliação; não reutiliza cegamente uma chave cuja garantia do
fornecedor é de 24 horas.

Uma lease ocupada não permite outro envio. Conflito de payload no mesmo
`submissionId`, lease vencida, falha de persistência ou recibo inválido não liberam
resultado. Falhas guardam somente códigos sanitizados, sem payload ou dados
pessoais no erro do ledger.

## Recuperação no navegador e medição

Depois do clique explícito de envio, a mesma aba conserva o payload congelado e
seu `submissionId` em `sessionStorage`, sem token antirrobô. Reload restaura a
tentativa, mas só apresenta resultado após consultar novamente o servidor por
um novo envio protegido. Não há endpoint público para ler resultados por ID.
O botão de nova análise encerra a tentativa anterior e cria um novo UUID.

O evento existente `generate_lead` continua sem identidade ou valores
financeiros. Uma confirmação já tratada na mesma aba não emite outra conversão
após reload. O ledger, e não analytics, é a fonte do histórico por pessoa.
`result_available_at` indica que o servidor disponibilizou o resultado; não
afirma que o visitante o viu.

## Publicação e validação

Aplicar e validar primeiro a migração/API do rook-system em homologação; depois
publicar a landing no mesmo ambiente. As rotas precisam de Supabase service role
e das RPCs. Sem esse armazenamento, falham fechadas antes de qualquer CRM.
Contatos/negócios de teste devem usar dados sintéticos e `recordKind=test`, escolhido
pelo ambiente no servidor. O navegador não escolhe esse marcador.

Os testes executam a orquestração e componentes reais com transportes simulados:
snapshot antes do fornecedor, conflito, falha de DB, recibo perdido, vínculo
ausente, retomada por leitura, lease vencida, contexto parcial e reload. O build
usa ambiente homolog com captação desativada. Esses testes não provam um envio
real de produção. O aceite E2E de homolog deve conferir registro Rook, snapshot,
contato/negócio AsaFlow com vínculo efetivo, histórico no ADM e retry sem duplicar.
