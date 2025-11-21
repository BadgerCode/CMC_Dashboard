import type { ShopData } from "@/api/shops/shopdata";
import { reactive } from "vue";

export interface ShopOverview {
  shops: ShopData[];
  itemTypes: string[];
  potionEffects: string[];
  enchantments: string[];
  customDiscSongs: string[];
  lastUpdated: Date;
}

export const shopsStore = reactive({
  shops: [] as ShopData[],
  itemTypes: [] as string[],
  potionEffects: [] as string[],
  enchantments: [] as string[],
  lastUpdated: new Date(0),
} as ShopOverview);
