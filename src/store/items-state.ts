import type { CustomDisc, CustomDiscsOverview, CustomDiscStats } from "@/api/customDiscs/customDiscs";
import type { VillagerTrade } from "@/api/villagerTrades/villagerTrades";
import { reactive } from "vue";

export const itemsStore = reactive({
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
