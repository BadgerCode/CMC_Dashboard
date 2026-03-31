import { Config } from "@/config";
import type { CustomDiscsOverview, CustomDiscStats } from "./customDiscs";
import { itemsStore } from "@/store/items-state";

export async function retrieveCustomDiscs(): Promise<CustomDiscsOverview> {
  // Don't reload if data is recent
  if (itemsStore.customDiscs != null && new Date().getTime() - itemsStore.customDiscsLastUpdated.getTime() < 30000)
    return itemsStore.customDiscs;

  // Get custom discs
  let httpResponse = await fetch(`${Config.APIURL}/api/v2/customDiscs`, { method: "get" });
  if (httpResponse.status !== 200) return { discs: [], unsoldDiscs: 0 };

  itemsStore.customDiscs = (await httpResponse.json()).result as CustomDiscsOverview;
  itemsStore.customDiscsLastUpdated = new Date();
  return itemsStore.customDiscs;
}

export async function retrieveCustomDiscStats(): Promise<CustomDiscStats[]> {
  // Don't reload if data is recent
  if (itemsStore.customDiscStats != null && new Date().getTime() - itemsStore.customDiscsStatsLastUpdated.getTime() < 30000)
    return itemsStore.customDiscStats;

  // Get custom disc stats
  let httpResponse = await fetch(`${Config.APIURL}/api/customDiscs/stats`, { method: "get" });
  if (httpResponse.status !== 200) return [];

  itemsStore.customDiscStats = (await httpResponse.json()).result.discs as CustomDiscStats[];
  itemsStore.customDiscsStatsLastUpdated = new Date();
  return itemsStore.customDiscStats;
}
