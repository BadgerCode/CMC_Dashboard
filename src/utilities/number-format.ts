export function formatNumber(number: number | null | undefined, maxDecimalPlaces: number, defaultValue?: string | null | undefined): string {
  if (number == null || number == undefined) return defaultValue ?? "";

  if (number > (1e+21)) return "A LOT";

  return "" + Number(number.toFixed(maxDecimalPlaces));
}
