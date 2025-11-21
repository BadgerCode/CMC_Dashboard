export function formatPotionEffect(effect: string): string {
  return effect
    .toLocaleLowerCase()
    .replace("minecraft:", "")
    .replace(/_/g, " ")
    .replace(/long (.*)/g, "$1 (Long)");
}

let potionTypes = ["POTION", "SPLASH_POTION", "LINGERING_POTION"];
export function isPotion(itemType: string): boolean {
  return potionTypes.indexOf(itemType) != -1;
}
