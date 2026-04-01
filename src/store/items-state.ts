import type { CustomDisc, CustomDiscsOverview, CustomDiscStats } from "@/api/customDiscs/customDiscs";
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
};

export const itemsStore = reactive({
  customMusicDiscs: {} as { [discName: string]: CustomMusicDisc },
  customMusicDiscSources: new Set<string>(),
  customMusicDiscVersions: new Set<string>(),


  customDiscs: { discs: [], unsoldDiscs: 0 } as CustomDiscsOverview,
  customDiscLookup: {} as { [discName: string]: CustomDisc },
  customDiscsLastUpdated: new Date(0),
  customDiscStats: [] as CustomDiscStats[],
  customDiscsStatsLastUpdated: new Date(0),
  villagerTrades: [] as VillagerTrade[],
  villagerTradesLastUpdated: new Date(0),

  retrieveDisc(discName: string): CustomDisc {
    return (
      itemsStore.customDiscLookup[discName] ?? {
        name: discName,
        displayName: discName.replace("smponline_discs:", ""),
        source: "Unknown",
        version: "Unknown",
      }
    );
  },
});
