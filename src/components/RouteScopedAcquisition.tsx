"use client";

import { usePathname } from "next/navigation";

type RouteScopedAcquisitionProps = {
  children: React.ReactNode;
};

const GUIDE_PATHS = new Set(["/guia-cmv", "/guia-cmv/"]);
// ROO-1825: a LP de Black Friday também é de conversão única (entrar na
// comunidade); demonstração e chat do rodapé competiriam com esse CTA.
const CAMPAIGN_PATHS = new Set(["/bl1", "/bl1/"]);

/**
 * A rota do guia é uma LP educativa de quatro campos, não uma entrada do funil
 * comercial. O guard mantém DemoSection/SiteChat idênticos nas outras rotas e
 * evita que o layout injete um segundo formulário ou um chat depois do guia.
 */
export default function RouteScopedAcquisition({ children }: RouteScopedAcquisitionProps) {
  const pathname = usePathname();
  return GUIDE_PATHS.has(pathname) || CAMPAIGN_PATHS.has(pathname) ? null : children;
}
