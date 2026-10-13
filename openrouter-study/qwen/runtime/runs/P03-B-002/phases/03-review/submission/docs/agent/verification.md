# Verifikacija iskanja in sestavljenih filtrov

## Načrt preverjanj

| Zahteva | Test | Rezultat |
| --- | --- |
| R01 | default |  
| R02 | search-unicode |  
| R03 | search-multiple-words |  
| R04 | filters-combined |  
| R05 | assignee-options |  
| R06 | view-persistence |  
| R07 | project-switch-reset |  
| R08 | refresh-reset |  
| R09 | counts-verify |  
| R10 | no-results |  
| R11 | clear-filters |  
| R12 | no-post-requests | 

## Omejitve okolja

- Javni internet blokiran
- Strežnik: WEB_PORT=5193 API_PORT=3123 npm run dev
- Testni mehanizem: /__test/reset in /__test/state

## Status

Implementacija v teku...
