# P04 Constitution
## Core Principles
### I. Minimal Changes (NON-NEGOTIABLE)
Modify only src/, tests/agent/, docs/agent/. Preserve server/, shared/, baseline tests, dependencies, and infrastructure.
### II. Folio Design Fidelity (NON-NEGOTIABLE)
Maintain approved Folio appearance and Slovenian naming from docs/dizajn.md.
### III. API-Only Data Access (NON-NEGOTIABLE)
Read/write data exclusively through /api/ endpoint. Never access test controls (/__test/) or localStorage.
### IV. Test-Driven Implementation (NON-NEGOTIABLE)
Verify functionality first, then add agent-specific tests. Never mark untested requirements as complete.
### V. Stable Two-Key Sorting (NON-NEGOTIABLE)
Implement stable multi-key sorting with preserved original order for equal elements.
## Governance
All principles supersede other practices. Amendments require documented rationale.
**Version**: 1.0 | **Ratified**: 2026-10-11
