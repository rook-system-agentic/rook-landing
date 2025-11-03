# Rook System - Landing Page

Landing page estática do Rook System, separada do aplicativo Next.js.

## Estrutura

```
/
├── index.html          # Página principal
├── css/
│   └── styles.css      # Estilos CSS
├── js/
│   └── main.js         # JavaScript para interatividade
└── images/
    └── logo-horizontal.png # Logo do Rook
```

## Deploy

Esta landing page deve ser deployada em:
- **Domínio principal:** `rooksystem.com.br` ou `www.rooksystem.com.br`
- **Aplicação:** `app.rooksystem.com.br`

### Opções de Deploy

1. **Vercel** (Recomendado)
   ```bash
   vercel --prod
   ```

2. **Netlify**
   ```bash
   netlify deploy --prod
   ```

3. **GitHub Pages**
   - Fazer push para repositório
   - Configurar GitHub Pages para servir da branch main

## Links

Todos os links de CTA redirecionam para o aplicativo:
- Registro: `https://app.rooksystem.com.br/registro`
- Login: `https://app.rooksystem.com.br/login`
- Plano Basic: `https://app.rooksystem.com.br/registro?plan=basic`

## Desenvolvimento Local

Para testar localmente, use qualquer servidor HTTP:

```bash
# Python
python3 -m http.server 8000

# Node.js
npx http-server

# PHP
php -S localhost:8000
```

Acesse: `http://localhost:8000`
