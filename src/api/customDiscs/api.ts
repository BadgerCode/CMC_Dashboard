import { Config } from "@/config";
import type { CustomDiscsOverview, CustomDiscStats } from "./customDiscs";
import { itemsStore, type CustomMusicDisc } from "@/store/items-state";

export async function retrieveCustomDiscs(): Promise<void> {
  // Don't reload if data is recent
  if (new Date().getTime() - itemsStore.customDiscsLastUpdated.getTime() < 30000)
    return;

  // Get custom discs
  let httpResponse = await fetch(`${Config.APIURL}/api/v2/customDiscs`, { method: "get" });
  if (httpResponse.status !== 200) {
    console.error(`Failed to load custom discs- ${httpResponse.status}`)
    return;
  }
  let response = (await httpResponse.json()).result as CustomDiscsOverview;

  // Update custom music disc store
  for (const disc of response.discs) {
    let storeDisc = getDiscFromStore(disc.name);
    storeDisc.displayName = disc.displayName;
    storeDisc.source = disc.source;
    storeDisc.version = disc.version;

    itemsStore.customMusicDiscSources.add(disc.source);
    itemsStore.customMusicDiscVersions.add(disc.version);
  }

  itemsStore.customDiscsLastUpdated = new Date();
}

export async function retrieveCustomDiscStats(): Promise<void> {
  // Don't reload if data is recent
  if (new Date().getTime() - itemsStore.customDiscsStatsLastUpdated.getTime() < 30000)
    return;

  // Get custom disc stats
  let httpResponse = await fetch(`${Config.APIURL}/api/customDiscs/stats`, { method: "get" });
  if (httpResponse.status !== 200) {
    console.error(`Failed to load custom disc stats- ${httpResponse.status}`)
    return;
  }
  let response = (await httpResponse.json()).result.discs as CustomDiscStats[];

  // Update custom music disc store
  for (const discStats of response) {
    let storeDisc = getDiscFromStore(discStats.discName);
    storeDisc.numSales = discStats.numSales;
    storeDisc.minPrice = discStats.minPrice;
    storeDisc.maxPrice = discStats.maxPrice;
    storeDisc.averagePrice = discStats.averagePrice;
    storeDisc.latestSale = discStats.latestSale;
  }

  itemsStore.customDiscsStatsLastUpdated = new Date();
}

function getDiscFromStore(discName: string): CustomMusicDisc {
  // Create an entry if it doesn't exist
  if (!itemsStore.customMusicDiscs[discName]) {
    itemsStore.customMusicDiscs[discName] = {
      displayName: discName.replace("smponline_discs:", "").replace("_", " "),
      name: discName,
      source: "Unknown",
      version: "Unknown",
      numSales: 0,
      minPrice: 0,
      maxPrice: 0,
      averagePrice: 0
    };
  }

  return itemsStore.customMusicDiscs[discName];
}
