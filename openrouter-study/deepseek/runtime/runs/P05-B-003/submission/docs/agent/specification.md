# Razvojna specifikacija — P05: Straničenje in filter stanja

Status: osnutek v1.0 za predajo implementerju. Vir zahtev: `task/instructions.md`
(R01–R12); te zahteve veljajo tudi, če česa v tem dokumentu ni. Izhodišče: Folio
(`src/App.tsx`, `src/TaskBoard.tsx`, `src/styles.css`, `docs/dizajn.md`), podatki
iz javnega API-ja `/api/`.

## Problem in kontekst

Uporabnik v projektu vidi vsa opravila v enem seznamu (preglednica ali tabla).
Dodati je treba straničenje z velikostjo strani all/2/5/10 in filter stanja
all/todo/in_progress/done, tako da oba pogleda prikazujeta isti odsek filtriranih
opravil v izvornem vrstnem redu, navigacija po straneh pa je omejena na veljavne
meje. Začetno stanje: velikost all, filter all, prva stran. Stanje straničenja je
lokalno trenutnemu projektu: ne v trajni shrambi, ne v URL-ju, ne na strežniku.

## Vhodi, dejanja in izidi

- Podatki: `Task { id, projectId, title, description, status, assignee, dueDate }`,
  `Project { id, name }` (`shared/types.ts`). T se bere z
  `GET /api/projects/:id/tasks` v vrstnem redu odgovora; podrobnosti z
  `GET /api/tasks/:id`. Tipi in polja ostanejo enaki; straničenje ne piše.
- Domena: ID-ji so enkratni znotraj projekta; naslovi/opisi/osebe so navadno
  besedilo (tudi Unicode); ime osebe ni prazno in ni `all`; projekt in rezultat
  filtra sta lahko prazna; opravil je lahko 0, 1 ali več kot 10.
- Dejanja: izbira velikosti strani, izbira filtra stanja, Prva/Prejšnja/Naslednja/
  Zadnja stran, preklop pogleda, odpiranje/zapiranje podrobnosti, menjava
  projekta, osvežitev strani.
- Izidi: trenutni odsek F, statusno besedilo, neveljavna dejanja onemogočena;
  pri napaki nalaganja obstoječi prikaz napake s ponovnim poskusom; med
  nalaganjem obstoječi prikaz nalaganja.

### Dogovor o vmesniku (za testiranje in uporabnost)

- `select` z dostopnim imenom **Velikost strani**, vrednosti `all|2|5|10`.
- `select` z dostopnim imenom **Filter strani**, vrednosti `all|todo|in_progress|done`.
- Gumbi z imeni **Prva stran**, **Prejšnja stran**, **Naslednja stran**, **Zadnja stran**.
- Element `role="status"` z `aria-label="Stanje straničenja"` in natančnim
  besedilom iz R09/R10 (pomišljaj `–` med indeksoma).
- Ohranjeno: `data-task-id` na vrsticah in karticah, imena pogledov
  (Preglednica/Tabla, `aria-pressed`), `aria-label="Pregled stanj opravil"`,
  dostopna imena stolpcev table. Nova dejanja ob opravilu morajo biti zunaj
  njegove povezave. Razporeditev novih kontrol ni predpisana; uporabi obstoječe
  gradnike in slogovne spremenljivke Folio.

## Zahteve in pravila

Simboli in predpostavke: T = opravila projekta v vrstnem redu odgovora API-ja
(brez dodatnega urejanja); φ ∈ {all,todo,in_progress,done} = filter; F = [t ∈ T |
φ=all ∨ t.status=φ] z ohranjenim vrstnim redom; N = |F|; S ∈ {all,2,5,10} =
velikost strani; size = (S=all ? N : S); P = številka strani (1-osnovana);
Y = (N=0 ? 0 : (S=all ? 1 : ⌈N/size⌉)); odsek(P) = F[(P−1)·size, min(N,P·size));
A = (N>0 ? (P−1)·size+1 : 0), B = (N>0 ? min(N,P·size) : 0).

Splošna pravila (veljajo za vse primere, ne le za testne):

