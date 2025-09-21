import type { ProcessedEvent } from "../types/calendar";
import { CALENDAR_CONFIG } from "../config/constants";
import { css, Style } from "hono/css";

interface EventItemProps {
  event: ProcessedEvent;
}

export function EventItem({ event }: EventItemProps) {
  let eventTitle = event.summary || "Event";
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

  const eventItemClass = css`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 2px 0;
    border-bottom: 1px solid #ddd;
    &:last-child {
      border-bottom: none;
    }
    &.event-continuation {
      font-style: italic;
    }
  `;

  const eventTitleClass = css`
    font-size: 26px;
    color: #000;
    line-height: 1.3;
    .event-continuation & {
      color: #555;
    }
  `;

  const eventTimeClass = css`
    font-size: 26px;
    font-weight: bold;
    color: #000;
    .event-continuation & {
      color: #777;
    }
  `;

  return (
    <>
      <Style />
      <div class={eventItemClass}>
        <span class={eventTitleClass}>{eventTitle}</span>
        <span class={eventTimeClass}>{eventTime}</span>
      </div>
    </>
  );
}
