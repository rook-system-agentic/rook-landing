import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Email inválido" }, { status: 400 });
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      // Fallback: just log if no API key configured
      console.log("[newsletter] New subscriber:", email);
      return NextResponse.json({ success: true });
    }

    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);

    await resend.emails.send({
      from: "Rook System <noreply@rooksystem.com.br>",
      to: email,
      subject: "Bem-vindo à newsletter Rook",
      html: `<p>Obrigado por se inscrever na newsletter da Rook System.</p><p>Em breve você receberá nossos artigos sobre gestão financeira para food service.</p>`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[newsletter] Error:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
