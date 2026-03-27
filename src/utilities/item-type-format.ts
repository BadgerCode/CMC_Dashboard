export function formatItemType(itemType: string | null | undefined, defaultValue?: string | null | undefined): string {
  if (!itemType) return defaultValue ?? "";

  // TODO: Lowercase & capitalise first letter. Some places that use this want it uppercase; make them upper case it
  return itemType.replace(/_/g, " ");
}