1. F je vedno filtrirano pred straničenjem; straniči se F, nikoli T (R05).
2. P ∈ [1..Y], ko je Y>0; prikazana stran je odsek(P). Odseki za P=1..Y so
   zaporedni, paroma disjunktni in njihova unija je F (R02).
3. Sprememba S nastavi P=1; sprememba φ nastavi P=1; menjava projekta in
   osvežitev nastavita S=all, φ=all, P=1; preklop pogleda in podrobnosti
   ohranijo (S, φ, P) (R04, R05, R07, R08).
4. Gumb je onemogočen natanko takrat, ko bi premik zapustil [1..Y]:
   Prva/Prejšnja ⇔ P≤1; Naslednja/Zadnja ⇔ P≥Y; pri Y=0 so vsi štirje
   onemogočeni. Onemogočen gumb ne spremeni stanja (R03, R10).
5. Statusno besedilo je natančno: N>0 → `Stran P od Y. Prikazano A–B od N.`;
   N=0 → `Stran 0 od 0. Prikazano 0–0 od 0.` (R09, R10).
6. Oba pogleda prikazujeta iste ID-je odsek(P) v vrstnem redu F; tabla odsek
   razdeli v tri stolpce po `status`, ne straniči vsakega stolpca posebej (R06).
7. Pregled stanj (`Pregled stanj opravil`) šteje celoten T (nefiltriran);
   števci stolpcev table štejejo opravila odseka; skupno število opravil se
   zaradi straničenja ne spremeni (R11).
8. Straničenje ne pošilja zapisov (noben POST/PATCH/PUT/DELETE na `/api/`),
   ne uporablja `localStorage`/`sessionStorage` in ne shranjuje stanja v URL;
   UI ne uporablja `/__test/` (R08, R12).

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Ob nalaganju: S=all, φ=all, P=1; prikazan ves T v izvornem vrstnem redu; kontrole z izbranima privzetima vrednostima. | D01–D04, `ids(page)`, `expectIds` |
| R02 | Za S∈{2,5,10}: odsek(P) po formuli; veljavni P pokrijejo F brez izgube/podvojitve ID-jev; zadnja stran je lahko krajša. | testi po velikostih (D01, D02, D04), `expectIds` |
| R03 | Gumbi nastavijo P na 1 / max(1,P−1) / min(Y,P+1) / Y; na robu onemogočeni in stanje nespremenjeno. | klik + `toBeDisabled`; scenarij ponovnega klika |
| R04 | Sprememba S vedno P=1, tudi če bi prejšnji P ostal veljaven; S=all pomeni eno stran, ko je N>0. | D01, D04; scenarij z veljavnim starim P |
| R05 | F = filtrirano T pred straničenjem; sprememba φ vrne P=1; vrstni red ujemanja ostane. | D03; scenarij filtra todo/in_progress/done |
| R06 | Preglednica in tabla imata iste ID-je odsek(P); tabla združi ta odsek v tri stolpce po statusu. | D03 (`board(page)`, `expectIds`) |
| R07 | Preklop pogleda ter odprtje/zaprtje podrobnosti (isti projekt) ohranijo S, φ, P in prikazani odsek. | scenarij: nastavi stran → preklopi → odpri/Zapri → enak odsek |
| R08 | Menjava projekta in osvežitev: S=all, φ=all, P=1; stanje ni v trajni shrambi/URL-ju. | scenarij `project(page, …)` + `page.reload()` |
| R09 | N>0: status natančno `Stran P od Y. Prikazano A–B od N.` z A/B po formuli. | D02 (`toHaveText`); scenariji za več velikosti |
| R10 | N=0 (prazen projekt ali prazen filter): status `Stran 0 od 0. Prikazano 0–0 od 0.`, vsi štirje gumbi onemogočeni; ob odstranitvi filtra je spet P=1. | scenarij praznega projekta in praznega filtra |
| R11 | Pregled stanj = število {t ∈ T : t.status = s}; števci stolpcev = število odsek(P) ∩ status; skupno število = velikost T (nespremenjeno). | `summary(page, …)`, `columnIds`; scenariji |
| R12 | Brez zapisov na `/api/` in brez `saveRequests`; povezave, pravilni ID-ji, podrobnosti, nalaganje/napaka in videz Folio ostanejo; pri 390 px `scrollWidth ≤ innerWidth`, notranje drsenje `.table-scroll`/`.board-scroll` dovoljeno. | `readonly(page, writes)`, obstoječi baseline testi, mobilni projekt (iPhone 13) |

