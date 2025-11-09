import { Config } from "@/config";
import type { NearbyWaystone, ShopData } from "./shopdata";
import { parseSNBTData } from "@/utilities/snbt-processor";
import { shopsStore, type ShopOverview } from "@/store/shops-state";
import { loadWaystones } from "../waystones/api";
import type { Waystone } from "../waystones/waystone";
import { NearestNeighbour, type Point } from "@/utilities/closest-point";

export async function updateShops(): Promise<ShopOverview> {
  // Don't reload if data is recent
  if (Date.now() - shopsStore.lastUpdated.getTime() < Config.MAX_CACHE_AGE_MINS * 60 * 1000) return shopsStore;

  const nearestNeighbour = new NearestNeighbour<Waystone>();
  try {
    let response = await loadWaystones();
    nearestNeighbour.setPoints(response.waystones.map((ws) => ({ x: ws.x, y: ws.z, data: ws } as Point<Waystone>)));
  } catch (error) {
    // Prevent this error from stopping shops from loading
    console.error(error);
  }

  let url = `${Config.APIURL}/api/chestshops`;
  let httpResponse = await fetch(url, { method: "get" });

  if (httpResponse.status !== 200) throw new Error("Failed to retrieve chest shops");

  let response = await httpResponse.json();
  let responseItems = response.items as ShopData[];
  for (const shop of responseItems) {
    shop.item.parsedSNBT = parseSNBTData(shop.item.snbt);

    // Work out nearest waystone
    shop.nearestWaystones = nearestNeighbour
      .findNearest(shop.location.x, shop.location.z, 1)
      .map((r) => {
        let directionRotation = shop.location.z < r.point.y ? 0 : 180;
        directionRotation += (directionRotation == 0 ? 1 : -1) * (shop.location.x < r.point.x ? -45 : 45);

        return {
          name: r.point.data.name,
          distance: r.distance,
          directionRotation: directionRotation,
        } as NearbyWaystone;
      })
      .sort((a, b) => a.distance - b.distance);
  }

  shopsStore.lastUpdated = new Date(response.lastUpdated);
  shopsStore.shops.splice(0);
  shopsStore.shops.push(...responseItems);

  // Get item types list
  shopsStore.itemTypes = [...new Set(shopsStore.shops.map((s) => s.item.type).sort())];

  // Get potion effects list
  shopsStore.potionEffects = [...new Set(shopsStore.shops.map((s) => s.item.parsedSNBT.potionEffect).filter((e) => e != null))];

  // Get enchantments list
  shopsStore.enchantments = [...new Set(shopsStore.shops.flatMap((s) => s.item.parsedSNBT.enchantments))];

  return shopsStore;
}
