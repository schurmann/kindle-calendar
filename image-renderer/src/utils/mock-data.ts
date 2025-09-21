import { addDays, format } from "date-fns";
import type { CalendarEvent } from "../types/calendar";

export function getMockEvents(): CalendarEvent[] {
  // Use actual "today" for demo purposes so events show up in the next 10 weeks
  const today = new Date();

  return [
    // Today's hobbit activities
    {
      summary: "Second breakfast with Sam",
      start: { dateTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 0).toISOString() },
      end: { dateTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 0).toISOString() },
      iCalUID: "second-breakfast-123@bagend.shire"
    },
    {
      summary: "Tend to the garden (avoid the Sackville-Bagginses)",
      start: { dateTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 11, 0).toISOString() },
      end: { dateTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 13, 0).toISOString() },
      iCalUID: "garden-tending-456@bagend.shire"
    },
    {
      summary: "Smoke pipe and read old maps",
      start: { dateTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 16, 0).toISOString() },
      end: { dateTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 18, 0).toISOString() },
      iCalUID: "pipe-maps-789@bagend.shire"
    },

    // Tomorrow - Adventures calling
    {
      summary: "Visit Bilbo's old hidey-holes for forgotten treasures",
      start: { dateTime: addDays(today, 1).toISOString().split('T')[0] + 'T10:00:00.000Z' },
      end: { dateTime: addDays(today, 1).toISOString().split('T')[0] + 'T14:00:00.000Z' },
      iCalUID: "treasure-hunt-101@bagend.shire"
    },
    {
      summary: "Tea with the Gaffer (hear village gossip)",
      start: { dateTime: addDays(today, 1).toISOString().split('T')[0] + 'T15:00:00.000Z' },
      end: { dateTime: addDays(today, 1).toISOString().split('T')[0] + 'T17:00:00.000Z' },
      iCalUID: "gaffer-tea-202@bagend.shire"
    },

    // Day after tomorrow
    {
      summary: "Market day in Hobbiton - buy seed cake",
      start: { dateTime: addDays(today, 2).toISOString().split('T')[0] + 'T09:00:00.000Z' },
      end: { dateTime: addDays(today, 2).toISOString().split('T')[0] + 'T12:00:00.000Z' },
      iCalUID: "market-day-303@bagend.shire"
    },
    {
      summary: "Practice elvish with Bilbo's old books",
      start: { dateTime: addDays(today, 2).toISOString().split('T')[0] + 'T14:00:00.000Z' },
      end: { dateTime: addDays(today, 2).toISOString().split('T')[0] + 'T16:00:00.000Z' },
      iCalUID: "elvish-lessons-404@bagend.shire"
    },

    // Weekend hobbit gathering (days 5-7)
    {
      summary: "Harvest Festival at the Green Dragon",
      start: { date: format(addDays(today, 5), 'yyyy-MM-dd') },
      end: { date: format(addDays(today, 8), 'yyyy-MM-dd') },
      iCalUID: "harvest-festival-505@bagend.shire"
    },

    // Events in week 3 (days 21-22)
    {
      summary: "Help Sam plan his wedding to Rosie",
      start: { dateTime: addDays(today, 21).toISOString().split('T')[0] + 'T10:00:00.000Z' },
      end: { dateTime: addDays(today, 21).toISOString().split('T')[0] + 'T15:00:00.000Z' },
      iCalUID: "wedding-planning-606@bagend.shire"
    },
    {
      summary: "Merry's birthday party (expect fireworks trouble)",
      start: { date: format(addDays(today, 22), 'yyyy-MM-dd') },
      end: { date: format(addDays(today, 23), 'yyyy-MM-dd') },
      iCalUID: "merry-birthday-707@bagend.shire"
    },

    // Events in week 5 (days 35-37)
    {
      summary: "Journey to Rivendell for advice from Elrond",
      start: { dateTime: addDays(today, 35).toISOString().split('T')[0] + 'T06:00:00.000Z' },
      end: { dateTime: addDays(today, 35).toISOString().split('T')[0] + 'T18:00:00.000Z' },
      iCalUID: "rivendell-visit-808@bagend.shire"
    },
    {
      summary: "Write memoirs: 'There and Back Again (Again)'",
      start: { dateTime: addDays(today, 37).toISOString().split('T')[0] + 'T09:00:00.000Z' },
      end: { dateTime: addDays(today, 37).toISOString().split('T')[0] + 'T13:00:00.000Z' },
      iCalUID: "memoir-writing-909@bagend.shire"
    },

    // Events in week 7 (days 49-51)
    {
      summary: "Pippin's mushroom foraging expedition",
      start: { dateTime: addDays(today, 49).toISOString().split('T')[0] + 'T08:00:00.000Z' },
      end: { dateTime: addDays(today, 49).toISOString().split('T')[0] + 'T12:00:00.000Z' },
      iCalUID: "mushroom-foraging-010@bagend.shire"
    },
    {
      summary: "Unexpected visit from Gandalf (probably)",
      start: { dateTime: addDays(today, 51).toISOString().split('T')[0] + 'T14:00:00.000Z' },
      end: { dateTime: addDays(today, 51).toISOString().split('T')[0] + 'T16:00:00.000Z' },
      iCalUID: "gandalf-visit-111@bagend.shire"
    },

    // Final adventure in week 9 (days 60-62)
    {
      summary: "Great camping trip to the Old Forest",
      start: { date: format(addDays(today, 60), 'yyyy-MM-dd') },
      end: { date: format(addDays(today, 63), 'yyyy-MM-dd') },
      iCalUID: "old-forest-camping-212@bagend.shire"
    }
  ];
}