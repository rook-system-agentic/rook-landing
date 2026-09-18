import FinancialTool from "@/components/acquisition/FinancialTool";

export function CmvCalculator({ embedded = false }: { embedded?: boolean }) {
  return <FinancialTool tool="cmv" embedded={embedded} />;
}
