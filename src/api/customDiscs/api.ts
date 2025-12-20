import { Config } from "@/config";
import type { CustomDiscsOverview } from "./customDiscs";
import { itemsStore } from "@/store/items-state";

export async function retrieveCustomDiscs(): Promise<CustomDiscsOverview> {
  // Don't reload if data is recent
  if (itemsStore.customDiscs != null) return itemsStore.customDiscs;

  // Get custom discs
  let httpResponse = await fetch(`${Config.APIURL}/api/v2/customDiscs`, { method: "get" });
  if (httpResponse.status !== 200) return { discs: [], unsoldDiscs: 0 };

  itemsStore.customDiscs = (await httpResponse.json()).result as CustomDiscsOverview;
  return itemsStore.customDiscs;
}
