# Specifikacija P03: iskanje in sestavljeni filtri

## Problem in kontekst

Folio ob odprtju projekta naloži njegova opravila prek javnega `/api/` in jih prikaže v preglednici ali tabli. Uporabnik želi opravila iskati po besedilu ter jih hkrati omejiti po stanju in odgovorni osebi, ne da bi se spremenili API, navigacija, izvorni vrstni red ali potrjeni videz.

## Vhodi, dejanja in izidi

Vhod je celoten seznam `Task[]` za trenutno izbrani `Project`: `id`, `title`, `description`, `assignee`, `status` in obstoječa polja za prikaz. Uporabnik spreminja lokalna stanja iskalnega niza, izbranega stanja in osebe, počisti filtre ali preklopi pogled. Filtriranje je izračun iz nespremenjenega seznama; ne pošilja zahtev za zapis in se ne shrani v URL ali trajno shrambo. Po uspešnem nalaganju so privzete vrednosti prazen niz ter `all`/`all`. Ob napaki nalaganja ostane obstoječi prikaz napake in ponovnega poskusa.

## Zahteve in pravila

Oznake: `T` je trenutni projektni seznam v izvornem vrstnem redu, `q` iskalni niz, `s` izbrano stanje, `a` izbrana oseba. `norm(x) = lowercase(remove(U+0300–U+036F, NFD(x)))`. `words(q)` so neprazni deli `q`, razdeljeni po belinah. `F` je rezultat filtra:

`F = [t ∈ T | (s = all ∨ t.status = s) ∧ (a = all ∨ t.assignee = a) ∧ ∀w ∈ words(q): w ⊆ norm(t.id + " " + t.title + " " + t.description + " " + t.assignee)]`, pri čemer se tudi vsaka beseda iz `q` normalizira z `norm`. Zapis `[ ]` ohrani vrstni red `T`; `⊆` pomeni dobesedni podniz.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Začetno `q=""`, `s=a=all`; rezultat je `T`. | Začetno stanje in število/ID-ji v pogledih. |
| R02 | Iskanje primerja normalizirana združena polja po NFD, odstranitvi navedenih diakritičnih znamenj in malih črkah. | Diakritika ter velikost črk. |
| R03 | Vse normalizirane besede morajo biti dobesedni podnizi; vrstni red besed ni pomemben, prazen niz ne omejuje. | Več besed v obrnjenem vrstnem redu, ločilo kot navadno besedilo, samo presledki. |
| R04 | Stanje (`all`, `todo`, `in_progress`, `done`) in točno ime osebe se seštevata z iskanjem prek IN. | Kombinacije vseh treh pogojev in natančna izbira osebe. |
| R05 | Seznam oseb je `all` in vsako različno neprazno `assignee` v `T` enkrat; projektna menjava ga zamenja. | Podvojeno ime, skrito opravilo in menjava projekta. |
| R06 | Preglednica in tabla izrišeta iste ID-je `F`; vsak stolpec table vsebuje le svoj status; pogled ne spremeni filtrov. | Enakost ID-jev, statusni stolpci, preklop pogleda. |
| R07 | Ob menjavi projekta se `q`, `s`, `a` ponastavijo; `F` uporablja le opravila trenutnega projekta. | Filtriranje, menjava projekta in preverjanje novih privzetih vrednosti. |
| R08 | Stanje filtrov je samo React lokalno stanje, brez URL-ja ali trajne shrambe; osvežitev začne privzeto. | Osvežitev in pregled URL-ja. |
| R09 | `role=status`, `aria-label="Rezultati filtriranja"`, besedilo `Prikazano: |F| od |T|.`; povzetek in števci stolpcev računajo `F`. | Vrednosti pri filtriranem in nefiltriranem seznamu. |
| R10 | Če `|T|>0 ∧ |F|=0`, se prikaže `Ni zadetkov.` v obeh pogledih. Če `|T|=0`, ni sporočila za filtre: preglednica ohrani začetno prazno stanje, tabla tri prazne stolpce, števec pa je `0 od 0`. | Noben zadetek v obeh pogledih; prazen projekt in regresijski test prazne table. |
| R11 | Gumb `Počisti filtre` atomarno nastavi `q=""`, `s=a=all`; rezultat postane `T`. | Vsi trije filtri nastavljeni, nato čiščenje. |
| R12 | Navigacija in podrobnosti ostanejo delujoče; samo filtriranje ne pošilja zapisovalnih zahtev. Folio in 390 px stran brez vodoravnega preliva ostaneta ohranjena. | Navigacija/podrobnosti, opazovanje zahtev, mobilna širina in osnovni regresijski testi. |

## Izvedba in sledljivost

