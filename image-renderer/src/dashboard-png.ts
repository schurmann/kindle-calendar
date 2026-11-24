import sharp, { type OverlayOptions } from "sharp";
import type { Agenda } from "./agenda";
import { CALENDAR_CONFIG, DASHBOARD_CONFIG } from "./config/constants";
import { getWeekNumber } from "./utils/date.utils";
import { formatEventTime } from "./utils/event-time";

const { WIDTH, HEIGHT } = DASHBOARD_CONFIG;
const { LOCALE } = CALENDAR_CONFIG;
const margin = 15;
const right = WIDTH - margin;
const bottom = HEIGHT - margin;
const agendaWidth = right - margin;
const titleLeft = 193;
const titleWidth = 570;

function escapeMarkup(value: string) {
  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function rect(
  x: number,
  y: number,
  width: number,
  height: number,
  fill: string,
) {
  return `<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${fill}"/>`;
}

function label(
  x: number,
  y: number,
  value: string,
  size: number,
  attributes = "",
) {
  return `<text x="${x}" y="${y}" font-size="${size}" ${attributes}>${escapeMarkup(value)}</text>`;
}

function renderTitle(title: string) {
  const cleanTitle =
    escapeMarkup(title).replace(/\s+/gu, " ").trim() || "Event";
  return sharp({
    text: {
      text: cleanTitle,
      font: "Noto Sans 26",
      width: titleWidth,
      rgba: true,
      wrap: "word-char",
    },
  })
    .png()
    .toBuffer({ resolveWithObject: true });
}

export async function renderDashboardPng(agenda: Agenda) {
  const { batteryInfo, daysWithEvents, eventsByDay, today } = agenda;
  const parts = [rect(0, 0, WIDTH, HEIGHT, "white")];
  const titles: OverlayOptions[] = [];
  let y = margin;
  if (batteryInfo.level !== null) {
    const batteryX = right - 128;
    const fill = (30 * Math.min(100, batteryInfo.level)) / 100;
    parts.push(
      rect(batteryX, 27, 34, 20, "#000"),
      rect(batteryX + 2, 29, 30, 16, "#fff"),
      rect(batteryX + 2, 29, fill, 16, "#000"),
      rect(batteryX + 34, 33, 4, 8, "#000"),
      label(
        right - 1,
        44,
        batteryInfo.text,
        18,
        'text-anchor="end" font-weight="bold"',
      ),
      rect(margin, 60, agendaWidth, 2, "#000"),
    );
    y = 72;
  }

  let previousWeek: number | undefined;
  let previousMonth = -1;

  for (const day of daysWithEvents) {
    const week = getWeekNumber(day);
    const headings: string[] = [];
    let dayTop = y;
    if (previousWeek !== undefined) {
      for (
        let gap = previousWeek + 1;
        gap < week && dayTop + 34 <= bottom;
        gap++
      ) {
        headings.push(
          rect(margin, dayTop, agendaWidth, 34, "#f0f0f0"),
          label(
            WIDTH / 2,
            dayTop + 23,
            `V.${gap} (inga händelser)`,
            16,
            'text-anchor="middle" fill="#666" font-style="italic"',
          ),
        );
        dayTop += 34;
      }
    }
    if (week !== previousWeek) {
      headings.push(
        rect(35, dayTop + 5, 52, 26, "#000"),
        label(
          61,
          dayTop + 24,
          `V.${week}`,
          16,
          'text-anchor="middle" fill="#fff" font-weight="bold"',
        ),
      );
      dayTop += 38;
    }
    if (dayTop + 60 > bottom) break;

    const events = eventsByDay.get(day.toDateString()) ?? [];
    const times: string[] = [];
    const dayTitles: OverlayOptions[] = [];
    let eventTop = dayTop + 6;
    for (const event of events) {
      if (eventTop + 34 + 5 > bottom) break;
      const title = await renderTitle(event.summary || "Event");
      const rowHeight = Math.max(34, title.info.height + 10);
      if (eventTop + rowHeight + 5 > bottom) break;
      dayTitles.push({
        input: title.data,
        left: titleLeft,
        top: eventTop + Math.floor((rowHeight - title.info.height) / 2),
      });
      times.push(
        label(
          right - 20,
          eventTop + Math.floor(rowHeight / 2) + 8,
          formatEventTime(event),
          24,
          'text-anchor="end" font-weight="bold"',
        ),
      );
      eventTop += rowHeight;
    }
    if (events.length && !dayTitles.length) break;

    const dayBottom = Math.max(dayTop + 60, eventTop + 5);
    const weekend = day.getDay() === 0 || day.getDay() === 6;
    const isToday = day.toDateString() === today.toDateString();
    const month =
      day.getMonth() === previousMonth
        ? ""
        : ` ${day.toLocaleDateString(LOCALE, { month: "long" })}`;
    const weekday = day.toLocaleDateString(LOCALE, { weekday: "short" });

    parts.push(
      ...headings,
      rect(
        margin,
        dayTop,
        agendaWidth,
        dayBottom - dayTop,
        weekend ? "#f0f0f0" : "#fff",
      ),
      rect(margin, dayBottom - 1, agendaWidth, 1, "#000"),
      label(35, dayTop + 28, String(day.getDate()), 28, 'font-weight="bold"'),
      label(35, dayTop + 50, weekday + month, 17),
      ...times,
    );
    if (isToday) {
      parts.push(
        rect(75, dayTop + 8, 52, 24, "#333"),
        label(
          101,
          dayTop + 25,
          "Today",
          14,
          'text-anchor="middle" fill="#fff" font-weight="bold"',
        ),
      );
    }
    titles.push(...dayTitles);
    if (dayTitles.length < events.length) break;
    y = dayBottom;
    previousWeek = week;
    previousMonth = day.getMonth();
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}"><g font-family="Noto Sans, sans-serif">${parts.join("")}</g></svg>`;
  return sharp(Buffer.from(svg))
    .composite(titles)
    .removeAlpha()
    .toColourspace("b-w")
    .png()
    .toBuffer();
}
