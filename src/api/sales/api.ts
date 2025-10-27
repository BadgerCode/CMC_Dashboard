import { Config } from "@/config";
import type { SaleSummary } from "./saleSummary";

export async function loadSales(lastItem?: SaleSummary | null | undefined): Promise<SaleSummary[]> {
    return await loadSalesInternal(null, lastItem);
}

export async function loadSalesForItemType(itemType: string, lastItem?: SaleSummary | null | undefined): Promise<SaleSummary[]> {
    return await loadSalesInternal(itemType, lastItem);
}

async function loadSalesInternal(itemType: string | null, lastItem: SaleSummary | null | undefined): Promise<SaleSummary[]> {
    const params = new URLSearchParams();

    if (lastItem != null) {
        params.append("before", lastItem.occurredAt);
        params.append("lastID", lastItem.id);
    }

    if (itemType != null) {
        params.append("itemType", itemType);
    }

    let url = `${Config.APIURL}/api/sales?${params.toString()}`;
    let httpResponse = await fetch(url, { method: "get" });

    if (httpResponse.status !== 200)
        throw new Error("Failed to retrieve recent sales");

    let response = await httpResponse.json();
    return response.items;
}
