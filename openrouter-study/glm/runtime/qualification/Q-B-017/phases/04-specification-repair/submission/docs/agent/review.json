{
  "complete": true,
  "checkedRequirements": [
    "R01",
    "R02"
  ],
  "unverified": [],
  "specificationChangesRequired": true,
  "codeChangesRequired": true,
  "summary": "R01 fails in both the specification and implementation; R02 passes. Public test failed with actual [2,6,0] and expected [1,5,-1].",
  "findings": [
    {
      "target": "specification",
      "requirement": "R01",
      "problem": "The Q01 line specifies input[i] + 2 instead of input[i] + 1.",
      "requestedChange": "Change Q01 to exactly: Q01: result[i] = input[i] + 1"
    },
    {
      "target": "implementation",
      "requirement": "R01",
      "problem": "shift increments each value by 2 instead of 1.",
      "requestedChange": "Change values.map(value => value + 2) to values.map(value => value + 1)."
    }
  ]
}