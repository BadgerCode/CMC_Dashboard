import type { CustomDisc, CustomDiscsOverview, CustomDiscStats } from "@/api/customDiscs/customDiscs";
import type { VillagerTrade } from "@/api/villagerTrades/villagerTrades";
import { reactive } from "vue";

export interface ItemsOverview {
  customDiscs: CustomDiscsOverview;
  customDiscLookup: { [discName: string]: CustomDisc };
  customDiscsLastUpdated: Date;
  customDiscStats: CustomDiscStats[];
  customDiscsStatsLastUpdated: Date;
  villagerTrades: VillagerTrade[];
  villagerTradesLastUpdated: Date;
}

export const itemsStore = reactive({
  customDiscs: { discs: [], unsoldDiscs: 0 },
  customDiscLookup: {},
  customDiscsLastUpdated: new Date(0),
  customDiscStats: [],
  customDiscsStatsLastUpdated: new Date(0),
  villagerTrades: [],
  villagerTradesLastUpdated: new Date(0),
} as ItemsOverview);
