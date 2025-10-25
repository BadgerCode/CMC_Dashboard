export function formatDate(dateTime: string | null | undefined, defaultValue?: string | null | undefined): string {
  if (!dateTime) return defaultValue ?? "";

  let date = new Date(dateTime);
  const dateFormatOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };

  return `${date.toLocaleDateString(undefined, dateFormatOptions)}`;
}
