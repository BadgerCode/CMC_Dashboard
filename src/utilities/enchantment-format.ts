export function formatEnchantment(enchantment: string): string {
    return enchantment.replace("ENCHANTMENT_MINECRAFT:", "").replace(/_/g, " ");
}