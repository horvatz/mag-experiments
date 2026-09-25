# P08: izvedena preverjanja

Datum: 2026-09-25. Postopek A, en agent. Začetek dela približno 16:48 UTC;
implementacija in preverjanja zaključena znotraj 20-minutne omejitve.

Implementirane so zahteve R01–R12. Znane neizpolnjene zahteve ni.
To velja v obsegu spodnjih preverjanj; nedostopni končni testi niso bili izvedeni.

## Ukazi in dejanski rezultati

| Preverjanje | Rezultat | Dokaz |
| --- | --- | --- |
| `npm run check` po implementaciji, pred dodajanjem lastnih testov | Uspešno, izhod 0: lint, TypeScript, produkcijska gradnja, 46/46 testov v 16,4 s. | [check-initial.log](check-initial.log) |
| `npm run check` z lastnimi testi | Uspešno, izhod 0: lint, TypeScript, produkcijska gradnja, **60/60 testov v 21,6 s**. | [check-final.log](check-final.log) |
| `WEB_PORT=5193 API_PORT=3123 npm run dev` in `node tests/agent/manual-inspection.mjs` | Uspešno, izhod skripte 0. Lokalni ogled z obema pogledoma pri 1440 in 390 px, posnetki, prazni datum in prazna skupina. | [skripta](../../tests/agent/manual-inspection.mjs), [dnevnik](manual-inspection.log), [meritve](manual-browser.json) |
| `npm run lint` po dodajanju skripte za ogled | Uspešno, brez napak ESLint. | [lint-final.log](lint-final.log) |
| Pregled nove kode in iskanje `__test`, `localStorage`, `sessionStorage`, `Date.now`, `new Date()` v `src/` | Brez zadetkov. Datumi uporabljajo izrecni UTC; nova funkcionalnost ne kliče zapisovalnega API-ja. | [pregled izvorne kode](source-audit.log) |

Končni avtomatski zagon vsebuje 14 API-testov, 24 testov obstoječega vmesnika
(12 na namizju, 12 na mobilnem profilu), 8 razvojnih testov P08 (4 × 2 profila)
in 14 lastnih preverjanj. Vsi so uspešni; noben test ni preskočen.
Opozorili okolja o `http-proxy` in kombinaciji `NO_COLOR`/`FORCE_COLOR` nista
preprečili lintanja, gradnje ali testiranja.

## Zahteve, pogoji in dokazi

Pogoji in predikati so opredeljeni v [specifikaciji](specification.md).
Vsi A-testi so v [deadlines.spec.ts](../../tests/agent/deadlines.spec.ts);
njihova polna imena in rezultati so v [check-final.log](check-final.log).

