# **Caboodle Architecture Review \[Backend\]**

## 0\. Caboodle at a Glance

- **What It Is:** A data-driven SaaS built for natural product CPG brands and brokers.

- **What It Does:** Unifies sales tracking, trade promotion management, analytics, large-scale data uploads/exports, and collaboration in one workspace.

- **Who It Serves:** Brand owners, brokers/sub-brokers, sales team, business team.

- **Why It Matters:** CPG brands and brokers rely heavily on Excel/CSV data from multiple distributors, leading to manual consolidation and limited analytical flexibility. Core workflows such as promotional planning are spreadsheet-based, static, and difficult to evolve or explore. Caboodle addresses these gaps by centralizing data ingestion, planning, and analytics into a scalable, configurable platform.

  ## 1\. Executive Summary

- **Objective:** Present current state, in-flight initiatives, and planned measures to strengthen scalability, performance, security, and operational resilience.

- **Highlights:** Modular monolith (.NET 6, moving to .NET 10), Clean Architecture \+ CQRS, AWS-hosted Docker, PostgreSQL, S3, SES, Serilog \+ Seq.

- **Immediate Priorities:** Large-file import/export, email reliability, data mapping expansion, observability uplift, secrets hardening, performance tuning.

- **Key Risks:** Single-instance production, caching not yet activated, secrets stored in config, limited load testing, deferred framework upgrade.

- **Tenancy:** Strict data isolation per Brand (independent tenants).


  ## 

  ## 2\. System Overview

- **Business Context:** Consolidates Retailer/Distributor data to drive Trade spend effectiveness, forecasting, reporting, and operational decisions for CPG brands.

- **Primary Capabilities:** CRM entities, trade spend planning, data uploads/mapping, product specs, file repository, reporting, dashboards, admin controls.

- **Usage Goals:** Responsive UX under rising tenant data volumes; predictable import/export performance; reliable notifications; clear operational visibility.

- **Growth Driver:** Expanding SKU and Promotion datasets across multiple Retailers/Distributors increases concurrency and data-load pressure.


  ## 3\. Architecture Philosophy

- **Style:** Modular Monolith with Clean Architecture and CQRS (MediatR).

- **Dependency flow:** Domain ← Application ← Infrastructure ← API.

- **Rationale:** Faster delivery and simpler ops than microservices, while keeping a path to extract modules later.

- **Principles:** Separation of concerns, module autonomy, explicit contracts, SOLID, testability, incremental evolvability.


  ## 4\. High-Level Architecture

