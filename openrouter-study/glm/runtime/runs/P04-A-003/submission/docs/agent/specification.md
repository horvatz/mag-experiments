# Specifikacija: P04 – Stabilno razvrščanje z dvema ključema

## Problem in kontekst

Folio trenutno prikazuje opravila v vrstnem redu, v katerem ga vrne javni API `/api/projects/{projectId}/tasks`. Uporabnik potrebuje urejanje pregleda po primarnem in sekundarnem ključu ter neodvisnih smereh, ki velja za preglednico in tablo, vendar ne spreminja podatkov.

## Vhodi, dejanja in izidi

- Vhodni podatki: `Task.id`, `projectId`, `title`, `description`, `status`, `assignee`, `dueDate`; vsi se berejo iz obstoječega API-ja.
- Kontrole: `Primarni ključ` (`original`, `title`, `assignee`, `status`, `dueDate`), `Primarna smer` (`asc`, `desc`), `Sekundarni ključ` (`none`, `title`, `assignee`, `status`, `dueDate`), `Sekundarna smer` (`asc`, `desc`) ter gumb `Izvorni vrstni red`.
- Izhod: eno razvrščeno polje, ki ga uporabita preglednica in tabla; ID-ji ostanejo enkratni, podrobnosti odpirajo pravi zapis.
- Napaka/preklic: napaka nalaganja ohrani obstoječe obnašanje; razvrščanje nima pošiljanja podatkov ali trajnega stanja.

## Zahteve in pravila

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | `default(sort) = sort(original, asc, none, asc) ∧ ordered(default) = received` | Playwright: privzeti vrstni red in vrednosti kontrol. |
| R02 | Za `title` in `assignee`: `compare(x,y) = normalize(x) < normalize(y) → -1`, `> → 1`, sicer `0`, kjer je `normalize(s) = removeMarks(lowercase(NFD(s)), U+0300–U+036F)`; primerjava je po UTF-16 enotah. | Lastni test z Unicode, ločili, številkami in velikimi/malimi črkami. |
| R03 | `rank(status) = todo < in_progress < done`; `dueDate` se primerja kronološko po veljavnem `YYYY-MM-DD`. | Lastni test z vsemi stanji in datumi. |
| R04 | Smer se uporabi samo na primerjavi izbranega ključa; izenačeni elementi ohranijo izvorni vrstni red. | Lastni test enakih ključev v obeh smereh. |
| R05 | Sekundarna primerjava se uporabi samo, kadar je primarna primerjava enaka, z lastno neodvisno smerjo. | Lastni test enakih primarnih vrednosti. |
| R06 | Ob enakosti obeh primerjav se uporabi izvorni indeks; `primary = original → output = received` ne glede na druge kontrole. | Lastni test enakosti, enakega ključa in originala. |
| R07 | `boardOrder(status, s) = filter(sorted, status)`; stolpci ostanejo `todo`, `in_progress`, `done`. | Lastni test tabele. |
| R08 | Sprememba pogleda ali odpiranje/zapiranje podrobnosti ne spremeni štirih nastavitev ali razvrščenega vrstnega reda. | Lastni test preklopa pogledov in podrobnosti. |
| R09 | Projekti imajo ločeno stanje; menjava projekta ali osvežitev ponastavi na privzete vrednosti; ni `localStorage` ali URL. | Lastni test menave projekta in osvežitve. |
| R10 | Gumb ponastavi `original, asc, none, asc`; deluje za 0 in 1 opravilo ter vseh ključih/smerih. | Lastni testi za prazen projekt in projekt z enim opravilom. |
| R11 | Razvrščanje je projekcija: ne spremeni opravil, števcev, pripadnosti ali izvornega polja; ne sproži zapisovalnega API-ja. | Lastni test števcev, vrstnega reda po resetu in odsotnosti zapisov. |
| R12 | Vsak ID se prikaže natanko enkrat in povezava vsebuje ID; enaki naslovi ne vplivajo na povezavo. | Lastni test enakih naslovov in odpiranja podrobnosti. |

## Izvedba in sledljivost

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | Privzeti vrstni red | A01 | `src/sorting.ts`, `src/App.tsx` | Uspešno: A01 in celoten `npm run check`. |
| R02 | Normalizacija naslovov in oseb | A01 | `src/sorting.ts` | Uspešno: A01 in celoten `npm run check`. |
| R03 | Vrstni red stanj in datumov | A01 | `src/sorting.ts` | Uspešno: A01 in celoten `npm run check`. |
| R04 | Smer primarnega ključa in stabilnost | A01 | `src/sorting.ts` | Uspešno: A01 in celoten `npm run check`. |
| R05 | Neodvisna sekundarna smer | A01 | `src/sorting.ts` | Uspešno: A01 in celoten `npm run check`. |
| R06 | Izvorni indeks in original | A01 | `src/sorting.ts` | Uspešno: A01 in celoten `npm run check`. |
| R07 | Relativni vrstni red v tabli | A02 | `src/App.tsx`, `src/TaskBoard.tsx` | Uspešno: A02 in celoten `npm run check`. |
| R08 | Ohranitev pogleda in podrobnosti | A02 | `src/App.tsx` | Uspešno: A02 in celoten `npm run check`. |
| R09 | Ponastavitev ob menjavi projekta/osvežitvi | A03 | `src/App.tsx` | Uspešno: A03 in celoten `npm run check`. |
| R10 | Reset ter prazen/en opravili | A04, A05 | `src/App.tsx` | Uspešno: A04, A05 in celoten `npm run check`. |
| R11 | Projekcija brez zapisov | A01, A04 | `src/sorting.ts`, `src/App.tsx` | Uspešno: A01, A04 in celoten `npm run check`. |
| R12 | Enkratni ID-ji in prave podrobnosti | A02, A06 | `src/App.tsx`, `src/TaskBoard.tsx` | Uspešno: A02, A06 in celoten `npm run check`. |

## Odprta vprašanja in omejitve

- Predpostavljeno je, da so datumi vedno veljavni `YYYY-MM-DD` in imena neprazna, kot določajo navodila.
- Stanje razvrščanja je trenutno za trenutni projekt in pogled; ni namere podpreti sočasnih sprememb podatkov brez osvežitve.

## Zgodovina sprememb

- 2026-10-11: Prva različica specifikacije pred implementacijo.
- 2026-10-11: Popravek po implementaciji in preverjanju: dopolnjena sledljivost R01–R12 z dejanskimi izidi.
