import { itemsStore } from "@/store/items-state";

export function formatCustomDisc(discName: string): string {
  let prettyName = itemsStore.customDiscs?.discs.find((d) => d.name == discName);
  return prettyName?.displayName ?? discName.replace("smponline_discs:", "").replace(/_/g, " ");
}
