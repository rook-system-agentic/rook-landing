/**
 * Decide se os scripts de rastreamento devem carregar.
 *
 * POR QUE ISTO EXISTE
 *
 * O Google Analytics e o Microsoft Clarity têm o ID FIXO no código, sem
 * variável de ambiente. O `.env.local.example` lista `NEXT_PUBLIC_GA_ID`, mas
 * nada lê essa variável — deixá-la vazia não desliga coisa alguma. O Clarity
 * tinha uma guarda por `NODE_ENV`, que não ajuda: a imagem de homologação roda
 * com `NODE_ENV=production`, como qualquer build de produção.
 *
 * Consequência, se ninguém tratasse: cada visita de revisão em homologação
 * viraria visitante real no Analytics e sessão gravada no Clarity, e as
 * conversões de anúncio ficariam contaminadas por tráfego interno.
 *
 * A REGRA, E POR QUE ELA É ASSIM
 *
 * O rastreamento fica LIGADO por padrão e só é desligado quando o ambiente se
 * declara `homolog`. O inverso — exigir uma variável para ligar — parece mais
 * seguro e não é: bastaria alguém esquecer de configurá-la na Vercel para a
 * produção parar de medir em silêncio, e ninguém percebe métrica que some.
 * Aqui, esquecer a variável mantém o comportamento de hoje.
 */
export function isTrackingEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ENV !== "homolog";
}
