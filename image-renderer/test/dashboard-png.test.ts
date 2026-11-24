import { expect, test } from "bun:test";
import sharp from "sharp";
import type { Agenda } from "../src/agenda";
import { renderDashboardPng } from "../src/dashboard-png";
import type { ProcessedEvent } from "../src/types/calendar";
import { parseBatteryInfo } from "../src/utils/battery.utils";

const today = new Date(2026, 10, 24, 8);
const event: ProcessedEvent = {
  summary: "Föräldramöte & uppföljning <grupp Å>",
  startTime: today,
  endDate: today,
  hour: 8,
  isAllDay: false,
  isMultiDay: false,
  totalDays: 1,
};

function agenda(events: ProcessedEvent[]): Agenda {
  return {
    today,
    daysWithEvents: [today],
    eventsByDay: new Map([[today.toDateString(), events]]),
    batteryInfo: parseBatteryInfo(),
  };
}

test("long titles wrap into the area below a single-line title", async () => {
  const single = await renderDashboardPng(agenda([event]));
  const wrapped = await renderDashboardPng(
    agenda([{ ...event, summary: (event.summary + " ").repeat(5) }]),
  );
  const titleBelowFirstLine = { left: 193, top: 120, width: 570, height: 80 };

  const extract = (png: Buffer) =>
    sharp(png)
      .extract(titleBelowFirstLine)
      .toColourspace("b-w")
      .raw()
      .toBuffer();
  const [shortArea, wrappedArea] = await Promise.all([
    extract(single),
    extract(wrapped),
  ]);
  expect(shortArea.every((pixel) => pixel === 255)).toBe(true);
  expect(wrappedArea.some((pixel) => pixel < 96)).toBe(true);
});

test("a wrapped event is omitted entirely when its row cannot fit", async () => {
  const shortEvents = Array.from({ length: 25 }, () => event);
  const oversized = { ...event, summary: (event.summary + " ").repeat(50) };
  const prefix = await renderDashboardPng(agenda(shortEvents));
  const overflow = await renderDashboardPng(
    agenda([...shortEvents, oversized]),
  );
  const oneMoreShortEvent = await renderDashboardPng(
    agenda([...shortEvents, event]),
  );
  expect(oneMoreShortEvent.equals(prefix)).toBe(false);
  expect(overflow.equals(prefix)).toBe(true);
});
