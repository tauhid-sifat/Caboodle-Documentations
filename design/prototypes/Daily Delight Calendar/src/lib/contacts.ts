export interface Contact {
  id: string;
  brand: string;
  name: string;
  email: string;
}

export const CONTACTS: Contact[] = [
  { id: "brand-a", brand: "Brand A", name: "Constance", email: "constance@branda.com" },
  { id: "brand-b", brand: "Brand B", name: "Kate", email: "kate@brandb.com" },
  { id: "brand-c", brand: "Brand C", name: "Scott", email: "scott@brandc.com" },
  { id: "brand-d", brand: "Brand D", name: "John", email: "john@brandd.com" },
];

// cellKey (rowId-Month) -> array of contact IDs assigned to that review cell
export type CellContactsMap = Record<string, string[]>;

const CELL_CONTACTS_KEY = "categoryReviewCellContacts";
const DASHBOARD_ROW_KEY = "categoryReviewDashboardRows";

export function loadCellContacts(): CellContactsMap {
  try {
    return JSON.parse(localStorage.getItem(CELL_CONTACTS_KEY) || "{}");
  } catch {
    return {};
  }
}

export function saveCellContacts(map: CellContactsMap) {
  localStorage.setItem(CELL_CONTACTS_KEY, JSON.stringify(map));
  window.dispatchEvent(new Event("cellContactsUpdated"));
}

export interface DashboardRowEdits {
  status?: string;
  brandResponse?: string;
  waitingOn?: string;
  focus?: string;
  actionNeeded?: string;
  nextAction?: string;
  result?: string;
  notes?: string;
}


export type DashboardRowEditsMap = Record<string, DashboardRowEdits>;

export function loadDashboardEdits(): DashboardRowEditsMap {
  try {
    return JSON.parse(localStorage.getItem(DASHBOARD_ROW_KEY) || "{}");
  } catch {
    return {};
  }
}

export function saveDashboardEdits(map: DashboardRowEditsMap) {
  localStorage.setItem(DASHBOARD_ROW_KEY, JSON.stringify(map));
}

export const STATUS_OPTIONS = ["Not Started", "In Progress", "Submitted", "Approved", "Rejected"];
export const NEXT_ACTION_OPTIONS = ["Send Samples", "Follow Up", "Await Response", "Schedule Meeting", "Present Deck", "None"];
export const RESULT_OPTIONS = ["Pending", "Accepted", "Rejected", "Deferred", "N/A"];
export const BRAND_RESPONSE_OPTIONS = ["TBD", "Need More Info", "Not Interested", "On Hold", "Opportunity Sent", "Yes-Submit"];
export const WAITING_ON_OPTIONS = ["Brand", "Buyer", "Distributor", "Sales Rep", "Samples"];
export const FOCUS_OPTIONS = ["Complete", "Now", "F/U", "Monitor", "Waiting"];
export const ACTION_NEEDED_OPTIONS = [
  "None",
  "Determine Review timeline",
  "Contact Brand",
  "More Brand Info Needed",
  "Request Samples",
  "Prepare Submission",
  "Submit to Buyer",
  "F/U w/ Brand",
  "F/U w/ Buyer",
  "Schedule Buyer Meeting",
  "Review Decision",
  "Update Dashboard",
  "Close Opportunity",
];

