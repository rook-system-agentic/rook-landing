# Rook AI — caixa de conversa persistente

## Problema e limite da correção

O widget flutuante pode reaplicar o modo de entrada da sessão inicial quando sua função de abertura é chamada novamente. A pessoa fecha o painel enquanto conversa e, ao reabri-lo, pode encontrar o campo bloqueado mesmo depois de a IA liberar uma resposta.

O site passa a usar a função pública `window.AsaFlow.chat.renderStandalone` do SDK oficial. Ela é chamada uma única vez por montagem do layout, apenas na primeira abertura. O cabeçalho, o convite e o botão de fechar pertencem ao site. Fechar usa `hidden` no painel e mantém a mesma instância, formulário, mensagens e conexão do provedor. Reabrir muda a visibilidade, sem chamar `open`, `close`, `identify` ou `restart` do SDK.

A conversa, a IA, o envio de mensagens, o consentimento do canal, os anexos e os agendamentos continuam no SDK. Esta alteração não configura nem comprova agenda, contratação, checkout ou CRM.

## Configuração pública

- `NEXT_PUBLIC_ASAFLOW_CHAT_ENABLED=true` habilita a montagem.
- `NEXT_PUBLIC_ASAFLOW_CHAT_TENANT` é o slug público do tenant no link externo.
- `NEXT_PUBLIC_ASAFLOW_CHAT_FLOW` é o slug público do fluxo publicado no link externo.
- `NEXT_PUBLIC_ENV=homolog` sempre bloqueia o canal real e mantém a prévia.
- `NEXT_PUBLIC_ASAFLOW_CHAT_KEY` deixa de ser usada por esta caixa. Não se envia chave de API do CRM ao navegador.

Os valores públicos são incorporados no build: mudar variáveis requer nova compilação/deploy. O fluxo precisa ter seu link externo disponível. O script é carregado sem o atributo de chave do snippet, para evitar que o mesmo SDK inicialize também um segundo widget flutuante.

Se configuração, script, exportação do SDK ou resolução do fluxo não estiverem disponíveis, o site oferece os links para calculadora, diagnóstico e formulário. O carregamento tem limite de 12 segundos; uma resolução tardia válida pode exibir a mesma instância sem montar outra. Não há tentativa automática que reinicie a conversa.

## Layout e acessibilidade

A caixa mantém a marca em negativa, o aviso de assistente virtual e o link de privacidade. O fechamento também funciona com Escape e retorna o foco ao botão de origem, ou ao launcher quando o convite original já saiu da tela. No celular, o painel ocupa a tela e contém a navegação por Tab. As regras de posição do SDK são confinadas ao seu contêiner, para não cobrir o cabeçalho externo e seu botão de fechar.

A conversa permanece montada ao navegar entre páginas que compartilham o layout Next.js. Recarregar o documento ou sair do site cria outra montagem; a recuperação de histórico e a identidade do visitante nessa situação pertencem ao AsaFlow.

## Atribuição e identidade: limite conhecido

Na versão pública do SDK inspecionada em 21/09/2026, a sessão standalone envia `visitorId` e os parâmetros UTM presentes ao iniciar a conversa. Ela não envia os mesmos campos `pageUrl`, `referrer` e `device` do modo flutuante. Portanto, não se deve afirmar que este caminho preserva a atribuição por página ou todo o contexto de origem do widget anterior.

O identificador anônimo usa o armazenamento do navegador administrado pelo SDK. Ele não comprova a identidade de uma pessoa e pode ser reutilizado em um dispositivo compartilhado. O site não copia cadastro do formulário, não chama `identify` e não modifica os dados de um contato para testar a integração. A confirmação de identidade necessária ao checkout permanece no fluxo autenticado da Rook.

## Verificação antes de ativar

1. Com a flag desligada e em homolog, confirmar ausência de script/sessão real.
2. Com fixture do SDK, abrir, fechar, reabrir e receber resposta enquanto a caixa está oculta. Confirmar uma única montagem, mesmas mensagens/rascunho e campo no estado atual.
3. Repetir em desktop e celular, com Escape, botão externo e CTAs do site. Confirmar cabeçalho e fechamento acessíveis.
4. Simular script indisponível e erro de resolução; confirmar alternativa com formulário/ferramentas e ausência de reinício em loop.
5. Depois do deploy autorizado, conferir o fluxo público correto e a conversa real em sessão isolada. Testes com fixture não comprovam atendimento da IA nem persistência no CRM.
