# Specifikacija P05: Straničenje in filter stanja

Vir zahtev: `task/instructions.md` (R01–R12). Predloga: `task/specification-template.md`. Potrjeni dizajn: `docs/dizajn.md`. Ta specifikacija ne dodaja novih zahtev, odvisnosti ali zunanjih meritev.

## Problem in kontekst

Folio prikazuje opravila enega projekta v preglednici in na tabli ter povzetek stanj (`aria-label="Pregled stanj opravil"`). Trenutno so prikazana vsa opravila hkrati in brez filtra stanja. Uporabnik želi prikaz omejiti na izbrano stanje in velikost strani, pri čemer morajo vsa opravila ostati dosegljiva, ID-ji nespremenjeni, podatki pa nespremenjeni.

## Vhodi, dejanja in izidi

- Vir podatkov: obstoječi javni API `GET /api/projects/{id}/tasks`; polja opravil ostanejo enaka izhodišču. UI bere samo `/api/` in ne uporablja testnih kontrol `/__test/`.
- Kontrole: `select` Velikost strani (all/2/5/10), `select` Filter strani (all/todo/in_progress/done), gumbi Prva stran, Prejšnja stran, Naslednja stran, Zadnja stran, element `role=status` z `aria-label="Stanje straničenja"`.
- Dejanja in pričakovano stanje:
  - menjava velikosti strani: prikaz se postavi na prvo stran nove velikosti;
  - menjava filtra: filter se uporabi pred straničenjem, prikaz se postavi na prvo stran;
  - robni premik: neveljavno dejanje je onemogočeno in ne spremeni stanja;
  - preklop pogleda in odpiranje/zapiranje podrobnosti: stran, velikost in filter ostanejo;
  - menjava projekta in osvežitev: velikost all, filter all, prva stran.
- Napaka nalaganja: obstoječi prikaz napake s ponovnim poskusom; stanje straničenja ni v trajni shrambi ali URL-ju.

## Zahteve in pravila

Simboli: `T` = filtrirana opravila v izvornem vrstnem redu; `n = |T|`; `f` = filter (all/todo/in_progress/done); `s` = velikost strani (all/2/5/10); `Y` = število strani; `p` = trenutna stran (1-osnovna, 0 le pri praznem rezultatu).

Predikati:
- `T = [t za t v tasks(project), če f = all ali t.status = f]` (vrstni red izvora se ohrani).
- `Y = 0, če n = 0; 1, če s = all; sicer ceil(n / s)`.
- `odsek(T, s, p) = T[(p-1)*s .. min(p*s, n)-1]`; pri `s = all` je odsek enak `T`.
- `A = 0, če n = 0; sicer (p-1)*s + 1` (pri `s = all`: `A = 1`); `B = 0, če n = 0; sicer min(p*s, n)` (pri `s = all`: `B = n`).
- Status: `Stran p od Y. Prikazano A–B od n.`; pri `n = 0` velja `p = Y = A = B = 0`.
- Prehod dejanja: `prva: p := 1`; `prejšnja: p := max(1, p-1)`; `naslednja: p := min(Y, p+1)`; `zadnja: p := Y`. Dejanje je onemogočeno, ko `Y = 0`; prva/prejšnja tudi ko `p <= 1`; naslednja/zadnja tudi ko `p >= Y`.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Ob odprtju velja `f = all`, `s = all`; prikazana so vsa opravila v izvornem vrstnem redu, `Y = 1`, `p = 1`. | Lasten test: privzeti vrednosti selectov in vrstni red ID-jev. |
| R02 | Za `s` v {2, 5, 10} so odseki zaporedni in neprekrivajoči; unija odsekov je `T`; zadnja stran je lahko krajša; noben ID se ne izgubi ali podvoji. | Lasten test z `n` večjim od 10 in `n`, ki ni večkratnik `s`. |
| R03 | Prva/Prejšnja/Naslednja/Zadnja vodijo na `p = 1`, `max(1, p-1)`, `min(Y, p+1)`, `Y`. Na robu je gumb onemogočen in stanje se ne spremeni. | Lasten test robnih strani in onemogočenih gumbov. |
| R04 | Sprememba `s` vedno postavi `p = 1`, tudi če bi bila prejšnja številka še veljavna; `s = all` pomeni `Y = 1` pri `n > 0`. | Lasten test: sprememba velikosti z veljavne srede strani. |
| R05 | Filter se uporabi pred straničenjem; sprememba `f` postavi `p = 1`; vrstni red ujemajočih se opravil se ne spremeni. | Lasten test: `T` po filtrih in vrstni red. |
| R06 | Preglednica in tabla prikažeta iste ID-je `odsek(T, s, p)`; tabla združi šele ta odsek v stolpce in ne straniči vsakega stolpca posebej. | Lasten test primerjave ID-jev obeh pogledov. |
| R07 | Preklop pogleda ter odpiranje in zapiranje podrobnosti ohranijo `p`, `s` in `f`. | Lasten test stanja po preklopu in odprtju podrobnosti. |
| R08 | Menjava projekta in osvežitev postavita `s = all`, `f = all`, `p = 1`; stanje ni v trajni shrambi ali URL-ju. | Lasten test ponastavitve in pregled kode (brez `localStorage`/URL). |
| R09 | Pri `n > 0` status vsebuje `Stran p od Y. Prikazano A–B od n.` z indeksoma `A`/`B` z začetkom 1. | Lasten test natančnega besedila statusa. |
| R10 | Pri `n = 0` (prazen projekt ali prazen filter) status vsebuje `Stran 0 od 0. Prikazano 0–0 od 0.` in vsi štirje gumbi so onemogočeni; ob odstranitvi filtra je spet prva stran. | Lasten test praznega rezultata in odstranitve filtra. |
| R11 | Povzetek stanj šteje celoten nefiltrirani projekt; števci stolpcev table štejejo prikazana opravila trenutne strani; skupno število opravil se zaradi straničenja ne spremeni. | Lasten test števcev povzetka in stolpcev. |
| R12 | Straničenje ne spreminja podatkov in ne pošilja zapisov na API; obstoječe povezave, pravilni ID-ji, podrobnosti, nalaganje in prilagodljiv videz Folio ostanejo uporabni. | Skupni testi (`tests/baseline.spec.ts`, `tests/api.spec.ts`) in lastni testi. |

