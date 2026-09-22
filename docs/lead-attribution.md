# Atribuição do formulário comercial

O formulário registra uma conversão `generate_lead` após receber sucesso explícito da API de aquisição. O evento passa por `track`, sem payload de perfil, diagnóstico ou UTMs. A prévia não envia o cadastro; homologação mantém o rastreamento desligado. O consentimento comercial continua obrigatório e a política de Consent Mode não foi alterada.

## Dados da visita no CRM

A primeira entrada do documento é capturada em memória e preservada durante a navegação pelo site. Um recarregamento inicia outra visita. Não há gravação de atribuição em cookies, localStorage ou sessionStorage.

São aceitos cinco rótulos de campanha (`utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`), o caminho estático conhecido de entrada e somente o hostname do referrer HTTP(S). A URL completa, query, fragmento, credenciais, `fbclid`, IDs de formulários nativos e dados do cadastro não entram nessa estrutura. Rotas de blog com slug desconhecido não são guardadas.

Esses parâmetros são informados pela visita, não comprovam origem paga. A validação descarta formatos evidentes de contato, documento, URL, controle, HTML ou credencial. Campanhas devem usar rótulos sem dados pessoais; a validação de texto não identifica toda informação pessoal possível.

O servidor revalida a estrutura e o produtor do relatório repete a validação antes de gravar. Campo inválido é descartado e seu nome pode constar em `omitted_fields`; ausência normal não é uma omissão. Isso não impede a criação de um lead válido.

## Contrato com ADM

Uma linha adicional no cabeçalho, antes da primeira linha vazia:

```text
Atribuição de captação v1: {"version":1,"source":"site_form","utm_source":"facebookads","utm_campaign":"[ES] - LEADS ROOK LP 21/09","landing_path":"/","referrer_host":"www.facebook.com"}
```

Ordem canônica: `version`, `source`, as cinco UTMs na ordem acima, `landing_path`, `referrer_host`, `omitted_fields`. Campos opcionais ausentes não são serializados. `source` é sempre `site_form`; não significa formulário nativo da Meta. Cada UTM admite até 200 caracteres; JSON até 1.800. O relatório completo admite 5.000 caracteres. Se a linha não couber inteira, é omitida e o diagnóstico permanece completo. Uma regressão que produza relatório base acima do teto falha antes de gravar contato; nunca trunca o cenário.

`omitted_fields`, quando presente, contém somente nomes dos sete campos opcionais, na mesma ordem, sem repetição. Nenhum valor recusado é conservado. Campos do cabeçalho do cadastro têm quebras de linha substituídas por espaço para impedir a injeção de outra linha formal.

## Validação

`tests/demo-section-conversion.test.mjs` executa o submit do componente e o `track` reais, com transporte simulado: sucesso, clique duplo, falha, retry, navegação, prévia, homologação e consentimento comercial. `tests/lead-attribution.test.mjs` valida normalização, limites, relatório e a fixture compartilhada com o ADM. A rota de aquisição é exercitada em `tests/acquisition-route.test.mjs`.

Esses testes não comprovam publicação do container GTM, recebimento real no GA4/Meta ou captura ao vivo no CRM. Essa conferência é uma etapa de publicação própria.
