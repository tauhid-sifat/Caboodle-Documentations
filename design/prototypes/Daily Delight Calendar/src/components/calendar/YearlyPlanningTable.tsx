import { useState } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { Check } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";

const CONTACTS = [
  { id: "brand-a", brand: "Brand A", name: "Constance" },
  { id: "brand-b", brand: "Brand B", name: "Kate" },
  { id: "brand-c", brand: "Brand C", name: "Scott" },
  { id: "brand-d", brand: "Brand D", name: "John" },
];

const MONTHS = Array.from({ length: 12 }, (_, i) =>
  format(new Date(2025, i, 1), "MMM")
);

export interface PlanningRow {
  id: string;
  bannerName: string;
  category: string;
  months: Record<string, string>; // month abbreviation -> cell content
}

interface YearlyPlanningTableProps {
  year: number;
  rows: PlanningRow[];
  dateTypeFilter?: string;
}

export function YearlyPlanningTable({ year, rows, dateTypeFilter = "all" }: YearlyPlanningTableProps) {
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [contactPopover, setContactPopover] = useState<string | null>(null);
  const [cellContacts, setCellContacts] = useState<Record<string, Set<string>>>({});

  const toggleCheck = (key: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const toggleCellContact = (cellKey: string, contactId: string) => {
    setCellContacts((prev) => {
      const current = new Set(prev[cellKey] || []);
      if (current.has(contactId)) current.delete(contactId);
      else current.add(contactId);
      return { ...prev, [cellKey]: current };
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="flex-1 overflow-auto"
    >
      <table className="w-full border-collapse min-w-[1000px]">
        <thead>
          <tr className="border-b border-border">
            <th className="sticky left-0 z-10 bg-card text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground w-[200px] min-w-[200px] border-r border-border">
              Banner Name
            </th>
            <th className="sticky left-[200px] z-10 bg-card text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground w-[140px] min-w-[140px] border-r border-border">
              Category
            </th>
            {MONTHS.map((month) => (
              <th
                key={month}
                className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground border-r border-border last:border-r-0 min-w-[90px]"
              >
                {month}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <motion.tr
              key={row.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="border-b border-border hover:bg-calendar-hover transition-colors group"
            >
              <td className="sticky left-0 z-10 bg-card group-hover:bg-calendar-hover transition-colors px-4 py-3 text-sm font-medium text-foreground border-r border-border">
                {row.bannerName}
              </td>
              <td className="sticky left-[200px] z-10 bg-card group-hover:bg-calendar-hover transition-colors px-4 py-3 border-r border-border">
                <span className="inline-block text-[11px] font-medium px-2 py-0.5 rounded-full bg-accent text-accent-foreground">
                  {row.category}
                </span>
              </td>
              {MONTHS.map((month) => {
                const rawContent = row.months[month] || "";
                const cellContent = dateTypeFilter !== "all" && rawContent !== dateTypeFilter ? "" : rawContent;
                const cellKey = `${row.id}-${month}`;
                const isChecked = checked.has(cellKey);
                const selectedContacts = cellContacts[cellKey] || new Set();
                return (
                  <td
                    key={month}
                    className="px-3 py-3 text-center text-sm text-muted-foreground border-r border-border last:border-r-0 relative"
                  >
                    {cellContent && (
                      <Popover
                        open={contactPopover === cellKey}
                        onOpenChange={(open) => setContactPopover(open ? cellKey : null)}
                      >
                        <PopoverTrigger asChild>
                          <button
                            onClick={() => toggleCheck(cellKey)}
                            onDoubleClick={(e) => {
                              e.preventDefault();
                              setContactPopover(cellKey);
                            }}
                            className="relative inline-block cursor-pointer"
                          >
                            <span className={`inline-block text-[11px] font-medium px-2 py-1 rounded-md ${
                              cellContent === "Reset"
                                ? "bg-green-500/20 text-green-400"
                                : cellContent === "25% MCB" || cellContent === "$1 Scan $4.99 SRP"
                                  ? "bg-blue-500/20 text-blue-400"
                                  : "bg-calendar-event text-calendar-event-foreground"
                            }`}>
                              {cellContent}
                            </span>
                            {isChecked && (
                              <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-green-500 flex items-center justify-center">
                                <Check className="h-2.5 w-2.5 text-white" />
                              </span>
                            )}
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-52 p-3" align="center" side="bottom">
                          <p className="text-xs font-semibold text-foreground mb-2">Assign Contacts</p>
                          <div className="space-y-2">
                            {CONTACTS.map((c) => (
                              <label key={c.id} className="flex items-center gap-2 cursor-pointer text-xs">
                                <Checkbox
                                  checked={selectedContacts.has(c.id)}
                                  onCheckedChange={() => toggleCellContact(cellKey, c.id)}
                                />
                                <span className="text-muted-foreground">{c.brand}</span>
                                <span className="font-medium text-foreground">– {c.name}</span>
                              </label>
                            ))}
                          </div>
                        </PopoverContent>
                      </Popover>
                    )}
                  </td>
                );
              })}
            </motion.tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td
                colSpan={14}
                className="px-4 py-12 text-center text-sm text-muted-foreground"
              >
                No banners planned yet. Add your first banner to get started.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </motion.div>
  );
}
