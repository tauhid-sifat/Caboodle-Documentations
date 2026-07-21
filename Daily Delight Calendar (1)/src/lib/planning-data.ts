import type { PlanningRow } from "@/components/calendar/YearlyPlanningTable";

export const SAMPLE_PLANNING_ROWS: PlanningRow[] = [
  {
    id: "1",
    bannerName: "Whole Foods Market",
    category: "Frozen Desserts",
    months: { Jan: "Review", Feb: "", Mar: "", Apr: "", May: "", Jun: "", Jul: "", Aug: "", Sep: "", Oct: "", Nov: "", Dec: "Reset" },
  },
  {
    id: "2",
    bannerName: "Sprouts",
    category: "Frozen Desserts",
    months: { Jan: "", Feb: "Reset", Mar: "Review", Apr: "", May: "", Jun: "", Jul: "", Aug: "", Sep: "", Oct: "", Nov: "", Dec: "" },
  },
  {
    id: "3",
    bannerName: "Natural Grocers",
    category: "Frozen Novelties",
    months: { Jan: "", Feb: "", Mar: "", Apr: "", May: "Reset", Jun: "Review", Jul: "", Aug: "", Sep: "", Oct: "", Nov: "", Dec: "" },
  },
  {
    id: "4",
    bannerName: "Nugget Market",
    category: "Frozen Novelties",
    months: { Jan: "", Feb: "", Mar: "", Apr: "", May: "", Jun: "", Jul: "Reset", Aug: "Review", Sep: "", Oct: "", Nov: "", Dec: "" },
  },
  {
    id: "5",
    bannerName: "Earth Fare",
    category: "Ice Cream",
    months: { Jan: "", Feb: "", Mar: "", Apr: "", May: "", Jun: "", Jul: "", Aug: "", Sep: "", Oct: "Reset", Nov: "Review", Dec: "" },
  },
  {
    id: "6",
    bannerName: "Central Market",
    category: "Ice Cream",
    months: { Jan: "", Feb: "", Mar: "", Apr: "", May: "", Jun: "", Jul: "", Aug: "", Sep: "", Oct: "", Nov: "Reset", Dec: "Review" },
  },
  {
    id: "7",
    bannerName: "Wegmans",
    category: "Frozen",
    months: { Jan: "Review", Feb: "", Mar: "", Apr: "", May: "", Jun: "", Jul: "", Aug: "", Sep: "", Oct: "", Nov: "", Dec: "" },
  },
];
