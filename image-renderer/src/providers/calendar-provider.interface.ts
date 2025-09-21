import type { CalendarEvent } from "../types/calendar";

export interface CalendarProvider {
  /**
   * Fetches calendar events within the specified date range
   * @param startDate - The start date for fetching events
   * @param endDate - The end date for fetching events
   * @returns Promise resolving to an array of calendar events
   */
  getEvents(startDate: Date, endDate: Date): Promise<CalendarEvent[]>;

  /**
   * Provider identifier for logging and debugging
   */
  readonly name: string;
}

export enum CalendarProviderType {
  GOOGLE = "google",
  MOCK = "mock",
  // Future providers: OUTLOOK = "outlook", CALDAV = "caldav", etc.
}