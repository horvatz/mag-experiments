# Specifikacija: Koledarski pregled rokov (P08)

## Problem in kontekst

Folio trenutno prikazuje vsa opravila projekta in tri števce po stanju. Uporabnik potrebuje pregled rokov glede na stabilen referenčni dan, števce po petih skupinah rokov ter filter, ki deluje enako v preglednici in tabli. Obstoječe branje prek `/api/`, podrobnosti opravila in prilagodljiv videz Folio ostanejo del rešitve.

Začetni referenčni datum je vedno `2026-09-21`, začetni izbor pa `all`. Stanje datuma in izbora velja samo za trenutno odprt projektni pogled: izbira drugega projekta ali osvežitev ga ponastavi, preklop preglednice/table pa ga ohrani.

## Vhodi, dejanja in izidi

- Vhod opravila: `id`, `projectId`, `title`, `description`, `status`, `assignee`, `dueDate`; seznam v vrstnem redu API odgovora je vir prikaza.
- `dueDate` in referenčni datum sta koledarska datuma `YYYY-MM-DD`. Rok se razvrsti po dnevni razliki, ne po času ali lokalnem časovnem pasu.
- Uporabnik lahko spremeni datum in izbere `all`, `overdue`, `today`, `week`, `later` ali `done`. Veljaven datum takoj postane zadnji veljavni izračun. Prazno polje sproži opozorilo, ohrani izpisano prazno vrednost in zadnji izračun; naslednji veljaven datum opozorilo odstrani.
- Preklop pogleda ali izbira projekta uporablja obstoječo navigacijo. Preklop pogleda ohrani lokalno stanje trenutnega projekta, menjava projekta ga začne z začetnimi vrednostmi. Osvežitev ponovno ustvari začetno lokalno stanje.
- Pregled je samo bralen: uporablja javni GET API, ne spreminja opravil in ne shranjuje filtra v URL ali trajno shrambo.

## Zahteve in pravila

Za opravilo `t`, referenčni datum `d` in množico `T` določimo `Δ(t,d)` kot število koledarskih dni med `d` in `t.dueDate`. Skupine odprtih opravil so:

```text
done(t)    := t.status = done
overdue(t) := t.status ≠ done ∧ Δ(t,d) < 0
today(t)   := t.status ≠ done ∧ Δ(t,d) = 0
week(t)    := t.status ≠ done ∧ 1 ≤ Δ(t,d) ≤ 7
later(t)   := t.status ≠ done ∧ Δ(t,d) > 7
```