- **Diagrams:** [Folder Structure](https://drive.google.com/file/d/1lqXto8ZnUst9fQQrRumuv4Cq7wQWMPlq/view?usp=sharing), [Layered View](https://drive.google.com/file/d/11j5sRrSCvIBLRlmYSkeWsFZlKk_W4Z00/view?usp=sharing), [Module Internals](https://drive.google.com/file/d/1s0cPVpgJp5kNOGpDIefaAfdCI0oZfX9u/view?usp=sharing).

- **Layers:**

  * **Presentation:** API host and controllers.

  * **Business Modules:** feature-aligned vertical slices (catalog below).

  * **Core Building Blocks:** application and domain kernels plus shared utilities.

  * **Infrastructure:** persistence (EF Core/Dapper), auth, caching (ready), jobs (Hangfire), file storage, notifications, auditing, localization, middleware.

  * **External:** PostgreSQL, Redis (planned activation), S3, SES, logging target (Seq), future ALB/ASG for scale-out.

  ### 4.1 Module Catalog


| Module | Purpose | Notes/Dependencies |
| :---: | :---: | :---: |
| **Admin** | Roles, permissions, settings | Cross-cutting |
| **Brand** | Brand entity management | Supports CRM/Trade workflows |
| **Broker** | Broker/sub-broker management | Works with Admin/CRM |
| **CRM** | Distributors, Retailers, banners, regions, contacts | High data volume |
| **Dashboard** | Summary and KPIs | Reads across modules |
| **DataHub** | Centralized data coordination | Shared datasets |
| **DataUpload** | Bulk ingestion, mapping, validation | Linked to upload/download initiative |
| **FileRepository** | Document and file management | Uses S3/FS |
| **ProductSpecs** | Product specifications | Uses file repo |
| **Report** | Reporting and analytics | Heavy reads |
| **Shared** | Shared application/infrastructure components | Internal reuse |
| **Store** | Store domain elements | Supports CRM/Trade |
| **TradeSpend** | Trade promotions and planning | Relies on CRM data |
| **TradeSpendSandbox** | Experimental/training trade flows | Safe iteration area |

  ## 

  ## 5\. Detailed Architecture

- **Diagrams:** [Detailed\_Architecture](https://drive.google.com/file/d/1BThLfedRiAAe8_RCn-GBljIVGHQugQyx/view?usp=sharing)

- **Module pattern:** Commands/Queries, Handlers, DTOs, Specifications, Validation, Domain Entities/Value objects, Infrastructure implementations.

- **Data access:** EF Core for writes/CRUD; Dapper for complex/high-volume reads; repository \+ specification pattern to encapsulate queries.

- **Pipeline behaviors:** validation, logging, transaction handling; exception middleware for consistent API errors.

- **Module boundaries:** vertical slices per business capability; shared components used intentionally; contracts/events favored if future service extraction proceeds.

- **Bulk workloads:** Background jobs (Hangfire) for heavy tasks; streaming for exports; chunked uploads to contain memory use.

##     6\. Technology Stack

- ## **Runtime & language:** C\# on .NET 6 (target .NET 9).

- ## **API & patterns:** ASP.NET Core, REST, Clean Architecture, CQRS with MediatR.

- ## **Data:** PostgreSQL, EF Core, Dapper, repository/specification.

- ## **Caching:** Redis and in-memory (infra ready; activation planned).

- ## **Background jobs:** Hangfire (PostgreSQL storage).

- ## **Auth:** JWT; RBAC roles; planned Google login.

- ## **Validation & Mapping:** FluentValidation, AutoMapper.

- ## **Documentation:** Swagger/OpenAPI.

- ## **Logging / Observability:** Serilog → Seq; Planned Grafana/Prometheus.

- ## **Packaging & CI/CD:** Docker; Bitbucket Pipelines → AWS ECR → EC2.

- ## **Cloud services:** AWS EC2, RDS PostgreSQL, S3, SES; future ALB/ASG, read replicas, ECS/EKS considered.

##     7\. Database & Storage

- ## **Diagrams & Links:** [Tables Meta Info](https://docs.google.com/spreadsheets/d/134m3fEI_cPZG_MSRwIJbS8q9iUBUVbKPsZU4ZRue-mM/edit?usp=sharing), [Database Diagram](https://dbdiagram.io/d/Copy-of-Caboodle-65229a39ffbf5169f0424b91)

- ## **Primary Database:** PostgreSQL (RDS), single logical DB with tenant isolation per Brand; automated backups enabled.

- ## **Access Patterns:** EF Core for transactional writes; Dapper for complex/high-volume reads; specs to encapsulate query logic.

- ## **Scaling Plan:** Extend indexing and partitioning for large tables; enable read replicas for heavy reads; tune connection pooling; evaluate ALB/ASG \+ multi-instance access patterns.

- ## **File storage:** S3 buckets for documents/files (private), lifecycle policies recommended; local/FS paths for development.

- ## **Caching:** Redis ready but not active; plan activation with TTLs and invalidation per create/update/delete.

- ## **Logging store:** Seq for structured logs; retention configurable.

- ## **Migrations:** Managed via EF Core migrations in caboodle/src/Database/Migrator.

- **Flow:** HTTP → middleware (auth/exception) → MediatR pipeline (validation/logging/transaction) → handlers → EF Core/Dapper → PostgreSQL → response; file operations via S3/FS; audit captured on writes. [Data Flow Diagram](https://drive.google.com/file/d/1d6Xzqo5FaRkyUAJd6-B_tE0yl1vF92BZ/view?usp=sharing)

  ## 

  ## 8\. Deployment Architecture

- **Diagram:** [Deployment Architecture](https://drive.google.com/file/d/1Bk8L6odTf3O-6xHfd2DcZ4XDZbLl8NxO/view?usp=sharing)

- **Environments:**

  * **Production:** AWS us-west-1, EC2 Docker host (8060→5060), RDS PostgreSQL, S3, SES (ap-southeast-1), Seq logging.

  * **Staging:** AWS ap-northeast-1, EC2 Docker, RDS PostgreSQL.

  * **Local:** docker-compose for Postgres, Redis (ready), pgAdmin, Seq.

- **CI/CD:** Bitbucket Pipelines builds Docker images, pushes to ECR (per env), SSH deploys to EC2; branch-based (staging/master).


  ## 

  ## 

  ## 

  ## 9\. Current Initiatives (In Progress)

- **Data Mapping Expansion:** Broader data types, multi-category mapping, UI updates, backend schema extensions, validation on real datasets.

- **Upload/Download Wizard:** Unified import/export, 1GB+ handling, validation/progress/errors, integrated with mapping, end-to-end QA.

- **Email Service Upgrade:** Reliability, retries, logging/monitoring, full QA and documentation; target Jan 15, 2026\.


  ## 10\. Framework Upgrade

- **Current:** .NET 6 (End of support).

- **Plan:** Upgrade to .NET 9 (and EF Core 9\) after current initiatives to regain supportability, security fixes, and performance improvements.


  ## 11\. Security and Compliance

- **AuthN/Z:** JWT-based; RBAC roles (Admin, Broker, Sub-Broker, Brand Owner, Brand Sub-user); tenant isolation at DB level; plan to add Google login.

- **Secrets:** Currently in configuration; plan migration to AWS Secrets Manager with official provider for encrypted, auditable retrieval.

- **Infrastructure security:** Monitoring/alerting via Grafana/Prometheus (planned).

- **Audit trails:** Log sensitive actions (secret access, config changes, DB changes) with metadata for accountability and governance.


  ## 

  ## 

  ## 12\. Performance and Scalability

- **Performance (Current / Planned):**

  * **Completed:** Query profiling and indexing in high-volume areas (BannerSKU, Promotional Planning); read-replica tests for Market Overview reduced primary load.

  * **Planned:** Extend indexing/partitioning (KeHE, UNFI, SPINS, BannerSKU, Market Overview, Promotional Planning); review EF Core patterns to remove N+1 and tune pooling; activate in-memory/Redis caching for hot data; use background/streaming for large uploads/exports; add Grafana/Prometheus for metrics; run load/stress tests; leverage .NET 9/EF Core 9 gains post-upgrade.

- **Scalability (Enablers):**

  * **Horizontal Scale**

  * **Data Tier Scale:** Enable read replicas for heavy reads; partition/high-volume tables; size and tune RDS; explore read/write split where feasible.

  * **Caching:** turn on Redis for hot paths to reduce DB contention.  
    

  ## 13\. Monitoring and Observability

- **Current:** Serilog → Seq; critical alerts to Discord; Pulsetic for uptime.

- **Planned:** Email alerts for critical events; internal admin health dashboard; Grafana/Prometheus for DB/API/system metrics; alerting on latency, errors, saturation.


  ## 

  ## 

  ## 

  ## 14\. Data Management

- **Needs:** Automated backups and DR runbooks; monitoring of growth, index usage, and query performance; structured archival to keep hot tables lean.

- **Actions:** Extend indexing/partitioning; monitor large/fast-growing tables; implement archival for historical data.


  ## 15\. Bulk Operations

* **Current:** Supports large uploads/exports; background jobs (Hangfire); streaming-based exports; chunked uploads to limit memory; progress indicators in scope.

* **Planned:** Centralized error tracking and retries for jobs/uploads; resource-aware throttling to avoid tenant impact; clearer user-facing progress reporting.

  ## 16\. Technical Debt

- **Framework Lag:** .NET 6 beyond support; missing runtime/security/performance updates.

- **Database:** Some database indexes were added reactively and need consolidation and validation against current access patterns.

- **Caching Inactive:** Infra present but off, leading to unnecessary DB load.

- **Secrets In Config:** Pending migration to Secrets Manager.

- **Unit Test Coverage:** In an early-stage relationship.

- **Load/Stress Coverage:** Baselines and regression detection missing.

- **Observability Gaps:** Metrics/Tracing not yet deployed beyond logs.

- **Documentation Gaps:** Infra/Performance guides and onboarding materials incomplete.


  ## 17\. Quality Attributes

- **Performance:** Target p90 \< 2s via indexing, Dapper reads, async patterns, and caching plan.

- **Availability:** Target 99.9%; requires alerting.

- **Security:** JWT \+ RBAC; secrets hardening and audit expansion underway.

- **Scalability:** Horizontal-ready with ALB/ASG and Redis once enabled.

- **Maintainability:** Modular slices, clean layering, StyleCop/ruleset enforcement.

- **Testability:** CQRS boundaries aid testing; unit/integration coverage needs growth.

        Targets reflect current priorities; some capabilities are in-progress or planned.

## 18\. Risks and Mitigations

- **Database hotspots:** Activate Redis, extend indexing/partitioning, introduce read replicas.

- **Secrets exposure:** Migrate to Secrets Manager, remove config-based secrets.

- **Load regressions:** Institute load/stress testing and metric baselines.

- **Email reliability:** Finish upgrade with retries, monitoring, and QA sign-off.


  ## 

  ## 

  ## 

  ## 

  ## 19\. Roadmap

- **Near term (By 15th Jan 2025):** Finish data mapping and upload/download wizard; complete email reliability work.

- **Mid term (3–6 mo):** 

  * Upgrade to .NET 9 and EF Core 9,

  * Move secrets to AWS Secrets Manager

  * Enable health checks and baseline metrics

  * Start caching for hot paths

  * Add load/stress tests

  * Deploy Grafana/Prometheus

  * Enable read replicas for heavy reads; implement archival policy.

  ## 

  ## 20\) Documentation and Maintenance

- **In progress:** QA documenting modules/APIs.

- **Needed:** Maintenance/performance guide (DB structures, indexing, ops).