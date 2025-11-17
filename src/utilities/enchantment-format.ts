export function formatEnchantment(enchantment: string): string {
    return enchantment.toLocaleLowerCase().replace("minecraft:", "").replace(/_/g, " ");
}