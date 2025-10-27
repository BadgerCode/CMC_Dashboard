export function formatNumber(number: number | null | undefined, maxDecimalPlaces: number, defaultValue?: string | null | undefined): string {
  if (number == null || number == undefined) return defaultValue ?? "";

  return "" + Number(number.toFixed(maxDecimalPlaces));
}
