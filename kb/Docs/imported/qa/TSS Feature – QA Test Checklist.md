---
type: Document
title: "Checklists"
---

# Checklists

# **TSS Feature – QA Test Checklist**

**Purpose:**  
 This checklist outlines the functional areas and scenarios covered during QA testing of the **TSS (Trade Spend Sandbox)** feature. The intent is to ensure core workflows, calculations, and user actions are validated end-to-end.

---

## **1\. List Page (Promo Listing)**

**Coverage:**

* Promo name filter  
* Date range filter  
* Add New Promo  
* Resume Promo  
* Banner count  
* Categories  
* Created date  
* Delete promo (single)  
* Batch delete promo (multi-select)  
* Push to Approved (Up Arrow icon)  
* Copy promo feature  
* Pagination behavior  
* List data loading & stability

**Validation Focus:**

* Filters return correct results  
* Actions apply to correct promo(s)  
* Pagination maintains state after actions

[Test Cases]() 

---

## **2\. Create Promo – Initial Step (Start)**

**Coverage:**

* Promo title input & validation

**Validation Focus:**

* Navigation flow consistency

[Test Cases]()

---

## **3\. Step 1 – Retailer & Banner Selection**

**Coverage:**

* Retailer list visibility (only “My Retailers”)  
* Retailer search filter (retailer, banner, region), sorting  
* Banner list based on selected retailer  
* Door count, region display  
* Banner logo visibility  
* Multi-banner selection support  
* Next / Previous buttons  
* Clear, Resume draft promo  
* Promo name edit

**Validation Focus:**

* Correct retailer–banner mapping  
* Accurate metadata (door count, region)  
* Multiple banner selection handling  
* Data retention when moving between steps

---

## **4\. Step 2 – Product Selection & Configuration**

**Coverage:**

* Status filter  
* Category filter  
* Edit all SKUs (bulk edit)  
* Product list per selected banner  
* Next / Previous buttons

**Product Information Validation:**

* Retailer, Banner, product name  
* Category  
* Product status  
* UPC  
* Date  
* Price

**Data Input Fields Validation:**

* Average Unit Velocity (Units/Week)  
* Stores (Max store validation)

**Validation Focus:**

* Correct product population per banner  
* Input validation & max store enforcement  
* Bulk edit consistency across products  
* Data retention when moving between steps

---

## **5\. Step 3 – Event Configuration**

**Coverage:**

* Create EDLP event (jan-dec)  
* Create Normal event  
* Add multiple events  
* Delete event  
* Event end date auto-sets to last day of start month  
* Next / Previous buttons

**Validation Focus:**

* Event creation logic  
* Date auto-calculation correctness  
* Multiple event handling per promo  
* Data retention when moving between steps

---

## **6\. Step 4 – Metrics Configuration**

**Coverage:**

* Single & multiple banner selection  
* Single & multiple events per banner  
* Single & multiple products per event  
* Multi-row edit  
* Inline table edit (on click)  
* Fee distribution logic (equally product-wise per banner)  
* Enter key row submission  
* Next / Previous buttons

**Validation Focus:**

* Hierarchy accuracy (Banner → Event → Product)  
* Calculation correctness after edits  
* UI interaction stability  
* Data retention when moving between steps

[Test Cases]()

---

## **7\. After Submit – Promo Details Page**

### **7.1 Header & Overview**

* Promo name edit  
* Chart details validation:

  * Product name  
  * TPR  
  * Ad fee  
  * Total store  
  * SKU  
  * POD  
  * Category

### **7.2 Product Summary**

* Calculation accuracy (Spend, Revenue, Units, etc.)  
* Data refresh after edit/add/remove actions

### **7.3 Promo  Events Summary Section**

**Coverage:**

* Add  
  * Add SKU  
  * Add EDLP event  
  * Add new promo event  
* Edit promo data  
* Clear filter  
* Delete promo item  
* Selected delete  
* Status update  
* Inline table edit

### **7.4 Promo Options Filter**

* Event names  
* Add fee  
* Status  
* Banners  
* Categories  
* SKUs

**7.5 Push to approved**

**Validation Focus:**

