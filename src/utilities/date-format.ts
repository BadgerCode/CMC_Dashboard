export function formatDate(dateTime: string | null | undefined | Date, defaultValue?: string | null | undefined): string {
  if (!dateTime) return defaultValue ?? "";

  let date = new Date(dateTime);
  const dateFormatOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };

  return `${date.toLocaleDateString(undefined, dateFormatOptions)}`;
}

export function formatDateNoTime(dateTime: string | null | undefined | Date, defaultValue?: string | null | undefined): string {
  if (!dateTime) return defaultValue ?? "";

  let date = new Date(dateTime);
  const dateFormatOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };

  return `${date.toLocaleDateString(undefined, dateFormatOptions)}`;
}
