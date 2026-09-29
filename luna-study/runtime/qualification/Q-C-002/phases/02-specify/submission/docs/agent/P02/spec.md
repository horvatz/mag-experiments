# Q Qualification

## Overview
Specify `shift` behavior for the Q executor qualification.

## Requirements
- R01: `shift(values: readonly number[]): number[]` returns a new array with each value increased by one.
- R02: Input is unchanged; empty input returns a new empty array.

Q01: result[i] = input[i] + 1

## Scenario and success criteria
- For `[1, -2]`, return `[2, -1]` without changing the input; for `[]`, return a distinct empty array.
- `node task/qualification-check.mjs` passes.
