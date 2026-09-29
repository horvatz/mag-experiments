# P05 — specifikacija straničenja in filtra stanja

Različica 1.0, 23. 9. 2026 — predaja implementerju po statičnem pregledu. Izvirne zahteve `task/instructions.md` ostajajo obvezne. Zgodovina: [specification-history.md](specification-history.md).

## Problem in kontekst

Folio trenutno v `src/App.tsx` izriše vsa opravila projekta; `src/TaskBoard.tsx` celoten prejeti seznam razporedi v tri stolpce. Dodati je treba filter stanja in skupno straničenje za preglednico in tablo. Spreminja se samo prikaz; opravila in izvorni vrstni red ostanejo nespremenjeni. Ohraniti je treba slovenska poimenovanja in potrjeni videz iz `docs/dizajn.md`.

## Vhodi, dejanja in izidi

Podatkovni pogodbi iz `shared/types.ts` sta `Project { id, name }` in `Task { id, projectId, title, description, status, assignee, dueDate }`; vsa polja so nizi, `status` je `todo | in_progress | done`. Nalaganje uporablja GET `/api/projects`, GET `/api/projects/:projectId/tasks` in za podrobnosti GET `/api/tasks/:taskId`. Identifikatorji v poteh se kodirajo z obstoječima funkcijama za povezave oziroma `encodeURIComponent`; izbira temelji na ID-ju, nikoli naslovu.

Vhodni seznam lahko vsebuje 0, 1 ali poljubno mnogo opravil, tudi več kot 10. Vsako pripada svojemu projektu, ID-ji so enkratni; naslovi se smejo ponavljati. Besedila so navadno besedilo z Unicode znaki in ločili, datumi veljavni koledarski datumi. Izvornega polja se ne razvršča, ne spreminja in ne nadomešča z vgrajenimi testnimi podatki.

Obvezna pogodba kontrol:

- HTML `select` z dostopnim imenom **Velikost strani**, vrednosti `all`, `2`, `5`, `10`.
- HTML `select` z dostopnim imenom **Filter strani**, vrednosti `all`, `todo`, `in_progress`, `done`.
- Gumbi **Prva stran**, **Prejšnja stran**, **Naslednja stran**, **Zadnja stran**, na neveljavnih robovih dejansko onemogočeni.
- Element `role="status"` in `aria-label="Stanje straničenja"` z natančnim besedilom R09/R10, vključno s pikama in pomišljajem `–`.

Uspešna sprememba kontrol spremeni le lokalni prikaz. Zapiranje podrobnosti z gumbom, Escape ali obstoječo navigacijo ne spremeni straničenja. Nezavezan izbor v selectu ne sproži novega prehoda. Novih zapisov, potrjevalnih dialogov ali shranjevanja ni. Ob napaki GET ostanejo obstoječi `LoadError`, ponovni poskus in navigacija; med nalaganjem ostane obstoječi indikator. Nenaloženi podatki niso dokaz praznega projekta.

## Zahteve in pravila

Naj bo `T` celotno polje opravil iz GET trenutnega projekta v izvornem vrstnem redu, `s` velikost, `f` filter in `p` interna stran z začetkom 1. Za prazni rezultat je dovoljena interna prva stran, prikazani indeks pa mora biti 0. Naslednja pravila so splošna in niso vezana na razvojne primere:

```text
F = [t iz T v istem vrstnem redu, kjer f = all ali t.status = f]
N = |F|
Y = 0, če N = 0; sicer 1, če s = all; sicer ceil(N / s)
X = 0, če N = 0; sicer p, kjer 1 <= p <= Y
V = [], če N = 0; sicer F, če s = all; sicer F.slice((p-1)*s, p*s)
A = 0, če N = 0; sicer 1, če s = all; sicer (p-1)*s + 1
B = 0, če N = 0; sicer N, če s = all; sicer min(p*s, N)
```

