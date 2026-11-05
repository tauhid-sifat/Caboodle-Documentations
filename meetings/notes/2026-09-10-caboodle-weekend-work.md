# Caboodle Weekend Work — 2026-09-10

- **Source:** `meetings/transcripts/Caboodle Weekend Work on Sep 10.txt` (1,583 lines)
- **Attendees:** Constance Wolfe (client), Bijoy Nath, Md. Tauhidur Rahman, Md Mashiul Azam Chowdhury (joined later)
- **Type:** Weekend work scoping, Optimity integration and simple promo design

## Decisions
- **D-0910-1 (APPROVED):** Simple promo entry becomes a two-step page reached from brand approved: name the promotion and pick retailers, then fill an Excel-like grid. It is a page, not a modal.
- **D-0910-2 (APPROVED):** Product, UPC, retailer, banner, category, case cost and markup are pre-populated. Users enter event names plus MCD, OI and ad fee. Only case allowance calculates.
- **D-0910-3 (APPROVED):** The KEHE report must not be repurposed to carry other distributors' data, because provider drives the column rules and mixing breaks data integrity.
- **D-0910-4 (CLARIFIED):** A future agnostic distributor report needs a skeleton template plus per-distributor rules in admin, and a column mapping step on upload.
- **D-0910-5 (APPROVED):** PCC is both a banner of NCG and a retailer; rename it "banner of NCG, do not use" instead of deleting, since retailers cannot be deleted.
- **D-0910-6 (APPROVED):** Category review emails send from info@caboodleservices.com rather than impersonating the logged-in user, with a scheduler to purge replies.

## Open questions
- How users replicate an event name down many rows without retyping it for every product.
- Whether the rollup report can take a total spend column and a month filter this weekend.
- How to stop users creating duplicate retailers when a typed name does not match exactly.

## Actions
| Action | Owner |
|---|---|
| Map distributor names to Optivity customer codes and build the sample forecast file | Bijoy Nath |
| Convert the monthly report into their forecast format and share it for review | Bijoy Nath |
| Assign the Optivity frontend work | Kazi Towfiq Tasmin Ornov |
| Send the corrected customer code file to Christina in Excel | Constance Wolfe |
| Provide mail credentials for info@caboodleservices.com to test replies | Constance Wolfe |

## Jira keys
- CS-1625 — remove or modify approved promotions without the manual copy, rename and delete dance
