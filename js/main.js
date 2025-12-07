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
