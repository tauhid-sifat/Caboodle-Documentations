import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { YearlyPlanningTable } from "@/components/calendar/YearlyPlanningTable";
import { PROMOTIONAL_PLANNING_ROWS } from "@/lib/promotional-data";

const PromotionalCalendar = () => {
  const [year, setYear] = useState(new Date().getFullYear());
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-display font-bold tracking-tight text-foreground">
            {year} Promotional Calendar
          </h1>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={() => setYear((y) => y - 1)} className="h-8 w-8 rounded-full hover:bg-secondary">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setYear((y) => y + 1)} className="h-8 w-8 rounded-full hover:bg-secondary">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Button variant="outline" size="sm" onClick={() => setYear(new Date().getFullYear())} className="text-xs font-medium h-8 rounded-full px-4">
            This Year
          </Button>
          <Button
            size="sm"
            onClick={() => navigate("/")}
            className="text-xs font-medium h-8 rounded-full px-4 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Category Review
          </Button>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden border-t border-border">
        <YearlyPlanningTable year={year} rows={PROMOTIONAL_PLANNING_ROWS} />
      </div>
    </div>
  );
};

export default PromotionalCalendar;
