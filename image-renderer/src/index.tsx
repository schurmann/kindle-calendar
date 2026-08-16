import { Hono } from "hono";
import puppeteer from "puppeteer";
import {
  addDays,
  subDays,
  startOfDay,
  differenceInDays,
} from "date-fns";

// Import types and configuration
import {
  DASHBOARD_CONFIG,
  SCROLLBAR_HIDE_CSS,
} from "./config/constants";
import { parseBatteryInfo } from "./utils/battery.utils";
import { generateDateRange } from "./utils/date.utils";
import { CalendarProviderFactory } from "./providers";
import { CalendarPage } from "./components/CalendarPage";
import { jsxRenderer } from "hono/jsx-renderer";
import sharp from "sharp";

const app = new Hono();

app.use(
  "*",
  jsxRenderer(({ children }) => {
    return (
      <html>
        <head>
          <title>Calendar Agenda</title>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link
            rel="preconnect"
            href="https://fonts.gstatic.com"
            crossorigin=""
          />
          <link
            href="https://fonts.googleapis.com/css2?family=Noto+Sans:ital,wght@0,100..900;1,100..900&display=swap"
            rel="stylesheet"
          />
          <style>
            {`
            body {
              font-family: Noto Sans, sans-serif;
              margin: 0;
              padding: 15px;
              background: white;
              width: ${DASHBOARD_CONFIG.WIDTH - 30}px;
              height: ${DASHBOARD_CONFIG.HEIGHT - 30}px;
              overflow: hidden;
              color: #000;
            }
          `}
          </style>
        </head>
        <body>
          <div>{children}</div>
        </body>
      </html>
    );
  }),
);

app.get("/dashboard.png", async (c) => {
  try {
    console.log("Starting dashboard.png generation");
    const battery = c.req.query("battery");
    const calendarUrl = `http://localhost:3000/calendar${battery ? `?battery=${encodeURIComponent(battery)}` : ""}`;

    console.log("Launching browser for screenshot");
    const browser = await puppeteer.launch(
      process.env.CONTAINER
        ? {
          headless: 'shell',
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
          ],
        }
        : {}
    );
    const page = await browser.newPage();

    await page.setViewport({
      width: DASHBOARD_CONFIG.WIDTH,
      height: DASHBOARD_CONFIG.HEIGHT,
    });

    console.log(`Loading calendar page: ${calendarUrl}`);
    await page.goto(calendarUrl);

    // Hide scrollbars
    await page.addStyleTag({
      content: SCROLLBAR_HIDE_CSS,
    });

    // The load event doesn't guarantee webfonts are applied; without this the
    // screenshot can capture a fallback face
    await page.evaluate(() => document.fonts.ready);

    console.log("Taking screenshot");
    const screenshot = await page.screenshot({
      type: "png",
      clip: {
        x: 0,
        y: 0,
        width: DASHBOARD_CONFIG.WIDTH,
        height: DASHBOARD_CONFIG.HEIGHT,
      },
    });

    await browser.close();

    console.log("Converting to grayscale");
    const grayscalePng = await sharp(screenshot)
      .greyscale()
      .toColourspace('b-w')  // Single grayscale channel
      .png({
        compressionLevel: 6,
        adaptiveFiltering: false,
        force: true
      })
      .toBuffer();

    console.log("Dashboard.png generation completed successfully");
    c.header("Content-Type", "image/png");
    return c.body(new Uint8Array(grayscalePng));
  } catch (error) {
    console.error("Failed to generate dashboard", error);
    return c.text("Dashboard generation failed", 500);
  }
});


app.get("/calendar", async (c) => {
  try {
    console.log("Rendering calendar page");
    // Get battery parameter from query string
    const batteryParam = c.req.query("battery");

    // Create calendar provider based on environment configuration
    const calendarProvider = CalendarProviderFactory.createFromEnvironment(process.env);
    console.log(`Using calendar provider: ${calendarProvider.name}`);

    // Calculate date range for fetching events
    const startDate = new Date();
    const endDate = addDays(startDate, DASHBOARD_CONFIG.DAYS_TO_FETCH);

    // Fetch events from the configured provider
    const events = await calendarProvider.getEvents(startDate, endDate);

    // Get days starting from today
    const today = new Date();
    const monthDays = generateDateRange(today, DASHBOARD_CONFIG.DAYS_TO_FETCH);

    // Group events by day
    const eventsByDay = new Map();
    monthDays.forEach((day) => {
      eventsByDay.set(day.toDateString(), []);
    });

    events.forEach((event) => {
      let startDate;
      let endDate;
      let startTime;

      if (event.start?.dateTime) {
        // Timed event
        startDate = new Date(event.start.dateTime);
        startTime = startDate;
        endDate = event.end?.dateTime
          ? new Date(event.end.dateTime)
          : startDate;
      } else if (event.start?.date) {
        // All-day event
        startDate = new Date(event.start.date + "T00:00:00");
        startTime = null;
        // For all-day events, end date is exclusive, so subtract 1 day
        const rawEndDate = event.end?.date
          ? new Date(event.end.date + "T00:00:00")
          : startDate;
        endDate = subDays(rawEndDate, 1);
      } else {
        return; // Skip events without start time
      }

      // Calculate how many days the event spans
      const startDay = startOfDay(startDate);
      const endDay = startOfDay(endDate);
      const daysDuration = differenceInDays(endDay, startDay) + 1;

      // Only add event to the first day if it's multi-day
      const firstDayString = startDay.toDateString();
      if (eventsByDay.has(firstDayString)) {
        eventsByDay.get(firstDayString).push({
          ...event,
          startTime: startTime,
          endDate: endDate,
          hour: startTime ? startTime.getHours() : 0,
          isAllDay: !event.start?.dateTime,
          isMultiDay: daysDuration > 1,
          totalDays: daysDuration,
        });
      }
    });

    // Filter days to only include those with events, but always include today
    const daysWithEvents = monthDays.filter((day) => {
      const dayEvents = eventsByDay.get(day.toDateString()) || [];
      const isToday = day.toDateString() === today.toDateString();
      return dayEvents.length > 0 || isToday;
    });

    // Parse battery information
    const batteryInfo = parseBatteryInfo(batteryParam);

    console.log(`Calendar page rendered with ${daysWithEvents.length} days`);
    return c.render(
      <CalendarPage
        daysWithEvents={daysWithEvents}
        eventsByDay={eventsByDay}
        batteryInfo={batteryInfo}
        today={today}
      />,
    );
  } catch (error) {
    console.error("Failed to render calendar", error);
    return c.json({ error: "Failed to fetch calendar events" }, 500);
  }
});

// Handle termination signals properly
process.on("SIGINT", () => {
  console.log("Received SIGINT, shutting down gracefully");
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("Received SIGTERM, shutting down gracefully");
  process.exit(0);
});


export default {
  fetch: app.fetch,
  idleTimeout: 60 // 60s timeout
}
