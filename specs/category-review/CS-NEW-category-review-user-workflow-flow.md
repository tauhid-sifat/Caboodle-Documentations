# Category Review — User Workflow (Mermaid Flow)

Mermaid flowchart capturing the client's Category Review user workflow requirements
(Notify Brands → Brand Report population → Brand-side response → Calendars → Report management).

```mermaid
flowchart TD
    subgraph GRID["BROKER — Category Review Grid (List/Grid)"]
        A[Broker selects a review] --> B[Broker selects brands to notify<br/>Brand Owner + Brand Sub-Users]
        B --> C[Email editor pops up]
        C --> D[Email sent from Grid to all selected brands]
    end

    subgraph REPORT_POP["Brand Report — Auto Population"]
        D --> E[Selected brands automatically populate<br/>the Brand Report]
        E --> F[Brand Response defaults to 'Notified']
        F --> G[Date + User name logged into Notes]
    end

    subgraph MANUAL["Brand Report — Manual Population"]
        H{Email not sent?} -->|Yes| I[Broker uses Add Brand<br/>to manually populate report]
        I --> E
        H -->|No| D
    end

    subgraph BRAND_SIDE["BRAND — Email Link (Brand Side Category Review)"]
        D --> J[Email contains link to Brand environment]
        J --> K[Brand opens link in brand-side Category Review]
        K --> L{Brand chooses an option}
        L -->|Yes-Submit| M[Populates Brand Response column]
        L -->|TBD| M
        L -->|Not Interested| M
        L -->|Contact Me| M
        M --> N[Broker can also manually update<br/>Brand Response column]
    end

    subgraph CAL_BROKER["BROKER — Calendar"]
        O[Shows ALL reviews Review & Reset] --> P[Opted-in flag if any brand opted in]
        P --> Q[Click cell for details<br/>Type / Region / Review Start / Review End]
        Q --> R[Enter notes + view Broker notes]
    end

    subgraph CAL_BRAND["BRAND — Calendar"]
        S[Shows ONLY reviews the brand added] --> T{Brand adds a review to calendar}
        T --> U[Checkbox: Notify Broker]
        U -->|Checked| V[Automatically populates Broker Brand Report<br/>even if initial email not sent]
        V --> W[Brand Response defaults to Yes-Submit]
        U -->|Unchecked| X[Added to brand calendar only]
    end

    subgraph REPORT_MGMT["Brand Report — Management & Declutter"]
        E --> Y[Global toggle: hide 'Not Interested' rows]
        Y --> Z[Option to show these brands if needed]
        E --> AA[Broker adds notes<br/>e.g. not interested, called on date, no response after deadline]
        E --> AB[Option to remove brands]
        E --> AC[Future emails to brands in report<br/>filtered by review / opted-in]
        E --> AD[All columns manually updatable]
        E --> AE[Review complete → cleared from tracker]
    end

    subgraph ADMIN["Caboodle Admin"]
        AF[Controls dropdown options<br/>for Brand Report columns]
    end

    E -.-> O
    U -.-> E
    AF -.-> E
```

## Key points captured

1. **Entry point:** Broker selects a review on the grid, chooses brands (owner + sub-users), sends the notification email from the Grid.
2. **Auto population:** Emailed brands appear in the Brand Report with **Brand Response = Notified**; date + user logged to notes.
3. **Manual option:** Broker can manually add a brand to the report even if no email was sent.
4. **Email link → brand side:** Brand chooses **Yes-Submit / TBD / Not Interested / Contact Me** from the link, which populates the Brand Response column. Broker can still override.
5. **Broker calendar:** All reviews shown; opted-in flag per cell; click opens detail (Type, Region, Review Start, Review End) with notes.
6. **Brand calendar:** Only reviews the brand added; **Notify Broker** checkbox pushes the review to the broker's report as **Yes-Submit** even before the broker's email.
7. **Declutter:** Global "hide Not Interested" toggle, remove brands, mark complete → cleared from tracker.
8. **Admin:** Controls the dropdown options for Brand Report columns.
