import { Config } from "@/config";
import { itemsStore } from "@/store/items-state";
import type { VillagerTrade, VillagerTradesResponse } from "./villagerTrades";

export async function retrieveVillagerTrades(): Promise<VillagerTrade[]> {
  // Don't reload if data is recent
  if (itemsStore.villagerTrades.length > 0) return itemsStore.villagerTrades;

  // Get data
  let httpResponse = await fetch(`${Config.APIURL}/api/villagertrades`, { method: "get" });
  if (httpResponse.status !== 200) return [];

  let response = (await httpResponse.json()).result as VillagerTradesResponse;
  itemsStore.villagerTrades = response.trades;
  itemsStore.villagerTradesLastUpdated = new Date(response.lastUpdated);
  return itemsStore.villagerTrades;
}
