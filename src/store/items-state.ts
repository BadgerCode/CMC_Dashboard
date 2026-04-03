import type { VillagerTrade } from "@/api/villagerTrades/villagerTrades";
import { reactive } from "vue";

export interface CustomMusicDisc {
  name: string;
  displayName: string;
  source: string;
  version: string;
  numSales: number;
  minPrice: number;
  maxPrice: number;
  averagePrice: number;
  latestSale?: string;
}

export const itemsStore = reactive({
  customMusicDiscs: {} as { [discName: string]: CustomMusicDisc },
  customMusicDiscSources: new Set<string>(),
  customMusicDiscVersions: new Set<string>(),
  customMusicDiscsUnsold: 0,
  customDiscsLastUpdated: new Date(0),
  customDiscsStatsLastUpdated: new Date(0),

  villagerTrades: [] as VillagerTrade[],
  villagerTradesLastUpdated: new Date(0),
});
