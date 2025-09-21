import { google } from "googleapis";
import { compareAsc } from "date-fns";
import type { CalendarProvider } from "./calendar-provider.interface";
import type { CalendarEvent } from "../types/calendar";
import { CALENDAR_CONFIG } from "../config/constants";
import { getGoogleAuthCredentials, getCalendarIds } from "../config/environment";

export class GoogleCalendarProvider implements CalendarProvider {
  public readonly name = "google";

  private auth: any;
  private calendar: any;
  private calendarIds: string[];

  constructor(env: NodeJS.ProcessEnv | Record<string, string | undefined>) {
    this.auth = new google.auth.GoogleAuth({
      credentials: getGoogleAuthCredentials(env),
      scopes: CALENDAR_CONFIG.SCOPES,
    });

    this.calendar = google.calendar({ version: "v3", auth: this.auth });
    this.calendarIds = getCalendarIds(env);
  }

  async getEvents(startDate: Date, endDate: Date): Promise<CalendarEvent[]> {
    console.log(`Fetching events from ${this.calendarIds.length} Google calendars`);

    try {
      // Fetch events from all calendars in parallel
      const calendarResponses = await Promise.all(
        this.calendarIds.map((calendarId) =>
          this.calendar.events.list({
            calendarId,
            timeMin: startDate.toISOString(),
            timeMax: endDate.toISOString(),
            maxResults: 500,
            singleEvents: true,
            orderBy: "startTime",
          }),
        ),
      );

      // Merge events from all calendars
      const allEvents = calendarResponses.flatMap(
        (response) => response.data.items || [],
      );

      // Deduplicate events based on iCalUID
      const uniqueEvents = this.deduplicateEvents(allEvents);

      // Sort by start time
      return this.sortEventsByStartTime(uniqueEvents);
    } catch (error) {
      console.error("Failed to fetch Google Calendar events:", error);
      throw new Error(`Google Calendar API error: ${error}`);
    }
  }

  private deduplicateEvents(events: CalendarEvent[]): CalendarEvent[] {
    const seenUIDs = new Set<string>();

    return events.filter((event) => {
      if (!event.iCalUID) {
        return true; // Keep events without iCalUID
      }

      if (seenUIDs.has(event.iCalUID)) {
        return false; // Skip duplicate
      }

      seenUIDs.add(event.iCalUID);
      return true; // Keep first occurrence
    });
  }

  private sortEventsByStartTime(events: CalendarEvent[]): CalendarEvent[] {
    return events.sort((a, b) => {
      const aTime = new Date(a.start?.dateTime || a.start?.date || 0);
      const bTime = new Date(b.start?.dateTime || b.start?.date || 0);
      return compareAsc(aTime, bTime);
    });
  }
}