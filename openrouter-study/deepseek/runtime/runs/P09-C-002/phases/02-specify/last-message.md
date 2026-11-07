Specification step complete in ~2 minutes.

**Artifacts**
- `.specify/feature.json` set to `{ "feature_directory": "docs/agent/P09" }`.
- `docs/agent/P09/spec.md` (172 lines) written per the shared template with:
  - Problem/context, user scenarios, inputs/actions/outcomes, and the interface agreement (exact labels, `Prikazano: N od M.`, 390px rule).
  - State-change rules with predicates: `norm` (trim, NFD, U+0300–U+036F removal, lowercase), `matches` (literal substring over title/description/assignee/id), `keeps` (AND of q and status), stable ordering by UTF-16, confirmation/reset history rule (trim, omit defaults, keep `view=board`, drop unknown params), and URL-as-source-of-truth navigation.
  - R01–R12 table with acceptance conditions and verification methods (development cases D01–D04, own tests, shared tests).
  - Traceability table with planned code locations; outcome/evidence recorded during implementation.
  - Open questions/limitations (URL keeps trimmed literal phrase; no new scope for concurrent loads; `/__test/` not used by UI; final external tests not runnable).

No source, test, or infrastructure files were touched. Time budget: ~1025s remaining.
