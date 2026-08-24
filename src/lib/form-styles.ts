/**
 * O estilo dos campos de formulário do site.
 *
 * POR QUE ISTO EXISTE (24/08/2026)
 *
 * A modal de solicitação de integração nasceu usando a classe `input-base` —
 * que existe no repositório do PRODUTO (rook-system), e não aqui. Numa classe
 * inexistente o Tailwind não reclama e o build não quebra: o campo simplesmente
 * renderiza com o padrão do navegador, fundo branco, herdando o `text-cream` do
 * diálogo escuro. Texto quase branco sobre fundo branco — o visitante não
 * conseguia ler o que digitava, e nenhum teste pegou porque a estrutura do DOM
 * estava correta.
 *
 * A definição já existia dentro de `PlansCommercialExperience`. Agora mora
 * aqui, e os dois formulários leem do mesmo lugar: um estilo só, e uma classe
 * inventada a menos.
 *
 * A trava está em `tests/classes-de-componente.test.mjs`.
 */

/** Campo de texto, e-mail, telefone e select — em superfície escura. */
export const INPUT_CLASSNAME =
  "w-full rounded-lg border border-border bg-bg px-4 py-3 text-sm text-cream outline-none transition-colors placeholder:text-muted/70 focus:border-terracota focus:ring-2 focus:ring-terracota/20";
