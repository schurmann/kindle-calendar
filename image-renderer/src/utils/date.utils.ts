import { getWeek, eachDayOfInterval, addDays } from "date-fns";

// Helper function to get ISO week number (Monday-based weeks)
export function getWeekNumber(date: Date): number {
  return getWeek(date, { weekStartsOn: 1 }); // Monday = 1
}

export function generateDateRange(startDate: Date, days: number): Date[] {
  return eachDayOfInterval({
    start: startDate,
    end: addDays(startDate, days - 1),
  });
}
