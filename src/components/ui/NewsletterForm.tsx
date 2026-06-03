'use client'

import { useState } from 'react'

export function NewsletterForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return

    setStatus('loading')

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (res.ok) {
        setStatus('success')
        setMessage('Inscricao confirmada! Voce recebera nosso conteudo em breve.')
        setEmail('')
      } else {
        const data = await res.json()
        setStatus('error')
        setMessage(data.error || 'Erro ao cadastrar. Tente novamente.')
      }
    } catch {
      setStatus('error')
      setMessage('Erro de conexao. Tente novamente.')
    }
  }

  if (status === 'success') {
    return (
      <div className="p-6 bg-accent-green/10 border border-accent-green/30 rounded-rook text-center">
        <p className="text-body-md text-accent-green font-medium">{message}</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="seu@email.com"
        required
        className="flex-1 px-4 py-3 bg-rook-surface border border-rook-border rounded-rook text-rook-text placeholder:text-rook-text-dim focus:outline-none focus:border-gold transition-colors"
        aria-label="Seu email para newsletter"
      />
      <button
        type="submit"
        disabled={status === 'loading'}
        className="btn-primary whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {status === 'loading' ? 'Cadastrando...' : 'Quero Receber'}
      </button>
      {status === 'error' && (
        <p className="text-body-sm text-accent-red mt-2 sm:col-span-2">{message}</p>
      )}
    </form>
  )
}
