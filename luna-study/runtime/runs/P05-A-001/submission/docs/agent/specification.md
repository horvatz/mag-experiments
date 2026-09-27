# Specifikacija P05: Straničenje in filter stanja

## Problem in kontekst

Folio trenutno prikazuje vsa opravila iz javnega API-ja v preglednici ali tabli. Uporabnik želi omejiti prikaz z velikostjo strani in filtrom stanja, ne da bi se spremenili vrstni red ali podatki. Stanje straničenja velja samo za trenutno odprti projekt; izbira pogleda in odpiranje podrobnosti ga ne ponastavita.

## Vhodi, dejanja in izidi

Vhod je urejeno polje `T` opravil za izbrani projekt z ID-jem in enim od stanj `todo`, `in_progress`, `done`. Kontrole izbirajo velikost `s ∈ {all, 2, 5, 10}`, filter `f ∈ {all, todo, in_progress, done}` ter smer strani.

Dejanja: izbira velikosti nastavi stran na 1; izbira filtra nastavi stran na 1; navigacijski gumbi premaknejo stran le, če je cilj znotraj veljavnega obsega; menjava pogleda in odpiranje/zapiranje dialoga ohranita stanje. Menjava projekta ustvari novo stanje `all/all/1`; osvežitev začne z enakim privzetim stanjem. Naloženi podatki so samo za branje. Napaka nalaganja ohrani obstoječi prikaz napake in možnost ponovnega nalaganja.

## Zahteve in pravila

Naj bo `F = T`, če je `f = all`, sicer `F = [t ∈ T | t.status = f]`. `P(s, F, p)` je `F`, če je `s = all`, sicer odsek od indeksa `(p−1)·s` z dolžino največ `s`. Število strani `Y = 0`, če je `|F| = 0`; sicer `Y = 1`, kadar je `s = all`, in `ceil(|F|/s)` sicer. Veljavna stran je `1..Y`, pri praznem rezultatu je `p = 0`. `A` in `B` sta začetni in končni 1-osnovani indeks prikazanega odseka; pri praznem rezultatu sta oba 0.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Začetno `s=f=all`, `p=1`; prikazani ID-ji so ID-ji `T` v istem vrstnem redu. | Razvojni P05 in lastni začetni scenarij. |
| R02 | `s∈{2,5,10}`; `P` tvori zaporedne odseke brez izgube ali podvajanja ID-jev. | Razvojni P05 in lastni razrez več strani. |
| R03 | Navigacija izbere prvo/prejšnjo/naslednjo/zadnjo veljavno stran; robni gumbi so onemogočeni. | Razvojni P05 in lastni robni scenariji. |
| R04 | Sprememba `s` nastavi `p=1`; `all` ima eno stran, če je `F` neprazen. | Razvojni P05 D04 in lastni scenarij spremembe velikosti. |
| R05 | Filter se uporabi pred `P`; po spremembi `f` je `p=1`; relativni vrstni red ostane. | Razvojni P05 D03 in lastni preverjanje filtrov. |
| R06 | Preglednica in tabla dobita isti `P(s,F,p)`; tabla razvrsti samo ta odsek po stanju. | Razvojni P05 D03 in preverjanje ID-jev obeh pogledov. |
| R07 | Sprememba `view` in dialoga ne spreminja `s`, `f`, `p`. | Lastni scenarij preklopa pogleda in dialoga. |
| R08 | Menjava projekta in osvežitev začneta z `all/all/1`; stanje ni zapisano v URL ali trajni shrambi. | Lastni navigacijski in osvežitveni scenarij; pregled URL-ja. |
| R09 | Za `|F|>0` status: `Stran p od Y. Prikazano A–B od |F|.` | Razvojni P05 D02 in lastno preverjanje indeksa. |
| R10 | Za `|F|=0`: stran `0 od 0`, prikaz `0–0 od 0.`; vsi premiki onemogočeni. Filter se da odstraniti in rezultat se vrne na stran 1. | Lastno preverjanje praznega projekta in filtra. |
| R11 | Pregled stanj in skupno število opravil uporabljata `T`; števci table uporabljajo samo prikazani odsek. | Lastno preverjanje polne vsote in števcev. |
| R12 | Straničenje je samo prikazno in ne povzroča zapisovalnih zahtev; ostanejo API, ID-povezave, podrobnosti in prilagodljiva postavitev. | Razvojni in izhodiščni testi, lastni sledenje zapisom ter mobilna širina. |