Pri fiksnih `T`, `f` in številskem `s` je konkatenacija vseh odsekov `V` enaka `F` in preseki njihovih množic ID-jev so prazni. Preglednica izriše `V` v istem vrstnem redu; stolpec stanja `q` izriše `[t iz V, kjer t.status = q]` in ohrani relativni vrstni red. Skupni DOM-vrstni red table je zaradi stolpcev lahko drugačen od preglednice; množica ID-jev in število pojavitev morata biti enaka.

Prehodi stanja:

- Začetek, drugačen `project.id` ali osvežitev dokumenta: `(s, f, p) := (all, all, 1)`. Tudi vrnitev v prejšnji projekt začne privzeto.
- Sprememba velikosti: `(s, f, p) := (novo_s, f, 1)`; sprememba filtra: `(s, f, p) := (s, novi_f, 1)`, tudi pri odstranitvi filtra in še veljavni prejšnji strani.
- Pogled, odprtje in zaprtje podrobnosti: `(s, f, p)` ostane enak.
- Premiki pri nepraznem rezultatu vodijo na `1`, `p-1`, `p+1`, `Y`. Prva/prejšnja sta onemogočeni pri `p=1`, naslednja/zadnja pri `p=Y`; pri `N=0` so onemogočene vse štiri. Neveljaven premik je identiteta stanja.
- Za vsako stanje `q`: pregled stanj šteje `|[t iz T: t.status=q]|`, stolpec table pa `|[t iz V: t.status=q]|`. Skupno število opravil ob naslovu ostaja `|T|`.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | `s=f=all`, `V=T`, privzeto prva stran; izvorni vrstni red. | S1: začetni prikaz za 1 in 13 opravil s premešanimi ID-ji. |
| R02 | Odseki za 2/5/10 ustrezajo zgornjemu `V`; brez izgub ali podvojitev. | D01 delno; S2: prehod vseh strani za 13 opravil pri vsaki velikosti, tudi filtrirano; primer z natančno deljivim N. |
| R03 | Štirje premiki in onemogočenje sledijo pravilom zgoraj. Pri eni strani so vsi onemogočeni. | D01/D02 delno; S3: vsi gumbi na prvi, vmesni, zadnji in edini strani, stanje ob neveljavnem dejanju ostane isto. |
| R04 | Vsaka sprememba velikosti postavi `p=1`, ohrani filter; neprazen `all` ima `Y=1`. | D04 delno; S4: za 13 opravil z velikosti 2/strani 2 na 5, nato 10 in all; ponovitev z aktivnim filtrom. |
| R05 | Najprej stabilni filter, nato rezanje; sprememba filtra postavi `p=1` in ohrani velikost. | D03 delno; S5: vsa tri stanja in all, zadetki razpršeni po T, sprememba z višje strani. |
| R06 | ID-ji preglednice in table so natanko ID-ji V; stolpci se oblikujejo po rezanju. | D03 delno; S6: primerjava množic ID-jev obeh pogledov na več straneh z mešanimi stanji; preverjanje vrstnega reda znotraj stolpcev. |
| R07 | Pogled in podrobnosti ohranijo `s`, `f`, `p`. | S7: z aktivnim filtrom na drugi strani preklopi preglednica–tabla–preglednica, odpri pravilni ID, zapri z gumbom in Escape; preveri tudi obstoječi povratek brskalnika. |
| R08 | Projekt in osvežitev vrneta `all`, `all`, prvo stran; nova stanja se ne zapišejo v URL, localStorage, sessionStorage ali drugo trajno shrambo. | S8: spremeni vse tri vrednosti, menjaj projekt in se vrni; ponovi z osvežitvijo v obeh pogledih. Obstoječi URL pogleda/podrobnosti ostane veljaven. |
| R09 | Neprazen status je natančno `Stran X od Y. Prikazano A–B od N.` po formulah zgoraj. | D02 delno; S9: N=13, s=5, p=3 da `Stran 3 od 3. Prikazano 11–13 od 13.`; še all, en zadetek in filtrirani N. |
| R10 | Prazni status je `Stran 0 od 0. Prikazano 0–0 od 0.`; vsi premiki onemogočeni; odstranitev filtra postavi `p=1`. | S10: prazna projekta in neprazen projekt s filtrom brez zadetkov v obeh pogledih; filter mora ostati dostopen za odstranitev. |
| R11 | Pregled stanj in skupno število računata iz T; števci stolpcev iz V, vključno z ničlami. | S11: zabeleži celotne števce, nato filtriraj in menjaj strani; primerjaj vsak stolpec z njegovimi karticami. |
| R12 | Lokalno računanje ne spremeni T in ne pošilja zapisov API; ohranjeni podatki, povezave, ID-ji, dostopnost, nalaganje in Folio. | D04 delno; S12: spremljanje vseh zapisovalnih zahtev, regresijski testi, tipkovnica ter pregled obeh pogledov na 390 px in namizju. |

