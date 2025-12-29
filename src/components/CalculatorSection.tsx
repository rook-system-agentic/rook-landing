import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calculator, TrendingUp, AlertTriangle } from "lucide-react";

const CalculatorSection = () => {
  const [faturamento, setFaturamento] = useState(100000);
  const [cmvAtual, setCmvAtual] = useState(38);
  const [calculated, setCalculated] = useState(false);

  const cmvIdeal = 30;
  const diferencaCMV = cmvAtual - cmvIdeal;
  const perdaMensal = (faturamento * diferencaCMV) / 100;
  const perdaAnual = perdaMensal * 12;

  const handleCalculate = () => {
    setCalculated(true);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

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
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                    R$
                  </span>
                  <input
                    type="number"
                    value={faturamento}
                    onChange={(e) => {
                      setFaturamento(Number(e.target.value));
                      setCalculated(false);
                    }}
                    className="w-full h-14 pl-12 pr-4 rounded-xl bg-muted border border-border text-foreground text-lg font-medium focus:outline-none focus:ring-2 focus:ring-rook-pingado focus:border-transparent transition-all"
                  />
                </div>
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
                    <span className="text-2xl font-bold text-rook-marrom">{cmvAtual}%</span>
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
              {calculated && cmvAtual > cmvIdeal && (
                <div className="space-y-4 pt-6 border-t border-border animate-fade-up">
                  <div className="flex items-center gap-2 text-rook-terracota">
                    <AlertTriangle className="w-5 h-5" />
                    <span className="font-semibold">Alerta de Oportunidade</span>
                  </div>
                  
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="bg-rook-terracota/10 rounded-xl p-5 text-center">
                      <p className="text-sm text-muted-foreground mb-1">Perda Mensal Estimada</p>
                      <p className="text-2xl md:text-3xl font-bold text-rook-terracota">
                        {formatCurrency(perdaMensal)}
                      </p>
                    </div>
                    <div className="bg-rook-terracota/10 rounded-xl p-5 text-center">
                      <p className="text-sm text-muted-foreground mb-1">Perda Anual Estimada</p>
                      <p className="text-2xl md:text-3xl font-bold text-rook-terracota">
                        {formatCurrency(perdaAnual)}
                      </p>
                    </div>
                  </div>

                  <div className="bg-rook-verde/10 rounded-xl p-5 text-center border border-rook-verde/20">
                    <div className="flex items-center justify-center gap-2 text-rook-verde mb-2">
                      <TrendingUp className="w-5 h-5" />
                      <span className="font-semibold">Com o Rook System</span>
                    </div>
                    <p className="text-muted-foreground">
                      Você pode recuperar até{" "}
                      <span className="text-rook-verde font-bold">{formatCurrency(perdaAnual * 0.7)}/ano</span>{" "}
                      otimizando seu CMV para 30%
                    </p>
                  </div>
                </div>
              )}

              {calculated && cmvAtual <= cmvIdeal && (
                <div className="bg-rook-verde/10 rounded-xl p-5 text-center border border-rook-verde/20 animate-fade-up">
                  <p className="text-rook-verde font-semibold">
                    Parabéns! Seu CMV está dentro do ideal. O Rook pode ajudar a mantê-lo assim.
                  </p>
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
