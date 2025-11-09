import type { Waystone } from "@/api/waystones/waystone";
import { reactive } from "vue";

export interface ServerWaystones {
  lastUpdated: Date;
  worlds: string[];
  waystones: Waystone[];
}

export const waystonesStore = reactive({
  waystones: [] as Waystone[],
  worlds: [] as string[],
  lastUpdated: new Date(0),
} as ServerWaystones);
