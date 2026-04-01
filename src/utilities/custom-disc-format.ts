import { itemsStore } from "@/store/items-state";

export function formatCustomDisc(discName: string): string {
  return itemsStore.customMusicDiscs[discName]?.displayName ?? discName;
}
