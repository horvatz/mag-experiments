# Specifikacija: iskanje in sestavljeni filtri

## Problem in kontekst

Folio trenutno prikaže vsa opravila trenutnega projekta v preglednici ali tabli. Uporabnik želi najti opravila po besedilu, stanju in odgovorni osebi, pri tem pa obdržati navigacijo, bralne podrobnosti in potrjeni videz.

## Vhodi, dejanja in izidi

Vir je `Task[]` iz `GET /api/projects/{project.id}/tasks`: zapis ima `id`, `projectId`, `title`, `description`, `status`, `assignee` in `dueDate`; `status` je `todo | in_progress | done` (`shared/types.ts:1–16`). Kontrole sprejmejo iskalni niz ter izbirnika s privzetima vrednostma `all`. Sprememba kontrole izračuna prikazne rezultate v pomnilniku; ne spreminja zapisa ali pošilja pisalnih zahtev. Menjava projekta začne filtriranje od privzetih vrednosti; menjava pogleda ohrani filtre. Napake nalaganja ostanejo pri obstoječem `Loading`/`LoadError` toku.

## Zahteve in pravila

Naj bo `T` urejeno zaporedje opravil, vrnjenih za trenutno izbrani projekt, `q` iskalni niz, `s` izbrano stanje in `a` izbrana oseba. `norm(x)` je `lowercase(remove-U+0300–U+036F(NFD(x)))`. `words(q)` razdeli niz po belinah in izloči prazne dele. `fields(t)` so z ločilom združena besedilna polja `id`, `title`, `description` in `assignee`. Natančen predikat:

```text
textMatch(t) = ∀ w ∈ words(q): norm(fields(t)).includes(norm(w))
statusMatch(t) = (s = all) ∨ (t.status = s)
assigneeMatch(t) = (a = all) ∨ (t.assignee = a)  // natančno, brez normalizacije
R = T.filter(t => textMatch(t) ∧ statusMatch(t) ∧ assigneeMatch(t))
```

Prazen seznam besed pomeni `textMatch(t)=true`. Iskanje je po dobesednih podnizih; ločila nimajo posebne ali regex semantike. Filtri ohranijo vrstni red `T`. `people(T)` je `all` in vsako različno neprazno ime iz `T` enkrat; izbirnik se ne gradi iz že filtriranih rezultatov.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Po nalaganju: `q=""`, `s=a=all`, `R=T` z izvornim vrstnim redom. | D01: začetni ID-ji proti celotnemu seznamu. |
| R02 | Obe strani iskanja normaliziraj z NFD, odstrani samo znamenja U+0300–U+036F, nato pretvori v male črke. | D01 za č/velike črke; dodaten primer za Unicode in poljubna polja. |
| R03 | Velja predikat `textMatch`; vse besede morajo biti podnizi; vrstni red besed ni pomemben, ločila so dobesedna; prazen vnos ne omejuje. | D01 ter primer več besed, regex metaznakov in praznega vnosa. |
| R04 | Velja konjunkcija `textMatch ∧ statusMatch ∧ assigneeMatch`; statusne vrednosti so `all`, `todo`, `in_progress`, `done`, oseba pa se ujema natančno. | D02 za sestavljena filtra; dodaj kombinacijo z iskanjem in meje ujemanja imena. |
| R05 | `people(T)` vsebuje `all` in vsako ime iz celotnega projekta samo enkrat, tudi če ga `R` ne vsebuje; po menjavi projekta ni stare izbire. | Projekt z dvojnimi imeni in ime, skrito z drugim filtrom; preklop projekta. |
| R06 | Preglednica in tabla izrišeta enake ID-je `R`; tabla razdeli samo `R` po stanju in v vsakem stolpcu ohrani vrstni red `T`. Preklop pogleda ohrani `q,s,a`. | D02 za obstojnost; primerjava ID-jev vseh pogledov in stolpcev. |
| R07 | Menjava projekta ponastavi `q,s,a`; `T` in filtri izvirajo samo iz `/api/projects/{project.id}/tasks`. | Preklop projekta po nastavitvi vseh filtrov; preveri ID-je in privzete kontrole. |
| R08 | Osvežitev začne s privzetimi filtri; filtre hrani samo lokalno vmesniku, ne v URL-ju ali trajni shrambi. Obstoječi `?view=board` ostane namenjen izbiri pogleda. | Osveži filtriran pogled ter preveri kontrole, URL in shrambo. |
| R09 | Statusno besedilo ima `role=status`, `aria-label="Rezultati filtriranja"` in točno `Prikazano: N od M.`, kjer `N=|R|`, `M=|T|`. Pregled stanj in števci stolpcev štejejo `R`; števec ob naslovu opravil prikazuje `N`. | D04 preveri status za znan podnabor; preveri števce vseh treh stanj/stolpcev. |
| R10 | Če `M>0` in `N=0`, pokaži `Ni zadetkov.` v obeh pogledih; uporabnik lahko še vedno zamenja pogled ali počisti filtre. Če `M=0`, ohrani običajno prazno stanje in status `Prikazano: 0 od 0.`. | D03 v preglednici; isti primer na tabli in ločen prazen projekt. |
| R11 | En klik `Počisti filtre` nastavi `q=""`, `s=a=all` in vrne `R=T`. Filtriranje ne preureja ali spreminja objektov opravil. | D03 preveri čiščenje; primerjaj vrstni red in vrednosti pred/po filtriranju. |
| R12 | Ohranijo se navigacija projektov, povezave in bralne podrobnosti, ID-ji v `data-task-id`, dostopna imena pogledov/stolpcev in `aria-label="Pregled stanj opravil"`. Nova dejanja so zunaj povezave opravila. Na 390 px se dokument ne razširi, dovoljeno je notranje drsenje. Filtriranje ne pošlje POST/PATCH/PUT/DELETE na `/api/`. | Skupni regresijski testi, omrežno preverjanje samo GET in meritev širine pri 390 px. |

