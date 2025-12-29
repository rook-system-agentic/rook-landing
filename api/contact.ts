import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { name, email, restaurant, message } = req.body;

    // Validação básica
    if (!name || !email) {
      return res.status(400).json({ error: "Nome e email são obrigatórios" });
    }

    // Validação de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Email inválido" });
    }

    // Montar o email
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #C4A35A 0%, #8B5A2B 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">♜ Nova Solicitação via Landing</h1>
        </div>
        
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #3E2723; margin-top: 0;">Dados do Contato</h2>
          
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold; color: #666;">Nome:</td>
              <td style="padding: 10px; border-bottom: 1px solid #ddd; color: #333;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold; color: #666;">Email:</td>
              <td style="padding: 10px; border-bottom: 1px solid #ddd; color: #333;">
                <a href="mailto:${email}" style="color: #C4A35A;">${email}</a>
              </td>
            </tr>
            ${restaurant ? `
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold; color: #666;">Restaurante:</td>
              <td style="padding: 10px; border-bottom: 1px solid #ddd; color: #333;">${restaurant}</td>
            </tr>
            ` : ""}
            ${message ? `
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold; color: #666;">Mensagem:</td>
              <td style="padding: 10px; border-bottom: 1px solid #ddd; color: #333;">${message}</td>
            </tr>
            ` : ""}
          </table>
          
          <div style="margin-top: 30px; padding: 20px; background: #fff3cd; border-radius: 8px;">
            <p style="margin: 0; color: #856404;">
              <strong>⏰ Lembrete:</strong> Responder em até 24h conforme prometido na landing page.
            </p>
          </div>
        </div>
        
        <div style="padding: 20px; text-align: center; color: #666; font-size: 12px;">
          <p>Este email foi enviado automaticamente pelo formulário da landing page do Rook System.</p>
        </div>
      </div>
    `;

    // Enviar email via Resend
    const { data, error } = await resend.emails.send({
      from: "Rook System <contato@rooksystem.com.br>",
      to: ["contato@rooksystem.com.br"],
      replyTo: email,
      subject: `[Landing] Nova solicitação de ${name}${restaurant ? ` - ${restaurant}` : ""}`,
      html: emailContent,
    });

    if (error) {
      console.error("Erro ao enviar email:", error);
      return res.status(500).json({ error: "Erro ao enviar email" });
    }

    // Enviar email de confirmação para o usuário
    await resend.emails.send({
      from: "Rook System <contato@rooksystem.com.br>",
      to: [email],
      subject: "Recebemos sua mensagem! - Rook System",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #C4A35A 0%, #8B5A2B 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">♜ Rook System</h1>
          </div>
          
          <div style="padding: 30px;">
            <h2 style="color: #3E2723;">Olá, ${name}!</h2>
            
            <p style="color: #666; line-height: 1.6;">
              Recebemos sua mensagem e ficamos felizes com seu interesse no Rook System!
            </p>
            
            <p style="color: #666; line-height: 1.6;">
              Um de nossos especialistas entrará em contato em até <strong>24 horas</strong> para ajudar você a controlar melhor o CMV do seu restaurante.
            </p>
            
            <div style="margin: 30px 0; padding: 20px; background: #f5f5f5; border-radius: 8px;">
              <p style="margin: 0; color: #3E2723; font-weight: bold;">Enquanto isso, você pode:</p>
              <ul style="color: #666; margin-top: 10px;">
                <li>Testar nossa <a href="https://www.rooksystem.com.br/#calculadora" style="color: #C4A35A;">calculadora de economia</a></li>
                <li>Conhecer nossos <a href="https://www.rooksystem.com.br/#planos" style="color: #C4A35A;">planos e preços</a></li>
                <li>Criar sua conta gratuita no <a href="https://app.rooksystem.com.br/registro" style="color: #C4A35A;">plano Pawn</a></li>
              </ul>
            </div>
            
            <p style="color: #666; line-height: 1.6;">
              Atenciosamente,<br>
              <strong>Equipe Rook System</strong>
            </p>
          </div>
          
          <div style="padding: 20px; text-align: center; color: #999; font-size: 12px; border-top: 1px solid #eee;">
            <p>Rook System - Visão, Estratégia, Controle</p>
            <p>CNPJ: 51.629.346/0001-94 | CCGN LTDA</p>
          </div>
        </div>
      `,
    });

    return res.status(200).json({ success: true, id: data?.id });
  } catch (error) {
    console.error("Erro no handler:", error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
}
