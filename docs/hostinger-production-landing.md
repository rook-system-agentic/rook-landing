# Inventário da landing candidata a produção

- Repositório: `rook-system-agentic/rook-landing`.
- Fonte publicada na Vercel: commit `a7b1a939e39a4afd7a05cf15f0733fad74bf1651`.
- Destino: namespace `rook-production`, deployment e service `rook-lp`.
- Banco e APIs Supabase: cópia isolada em `supabase-production`.
- Exposição externa nesta fase: nenhuma.
- Homologação: `rook-lp` em `rook-homolog`, sem alterações.

O build consultou o CMS atual com a chave pública `anon` e gerou as seis rotas
de artigo existentes. O runtime foi validado contra a cópia: `source=live`, três
posts remotos e seis posts servidos após a união com a semente local.

A Vercel guarda a configuração completa do site publicado. Nesta máquina não há
sessão da CLI Vercel; o repositório usa a integração Vercel GitHub App. Por isso,
o candidato privado recebe as chaves do Supabase duplicado e segredos próprios.
`RESEND_API_KEY` fica como pré-requisito documentado para o cutover; o ID do GTM
já é versionado no código.

O deployment não agenda o cron descrito em `vercel.json`. Agendá-lo antes da
virada poderia publicar conteúdo ou disparar integrações a partir dos dois
ambientes ao mesmo tempo.

Durante o inventário, uma listagem do Kubernetes devolveu material codificado
dos Secrets do candidato. As credenciais da instância isolada foram todas
regeneradas, a senha foi sincronizada com os papéis internos do PostgreSQL e os
workloads foram reiniciados. Nenhuma credencial da produção atual ou da
homologação foi afetada.
