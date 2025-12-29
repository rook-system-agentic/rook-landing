/**
 * ROOK SYSTEM - Landing Page Animations
 * Scroll-triggered animations and interactions
 */

document.addEventListener('DOMContentLoaded', function() {
    
    // ============================================
    // 1. INTERSECTION OBSERVER FOR SCROLL ANIMATIONS
    // ============================================
    
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };
    
    const animationObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                // Optionally unobserve after animation
                // animationObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe all elements with animate-on-scroll class
    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        animationObserver.observe(el);
    });
    
    // ============================================
    // 2. HERO ANIMATIONS ON LOAD
    // ============================================
    
    const heroElements = document.querySelectorAll('.hero .animate-fade-in-up');
    heroElements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.animationDelay = `${index * 0.1}s`;
        setTimeout(() => {
            el.style.opacity = '';
        }, 100);
    });
    
    // ============================================
    // 3. COUNTER ANIMATION FOR STATS
    // ============================================
    
    function animateCounter(element, target, duration = 2000) {
        const start = 0;
        const increment = target / (duration / 16);
        let current = start;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                element.textContent = formatNumber(target);
                clearInterval(timer);
            } else {
                element.textContent = formatNumber(Math.floor(current));
            }
        }, 16);
    }
    
    function formatNumber(num) {
        if (num >= 1000) {
            return (num / 1000).toFixed(0) + ' MIL';
        }
        return num.toString();
    }
    
    // Observe stat numbers for counter animation
    const statNumbers = document.querySelectorAll('.stat-shock-number[data-count]');
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = parseInt(entry.target.dataset.count);
                animateCounter(entry.target, target);
                counterObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    statNumbers.forEach(el => counterObserver.observe(el));
    
    // ============================================
    // 4. SMOOTH SCROLL FOR ANCHOR LINKS
    // ============================================
    
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerOffset = 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // ============================================
    // 5. NAVBAR SCROLL EFFECT
    // ============================================
    
    const navbar = document.querySelector('.navbar');
    let lastScroll = 0;
    
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 100) {
            navbar.classList.add('navbar-scrolled');
        } else {
            navbar.classList.remove('navbar-scrolled');
        }
        
        lastScroll = currentScroll;
    });
    
    // ============================================
    // 6. CALCULATOR SLIDER INTERACTION
    // ============================================
    
    const cmvSlider = document.getElementById('cmvSlider');
    const cmvValue = document.getElementById('cmvSliderValue');
    
    if (cmvSlider && cmvValue) {
        cmvSlider.addEventListener('input', function() {
            const value = this.value;
            cmvValue.textContent = value + '%';
            
            // Update color based on value
            if (value <= 32) {
                cmvValue.style.color = 'var(--color-success)';
            } else if (value <= 36) {
                cmvValue.style.color = 'var(--color-accent)';
            } else {
                cmvValue.style.color = 'var(--color-danger)';
            }
        });
    }
    
    // ============================================
    // 7. PARALLAX EFFECT FOR HERO
    // ============================================
    
    const hero = document.querySelector('.hero');
    
    if (hero) {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const rate = scrolled * 0.3;
            
            if (scrolled < window.innerHeight) {
                hero.style.backgroundPositionY = rate + 'px';
            }
        });
    }
    
    // ============================================
    // 8. PRICING CARD HOVER EFFECTS
    // ============================================
    
    const pricingCards = document.querySelectorAll('.pricing-card');
    
    pricingCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            pricingCards.forEach(c => {
                if (c !== this) {
                    c.style.opacity = '0.7';
                    c.style.transform = 'scale(0.98)';
                }
            });
        });
        
        card.addEventListener('mouseleave', function() {
            pricingCards.forEach(c => {
                c.style.opacity = '';
                c.style.transform = '';
            });
        });
    });
    
    // ============================================
    // 9. FAQ ACCORDION ANIMATION
    // ============================================
    
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        
        if (question && answer) {
            question.addEventListener('click', () => {
                const isOpen = item.classList.contains('open');
                
                // Close all other items
                faqItems.forEach(otherItem => {
                    if (otherItem !== item) {
                        otherItem.classList.remove('open');
                        const otherAnswer = otherItem.querySelector('.faq-answer');
                        if (otherAnswer) {
                            otherAnswer.style.maxHeight = '0';
                        }
                    }
                });
                
                // Toggle current item
                if (isOpen) {
                    item.classList.remove('open');
                    answer.style.maxHeight = '0';
                } else {
                    item.classList.add('open');
                    answer.style.maxHeight = answer.scrollHeight + 'px';
                }
            });
        }
    });
    
    // ============================================
    // 10. BUTTON RIPPLE EFFECT
    // ============================================
    
    document.querySelectorAll('.btn-primary, .btn-secondary').forEach(button => {
        button.addEventListener('click', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const ripple = document.createElement('span');
            ripple.className = 'ripple';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            
            this.appendChild(ripple);
            
            setTimeout(() => ripple.remove(), 600);
        });
    });
    
    // Add ripple styles dynamically
    const rippleStyle = document.createElement('style');
    rippleStyle.textContent = `
        .btn-primary, .btn-secondary {
            position: relative;
            overflow: hidden;
        }
        .ripple {
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.4);
            transform: scale(0);
            animation: ripple-animation 0.6s linear;
            pointer-events: none;
        }
        @keyframes ripple-animation {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(rippleStyle);
    
    console.log('Rook System animations initialized');
});
