import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Filter } from "lucide-react";
import { SendToContacts } from "@/components/SendToContacts";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { YearlyPlanningTable } from "@/components/calendar/YearlyPlanningTable";
import { SAMPLE_PLANNING_ROWS } from "@/lib/planning-data";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const Index = () => {
  const [year, setYear] = useState(new Date().getFullYear());
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [bannerFilter, setBannerFilter] = useState("all");
  const [monthFilter, setMonthFilter] = useState("all");
  const [dateTypeFilter, setDateTypeFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();

  const categories = useMemo(() => [...new Set(SAMPLE_PLANNING_ROWS.map((r) => r.category))], []);
  const banners = useMemo(() => [...new Set(SAMPLE_PLANNING_ROWS.map((r) => r.bannerName))], []);

  const dateTypes = useMemo(() => {
    const types = new Set<string>();
    SAMPLE_PLANNING_ROWS.forEach((r) => Object.values(r.months).forEach((v) => { if (v) types.add(v); }));
    return [...types];
  }, []);

  const filteredRows = useMemo(() => {
    return SAMPLE_PLANNING_ROWS.filter((row) => {
      if (categoryFilter !== "all" && row.category !== categoryFilter) return false;
      if (bannerFilter !== "all" && row.bannerName !== bannerFilter) return false;
      if (monthFilter !== "all" && !row.months[monthFilter]) return false;
      if (dateTypeFilter !== "all" && !Object.values(row.months).includes(dateTypeFilter)) return false;
      return true;
    });
  }, [categoryFilter, bannerFilter, monthFilter, dateTypeFilter]);

  const clearFilters = () => {
    setCategoryFilter("all");
    setBannerFilter("all");
    setMonthFilter("all");
    setDateTypeFilter("all");
  };

  const hasActiveFilters = categoryFilter !== "all" || bannerFilter !== "all" || monthFilter !== "all" || dateTypeFilter !== "all";

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-display font-bold tracking-tight text-foreground">
            {year} Category Review
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
            onClick={() => navigate("/promotional")}
            className="text-xs font-medium h-8 rounded-full px-4 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Promotional Calendar
          </Button>
          <Button
            variant={showFilters ? "secondary" : "outline"}
            size="sm"
            onClick={() => setShowFilters((v) => !v)}
            className="text-xs font-medium h-8 rounded-full px-4 gap-1.5"
          >
            <Filter className="h-3.5 w-3.5" />
            Filters
            {hasActiveFilters && (
              <span className="ml-1 h-4 w-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center">
                {[categoryFilter, bannerFilter, monthFilter, dateTypeFilter].filter((f) => f !== "all").length}
              </span>
            )}
          </Button>
          <SendToContacts />
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="flex items-center gap-3 px-6 pb-3">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px] h-8 text-xs rounded-lg">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={bannerFilter} onValueChange={setBannerFilter}>
            <SelectTrigger className="w-[200px] h-8 text-xs rounded-lg">
              <SelectValue placeholder="Banner Name" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Banners</SelectItem>
              {banners.map((b) => (
                <SelectItem key={b} value={b}>{b}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={monthFilter} onValueChange={setMonthFilter}>
            <SelectTrigger className="w-[150px] h-8 text-xs rounded-lg">
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Months</SelectItem>
              {MONTHS.map((m) => (
                <SelectItem key={m} value={m}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={dateTypeFilter} onValueChange={setDateTypeFilter}>
            <SelectTrigger className="w-[160px] h-8 text-xs rounded-lg">
              <SelectValue placeholder="Date Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Date Types</SelectItem>
              {dateTypes.map((d) => (
                <SelectItem key={d} value={d}>{d}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs h-8 text-muted-foreground hover:text-foreground">
              Clear filters
            </Button>
          )}
        </div>
      )}

      {/* Table */}
      <div className="flex-1 flex flex-col overflow-hidden border-t border-border">
        <YearlyPlanningTable year={year} rows={filteredRows} dateTypeFilter={dateTypeFilter} />
      </div>
    </div>
  );
};

export default Index;
