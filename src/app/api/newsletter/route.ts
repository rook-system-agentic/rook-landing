import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

function getResend() {
  const key = process.env.RESEND_API_KEY
  if (!key) throw new Error('RESEND_API_KEY not configured')
  return new Resend(key)
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Email invalido' }, { status: 400 })
    }

    const resend = getResend()

    // Send confirmation email to subscriber
    await resend.emails.send({
      from: 'Rook System <newsletter@rooksystem.com.br>',
      to: [email],
      subject: 'Bem-vindo a newsletter Rook!',
      html: `
        <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; background: #1a1410; color: #f5f0eb; padding: 40px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="color: #c4a35a; font-size: 24px; margin: 0;">Rook System</h1>
          </div>
          <h2 style="color: #f5f0eb; font-size: 20px;">Inscricao confirmada!</h2>
          <p style="color: #b8a99a; line-height: 1.7;">
            Voce agora faz parte da comunidade Rook. Recebera conteudo especializado em gestao financeira para restaurantes:
          </p>
          <ul style="color: #b8a99a; line-height: 2;">
            <li>Benchmarks de CMV por segmento</li>
            <li>Analises tributarias para food service</li>
            <li>Estrategias de otimizacao de compras</li>
            <li>Tendencias do mercado</li>
          </ul>
          <p style="color: #b8a99a; line-height: 1.7;">
            Sem spam. Apenas conteudo de valor, baseado em dados reais.
          </p>
          <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #4a3d32; text-align: center;">
            <p style="color: #8a7a6a; font-size: 12px;">
              Rook System — Visao, Estrategia, Controle<br>
              CCGN LTDA | CNPJ 51.629.346/0001-94
            </p>
          </div>
        </div>
      `,
    })

    // Notify team
    await resend.emails.send({
      from: 'Rook System <newsletter@rooksystem.com.br>',
      to: ['contato@rooksystem.com.br'],
      subject: `[Newsletter] Novo inscrito: ${email}`,
      html: `<p>Novo inscrito na newsletter: <strong>${email}</strong></p><p>Data: ${new Date().toISOString()}</p>`,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Newsletter error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
