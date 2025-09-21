// Calendar event types extracted from Google Calendar API
export interface CalendarEvent {
  summary?: string;
  start?: {
    dateTime?: string;
    date?: string;
  };
  end?: {
    dateTime?: string;
    date?: string;
  };
  iCalUID?: string;
}

export interface ProcessedEvent extends CalendarEvent {
  startTime: Date | null;
  endDate: Date;
  hour: number;
  isAllDay: boolean;
  isMultiDay: boolean;
  totalDays: number;
}

export interface CalendarResponse {
  data: {
    items?: CalendarEvent[];
  };
}

export interface EventsByDay {
  [dayString: string]: ProcessedEvent[];
}
