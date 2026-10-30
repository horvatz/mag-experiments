# FavTask Constitution\n
\n
## Core Principles\n
\n
### I. User-Interface First\n
Every FavTask feature must enhance the existing Folio user interface while maintaining the established Folio design aesthetic. Changes must be minimal, focused, and respectful of the original design.\n
\n
### II. Local-Only Data Operations\n
Favorite functionality operates entirely within browser localStorage. No direct API writes or server interactions are permitted for favorite management. All data modifications remain client-side only.\n
\n
### III. Safe Storage Protocol\n
Favorites persist under the key `folio:favorites:v1` with JSON structure `{version:1, ids:[...]}`. IDs must be unique strings sorted by UTF-16 ordering. Invalid formats default to empty set without failing the application.\n
\n
### IV. Task-Driven Development\n
Follow the TDD cycle: Read requirements → Write tests → User approval → Tests fail → Implement → Red-Green-Refactor.\n
\n
### V. Interface Consistency\n
The task grid/table and task modal must use the same favorite set and filter state. Switching views must preserve favorite selections.\n
\n
## Additional Constraints\n
\n
### Localization Requirement\n
All UI text must remain in Slovenian. Task IDs, headings, and labels must preserve the established "Folio" visual identity.\n
\n
### API Boundary Rules\n
- Read task data exclusively through the public `/api/` endpoint\n
- Filter by `task_id` when querying favorites\n
- Never read or write to test fixtures at `/__test/`\n
- Favorites are local-only; they do not modify task objects on the server\n
\n
## Development Workflow\n
\n
### Test Requirements\n
1. Base tests verify initial functionality and infrastructure\n
2. P07-specific tests must validate favorite toggle, localStorage persistence, filter behavior, and cross-project ID handling\n
\n
### Quality Gates\n
- All changes must pass existing regression tests first\n
- New functionality requires dedicated test coverage\n
\n
## Governance\n
\n
### Compliance Requirements\n
- All PRs must verify constitution compliance\n
- Use existing docs/dizajn.md for UI guidance\n
- Local storage failures must display alerts without breaking the app\n
\n
**Version**: 1.0 | **Ratified**: 2026-10-30
