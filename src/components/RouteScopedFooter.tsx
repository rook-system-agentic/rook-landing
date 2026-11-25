"use client";

import { usePathname } from "next/navigation";

type RouteScopedFooterProps = {
  /** Rodapé da Rook Health, já renderizado no servidor. */
  health: React.ReactNode;
  /** Rodapé padrão do site. */
  children: React.ReactNode;
};

const HEALTH_PATHS = new Set(["/health", "/health/"]);

/**
 * Escolhe o rodapé pela rota. (25/11/2026)
 *
 * O rodapé vive no layout, que não sabe em que página está. Em `/health/` ele
 * dizia "o lucro do seu restaurante" e listava Calculadora de CMV e
 * Diagnóstico para quem tem clínica — e "Agendar demonstração" apontava para
 * `#cadastro`, seção que não existe nessa rota.
 *
 * Os dois rodapés continuam componentes de servidor: chegam prontos por props
 * e este guard só decide qual mostrar, como o `RouteScopedAcquisition`.
 */
export default function RouteScopedFooter({ health, children }: RouteScopedFooterProps) {
  return HEALTH_PATHS.has(usePathname()) ? health : children;
}