| Zahteva | Dejansko preverjeni pogoj | Test oziroma scenarij | Koda | Izid |
| --- | --- | --- | --- | --- |
| R01 | Začetni datum 2026-09-21, filter all, tudi ob napravi z uro v letu 2034. | D01; A01; A04 ob ponastavitvah. | `deadlines.ts`: INITIAL_REFERENCE_DATE; `App.tsx`: začetno stanje. | Uspešno. |
| R02 | Done ima prednost pri starem, današnjem, bližnjem in oddaljenem roku. | D04; A01 s štirimi zaključenimi opravili. | `deadlines.ts`: prva veja groupTasksByDeadline. | Uspešno. |
| R03 | Ločitev pred referenco / na referenci pri odprtih opravilih. | D01, D03; A01; A03 ob spremembi na prestopni dan. | `deadlines.ts`: days < 0 in days === 0. | Uspešno. |
| R04 | +1 in +7 v week, +8 v later; popolna delitev 14 enkratnih ID-jev. | D02; A01; šest A02. | `deadlines.ts`: groupTasksByDeadline. | Uspešno. |
| R05 | Meja meseca, leta, prestopni februar, leti 1900/2000, leto 0099; ameriški in evropski prehod na poletni čas. | A02: šest scenarijev; A03: Pacific/Kiritimati, America/Los_Angeles, Europe/Ljubljana. | `deadlines.ts`: calendarDay z UTC; `formatDate.ts`: obstoječi UTC prikaz. | Uspešno. |
| R06 | Števci celotnega projekta pri vseh šestih filtrih, obeh pogledih ter nič/eno/14 opravilih. | A01, A04, A05. | `App.tsx`: deadlineGroups pred filtrom; `DeadlineOverview.tsx`: dd. | Uspešno. |
| R07 | Natančne vrednosti selecta, izvorni vrstni red v preglednici in stolpcih table, ID-ji neodvisni od enakih naslovov. | A01; A06; D01–D04. | `App.tsx`: visibleTasks; `deadlines.ts`: stabilno dodajanje v skupine. | Uspešno. |
| R08 | Veljavni datum takoj preračuna; prazni vnos ohrani predhodno spremenjeni datum 2026-09-28, števce in filter; popravek odstrani opozorilo. | D03; A04; A02 preveri zavrnitev nemogočih koledarskih datumov. | `App.tsx`: changeReferenceDate; `DeadlineOverview.tsx`: alert in aria-invalid. | Uspešno. |
| R09 | Množica ID-jev enaka pri vseh filtrih; oba preklopa ohranita veljavni datum oziroma prazen vnos in filter. | A01, A04; D04. | `App.tsx`: skupni visibleTasks; stanje v ProjectView. | Uspešno. |
| R10 | Drug projekt, vrnitev in osvežitev ponastavijo datum/all/opozorilo; URL vsebuje le obstoječi view, obe spletni shrambi ostaneta prazni. | A04; pregled izvorne kode. | `App.tsx`: ključ project.id, lokalni useState. | Uspešno. |
| R11 | Prazen projekt pet ničel pri vseh filtrih; pri enem opravilu prazne skupine pokažejo točno sporočilo in omogočajo vrnitev v all. | A05 v obeh pogledih pri 390 px; obstoječi testi prazne table. | `App.tsx`: prazna stanja; stalno dostopne kontrole. | Uspešno. |
| R12 | Brez zapisov ali zahtev brskalnika na testne kontrole; nespremenjeni Unicode naslovi, večvrstični opis, oseba, rok in stanje v podrobnostih; fokus po Escape; brez zunanjega vodoravnega drsenja. | A01, A06, D04; 38 regresijskih testov; lokalni ogled. | `DeadlineOverview.tsx`, `styles.css`; bralni API in podrobnosti ohranjeni. | Uspešno. |

## Lokalni vizualni ogled

Uporabljen je nameščeni Chromium prek `chromium.connect(wsEndpoint)` iz
`task/browser.json`, z lokalnim strežnikom 5193/3123. Testni strežnik
5174/3102 ostane ločen. Skripta pred zajemom počaka na dejanski prikaz.

Pregledani posnetki potrjujejo ohranjeno postavitev Folio, vidne oznake polj,
pet števcev, izbrani pogled in notranje drsenje table oziroma preglednice:

- [Preglednica na namizju](desktop-table.png), [tabla na namizju](desktop-board.png).
- [Preglednica pri 390 px](mobile-table.png), [tabla pri 390 px](mobile-board.png).
- [Prazen datum in prazna skupina pri 390 px](mobile-empty-date.png): vidno
  opozorilo, zadnji veljavni datum v pojasnilu in še vedno dostopen izbirnik.

Izmerjena širina dokumenta je 1440 px pri širini okna 1440 px in 390 px pri
širini okna 390 px, v obeh pogledih. Zaznanih napak `pageerror` ni.

## Omejitve in nepreverjeni deli

- Končni skriti testi niso dostopni in niso navedeni kot uspešni.
- Preverjen je Chromium, tudi z mobilnim profilom; dejanskih naprav,
  brskalnikov Safari/Firefox in bralnika zaslona nismo uporabljali.
- Preverjeni so reprezentativni koledarski robovi in trije časovni pasovi,
  ne vsak možni datum in časovni pas. Izračun uporablja UTC koledarske dneve
  in se ne opira na lokalno uro ali dolžino lokalnega dneva.
- API po pogodbi vrača veljavne datume. Neveljavni API-podatki in nove sočasne
  spremembe brez osvežitve so zunaj naloge; obstoječe regresije so ohranjene.
- Noben korak ni bil blokiran zaradi okolja. Dodatnih odvisnosti, agentov,
  zunanjih storitev ali oddaljenih repozitorijev nismo uporabili.

## Popravki specifikacije

Začetna v1 je bila zapisana pred kodo. V1.1 po izvedbi dopolni dokazila,
dejanske lokacije in omejitve; sprejemni pogoji R01–R12 se niso spremenili.