Filter `all` vrne `T`; vsak drug filter vrne opravila, ki ustrezajo istoimenski predikatski skupini, v izvornem vrstnem redu. Števec skupine `g` je `|{t ∈ T : g(t)}|` in ni odvisen od aktivnega filtra. Referenčni datum se pretvori v koledarski dan neodvisno od časovnega pasu in poletnega časa.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Za vsak nov projektni pogled `d = 2026-09-21`, filter `all`. | Začetni render ter projektna navigacija in osvežitev. |
| R02 | `t.status = done ⇒ done(t)` in `¬overdue(t) ∧ ¬today(t) ∧ ¬week(t) ∧ ¬later(t)`. | Opravila done z zgodnjim in današnjim rokom, števci/filter. |
| R03 | Za odprto opravilo `Δ < 0 ⇒ overdue`; `Δ = 0 ⇒ today`. | Mejna dneva pred in na referenčni dan. |
| R04 | Za odprto opravilo `1..7 ⇒ week`, `>7 ⇒ later`; odprte predikatske skupine so paroma disjunktne in skupaj z `done` pokrijejo vsa opravila. | Rok +7, +8, zgodnji/današnji roki in vsota števcev. |
| R05 | `Δ` temelji na koledarskih dnevih; prehod čez mesec/leto in 29. februar ohranita pravilen razmik. | Agentni testi meja tedna, prestopnega dne in prehoda 31. 12.–1. 1.; UTC aritmetika v kodi. |
| R06 | Pet števcev se računa iz vseh `T`, ne iz filtriranega podnabora. | Sprememba filtra ne spremeni prikazanih petih števil. |
| R07 | Izbor filtra vrne ustrezno skupino brez spreminjanja `Task`; relativni vrstni red rezultatov je enak vrstnemu redu API seznama. | Filtri in preverjanje ID-jev/vrstnega reda. |
| R08 | Veljaven osnutek nastavi `d`; prazen osnutek nastavi opozorilo, ne pa `d`; nov veljaven osnutek počisti opozorilo. | Sprememba datuma z aktivnim filtrom ter prazno/veljavno zaporedje. |
| R09 | Preglednica in tabla prejmeta isti filtrirani seznam; preklop pogleda ne ponastavi `d`, osnutka ali filtra. | Primerjava ID-jev obeh pogledov po spreminjanju vseh kontrol. |
| R10 | Menjava projekta in ponovni zagon aplikacije obnovita začetni datum/filter; stanja filtra ni v URL-ju ali trajni shrambi. | Navigacija med projektoma, reload ter pregled URL/shrambe. |
| R11 | Prazno `T` ima pet ničel. Prazen filter podmnožice pokaže `Ni opravil v izbrani skupini.`; kontrolniki ostanejo uporabni. | Prazen projekt in izpraznjena izbrana skupina. |
| R12 | Veljavni datumi ostanejo koledarski, pregled ne izvaja zapisov API; izpis podrobnosti nespremenjen. Pri 390 px ni vodoravnega drsenja cele strani, le notranjih prikazov. | Leap-date izris, nadzor zapisov, podrobnosti, odzivni prikaz. |

