import type { PlanningRow } from "@/components/calendar/YearlyPlanningTable";

export const PROMOTIONAL_PLANNING_ROWS: PlanningRow[] = [
  {
    id: "1",
    bannerName: "Whole Foods Market",
    category: "Frozen Desserts",
    months: { Jan: "25% MCB", Feb: "", Mar: "", Apr: "", May: "", Jun: "", Jul: "", Aug: "", Sep: "", Oct: "", Nov: "", Dec: "$1 Scan $4.99 SRP" },
  },
  {
    id: "2",
    bannerName: "Sprouts",
    category: "Frozen Desserts",
    months: { Jan: "", Feb: "$1 Scan $4.99 SRP", Mar: "", Apr: "", May: "", Jun: "", Jul: "", Aug: "", Sep: "", Oct: "", Nov: "", Dec: "" },
  },
  {
    id: "3",
    bannerName: "Natural Grocers",
    category: "Frozen Novelties",
    months: { Jan: "", Feb: "", Mar: "", Apr: "", May: "$1 Scan $4.99 SRP", Jun: "", Jul: "", Aug: "", Sep: "", Oct: "", Nov: "", Dec: "" },
  },
  {
    id: "4",
    bannerName: "Nugget Market",
    category: "Frozen Novelties",
    months: { Jan: "", Feb: "", Mar: "", Apr: "", May: "", Jun: "", Jul: "$1 Scan $4.99 SRP", Aug: "", Sep: "", Oct: "", Nov: "", Dec: "" },
  },
  {
    id: "5",
    bannerName: "Earth Fare",
    category: "Ice Cream",
    months: { Jan: "", Feb: "", Mar: "", Apr: "", May: "", Jun: "", Jul: "", Aug: "", Sep: "", Oct: "$1 Scan $4.99 SRP", Nov: "25% MCB", Dec: "" },
  },
  {
    id: "6",
    bannerName: "Central Market",
    category: "Ice Cream",
    months: { Jan: "", Feb: "", Mar: "", Apr: "", May: "", Jun: "", Jul: "", Aug: "", Sep: "", Oct: "", Nov: "$1 Scan $4.99 SRP", Dec: "25% MCB" },
  },
  {
    id: "7",
    bannerName: "Wegmans",
    category: "Frozen",
    months: { Jan: "", Feb: "", Mar: "", Apr: "", May: "", Jun: "", Jul: "", Aug: "", Sep: "", Oct: "", Nov: "", Dec: "" },
  },
];
