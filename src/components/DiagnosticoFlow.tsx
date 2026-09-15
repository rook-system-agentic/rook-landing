import ConsultativeExperience from "@/components/acquisition/ConsultativeExperience";

// As duas entradas usam a mesma conversa e o mesmo motor financeiro.
export function DiagnosticoFlow() { return <ConsultativeExperience initialIntent="breakeven" />; }
