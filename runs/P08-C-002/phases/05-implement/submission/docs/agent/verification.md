# P08 — izvedba in preverjanje

2026-09-25. Korak: lokalni `speckit-implement`; en agent, brez vej ali commitov.

## Začetek

- Prebrani izvirni R01–R12, projektna pravila, skupna predloga ter ustava, specifikacija, načrt in naloge P08.
- Izvedbene točke: `src/App.tsx`/`ProjectView`, filtrirani props za obstoječi `TaskBoard`, nova koledarska logika in slogi. Obstoječi ključ projekta že omogoča ponastavitev.
- Nespremenjena Playwright konfiguracija odkriva lastne teste v `tests/agent/`; skupni in razvojni testi uporabljajo vrata 5174/3102.
- Posegi samo v dovoljenih poteh. Dokument dokazil je po zadnjih navodilih tukaj; podrobna sledljivost ostane v [specifikaciji](P08/spec.md).
- Ob začetku implementacije je na voljo približno 650 sekund faze. Testi še niso izvedeni. Končni testi niso dostopni.

## Izvedba T002–T005

- Dodan `src/deadlines.ts`: koledarska razlika v UTC, prednost done, stabilen filter in pet števcev celotnega projekta.
- `src/App.tsx`: projektno stanje datumskega polja/zadnjega veljavnega datuma/filtra, točne dostopne kontrole in opozorila, skupni prikaz ID-jev v preglednici in tabli ter prazna skupina.
- `src/styles.css`: nova prilagodljiva kontrolna površina in števci z obstoječimi barvami Folio. Drugi gradniki in infrastruktura nespremenjeni.
- T001–T005 dokončane; testi sledijo, uspeh še ni potrjen.

## Preverjanje v teku

- `npm run check` je uspešno zaključil ESLint, TypeScript in produkcijsko gradnjo Vite.
- Skupnih 38 testov izhodišča je uspešnih. Celoten testni zagon še čaka na zaključek razvojnih in lastnih primerov; dnevnik: [P08/check.log](P08/check.log).

## Prvi zaključeni zagon

- `npm run check`: lint, tipi in gradnja uspešni; 51 testov uspešnih, 3 neuspešni (A02 v treh časovnih pasovih), izhodna koda 1. Vseh 38 osnovnih in 8 razvojnih testov je uspešnih.
- Vzrok A02: ponovno klicanje testnega `mount` z istim hash URL-jem ni ponovno naložilo opravil ob zamenjavi prestreženih podatkov; drugi primer je uporabljal prejšnje podatke. Lastni test sedaj med neodvisnimi primeri odpre `about:blank` in nato ponovno naloži aplikacijo. Produkcijska koda ni bila spremenjena zaradi tega neuspeha. Popravek še čaka na preverjanje.
- Vizualno pregledana [preglednica pri 390 pik](P08/mobile-table.png) in [tabla pri 390 pik](P08/mobile-board.png): ohranjeni Folio, navigacija, oznake in notranje drsenje. A06 je potrdil omejitev širine strani ter nespremenjene Unicode podrobnosti in nič zapisov API.

## Ponovitev lastnih testov

- `npm test -- --project=agent`: **8/8 uspešnih**, 7,7 s, izhodna koda 0; [dnevnik](P08/agent-rerun.log).
- A02 potrjuje pet koledarskih scenarijev v vsakem od treh časovnih pasov (Los Angeles, Ljubljana, Kiritimati). Popravek ponovnega nalaganja testnih podatkov je potrjen.

## Končni rezultat

`npm run check` po popravku lastnega testa: **uspešno, izhodna koda 0**. ESLint, TypeScript in produkcijska gradnja Vite so uspešni. Playwright: **54/54 uspešnih** v 23,7 s — 38 osnovnih, 8 razvojnih P08 in 8 lastnih. Dokaz: [končni celotni dnevnik](P08/check-final.log). Prvi neuspešni zagon in popravek testnega nalaganja sta ohranjena zgoraj ter v [prvotnem dnevniku](P08/check.log).

## Izvedba in sledljivost R01–R12

