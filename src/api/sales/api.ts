import { Config } from "@/config";
import type { SaleSummary } from "./saleSummary";

export interface SalesFilters {
  enchantment?: string;
  potionEffect?: string;
  customDisc?: string;
}

export async function loadSales(
  lastItem?: SaleSummary | null | undefined
): Promise<SaleSummary[]> {
  return await loadSalesInternal(null, null, lastItem);
}

export async function loadSalesForItemType(
  itemType: string,
  filters?: SalesFilters,
  lastItem?: SaleSummary | null | undefined
): Promise<SaleSummary[]> {
  return await loadSalesInternal(itemType, filters, lastItem);
}

async function loadSalesInternal(
  itemType: string | null,
  filters: SalesFilters | null | undefined,
  lastItem: SaleSummary | null | undefined
): Promise<SaleSummary[]> {
  const params = new URLSearchParams();

  if (lastItem != null) {
    params.append("before", lastItem.occurredAt);
    params.append("lastID", lastItem.id);
  }

  if (itemType != null) {
    params.append("itemType", itemType);
  }

  if (filters?.enchantment != null)
    params.append("enchantment", filters?.enchantment);

  if (filters?.customDisc != null)
    params.append("customDisc", filters?.customDisc);

  if (filters?.potionEffect != null)
    params.append("potionEffect", filters?.potionEffect);

  let url = `${Config.APIURL}/api/sales?${params.toString()}`;
  let httpResponse = await fetch(url, { method: "get" });

  if (httpResponse.status !== 200)
    throw new Error("Failed to retrieve recent sales");

  let response = await httpResponse.json();
  return response.items;
}
