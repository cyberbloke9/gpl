import { toZonedTime, fromZonedTime, formatInTimeZone } from 'date-fns-tz';
import { format } from 'date-fns';

// Indian Standard Time constant
export const IST_TIMEZONE = 'Asia/Kolkata';

/**
 * Get current date/time in IST
 * @returns Date object representing current IST time
 */
export function getCurrentISTDate(): Date {
  return toZonedTime(new Date(), IST_TIMEZONE);
}

/**
 * Get current date in IST as YYYY-MM-DD string
 * @returns Date string in YYYY-MM-DD format for IST timezone
 */
export function getTodayIST(): string {
  return formatInTimeZone(new Date(), IST_TIMEZONE, 'yyyy-MM-dd');
}

/**
 * Get current hour in IST (0-23)
 * @returns Current hour in IST
 */
export function getCurrentHourIST(): number {
  return parseInt(formatInTimeZone(new Date(), IST_TIMEZONE, 'H'), 10);
}

/**
 * Convert any date to IST timezone
 * @param date - Date to convert
 * @returns Date object in IST timezone
 */
export function toIST(date: Date | string): Date {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return toZonedTime(dateObj, IST_TIMEZONE);
}

/**
 * Format date in IST timezone
 * @param date - Date to format
 * @param formatStr - date-fns format string
 * @returns Formatted date string in IST
 */
export function formatIST(date: Date | string, formatStr: string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return formatInTimeZone(dateObj, IST_TIMEZONE, formatStr);
}

/**
 * Convert IST date to UTC for database storage
 * @param istDate - Date in IST
 * @returns ISO string in UTC
 */
export function istToUTC(istDate: Date): string {
  return fromZonedTime(istDate, IST_TIMEZONE).toISOString();
}

/**
 * Check if a date string represents today in IST
 * @param dateString - Date string in YYYY-MM-DD format
 * @returns Boolean indicating if date is today in IST
 */
export function isTodayIST(dateString: string): boolean {
  return dateString === getTodayIST();
}

/**
 * Get date N days ago in IST
 * @param daysAgo - Number of days to subtract
 * @returns Date string in YYYY-MM-DD format
 */
export function getDateDaysAgoIST(daysAgo: number): string {
  const date = getCurrentISTDate();
  date.setDate(date.getDate() - daysAgo);
  return format(date, 'yyyy-MM-dd');
}

/**
 * Get first day of current month in IST
 * @returns Date string in YYYY-MM-DD format
 */
export function getFirstDayOfMonthIST(): string {
  const now = getCurrentISTDate();
  return format(new Date(now.getFullYear(), now.getMonth(), 1), 'yyyy-MM-dd');
}
