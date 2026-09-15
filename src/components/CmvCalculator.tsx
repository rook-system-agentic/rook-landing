import ConsultativeExperience from "@/components/acquisition/ConsultativeExperience";

// As duas entradas usam a mesma conversa e o mesmo motor financeiro.
export function CmvCalculator() { return <ConsultativeExperience initialIntent="cmv" />; }
