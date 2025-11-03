import { ArrowRight, TrendingDown, Zap, BarChart3 } from 'lucide-react'
import Container from '../ui/Container'
import Button from '../ui/Button'

const Hero = () => {
  return (
    <section className="relative bg-gradient-rook py-20 lg:py-32 overflow-hidden">
      {/* Hexagon Pattern Background */}
      <div className="absolute inset-0 bg-hexagon-pattern opacity-30"></div>
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-rook-dark/20 to-rook-dark/40"></div>
      
      <Container className="relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8 animate-fade-in">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-ocre/30">
              <Zap className="w-4 h-4 text-ocre" />
              <span className="text-sm font-light tracking-wide text-white uppercase">
                Inteligência Artificial para Gestão
              </span>
            </div>
            
            {/* Headline */}
            <h1 className="text-display-lg lg:text-display-xl font-display text-white leading-tight uppercase">
              Visão.{' '}
              <span className="text-ocre">
                Controle.
              </span>{' '}
              Estratégia.
            </h1>
            
            {/* Subheadline */}
            <p className="text-xl lg:text-2xl text-white/90 leading-relaxed font-light">
              Reduza custos, aumente lucros e tome decisões estratégicas baseadas em dados. 
              O Rook System usa IA para prever, alertar e orientar sua gestão de CMV.
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 py-6 border-t border-b border-white/20">
              <div>
                <div className="text-4xl font-bold text-ocre">40%</div>
                <div className="text-sm text-white/70 font-light uppercase tracking-wider">Redução CMV</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-ocre">3x</div>
                <div className="text-sm text-white/70 font-light uppercase tracking-wider">Mais Rápido</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-ocre">100%</div>
                <div className="text-sm text-white/70 font-light uppercase tracking-wider">Automático</div>
              </div>
            </div>
            
            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                variant="primary" 
                size="lg"
                href="https://app.rooksystem.com.br/registro"
                className="group bg-terracota hover:bg-terracota-dark text-white border-none"
              >
                Começar Grátis
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                href="#demo"
                className="border-white/30 text-white hover:bg-white/10"
              >
                Ver Demonstração
              </Button>
            </div>
            
            {/* Trust Badge */}
            <div className="flex items-center space-x-2 text-sm text-white/60 font-light">
              <svg className="w-5 h-5 text-floresta-light" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Sem cartão de crédito • Cancele quando quiser • Suporte em português</span>
            </div>
          </div>
          
          {/* Right Content - Dashboard Preview */}
          <div className="relative animate-slide-up" style={{ animationDelay: '0.2s' }}>
            {/* Floating Cards */}
            <div className="relative">
              {/* Main Dashboard Card */}
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-rook-xl p-6 border border-rook-light/20">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-rook uppercase tracking-wide">Dashboard CMV</h3>
                  <span className="px-3 py-1 bg-floresta/10 text-floresta rounded-full text-sm font-medium">
                    Em tempo real
                  </span>
                </div>
                
                {/* CMV Indicator */}
                <div className="mb-6">
                  <div className="flex items-baseline space-x-2 mb-2">
                    <span className="text-5xl font-bold text-rook">32,5%</span>
                    <span className="text-floresta text-sm font-semibold flex items-center">
                      <TrendingDown className="w-4 h-4 mr-1" />
                      -8,3%
                    </span>
                  </div>
                  <p className="text-rook-dark/60 text-sm font-light">CMV Atual vs. Meta (40%)</p>
                  
                  {/* Progress Bar */}
                  <div className="mt-4 h-3 bg-neutral-200 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-rook-light to-rook rounded-full" style={{ width: '65%' }}></div>
                  </div>
                </div>
                
                {/* Mini Chart */}
                <div className="flex items-end justify-between h-24 space-x-2">
                  {[40, 55, 45, 60, 50, 65, 55, 70, 60, 75, 65, 80].map((height, i) => (
                    <div 
                      key={i}
                      className="flex-1 bg-gradient-to-t from-rook to-rook-light rounded-t opacity-70 hover:opacity-100 transition-opacity"
                      style={{ height: `${height}%` }}
                    ></div>
                  ))}
                </div>
              </div>
              
              {/* Floating Alert Card */}
              <div className="absolute -top-6 -right-6 bg-white/95 backdrop-blur-sm rounded-xl shadow-rook-lg p-4 border border-ocre/30 max-w-xs animate-pulse">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-ocre/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <BarChart3 className="w-5 h-5 text-ocre-dark" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-rook text-sm mb-1 uppercase tracking-wide">
                      Alerta Inteligente
                    </h4>
                    <p className="text-xs text-rook-dark/60 font-light">
                      Você pode economizar R$ 12.500 esta semana reduzindo compras em 15%
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Floating Success Card */}
              <div className="absolute -bottom-6 -left-6 bg-white/95 backdrop-blur-sm rounded-xl shadow-rook-lg p-4 border border-floresta/30">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-floresta/20 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-floresta" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-rook uppercase tracking-wide">Meta Atingida!</p>
                    <p className="text-xs text-rook-dark/60 font-light">CMV 7,5% abaixo do ideal</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}

export default Hero

