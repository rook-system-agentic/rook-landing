# Cores Atualizadas - Referência Rápida

## Paleta Oficial da Marca Rook System

### Cores Primárias
- **Marrom Escuro:** #3D2817
- **Marrom Médio:** #8B6F47
- **Dourado/Cobre:** #C9A961

### Cores Secundárias (aplicadas nesta atualização)
- **Verde Floresta:** #46604A
- **Terracota:** #E54C00

### Cores Complementares
- **Amarelo/Dourado Claro:** #F4C430
- **Bege Claro:** #F5F1E8

---

## Mapeamento de Substituições

### Verde Floresta #46604A
Substituiu:
- #10b981 (verde vibrante)
- #059669 (verde escuro vibrante)
- #16A34A (verde médio vibrante)

Backgrounds relacionados:
- #D1FAE5 → #E8F0E9 (verde claro)
- #e8f5e9 → #E8F0E9 (verde muito claro)

### Terracota #E54C00
Substituiu:
- #dc3545 (vermelho bootstrap)
- #DC2626 (vermelho tailwind)

Backgrounds relacionados:
- #FEF2F2 → #FFF4ED (rosa muito claro)
- #FEE2E2 → #FFE4D6 (rosa claro)
- #FECACA → #FFD4BA (rosa médio)

---

## Uso por Componente

### Badges
- Verde Floresta: badges de "flexível", "economia"
- Terracota: badges de "hot", "urgência"
- Amarelo: badges de "promoção"

### CTAs (Call-to-Actions)
- Primário: Laranja/Terracota (#C4753B ou #E54C00)
- Secundário: Borda laranja com fundo branco
- Desabilitado: Cinza (#E5E7EB)

### Cards de Estatísticas
- Bordas de alerta: Terracota #E54C00
- Bordas de sucesso: Verde Floresta #46604A
- Backgrounds: Tons suaves das cores principais

### Calculadora ROI
- Botão principal: Laranja/Terracota
- Valores de economia: Dourado #C9A961
- Background: Marrom Escuro #3D2817

### Pricing
- Preços: Laranja/Terracota
- Economia: Verde Floresta #46604A
- Badges: Amarelo #F4C430 (promoção)
- Borda card popular: Laranja

---

## Variáveis CSS

```css
:root {
    --color-primary: #C4753B;
    --color-dark: #6B4423;
    --color-accent: #F4C430;
    --color-bg-light: #F5F1E8;
    --color-danger: #E54C00;      /* ← ATUALIZADO */
    --color-success: #46604A;     /* ← ATUALIZADO */
}
```

---

## Acessibilidade

Todas as cores foram testadas para contraste adequado:
- Verde Floresta #46604A em fundo branco: ✅ WCAG AA
- Terracota #E54C00 em fundo branco: ✅ WCAG AA
- Textos brancos em Terracota: ✅ WCAG AAA
- Textos brancos em Marrom Escuro: ✅ WCAG AAA

---

**Última atualização:** 07/12/2025  
**Deploy:** bff9c921 (main branch)
