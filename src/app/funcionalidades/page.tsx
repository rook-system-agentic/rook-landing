"use client";
import { useState } from "react";
import Link from "next/link";

/* ─── Modules Data ─── */
const modules = [
  {
    n: "01",
    label: "VENDAS",
    title: "Quanto entra — e de onde vem",
    desc: "O movimento do salão e do delivery virando número organizado.",
    bullets: [
      "Faturamento por canal e por período",
      "Ticket médio e evolução mês a mês",
      "Receita por colaborador",
    ],
    plan: "Knight / Rook",
  },
  {
    n: "02",
    label: "COMPRAS",
    title: "O custo que mais corrói margem",
    desc: "Seu CMV real, calculado a partir das notas fiscais — não do achismo.",
    bullets: [
      "CMV real por categoria de insumo",
      "Principais fornecedores e concentração",
      "Preço pago vs. histórico de compra",
    ],
    plan: "Knight / Rook",
  },
  {
    n: "03",
    label: "IMPOSTOS",
    title: "A carga real — e o regime certo",
    desc: "Quanto você paga de verdade, e quanto pagaria em cada regime.",
    bullets: [
      "Alíquota efetiva sobre a receita",
      "Simulação de 4 regimes tributários",
      "Economia potencial em R$",
    ],
    plan: "Knight / Rook",
  },
  {
    n: "04",
    label: "DESPESAS",
    title: "O peso de manter a operação",
    desc: "Folha, aluguel, contas — cada grupo de despesa no seu devido lugar.",
    bullets: [
      "Despesas por grupo e evolução",
      "Folha sobre receita",
      "Ocupação (aluguel + condomínio) sobre receita",
    ],
    plan: "Knight / Rook",
  },
  {
    n: "05",
    label: "ENDIVIDAMENTO",
    title: "A dívida que cabe no caixa",
    desc: "Financiamento pode ser alavanca ou armadilha — aqui você sabe qual.",
    bullets: [
      "Dívida total e custo médio",
      "Quanto da receita as parcelas consomem",
      "Capacidade de pagamento do negócio",
    ],
    plan: "Knight / Rook",
  },
  {
    n: "06",
    label: "RESULTADO",
    title: "A verdade do fim do mês",
    desc: "Da receita bruta ao lucro líquido, linha por linha.",
    bullets: [
      "DRE completa e auditável",
      "Margem líquida e ponto de equilíbrio",
      "Nota de 0 a 100 em cada área",
    ],
    plan: "Knight / Rook",
  },
];

