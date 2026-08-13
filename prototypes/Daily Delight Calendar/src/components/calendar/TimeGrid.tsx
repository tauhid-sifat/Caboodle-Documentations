import { motion } from "framer-motion";
import {
  HOURS, getEventsForDay, CalendarEvent, format, isToday,
  getHours, isSameDay,
} from "@/lib/calendar-utils";

interface TimeGridProps {
  days: Date[];
  events: CalendarEvent[];
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  showDayHeader?: boolean;
}

export function TimeGrid({ days, events, selectedDate, onSelectDate, showDayHeader = true }: TimeGridProps) {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="flex-1 flex flex-col overflow-hidden"
    >
      {/* Day headers */}
      {showDayHeader && (
        <div className="flex border-b border-border">
          <div className="w-16 shrink-0" />
          {days.map((day) => {
            const today = isToday(day);
            const selected = isSameDay(day, selectedDate);
            return (
              <div
                key={day.toISOString()}
                onClick={() => onSelectDate(day)}
                className={`flex-1 py-3 text-center cursor-pointer border-l border-border transition-colors
                  ${selected ? "bg-calendar-selected" : "hover:bg-calendar-hover"}`}
              >
                <div className="text-xs text-muted-foreground uppercase tracking-wider">
                  {format(day, "EEE")}
                </div>
                <div
                  className={`text-lg font-display font-semibold mt-0.5 w-9 h-9 mx-auto flex items-center justify-center rounded-full
                    ${today ? "bg-calendar-today text-calendar-today-foreground" : "text-foreground"}`}
                >
                  {format(day, "d")}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Time grid */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex relative">
          {/* Time labels */}
          <div className="w-16 shrink-0">
            {HOURS.map((hour) => (
              <div key={hour} className="h-14 relative">
                <span className="absolute -top-2 right-3 text-[11px] text-calendar-time font-medium">
                  {hour === 0 ? "" : format(new Date().setHours(hour, 0), "h a")}
                </span>
              </div>
            ))}
          </div>

          {/* Grid columns */}
          {days.map((day) => {
            const dayEvents = getEventsForDay(events, day);
            const today = isToday(day);

            return (
              <div key={day.toISOString()} className="flex-1 border-l border-border relative">
                {HOURS.map((hour) => (
                  <div key={hour} className="h-14 border-b border-calendar-grid" />
                ))}

                {/* Current time indicator */}
                {today && (
                  <div
                    className="absolute left-0 right-0 z-20 pointer-events-none"
                    style={{ top: `${(currentHour + currentMinute / 60) * 56}px` }}
                  >
                    <div className="flex items-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-calendar-event -ml-1.5" />
                      <div className="flex-1 h-[2px] bg-calendar-event" />
                    </div>
                  </div>
                )}

                {/* Events */}
                {dayEvents.map((event) => {
                  const startHour = getHours(event.date) + event.date.getMinutes() / 60;
                  const endHour = event.endDate
                    ? getHours(event.endDate) + event.endDate.getMinutes() / 60
                    : startHour + 1;
                  const top = startHour * 56;
                  const height = Math.max((endHour - startHour) * 56, 24);

                  return (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute left-1 right-1 rounded-lg bg-calendar-event text-calendar-event-foreground px-2 py-1 z-10 shadow-sm overflow-hidden"
                      style={{ top, height }}
                    >
                      <div className="text-[11px] font-semibold truncate">{event.title}</div>
                      <div className="text-[10px] opacity-80">
                        {format(event.date, "h:mm a")}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
