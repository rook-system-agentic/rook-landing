"use client";

import { usePathname } from "next/navigation";

type RouteScopedAcquisitionProps = {
  children: React.ReactNode;
};

const GUIDE_PATHS = new Set(["/guia-cmv", "/guia-cmv/"]);

/**
 * A rota do guia é uma LP educativa de quatro campos, não uma entrada do funil
 * comercial. O guard mantém DemoSection/SiteChat idênticos nas outras rotas e
 * evita que o layout injete um segundo formulário ou um chat depois do guia.
 */
export default function RouteScopedAcquisition({ children }: RouteScopedAcquisitionProps) {
  return GUIDE_PATHS.has(usePathname()) ? null : children;
}
