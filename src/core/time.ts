/** @file Date utilities */

/** Length of a day, in ms */
export const DAY_MS = 24 * 60 * 60 * 1000

export type Level = "year" | "month" | "day" | "hour" | "minute" | "second"

/** Granularities by descending size order */
export const LEVELS: Level[] = ["year", "month", "day", "hour", "minute", "second"]

/** Modify a date by a given amount and time level */
export function addToDate(date: Date, amount: number, level: Level): Date {
  const newDate = new Date(date)
  if (level == "year") newDate.setFullYear(newDate.getFullYear() + amount)
  else if (level == "month") newDate.setMonth(newDate.getMonth() + amount)
  else if (level == "day") newDate.setDate(newDate.getDate() + amount)
  else if (level == "hour") newDate.setHours(newDate.getHours() + amount)
  else if (level == "minute") newDate.setMinutes(newDate.getMinutes() + amount)
  else if (level == "second") newDate.setSeconds(newDate.getSeconds() + amount)
  return newDate
}

/** Round a date to the start of a given granularity level */
export function dateStartOf(date: Date, level: Level): Date {
  const newDate = new Date(date)
  if (LEVELS.indexOf(level) <= LEVELS.indexOf("year")) newDate.setMonth(0)
  if (LEVELS.indexOf(level) <= LEVELS.indexOf("month")) newDate.setDate(1)
  if (LEVELS.indexOf(level) <= LEVELS.indexOf("day")) newDate.setHours(0)
  if (LEVELS.indexOf(level) <= LEVELS.indexOf("hour")) newDate.setMinutes(0)
  if (LEVELS.indexOf(level) <= LEVELS.indexOf("minute")) newDate.setSeconds(0)
  return newDate
}

/** Round a date to the end of a given granularity level */
export function dateEndOf(date: Date, level: Level): Date {
  // Go to the start of the next time unit, then subtract 1 second
  return addToDate(dateStartOf(addToDate(date, 1, level), level), -1, "second")
}

/** Check if a date is within a time limit from (before or after) today */
export const isRecent = (date: Date, days = 30): boolean =>
  Math.abs(new Date().getTime() - date.getTime()) <= days * DAY_MS

/** Format a date like `YYYY-MM-DDTHH:mm:ss`, similar to date.toISOString() but without resetting time zone */
export function dateToString(date: Date): string {
  const pad2 = (n: number): string => String(n).padStart(2, "0")
  const year = String(date.getFullYear())
  const month = pad2(date.getMonth() + 1)
  const day = pad2(date.getDate())
  const hour = pad2(date.getHours())
  const minute = pad2(date.getMinutes())
  const second = pad2(date.getSeconds())
  return `${year}-${month}-${day}T${hour}:${minute}:${second}`
}

/** Format a date according to a given level of granularity */
export function formatDateOnLevel(date: Date, level: Level): string {
  const iso = dateToString(date)
  if (level == "year") return iso.slice(0, 4)
  if (level == "month") return iso.slice(0, 7)
  if (level == "day") return iso.slice(0, 10)
  if (level == "hour") return iso.slice(0, 13) + ":00"
  if (level == "minute") return iso.slice(0, 16)
  if (level == "second") return iso.slice(0, 19)
  return iso
}

/** Format time as hh:mm:ss if hours > 0, else mm:ss */
export function transformSeconds(seconds: number) {
  const hhmmss = new Date(seconds * 1000).toISOString().substring(11, 19)
  return hhmmss.replace(/^00:/, "")
}
