const DAY_IN_MS = 24 * 60 * 60 * 1_000;
const BUSINESS_TIME_ZONE = "America/Sao_Paulo";

const businessDateFormatter = new Intl.DateTimeFormat("en-US", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: BUSINESS_TIME_ZONE,
});

function getBusinessCalendarDate(now) {
  const parts = Object.fromEntries(
    businessDateFormatter
      .formatToParts(now)
      .filter(({ type }) => type !== "literal")
      .map(({ type, value }) => [type, Number(value)]),
  );

  return new Date(Date.UTC(parts.year, parts.month - 1, parts.day));
}

function formatCalendarDate(date) {
  return [date.getUTCDate(), date.getUTCMonth() + 1, date.getUTCFullYear()]
    .map((value, index) => String(value).padStart(index < 2 ? 2 : 4, "0"))
    .join("/");
}

export function buildTrialDateEstimate(trialDays, now = new Date()) {
  if (!Number.isInteger(trialDays) || trialDays <= 0) {
    throw new TypeError("trialDays deve ser um inteiro positivo");
  }

  if (!(now instanceof Date) || Number.isNaN(now.getTime())) {
    throw new TypeError("now deve ser uma data válida");
  }

  const startDate = getBusinessCalendarDate(now);
  const firstChargeDate = new Date(startDate.getTime() + trialDays * DAY_IN_MS);

  return {
    startDate: formatCalendarDate(startDate),
    firstChargeDate: formatCalendarDate(firstChargeDate),
  };
}
