#!/usr/bin/env python3
"""
Script para atualizar a seção de pricing no index.html
Substitui os 3 botões (Mensal, Anual Cartão, Anual PIX) por 2 abas (MENSAL, ANUAL)
"""

# Ler arquivo completo
with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Encontrar início e fim da seção pricing
start_marker = '    <!-- Pricing Section -->\n    <section class="pricing-section" id="precos">'
end_marker = '    <!-- FAQ Section -->'

start_index = content.find(start_marker)
end_index = content.find(end_marker)

if start_index == -1 or end_index == -1:
    print("ERRO: Marcadores não encontrados!")
    exit(1)

# Extrair partes antes e depois
before_pricing = content[:start_index]
after_pricing = content[end_index:]

# Nova seção de pricing
new_pricing_section = '''    <!-- Pricing Section - Nova Estrutura com 2 Abas -->
    <section class="pricing-section" id="precos">
        <div class="container">
            <h2 class="section-title">Escolha o plano ideal para seu restaurante</h2>
            <p class="section-description">
                Comece grátis e evolua conforme seu negócio cresce. Sem contratos, sem surpresas, cancele quando quiser.
            </p>

            <!-- Period Selector - APENAS 2 ABAS -->
            <div class="pricing-period-selector-v2">
                <button class="period-tab active" data-period="monthly">
                    MENSAL
                </button>
                <button class="period-tab" data-period="annual">
                    ANUAL
                    <span class="tab-badge">Economize!</span>
                </button>
            </div>

            <!-- CARDS MENSAIS (visíveis por padrão) -->
            <div class="pricing-grid" data-period-group="monthly">
                <!-- Freemium Plan -->
                <div class="pricing-card">
                    <div class="plan-header">
                        <h3 class="plan-name">FREEMIUM</h3>
                        <p class="plan-description">Ideal para conhecer o Rook e começar a controlar seu CMV</p>
                    </div>
                    
                    <div class="plan-price-container">
                        <span class="price-main">Grátis</span>
                        <span class="price-period">para sempre</span>
                    </div>

                    <ul class="plan-features">
                        <li>✓ Calculadora de CMV básica</li>
                        <li>✓ Até 30 cálculos por mês</li>
                        <li>✓ Visualização de CMV</li>
                        <li>✓ Limite de compra semanal</li>
                        <li>✓ 1 usuário</li>
                        <li>✓ Suporte por email</li>
                    </ul>

                    <a href="https://app.vindi.com.br/customer/pages/8afb936c-7e52-495f-99e8-74d1b9bcb179/subscriptions/new" class="btn-plan btn-outline">Começar Grátis</a>
                </div>

                <!-- Basic Mensal Plan (Popular) -->
                <div class="pricing-card popular">
                    <div class="popular-badge">MAIS POPULAR</div>
                    <div class="promo-badge">PROMOÇÃO DE LANÇAMENTO</div>
                    
                    <div class="plan-header">
                        <h3 class="plan-name">BASIC</h3>
                        <p class="plan-description">Para pequenos restaurantes que querem resultados reais</p>
                    </div>
                    
                    <div class="plan-price-container">
                        <span class="price-old">R$ 179,90</span>
                        <div class="price-wrapper">
                            <span class="price-main">R$ 99</span>
                            <span class="price-period">/mês</span>
                        </div>
                        <p class="price-savings">Economize R$ 80,90 por mês! 🎉</p>
                    </div>

                    <ul class="plan-features">
                        <li>✓ Calculadora de CMV avançada</li>
                        <li>✓ Cálculos ilimitados</li>
                        <li>✓ Histórico completo de cálculos</li>
                        <li>✓ Projeções de 12 meses</li>
                        <li>✓ Dashboard completo</li>
                        <li>✓ Até 3 usuários</li>
                        <li>✓ Suporte por email e chat</li>
                        <li>✓ Relatórios personalizados</li>
                    </ul>

                    <a href="https://app.vindi.com.br/customer/pages/264b6510-effd-4a62-a8fb-29f0f086ce24/subscriptions/new" class="btn-plan btn-primary">Assinar Basic</a>
                </div>

                <!-- Business Plan (Coming Soon) -->
                <div class="pricing-card disabled">
                    <div class="coming-soon-badge">EM BREVE</div>
                    
                    <div class="plan-header">
                        <h3 class="plan-name">BUSINESS</h3>
                        <p class="plan-description">Para restaurantes com ERP que querem automação total</p>
                    </div>
                    
                    <div class="plan-price-container">
                        <span class="price-main">Em breve</span>
                    </div>

                    <ul class="plan-features">
                        <li>✓ Tudo do Basic</li>
                        <li>✓ Integração ERP automática</li>
                        <li>✓ Leitura automática de dados</li>
                        <li>✓ CMV com IA preditiva</li>
                        <li>✓ Produtos mais vendidos</li>
                        <li>✓ Curva ABC avançada</li>
                        <li>✓ Projeções de 24 meses</li>
                        <li>✓ Dashboard premium</li>
                        <li>✓ Até 10 usuários</li>
                        <li>✓ Suporte prioritário</li>
                    </ul>

                    <button class="btn-plan btn-disabled" disabled>Avise-me Quando Disponível</button>
                </div>
            </div>

            <!-- CARDS ANUAIS (ocultos inicialmente) -->
            <div class="pricing-grid hidden" data-period-group="annual">
                <!-- Freemium Plan (mesmo card) -->
                <div class="pricing-card">
                    <div class="plan-header">
                        <h3 class="plan-name">FREEMIUM</h3>
                        <p class="plan-description">Ideal para conhecer o Rook e começar a controlar seu CMV</p>
                    </div>
                    
                    <div class="plan-price-container">
                        <span class="price-main">Grátis</span>
                        <span class="price-period">para sempre</span>
                    </div>

                    <ul class="plan-features">
                        <li>✓ Calculadora de CMV básica</li>
                        <li>✓ Até 30 cálculos por mês</li>
                        <li>✓ Visualização de CMV</li>
                        <li>✓ Limite de compra semanal</li>
                        <li>✓ 1 usuário</li>
                        <li>✓ Suporte por email</li>
                    </ul>

                    <a href="https://app.vindi.com.br/customer/pages/8afb936c-7e52-495f-99e8-74d1b9bcb179/subscriptions/new" class="btn-plan btn-outline">Começar Grátis</a>
                </div>

                <!-- Basic Anual Cartão -->
                <div class="pricing-card">
                    <div class="discount-badge blue">25% OFF</div>
                    
                    <div class="plan-header">
                        <h3 class="plan-name">BASIC</h3>
                        <p class="plan-description">Renovação automática no cartão</p>
                    </div>
                    
                    <div class="plan-price-container">
                        <span class="price-old">R$ 1.188,00</span>
                        <div class="price-wrapper">
                            <span class="price-main">R$ 891</span>
                            <span class="price-period">/ano</span>
                        </div>
                        <p class="price-savings">Economize R$ 297,00/ano</p>
                        <p class="price-equivalent">Equivale a R$ 74,25/mês</p>
                    </div>

                    <ul class="plan-features">
                        <li>✓ Calculadora de CMV avançada</li>
                        <li>✓ Cálculos ilimitados</li>
                        <li>✓ Histórico completo de cálculos</li>
                        <li>✓ Projeções de 12 meses</li>
                        <li>✓ Dashboard completo</li>
                        <li>✓ Até 3 usuários</li>
                        <li>✓ Suporte por email e chat</li>
                        <li>✓ Relatórios personalizados</li>
                    </ul>

                    <a href="https://app.vindi.com.br/customer/pages/a4d7bad7-1de5-41ea-8a6b-3c2ca58eecdd/subscriptions/new" class="btn-plan btn-primary">Assinar Basic</a>
                </div>

                <!-- Basic Anual PIX (Destaque) -->
                <div class="pricing-card popular pix-highlight">
                    <div class="discount-badge green">30% OFF - PIX 🔥</div>
                    
                    <div class="plan-header">
                        <h3 class="plan-name">BASIC</h3>
                        <p class="plan-description">Pagamento à vista via PIX</p>
                    </div>
                    
                    <div class="plan-price-container">
                        <span class="price-old">R$ 1.188,00</span>
                        <div class="price-wrapper">
                            <span class="price-main">R$ 831,60</span>
                            <span class="price-period">/ano</span>
                        </div>
                        <p class="price-savings highlight">Economize R$ 356,40/ano 🔥</p>
                        <p class="price-equivalent">Equivale a R$ 69,30/mês</p>
                    </div>

                    <ul class="plan-features">
                        <li>✓ Calculadora de CMV avançada</li>
                        <li>✓ Cálculos ilimitados</li>
                        <li>✓ Histórico completo de cálculos</li>
                        <li>✓ Projeções de 12 meses</li>
                        <li>✓ Dashboard completo</li>
                        <li>✓ Até 3 usuários</li>
                        <li>✓ Suporte por email e chat</li>
                        <li>✓ Relatórios personalizados</li>
                    </ul>

                    <a href="https://app.vindi.com.br/customer/pages/8b3c5d2a-9c5f-4bd2-ac63-37a2c4d25afb/subscriptions/new" class="btn-plan btn-primary btn-pix">Pagar com PIX</a>
                </div>

                <!-- Business Plan (Coming Soon) -->
                <div class="pricing-card disabled">
                    <div class="coming-soon-badge">EM BREVE</div>
                    
                    <div class="plan-header">
                        <h3 class="plan-name">BUSINESS</h3>
                        <p class="plan-description">Para restaurantes com ERP que querem automação total</p>
                    </div>
                    
                    <div class="plan-price-container">
                        <span class="price-main">Em breve</span>
                    </div>

                    <ul class="plan-features">
                        <li>✓ Tudo do Basic</li>
                        <li>✓ Integração ERP automática</li>
                        <li>✓ Leitura automática de dados</li>
                        <li>✓ CMV com IA preditiva</li>
                        <li>✓ Produtos mais vendidos</li>
                        <li>✓ Curva ABC avançada</li>
                        <li>✓ Projeções de 24 meses</li>
                        <li>✓ Dashboard premium</li>
                        <li>✓ Até 10 usuários</li>
                        <li>✓ Suporte prioritário</li>
                    </ul>

                    <button class="btn-plan btn-disabled" disabled>Avise-me Quando Disponível</button>
                </div>
            </div>

            <p class="pricing-note">
                Todos os planos incluem <strong>7 dias de garantia</strong> sem necessidade de cartão de crédito.
            </p>
        </div>
    </section>

    <!-- JavaScript for Period Switching - Nova Lógica -->
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            const periodTabs = document.querySelectorAll('.period-tab');
            const pricingGrids = document.querySelectorAll('.pricing-grid[data-period-group]');

            periodTabs.forEach(tab => {
                tab.addEventListener('click', function() {
                    const selectedPeriod = this.dataset.period;
                    
                    // Update active tab
                    periodTabs.forEach(t => t.classList.remove('active'));
                    this.classList.add('active');
                    
                    // Show/hide pricing grids
                    pricingGrids.forEach(grid => {
                        if (grid.dataset.periodGroup === selectedPeriod) {
                            grid.classList.remove('hidden');
                        } else {
                            grid.classList.add('hidden');
                        }
                    });
                });
            });
        });
    </script>

    '''

# Montar novo conteúdo
new_content = before_pricing + new_pricing_section + after_pricing

# Salvar novo arquivo
with open('index.html', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("✅ Seção de pricing atualizada com sucesso!")
print("📊 Nova estrutura: 2 abas (MENSAL e ANUAL)")
print("📦 Cards: Freemium + Basic + Business (mensal: 3 cards, anual: 4 cards)")
