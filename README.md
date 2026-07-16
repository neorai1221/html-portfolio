# דוח מס למשקיעים — IBKR Tax Israel

Hebrew-first RTL foundation for an Interactive Brokers Israeli tax-report preparation workflow.

> טיוטת חישוב והכנה לדיווח — נדרש אימות של רואה חשבון או יועץ מס

## Run locally
Open `index.html` in a browser for the static demo shell.

## Checks
```bash
npm test
npm run check
```

## Documentation
- Architecture: `docs/architecture.md`
- Milestones: `docs/implementation-plan.md`
- IBKR Flex Query: `docs/ibkr-flex-query.md`
- Security: `docs/security.md`
- Retention: `docs/data-retention.md`
- Unsupported scenarios: `docs/unsupported-scenarios.md`

## Current status
This commit implements a deterministic static foundation, schemas, draft ruleset, sample IBKR CSV, and testable decimal lot-calculation modules. It is not yet a complete production backend.