Izvedba uporablja lokalna stanja in izpeljan `visibleTasks` v `ProjectView`; enak seznam gre v tabelo ali `TaskBoard`. Normalizacija je čista funkcija. Kontrole in sporočila imajo odzivne sloge. Preverjanja v spodnji tabeli so bila izvedena z ukazom `npm run check`; popoln izpis je v [verification.md](verification.md).

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | Prazna iskalna vrednost in `all`/`all` vrneta celoten `T` v njegovem vrstnem redu. | D01; A01 začetne kontrole in ID-ji | `src/App.tsx:13-18,56-68` | Uspešno; navedeni testi v končnem `npm run check`. |
| R02 | `norm` normalizira vsa štiri polja in iskalne besede po NFD, odstranitvi znamenj in malih črkah. | D01; A01: naslov, opis, oseba in ID | `src/App.tsx:17,22-23,91-93` | Uspešno; D01/A01. |
| R03 | Vsaka normalizirana beseda je dobesedni podniz, vrstni red ni pomemben, ločila so dobesedna, prazen vnos ne omejuje. | D01; A01: obrnjene besede, `foo.bar`, presledki | `src/App.tsx:17-23` | Uspešno; D01/A01. |
| R04 | Status in natančno ime osebe se seštevata z IN z iskanjem. | D02; A01: `Živa Novak` proti `živa Novak`; A02 kombinacija | `src/App.tsx:18-23,57-65` | Uspešno; D02/A01/A02. |
| R05 | Osebe so različna neprazna imena iz celotnega seznama trenutnega projekta. | A02: podvojena/skrita oseba in seznam po menjavi projekta | `src/App.tsx:16,63-66` | Uspešno; A02. |
| R06 | Pogleda uporabljata isti filtriran seznam; števci table pripadajo statusom vidnih opravil. | D02; A05 preveri iste ID-je, povzetek in števce stolpcev | `src/App.tsx:18-28,71,75`; `src/TaskBoard.tsx:16-22` | Uspešno; D02/A05. |
| R07 | Ključ `ProjectView` je ID projekta, zato menjava projekta ponastavi stanja in naloži projektni seznam. | A02: filtri, nato menjava `web` → `launch` | `src/App.tsx:13-16,99,119` | Uspešno; A02. |
| R08 | Filtri so lokalna stanja brez shrambe ali URL-parametrov; osvežitev jih ponastavi. | A03: filtriraj, osveži, preveri ID-je, kontrolne vrednosti in URL | `src/App.tsx:13-15,51-68` | Uspešno; A03. |
| R09 | Status filtriranja, povzetek, značka in zaključni števec uporabljajo `F`. | D04; A01 začetni status; A05 številke povzetka/table/stolpcev | `src/App.tsx:25-28,37-40,49,68,84`; `src/TaskBoard.tsx:16-22` | Uspešno; D04/A01/A05. |
| R10 | Ni zadetkov se prikaže le za neprazen `T` z `F=∅`; prazen projekt ohrani prazno preglednico oziroma tri prazne stolpce table in 0/0. | D03; A03 oba pogleda; A04 prazen projekt; izhodiščni test prazne table | `src/App.tsx:68-71`; `src/TaskBoard.tsx:16-25` | Uspešno; D03/A03/A04 in regresijski testi namizje/mobilno. |
| R11 | Gumb naenkrat vrne niz in oba filtra na privzete vrednosti. | D03; A02 nastavi vse tri filtre in jih počisti | `src/App.tsx:67` | Uspešno; D03/A02. |
| R12 | Navigacija in podrobnosti ostanejo delujoče, branja so prek `/api/`, filtriranje nima zapisov; stran pri 390 px ne preliva. | Izhodiščni baseline testi namizje/mobilno; D04 zapisljivost; A05 širina 390 px | `src/App.tsx:11-12,51-52,75-87`; `src/styles.css:66-71,176-180` | Uspešno; vseh 52 testov ter lint/build/typecheck v končnem `npm run check`. |

### Zapis popravkov specifikacije

- 2026-09-27, začetna različica: zapisani pogoji R01–R12, predikat filtra in načrt sledljivosti pred implementacijo.
- 2026-09-27, popravek R10: ločeno navedeno začetno prazno stanje preglednice in treh praznih stolpcev table; prvi celotni zagon je pokazal, da izhodiščni regresijski test pričakuje ohranjene stolpce table pri praznem projektu.

## Odprta vprašanja in omejitve

Navodila določajo besedilo ter semantiko kontrol; vrstni red in podrobna razporeditev novih kontrol nista predpisana. Testni mehanizem za nadzorovane GET odgovore je namenjen samo testom in ga aplikacija ne bo uporabljala. Končnih, nedostopnih testov ni mogoče vnaprej potrditi; dejanski doseg bo naveden v poročilu preverjanja.
