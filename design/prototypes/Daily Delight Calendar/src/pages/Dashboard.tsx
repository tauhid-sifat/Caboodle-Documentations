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
  type DashboardRowEditsMap,
} from "@/lib/contacts";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

interface DashboardEntry {
  key: string; // bannerId-month-contactId
  bannerName: string;
  brand: string;
  contactName: string;
  category: string;
  reviewStart: Date;
  reviewEnd: Date;
  monthLabel: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const year = new Date().getFullYear();
  const [bannerFilter, setBannerFilter] = useState("all");
  const [cellContacts, setCellContacts] = useState(() => loadCellContacts());
  const [edits, setEdits] = useState<DashboardRowEditsMap>(() => loadDashboardEdits());

  // Listen for updates from the calendar
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

  const entries: DashboardEntry[] = useMemo(() => {
    const result: DashboardEntry[] = [];
    SAMPLE_PLANNING_ROWS.forEach((row) => {
      MONTHS.forEach((month) => {
        const dateType = row.months[month];
        if (dateType !== "Review") return;
        const cellKey = `${row.id}-${month}`;
        const contactIds = cellContacts[cellKey] || [];
        const monthIndex = MONTHS.indexOf(month);
        const monthDate = new Date(year, monthIndex, 1);
        contactIds.forEach((contactId) => {
          const contact = CONTACTS.find((c) => c.id === contactId);
          if (!contact) return;
          result.push({
            key: `${cellKey}-${contactId}`,
            bannerName: row.bannerName,
            brand: contact.brand,
            contactName: contact.name,
            category: row.category,
            reviewStart: startOfMonth(monthDate),
            reviewEnd: endOfMonth(monthDate),
            monthLabel: month,
          });
        });
      });
    });
    return result;
  }, [cellContacts, year]);

  const banners = useMemo(
    () => [...new Set(entries.map((e) => e.bannerName))],
    [entries]
  );

  const [colFilters, setColFilters] = useState<Record<string, string>>({
    brand: "all", category: "all", reviewStart: "all", reviewEnd: "all",
    status: "all", nextAction: "all", result: "all",
  });

  const filteredEntries = useMemo(() => {
    return entries.filter((e) => {
      if (bannerFilter !== "all" && e.bannerName !== bannerFilter) return false;
      const row = edits[e.key] || {};
      if (colFilters.brand !== "all" && e.brand !== colFilters.brand) return false;
      if (colFilters.category !== "all" && e.category !== colFilters.category) return false;
      if (colFilters.reviewStart !== "all" && format(e.reviewStart, "MMM d, yyyy") !== colFilters.reviewStart) return false;
      if (colFilters.reviewEnd !== "all" && format(e.reviewEnd, "MMM d, yyyy") !== colFilters.reviewEnd) return false;
      if (colFilters.status !== "all" && (row.status || "") !== colFilters.status) return false;
      if (colFilters.nextAction !== "all" && (row.nextAction || "") !== colFilters.nextAction) return false;
      if (colFilters.result !== "all" && (row.result || "") !== colFilters.result) return false;
      return true;
    });
  }, [entries, bannerFilter, colFilters, edits]);

  const uniq = (arr: string[]) => [...new Set(arr.filter(Boolean))];
  const colOptions = useMemo(() => ({
    brand: uniq(entries.map((e) => e.brand)),
    category: uniq(entries.map((e) => e.category)),
    reviewStart: uniq(entries.map((e) => format(e.reviewStart, "MMM d, yyyy"))),
    reviewEnd: uniq(entries.map((e) => format(e.reviewEnd, "MMM d, yyyy"))),
    status: uniq(entries.map((e) => edits[e.key]?.status || "")),
    nextAction: uniq(entries.map((e) => edits[e.key]?.nextAction || "")),
    result: uniq(entries.map((e) => edits[e.key]?.result || "")),
  }), [entries, edits]);