## Izvedba in sledljivost

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | Projekt začne z datumom `2026-09-21` in filtrom `all`. | `D01: fixed anchor and overdue tasks`; `project navigation and reload reset local date and deadline selection`. | `src/App.tsx:14-17, 56-65, 112`; projektna komponenta ima privzeto stanje, ob menjavi ključa pa se ponovno ustvari. | Opravljeno v `npm run check`; 54/54 testov uspešnih. |
| R02 | `done` se razvrsti pred primerjavo rokov in ne šteje v odprte skupine. | `D04: done group, board and no writes`; `calendar groups include both week boundaries, leap day and done regardless of due date`. | `src/deadlines.ts:23-30, 33-42`. | Opravljeno; agentni primer preveri zgodnji rok končanega opravila in pet števcev. |
| R03 | Odprt rok pred d je `overdue`, enak d je `today`. | `D01: fixed anchor and overdue tasks`; `calendar groups include both week boundaries, leap day and done regardless of due date`. | `src/deadlines.ts:26-30`. | Opravljeno; agentni scenarij preveri oba razreda na `2024-02-28`. |
| R04 | `1 ≤ Δ ≤ 7` je `week`, `Δ > 7` je `later`; razredi skupaj s `done` tvorijo particijo. | `D02: inclusive week boundary`; `calendar groups include both week boundaries, leap day and done regardless of due date`; `calendar difference crosses the year boundary by one to seven full days`. | `src/deadlines.ts:23-30, 33-42`. | Opravljeno; preverjena roka +7 in +8, meje tedna, vsi števci in filter skupine. |
| R05 | Koledarski dan je izračunan prek UTC; brez seštevanja lokalnih 24-urnih obdobij. | `calendar groups include both week boundaries, leap day and done regardless of due date`; `calendar difference crosses the year boundary by one to seven full days`. | `src/deadlines.ts:14-20, 26`; `src/formatDate.ts` obstoječi UTC izris rokov. | Opravljeno za prestopni februar ter mejo leta; drugačnega brskalniškega časovnega pasu nismo posebej nastavili. |
| R06 | `deadlineCounts` prejme celoten API seznam, ne `visibleTasks`. | Števci v `calendar groups include both week boundaries, leap day and done regardless of due date` ostanejo isti po menjavi filtra; `empty projects have five zero counters and an empty state`. | `src/App.tsx:18-19, 37-42`; `src/deadlines.ts:33-42`. | Opravljeno; pet števil ostane nespremenjenih med filtrom, prazen seznam ima pet ničel. |
| R07 | `all` vrne `T`; drug izbor filtrira po predikatu brez sortiranja ali mutiranja. | `D01`–`D04`; agentni testi koledarskih skupin in `deadline review and details stay read only with original calendar dates and text`. | `src/deadlines.ts:45-47`; izbor v `src/App.tsx:56-65, 72`. | Opravljeno; API vrstni red preverjen za filtrirano tabelo, ID-ji obeh pogledov so enaki. |
| R08 | Prazna osnutek-vrednost ne spremeni `referenceDate`; veljavna jo posodobi in odstrani alert. | `D03: empty draft retains last valid classification`; `reference draft, selected group and filtered IDs survive switching views`. | `src/App.tsx:14-29, 56-67`; izračun uporablja zadnji veljavni `referenceDate`. | Opravljeno v desktop/mobile razvojnih testih in agentnem preklopnem scenariju. |
| R09 | Table in board dobita `visibleTasks`; stanje filtra/datuma je v `ProjectView`, ne v pogledu. | `D04: done group, board and no writes`; `calendar groups include both week boundaries, leap day and done regardless of due date`; `reference draft, selected group and filtered IDs survive switching views`. | `src/App.tsx:12-19, 51-53, 68-84`; `src/TaskBoard.tsx` filtrirani vhod. | Opravljeno; primerjava enakih filtriranih ID-jev ter ohranitev praznega osnutka in filtra pri preklopu. |
| R10 | Stanje ni shranjeno; `key={project.id}` povzroči začetno stanje za drug projekt. | `project navigation and reload reset local date and deadline selection`. | `src/App.tsx:12-17, 112`; URL sestavljata samo projekt in pogled v `src/navigation.ts`. | Opravljeno; test preveri reload, projektno navigacijo, hash in `localStorage`. |
| R11 | Prazna podmnožica nepraznega projekta prikaže predpisano sporočilo; prazno T ohrani prazno stanje. | `empty groups in non-empty project keep recovery controls available`; `empty projects have five zero counters and an empty state`. | `src/App.tsx:37-42, 56-68`; `src/styles.css:65-69`. | Opravljeno; omogočeno je vračanje na `all`, vsi filtri ostanejo na voljo. |
| R12 | Samo GET branje; date vrednosti pri izpisu ostanejo iz API; prilagodljiv prikaz. | `D04`; `390px layout keeps page width fixed while table and board can scroll internally`; `deadline review and details stay read only with original calendar dates and text`. | `src/App.tsx:13, 72-77`; `src/TaskBoard.tsx`; `src/TaskDetails.tsx`; `src/styles.css:52-69, 74-95`. | Opravljeno; preverjeni nič zapisov, nespremenjen datum/opis in notranje drsenje pri 390 px. |

## Odprta vprašanja in omejitve

- HTML `input[type=date]` sprejema samo veljavne koledarske vrednosti oziroma prazno vrednost; neprazne neveljavne vrednosti niso dosegljive kot običajen uporabniški vnos.
- Pri tabli se opravila še naprej razporejajo v obstoječe stolpce stanj. Izvorni vrstni red se ohrani znotraj filtriranega seznama in stolpca; položaj med različnimi stolpci je določen z obstoječo zasnovo table.
- Končni testi te naloge niso priloženi; dejanski obseg preverjanja bo naveden v `verification.md`.

## Zapis popravkov specifikacije

- 2026-09-27: začetna specifikacija pred implementacijo.
- 2026-09-27: po izvedbi dopolnjena sledljivost s kodo, imeni dejansko opravljenih scenarijev in njihovimi izidi.
