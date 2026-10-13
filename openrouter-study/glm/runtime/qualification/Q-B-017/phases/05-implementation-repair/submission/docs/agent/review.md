# Review

- R01 specification fails: `Q01` specifies `+2`, but the required behavior is `+1`.
- R02 specification passes: input remains unchanged and empty input returns a new empty array.
- R01 implementation fails: `shift` returns each value increased by `2` instead of `1`.
- R02 implementation passes: `map` returns a new array without mutating the input; empty input returns a new empty array.
- Public test `node task/qualification-check.mjs` failed: actual `[2,6,0]`, expected `[1,5,-1]`.
