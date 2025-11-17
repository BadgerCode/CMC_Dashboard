export function formatPotionEffect(effect: string): string {
    return effect
        .toLocaleLowerCase()
        .replace("minecraft:", "")
        .replace(/_/g, " ")
        .replace(/long (.*)/g, "$1 (Long)");
}