* End-to-end calculation consistency  
* Action stability after multiple operations

# List page test cases

## **TSS – Promo Listing Page**

## **A. Page Load, Layout & Data Integrity**

| TC No | Test Case | Steps | Expected Result |
| ----- | ----- | ----- | ----- |
| TC-A1 | Page loads successfully | Open Trade Spend Sandbox list page | Page loads without error; promo list renders correctly |
| TC-A2 | Loader behavior | Open page with slow network / hard refresh | Loader shown until data loads; no false “No data” state |
| TC-A3 | Mandatory columns visible | Verify each row shows name, year, categories, created date, actions | All required columns visible and aligned |
| TC-A4 | Created date format | Check created date for multiple promos | Date format consistent and correct |
| TC-A5 | Long promo name handling  | Open promo with long name | Text truncates/wraps properly; UI not broken |
| TC-A6 | Multiple categories handling  | Promo with many categories | Categories readable; no overflow |
| TC-A7 | Empty categories handling  | Promo without category | Safe placeholder shown (—); no crash |
| TC-A8 | Default sorting order | Reload page | Sorting follows defined default (e.g., newest first) |

## **B. Promo Name / Product Search Filter**

| TC No | Test Case | Steps | Expected Result |
| ----- | ----- | ----- | ----- |
| TC-B1 | Search by full promo name | Enter exact promo name | Only matching promo shown |
| TC-B2 | Search by partial keyword | Enter partial text (e.g., “mom”) | All matching promos shown |
| TC-B3 | Case-insensitive search | Search using upper/lower case | Same results returned |
| TC-B4 | Leading/trailing spaces  | Enter `" mom "` | Spaces ignored; correct results |
| TC-B5 | Special characters  | Search using `'`, `&`, `-`, `.` | Search works; no error |
| TC-B6 | No result state | Search random text | “No promos found” message shown |
| TC-B7 | Clear search | Click clear (X) | Full list restored |
| TC-B8 | Rapid typing performance (E | Type fast repeatedly | No freeze or UI glitch |
| TC-B9 | Search by product keyword | Search SKU/product name | Related promos returned |
| TC-B10 | Search persistence after navigation  | Search → open promo → back | Search state retained or reset consistently |

## **C. Year Filter**

| TC No | Test Case | Steps | Expected Result |
| ----- | ----- | ----- | ----- |
| TC-C1 | Filter by valid year | Enter year (e.g., 2025\) | Only promos from that year shown |
| TC-C2 | Invalid year input | Enter text/invalid number | No crash; empty or safe result |
| TC-C3 | Clear year filter | Click clear (X) | Full list restored |
| TC-C4 | Year filter persistence | Apply filter → open promo → back | Filter retained or cleared consistently |

## **D. Resume Promo**

| TC No | Test Case | Steps | Expected Result |
| ----- | ----- | ----- | ----- |
| TC-D1 | Resume visible only for drafts | Check draft vs completed promo | Resume appears only for drafts |
| TC-D2 | Resume correct promo | Click Resume | Opens correct promo at saved step |
| TC-D3 | Resume after data change  | Change/delete underlying data → Resume | Clear warning or graceful fallback |

## **E. Banner Count, Category & Date Validation**

| TC No | Test Case | Steps | Expected Result |
| ----- | ----- | ----- | ----- |
| TC-E1 | Banner count accuracy | Compare list vs promo details | Banner count matches |
| TC-E2 | Category accuracy | Compare list vs promo details | Categories match |
| TC-E3 | Created date immutability | Edit promo → return to list | Created date unchanged |

## **F. Selection (Checkbox / Select All)**

| TC No | Test Case | Steps | Expected Result |
| ----- | ----- | ----- | ----- |
| TC-F1 | Single promo selection | Select one checkbox | Row selected correctly |
| TC-F2 | Multi-select promos | Select multiple rows | All selected accurately |
| TC-F3 | Select All behavior | Click Select All | Selection follows defined scope (page/global) |
| TC-F4 | Toggle Select All | Click Select All twice | All selections cleared |
| TC-F5 | Selection \+ filter (Edge) | Select → apply filter | Selection cleared or updated safely |
| TC-F6 | Selection \+ pagination (Edge) | Select → change page → back | Behavior consistent and predictable |
| TC-F7 | Selection reset on refresh | Select → refresh page | Selection cleared |

## **G. Delete Promo (Single)**

| TC No | Test Case | Steps | Expected Result |
| ----- | ----- | ----- | ----- |
| TC-G1 | Delete single promo | Click delete → confirm | Promo removed successfully |
| TC-G2 | Delete confirmation content | Trigger delete | Modal shows correct promo info |
| TC-G3 | Cancel delete | Click cancel | Promo not deleted |
| TC-G4 | Delete draft promo | Delete draft | Draft removed |
| TC-G5 | Delete approved promo  | Try deleting approved | Need to check on Approved promo section |
| TC-G6 | Delete API failure | Simulate server error | Error message shown; promo intact |

## **H. Batch Delete Promo**

| TC No | Test Case | Steps | Expected Result |
| ----- | ----- | ----- | ----- |
| TC-H1 | Batch delete multiple promos | Select multiple → delete | All selected promos deleted |
| TC-H2 | Batch delete without selection | Click delete with none selected | Button disabled or guidance shown |
| TC-H3 | Partial delete failure  | One promo fails | Clear error; others deleted |
| TC-H4 | Selection reset after delete | Delete completed | Selection cleared |

## **I. Push to Approved**

| TC No | Test Case | Steps | Expected Result |
| ----- | ----- | ----- | ----- |
| TC-I1 | Push promo to approved | Select → push | Promo approved successfully |
| TC-I2 | Push confirmation message | Push promo | Correct success message |
| TC-I3 | Push scope validation | Multiple selected | Correct promo(s) pushed |
| TC-I4 | Push API failure | Force error | Error shown; status unchanged |

## **J. Copy Promo**

| TC No | Test Case | Steps | Expected Result |
| ----- | ----- | ----- | ----- |
| TC-J1 | Copy promo | Click copy | New promo created |
| TC-J2 | Copied promo editable | Open copied promo | Editable draft |
| TC-J3 | Copy data integrity | Compare original vs copy | Structure preserved |
| TC-J4 | Copy API failure  | Force error | No ghost promo created |

## **K. Pagination**

| TC No | Test Case | Steps | Expected Result |
| ----- | ----- | ----- | ----- |
| TC-K1 | Next/previous page | Click pagination | Correct page loads |
| TC-K2 | Jump to page number | Click page number | Correct data shown |
| TC-K3 | Items per page | Change page size | List updates correctly |
| TC-K4 | Pagination with filters | Apply filter → paginate | Filtered pagination works |
| TC-K5 | Pagination after delete  | Delete last-page items | Auto-move to valid page |
| TC-K6 | Pagination persistence  | Open promo → back | Page state preserved |

## **L. Stability, Performance & Regression**

| TC No | Test Case | Steps | Expected Result |
| ----- | ----- | ----- | ----- |
| TC-L1 | Rapid user actions | Fast filter/select/delete | No app crash |
| TC-L2 | Duplicate action prevention  | Click action twice fast | Button disabled during processing |
| TC-L3 | Copy \+ filter consistency | Copy → search | New promo appears correctly |
| TC-L4 | Role-based access  | Login as read-only user | Restricted actions hidden |
| TC-L5 | Responsive layout  | Test small laptop width | No hidden or broken actions |

# Add promo tc

# **Create Promo – Initial Step** 

| TC No | Case | Steps | Expected |
| ----- | ----- | ----- | ----- |
| TC-2.1 | open create promo modal/page | click **add new promotion** from list page | create promo start screen opens without error |
| TC-2.2 | promo title required validation | leave title blank → try to continue/next | validation shown; cannot proceed |
| TC-2.3 | promo title accepts valid characters | enter name with `- _ & . ( )` → continue | promo created; no crash |
| TC-2.4 | promo title rejects invalid characters  | enter unsupported emoji/special chars → continue | proper validation or safe handling (no crash) |
| TC-2.5 | promo title max length handling  | enter very long name → continue | name truncates or error shown; UI not broken |
| TC-2.6 | duplicate promo name behavior | create promo with existing name | system follows expected rule (allow with suffix OR prevent with message) |
| TC-2.7 | navigation consistency – next/previous | from start → go step 1  | returns correctly without losing promo title |
| TC-2.8 | cancel/close create flow | start create → close modal/back | promo not created OR saved as draft (per design) |
| TC-2.9 | resume draft appears in list | create promo → proceed step 1 → exit → return to list | promo appears with resume option |
| TC-2.10 | resume draft opens correct step | click resume | opens same promo at last saved step |
| TC-2.11 | hard refresh during draft  | create promo → step 1 → refresh browser | promo draft recoverable (resume works) or safe fallback |
| TC-2.12 | multi-tab behavior | open same draft in 2 tabs | no data corruption; latest save rule consistent |
| TC-2.13 | save state when internet drops  | disable network mid create | clear error shown; no silent data loss |

# Steps tc

# **Step 1 – Retailer & Banner Selection**

| TC No | Case | Steps | Expected |
| ----- | ----- | ----- | ----- |
| TC-3.1 | retailer list shows only “my retailers” | open step 1 | only assigned retailers visible |
| TC-3.2 | retailer search by retailer name | use search with retailer keyword | retailer list filtered correctly |
| TC-3.3 | retailer search by banner name | type banner keyword | retailers containing that banner shown |
| TC-3.4 | retailer search by region | type region keyword | matching retailers/banners shown |
| TC-3.5 | retailer sorting works | apply sort option | retailer order updates correctly |
| TC-3.6 | banner list loads for selected retailer | click a retailer | banner list updates to that retailer only |
| TC-3.7 | banner metadata visible | observe banner row | door count \+ region displayed correctly |
| TC-3.8 | banner logo displayed | check banner logo | logo visible or fallback icon (no broken image) |
| TC-3.9 | select single banner | select one banner | selection saved; next enabled |
| TC-3.10 | multi-banner selection | select multiple banners | all selections retained; correct count/visual indicator |
| TC-3.11 | unselect banner | uncheck selected banner | removed from selection accurately |
| TC-3.12 | next blocked without banner | select none → click next | validation shown; cannot proceed |
| TC-3.13 | previous button behavior | step 1 → previous | returns to start step without losing promo title |
| TC-3.14 | clear selection | click clear (if available) | all selections removed |
| TC-3.15 | promo name edit from step 1 | edit name (if allowed) | updated name persists across steps \+ list page |
| TC-3.16 | resume draft retains retailer/banner | create draft → exit → resume | previously selected retailer/banners still selected |
| TC-3.17 | change retailer after banner selection  | select banners from retailer A → select retailer B | banner list switches; previous selection rules applied correctly |
| TC-3.18 | door count accuracy  | compare door count with banner details page | values match expected source |
| TC-3.19 | empty retailer list  | login user with no retailers | clear empty-state message; no crash |
| TC-3.20 | banner list empty for retailer  | choose retailer with no banners | “no banners” message; next disabled |
| TC-3.21 | UI clarity: clickable items | check retailer/banner list rows | rows look clickable/selectable (not confusing) |

# **4\. Step 2 – Product Selection & Configuration**

## **4A. Filters & Product Population**

| TC No | Case | Steps | Expected |
| ----- | ----- | ----- | ----- |
| TC-4.1 | products load per selected banner | complete step 1 → open step 2 | only products under selected banners shown |
| TC-4.2 | status filter – single status | select one status (e.g., active) | only matching products shown |
| TC-4.3 | status filter – multi status | select active \+ pending | combined results shown correctly |
| TC-4.4 | category filter – single | select category | product list filtered correctly |
| TC-4.5 | category filter – multi | select multiple categories | correct combined list shown |
| TC-4.6 | combined filters (status \+ category) | apply both | list matches both conditions |
| TC-4.7 | clear filters | clear selections | full product list returns |
| TC-4.8 | filter retention on reopen  | apply filter → go step 3 → back step 2 | filter state retained (or resets per design) consistently |
| TC-4.9 | category shows even if no products  | check category list | categories with no products should not appear OR clearly disabled (no confusion) |
| TC-4.10 | category-brand mismatch | choose banner from one brand → step 2 categories include other brand products | only relevant products shown; no cross-brand leakage |
| TC-4.11 | search keyword mismatch  | search “ice” returns grocery items | results must match keyword/category rules |

## **4B. Product Info Validation**

| TC No | Case | Steps | Expected |
| ----- | ----- | ----- | ----- |
| TC-4.12 | product row fields visible | inspect product row | retailer, banner, name, category, status, upc, date, price shown |
| TC-4.13 | upc formatting | check upc column | correct format; no truncation |
| TC-4.14 | missing price handling | view product missing price | shows “pricing not set” or placeholder consistently |
| TC-4.15 | date shown correctly | validate date column | correct date; no off-by-one |
| TC-4.16 | Category shown correctly | validate category column | correct category |
| TC-4.17 | Satus correctly | validate status column | correct status |

## **4C. Data Input Fields Validation**

| TC No | Case | Steps | Expected |
| ----- | ----- | ----- | ----- |
| TC-4.18 | average unit velocity accepts numeric | input valid number | value saved |
| TC-4.19 | average unit velocity rejects text | input alphabets | proper validation error |
| TC-4.20 | average unit velocity accepts decimal  | input 4.5 | decimal accepted; stable input |
| TC-4.21 | decimal input glitch regression  | type dot twice / remove last digit | dot behavior stable; no unexpected removal |
| TC-4.22 | stores field accepts numeric | input valid number | saved correctly |
| TC-4.23 | stores max validation per banner  | enter \> max (e.g., 16 where max=15) | corrected or blocked with message; cannot exceed max |
| TC-4.24 | stores max consistency  | use edit all set \>max → check each sku | each sku must match enforced max (no mismatch like list shows 16\) |
| TC-4.25 | negative value restriction  | input \-1 in velocity/stores | blocked or allowed per rule; consistent handling |
| TC-4.26 | blank required fields validation | leave required blank → next | cannot proceed; clear error |
| TC-4.27 | data retention after navigation | fill values → go step 3 → back step 2 | values retained |

## **4D. Bulk Edit (Edit All SKUs)**

| TC No | Case | Steps | Expected |
| ----- | ----- | ----- | ----- |
| TC-4.28 | open bulk edit | click “edit all skus in this banner” | bulk edit UI opens |
| TC-4.29 | bulk edit applies to all products in banner | set values → apply | all products updated consistently |
| TC-4.30 | bulk edit respects max store | enter max+1 | enforced correctly across all products |
| TC-4.31 | bulk edit \+ individual override | bulk edit → change one sku | single sku keeps override |
| TC-4.32 | bulk edit cancellation  | open bulk edit → cancel | no changes applied |
| TC-4.33 | bulk edit state retention | bulk edit → go step 3 → back | data retained |
| TC-4.34 | bulk edit stability under scroll  | bulk edit on long product list | no UI lag/crash |

# **5\. Step 3 – Event Configuration**

## **5A. Normal Event**

| TC No | Case | Steps | Expected |
| ----- | ----- | ----- | ----- |
| TC-5.1 | create normal event | step 3 → add event → normal | event created successfully |
| TC-5.2 | event requires valid dates | try submit without date | validation shown |
| TC-5.3 | end date auto to last day of month | set start date (Jul 10\) | end date auto sets Jul 31 |
| TC-5.4 | end date cannot be before start date | set end earlier | blocked; error shown |
| TC-5.5 | change start month requires end date handling | start Jul 10 → auto end Jul 31 → change start to Aug 10 | system should auto adjust end date OR allow change smoothly without extra steps |
| TC-5.6 | add multiple normal events | create 2+ events | all events saved and listed |
| TC-5.7 | delete normal event | delete one event | removed immediately; calculations update |

## **5B. EDLP Event (Jan–Dec)**

| TC No | Case | Steps | Expected |
| ----- | ----- | ----- | ----- |
| TC-5.8 | create edlp event | choose edlp | created for Jan–Dec correctly |
| TC-5.9 | edlp required fields validation | skip required → next | cannot proceed; clear message |
| TC-5.10 | create edlp when product inactive | select inactive sku | behavior consistent with rule; no later disappearance |
| TC-5.11 | edlp remains stable after status changes  | create edlp → later change product status | event does not vanish silently; clear rule applied |
| TC-5.12 | Mandatory field \- Every day allowance |  |  |

## **5C. Navigation \+ Retention**

| TC No | Case | Steps | Expected |
| ----- | ----- | ----- | ----- |
| TC-5.14 | next/previous navigation | step 3 → next → back | data retained |
| TC-5.15 | refresh draft retention | create events → exit → resume | events retained |
| TC-5.16 | removed category should not show in step 2 after resume | delete category → resume promo | step 2 should not show deleted category/products |

---

# **6\. Step 4 – Metrics Configuration**

## **6A. Hierarchy & Structure**

| TC No | Case | Steps | Expected |
| ----- | ----- | ----- | ----- |
| TC-6.1 | banner→event→product hierarchy renders | open step 4 | correct tree structure shown |
| TC-6.2 | single banner selection scope | select one banner | only that banner’s events/products shown |
| TC-6.3 | multi-banner selection scope | select multiple banners | each banner section shown correctly |
| TC-6.4 | multi event per banner | create multiple events → step 4 | events grouped correctly under banner |
| TC-6.5 | multi products per event | select multiple products | all products listed under correct event |

## **6B. Inline Edit & Multi Edit**

| TC No | Case | Steps | Expected |
| ----- | ----- | ----- | ----- |
| TC-6.6 | inline edit cell works | click a metric cell | editable input opens |
| TC-6.7 | multi-row edit works | use multiple edit | updates apply correctly |
| TC-6.8 | enter key commits row | edit value → press enter | row saved; no losing cursor |
| TC-6.9 | validation on required field | keep everyday allowance empty → submit | cannot submit; clear message |
| TC-6.10 | mandatory field visibility (UX) | required field marked | asterisk / required label visible and noticeable |
| TC-6.11 | decimal handling in metrics | input 1.25 | saved correctly; no double-press issues |
| TC-6.12 | prevent invalid characters | input text in numeric field | error shown; value not saved |
| TC-6.13 | negative value rule | input \-10 | allowed or blocked per business rule; consistent |
| TC-6.14 | data retention after previous | edit values → previous → next | values retained |

## **6C. Fee Distribution & Calculations**

| TC No | Case | Steps | Expected |
| ----- | ----- | ----- | ----- |
| TC-6.15 | add fee distributed equally within banner | set add fee under banner | distributed correctly per product in that banner |
| TC-6.16 | add fee distribution with multiple banners | add fee for each banner | distribution isolated per banner |
| TC-6.17 | rounding rules accuracy  | apply fee that causes rounding | total matches expected rounding logic |
| TC-6.18 | update fee reflects in summaries | change fee → view totals | totals update immediately without refresh |
| TC-6.19 | filter update requires refresh regression  | edit metrics → check filter values | filter reflects updates without manual refresh |

## **6D. Stability, UI & Edge Cases**

| TC No | Case | Steps | Expected |
| ----- | ----- | ----- | ----- |
| TC-6.20 | alert/toast not behind modal  | cause validation error | message appears on top of modal |
| TC-6.21 | no blank sections after update status  | update event status → observe sections | charts/tables do not become blank |
| TC-6.22 | back/next button visible on small screen  | test laptop small height | buttons visible; no cut off |
| TC-6.23 | horizontal scrollbar usability  | try scroll left/right | scrollbar usable (not too thin) |
| TC-6.24 | multi-select dropdown shows “+1” style  | select multiple items | shows “item \+1/+n” style; not confusing |
| TC-6.25 | data mismatch after changing banner in step 1  | step 1 pick banner A → step 2/3 → back step1 select banner B → forward | step 4 shows consistent data for banner B only |
| TC-6.26 | deleted category not shown later  | delete category after draft | step 4 should not reference deleted category |
| TC-6.27 | edit glitch after multiple clicks | click edit date multiple times quickly | no application error |

