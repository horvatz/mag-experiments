# P08 — preverjanje izvedbe

**Datum:** 2026-09-23. **Izid:** implementacija končana; vsa razpoložljiva preverjanja uspešna. Končni nedostopni testi niso bili izvedeni.

## Spremembe in potek

- Ob začetku koraka je bil ta dokument ustvarjen s statusom preverjanj **neizvedeno**. T001 je potrdila dovoljene datoteke in časovni proračun.
- T002–T005: dodani so [koledarska logika](../../src/deadlines.ts), lokalno stanje, kontrole in oba filtrirana prikaza v [App.tsx](../../src/App.tsx) ter prilagodljivi slogi v [styles.css](../../src/styles.css). Razvrščanje uporablja koledarske dneve UTC; prazno polje ohrani zadnjo veljavno referenco. Obstoječi ključ projekta izvede ponastavitev.
- T006–T007: dodani [lastni testi](../../tests/agent/P08.spec.ts) z neodvisno določenimi pričakovanimi ID-ji. T008 je izvedla preverjanja in pregled posnetkov, T009 dopolnila sledljivost.
- Po navodilu koraka je ta dokument osrednje dokazilo namesto načrtovanega `P08/validation.md`; načrt in naloge sta posodobljena. Drugih odstopanj načrta ni.
- Spremenjene aplikacijske datoteke so samo `src/deadlines.ts`, `src/App.tsx`, `src/styles.css`. Strežnik, skupni tipi, skupni testi, nastavitve in odvisnosti niso spreminjani. Vej, commitov ali drugih agentov ni bilo.

## Izvedena preverjanja

| Ukaz / pregled | Dejanski izid | Dokaz |
| --- | --- | --- |
| `npm run check` | Uspeh, izhod 0: lint, TypeScript, produkcijska gradnja; **53/53 testov**, 21,5 s za testni del. | [check.log](P08/check.log) |
| Skupni API in izhodiščni testi | **38/38**: 14 API, 12 namiznih in 12 mobilnih regresijskih preverjanj. | Isti dnevnik, vrstice testov 1–38. |
| Razvojni P08 D01–D04 | **8/8**, namizni in mobilni profil. | Isti dnevnik, testi 39–46; [izvor](../../tests/development/P08.spec.ts). |
| Lastni A01–A05 | **7/7**; A02 je izveden v treh časovnih pasovih. | Isti dnevnik, testi 47–53; [izvor](../../tests/agent/P08.spec.ts). |
| `npx playwright test --project=agent -g A05` | **1/1**, izhod 0; ponovljeno po dodatku pomika na vrh pred zajemom zaslona. Aplikacijska koda se po celotnem preverjanju ni spreminjala. | [capture-check.log](P08/capture-check.log) |
| Vizualni pregled | Pregledani namizna preglednica ter mobilna preglednica in tabla pri 390 pik. Ohranjen Folio, slovenske oznake, fokus, navigacija in notranje drsenje; nova polja in števci se prelomijo. | [Namizje](P08/desktop-table.png), [mobilna preglednica](P08/mobile-table.png), [mobilna tabla](P08/mobile-board.png). |
| Pregled kode API/shrambe | Nova koda ne uvaža testnih pripomočkov, ne uporablja testnih kontrol ali trajne shrambe in ne kliče zapisovalnega API-ja. Obstoječi splošni `PATCH` pripomoček v `src/api.ts` ostaja nespremenjen. | Pregled `src/` ter testi A01, A03, A05 in D04, ki prestrezajo zapisovalne zahteve. |

Prvi mobilni posnetek je zaradi položaja drsenja zajel lepljivo navigacijo nad delom naslova. Popravljen je bil samo zajem v testu: pred posnetkom pomik na vrh. Ponovni A05 je uspešen; končni posnetki so bili ponovno pregledani. Opozorila npm o podedovanem `http-proxy` in barvnem izpisu niso napake preverjanj.

## Sledljivost R01–R12

