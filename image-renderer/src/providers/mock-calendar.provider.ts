import type { CalendarProvider } from "./calendar-provider.interface";
import type { CalendarEvent } from "../types/calendar";
import { getMockEvents } from "../utils/mock-data";

export class MockCalendarProvider implements CalendarProvider {
  public readonly name = "mock";

  async getEvents(startDate: Date, endDate: Date): Promise<CalendarEvent[]> {
    console.log(`Fetching mock calendar events between ${startDate.toISOString()} and ${endDate.toISOString()}`);

    // Get all mock events
    const allEvents = getMockEvents();

    // Filter events to only include those within the date range
    const filteredEvents = allEvents.filter((event) => {
      const eventStart = new Date(event.start?.dateTime || event.start?.date || 0);
      const eventEnd = new Date(event.end?.dateTime || event.end?.date || eventStart);

      // Event overlaps with date range if it starts before endDate and ends after startDate
      return eventStart < endDate && eventEnd >= startDate;
    });

    console.log(`Returning ${filteredEvents.length} mock events`);
    return filteredEvents;
  }
}