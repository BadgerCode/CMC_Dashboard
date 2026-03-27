export function formatItemType(itemType: string | null | undefined, defaultValue?: string | null | undefined): string {
  if (!itemType) return defaultValue ?? "";

  // Replace underscores with spaces & lowercase
  let formattedType = itemType.replace(/_/g, " ").toLocaleLowerCase();

  // Capitalise first letter
  return formattedType.replace(/^./, formattedType[0]!.toUpperCase());
}
