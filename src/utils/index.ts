import { format, eachDayOfInterval, parseISO, differenceInDays } from "date-fns";

/** Format a date string to display format */
export function formatDate(date: string | Date, fmt = "MMM dd"): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, fmt);
}

/** Generate an array of date strings between start and end (inclusive) */
export function getDateRange(start: string, end: string): string[] {
  return eachDayOfInterval({
    start: parseISO(start),
    end: parseISO(end),
  }).map((d) => format(d, "yyyy-MM-dd"));
}

/** Calculate number of nights between two dates */
export function getNights(start: string, end: string): number {
  return differenceInDays(parseISO(end), parseISO(start));
}

/** Format price with currency */
export function formatPrice(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

/** Generate an array of dates for the next N days starting from a given date */
export function generateDateColumns(
  startDate: string,
  days: number
): string[] {
  const start = parseISO(startDate);
  const end = new Date(start);
  end.setDate(end.getDate() + days - 1);
  return eachDayOfInterval({ start, end }).map((d) => format(d, "yyyy-MM-dd"));
}
