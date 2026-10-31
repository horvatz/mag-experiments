# Verification Plan: Pregled stanj opravila

## Verification Requirements

Following verification checks for requirements R01-R12:

| Req | Status | Test |
| --- | --- | --- |
| R01 | ✅ | Default state opens with q='', status=all, order=original |
| R02 | ✅ | Search normalization: trim, NFD, dakarik strip, lowercase |
| R03 | ✅ | Status filter combined with search (IN logic) |
| R04 | ✅ | Unknown params → defaults, unknown ignored |
| R05 | ✅ | Draft doesn't change display until save; button commits all |
| R06 | ✅ | Apply clears defaults, removes unknown params, encodes URL |
| R07 | ✅ | Nav back/forward restores saved filters |
| R08 | ✅ | Table/Board preserves params, discards draft |
| R09 | ✅ | Details dialog preserves filters and view |
| R10 | ✅ | Other project resets its view; params honored
| R11 | ✅ | Reset clears filters, history as apply does |
| R12 | ✅ | No API mutations; state in URL not localStorage |

## Environment Constraints
- Public internet blocked
- Use chromium.connect(wsEndpoint)
- chromium.launch() does not work
- Server ports: 5174/3102
