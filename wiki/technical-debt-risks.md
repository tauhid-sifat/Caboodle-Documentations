---
type: reference
title: Known technical debt and risks
module: platform
status: current
last_verified: 2026-10-29
---

# KNOWN TECHNICAL DEBT & RISKS

### High Priority
1. **.NET 6 EOL** — no security patches, upgrade to .NET 9 deferred
2. **TypeScript `strict: false`** — bypasses null checks, implicit any
3. **Caching inactive** — Redis infra ready but off, unnecessary DB load
4. **Secrets in config** — not using AWS Secrets Manager (planned)
5. **Single-instance production** — no HA, EC2 failure = downtime
6. **Image domain wildcard `"*"`** in `next.config.js` — security risk
7. **Token in localStorage** (Zustand persist) — XSS risk
8. **No global error boundary** on frontend
9. **Duplicate Axios instances** — inconsistent headers
10. **Console logs in production code**

### Medium Priority
- No E2E tests, minimal unit tests (1 test file found)
- Mixed UI libraries (Ant Design + PrimeReact) — bundle bloat, style conflicts
- Large monolithic components (1000+ line files)
- No lazy loading for AG Grid, CKEditor, ECharts, Mapbox
- Database indexes added reactively — need consolidation
- No CSP headers
- No load/stress testing
- No Grafana/Prometheus
- Documentation gaps (deployment runbook, ERD, sequence diagrams)

### Architecture Risks
- **Cross-tenant data leak risk:** Brand-ID header trust-based, no server-side enforcement in many endpoints
- **Authorization thin:** Many controllers lack `[Authorize]`; brand roles get empty permissions from server
- **Store module is orphan:** Domain entities exist but no controller, service, or application layer
- **Intelligence module status unresolved (OQ-FC-1):** older notes treat "ASK Cab" as placeholder-only, but `docs/feature-context.md` §2.12 documents it as Active (LLM-planned SQL chat over brand data, 6 endpoints, persisted sessions, audit, token cost). Code-verified vs. business-agreement status unconfirmed; do not assume either way.
