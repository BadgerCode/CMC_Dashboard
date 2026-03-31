import type { CustomDiscsOverview, CustomDiscStats } from "@/api/customDiscs/customDiscs";
import type { VillagerTrade } from "@/api/villagerTrades/villagerTrades";
import { reactive } from "vue";

export interface ItemsOverview {
  customDiscs: CustomDiscsOverview | null;
  customDiscsLastUpdated: Date;
  customDiscStats: { [discName: string]: CustomDiscStats; };
  customDiscsStatsLastUpdated: Date;
  villagerTrades: VillagerTrade[];
  villagerTradesLastUpdated: Date;
}

export const itemsStore = reactive({
  customDiscs: null,
  customDiscsLastUpdated: new Date(0),
  customDiscStats: {},
  customDiscsStatsLastUpdated: new Date(0),
  villagerTrades: [],
  villagerTradesLastUpdated: new Date(0),
} as ItemsOverview);
