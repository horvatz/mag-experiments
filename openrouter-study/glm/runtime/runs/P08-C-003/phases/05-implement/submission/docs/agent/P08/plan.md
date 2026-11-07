# Načrt implementacije: Koledarski pregled rokov

## Tehnični kontekst

Folio je React 19 + TypeScript + Vite aplikacija. Stanje projekta in opravil se nalaga z obstoječim `useResource` prek javnega GET API-ja `/api/projects` in `/api/projects/:id/tasks`. Preglednica je v `src/App.tsx`, tabla v `src/TaskBoard.tsx`, navigacija v `src/navigation.ts`, oblikovanje v `src/styles.css`, datumska oblika pa v `src/formatDate.ts`. Obstoječe hash navigacije, poti, tipi, strežnik, odvisnosti, skupni testi in nastavitve ostanejo nespremenjeni.

## Odločitve

- Novo stanje P08 (`referenčni datum`, besedilo datumskega polja, opozorilo in izbiro skupine rokov) hranimo lokalno v komponenti `ProjectView`. Ključ `project.id` že povzroči ponastavitev ob menjavi projekta; shramba ali URL nista potrebna.
- Izračun skupine implementiramo v novi čisti pomožni enoti `src/due.ts`. Datum razčlenimo kot koledarski `YYYY-MM-DD`, brez `Date.now()`, lokalnega časa, časovnega pasu ali poletnega časa. Za dodajanje sedmih dni uporabimo UTC objekt z `T00:00:00Z` ali ekvivalentno koledarsko aritmetiko.
- Obstoječi pregled stanj in števci pripravljenosti ostanejo nespremenjeni. Novih pet števcev rokov postavimo v obstoječi `summary-grid` oz. ustrezno Folio različico, z zahtevanimi `aria-label`.
- Preglednica in tabla prejmeta isti filtriran seznam. `TaskBoard` ostane stateless, z obstoječim razvrščanjem po statusih in izvornim zaporedjem. Obe prikaza ohranita `data-task-id`, obstoječe dostopne nazive, povezave in stolpce.
- Neveljaven ali prazen referenčni datum ne posodobi zadnjega veljavnega datuma, temveč prikaže `role="alert"`. Ob novem veljavnem datumu se skupine, števci in prikaz takoj posodobijo, opozorilo pa izgine.

## Spremembe po datotekah

| Datoteka | Načrt |
| --- | --- |
| `src/due.ts` | Novi tipi skupin rokov, validacija koledarskega datuma, izračun skupine in seštevanje dni. |
| `src/App.tsx` | Novo lokalno stanje P08, kontrole `Referenčni datum` in `Pogled rokov`, pet števcev, filtriran seznam, prazna stanja ter prenos seznama v preglednico/tablo. |
| `src/TaskBoard.tsx` | Filtrirani vnosi v tabeli, ohranjanje izvornega zaporedja in obstoječega dostopnega imenovanja. |
| `src/styles.css` | Previdna dopolnitev obstoječih Folio razredov za kontrole, števce in ozke zaslane; brez novih odvisnosti ali globalnih preureditev. |
| `tests/agent/p08.spec.ts` | Lastni Playwright testi za R01–R12 z nadzorovanimi GET odgovori, vključno s praznimi, robnimi in prestopnimi datumi. |
| `docs/agent/P08/spec.md` | Po izvedeni preverbi dopolni sledljivost z dejanskimi testi, deli kode in izidi. |

## Zaporedje

1. Dodaj `src/due.ts` z čisto koledarsko logiko in pokri vse meje R02–R05.
2. Prenesi kontrole in lokalno stanje v `ProjectView`, nato enoten filtriran seznam za preglednico in tablo.
3. Dopolni `TaskBoard` in obstoječe Folio stile, brez sprememb API-ja ali infrastrukture.
4. Napiši lastne Playwright teste v `tests/agent/`, z nadzorovanimi podatki prek obstoječega testnega mehanizma.
5. Zaženi usmerjene lastne teste, nato smiselno skupne preverbe; zabeleži samo dejanske izide.

## Preverjanje

Zahteve preverimo z:

- testi koledarske logike prek uporabniškega vmesnika: meje `r-1`, `r`, `r+1`, `r+7`, `r+8`, konec meseca, konec leta in prestopni februar;
- prehodom med projekti, preglednico in tablo ter osvežitvijo;
- primerjavo petih števcev pred in po menjavi filtra;
- preverbo praznega projekta in prazne izbrane skupine;
- preverbo `aria-label`, opozorila in odsotnosti zapisovalnih zahtev;
- preverbo odsotnosti `localStorage` in URL-parametrov P08.

## Omejitve

Ne spreminjamo strežnika, skupnih tipov, odvisnosti, konfiguracije, skupnih testov, testnih kontrol ali uradnih predlog. Po navodilih ne širimo navigacije med nezaključenim nalaganjem in novih sočasnih sprememb podatkov brez osvežitve. Zunanjih meritev in dodatnih zahtev ni.
