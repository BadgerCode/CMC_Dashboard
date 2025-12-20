import type { CustomDiscsOverview } from "@/api/customDiscs/customDiscs";
import { reactive } from "vue";

export interface ItemsOverview {
  customDiscs: CustomDiscsOverview | null;
}

export const itemsStore = reactive({
  customDiscs: null,
} as ItemsOverview);
