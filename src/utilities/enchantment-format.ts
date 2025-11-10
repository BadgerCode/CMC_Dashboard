export function formatEnchantment(enchantment: string): string {
    return enchantment.replace("MINECRAFT:", "").replace(/_/g, " ");
}