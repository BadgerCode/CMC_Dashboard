import { Config } from "@/config";
import { itemsStore } from "@/store/items-state";
import type { AlchemyConversionsResponse, AlchmeyItem } from "./alchemyConversions";

export async function retrieveAlchemyConversions(): Promise<{ [itemType: string]: AlchmeyItem[][] }> {
  // Don't reload if data is recent
  if (Object.keys(itemsStore.alchemyConversions).length > 0) return itemsStore.alchemyConversions;

  // Get data
  let response = staticResponse;

  // TODO: Add real API endpoint
  // let httpResponse = await fetch(`${Config.APIURL}/api/alchemyConversions`, { method: "get" });
  // if (httpResponse.status !== 200) return {};
  // let response = (await httpResponse.json()).result as AlchemyConversionsResponse;

  // A conversion is an ordered list of item type/quantity pairs
  // Build up a lookup dictionary of item types to all available conversions for that item type
  let conversions = {} as { [itemType: string]: AlchmeyItem[][] };
  for (const conversion of response.conversions) {
    for (const item of conversion) {
      if (!conversions[item.itemType]) conversions[item.itemType] = [];

      conversions[item.itemType]?.push(conversion);
    }
  }

  itemsStore.alchemyConversions = conversions;
  itemsStore.alchemyConversionsLastUpdated = new Date(response.lastUpdated);
  return itemsStore.alchemyConversions;
}

const staticResponse = {
  lastUpdated: "2026-05-12T22:55:00Z",
  conversions: [
    // Concrete Cycle
    [
      { itemType: "BLACK_CONCRETE_POWDER", quantity: 1 },
      { itemType: "BLACK_CONCRETE", quantity: 1 },
      { itemType: "BLACK_CONCRETE_POWDER", quantity: 1 },
    ],
    [
      { itemType: "BLUE_CONCRETE_POWDER", quantity: 1 },
      { itemType: "BLUE_CONCRETE", quantity: 1 },
      { itemType: "BLUE_CONCRETE_POWDER", quantity: 1 },
    ],
    [
      { itemType: "BROWN_CONCRETE_POWDER", quantity: 1 },
      { itemType: "BROWN_CONCRETE", quantity: 1 },
      { itemType: "BROWN_CONCRETE_POWDER", quantity: 1 },
    ],
    [
      { itemType: "CYAN_CONCRETE_POWDER", quantity: 1 },
      { itemType: "CYAN_CONCRETE", quantity: 1 },
      { itemType: "CYAN_CONCRETE_POWDER", quantity: 1 },
    ],
    [
      { itemType: "GRAY_CONCRETE_POWDER", quantity: 1 },
      { itemType: "GRAY_CONCRETE", quantity: 1 },
      { itemType: "GRAY_CONCRETE_POWDER", quantity: 1 },
    ],
    [
      { itemType: "GREEN_CONCRETE_POWDER", quantity: 1 },
      { itemType: "GREEN_CONCRETE", quantity: 1 },
      { itemType: "GREEN_CONCRETE_POWDER", quantity: 1 },
    ],
    [
      { itemType: "LIGHT_BLUE_CONCRETE_POWDER", quantity: 1 },
      { itemType: "LIGHT_BLUE_CONCRETE", quantity: 1 },
      { itemType: "LIGHT_BLUE_CONCRETE_POWDER", quantity: 1 },
    ],
    [
      { itemType: "LIGHT_GRAY_CONCRETE_POWDER", quantity: 1 },
      { itemType: "LIGHT_GRAY_CONCRETE", quantity: 1 },
      { itemType: "LIGHT_GRAY_CONCRETE_POWDER", quantity: 1 },
    ],
    [
      { itemType: "LIME_CONCRETE_POWDER", quantity: 1 },
      { itemType: "LIME_CONCRETE", quantity: 1 },
      { itemType: "LIME_CONCRETE_POWDER", quantity: 1 },
    ],
    [
      { itemType: "MAGENTA_CONCRETE_POWDER", quantity: 1 },
      { itemType: "MAGENTA_CONCRETE", quantity: 1 },
      { itemType: "MAGENTA_CONCRETE_POWDER", quantity: 1 },
    ],
    [
      { itemType: "ORANGE_CONCRETE_POWDER", quantity: 1 },
      { itemType: "ORANGE_CONCRETE", quantity: 1 },
      { itemType: "ORANGE_CONCRETE_POWDER", quantity: 1 },
    ],
    [
      { itemType: "PINK_CONCRETE_POWDER", quantity: 1 },
      { itemType: "PINK_CONCRETE", quantity: 1 },
      { itemType: "PINK_CONCRETE_POWDER", quantity: 1 },
    ],
    [
      { itemType: "PURPLE_CONCRETE_POWDER", quantity: 1 },
      { itemType: "PURPLE_CONCRETE", quantity: 1 },
      { itemType: "PURPLE_CONCRETE_POWDER", quantity: 1 },
    ],
    [
      { itemType: "RED_CONCRETE_POWDER", quantity: 1 },
      { itemType: "RED_CONCRETE", quantity: 1 },
      { itemType: "RED_CONCRETE_POWDER", quantity: 1 },
    ],
    [
      { itemType: "WHITE_CONCRETE_POWDER", quantity: 1 },
      { itemType: "WHITE_CONCRETE", quantity: 1 },
      { itemType: "WHITE_CONCRETE_POWDER", quantity: 1 },
    ],
    [
      { itemType: "YELLOW_CONCRETE_POWDER", quantity: 1 },
      { itemType: "YELLOW_CONCRETE", quantity: 1 },
      { itemType: "YELLOW_CONCRETE_POWDER", quantity: 1 },
    ],

    // Basic Stone Conversions
    [
      { itemType: "STONE", quantity: 1 },
      { itemType: "COBBLESTONE", quantity: 1 },
    ],
    [
      { itemType: "DEEPSLATE", quantity: 1 },
      { itemType: "COBBLED_DEEPSLATE", quantity: 1 },
    ],
  ],
} as AlchemyConversionsResponse;
