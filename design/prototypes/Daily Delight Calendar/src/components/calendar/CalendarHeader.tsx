import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CalendarView, getViewTitle } from "@/lib/calendar-utils";
import { motion, AnimatePresence } from "framer-motion";

interface CalendarHeaderProps {
  date: Date;
  view: CalendarView;
  onNavigate: (direction: "prev" | "next") => void;
  onToday: () => void;
  onViewChange: (view: CalendarView) => void;
}

const views: CalendarView[] = ["month", "week", "day"];

export function CalendarHeader({ date, view, onNavigate, onToday, onViewChange }: CalendarHeaderProps) {
  return (
    <div className="flex items-center justify-between px-6 py-4">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-display font-bold tracking-tight text-foreground min-w-[280px]">
          <AnimatePresence mode="wait">
            <motion.span
              key={getViewTitle(date, view)}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="inline-block"
            >
              {getViewTitle(date, view)}
            </motion.span>
          </AnimatePresence>
        </h1>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => onNavigate("prev")} className="h-8 w-8 rounded-full hover:bg-secondary">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onNavigate("next")} className="h-8 w-8 rounded-full hover:bg-secondary">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <Button variant="outline" size="sm" onClick={onToday} className="text-xs font-medium h-8 rounded-full px-4">
          Today
        </Button>
      </div>

      <div className="flex items-center bg-secondary rounded-full p-1">
        {views.map((v) => (
          <button
            key={v}
            onClick={() => onViewChange(v)}
            className={`relative px-4 py-1.5 text-xs font-medium capitalize rounded-full transition-colors ${
              view === v ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {view === v && (
              <motion.div
                layoutId="activeView"
                className="absolute inset-0 bg-primary rounded-full"
                transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
              />
            )}
            <span className="relative z-10">{v}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