## Izvedba in sledljivost

Predvidene točke sprememb (implementer jih po izvedbi potrdi/popravi):
stanje (S, φ, P) in kontrole v `ProjectView` (`src/App.tsx`), odsek in števci
v `TaskBoard.tsx` ter slog kontrole v `src/styles.css`. Pomožno logiko
(filtriraj/odsek/Y/statusno besedilo) je smiselno izluščiti v majhen modul in
pokriti z agentnimi testi v `tests/agent/`.

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | privzeto all/all/P=1, ves T | D01–D04; agentni test | `src/App.tsx` (ProjectView) | ni izvedeno (faza specifikacije) |
| R02 | zaporedni neprekrivajoči odseki | D01, D02, D04; agentni test | `src/App.tsx`, pomožni modul | ni izvedeno |
| R03 | meje in onemogočeni gumbi | agentni test; D02 (Naslednja disabled) | `src/App.tsx` | ni izvedeno |
| R04 | sprememba S → P=1; all = 1 stran | D04; agentni test | `src/App.tsx` | ni izvedeno |
| R05 | filter pred straničenjem | D03; agentni test | `src/App.tsx`, pomožni modul | ni izvedeno |
| R06 | ista stran v obeh pogledih | D03; agentni test | `src/App.tsx`, `src/TaskBoard.tsx` | ni izvedeno |
| R07 | ohranjeno stanje ob pogledu/podrobnostih | agentni test | `src/App.tsx` | ni izvedeno |
| R08 | ponastavitev ob projektu/osvežitvi | agentni test | `src/App.tsx` | ni izvedeno |
| R09 | natančno statusno besedilo | D02; agentni test | `src/App.tsx` | ni izvedeno |
| R10 | 0 od 0 in onemogočeni gumbi | agentni test (prazen projekt in filter) | `src/App.tsx` | ni izvedeno |
| R11 | pregled T, stolpci odseka | agentni test; `summary` | `src/App.tsx`, `src/TaskBoard.tsx` | ni izvedeno |
| R12 | brez zapisov, regresije, 390 px | `readonly`, baseline, mobilni projekt | `src/App.tsx`, `src/TaskBoard.tsx`, `src/styles.css` | ni izvedeno |

Skupni razvojni testi (`tests/development/P05.spec.ts`): D01 velikost 2 in
Naslednja stran; D02 zadnja stran in status; D03 filter pred tablo; D04
sprememba velikosti vrne na prvo stran in brez zapisov. Teh testov ne navajam
kot izvedene; v tej fazi tečejo šele pri implementerju. Končni testi naloge
lahko uporabijo drugačne podatke iz opisane domene.

## Odprta vprašanja in omejitve

- Vrstni red T je vrstni red odgovora API-ja; straničenje ne sortira in ne
  spreminja podatkov.
- Navigacija med nezaključenim nalaganjem in sočasne spremembe podatkov brez
  osvežitve niso del obsega te naloge (obstoječe regresijske zahteve veljajo).
- Prikaz, ko je N=0, mora vsebovati status in onemogočene gumbe; morebitno
  sporočilo o praznem rezultatu ni predpisano, obstoječe prazno stanje projekta
  se lahko ohrani.
- Namestitev in poimenovanje kontrol nista predpisana, razen dostopnih imen v
  dogovoru o vmesniku; videz mora slediti Folio.
- Končni testi niso dostopni; nepreverjene zahteve označiti, ne prikazati kot
  uspešne. Implementer po izvedbi dopolni dokaze (imena testov, dnevnik) v
  dogovoru z lastnikom tega dokumenta.
