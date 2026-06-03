import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="pt-20 min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-display-xl text-gold font-bold">404</p>
        <h1 className="text-display-sm mt-4">Pagina nao encontrada</h1>
        <p className="text-body-lg text-rook-text-muted mt-4 max-w-md mx-auto">
          A pagina que voce procura nao existe ou foi movida.
        </p>
        <Link href="/" className="btn-primary mt-8">
          Voltar ao Inicio
        </Link>
      </div>
    </div>
  )
}
