import { Check, Zap, Sparkles, Crown } from 'lucide-react'
import Container from '../ui/Container'
import Button from '../ui/Button'

const Pricing = () => {
  const plans = [
    {
      name: 'Freemium',
      price: 'Grátis',
      period: 'para sempre',
      description: 'Ideal para conhecer o Rook e começar a controlar seu CMV',
      icon: Zap,
      features: [
        'Calculadora de CMV básica',
        'Histórico de 30 dias',
        'Gráficos de evolução',
        'Alertas por email',
        'Suporte por email'
      ],
      cta: 'Começar Grátis',
      href: 'https://app.rooksystem.com.br/planos',
      popular: false
    },
    {
      name: 'Basic',
      price: 'R$ 179,90',
      period: '/mês',
      description: 'Para pequenos restaurantes que querem resultados reais',
      icon: Sparkles,
      badge: 'MAIS POPULAR',
      features: [
        'Tudo do Freemium',
        'Histórico completo ilimitado',
        'Gráficos avançados de evolução',
        'Insights com IA',
        'Análise de tendências',
        'Relatórios mensais',
        'Suporte prioritário'
      ],
      cta: 'Escolher Basic',
      href: 'https://app.rooksystem.com.br/planos',
      popular: true
    },
    {
      name: 'Business',
      price: 'R$ 379,90',
      period: '/mês',
      description: 'Para restaurantes com ERP que querem automação total',
      icon: Crown,
      badge: 'RECOMENDADO',
      features: [
        'Tudo do Basic',
        'Integração ERP automática',
        'Omie, Colibri, Saipo, Teknisa',
        'Multi-unidade ilimitado',
        'Análise preditiva avançada',
        'Consultoria especializada',
        'Suporte 24/7 via WhatsApp',
        'Onboarding personalizado'
      ],
      cta: 'Escolher Business',
      href: 'https://app.rooksystem.com.br/planos',
      popular: false
    }
  ]
  
  return (
    <section id="precos" className="py-20 bg-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-hexagon-pattern opacity-5"></div>
      
      <Container className="relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-in">
          <div className="inline-flex items-center space-x-2 bg-ocre/10 px-4 py-2 rounded-full mb-6 border border-ocre/20">
            <Crown className="w-5 h-5 text-ocre-dark" />
            <span className="text-sm font-light text-ocre-dark uppercase tracking-wider">
              Planos e Preços
            </span>
          </div>
          
          <h2 className="text-display-md lg:text-display-lg font-display text-rook mb-6 uppercase">
            Escolha o plano ideal para{' '}
            <span className="text-ocre">
              seu restaurante
            </span>
          </h2>
          
          <p className="text-xl text-rook-dark/70 font-light">
            Comece grátis e evolua conforme seu negócio cresce. 
            Sem contratos, sem surpresas, cancele quando quiser.
          </p>
        </div>
        
        {/* Plans Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div 
              key={plan.name}
              className={`
                relative rounded-2xl p-8 transition-all duration-300
                ${plan.popular 
                  ? 'bg-gradient-rook shadow-rook-xl scale-105 border-2 border-ocre' 
                  : 'bg-white shadow-rook hover:shadow-rook-lg border border-rook-light/20'
                }
              `}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Badge */}
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="inline-block bg-ocre text-white px-4 py-1 rounded-full text-xs font-medium uppercase tracking-wider">
                    {plan.badge}
                  </span>
                </div>
              )}
              
              {/* Icon */}
              <div className={`
                w-14 h-14 rounded-xl flex items-center justify-center mb-6
                ${plan.popular ? 'bg-white/20' : 'bg-rook/10'}
              `}>
                <plan.icon className={`w-7 h-7 ${plan.popular ? 'text-white' : 'text-rook'}`} />
              </div>
              
              {/* Plan Name */}
              <h3 className={`
                text-2xl font-semibold mb-2 uppercase tracking-wide
                ${plan.popular ? 'text-white' : 'text-rook'}
              `}>
                {plan.name}
              </h3>
              
              {/* Description */}
              <p className={`
                text-sm mb-6 font-light
                ${plan.popular ? 'text-white/80' : 'text-rook-dark/60'}
              `}>
                {plan.description}
              </p>
              
              {/* Price */}
              <div className="mb-8">
                <div className="flex items-baseline">
                  <span className={`
                    text-5xl font-bold
                    ${plan.popular ? 'text-white' : 'text-rook'}
                  `}>
                    {plan.price}
                  </span>
                  <span className={`
                    ml-2 font-light
                    ${plan.popular ? 'text-white/70' : 'text-rook-dark/60'}
                  `}>
                    {plan.period}
                  </span>
                </div>
              </div>
              
              {/* Features */}
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start space-x-3">
                    <Check className={`
                      w-5 h-5 flex-shrink-0 mt-0.5
                      ${plan.popular ? 'text-ocre' : 'text-floresta'}
                    `} />
                    <span className={`
                      text-sm font-light
                      ${plan.popular ? 'text-white/90' : 'text-rook-dark/70'}
                    `}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
              
              {/* CTA */}
              <Button
                variant={plan.popular ? 'secondary' : 'primary'}
                size="lg"
                href={plan.href}
                className={`
                  w-full
                  ${plan.popular 
                    ? 'bg-white text-rook hover:bg-white/90' 
                    : 'bg-terracota text-white hover:bg-terracota-dark border-none'
                  }
                `}
              >
                {plan.cta}
              </Button>
            </div>
          ))}
        </div>
        
        {/* Bottom Note */}
        <div className="text-center mt-12">
          <p className="text-rook-dark/60 font-light">
            Todos os planos incluem <strong className="text-rook font-medium">14 dias de teste grátis</strong> sem necessidade de cartão de crédito.
          </p>
        </div>
      </Container>
    </section>
  )
}

export default Pricing

