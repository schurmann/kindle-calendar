import type { ProcessedEvent } from "../types/calendar";
import type { BatteryInfo } from "../types/dashboard";
import { CALENDAR_CONFIG } from "../config/constants";
import { getWeekNumber } from "../utils/date.utils";
import { StatusBar } from "./StatusBar";
import { WeekBadge } from "./WeekBadge";
import { EmptyWeekBlock } from "./EmptyWeekBlock";
import { DayRow } from "./DayRow";
import { css } from "hono/css";

interface CalendarPageProps {
  daysWithEvents: Date[];
  eventsByDay: Map<string, ProcessedEvent[]>;
  batteryInfo: BatteryInfo;
  today: Date;
}

export function CalendarPage({
  daysWithEvents,
  eventsByDay,
  batteryInfo,
  today,
}: CalendarPageProps) {
  let lastWeekWithEvents = -1;
  let lastMonthDisplayed = -1;

  const calendarContent = daysWithEvents
    .map((day, index) => {
      const weekNum = getWeekNumber(day);
      const isNewWeek =
        index === 0 || getWeekNumber(daysWithEvents[index - 1]) !== weekNum;
      const isLastDayOfWeek =
        index < daysWithEvents.length - 1 &&
        getWeekNumber(daysWithEvents[index + 1]) !== weekNum;
      const monthNum = day.getMonth();
      const isFirstDayOfMonth = monthNum !== lastMonthDisplayed;
      const monthName = day.toLocaleDateString(CALENDAR_CONFIG.LOCALE, {
        month: "long",
      });

      const elements = [];

      // Add shaded blocks for empty weeks
      if (lastWeekWithEvents !== -1 && weekNum > lastWeekWithEvents + 1) {
        const emptyWeeks = [];
        for (let w = lastWeekWithEvents + 1; w < weekNum; w++) {
          emptyWeeks.push(w);
        }
        emptyWeeks.forEach((w, emptyIndex) => {
          const isLastEmpty = emptyIndex === emptyWeeks.length - 1;
          elements.push(
            <EmptyWeekBlock
              key={`empty-${w}`}
              weekNumber={w}
              isLastEmpty={isLastEmpty}
            />,
          );
        });
      }

      // Add week badge for new weeks
      if (isNewWeek) {
        elements.push(
          <WeekBadge key={`week-${weekNum}`} weekNumber={weekNum} />,
        );
      }

      lastWeekWithEvents = weekNum;
      if (isFirstDayOfMonth) {
        lastMonthDisplayed = monthNum;
      }

      const dayEvents = eventsByDay.get(day.toDateString()) || [];
      const isToday = day.toDateString() === today.toDateString();
      const isWeekend = day.getDay() === 0 || day.getDay() === 6;

      elements.push(
        <DayRow
          key={day.toDateString()}
          day={day}
          events={dayEvents}
          isToday={isToday}
          isWeekend={isWeekend}
          isLastDayOfWeek={isLastDayOfWeek}
          isFirstDayOfMonth={isFirstDayOfMonth}
          monthName={monthName}
        />,
      );

      return elements;
    })
    .flat();

  const calendarClass = css`
    height: calc(100% - 50px);
    overflow: hidden;
  `;

  return (
    <div
      style={
        batteryInfo.level !== null
          ? `--battery-width: ${batteryInfo.fillWidth}`
          : ""
      }
    >
      <StatusBar batteryInfo={batteryInfo} />
      <div class={calendarClass}>{calendarContent}</div>
    </div>
  );
}
