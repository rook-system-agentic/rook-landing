import { useState } from "react";
import { Button } from "@/components/ui/button";
import CurrencyInput from "@/components/ui/currency-input";
import { Calculator, TrendingUp, AlertTriangle, ArrowRight, Target, Wallet, Sparkles } from "lucide-react";

const CalculatorSection = () => {
  const [faturamento, setFaturamento] = useState(100000);
  const [cmvAtual, setCmvAtual] = useState(38);
  const [calculated, setCalculated] = useState(false);

  // CMV ideal baseado no faturamento (mesma lógica da landing antiga)
  const getIdealCMV = (revenue: number) => {
    if (revenue >= 500000) {
      return 32; // Restaurantes maiores podem ter CMV um pouco maior
    } else if (revenue >= 200000) {
      return 30;
    } else {
      return 28; // Pequenos precisam CMV mais baixo
    }
  };

  const cmvIdeal = getIdealCMV(faturamento);
  const diferencaCMV = cmvAtual - cmvIdeal;
  const economiaMensal = (faturamento * diferencaCMV) / 100;
  const economiaAnual = economiaMensal * 12;
  
  // ROI (Rook Knight custa R$ 99/mês = R$ 1.188/ano)
  const rookAnnualCost = 1188;
  const roi = (economiaAnual / rookAnnualCost).toFixed(1);

  const handleCalculate = () => {
    setCalculated(true);
    // Scroll suave até o resultado
    setTimeout(() => {
      document.getElementById('calculator-result')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Handler para mudança no faturamento
  const handleFaturamentoChange = (value: number) => {
    setFaturamento(value);
    setCalculated(false);
  };

  const isGoodCMV = cmvAtual <= cmvIdeal;

  return (
    <section id="calculadora" className="py-24 relative bg-background">
      <div className="container">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="section-label mb-4 block">
            Calculadora
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-rook-cafe">
            Quanto você pode{" "}
            <span className="text-rook-marrom">economizar?</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Restaurantes com CMV acima de 36% perdem em média 11,84% de lucro.
            <br />Calcule o impacto real no seu negócio.
          </p>
        </div>

        {/* Calculator Card */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-card rounded-3xl p-8 md:p-12 border border-border shadow-lg">
            <div className="space-y-8">
              {/* Faturamento Input */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-3">
                  Qual seu faturamento mensal?
                </label>
                <CurrencyInput
                  value={faturamento}
                  onChange={handleFaturamentoChange}
                  placeholder="100.000,00"
                  min={0}
                />
              </div>

              {/* CMV Input */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-3">
                  Qual seu CMV atual (estimado)?
                </label>
                <div className="relative">
                  <input
                    type="range"
                    min="20"
                    max="60"
                    value={cmvAtual}
                    onChange={(e) => {
                      setCmvAtual(Number(e.target.value));
                      setCalculated(false);
                    }}
                    className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer"
                    style={{
                      accentColor: 'hsl(20, 43%, 33%)',
                    }}
                  />
                  <div className="flex justify-between mt-2">
                    <span className="text-sm text-muted-foreground">20%</span>
                    <span className={`text-2xl font-bold ${cmvAtual > 36 ? 'text-rook-terracota' : cmvAtual > 32 ? 'text-rook-marrom' : 'text-rook-verde'}`}>
                      {cmvAtual}%
                    </span>
                    <span className="text-sm text-muted-foreground">60%</span>
                  </div>
                  <p className="text-sm text-muted-foreground text-center mt-2">
                    Média do setor: 36% | Ideal: 28-32%
                  </p>
                </div>
              </div>

              {/* Calculate Button */}
              <Button
                variant="rook"
                size="xl"
                className="w-full"
                onClick={handleCalculate}
              >
                <Calculator className="w-5 h-5" />
                Calcular Meu Potencial de Economia
              </Button>

              {/* Results */}
              {calculated && (
                <div id="calculator-result" className="space-y-6 pt-6 border-t border-border animate-fade-up">
                  
                  {isGoodCMV ? (
                    // CMV já está bom
                    <div className="bg-rook-verde/10 rounded-xl p-6 text-center border border-rook-verde/20">
                      <div className="flex items-center justify-center gap-2 text-rook-verde mb-3">
                        <Sparkles className="w-6 h-6" />
                        <span className="font-bold text-lg">Parabéns! 🎉</span>
                      </div>
                      <p className="text-muted-foreground">
                        Seu CMV de <strong>{cmvAtual}%</strong> já está dentro ou abaixo da meta ideal de <strong>{cmvIdeal}%</strong>.
                        <br />Continue assim! O Rook System pode ajudar a manter esse controle.
                      </p>
                    </div>
                  ) : (
                    // CMV precisa melhorar
                    <>
                      {/* CMV Comparison */}
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="bg-rook-terracota/10 rounded-xl p-5 text-center border border-rook-terracota/20">
                          <div className="flex items-center justify-center gap-2 text-rook-terracota mb-2">
                            <AlertTriangle className="w-5 h-5" />
                            <span className="text-sm font-medium">CMV Atual</span>
                          </div>
                          <p className="text-3xl font-bold text-rook-terracota">{cmvAtual}%</p>
                        </div>
                        <div className="bg-rook-verde/10 rounded-xl p-5 text-center border border-rook-verde/20">
                          <div className="flex items-center justify-center gap-2 text-rook-verde mb-2">
                            <Target className="w-5 h-5" />
                            <span className="text-sm font-medium">CMV Ideal</span>
                          </div>
                          <p className="text-3xl font-bold text-rook-verde">{cmvIdeal}%</p>
                        </div>
                      </div>

                      {/* Savings */}
                      <div className="bg-gradient-to-br from-rook-beige to-rook-beige/50 rounded-xl p-6 border border-rook-pingado/30">
                        <h4 className="text-center font-semibold text-rook-cafe mb-4 flex items-center justify-center gap-2">
                          <Wallet className="w-5 h-5 text-rook-marrom" />
                          Potencial de Economia
                        </h4>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div className="text-center">
                            <p className="text-sm text-muted-foreground mb-1">Por Mês</p>
                            <p className="text-2xl md:text-3xl font-bold text-rook-marrom">
                              R$ {formatCurrency(economiaMensal)}
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-muted-foreground mb-1">Por Ano</p>
                            <p className="text-2xl md:text-3xl font-bold text-rook-marrom">
                              R$ {formatCurrency(economiaAnual)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* ROI */}
                      <div className="bg-rook-verde/10 rounded-xl p-5 text-center border border-rook-verde/20">
                        <div className="flex items-center justify-center gap-2 text-rook-verde mb-2">
                          <TrendingUp className="w-5 h-5" />
                          <span className="font-semibold">Retorno do Investimento</span>
                        </div>
                        <p className="text-muted-foreground text-sm mb-2">
                          Investimento no Rook Knight: <strong>R$ 99/mês</strong> (R$ 1.188/ano)
                        </p>
                        <p className="text-2xl font-bold text-rook-verde">
                          ROI: {roi}x 🚀
                        </p>
                      </div>

                      {/* CTA */}
                      <a href="https://app.rooksystem.com.br/registro?plan=basic_monthly" className="block">
                        <Button variant="rook" size="xl" className="w-full group">
                          Começar a Economizar Agora
                          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </a>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CalculatorSection;
