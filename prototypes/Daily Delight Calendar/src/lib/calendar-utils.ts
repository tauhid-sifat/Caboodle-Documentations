import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval,
  addMonths, subMonths, addWeeks, subWeeks, addDays, subDays,
  format, isSameMonth, isSameDay, isToday, isWeekend, getHours,
} from "date-fns";

export type CalendarView = "month" | "week" | "day";

export interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  endDate?: Date;
  color?: string;
}

export const HOURS = Array.from({ length: 24 }, (_, i) => i);
export const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function getMonthDays(date: Date) {
  const start = startOfWeek(startOfMonth(date));
  const end = endOfWeek(endOfMonth(date));
  return eachDayOfInterval({ start, end });
}

export function getWeekDays(date: Date) {
  const start = startOfWeek(date);
  const end = endOfWeek(date);
  return eachDayOfInterval({ start, end });
}

export function navigateDate(date: Date, view: CalendarView, direction: "prev" | "next") {
  const fn = direction === "next"
    ? view === "month" ? addMonths : view === "week" ? addWeeks : addDays
    : view === "month" ? subMonths : view === "week" ? subWeeks : subDays;
  return fn(date, 1);
}

export function getViewTitle(date: Date, view: CalendarView) {
  if (view === "month") return format(date, "MMMM yyyy");
  if (view === "day") return format(date, "EEEE, MMMM d, yyyy");
  const weekStart = startOfWeek(date);
  const weekEnd = endOfWeek(date);
  return `${format(weekStart, "MMM d")} – ${format(weekEnd, "MMM d, yyyy")}`;
}

// Sample events for demo
export const SAMPLE_EVENTS: CalendarEvent[] = [
  { id: "1", title: "Team Standup", date: new Date(new Date().setHours(9, 0)), endDate: new Date(new Date().setHours(9, 30)) },
  { id: "2", title: "Design Review", date: new Date(new Date().setHours(14, 0)), endDate: new Date(new Date().setHours(15, 0)) },
  { id: "3", title: "Lunch with Sarah", date: new Date(new Date().setHours(12, 0)), endDate: new Date(new Date().setHours(13, 0)) },
  { id: "4", title: "Project Deadline", date: addDays(new Date(), 2), endDate: addDays(new Date(), 2) },
  { id: "5", title: "Workshop", date: addDays(new Date(), 1), endDate: addDays(new Date(), 1) },
  { id: "6", title: "Coffee Chat", date: (() => { const d = addDays(new Date(), 1); d.setHours(10, 0); return d; })(), endDate: (() => { const d = addDays(new Date(), 1); d.setHours(11, 0); return d; })() },
  { id: "7", title: "Sprint Planning", date: (() => { const d = addDays(new Date(), 3); d.setHours(11, 0); return d; })(), endDate: (() => { const d = addDays(new Date(), 3); d.setHours(12, 0); return d; })() },
];

export function getEventsForDay(events: CalendarEvent[], day: Date) {
  return events.filter((e) => isSameDay(e.date, day));
}

export { isSameMonth, isSameDay, isToday, isWeekend, format, getHours };
