/**
 * Rook Insights Newsletter Modal
 * Captura de leads com triggers inteligentes
 */

(function() {
    'use strict';

    // Configurações
    const CONFIG = {
        scrollThreshold: 50, // Porcentagem da página
        exitIntentDelay: 2000, // ms antes de ativar exit-intent
        dismissDays: 7, // Dias para não mostrar após fechar
        subscribedKey: 'rook_newsletter_subscribed',
        dismissedKey: 'rook_newsletter_dismissed',
        apiUrl: 'https://app.rooksystem.com.br/api/newsletter/subscribe'
    };

    // Estado
    let modalShown = false;
    let exitIntentEnabled = false;

    // Verificar se deve mostrar o modal
    function shouldShowModal() {
        // Já inscrito
        if (localStorage.getItem(CONFIG.subscribedKey)) {
            return false;
        }

        // Dispensado recentemente
        const dismissed = localStorage.getItem(CONFIG.dismissedKey);
        if (dismissed) {
            const dismissedDate = new Date(parseInt(dismissed));
            const daysSinceDismissed = (Date.now() - dismissedDate) / (1000 * 60 * 60 * 24);
            if (daysSinceDismissed < CONFIG.dismissDays) {
                return false;
            }
        }

        return true;
    }

    // Criar HTML do modal
    function createModal() {
        const modal = document.createElement('div');
        modal.id = 'newsletterModal';
        modal.className = 'newsletter-overlay';
        modal.innerHTML = `
            <div class="newsletter-modal">
                <div class="newsletter-header">
                    <button class="newsletter-close" aria-label="Fechar">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M18 6L6 18M6 6l12 12"/>
                        </svg>
                    </button>
                    <div class="newsletter-badge">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 2L15 8L22 9L17 14L18 21L12 18L6 21L7 14L2 9L9 8L12 2Z"/>
                        </svg>
                        Rook Insights
                    </div>
                    <h2 class="newsletter-title">Insights exclusivos para gestores</h2>
                    <p class="newsletter-subtitle">Receba dicas práticas para melhorar seu CMV toda semana</p>
                </div>
                
                <div class="newsletter-content">
                    <div id="newsletterFormContainer">
                        <ul class="newsletter-benefits">
                            <li>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                                    <polyline points="22 4 12 14.01 9 11.01"/>
                                </svg>
                                <span>Estratégias comprovadas de redução de custos</span>
                            </li>
                            <li>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                                    <polyline points="22 4 12 14.01 9 11.01"/>
                                </svg>
                                <span>Benchmarks do setor de restaurantes</span>
                            </li>
                            <li>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                                    <polyline points="22 4 12 14.01 9 11.01"/>
                                </svg>
                                <span>Dicas de negociação com fornecedores</span>
                            </li>
                        </ul>
                        
                        <form id="newsletterForm" class="newsletter-form">
                            <input 
                                type="text" 
                                name="name" 
                                placeholder="Seu nome" 
                                class="newsletter-input"
                                required
                            >
                            <input 
                                type="email" 
                                name="email" 
                                placeholder="Seu melhor email" 
                                class="newsletter-input"
                                required
                            >
                            <div class="newsletter-consent">
                                <input type="checkbox" id="newsletterConsent" name="consent" required>
                                <label for="newsletterConsent">
                                    Concordo em receber emails do Rook Insights e aceito a 
                                    <a href="legal/politica-de-privacidade.html" target="_blank">Política de Privacidade</a>
                                </label>
                            </div>
                            <button type="submit" class="newsletter-submit">
                                Quero Receber os Insights
                            </button>
                        </form>
                        
                        <div class="newsletter-footer">
                            <p>🔒 Seus dados estão seguros. Cancele quando quiser.</p>
                        </div>
                    </div>
                    
                    <div id="newsletterSuccess" class="newsletter-success" style="display: none;">
                        <div class="newsletter-success-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                                <polyline points="22 4 12 14.01 9 11.01"/>
                            </svg>
                        </div>
                        <h3>Bem-vindo ao Rook Insights!</h3>
                        <p>Você receberá nosso primeiro email em breve com dicas exclusivas.</p>
                        <button class="btn-primary" onclick="closeNewsletterModal()">
                            Continuar navegando
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Event listeners
        modal.querySelector('.newsletter-close').addEventListener('click', dismissModal);
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                dismissModal();
            }
        });
        
        modal.querySelector('#newsletterForm').addEventListener('submit', handleSubmit);
        
        return modal;
    }

    // Mostrar modal
    function showModal() {
        if (modalShown || !shouldShowModal()) return;
        
        modalShown = true;
        const modal = document.getElementById('newsletterModal') || createModal();
        
        // Pequeno delay para animação
        setTimeout(() => {
            modal.classList.add('active');
        }, 100);

        // Track no GA
        if (typeof gtag === 'function') {
            gtag('event', 'newsletter_modal_shown', {
                'event_category': 'Newsletter',
                'event_label': 'Modal Displayed'
            });
        }
    }

    // Fechar modal (dispensar)
    function dismissModal() {
        const modal = document.getElementById('newsletterModal');
        if (modal) {
            modal.classList.remove('active');
            localStorage.setItem(CONFIG.dismissedKey, Date.now().toString());
        }
    }

    // Fechar modal (após sucesso)
    window.closeNewsletterModal = function() {
        const modal = document.getElementById('newsletterModal');
        if (modal) {
            modal.classList.remove('active');
        }
    };

    // Enviar formulário
    async function handleSubmit(e) {
        e.preventDefault();
        
        const form = e.target;
        const submitBtn = form.querySelector('.newsletter-submit');
        const formData = new FormData(form);
        
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            consent: formData.get('consent') === 'on',
            source: 'landing_page'
        };

        // Validação
        if (!data.name || !data.email || !data.consent) {
            alert('Por favor, preencha todos os campos e aceite os termos.');
            return;
        }

        // Loading state
        submitBtn.disabled = true;
        submitBtn.textContent = 'Enviando...';

        try {
            const response = await fetch(CONFIG.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (response.ok && result.success) {
                // Sucesso
                localStorage.setItem(CONFIG.subscribedKey, 'true');
                
                document.getElementById('newsletterFormContainer').style.display = 'none';
                document.getElementById('newsletterSuccess').style.display = 'block';

                // Track no GA
                if (typeof gtag === 'function') {
                    gtag('event', 'newsletter_subscribed', {
                        'event_category': 'Newsletter',
                        'event_label': 'Subscription Success'
                    });
                }
            } else {
                throw new Error(result.error || 'Erro ao enviar');
            }
        } catch (error) {
            console.error('Erro na inscrição:', error);
            alert('Ocorreu um erro. Por favor, tente novamente.');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Quero Receber os Insights';
        }
    }

    // Trigger: Scroll 50%
    function handleScroll() {
        const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
        
        if (scrollPercent >= CONFIG.scrollThreshold) {
            showModal();
            window.removeEventListener('scroll', handleScroll);
        }
    }

    // Trigger: Exit Intent
    function handleMouseLeave(e) {
        if (e.clientY <= 0 && exitIntentEnabled) {
            showModal();
            document.removeEventListener('mouseleave', handleMouseLeave);
        }
    }

    // Inicializar
    function init() {
        if (!shouldShowModal()) return;

        // Scroll trigger
        window.addEventListener('scroll', handleScroll, { passive: true });

        // Exit intent trigger (com delay)
        setTimeout(() => {
            exitIntentEnabled = true;
            document.addEventListener('mouseleave', handleMouseLeave);
        }, CONFIG.exitIntentDelay);

        // Tecla ESC para fechar
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                dismissModal();
            }
        });
    }

    // Iniciar quando DOM estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
