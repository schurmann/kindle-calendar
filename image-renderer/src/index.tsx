import { Hono } from "hono";
import { jsxRenderer } from "hono/jsx-renderer";
import { DASHBOARD_CONFIG } from "./config/constants";
import { CalendarPage } from "./components/CalendarPage";
import { loadAgenda } from "./agenda";
import { renderDashboardPng } from "./dashboard-png";

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
    const agenda = await loadAgenda(c.req.query("battery"));
    const png = await renderDashboardPng(agenda);
    return c.body(new Uint8Array(png), 200, { "Content-Type": "image/png" });
  } catch (error) {
    console.error("Failed to generate dashboard", error);
    return c.text("Dashboard generation failed", 500);
  }
});

app.get("/calendar", async (c) => {
  try {
    const agenda = await loadAgenda(c.req.query("battery"));
    return c.render(<CalendarPage {...agenda} />);
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
  idleTimeout: 60,
};