Ohranijo se `data-task-id` na vrsticah in karticah, imena **Preglednica**, **Tabla**, **Tabla opravil**, stolpci **Pripravljeno**, **V delu**, **Končano** ter `aria-label="Pregled stanj opravil"`. Tabla ohrani vse tri stolpce tudi pri praznem odseku. Morebitna nova dejanja ob opravilu morajo biti zunaj njegove povezave. Pri širini 390 px mora veljati `document.documentElement.scrollWidth <= window.innerWidth`; notranje vodoravno drsenje preglednice in table je dovoljeno. Nove kontrole naj se prelomijo znotraj vsebine in uporabijo obstoječe slogovne spremenljivke, viden fokus in slovenska besedila. Razporeditev kontrol in druga besedila niso predpisana.

## Izvedba in sledljivost

Statično preverjeno: `ProjectView` v `src/App.tsx` je vezan na `key={project.id}` in ostane nameščen med spremembama `view` ter `taskId`. To je naravno mesto lokalnega stanja in izpeljav `F`, `V`, statusa ter kontrol. Menjava projekta komponento ustvari znova. Preglednici in `TaskBoard` naj se poda isti V; obstoječi izračun `counts`, oznaka skupnega števila in celotni števec končanih opravil ostanejo vezani na T. To so usmeritve za implementacijo, ne dokaz izvedene funkcionalnosti.

V spodnji tabeli D01–D04 pomenijo obstoječe teste v `tests/development/P05.spec.ts`; S1–S12 so načrtovani dodatni scenariji iz prejšnje tabele, ne že obstoječi testi. Oznaka **NI IZVEDENO** velja za vsako vrstico; ta vloga je opravila le branje kode in dokumentacije.

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | Privzeto V=T | S1 | `src/App.tsx`: začetno stanje `ProjectView`, izris vrstic | NI IZVEDENO |
| R02 | Odseki V | D01, S2 | `src/App.tsx`: izpeljava filtriranega polja in odseka | NI IZVEDENO |
| R03 | Meje in premiki | D01/D02, S3 | `src/App.tsx`: novi gumbi in njihovi obravnavalniki | NI IZVEDENO |
| R04 | Velikost → prva stran | D04, S4 | `src/App.tsx`: novi select velikosti | NI IZVEDENO |
| R05 | Filter pred rezanjem | D03, S5 | `src/App.tsx`: novi select filtra in izpeljava F | NI IZVEDENO |
| R06 | Oba pogleda uporabljata V | D03, S6 | `src/App.tsx`: tabela in prop `TaskBoard`; `src/TaskBoard.tsx`: filtriranje stolpcev | NI IZVEDENO |
| R07 | Ohranjeno lokalno stanje | S7; baseline testi podrobnosti in table | `src/App.tsx`: življenjska doba `ProjectView`; `src/navigation.ts`, `src/TaskDetails.tsx`: povezave in zapiranje | NI IZVEDENO |
| R08 | Ponastavitev projekta/osvežitve | S8 | `src/App.tsx`: `key={project.id}` in inicializacija; nova stanja samo v pomnilniku | NI IZVEDENO |
| R09 | Točni X/Y/A/B/N | D02, S9 | `src/App.tsx`: novi status straničenja | NI IZVEDENO |
| R10 | Prazen rezultat | S10; baseline prazni projekt/tabla | `src/App.tsx`: prazno stanje in kontrole; `src/TaskBoard.tsx`: prazni stolpci | NI IZVEDENO |
| R11 | Ločena osnova števcev T/V | S11 | `src/App.tsx`: `counts`, `count-badge`, `table-footer`; `src/TaskBoard.tsx`: `entries.length` | NI IZVEDENO |
| R12 | Brez zapisov in regresij | D04, S12; baseline/API | `src/App.tsx`, `src/TaskBoard.tsx`, `src/styles.css`; obstoječi `src/api.ts`, `src/useResource.ts`, `src/TaskDetails.tsx`, `src/navigation.ts` | NI IZVEDENO |

