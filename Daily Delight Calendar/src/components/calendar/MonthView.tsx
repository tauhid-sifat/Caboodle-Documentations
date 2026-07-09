import { motion } from "framer-motion";
import {
  getMonthDays, WEEKDAYS, isSameMonth, isToday, isWeekend,
  getEventsForDay, CalendarEvent, format, isSameDay,
} from "@/lib/calendar-utils";

interface MonthViewProps {
  date: Date;
  events: CalendarEvent[];
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

export function MonthView({ date, events, selectedDate, onSelectDate }: MonthViewProps) {
  const days = getMonthDays(date);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="flex-1 flex flex-col"
    >
      <div className="grid grid-cols-7 border-b border-border">
        {WEEKDAYS.map((day) => (
          <div key={day} className="py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 flex-1 auto-rows-fr">
        {days.map((day, i) => {
          const dayEvents = getEventsForDay(events, day);
          const inMonth = isSameMonth(day, date);
          const today = isToday(day);
          const selected = isSameDay(day, selectedDate);
          const weekend = isWeekend(day);

          return (
            <motion.div
              key={day.toISOString()}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.008 }}
              onClick={() => onSelectDate(day)}
              className={`min-h-[100px] border-b border-r border-border p-1.5 cursor-pointer transition-colors
                ${weekend && inMonth ? "bg-calendar-weekend" : ""}
                ${!inMonth ? "opacity-40" : ""}
                ${selected ? "bg-calendar-selected" : "hover:bg-calendar-hover"}
              `}
            >
              <div className="flex justify-end">
                <span
                  className={`text-sm w-7 h-7 flex items-center justify-center rounded-full font-medium transition-colors
                    ${today ? "bg-calendar-today text-calendar-today-foreground font-semibold" : ""}
                    ${!today && inMonth ? "text-foreground" : ""}
                  `}
                >
                  {format(day, "d")}
                </span>
              </div>
              <div className="mt-1 space-y-0.5">
                {dayEvents.slice(0, 3).map((event) => (
                  <div
                    key={event.id}
                    className="text-[11px] font-medium px-1.5 py-0.5 rounded bg-calendar-event text-calendar-event-foreground truncate"
                  >
                    {event.title}
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <div className="text-[10px] text-muted-foreground px-1.5">
                    +{dayEvents.length - 3} more
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
