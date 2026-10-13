# Qualification Constitution

## Core Principles

### I. Immutable Input

- Treat every input array as immutable. The original array must remain unchanged, including when it is empty.

### II. Predictable Output

- Always return a new array rather than sharing or mutating input storage.

## Qualification Rules

- Q01: result[i] = input[i] + 1
- Q02: An empty input returns a new empty output array.

## Governance

- This constitution governs only the technical qualification for `src/qualification.ts`; it does not define Folio UI policy.
- Validate only with `node task/qualification-check.mjs`. Do not use a browser, public internet, other agents, or unrelated tests.

**Version**: 1.0.0 | **Ratified**: 2026-10-08 | **Last Amended**: 2026-10-08
