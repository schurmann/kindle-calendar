// Dashboard configuration constants
export const DASHBOARD_CONFIG = {
  WIDTH: 1072,
  HEIGHT: 1448,
  DAYS_TO_FETCH: 365,
} as const;

// Calendar configuration
export const CALENDAR_CONFIG = {
  SCOPES: ["https://www.googleapis.com/auth/calendar.readonly"] as string[],
  LOCALE: "sv-SE",
} as const;

// Google Auth constants
export const GOOGLE_AUTH_CONFIG = {
  CLIENT_ID: "117909210471431257098",
  UNIVERSE_DOMAIN: "googleapis.com",
} as const;

// CSS styles for hiding scrollbars
export const SCROLLBAR_HIDE_CSS = `
  ::-webkit-scrollbar {
    display: none !important;
  }
  * {
    -ms-overflow-style: none !important;
    scrollbar-width: none !important;
  }
`;
