import type { ProcessedEvent } from "../types/calendar";
import { CALENDAR_CONFIG } from "../config/constants";
import { EventItem } from "./EventItem";
import { css, Style, cx } from "hono/css";

interface DayRowProps {
  day: Date;
  events: ProcessedEvent[];
  isToday: boolean;
  isWeekend: boolean;
  isLastDayOfWeek: boolean;
  isFirstDayOfMonth: boolean;
  monthName: string;
}

export function DayRow({
  day,
  events,
  isToday,
  isWeekend,
  isFirstDayOfMonth,
  monthName,
}: DayRowProps) {
  const dayNum = day.getDate();
  const dayName = day.toLocaleDateString(CALENDAR_CONFIG.LOCALE, {
    weekday: "short",
  });

  const dayRowClass = css`
    display: flex;
    border-bottom: 1px solid #000;
    padding: 4px 20px;
    min-height: 50px;
    background: white;
    align-items: center;
  `;

  const weekendClass = css`
    background: #f0f0f0;
  `;

  const dayInfoClass = css`
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 140px;
    flex-shrink: 0;
  `;

  const dayDetailsClass = css`
    text-align: left;
  `;

  const dayDateClass = css`
    font-weight: bold;
    font-size: 28px;
    color: #000;
    line-height: 1;
    margin-bottom: 2px;
    display: flex;
    align-items: center;
  `;

  const dayNameClass = css`
    font-weight: bold;
    font-size: 18px;
    text-transform: capitalize;
    color: #000;
    line-height: 1;
  `;

  const monthNameClass = css`
    font-weight: normal;
    font-size: 18px;
    color: #666;
  `;

  const todayBadgeClass = css`
    display: inline-block;
    background: #333;
    color: white;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 14px;
    font-weight: bold;
    margin-left: 8px;
    vertical-align: middle;
  `;

  const eventsSectionClass = css`
    flex: 1;
    padding-left: 12px;
    display: flex;
    flex-direction: column;
    justify-content: center;
  `;

  const dayRowClasses = cx(dayRowClass, isToday, isWeekend && weekendClass);

  return (
    <>
      <Style />
      <div class={dayRowClasses}>
        <div class={dayInfoClass}>
          <div class={dayDetailsClass}>
            <div class={dayDateClass}>
              {dayNum}
              {isToday && <span class={todayBadgeClass}>Today</span>}
            </div>
            <div class={dayNameClass}>
              {dayName}
              {isFirstDayOfMonth && (
                <span class={monthNameClass}> {monthName}</span>
              )}
            </div>
          </div>
        </div>
        <div class={eventsSectionClass}>
          {events.map((event, index) => (
            <EventItem
              key={`${event.iCalUID || "event"}-${index}`}
              event={event}
            />
          ))}
        </div>
      </div>
    </>
  );
}
