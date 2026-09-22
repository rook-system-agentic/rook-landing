# ROO-1207 — entrega isolada do núcleo de captação

## Recorte desta branch

Base: `origin/main` em `a7b1a939e39a4afd7a05cf15f0733fad74bf1651`.
Origem da funcionalidade: `0f08c51031f72251ef410c9005010883ccc05380`, somente arquivos de servidor, contratos, dados e testes da ROO-1207.

Esta primeira entrega preserva integralmente páginas, preços, CTAs, formulários e calculadoras atuais de `main`. Não inclui a reformulação de `/sobre`, a alteração de SEO de preços nem a mudança de cor ocre que estão em `homolog`. Também não monta o widget do AsaFlow.

Foram preparados:

- `/api/acquisition`: cadastro validado no servidor, proteção distribuída já existente, contato + oportunidade no AsaFlow. Desligado por padrão e sem configuração completa retorna `503` antes de ler o cadastro ou acessar serviços.
- Motor financeiro determinístico, endpoint `/api/financial-simulations` e ferramentas HTTP de CMV/ponto de equilíbrio. Estes endpoints públicos só calculam: não consultam CRM, não gravam dados, não enviam mensagens e não estão conectados à IA do AsaFlow nesta entrega.
- Normalização de cidade/UF pelo código IBGE e campos de perfil, faturamento e ERP/PDV.
- Formatter puro do futuro aviso interno de lead. Não está conectado à rota, fila ou canal WhatsApp.
- Testes de contratos, cálculos, limites HTTP, correções, identidade e idempotência do adapter.

## Implantação do código com a integração desligada

`ASAFLOW_ACQUISITION_ENABLED` precisa ser exatamente `true` para habilitar a rota. Ausência ou `false` bloqueia GET e POST. A rota também exige chave AsaFlow, funil, etapa e configuração da proteção contra abuso. Nenhuma nova variável pública de frontend foi introduzida neste recorte.

A UI atual não depende da rota nova; portanto, implantar este código com a integração desligada não substitui os CTAs de contratação por um cadastro indisponível. Não alterar outras flags globais de boas-vindas, writeback ou ambientes para ativar esta funcionalidade.

## Próximo recorte separado: interface aprovada

O formulário no fim das páginas e CTAs de demonstração, Rook AI com logo negativa e calculadoras consultivas estão preparados em um worktree/patch separado sobre a mesma base de produção. Esse recorte deve ser revisado e publicado somente quando a rota e o caminho CRM → ADM estiverem conferidos. Publicá-lo com a rota desligada deixaria o novo formulário indisponível; ele não faz parte desta entrega inicial.

## Antes de habilitar captação real

1. Validar a credencial dedicada no destino correto sem expor seu conteúdo. Confirmar os IDs do funil e da etapa aberta pertencentes ao mesmo workspace.
2. Confirmar Supabase de produção, RPC `consume_commercial_lead_abuse_gate`, segredo HMAC e cabeçalhos de IP do runtime. A presença de variáveis não prova a operação da RPC.
3. Validar cadastro identificado para teste: desafio → contato → oportunidade → webhook autenticado → ADM, com o contexto correto.
4. Repetir a mesma solicitação na janela de idempotência do fornecedor e reconciliar o resultado antes de repetir uma gravação cujo retorno se perdeu. O código não oferece deduplicação durável entre chat e formulário.
5. Publicar a interface aprovada e ativar a rota de forma coordenada. Widget, agenda dentro do chat e aviso WhatsApp têm configuração e validação próprias; não são ativados por esta flag.

## Limites do contrato

O adapter só reaproveita contato com e-mail e telefone normalizados coincidentes e identidade inequívoca. Não altera contato existente nem propriedades de funil/handoff. Cria oportunidade com chave por solicitação e descrição estruturada. Os resultados financeiros são recalculados a partir das entradas pelo servidor; prosa/resultados vindos do cliente não se tornam números verificados.

Uma resposta HTTP bem-sucedida do CRM não comprova a projeção no ADM nem a entrega de WhatsApp. Essas evidências precisam ser registradas separadamente.

## Verificação local desta entrega

A lista de comandos, resultados e a comparação da superfície pública com `main` estão no relatório externo `outputs/isolamento-producao-roo1207.md`. Não houve chamada real ao AsaFlow, leitura de credenciais, alteração de ambiente, commit, push ou implantação nesta preparação.
