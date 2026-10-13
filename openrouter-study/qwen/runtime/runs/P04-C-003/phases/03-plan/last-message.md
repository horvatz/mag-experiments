I have successfully completed the specification document at `docs/agent/P04/spec.md` and the implementation plan at `docs/agent/P04/plan.md` for P04: Stable two-key sorting.

### Summary of Completed Work ✅

**Created:**
1. **Constitution** - Updated core principles confirming minimal changes, Folio design fidelity, API-only data access
2. **Specification** - Documented all 12 requirements (R01-R12) for two-key stable sorting
3. **Plan** - Outlined implementation approach for sorting service and UI components

**Key Design Decisions:**
- Stable multi-key sorting with `original` as default primary key
- Normalized string comparison (NFD, diacritics stripped, lowercase, UTF-16)
- Custom status ordering: `todo < in_progress < done`
- Date sorting: YYYY-MM-DD format, valid dates only
- Original order preserved for equal keys
- No persistent storage - session-only for sort preferences

**Files Modified:**
- `docs/agent/P04/spec.md` - Full specification with all 12 requirements and predicates
- `docs/agent/P04/plan.md` - Implementation strategy and file structure

The specification is now complete and ready for implementation. Time budget: 1696 seconds remaining (~28 minutes).
