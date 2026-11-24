import { addDays, differenceInDays, startOfDay, subDays } from "date-fns";
import { DASHBOARD_CONFIG } from "./config/constants";
import { CalendarProviderFactory } from "./providers";
import type { ProcessedEvent } from "./types/calendar";
import type { BatteryInfo } from "./types/dashboard";
import { parseBatteryInfo } from "./utils/battery.utils";
import { generateDateRange } from "./utils/date.utils";

export interface Agenda {
  daysWithEvents: Date[];
  eventsByDay: Map<string, ProcessedEvent[]>;
  batteryInfo: BatteryInfo;
  today: Date;
}

export async function loadAgenda(battery?: string): Promise<Agenda> {
  const today = new Date();
  const days = generateDateRange(today, DASHBOARD_CONFIG.DAYS_TO_FETCH);
  const provider = CalendarProviderFactory.createFromEnvironment(process.env);
  const events = await provider.getEvents(
    today,
    addDays(today, DASHBOARD_CONFIG.DAYS_TO_FETCH),
  );
  const eventsByDay = new Map<string, ProcessedEvent[]>(
    days.map((day) => [day.toDateString(), []]),
  );

  for (const event of events) {
    const timed = event.start?.dateTime;
    const allDay = event.start?.date;
    if (!timed && !allDay) continue;

    const start = timed ? new Date(timed) : new Date(allDay + "T00:00:00");
    const startTime = timed ? start : null;
    let endDate = start;
    if (timed && event.end?.dateTime) {
      endDate = new Date(event.end.dateTime);
    }
    if (!timed) {
      // Calendar providers express all-day end dates as exclusive.
      endDate = subDays(
        event.end?.date ? new Date(event.end.date + "T00:00:00") : start,
        1,
      );
    }
    const totalDays =
      differenceInDays(startOfDay(endDate), startOfDay(start)) + 1;

    eventsByDay.get(start.toDateString())?.push({
      ...event,
      startTime,
      endDate,
      hour: startTime?.getHours() ?? 0,
      isAllDay: !timed,
      isMultiDay: totalDays > 1,
      totalDays,
    });
  }

  return {
    daysWithEvents: days.filter(
      (day, index) =>
        index === 0 || eventsByDay.get(day.toDateString())!.length > 0,
    ),
    eventsByDay,
    batteryInfo: parseBatteryInfo(battery),
    today,
  };
}