Sprejemni pogoji, predikati in scenariji S01–S08 so v [specifikaciji](P08/spec.md#zahteve-in-pravila). Dejanski lastni testi A01–A06 (A02 je izveden v treh časovnih pasovih) so v [tests/agent/P08.spec.ts](../../tests/agent/P08.spec.ts). Razvojni D01–D04 so v [tests/development/P08.spec.ts](../../tests/development/P08.spec.ts). Vsaka spodnja vrstica je potrjena v [končnem dnevniku](P08/check-final.log).

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | Fiksni začetek in all neodvisno od ure | S01; A01, A04, D01 | [deadlines.ts](../../src/deadlines.ts) `INITIAL_REFERENCE_DATE`; [App.tsx](../../src/App.tsx) inicializacija `ProjectView` | Uspešno; A01 uporabi uro leta 2042 |
| R02 | Done ima prednost pred rokom | S02; A01, D04 | `src/deadlines.ts` `deadlineGroup`, prva veja | Uspešno; done v preteklosti, danes in prihodnosti |
| R03 | Odprti roki pred datumom in na njem | S02; A01, D01 | `src/deadlines.ts` `deadlineGroup`, razlika dni | Uspešno; overdue/today ID-ji in števci |
| R04 | Vključeni +1 do +7, pozneje od +7, popolna disjunktna razdelitev | S02; A01, A02, D02 | `src/deadlines.ts` `deadlineGroup` in `deadlineOverview` | Uspešno; meje +1/+7/+8 ter unija vseh 12 ID-jev |
| R05 | Koledarsko računanje neodvisno od časovnega pasu in DST | S03; A02 v treh časovnih pasovih | `src/deadlines.ts` `calendarDay`, izrecna UTC polnoč | Uspešno; mesec, leto, prestopni februar in oba izbrana prehoda DST |
| R06 | Pet števcev celotnega projekta neodvisno od filtra | S02/S04; A01, A03, A05, D02 | `src/deadlines.ts` `deadlineOverview`; `src/App.tsx` `.deadline-counts` | Uspešno; vsi filtri, oznake in številke, tudi pet ničel |
| R07 | Šest filtrov, izvorni vrstni red in nespremenjeni podatki | S04; A01, D01/D02/D04 | `src/deadlines.ts` stabilni `visible`; `src/App.tsx` select in preslikava vrstic | Uspešno; 12 drugačnih ID-jev s podvojenimi naslovi, primerjava besedila pred/po |
| R08 | Veljaven/prazen/veljaven vnos in ohranjen filter | S05; A03, D03 | `src/App.tsx` `dateInput`, `referenceDate`, datum `onChange` in opozorilo | Uspešno; takojšen preračun in ohranjen zadnji veljavni izračun |
| R09 | Isti ID-ji in stanje v obeh pogledih | S05; A01, A03, D04 | `src/App.tsx` skupni `deadlines.visible`; obstoječi [TaskBoard](../../src/TaskBoard.tsx) | Uspešno; vse skupine, prazno polje in preklop v obe smeri |
| R10 | Ponastavitev projekta/osvežitve, brez shrambe ali URL filtra | S06; A04 | `src/App.tsx` lokalno stanje in `key={project.id}` | Uspešno; menjava/vrnitev projekta, reload, prazna shramba in samo obstoječi parameter pogleda |
| R11 | Prazni projekti in prazne skupine so uporabni | S07; A05; skupni testi praznih projektov/table | `src/deadlines.ts` začetni ničelni števci; `src/App.tsx` `.deadline-empty` in prazni projekt | Uspešno; oba prazna projekta, eno opravilo, oba pogleda in povratek na all |
| R12 | Bralni API, nespremenjene podrobnosti in prilagodljiv Folio | S08; A01/A03/A06, D04, 38 osnovnih testov | `src/App.tsx` obstoječi GET tok in povezave; [styles.css](../../src/styles.css) `.deadline-*`; obstoječi [TaskDetails](../../src/TaskDetails.tsx) | Uspešno; nič zapisov, Unicode in prestopni datum v podrobnostih, širina 390 pik in vizualno pregledana posnetka |

## Predaja in omejitve

Implementacija je omejena na `src/deadlines.ts`, `src/App.tsx` in `src/styles.css`; lastni testi so v `tests/agent/P08.spec.ts`. Dokumenti postopka in sledljivost so posodobljeni. Vseh devet izvedbenih nalog je opravljenih. Strežnik, skupni tipi/testi, nastavitve, odvisnosti, uradne predloge in veščine niso bili spremenjeni.

Ni znanih neizpolnjenih zahtev R01–R12. Dokazi pokrivajo izvedene scenarije, ne vseh možnih vhodov. Nedostopni končni testi niso bili izvedeni in niso navedeni kot uspešni. Kontrolni seznam kakovosti zahtev ni bil spreminjan. Naslednji korak `converge` sproži izvajalnik.
