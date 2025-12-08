# Configuração do Webhook N8N para Newsletter

## 📋 Objetivo

Capturar inscrições de newsletter da landing page e automatizar o envio de emails de boas-vindas e sequência de nurturing.

---

## 🔧 Setup N8N

### 1. Criar Workflow no N8N

**Nome:** `Newsletter Landing Page`

**Nodes:**

```
1. Webhook (Trigger)
   ↓
2. Supabase (Insert Lead)
   ↓
3. Email (Boas-vindas)
   ↓
4. Wait (3 dias)
   ↓
5. Email (Dica 1: O que é CMV?)
   ↓
6. Wait (3 dias)
   ↓
7. Email (Dica 2: 10 Erros Fatais no CMV)
   ↓
8. Wait (3 dias)
   ↓
9. Email (Convite para Trial)
```

---

### 2. Configurar Webhook (Node 1)

**Método:** POST  
**Caminho:** `/webhook/newsletter`  
**Autenticação:** Nenhuma (ou Basic Auth se preferir)

**Payload esperado:**
```json
{
  "email": "usuario@email.com",
  "source": "landing_page_footer",
  "timestamp": "2025-12-07T19:00:00.000Z",
  "page_url": "https://www.rooksystem.com.br"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Inscrição realizada com sucesso"
}
```

---

### 3. Configurar Supabase (Node 2)

**Tabela:** `newsletter_leads`

**Schema:**
```sql
CREATE TABLE newsletter_leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  source VARCHAR(100),
  subscribed_at TIMESTAMP DEFAULT NOW(),
  page_url TEXT,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_newsletter_email ON newsletter_leads(email);
CREATE INDEX idx_newsletter_status ON newsletter_leads(status);
```

**Insert:**
```json
{
  "email": "{{ $json.email }}",
  "source": "{{ $json.source }}",
  "page_url": "{{ $json.page_url }}",
  "subscribed_at": "{{ $json.timestamp }}"
}
```

---

### 4. Configurar Email de Boas-vindas (Node 3)

**Assunto:** "Bem-vindo ao Rook System! 🎯"

**Template:**
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #C4753B; color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; background: #f9f9f9; }
        .cta { background: #C4753B; color: white; padding: 15px 30px; text-decoration: none; display: inline-block; border-radius: 5px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Bem-vindo ao Rook System!</h1>
        </div>
        <div class="content">
            <p>Olá!</p>
            
            <p>Obrigado por se inscrever na nossa newsletter! 🎉</p>
            
            <p>Você acabou de dar o <strong>primeiro passo estratégico</strong> para dominar a gestão de CMV do seu restaurante.</p>
            
            <p><strong>O que você vai receber:</strong></p>
            <ul>
                <li>📊 Dicas práticas de gestão de CMV</li>
                <li>💡 Estratégias para reduzir custos</li>
                <li>🎯 Novidades e atualizações do Rook System</li>
                <li>🎁 Conteúdos exclusivos para assinantes</li>
            </ul>
            
            <p><strong>Próximo passo:</strong> Em 3 dias, você vai receber nossa primeira dica sobre CMV. Fique de olho na sua caixa de entrada!</p>
            
            <a href="https://www.rooksystem.com.br" class="cta">Conhecer o Rook System</a>
            
            <p>Até breve,<br><strong>Equipe Rook System</strong></p>
            
            <hr>
            
            <p style="font-size: 12px; color: #999;">
                Você está recebendo este email porque se inscreveu em www.rooksystem.com.br<br>
                <a href="#">Cancelar inscrição</a>
            </p>
        </div>
    </div>
</body>
</html>
```

---

### 5. Emails Subsequentes

**Email 2 (Dia 3): "O que é CMV e por que você PRECISA controlá-lo"**
- Explica conceito de CMV
- Mostra impacto de 1% de redução
- CTA: Calcular seu CMV

**Email 3 (Dia 6): "10 Erros Fatais no CMV que Fecham Restaurantes"**
- Lista 10 erros comuns
- Dá exemplos práticos
- CTA: Baixar checklist completo

**Email 4 (Dia 9): "Teste o Rook System Grátis por 7 Dias"**
- Convite para trial
- Benefícios do plano Knight
- CTA: Começar trial grátis

---

## 🔗 Atualizar URL no JavaScript

Após configurar o webhook no N8N, atualizar a URL no arquivo `/js/main.js`:

```javascript
const webhookURL = 'https://n8n.rooksystem.com.br/webhook/newsletter';
```

Substituir por sua URL real do N8N.

---

## 🧪 Testar

1. Acessar landing page
2. Preencher email no footer
3. Clicar em enviar
4. Verificar:
   - ✅ Email aparece no Supabase
   - ✅ Email de boas-vindas é recebido
   - ✅ Mensagem de sucesso aparece na página

---

## 📊 Métricas para Acompanhar

- Taxa de inscrição (conversão)
- Taxa de abertura dos emails
- Taxa de clique nos CTAs
- Taxa de conversão para trial
- Taxa de cancelamento (unsubscribe)

---

## 🔒 Segurança

- Validar email no backend (N8N)
- Implementar rate limiting
- Adicionar CAPTCHA se houver spam
- Usar HTTPS sempre
- Não expor dados sensíveis nos logs

---

## 📝 Notas

- Webhook está configurado para aceitar POST
- Payload é enviado em JSON
- Email é validado no frontend (HTML5)
- Mensagens de erro são tratadas graciosamente
- Track events são enviados para analytics