Implementer naj dopolni sledljivost v lastnih zapiskih v `docs/agent/` z dejanskimi datotekami testov, ukazi, izidi in potmi do dokazov; specifikacijo ob potrebnem popravku dopolni njen prvotni avtor. Priporočeni skupni pregled je obstoječi `npm run check` (lint, preverjanje tipov/gradnja, Playwright); `playwright.config.ts` vključuje API, baseline namizje/mobilni prikaz, development namizje/mobilni prikaz in `tests/agent/`. Lastni testi naj pokrijejo vrzeli S1–S12 in splošne predikate, zlasti N>10, prazne rezultate, ohranitev in ponastavitve. Skupnih testov ali konfiguracije se ne spreminja. Posnetke oziroma pregled videza izvede implementer; samo statično branje CSS ni vizualno preverjanje.

## Odprta vprašanja in omejitve

- Blokirajočih nejasnosti ni. »Osvežitev« pomeni ponovno nalaganje dokumenta; nov gumb za osvežitev ni zahtevan. Notranji p pri praznem rezultatu je izvedbena izbira, zunanji status mora biti 0/0.
- Novo stanje ni del URL-ja; obstoječi parameter `view=board` in poti projektov/podrobnosti ostanejo dovoljeni in uporabni.
- Navigacije med nezaključenim nalaganjem in novih sočasnih sprememb podatkov brez osvežitve ne širimo prek obstoječih regresijskih zahtev. Obstoječi test menjave projekta med nalaganjem mora ostati uspešen.
- Dovoljena zapisa te vloge sta samo ta dokument in `specification-history.md`. Implementer spreminja `src/`, lastne teste v `tests/agent/` in lastne zapiske v `docs/agent/`; pregledovalec svoje poročilo. Strežnik, začetni podatki, infrastruktura, odvisnosti, skupni tipi, skupni testi in navodila ostanejo nespremenjeni.
- UI uporablja le javni `/api/`, nikoli `/__test/`, testnih pripomočkov ali lokalne kopije podatkov. Obstoječa funkcija `updateTask` v `src/api.ts` za to nalogo ni potrebna. Testne kontrole lahko uporablja samo testni program.
- Obstoječi D01–D04 pokrijejo le del zahtev in uporabljajo osem opravil prvega projekta; ne dokazujejo splošne pravilnosti. Poljubni ID-ji in podatki se ne smejo nadomestiti s predpostavkami o teh primerih.
- Aplikacija, testi in pregled videza v tej vlogi niso bili zagnani. Končni testi niso dostopni; nobenega njihovega izida se ne zatrjuje. Predaja vsebuje preverljive pogoje in statične povezave na kodo, ne potrditve implementacije.