/* ─── Modules Grid ─── */
function ModulesGrid() {
  return (
    <section className="section-spacing border-t border-border">
      <div className="max-w-7xl mx-auto px-6">
        <p className="section-label mb-6">— Os 7 módulos</p>
        <h2 className="heading-section mb-4 max-w-4xl">
          Uma casa para cada parte do <em>seu dinheiro.</em>
        </h2>
        <p className="text-body mb-16">
          Cada módulo responde uma pergunta que todo dono já se fez. Sem planilha,
          sem fórmula — os indicadores já chegam prontos e explicados.
        </p>

        {/* Grid 3x2 */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mb-5">
          {modules.map((m) => (
            <div
              key={m.n}
              className="card p-6 group hover:border-terracota/30 transition-colors"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-sm font-bold text-terracota">
                  {m.n} · {m.label}
                </span>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-bg border border-border text-muted">
                  {m.plan}
                </span>
              </div>
              <h3 className="heading-sub mb-2">{m.title}</h3>
              <p className="text-sm text-muted mb-4">{m.desc}</p>
              <ul className="space-y-2">
                {m.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-2 text-sm text-muted">
                    <span className="text-ocre mt-0.5">—</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Chess — full width, distinct style */}
        <div className="card p-8 border-terracota/20 bg-gradient-to-r from-bg-card to-bg-elevated">
          <div className="grid lg:grid-cols-[1fr_2fr] gap-8 items-start">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="font-mono text-sm font-bold text-terracota">
                  07 · CHESS
                </span>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-bg border border-border text-muted">
                  Chess
                </span>
              </div>
              <h3 className="heading-sub mb-2">
                A rede inteira no mesmo tabuleiro
              </h3>
              <p className="text-sm text-muted">
                Para quem comanda mais de uma unidade — visão de grupo, sem planilha de consolidação.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-3">
              {[
                "Painel consolidado do grupo",
                "Ranking automático entre unidades",
                "Visão por unidade, módulo a módulo",
                "Comparação de cada filial com a média da rede",
                "Papéis de acesso (matriz × franqueado)",
                "Tudo dos outros 6 módulos, em cada unidade",
              ].map((item) => (
                <p key={item} className="flex items-start gap-2 text-sm text-muted">
                  <span className="text-ocre mt-0.5">—</span>
                  <span>{item}</span>
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Segments Data for Calculator ─── */
const segmentsData = [
  { name: "Restaurante à la carte - Tradicional", slug: "a_la_carte", defaultCmvTarget: 32.0, cmvMin: 30.9, cmvMax: 33.1 },
  { name: "Alta gastronomia (fine dining)", slug: "fine_dining", defaultCmvTarget: 27.5, cmvMin: 26.5, cmvMax: 28.5 },
  { name: "Comida Italiana", slug: "italiana", defaultCmvTarget: 33.0, cmvMin: 31.8, cmvMax: 34.2 },
  { name: "Comida Japonesa / Sushi", slug: "japonesa_sushi", defaultCmvTarget: 35.8, cmvMin: 34.5, cmvMax: 37.1 },
  { name: "Self-service / Comida a quilo", slug: "self_service_kilo", defaultCmvTarget: 36.6, cmvMin: 35.3, cmvMax: 37.9 },
  { name: "Pizzaria", slug: "pizzaria", defaultCmvTarget: 28.4, cmvMin: 27.4, cmvMax: 29.4 },
  { name: "Hamburgueria", slug: "hamburgueria", defaultCmvTarget: 31.7, cmvMin: 30.5, cmvMax: 32.8 },
  { name: "Lanchonete / Fast food", slug: "fast_food", defaultCmvTarget: 30.8, cmvMin: 29.6, cmvMax: 31.9 },
  { name: "Bar / Boteco", slug: "bar_boteco", defaultCmvTarget: 25.0, cmvMin: 24.1, cmvMax: 25.9 },
  { name: "Padaria / Cafeteria / Confeitaria", slug: "padaria_cafeteria", defaultCmvTarget: 34.8, cmvMin: 33.6, cmvMax: 36.1 },
  { name: "Delivery especializado", slug: "delivery_especializado", defaultCmvTarget: 30.3, cmvMin: 29.2, cmvMax: 31.4 }
];

/* ─── Calculator Section ─── */
function Calculator() {
  const [faturamento, setFaturamento] = useState(100000);
  const [cmv, setCmv] = useState(38);
  const [selectedSegment, setSelectedSegment] = useState("a_la_carte");
  const [result, setResult] = useState<{ economia: number; ideal: number; diferenca: number } | null>(null);

  const segment = segmentsData.find(s => s.slug === selectedSegment) || segmentsData[0];

  const calcular = () => {
    const ideal = segment.defaultCmvTarget;
    const diferenca = cmv - ideal;
    const economiaAnual = (diferenca / 100) * faturamento * 12;
    setResult({ economia: economiaAnual, ideal, diferenca });
  };

  return (
    <section className="section-spacing border-t border-border">
      <div className="max-w-7xl mx-auto px-6">
        <p className="section-label text-center mb-6">— Calculadora interativa</p>
        <h2 className="heading-section text-center mb-4">
          Qual o impacto do CMV no seu <em>lucro?</em>
        </h2>
        <p className="text-body text-center mx-auto mb-12">
          Simule o potencial de economia ao otimizar seu Custo de Mercadoria Vendida
          para a faixa ideal do seu segmento.
        </p>

        <div className="grid lg:grid-cols-2 gap-8 items-start max-w-5xl mx-auto">
          {/* Form */}
          <div className="card p-8">
            <label className="font-mono text-xs text-muted uppercase tracking-wider block mb-2">
              Qual o segmento do seu restaurante?
            </label>
            <div className="flex items-center gap-2 bg-bg rounded-lg border border-border px-4 py-3 mb-6">
              <select
                value={selectedSegment}
                onChange={(e) => {
                  setSelectedSegment(e.target.value);
                  setResult(null);
                }}
                className="bg-transparent text-cream text-base font-semibold w-full outline-none cursor-pointer"
                style={{ colorScheme: "dark" }}
              >
                {segmentsData.map((s) => (
                  <option key={s.slug} value={s.slug} className="bg-bg text-cream">
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <label className="font-mono text-xs text-muted uppercase tracking-wider block mb-2">
              Qual seu faturamento mensal?
            </label>
            <div className="flex items-center gap-2 bg-bg rounded-lg border border-border px-4 py-3 mb-6">
              <span className="text-muted text-sm">R$</span>
              <input
                type="text"
                value={faturamento.toLocaleString("pt-BR")}
                onChange={(e) => setFaturamento(Number(e.target.value.replace(/\D/g, "")) || 0)}
                className="bg-transparent text-cream text-lg font-semibold w-full outline-none"
              />
            </div>

            <label className="font-mono text-xs text-muted uppercase tracking-wider block mb-2">
              Qual seu CMV atual (estimado)?
            </label>
            <p className="text-2xl font-bold text-center text-terracota mb-2">{cmv}%</p>
            <input
              type="range"
              min={20}
              max={60}
              value={cmv}
              onChange={(e) => setCmv(Number(e.target.value))}
              className="w-full accent-terracota mb-2"
            />
            <div className="flex justify-between text-xs text-muted">
              <span>20%</span>
              <span>60%</span>
            </div>
            <div className="text-xs text-muted mt-4 leading-relaxed">
              CMV de referência para <strong className="text-cream">{segment.name}</strong>:{" "}
              <span className="text-ocre font-semibold">{segment.defaultCmvTarget}%</span>.
              A faixa saudável recomendada fica entre{" "}
              <span className="text-ocre font-semibold">{segment.cmvMin}% e {segment.cmvMax}%</span> da receita líquida.
              <span className="block mt-2 text-[10px] text-muted/60">
                * Fonte: Rook - Benchmark 2026
              </span>
            </div>

            <button onClick={calcular} className="btn-primary w-full mt-6">
              Calcular potencial de economia
            </button>
          </div>

          {/* Result */}
          <div className="card p-8 flex flex-col justify-center min-h-[380px]">
            {result ? (
              <>
                <p className="font-mono text-xs text-ocre uppercase tracking-wider mb-3">Resultado da simulação</p>
                {result.diferenca > 0 ? (
                  <>
                    <p className="text-sm text-muted mb-4">
                      Seu CMV de <span className="text-cream font-semibold">{cmv}%</span> está{" "}
                      <span className="text-terracota font-semibold">{result.diferenca.toFixed(1)}% acima</span> da meta ideal para{" "}
                      <strong className="text-cream">{segment.name}</strong> ({result.ideal}%). A economia anual projetada é de:
                    </p>
                    <p className="text-4xl font-bold text-floresta mb-2">
                      R$ {result.economia.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
                    </p>
                    <p className="text-sm text-muted mb-6">em lucro líquido recuperado</p>
                    
                    <div className="bg-bg rounded-lg border border-border p-4 mb-6">
                      <p className="text-xs text-muted leading-relaxed">
                        <strong className="text-cream">O que isso significa?</strong> Ao otimizar as compras e fichas técnicas para atingir o benchmark, essa economia é revertida diretamente como margem líquida (lucro líquido que vai para o seu bolso), sem precisar vender uma única mesa a mais.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div>
                        <p className="text-lg font-bold text-cream">
                          R$ {(result.economia / 12).toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
                        </p>
                        <p className="text-xs text-muted font-light">por mês recuperados</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-cream">
                          +{result.diferenca.toFixed(1)}pp
                        </p>
                        <p className="text-xs text-muted font-light">de margem de lucro a mais</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-full bg-floresta/10 border border-floresta/20 flex items-center justify-center mb-4">
                      <svg width="24" height="24" fill="none" stroke="#44604A" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-bold text-floresta mb-2">Operação de Alta Eficiência!</h4>
                    <p className="text-sm text-muted mb-6 leading-relaxed">
                      Parabéns! Seu CMV estimado de <span className="text-cream font-semibold">{cmv}%</span> já está abaixo ou na meta ideal do segmento (<span className="font-semibold text-floresta">{result.ideal}%</span>). Isso indica um excelente controle de compras e precificação.
                    </p>
                    <div className="bg-bg rounded-lg border border-border p-4 mb-6">
                      <p className="text-xs text-muted leading-relaxed">
                        <strong className="text-cream">O desafio agora é a constância:</strong> flutuações de preços de fornecedores e pequenos desperdícios diários podem corroer essa margem silenciosamente ao longo do mês.
                      </p>
                    </div>
                  </>
                )}
                
                <div className="pt-6 border-t border-border flex flex-col gap-4">
                  <p className="text-xs text-muted leading-relaxed">
                    Deixe as planilhas manuais para trás. O Rook calcula o seu CMV de forma 
                    <strong className="text-cream"> 100% automática</strong>, conectando-se diretamente às suas notas fiscais de entrada (SEFAZ) 
                    e seu faturamento (integração ERP).
                  </p>
                  <Link href="/planos/" className="btn-primary text-center w-full">
                    Ativar controle automático grátis
                  </Link>
                </div>
              </>
            ) : (
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-terracota/10 flex items-center justify-center mx-auto mb-4">
                  <svg width="32" height="32" fill="none" stroke="#E54C00" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M9 7h6m-6 4h6m-3 4v3m-5 2h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v13a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-muted text-sm">
                  Selecione seu segmento, preencha os dados e clique em{" "}
                  <strong className="text-cream">&ldquo;Calcular&rdquo;</strong> para projetar seu resultado.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── PDF / Relatório Anual ─── */
function PdfDemo() {
  return (
    <section className="section-spacing border-t border-border">
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
        {/* Mock PDF pages */}
        <div className="grid grid-cols-2 gap-4">
          <div className="card p-5">
            <div className="flex justify-between items-center mb-4">
              <span className="font-mono text-xs text-muted">ROOK</span>
              <span className="font-mono text-xs text-muted">Anual · 2025</span>
            </div>
            <p className="section-label mb-1">— Análise financeira</p>
            <p className="text-sm font-semibold text-cream">Diagnóstico <strong>Anual</strong></p>
            <p className="text-xs text-muted mt-1">Restaurante Exemplo</p>
            <p className="text-[10px] text-muted mt-1">CNPJ 00.000.000/0001-00 · Simples Nacional · DF</p>
            <div className="mt-4 flex items-center gap-3">
              <div className="w-12 h-12 rounded-full border-2 border-floresta flex items-center justify-center">
                <span className="text-lg font-bold text-floresta">83</span>
              </div>
              <div>
                <p className="text-xs font-semibold text-cream">Score geral · Bom</p>
                <p className="text-[10px] text-muted">4 de 6 áreas saudáveis</p>
              </div>
            </div>
          </div>
          <div className="card p-5">
            <div className="flex justify-between items-center mb-4">
              <span className="font-mono text-xs text-muted">ROOK</span>
              <span className="font-mono text-xs text-muted">Painel · 03/11</span>
            </div>
            <p className="section-label mb-1">— Painel de saúde</p>
            <p className="text-xs text-muted mb-3">6 áreas avaliadas de 0 a 100</p>
            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                { area: "Vendas", score: 72, color: "text-floresta" },
                { area: "Custos", score: 88, color: "text-floresta" },
                { area: "Impostos", score: 52, color: "text-ocre" },
                { area: "Despesas", score: 68, color: "text-floresta" },
                { area: "Endivid.", score: 85, color: "text-floresta" },
                { area: "Resultado", score: 48, color: "text-red-400" },
              ].map((p) => (
                <div key={p.area}>
                  <p className={`text-sm font-bold ${p.color}`}>{p.score}</p>
                  <p className="text-[10px] text-muted">{p.area}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Text */}
        <div>
          <p className="section-label mb-6">— Relatório anual</p>
          <h2 className="heading-section mb-4">
            O relatório que <em>seu contador respeita.</em>
          </h2>
          <p className="text-body mb-8">
            Onze páginas em A4, tipografia editorial e <strong className="text-cream">dados auditáveis</strong>.
            Para mandar ao banco, ao sócio, ao consultor — ou simplesmente abrir num domingo de manhã
            e entender onde está o restaurante.
          </p>
          <ul className="space-y-4 mb-8">
            {[
              { title: "Diagnóstico de cada área", desc: "Como um especialista contando a história: o que está acontecendo, por que importa e o que fazer. Sem siglas, sem jargão." },
              { title: "Resultado em gráfico e tabela", desc: "Da receita ao lucro, com gráfico ao lado dos números. Você vê onde o dinheiro está indo, linha por linha." },
              { title: "Uma nota de 0 a 100 por área", desc: "Crítico, Atenção, Bom ou Excelente — em cada uma das 6 áreas do seu negócio." },
              { title: "Cada sugestão com impacto em R$", desc: "\"Trocar regime tributário → R$ 124k de economia/ano\". Você sabe exatamente quanto cada ação vale." },
            ].map((item) => (
              <li key={item.title} className="flex gap-3">
                <svg className="w-5 h-5 text-terracota shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <p className="font-semibold text-cream text-sm">{item.title}</p>
                  <p className="text-xs text-muted">{item.desc}</p>
                </div>
              </li>
            ))}
          </ul>
          <Link href="/planos/" className="btn-ghost">
            Ver exemplo real (11 páginas) →
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ─── Chess Multi-CNPJ ─── */
function ChessExpanded() {
  const units = [
    { name: "Centro", score: 92 },
    { name: "Asa Sul", score: 87 },
    { name: "Águas Claras", score: 81 },
    { name: "Gama", score: 76 },
    { name: "Taguatinga", score: 72 },
    { name: "Sobradinho", score: 68 },
    { name: "Ceilândia", score: 63 },
    { name: "Lago Norte", score: null },
  ];

  return (
    <section className="section-spacing border-t border-border">
      <div className="max-w-7xl mx-auto px-6">
        <p className="section-label mb-6">— Módulo Chess · Multi-CNPJ</p>
        <h2 className="heading-section mb-4">
          Para quem comanda mais de <em>uma unidade.</em>
        </h2>
        <p className="text-body mb-12">
          Quando o negócio passa de uma loja para uma rede, o jogo muda — e a
          comparação entre unidades vira a ferramenta-chave.{" "}
          <strong className="text-cream">Chess</strong> coloca todas as filiais no mesmo tabuleiro.
        </p>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Features */}
          <div className="space-y-8">
            {[
              { n: "01", title: "Painel do grupo", desc: "Score consolidado, DRE somada, 6 pilares por filial. Visão de holding sem precisar montar planilha." },
              { n: "02", title: "Ranking automático", desc: "Qual unidade tem o melhor CMV. Onde a margem está apertando. Quem está pagando imposto demais. Sem cruzamento manual." },
              { n: "03", title: "Benchmark interno", desc: "A média do grupo vira o benchmark — cada filial sabe exatamente quanto está acima ou abaixo da média da casa." },
            ].map((f) => (
              <div key={f.n} className="flex gap-4">
                <span className="text-terracota font-mono font-bold text-lg">{f.n}</span>
                <div>
                  <p className="font-semibold text-cream">{f.title}</p>
                  <p className="text-sm text-muted">{f.desc}</p>
                </div>
              </div>
            ))}
            <Link href="/planos/" className="btn-ghost inline-flex">
              Conhecer o módulo Chess →
            </Link>
          </div>

          {/* Ranking grid */}
          <div className="grid grid-cols-4 gap-3">
            {units.map((u) => (
              <div key={u.name} className="card p-4 text-center hover:border-terracota/20 transition-colors">
                <div className="w-8 h-8 mx-auto mb-2 flex items-center justify-center">
                  {u.score ? (
                    <svg className="w-5 h-5 text-terracota" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-muted/40" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                    </svg>
                  )}
                </div>
                <p className={`text-xl font-bold ${u.score ? "text-floresta" : "text-muted/40"}`}>
                  {u.score ?? "—"}
                </p>
                <p className="text-[10px] text-muted mt-1 uppercase tracking-wider">
                  {u.score ? u.name : "Em setup"}
                </p>
              </div>
            ))}
            {/* Add unit placeholder */}
            <div className="card p-4 text-center border-dashed hover:border-terracota/20 transition-colors cursor-pointer">
              <div className="w-8 h-8 mx-auto mb-2 flex items-center justify-center">
                <svg className="w-5 h-5 text-muted/40" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <p className="text-xl font-bold text-muted/40">+</p>
              <p className="text-[10px] text-muted mt-1 uppercase tracking-wider">Adicionar</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── CTA ─── */
function FuncCTA() {
  return (
    <section className="section-spacing border-t border-border">
      <div className="max-w-4xl mx-auto px-6 flex flex-col lg:flex-row items-center justify-between gap-8">
        <div>
          <p className="section-label mb-4">— Pronto para ver os seus números?</p>
          <h2 className="heading-section mb-2">
            Teste por <em>7 dias.</em>
          </h2>
          <p className="text-body">
            Escolha Knight ou Rook conforme o faturamento da unidade. Para grupos multiunidade, adicione o módulo Chess.
          </p>
        </div>
        <Link href="/planos/" className="btn-primary shrink-0">
          Ver planos →
        </Link>
      </div>
    </section>
  );
}

/* ─── Page ─── */
export default function FuncionalidadesPage() {
  return (
    <>
      {/* Hero */}
      <section className="section-spacing">
        <div className="max-w-7xl mx-auto px-6">
          <p className="section-label mb-6">— Funcionalidades</p>
          <h1 className="heading-hero mb-8 max-w-5xl">
            Sete módulos, um <em>único objetivo:</em> mostrar onde está seu dinheiro.
          </h1>
          <p className="text-body max-w-3xl">
            O dinheiro do restaurante passa por seis casas — vendas, compras, impostos,
            despesas, dívidas e resultado. O Rook tem um módulo para cada uma, e um sétimo
            para quem joga com várias unidades. Cada módulo com seus próprios indicadores,
            e cada área com uma <strong className="text-cream">nota de 0 a 100</strong>.
          </p>
        </div>
      </section>

      <ModulesGrid />
      <Calculator />
      <PdfDemo />
      <ChessExpanded />
      <FuncCTA />
    </>
  );
}