Pogoji, simboli in splošni predikati so v [specifikaciji](P08/spec.md#zahteve-in-pravila). Oznake A se nanašajo na točna imena testov v `tests/agent/P08.spec.ts` in dnevniku; oznake D na nespremenjene razvojne teste. Vse spodnje vrstice imajo izid **uspešno** z dokazom [celotnega zagona](P08/check.log).

| Zahteva | Pogoj | Dejanski test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | Fiksni datum in začetni `all` | A01: fixed date, complete partition, stable order and shared view IDs; D01 | `src/deadlines.ts`: `INITIAL_REFERENCE_DATE`; `src/App.tsx`: začetno stanje `ProjectView` | Uspešno; A01 uporablja uro leta 2040. |
| R02 | `done` ima prednost pred rokom | A01; D04: done group, board and no writes | `src/deadlines.ts`: prva veja `deadlineGroup` | Uspešno; zaključeni roki pred, na in po referenci. |
| R03 | Odprti roki pred/na referenci | A01, A03; D01 | `src/deadlines.ts`: veji `days < 0`, `days === 0` | Uspešno; oba odprta statusa in točni ID-ji. |
| R04 | Teden vključuje +1 do +7, pozneje od +8; particija | A01; D02: inclusive week boundary | `src/deadlines.ts`: `deadlineGroup`, `deadlineOverview` | Uspešno; 13 opravil v petih pričakovanih skupinah, vsota 13. |
| R05 | Koledarski dnevi brez pasu/DST | A02: calendar boundaries including leap February and DST, v Europe/Ljubljana, America/Los_Angeles in Pacific/Kiritimati | `src/deadlines.ts`: `calendarDay` in razlika dni | Uspešno; februar 2024, leto 2026/2027, marčevski in oktobrski DST. |
| R06 | Pet števcev celotnega projekta, neodvisnih od filtra | A01, A03, A04 | `src/deadlines.ts`: `counts`; `src/App.tsx`: `deadline-summary` | Uspešno; vseh šest izborov ohrani pravilne števce in oznake. |
| R07 | Stabilen izbor brez spremembe opravil | A01 | `src/deadlines.ts`: `visible.push`; `src/App.tsx`: izbirnik in `deadlines.visible.map` | Uspešno; 13 poljubnih ID-jev, enaki naslovi, vsi filtri, nespremenjeni datumi. |
| R08 | Veljaven/prazen/popravljen datum in ohranjen filter | A03: draft date, valid recalculation, view preservation and project resets; D03 | `src/App.tsx`: `dateInput`, `referenceDate`, `onChange`, opozorilo | Uspešno; prazen datum zadrži ID-je in števce, popravek odstrani opozorilo. |
| R09 | Isti ID-ji in stanje v obeh prikazih | A01, A03 | `src/App.tsx`: skupni `deadlines.visible`; nespremenjeni `TaskBoard` | Uspešno; preklopi vseh skupin ter prazen vnos med preklopi. |
| R10 | Menjava projekta/osvežitev ponastavita; brez shrambe/URL | A03 | `src/App.tsx`: lokalni `useState`, obstoječi `key={project.id}` | Uspešno; A → B → A, osvežitev, prazni shrambi in nespremenjen URL filtra. |
| R11 | Pet ničel; prazna skupina in možnost vrnitve | A04: empty projects and empty groups remain navigable; A05: single task, empty group, mobile Folio and read-only details | `src/deadlines.ts`: ničelni števci; `src/App.tsx`: `deadline-empty` in kontrole | Uspešno; oba prazna projekta in prazna skupina v obeh pogledih, vrnitev na `all`. |
| R12 | Veljavni datumi, brez zapisov, ohranjeni podatki in Folio | A01, A02, A05, D04, 38 osnovnih preverjanj; vizualni pregled | `src/App.tsx`, `src/styles.css`; ohranjeni `TaskDetails`, `TaskBoard`, `formatDate`, API in tipi | Uspešno; prestopni datum, bralne podrobnosti, brez zapisov in brez razširitve strani pri 390 pik. |

## Omejitve in predaja

Znane neizpolnjene zahteve R01–R12 niso ugotovljene. Testi so vzorci opisane domene, ne izčrpen dokaz za vse podatke. Končni testi niso dostopni in niso označeni kot izvedeni. Izven dogovorjenega obsega ostajajo neveljavni strežniški datumi ter nove sočasne spremembe podatkov brez osvežitve. Samostojni ročni strežnik ni bil potreben; posnetki so nastali prek obstoječe konfiguracije Playwright in povezave do nameščenega Chromiuma.

T001–T009 so zaključene. Naslednji korak `speckit-converge` sproži izvajalnik; v tem koraku ni bil izveden.
