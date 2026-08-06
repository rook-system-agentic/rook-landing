export interface TrialDateEstimate {
  startDate: string;
  firstChargeDate: string;
}

export function buildTrialDateEstimate(
  trialDays: number,
  now?: Date,
): TrialDateEstimate;
