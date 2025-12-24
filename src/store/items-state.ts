import type { CustomDiscsOverview } from "@/api/customDiscs/customDiscs";
import type { VillagerTrade } from "@/api/villagerTrades/villagerTrades";
import { reactive } from "vue";

export interface ItemsOverview {
  customDiscs: CustomDiscsOverview | null;
  villagerTrades: VillagerTrade[];
  villagerTradesLastUpdated: Date;
}

export const itemsStore = reactive({
  customDiscs: null,
  villagerTrades: [],
  villagerTradesLastUpdated: new Date(0),
} as ItemsOverview);
