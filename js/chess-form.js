/**
 * Plano Chess - Formulário de Interesse
 * Rook System - Landing Page
 */

(function() {
    'use strict';

    // Configurações
    const SUPABASE_URL = 'https://ezisuahknuspwchwflqq.supabase.co';
    const SUPABASE_ANON_KEY = 'sb_publishable_ihL0nXOhXtTH_kbI1_DOhQ_HfZT0Oig';

    // Elementos do DOM
    let modal, overlay, form, submitBtn, errorDiv, successDiv, formContent;

    // Inicialização
    document.addEventListener('DOMContentLoaded', function() {
        initElements();
        bindEvents();
    });

    function initElements() {
        modal = document.getElementById('chessModal');
        overlay = document.querySelector('.chess-modal-overlay');
        form = document.getElementById('chessForm');
        submitBtn = document.getElementById('chessSubmitBtn');
        errorDiv = document.getElementById('chessFormError');
        successDiv = document.getElementById('chessModalSuccess');
        formContent = document.getElementById('chessFormContent');
    }

    function bindEvents() {
        // Botões para abrir o modal
        const openButtons = document.querySelectorAll('[data-chess-modal]');
        openButtons.forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                openModal();
            });
        });

        // Fechar modal
        const closeButtons = document.querySelectorAll('[data-chess-close]');
        closeButtons.forEach(btn => {
            btn.addEventListener('click', closeModal);
        });

        // Fechar ao clicar fora
        if (overlay) {
            overlay.addEventListener('click', function(e) {
                if (e.target === overlay) {
                    closeModal();
                }
            });
        }

        // Fechar com ESC
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && overlay && overlay.classList.contains('active')) {
                closeModal();
            }
        });

        // Submit do formulário
        if (form) {
            form.addEventListener('submit', handleSubmit);
        }

        // Máscara de telefone
        const phoneInput = document.getElementById('chessPhone');
        if (phoneInput) {
            phoneInput.addEventListener('input', formatPhone);
        }
    }

    function openModal() {
        if (overlay) {
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            // Reset form state
            if (form) form.reset();
            if (errorDiv) errorDiv.classList.remove('show');
            if (successDiv) successDiv.style.display = 'none';
            if (formContent) formContent.style.display = 'block';
            
            // Track GA4 event
            if (typeof gtag === 'function') {
                gtag('event', 'chess_modal_opened', {
                    'event_category': 'engagement',
                    'event_label': 'Plano Chess Modal'
                });
            }
        }
    }

    function closeModal() {
        if (overlay) {
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    function formatPhone(e) {
        let value = e.target.value.replace(/\D/g, '');
        
        if (value.length > 11) {
            value = value.slice(0, 11);
        }
        
        if (value.length > 0) {
            if (value.length <= 2) {
                value = '(' + value;
            } else if (value.length <= 7) {
                value = '(' + value.slice(0, 2) + ') ' + value.slice(2);
            } else {
                value = '(' + value.slice(0, 2) + ') ' + value.slice(2, 7) + '-' + value.slice(7);
            }
        }
        
        e.target.value = value;
    }

    async function handleSubmit(e) {
        e.preventDefault();
        
        // Validação
        const nome = document.getElementById('chessNome').value.trim();
        const email = document.getElementById('chessEmail').value.trim();
        const telefone = document.getElementById('chessPhone').value.trim();
        const quantidade = document.getElementById('chessQuantidade').value;
        const mensagem = document.getElementById('chessMensagem').value.trim();
        const lgpdAceito = document.getElementById('chessLgpd').checked;

        // Validações
        if (!nome || !email || !telefone || !quantidade) {
            showError('Por favor, preencha todos os campos obrigatórios.');
            return;
        }

        if (!validateEmail(email)) {
            showError('Por favor, insira um email válido.');
            return;
        }

        if (!lgpdAceito) {
            showError('Você precisa concordar com a Política de Privacidade.');
            return;
        }

        // Desabilitar botão e mostrar loading
        setLoading(true);

        try {
            // Enviar para Supabase
            const response = await fetch(`${SUPABASE_URL}/rest/v1/leads_chess`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify({
                    nome: nome,
                    email: email,
                    telefone: telefone,
                    quantidade_restaurantes: parseInt(quantidade),
                    mensagem: mensagem || null,
                    lgpd_aceito: lgpdAceito,
                    status: 'novo'
                })
            });

            if (!response.ok) {
                throw new Error('Erro ao enviar formulário');
            }

            // Sucesso
            showSuccess();
            
            // Track GA4 event
            if (typeof gtag === 'function') {
                gtag('event', 'chess_lead_submitted', {
                    'event_category': 'conversion',
                    'event_label': 'Plano Chess Lead',
                    'value': parseInt(quantidade)
                });
            }

        } catch (error) {
            console.error('Erro:', error);
            showError('Ocorreu um erro ao enviar. Por favor, tente novamente ou entre em contato pelo email contato@rooksystem.com.br');
        } finally {
            setLoading(false);
        }
    }

    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    function showError(message) {
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.classList.add('show');
            errorDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }

    function hideError() {
        if (errorDiv) {
            errorDiv.classList.remove('show');
        }
    }

    function showSuccess() {
        hideError();
        if (formContent) formContent.style.display = 'none';
        if (successDiv) successDiv.style.display = 'block';
    }

    function setLoading(loading) {
        if (submitBtn) {
            submitBtn.disabled = loading;
            if (loading) {
                submitBtn.innerHTML = '<span class="chess-spinner"></span> Enviando...';
            } else {
                submitBtn.innerHTML = 'Enviar Interesse <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>';
            }
        }
    }

})();
