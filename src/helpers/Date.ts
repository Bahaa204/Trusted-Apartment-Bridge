import type { DateReturn, DateString } from "../types/date";

/**
 * formats the date to YYYY-MM-DD format
 * @param {date} date: the date to be formatted
 */
export function formatDate(date: Date): DateString {
  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/**
 * returns a tuple that contains the min date and the max date
 * @param {string[]} timestamps: a list of timestamps
 */
export function GetMinMaxDate(timestamps: string[]): DateReturn {
  const times = timestamps
    .map((timestamp) => new Date(timestamp).getTime())
    .filter((time) => !isNaN(time));

  if (times.length === 0) {
    const today = new Date();
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(today.getMonth() - 1);

    return {
      minInputDate: formatDate(oneMonthAgo),
      maxInputDate: formatDate(today),
    };
  }

  const minDate = new Date(Math.min(...times));
  const maxDate = new Date(Math.max(...times));

  minDate.setMonth(minDate.getMonth() - 1);

  return {
    minInputDate: formatDate(minDate),
    maxInputDate: formatDate(maxDate),
  };
}
