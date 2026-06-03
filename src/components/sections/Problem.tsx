export function ProblemSection() {
  return (
    <section
      className="section relative"
      aria-labelledby="problem-heading"
      style={{
        background: `
          radial-gradient(ellipse 80% 60% at 50% 100%, rgba(229,76,0,0.06), transparent 70%),
          #0F0A06
        `,
        borderTop: "1px solid rgba(176,124,74,0.16)",
        borderBottom: "1px solid rgba(176,124,74,0.16)",
      }}
    >
      <div className="container-rook">
        {/* Eyebrow */}
        <p className="eyebrow mb-[22px]">
          — A pergunta de quase todo dono de restaurante
        </p>

        {/* Main question */}
        <h2
          id="problem-heading"
          className="font-display font-medium max-w-[940px] m-0 mb-8"
          style={{
            fontSize: "clamp(40px, 6vw, 72px)",
            lineHeight: "1.05",
            letterSpacing: "-0.02em",
            color: "#F5EDE0",
          }}
        >
          Você sabe quanto{" "}
          <em className="italic" style={{ color: "#E79F4A" }}>
            sobrou
          </em>{" "}
          no final do mês?
        </h2>

        {/* 2-column body */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 mt-16 items-start">
          {/* Left: Lead text */}
          <div className="text-[19px] leading-[1.6]" style={{ color: "#D8CCB8" }}>
            <p className="m-0 mb-6">
              Movimento no caixa é uma{" "}
              <strong className="font-semibold" style={{ color: "#F5EDE0" }}>
                sensação
              </strong>
              . Lucro é um{" "}
              <strong className="font-semibold" style={{ color: "#F5EDE0" }}>
                número
              </strong>
              .
            </p>
            <p className="m-0 mb-6">
              Entre os dois existem fornecedores, impostos sobre vendas, folha,
              ocupação, dívidas — e cada um corrói a margem em uma camada
              diferente.
            </p>
            <p className="m-0 mb-6">
              Quando isso é olhado em planilha, o erro humano se acumula. Quando
              é olhado por{" "}
              <em className="italic" style={{ color: "#E79F4A" }}>
                &ldquo;feeling&rdquo;
              </em>
              , o erro vira política.
            </p>
            <p className="m-0">
              A Rook organiza{" "}
              <strong className="font-semibold" style={{ color: "#F5EDE0" }}>
                seus dados reais
              </strong>
              , classifica linha a linha e devolve uma DRE auditável em horas,
              não em meses.
            </p>
          </div>

          {/* Right: Contrasts */}
          <div className="flex flex-col gap-[22px]">
            {[
              {
                eq: ["Receita", "Lucro"],
                desc: "O que entra no caixa não é o que fica no bolso. Entre os dois há 6 pilares — e qualquer um deles pode estar corroendo sua margem agora.",
              },
              {
                eq: ["Faturamento", "Resultado"],
                desc: "Crescer 30% em vendas e perder dinheiro acontece todo mês em food service. Sem visão por linha de DRE, ninguém sabe explicar onde.",
              },
              {
                eq: ["Movimento", "Margem"],
                desc: "Filas no salão, delivery cheio, ticket bom — e a margem real pode estar em 4%. Ou em 22%. A diferença muda decisões importantes.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="pb-[22px]"
                style={{
                  borderBottom: i < 2 ? "1px solid rgba(176,124,74,0.16)" : "none",
                }}
              >
                <p
                  className="font-display font-medium text-[30px] leading-[1.1] mb-2 tracking-[-0.01em]"
                  style={{ color: "#F5EDE0" }}
                >
                  {item.eq[0]}{" "}
                  <span style={{ color: "#E54C00", margin: "0 6px" }}>≠</span>{" "}
                  {item.eq[1]}
                </p>
                <p className="text-[14px] leading-[1.55] m-0" style={{ color: "rgba(245,237,224,0.58)" }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Quote */}
        <div
          className="mt-[88px] py-10 grid grid-cols-[60px_1fr] gap-8 items-center"
          style={{
            borderTop: "1px solid rgba(176,124,74,0.32)",
            borderBottom: "1px solid rgba(176,124,74,0.32)",
          }}
        >
          <span className="font-display text-[80px] leading-[0.6] text-center" style={{ color: "#E79F4A" }}>
            &ldquo;
          </span>
          <p className="font-display font-normal text-[28px] leading-[1.3] tracking-[-0.005em] m-0" style={{ color: "#F5EDE0" }}>
            A Rook traduz{" "}
            <strong className="font-semibold" style={{ color: "#E79F4A" }}>
              força, confiança e estratégia
            </strong>{" "}
            empenhadas na construção de um sistema de gestão com foco em dar mais{" "}
            <strong className="font-semibold" style={{ color: "#E79F4A" }}>
              visão e controle
            </strong>{" "}
            a gestores e empreendedores.
          </p>
        </div>
      </div>
    </section>
  );
}
