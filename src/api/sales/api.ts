import { Config } from "@/config";
import type { SaleSummary } from "./saleSummary";

export interface SalesFilters {
  itemType?: string | null;
  customName?: string | null;
  lastItem?: SaleSummary | null;
  enchantment?: string;
  potionEffect?: string;
  customDisc?: string;
}

export async function loadSales(filters: SalesFilters): Promise<SaleSummary[]> {
  const params = new URLSearchParams();

  if (filters.lastItem) {
    params.append("before", filters.lastItem.occurredAt);
    params.append("lastID", filters.lastItem.id);
  }

  if (filters.itemType) {
    params.append("itemType", filters.itemType);
  }

  if (filters.customName) {
    params.append("customName", filters.customName);
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
