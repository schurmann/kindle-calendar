import type { ProcessedEvent } from "../types/calendar";
import { formatEventTime } from "../utils/event-time";
import { css, Style } from "hono/css";

interface EventItemProps {
  event: ProcessedEvent;
}

export function EventItem({ event }: EventItemProps) {
  const eventTitle = event.summary || "Event";
  const eventTime = formatEventTime(event);

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