  const updateField = (key: string, field: keyof DashboardRowEditsMap[string], value: string) => {
    setEdits((prev) => ({
      ...prev,
      [key]: { ...prev[key], [field]: value },
    }));
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
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
            Category Review Dashboard
          </h1>
          <span className="text-xs text-muted-foreground">
            {filteredEntries.length} brand{filteredEntries.length === 1 ? "" : "s"} participating
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate("/dashboard/brand")}
            className="text-xs font-medium h-8 rounded-full px-4"
          >
            By Brand
          </Button>
        </div>
        <div className="flex items-center gap-3">
          <Select value={bannerFilter} onValueChange={setBannerFilter}>
            <SelectTrigger className="w-[220px] h-8 text-xs rounded-lg">
              <SelectValue placeholder="Filter by Banner" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Banners</SelectItem>
              {banners.map((b) => (
                <SelectItem key={b} value={b}>{b}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-auto border-t border-border">
        {bannerFilter !== "all" && (
          <div className="px-6 py-3 border-b border-border bg-secondary/40">
            <span className="text-sm font-display font-semibold text-foreground">{bannerFilter}</span>
          </div>
        )}
        <table className="w-full border-collapse min-w-[1400px]">
          <thead>
            <tr className="border-b border-border bg-card">
              {["Brand", "Category", "Review Start", "Review End", "Status", "Next Action", "Result", "Notes"].map((h) => (
                <th
                  key={h}
                  className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground border-r border-border last:border-r-0"
                >
                  {h}
                </th>
              ))}
            </tr>
            <tr className="border-b border-border bg-card/50">
              {([
                ["brand", "Brand"],
                ["category", "Category"],
                ["reviewStart", "Start"],
                ["reviewEnd", "End"],
                ["status", "Status"],
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
                <td colSpan={8} className="px-6 py-16 text-center text-sm text-muted-foreground">
                  No brands have responded yet. Assign contacts to Review cells on the Category Review calendar to populate this dashboard.
                </td>
              </tr>
            ) : (
              filteredEntries.map((entry) => {
                const row = edits[entry.key] || {};
                return (
                  <tr key={entry.key} className="border-b border-border hover:bg-calendar-hover transition-colors">
                    <td className="px-4 py-3 border-r border-border text-sm">
                      <div className="font-medium text-foreground">{entry.brand}</div>
                      <div className="text-xs text-muted-foreground">{entry.contactName} · {entry.bannerName}</div>
                    </td>
                    <td className="px-4 py-3 border-r border-border">
                      <span className="inline-block text-[11px] font-medium px-2 py-0.5 rounded-full bg-accent text-accent-foreground">
                        {entry.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 border-r border-border text-sm text-foreground">
                      {format(entry.reviewStart, "MMM d, yyyy")}
                    </td>
                    <td className="px-4 py-3 border-r border-border text-sm text-foreground">
                      {format(entry.reviewEnd, "MMM d, yyyy")}
                    </td>
                    <td className="px-4 py-3 border-r border-border">
                      <Select value={row.status || ""} onValueChange={(v) => updateField(entry.key, "status", v)}>
                        <SelectTrigger className="h-8 text-xs w-[140px]">
                          <SelectValue placeholder="Set status" />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUS_OPTIONS.map((s) => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-4 py-3 border-r border-border">
                      <Select value={row.nextAction || ""} onValueChange={(v) => updateField(entry.key, "nextAction", v)}>
                        <SelectTrigger className="h-8 text-xs w-[160px]">
                          <SelectValue placeholder="Set action" />
                        </SelectTrigger>
                        <SelectContent>
                          {NEXT_ACTION_OPTIONS.map((s) => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-4 py-3 border-r border-border">
                      <Select value={row.result || ""} onValueChange={(v) => updateField(entry.key, "result", v)}>
                        <SelectTrigger className="h-8 text-xs w-[130px]">
                          <SelectValue placeholder="Set result" />
                        </SelectTrigger>
                        <SelectContent>
                          {RESULT_OPTIONS.map((s) => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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

export default Dashboard;
