export function HowItWorksSection() {
  const steps = [
    {
      num: "01",
      title: "Conecte suas notas fiscais",
      desc: "Importação automática via XML ou integração direta com seu ERP/PDV. Cada centavo classificado por NCM, fornecedor e data.",
    },
    {
      num: "02",
      title: "A Rook classifica e analisa",
      desc: "Algoritmos proprietários cruzam dados fiscais, calculam CMV real, identificam desvios e geram recomendações acionáveis.",
    },
    {
      num: "03",
      title: "Você toma decisões com dados",
      desc: "Relatório PDF de 11 páginas, dashboard interativo, alertas automáticos. Tudo auditável, sem achismo.",
    },
  ];

  return (
    <section className="section" aria-labelledby="how-heading">
      <div className="container-rook">
        <p className="eyebrow mb-[22px]">— Como funciona</p>
        <h2 id="how-heading" className="section-title">
          Três passos. <em>Zero planilha.</em>
        </h2>
        <p className="section-lede mb-16">
          Da importação de notas à recomendação estratégica em minutos, não meses.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {steps.map((step) => (
            <div key={step.num} className="relative">
              <span
                className="font-mono text-[11px] tracking-[0.22em] uppercase mb-4 block"
                style={{ color: "#E54C00" }}
              >
                Passo {step.num}
              </span>
              <h3
                className="font-display font-medium text-[22px] leading-[1.2] tracking-[-0.01em] mb-3"
                style={{ color: "#F5EDE0" }}
              >
                {step.title}
              </h3>
              <p className="text-[14.5px] leading-[1.55] m-0" style={{ color: "#D8CCB8" }}>
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
