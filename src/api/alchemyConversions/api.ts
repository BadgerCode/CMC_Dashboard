import { Config } from "@/config";
import { itemsStore } from "@/store/items-state";
import type { AlchemyConversionsResponse, AlchmeyItem } from "./alchemyConversions";

export async function retrieveAlchemyConversions(): Promise<{ [itemType: string]: AlchmeyItem }> {
  // Don't reload if data is recent
  if (Object.keys(itemsStore.alchemyConversions).length > 0) return itemsStore.alchemyConversions;

  // Get data
  let httpResponse = await fetch(`${Config.APIURL}/api/alchemyConversions`, { method: "get" });
  if (httpResponse.status !== 200) return {};
  let response = (await httpResponse.json()).result as AlchemyConversionsResponse;

  // Build up a lookup dictionary of item types to all available conversions for that item type
  let conversions = {} as { [itemType: string]: AlchmeyItem };
  for (const conversion of response.conversions) {
    // Track source
    conversions[conversion.source] = {
      creates: conversion,
      createdBy: [],
    };

    // Track target
    if (!conversions[conversion.target]) {
      conversions[conversion.target] = {
        creates: null,
        createdBy: [conversion],
      };
    } else {
      conversions[conversion.target]!.createdBy.push(conversion);
    }
  }

  itemsStore.alchemyConversions = conversions;
  itemsStore.alchemyConversionsLastUpdated = new Date(response.lastUpdated);
  return itemsStore.alchemyConversions;
}
