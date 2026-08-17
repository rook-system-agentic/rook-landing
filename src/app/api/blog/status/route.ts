import { NextResponse } from "next/server";
import { getBlogSourceStatus } from "@/lib/blog";

// ROO-1116 — critério 2: responder "o blog está servindo dado fresco ou
// fallback?" sem abrir o código.
//
//   curl -sS https://rook.com.br/api/blog/status
//   {"source":"fallback","degraded":true,"reason":"HTTP 404", ...}
//
// `dynamic = "force-dynamic"` de propósito: as outras rotas do blog usam
// `revalidate = 60` porque servem conteúdo, e conteúdo pode ser velho. Um
// diagnóstico velho não diagnostica nada — ele diria "está tudo bem" um minuto
// depois de a origem cair, que é o problema que esta issue existe para
// resolver. O `fetch` do Supabase por baixo continua com o mesmo cache de 60s
// da página, então esta rota reporta o estado que a página está servindo, não
// um estado inventado por uma consulta paralela.
export const dynamic = "force-dynamic";

// Público de propósito: não devolve URL, chave, nome de tabela nem corpo de
// erro do PostgREST — só o estado e um motivo curto ("HTTP 404", "falha de
// rede"). O detalhe do erro fica no log do servidor. Um segredo aqui exigiria
// que qualquer pessoa do time tivesse a variável em mãos para responder uma
// pergunta operacional simples, e na prática ninguém consultaria.
export async function GET() {
  const status = await getBlogSourceStatus();

  return NextResponse.json(status, {
    // `503` quando degradado para que monitoramento externo enxergue sem
    // precisar entender o corpo: basta apontar um check HTTP para esta URL.
    status: status.degraded ? 503 : 200,
    headers: {
      "x-rook-blog-source": status.source,
      "Cache-Control": "no-store",
    },
  });
}
