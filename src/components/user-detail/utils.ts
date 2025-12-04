export const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(value);

export const getTabDisplayName = (tab: string, fromApp?: string) => {
  if (tab === "Stock" && fromApp?.toLowerCase() === "fydaa") {
    return "Mutual Funds";
  }
  return tab;
};