## Izvedba in sledljivost

Povezani dokumenti: `task/instructions.md`, `.specify/memory/constitution.md`, potrjeni dizajn `docs/dizajn.md`; načrt bo v `docs/agent/P05/plan.md`, naloge v `docs/agent/P05/tasks.md`. Koda je v `src/` (zlasti `src/App.tsx`, `src/TaskBoard.tsx`), lastni testi v `tests/agent/`. Izidi se vpišejo po dejanskem zagonu; prazno polje pomeni, da preverjanje še ni izvedeno.

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | `f = all`, `s = all`, izvorni vrstni red | lastni test privzetkov | `src/App.tsx` (stanje strani/filtra) | ni izvedeno |
| R02 | zaporedni neprekrivajoči odseki, brez izgube/podvojitve | lastni test velikosti 2/5/10 | `src/App.tsx` (izračun odseka) | ni izvedeno |
| R03 | navigacija in onemogočeni gumbi na robu | lastni test robov | `src/App.tsx` (gumbi) | ni izvedeno |
| R04 | menjava velikosti vrne na prvo stran; all = ena stran | lastni test menjave velikosti | `src/App.tsx` | ni izvedeno |
| R05 | filter pred straničenjem, prva stran, nespremenjen vrstni red | lastni test filtra | `src/App.tsx` | ni izvedeno |
| R06 | ista stran v obeh pogledih; tabla združi le odsek | lastni test primerjave pogledov | `src/TaskBoard.tsx` | ni izvedeno |
| R07 | ohranitev stanja ob preklopu in podrobnostih | lastni test stanja | `src/App.tsx`, `src/TaskDetails.tsx` | ni izvedeno |
| R08 | ponastavitev ob menjavi projekta in osvežitvi | lastni test ponastavitve | `src/App.tsx`, `src/navigation.ts` | ni izvedeno |
| R09 | natančno besedilo statusa pri nepraznem rezultatu | lastni test statusa | `src/App.tsx` (`role=status`) | ni izvedeno |
| R10 | status 0 od 0, vsi gumbi onemogočeni, odstranitev filtra | lastni test praznega rezultata | `src/App.tsx` | ni izvedeno |
| R11 | povzetek celotnega projekta, števci stolpcev odseka | lastni test števcev | `src/App.tsx`, `src/TaskBoard.tsx` | ni izvedeno |
| R12 | brez sprememb podatkov in zapisov; obstoječe delovanje Folio | skupni testi in lastni regresijski testi | `src/` | ni izvedeno |

## Odprta vprašanja in omejitve

- Razporeditev novih kontrol ni predpisana; izbere se po merilih Folio in se zabeleži v načrtu.
- Razvojni primeri niso celoten obseg; končni primeri lahko uporabijo drugačne podatke opisane domene (poljubno število opravil, tudi nič, eno in več kot deset).
- Navigacije med nezaključenim nalaganjem in novih sočasnih sprememb podatkov brez osvežitve ne širimo prek obstoječih regresijskih zahtev.
- Lastna preverjanja se izvajajo poleg skupnih; nedostopnih končnih testov ne navajamo kot opravljene. Če preverjanje ni izvedeno, ostane izid prazen z navedbo omejitve.
