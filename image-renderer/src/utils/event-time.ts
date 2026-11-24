import type { ProcessedEvent } from "../types/calendar";
import { CALENDAR_CONFIG } from "../config/constants";

export function formatEventTime(event: ProcessedEvent): string {
  let eventTime = "";
  if (event.isMultiDay) {
    // Multi-day event - show with end date
    const endDayName = event.endDate.toLocaleDateString(
      CALENDAR_CONFIG.LOCALE,
      { weekday: "short" },
    );
    const endDate = event.endDate.getDate();
    const endMonth = event.endDate.toLocaleDateString(CALENDAR_CONFIG.LOCALE, {
      month: "short",
    });

    if (event.isAllDay) {
      eventTime = `t.o.m. ${endDayName} ${endDate} ${endMonth}`;
    } else {
      const startTimeStr = event.startTime!.toLocaleTimeString(
        CALENDAR_CONFIG.LOCALE,
        { hour: "2-digit", minute: "2-digit" },
      );
      eventTime = `${startTimeStr} - ${endDayName} ${endDate} ${endMonth}`;
    }
  } else {
    // Single day event
    if (event.isAllDay) {
      eventTime = "Heldag";
    } else if (event.startTime) {
      eventTime = event.startTime.toLocaleTimeString(CALENDAR_CONFIG.LOCALE, {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  }

  return eventTime;
}
