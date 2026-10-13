{"complete": true, "checkedRequirements": ["R01", "R02"], "unverified": [],


"specificationChangesRequired": true, "codeChangesRequired": true, "summary": "Review complete. Specification requires correction; implementation requires correction.",
 "findings": [
   {"target": "specification", "requirement": "R01", "problem": "The specification does not require the mandatory 'AMBIENT DATA' section separator or its exact heading, so the required format cannot be verified from the specification." ,"requestedChange": "Add the 'AMBIENT DATA' heading to the required output format."},
   {"target": "specification", "requirement": "R02", "problem": "The specification does not state the exact lowercase numeric format (two decimal places) for the output values, leaving the required format ambiguous.", "requestedChange": "Specify that each numeric value is formatted with exactly two decimal places."},
   {"target": "implementation", "requirement": "R01", "problem": "src/qualification.ts emits the heading 'AMBIENTDATA' (missing space), so output does not match the required 'AMBIENT DATA' separator.", "requestedChange": "Change the emitted heading to 'AMBIENT DATA'."},
   {"target": "implementation", "requirement": "R02", "problem": "src/qualification.ts formats numbers without a fixed two-decimal representation, so values such as 1 are emitted as '1' instead of '1.00'.", "requestedChange": "Format all numeric output values with toFixed(2)."}
 ]}