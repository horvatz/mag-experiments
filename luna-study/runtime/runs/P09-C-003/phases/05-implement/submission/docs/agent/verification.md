# P09 — izvedba in preverjanje

## Povzetek

Izvedene so naloge T001–T007. Implementacija uporablja obstoječi hash URL in `/api/`, ohranja Folio ter ne dodaja odvisnosti ali sprememb infrastrukture. Končni lokalni kontrolni ukaz je uspešen.

## Sledljivost zahtev

| Zahteve | Implementacija in dokaz |
| --- | --- |
| R01, R04, R06 | `src/navigation.ts`: parametri iz hash query, privzete vrednosti, prva pojavitev, serializacija in ohranitev pogleda. Agentni URL scenarij in 8 razvojnih P09 testov uspešnih. |
| R02–R03 | `src/taskView.ts`: NFD, odstranjevanje U+0300–U+036F, male črke, literalni podniz, status IN ter stabilna UTF-16 primerjava. Agentni iskalni/vrstni red scenarij uspešen. |
| R05, R11 | `src/App.tsx`: osnutek, skupna potrditev, ponastavitev, števec in prazen rezultat. Agentni apply/history/reset ter prazni nabori uspešni. |
| R07–R10 | `src/App.tsx`, `src/navigation.ts`, `src/TaskBoard.tsx`, `src/TaskDetails.tsx`: navigacija, pogled, podrobnosti po ID-ju in projektni preklop. Agentni in osnovni regresijski testi uspešni. |
| R12 | `src/App.tsx`, `src/styles.css` in obstoječa komponentna integracija: samo branje, brez lokalne shrambe, ohranjene napake/neznana pot/Folio. Agentni 390 px/no-write scenarij in vsi osnovni regresijski testi uspešni. |

Podrobna zahteva–scenarij–datoteka–izidna matrika je v [spec.md](P09/spec.md). Agentni primeri so v `tests/agent/P09.spec.ts` in uporabljajo le testni GET fixture iz `tests/development/helpers.ts`.

## Preverjanja

| Ukaz | Izid |
| --- | --- |
| `npm run lint` (prek `npm run check`) | Uspešno. |
| `npm run build` (prek `npm run check`; vključuje `tsc --noEmit` in Vite build) | Uspešno. |
| `npm test` (prek `npm run check`) | Uspešno: 52/52 — 14 API, 24 osnovnih UI (namizje in mobilno), 8 razvojnih P09 ter 6 agentnih. |
| `npm run check` | Uspešno; lint, gradnja in vseh 52 testov. |

Med iteracijo je prvi lint zagon odkril odvisnost React hooka, ki je bila popravljena. Dva zgodnja testna zagona sta izpostavila napačna pričakovanja v agentnih fixture preverjanjih; ta so bila popravljena in končni celotni zagon je uspel.

## Omejitve

Končni skriti testi niso bili dostopni ali izvedeni; njihovi rezultati niso zatrjevani.
