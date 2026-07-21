import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { format, endOfMonth, startOfMonth } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SAMPLE_PLANNING_ROWS } from "@/lib/planning-data";
import {
  CONTACTS,
  loadCellContacts,
  loadDashboardEdits,
  saveDashboardEdits,
  STATUS_OPTIONS,
  NEXT_ACTION_OPTIONS,
  RESULT_OPTIONS,
  BRAND_RESPONSE_OPTIONS,
  WAITING_ON_OPTIONS,
  FOCUS_OPTIONS,
  ACTION_NEEDED_OPTIONS,
  type DashboardRowEditsMap,
  type DashboardRowEdits,
} from "@/lib/contacts";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

interface BrandEntry {
  key: string;
  brand: string;
  contactName: string;
  retailer: string;
  category: string;
  reviewStart: Date;
  reviewEnd: Date;
}

const BrandDashboard = () => {
  const navigate = useNavigate();
  const year = new Date().getFullYear();
  const [brandFilter, setBrandFilter] = useState("all");
  const [cellContacts, setCellContacts] = useState(() => loadCellContacts());
  const [edits, setEdits] = useState<DashboardRowEditsMap>(() => loadDashboardEdits());

  useEffect(() => {
    const handler = () => setCellContacts(loadCellContacts());
    window.addEventListener("cellContactsUpdated", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("cellContactsUpdated", handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  useEffect(() => {
    saveDashboardEdits(edits);
  }, [edits]);

  const entries: BrandEntry[] = useMemo(() => {
    const result: BrandEntry[] = [];
    SAMPLE_PLANNING_ROWS.forEach((row) => {
      MONTHS.forEach((month) => {
        if (row.months[month] !== "Review") return;
        const cellKey = `${row.id}-${month}`;
        const contactIds = cellContacts[cellKey] || [];
        const monthIndex = MONTHS.indexOf(month);
        const monthDate = new Date(year, monthIndex, 1);
        contactIds.forEach((contactId) => {
          const contact = CONTACTS.find((c) => c.id === contactId);
          if (!contact) return;
          result.push({
            key: `${cellKey}-${contactId}`,
            brand: contact.brand,
            contactName: contact.name,
            retailer: row.bannerName,
            category: row.category,
            reviewStart: startOfMonth(monthDate),
            reviewEnd: endOfMonth(monthDate),
          });
        });
      });
    });
    return result;
  }, [cellContacts, year]);

  const brands = useMemo(
    () => [...new Set(entries.map((e) => e.brand))],
    [entries]
  );

  const [colFilters, setColFilters] = useState<Record<string, string>>({
    brand: "all",
    retailer: "all",
    category: "all",
    reviewStart: "all",
    reviewEnd: "all",
    status: "all",
    brandResponse: "all",
    waitingOn: "all",
    focus: "all",
    actionNeeded: "all",
    nextAction: "all",
    result: "all",
  });

  const filteredEntries = useMemo(() => {
    return entries.filter((e) => {
      if (brandFilter !== "all" && e.brand !== brandFilter) return false;
      const row = edits[e.key] || {};
      if (colFilters.brand !== "all" && e.brand !== colFilters.brand) return false;
      if (colFilters.retailer !== "all" && e.retailer !== colFilters.retailer) return false;
      if (colFilters.category !== "all" && e.category !== colFilters.category) return false;
      if (colFilters.reviewStart !== "all" && format(e.reviewStart, "MMM d, yyyy") !== colFilters.reviewStart) return false;
      if (colFilters.reviewEnd !== "all" && format(e.reviewEnd, "MMM d, yyyy") !== colFilters.reviewEnd) return false;
      if (colFilters.status !== "all" && (row.status || "") !== colFilters.status) return false;
      if (colFilters.brandResponse !== "all" && (row.brandResponse || "") !== colFilters.brandResponse) return false;
      if (colFilters.waitingOn !== "all" && (row.waitingOn || "") !== colFilters.waitingOn) return false;
      if (colFilters.focus !== "all" && (row.focus || "") !== colFilters.focus) return false;
      if (colFilters.actionNeeded !== "all" && (row.actionNeeded || "") !== colFilters.actionNeeded) return false;
      if (colFilters.nextAction !== "all" && (row.nextAction || "") !== colFilters.nextAction) return false;
      if (colFilters.result !== "all" && (row.result || "") !== colFilters.result) return false;
      return true;
    });
  }, [entries, brandFilter, colFilters, edits]);

  const uniq = (arr: string[]) => [...new Set(arr.filter(Boolean))];
  const colOptions = useMemo(() => ({
    brand: uniq(entries.map((e) => e.brand)),
    retailer: uniq(entries.map((e) => e.retailer)),
    category: uniq(entries.map((e) => e.category)),
    reviewStart: uniq(entries.map((e) => format(e.reviewStart, "MMM d, yyyy"))),
    reviewEnd: uniq(entries.map((e) => format(e.reviewEnd, "MMM d, yyyy"))),
    status: uniq(entries.map((e) => edits[e.key]?.status || "")),
    brandResponse: uniq(entries.map((e) => edits[e.key]?.brandResponse || "")),
    waitingOn: uniq(entries.map((e) => edits[e.key]?.waitingOn || "")),
    focus: uniq(entries.map((e) => edits[e.key]?.focus || "")),
    actionNeeded: uniq(entries.map((e) => edits[e.key]?.actionNeeded || "")),
    nextAction: uniq(entries.map((e) => edits[e.key]?.nextAction || "")),
    result: uniq(entries.map((e) => edits[e.key]?.result || "")),
  }), [entries, edits]);

  const updateField = (key: string, field: keyof DashboardRowEdits, value: string) => {
    setEdits((prev) => ({
      ...prev,
      [key]: { ...prev[key], [field]: value },
    }));
  };

  // KPI counts based on filtered entries
  const kpiCounts = useMemo(() => {
    const count = (field: keyof DashboardRowEdits, options: string[]) => {
      const c: Record<string, number> = {};
      options.forEach((o) => (c[o] = 0));
      filteredEntries.forEach((e) => {
        const v = edits[e.key]?.[field];
        if (v && c[v] !== undefined) c[v]++;
      });
      return c;
    };
    return {
      status: count("status", STATUS_OPTIONS),
      actionNeeded: count("actionNeeded", ACTION_NEEDED_OPTIONS.filter((o) => o !== "None")),
      waitingOn: count("waitingOn", WAITING_ON_OPTIONS),
      focus: count("focus", FOCUS_OPTIONS),
      result: count("result", RESULT_OPTIONS),
    };
  }, [filteredEntries, edits]);

  const KpiCard = ({ title, counts }: { title: string; counts: Record<string, number> }) => {
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    return (
      <div className="rounded-xl border border-border bg-card p-4 flex-1 min-w-[180px]">
        <div className="flex items-baseline justify-between mb-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</h3>
          <span className="text-lg font-display font-bold text-foreground">{total}</span>
        </div>
        <ul className="space-y-1 max-h-[140px] overflow-auto pr-1">
          {Object.entries(counts).map(([label, n]) => (
            <li key={label} className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground truncate mr-2">{label}</span>
              <span className={`font-semibold tabular-nums ${n > 0 ? "text-foreground" : "text-muted-foreground/40"}`}>{n}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const renderSelect = (
    key: string,
    field: keyof DashboardRowEdits,
    options: string[],
    placeholder: string,
    width: string,
  ) => {
    const row = edits[key] || {};
    return (
      <Select value={row[field] as string || ""} onValueChange={(v) => updateField(key, field, v)}>
        <SelectTrigger className={`h-8 text-xs ${width}`}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((s) => (
            <SelectItem key={s} value={s}>{s}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="h-8 w-8 rounded-full hover:bg-secondary"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-display font-bold tracking-tight text-foreground">
            Brand Report
          </h1>
          <span className="text-xs text-muted-foreground">
            {filteredEntries.length} participation{filteredEntries.length === 1 ? "" : "s"}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Select value={brandFilter} onValueChange={setBrandFilter}>
            <SelectTrigger className="w-[220px] h-8 text-xs rounded-lg">
              <SelectValue placeholder="Filter by Brand" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Brands</SelectItem>
              {brands.map((b) => (
                <SelectItem key={b} value={b}>{b}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="px-6 pb-4 flex gap-3 flex-wrap">
        <KpiCard title="Review Status" counts={kpiCounts.status} />
        <KpiCard title="Action Needed" counts={kpiCounts.actionNeeded} />
        <KpiCard title="Waiting On" counts={kpiCounts.waitingOn} />
        <KpiCard title="Focus" counts={kpiCounts.focus} />
        <KpiCard title="Result" counts={kpiCounts.result} />
      </div>

      <div className="flex-1 overflow-auto border-t border-border">
        <table className="w-full border-collapse min-w-[2000px]">
          <thead className="sticky top-0 z-10 bg-card">
            <tr className="border-b border-border bg-card">
              {["Brand", "Retailer", "Category", "Review Start", "Review End", "Status", "Brand Response", "Waiting On", "Focus", "Action Needed", "Next Action", "Result", "Notes"].map((h) => (
                <th
                  key={h}
                  className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground border-r border-border last:border-r-0 whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
            <tr className="border-b border-border bg-card/50">
              {([
                ["brand", "Brand"],
                ["retailer", "Retailer"],
                ["category", "Category"],
                ["reviewStart", "Start"],
                ["reviewEnd", "End"],
                ["status", "Status"],
                ["brandResponse", "Response"],
                ["waitingOn", "Waiting"],
                ["focus", "Focus"],
                ["actionNeeded", "Action Needed"],
                ["nextAction", "Action"],
                ["result", "Result"],
              ] as const).map(([key, label]) => (
                <th key={key} className="px-2 py-2 border-r border-border">
                  <Select value={colFilters[key]} onValueChange={(v) => setColFilters((p) => ({ ...p, [key]: v }))}>
                    <SelectTrigger className="h-7 text-[11px] w-full min-w-[110px]"><SelectValue placeholder={`All ${label}`} /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All {label}</SelectItem>
                      {colOptions[key].map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </th>
              ))}
              <th className="border-r border-border last:border-r-0" />
            </tr>
          </thead>
          <tbody>
            {filteredEntries.length === 0 ? (
              <tr>
                <td colSpan={13} className="px-6 py-16 text-center text-sm text-muted-foreground">
                  No brand participations yet. Assign contacts to Review cells on the Category Review calendar to populate this dashboard.
                </td>
              </tr>
            ) : (
              filteredEntries.map((entry) => {
                const row = edits[entry.key] || {};
                return (
                  <tr key={entry.key} className="border-b border-border hover:bg-calendar-hover transition-colors">
                    <td className="px-4 py-3 border-r border-border text-sm font-semibold text-foreground">
                      {entry.brand}
                      <span className="ml-2 text-xs font-normal text-muted-foreground">
                        · {entry.contactName}
                      </span>
                    </td>
                    <td className="px-4 py-3 border-r border-border text-sm font-medium text-foreground">
                      {entry.retailer}
                    </td>
                    <td className="px-4 py-3 border-r border-border">
                      <span className="inline-block text-[11px] font-medium px-2 py-0.5 rounded-full bg-accent text-accent-foreground">
                        {entry.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 border-r border-border text-sm text-foreground whitespace-nowrap">
                      {format(entry.reviewStart, "MMM d, yyyy")}
                    </td>
                    <td className="px-4 py-3 border-r border-border text-sm text-foreground whitespace-nowrap">
                      {format(entry.reviewEnd, "MMM d, yyyy")}
                    </td>
                    <td className="px-4 py-3 border-r border-border">
                      {renderSelect(entry.key, "status", STATUS_OPTIONS, "Set status", "w-[140px]")}
                    </td>
                    <td className="px-4 py-3 border-r border-border">
                      {renderSelect(entry.key, "brandResponse", BRAND_RESPONSE_OPTIONS, "Set response", "w-[160px]")}
                    </td>
                    <td className="px-4 py-3 border-r border-border">
                      {renderSelect(entry.key, "waitingOn", WAITING_ON_OPTIONS, "Set", "w-[130px]")}
                    </td>
                    <td className="px-4 py-3 border-r border-border">
                      {renderSelect(entry.key, "focus", FOCUS_OPTIONS, "Set focus", "w-[130px]")}
                    </td>
                    <td className="px-4 py-3 border-r border-border">
                      {renderSelect(entry.key, "actionNeeded", ACTION_NEEDED_OPTIONS, "Set action", "w-[200px]")}
                    </td>
                    <td className="px-4 py-3 border-r border-border">
                      {renderSelect(entry.key, "nextAction", NEXT_ACTION_OPTIONS, "Set action", "w-[160px]")}
                    </td>
                    <td className="px-4 py-3 border-r border-border">
                      {renderSelect(entry.key, "result", RESULT_OPTIONS, "Set result", "w-[130px]")}
                    </td>
                    <td className="px-4 py-3">
                      <Input
                        value={row.notes || ""}
                        onChange={(e) => updateField(entry.key, "notes", e.target.value)}
                        placeholder="Add notes..."
                        className="h-8 text-xs min-w-[220px]"
                      />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BrandDashboard;
