import { Config } from "@/config";
import { itemsStore } from "@/store/items-state";
import type { VillagerTrade } from "./villagerTrades";

export async function retrieveVillagerTrades(): Promise<VillagerTrade[]> {
  // Don't reload if data is recent
  if (itemsStore.villagerTrades.length > 0) return itemsStore.villagerTrades;

  // Get custom discs
  let httpResponse = await fetch(`${Config.APIURL}/api/villagertrades`, { method: "get" });
  if (httpResponse.status !== 200) return [];

  itemsStore.villagerTrades = (await httpResponse.json()).result.trades as VillagerTrade[];
  return itemsStore.villagerTrades;
}
