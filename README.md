# Rook System - Landing Page

Landing Page institucional e de vendas do Rook System, separada do sistema principal para máxima performance e flexibilidade de marketing.

---

## 🎯 Objetivo

Página de alta conversão para o roadshow de São Paulo, com foco em:
- Performance (carregamento <1s)
- SEO otimizado
- Impacto visual
- Clareza comercial

---

## 🏗️ Arquitetura

**Domínio:** rooksystem.com.br  
**App:** app.rooksystem.com.br  
**Stack:** React + Vite + Tailwind CSS

---

## ✅ O Que Foi Implementado

### Design System Unificado
- ✅ Cores idênticas ao sistema principal
- ✅ Tipografia (Trebuchet MS)
- ✅ Espaçamentos e tamanhos
- ✅ Gradientes e sombras
- ✅ Animações suaves

### Componentes Reutilizáveis
- ✅ Button (4 variantes, 4 tamanhos)
- ✅ Container (5 tamanhos)
- ✅ Navbar (desktop + mobile responsivo)
- ✅ Footer (completo com links e contato)

### Seções
- ✅ Hero (impacto visual alto)
  - Headline poderoso
  - Estatísticas (40%, 3x, 100%)
  - CTAs duplos
  - Dashboard preview animado
  - Cards flutuantes (alertas)

---

## 📊 Performance

| Métrica | Valor | Status |
|:--------|:------|:-------|
| **CSS** | 14kb (gzipped) | ✅ Excelente |
| **JS** | 64kb (gzipped) | ✅ Ótimo |
| **HTML** | 0.8kb | ✅ Perfeito |
| **First Load** | ~80kb | ✅ Muito bom |
| **PageSpeed** | 90+ (estimado) | ✅ Excelente |

---

## 🚀 Próximos Passos

### Fase 1: Seções Faltantes (2-3 dias)

1. **Problema → Solução**
   - "CMV alto está matando seu lucro?"
   - Como o Rook resolve

2. **Features Principais**
   - Cards com ícones
   - Calculadora automática
   - Inteligência preditiva
   - Insights com IA
   - Integrações ERP

3. **Prova Social**
   - Depoimentos
   - Cases de sucesso
   - Logos de clientes

4. **Planos e Preços**
   - Freemium, Basic, Business
   - Tabela comparativa
   - CTAs em cada plano

5. **FAQ**
   - Accordion com perguntas comuns
   - Segurança
   - Suporte

6. **CTA Final**
   - Formulário de contato
   - Newsletter

### Fase 2: Páginas Adicionais (1-2 dias)

- `/sobre` - Sobre o Rook
- `/precos` - Planos detalhados
- `/contato` - Formulário completo
- `/blog` - Estrutura para conteúdo
- `/termos` - Termos de uso
- `/privacidade` - Política de privacidade

### Fase 3: Integrações (1 dia)

- Google Analytics
- Hotjar (heatmaps)
- Facebook Pixel
- Google Tag Manager
- Formulários (integração com CRM)

### Fase 4: Deploy (1 dia)

- Configurar domínio rooksystem.com.br
- Deploy na Vercel
- Configurar SSL
- Testar em produção
- Configurar redirects

---

## 🛠️ Comandos

```bash
# Desenvolvimento
pnpm run dev --host

# Build
pnpm run build

# Preview do build
pnpm run preview --host
```

---

## 📁 Estrutura de Arquivos

```
rook-landing/
├── public/
├── src/
│   ├── assets/          # Imagens, ícones
│   ├── components/
│   │   ├── layout/      # Navbar, Footer
│   │   ├── sections/    # Hero, Features, etc.
│   │   └── ui/          # Button, Container, etc.
│   ├── App.jsx          # Página principal
│   ├── App.css          # Estilos globais
│   └── main.jsx         # Entry point
├── tailwind.config.js   # Design System
├── index.html           # HTML base
└── package.json
```

---

## 🎨 Design System

### Cores Principais

- **Rook Brown:** `#754A31` (marrom principal)
- **Rook Verde:** `#44604A` (verde institucional)
- **Rook Pingado:** `#B07C4A` (tom secundário)

### Cores Semânticas

- **Success:** `#16A34A` (verde sucesso)
- **Warning:** `#F59E0B` (amarelo aviso)
- **Error:** `#DC2626` (vermelho erro)
- **Info:** `#2563EB` (azul informação)

### Tipografia

- **Font:** Trebuchet MS, Inter, system-ui
- **Tamanhos:** xs (12px) → 7xl (72px)

### Gradientes

- `gradient-rook`: Marrom → Pingado
- `gradient-success`: Verde escuro → Verde claro
- `gradient-hero`: Hero section

---

## 🔗 Links Importantes

- **Sistema:** https://app.rooksystem.com.br
- **Login:** https://app.rooksystem.com.br/login
- **Registro:** https://app.rooksystem.com.br/registro

---

## 📝 Notas Técnicas

### Por Que Separada?

1. **Performance:** LP super leve (<100kb)
2. **SEO:** Otimização específica para marketing
3. **Flexibilidade:** Atualizar sem risco
4. **Escalabilidade:** Suporta milhões de visitas

### Integração com Sistema

- Botões redirecionam para `app.rooksystem.com.br`
- Autenticação mantida via cookies de domínio
- Design System 100% compatível

---

**Versão:** 1.0  
**Última atualização:** 16 de outubro de 2025  
**Mantido por:** Equipe Rook System

hero placeholder 1761345187
