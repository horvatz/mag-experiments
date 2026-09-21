{
  "complete": true,
  "checkedRequirements": ["R01", "R02"],
  "unverified": ["R02 je potrjen s pregledom kode; izvajalno preverjanje je prekinila napaka R01."],
  "specificationChangesRequired": true,
  "codeChangesRequired": true,
  "summary": "Zapisana review.md in review.json. Javni test je neuspešen: [2, 6, 0] namesto [1, 5, -1].",
  "findings": [
    {
      "target": "specification",
      "requirement": "R01",
      "problem": "Q01 napačno določa povečanje za 2.",
      "requestedChange": "Zapisati točno vrstico: Q01: result[i] = input[i] + 1"
    },
    {
      "target": "implementation",
      "requirement": "R01",
      "problem": "shift napačno prišteva 2.",
      "requestedChange": "V src/qualification.ts spremeniti value + 2 v value + 1."
    }
  ]
}