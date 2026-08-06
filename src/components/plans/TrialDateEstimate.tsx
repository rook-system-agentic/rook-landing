"use client";

import { useEffect, useState } from "react";
import {
  buildTrialDateEstimate,
  type TrialDateEstimate as TrialDateEstimateValue,
} from "@/lib/trial-date-estimate.mjs";

export function TrialDateEstimate({
  trialDays,
  context = "summary",
}: {
  trialDays: number;
  context?: "summary" | "faq";
}) {
  const [estimate, setEstimate] = useState<TrialDateEstimateValue | null>(null);

  useEffect(() => {
    setEstimate(buildTrialDateEstimate(trialDays));
  }, [trialDays]);

  if (context === "faq") {
    return estimate ? (
      <>
        Depois dos {trialDays} dias, na data mostrada no checkout. Se o período
        começasse hoje, a previsão seria {estimate.firstChargeDate}.
      </>
    ) : (
      <>Depois dos {trialDays} dias, na data mostrada no checkout.</>
    );
  }

  return estimate ? (
    <>
      O cartão é cadastrado no início. Se o período começasse hoje, em {estimate.startDate},
      a primeira cobrança estaria prevista para{" "}
      <strong className="text-cream">{estimate.firstChargeDate}</strong>. A data
      definitiva será mostrada no checkout antes da confirmação.
    </>
  ) : (
    <>
      O cartão é cadastrado no início. A data de começo e a previsão da primeira
      cobrança serão confirmadas no checkout antes da contratação.
    </>
  );
}
