// Smooth scroll para links âncora
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Adicionar classe active na navegação ao rolar
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.boxShadow = 'none';
    }
});

// Analytics tracking (se necessário)
function trackEvent(category, action, label) {
    if (typeof gtag !== 'undefined') {
        gtag('event', action, {
            'event_category': category,
            'event_label': label
        });
    }
}

// Track CTA clicks
document.querySelectorAll('a[href*="registro"]').forEach(button => {
    button.addEventListener('click', () => {
        trackEvent('CTA', 'click', 'Começar Grátis');
    });
});

// ===================================
// SCROLL ANIMATIONS
// ===================================
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-on-scroll');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observar elementos para animar
document.addEventListener('DOMContentLoaded', () => {
    // Animar cards de features
    document.querySelectorAll('.feature-card').forEach((card, index) => {
        card.classList.add(`animate-delay-${(index % 4) + 1}`);
        observer.observe(card);
    });
    
    // Animar cards de problemas
    document.querySelectorAll('.problem-card').forEach((card, index) => {
        card.classList.add(`animate-delay-${(index % 4) + 1}`);
        observer.observe(card);
    });
    
    // Animar cards de pricing
    document.querySelectorAll('.pricing-card').forEach((card, index) => {
        card.classList.add(`animate-delay-${(index % 3) + 1}`);
        observer.observe(card);
    });
    
    // Animar seção de origem
    const originText = document.querySelector('.origin-text');
    const originImage = document.querySelector('.origin-image');
    if (originText) observer.observe(originText);
    if (originImage) observer.observe(originImage);
    
    // Animar stats
    document.querySelectorAll('.stat-card').forEach((card, index) => {
        card.classList.add(`animate-delay-${index + 1}`);
        observer.observe(card);
    });
});

// ========================================
// CALCULATOR FUNCTION
// ========================================

function calculateSavings() {
    const revenue = parseFloat(document.getElementById('revenue').value);
    const currentCMV = parseFloat(document.getElementById('cmv').value);
    
    // Validação
    if (!revenue || revenue <= 0) {
        alert('Por favor, insira um faturamento mensal válido');
        return;
    }
    
    if (!currentCMV || currentCMV <= 0 || currentCMV > 100) {
        alert('Por favor, insira um CMV válido (entre 1% e 100%)');
        return;
    }
    
    // CMV ideal baseado no faturamento
    let idealCMV = 30;
    if (revenue >= 500000) {
        idealCMV = 32; // Restaurantes maiores podem ter CMV um pouco maior
    } else if (revenue >= 200000) {
        idealCMV = 30;
    } else {
        idealCMV = 28; // Pequenos precisam CMV mais baixo
    }
    
    // Se o CMV atual já está abaixo do ideal, ajustar
    if (currentCMV <= idealCMV) {
        alert(`Parabéns! Seu CMV de ${currentCMV}% já está dentro ou abaixo da meta ideal de ${idealCMV}%. Continue assim! 🎉`);
        return;
    }
    
    // Cálculos
    const cmvDifference = (currentCMV - idealCMV) / 100;
    const monthlySavings = revenue * cmvDifference;
    const annualSavings = monthlySavings * 12;
    
    // ROI (Rook Knight custa R$ 99/mês = R$ 1.188/ano)
    const rookAnnualCost = 1188;
    const roi = (annualSavings / rookAnnualCost).toFixed(1);
    
    // Atualizar valores na tela
    document.getElementById('currentCMV').textContent = currentCMV;
    document.getElementById('idealCMV').textContent = idealCMV;
    document.getElementById('savingsMonth').textContent = monthlySavings.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2});
    document.getElementById('savingsYear').textContent = annualSavings.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2});
    document.getElementById('roi').textContent = roi;
    
    // Mostrar resultado
    document.getElementById('calculatorResult').style.display = 'block';
    
    // Scroll suave até o resultado
    document.getElementById('calculatorResult').scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// ========================================
// NEWSLETTER SUBMISSION
// ========================================

async function submitNewsletter(event) {
    event.preventDefault();
    
    const email = document.getElementById('newsletterEmail').value;
    const form = document.getElementById('newsletterForm');
    const button = form.querySelector('.btn-newsletter');
    
    // Desabilitar botão durante envio
    button.disabled = true;
    button.style.opacity = '0.6';
    
    try {
        // TODO: Substituir pela URL do webhook N8N quando configurado
        const webhookURL = 'https://n8n.rooksystem.com.br/webhook/newsletter';
        
        const response = await fetch(webhookURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email,
                source: 'landing_page_footer',
                timestamp: new Date().toISOString(),
                page_url: window.location.href
            })
        });
        
        if (response.ok) {
            // Sucesso
            form.innerHTML = `
                <div class="newsletter-success">
                    ✓ Inscrição realizada com sucesso! Verifique seu email.
                </div>
            `;
            
            // Track event
            trackEvent('Newsletter', 'subscribe', 'Footer');
        } else {
            throw new Error('Erro ao enviar');
        }
    } catch (error) {
        console.error('Erro ao enviar newsletter:', error);
        
        // Mostrar mensagem de erro
        const errorDiv = document.createElement('div');
        errorDiv.className = 'newsletter-error';
        errorDiv.textContent = 'Erro ao enviar. Tente novamente mais tarde.';
        form.appendChild(errorDiv);
        
        // Remover mensagem de erro após 5 segundos
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
        
        // Reabilitar botão
        button.disabled = false;
        button.style.opacity = '1';
    }
    
    return false;
}
