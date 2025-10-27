export function formatItemType(itemType: string | null | undefined, defaultValue?: string | null | undefined): string {
  if (!itemType) return defaultValue ?? "";

  return itemType.replace(/_/g, " ");
}