Predpostavka: sprememba podatkov brez ponovnega nalaganja ni razširjena; to sledi omejitvi naloge. Rezultati straničenja niso del URL-ja in niso shranjeni v brskalniku.

## Izvedba in sledljivost

Predvidena glavna izvedba: lokalno stanje in izpeljani odseki v `src/App.tsx`, skupni odsek poslan v `src/TaskBoard.tsx`, kontrolni slogi v `src/styles.css`. Lastni preveritveni scenariji bodo v `tests/agent/P05.spec.ts`.

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | Privzeta izbira `all/all/1`; ID-ji ohranijo vrstni red API-ja. | P05 A01. | `src/App.tsx:16-27,64-95`. | Opravljeno; glej `verification.md`. |
| R02 | Odseki velikosti 2/5/10 so zaporedni in brez prekrivanja. | P05 D01, D04; A01, A03, A07. | `src/App.tsx:20-27,34-38,82-95`. | Opravljeno; glej `verification.md`. |
| R03 | Navigacija spoštuje meje; gumbi na robu so onemogočeni. | P05 A01. | `src/App.tsx:36-38,75-80`. | Opravljeno; glej `verification.md`. |
| R04 | Sprememba velikosti nastavi stran 1; `all` pomeni eno stran za neprazen rezultat. | P05 D04; A03. | `src/App.tsx:21,34`. | Opravljeno; glej `verification.md`. |
| R05 | Filter pred rezanjem ohrani izvorni vrstni red in ponastavi stran. | P05 D03; A02, A05. | `src/App.tsx:20,35`. | Opravljeno; glej `verification.md`. |
| R06 | Oba prikaza prejmeta isti odsek; tabla nato razvrsti opravila v stolpce. | P05 D03; A02, A07. | `src/App.tsx:23-25,83,87`; `src/TaskBoard.tsx:13-25`. | Opravljeno; glej `verification.md`. |
| R07 | Pogled in podrobnosti ohranijo lokalno stanje straničenja. | P05 A04. | `src/App.tsx:14-18,60-62,99`. | Opravljeno; glej `verification.md`. |
| R08 | Projektna komponenta in osvežitev začneta z `all/all/1`; URL/shramba nimata stanja straničenja. | P05 A03, A04. | `src/App.tsx:16-18,127`. | Opravljeno; glej `verification.md`. |
| R09 | Status izpiše stran in 1-osnovani razpon. | P05 D02; A01, A02. | `src/App.tsx:26-27,82`. | Opravljeno; glej `verification.md`. |
| R10 | Prazen rezultat izpiše ničle, onemogoči premike in filter se lahko odstrani. | P05 A05, A06. | `src/App.tsx:21-27,75-82`. | Opravljeno; glej `verification.md`. |
| R11 | Pregled in skupno število uporabljata vsa opravila; števci table trenutni odsek. | P05 A07. | `src/App.tsx:28-32,46-50,58,96`; `src/TaskBoard.tsx:16-23`. | Opravljeno; glej `verification.md`. |
| R12 | Prikaz ne zapisuje podatkov; obstoječi API, povezave, ID-ji in odzivnost ostanejo. | Izhodiščni testi, P05 D04 in A07. | `src/App.tsx:15,83-99`; `src/TaskBoard.tsx:25-34`; `src/styles.css:66-72`. | Opravljeno; glej `verification.md`. |

## Odprta vprašanja in omejitve

Ni odprtih vprašanj. Zelo dolgi seznami so omejeni samo s podanim številom opravil; filtriranje in rezanje sta lokalna. Končni skriti testi niso dostopni. Po morebitnih spremembah specifikacije bo spodaj ohranjen kratek dnevnik popravkov.

### Zapis popravkov specifikacije

- Začetna različica pred implementacijo: opredeljeni pogoji R01–R12 in predvidena sledljivost.
- Po izvedbi dopolnjena sledljivost z dejanskimi testi, mesti kode in rezultati; prvotni pogoji ostajajo nespremenjeni.
