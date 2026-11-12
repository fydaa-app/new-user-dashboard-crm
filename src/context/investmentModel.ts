export type InvestmentModelFilter = "ALL" | "RIA" | "ARN";

export const INVESTMENT_MODEL_STORAGE_KEY = "investmentModelFilter";

/** Always returns ALL on read — refresh must not restore a prior RIA/ARN selection. */
export function readInvestmentModelFilter(): InvestmentModelFilter {
  return "ALL";
}

/** Query fragment. All is omitted so existing callers keep current results. */
export function investmentModelQuery(
  filter: InvestmentModelFilter | undefined,
  options?: { sendAll?: boolean },
): string {
  if (!filter || filter === "ALL") {
    return options?.sendAll ? "&investmentModel=ALL" : "";
  }
  return `&investmentModel=${filter}`;
}

/**
 * Card fields already split by strict equality, so null users sit in the
 * combined total only. Counts and rupee sums put that remainder with RIA.
 * Rates cannot be subtracted, so they use the API's own RIA or ARN field.
 */
export function pickModelMetric(
  filter: InvestmentModelFilter | undefined,
  combined: number | undefined | null,
  ria: number | undefined | null,
  arn: number | undefined | null,
  kind: "amount" | "rate" = "amount",
): number {
  const total = Number(combined) || 0;
  const riaValue = Number(ria) || 0;
  const arnValue = Number(arn) || 0;
  if (filter === "ARN") {
    return arnValue;
  }
  if (filter === "RIA") {
    return kind === "rate" ? riaValue : total - arnValue;
  }
  return total;
}