Vhodi in število zapisov niso omejeni na primere iz razvojnih testov; upoštevaj prazne/majhne/velike sezname, podvojene naslove, poljubne ID-je ter Unicode besedilo z ločili. Uporabniški vmesnik uporablja javni `/api/`, nikoli testnih kontrol `/__test/`; strežnik, skupni tipi, infrastruktura in skupni testi ostanejo nespremenjeni. Zahteve naloge veljajo tudi, če posamezni razvojni test ne pokrije pogoja.

## Izvedba in sledljivost

To je specifikacija in načrt preverjanja pred implementacijo. Povezave spodaj kažejo obstoječe izhodišče in razvojne scenarije; za nove pogoje še ni potrditve implementacije. Testov nisem zagnal, saj ta vloga zajema branje in specifikacijo.

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01–R05, R07–R11 | Pravila in predikati zgoraj. | Obstoječi D01–D04 pokrijejo začetne ID-je, osnovno normalizirano iskanje, kombinacijo statusa/osebe, prazne rezultate/čiščenje, števec in odsotnost pisalnih zahtev; za neomenjene robne primere dodaj preverjanja. | Implementacija: `src/App.tsx:10–58` (projektni prikaz, kontrole, števci, filtriranje); tipi: `shared/types.ts:1–16`. | Nepreverjeno; testi niso zagnani. D01–D04: `tests/development/P03.spec.ts:2–5`. |
| R06, R10, R12 | Isti `R` v obeh pogledih, obstoječa imena/ID-ji, prazna stanja, dostopnost in ozka širina. | D02 za preklop pogleda; D03 za prazne rezultate; razvojni `readonly()` preveri samo širino dokumenta in pisalne zahteve. Dodaj prazno tablo, stolpce in 390 px. | `src/App.tsx:34–58`, `src/TaskBoard.tsx:7–40`, odzivni slogi `src/styles.css:135–174`, povezave `src/navigation.ts:10–26`, podrobnosti `src/TaskDetails.tsx`. | Nepreverjeno; testi niso zagnani. |
| R08, R12 | Brez trajne/URL shrambe filtrov; API je bralni za filtriranje. | Osvežitev in pregled URL/shrambe; D04 kliče `readonly()`, ki zazna pisalne `/api/` zahteve. | `src/App.tsx:11`, `src/api.ts`, `src/navigation.ts:10–26`. | Nepreverjeno; testi niso zagnani. |

## Odprta vprašanja in omejitve

V obstoječem tipu so polja nizi in stanja so zaprta unija treh vrednosti; naloga zagotavlja veljavne podatke, neprazna imena oseb pa se razlikujejo od rezervirane vrednosti `all`. Razvojni D01–D04 so le delni primeri, niso dokaz vseh R01–R12; implementer naj doda oziroma izvede potrebna preverjanja in zabeleži rezultat ter dokaz. Sočasno nalaganje in spremembe podatkov brez osvežitve ostanejo v obsegu obstoječih regresijskih zahtev. Dizajn ostane Folio iz `docs/dizajn.md`; pregled videza in izvajanje testov pripadata implementerju.
