# Razvojna specifikacija — P06: Nastavljiv izvoz CSV

Različica 1. Avtor: snovalec specifikacije. Viri: `task/instructions.md` (R01–R12), `PROJECT_RULES.md`, predloga `task/specification-template.md`. Izvirne zahteve veljajo tudi, kadar katera podrobnost spodaj ni ponovljena.

## Problem in kontekst

Uporabnik v Folio pregleduje opravila trenutnega projekta v pogledu Preglednica ali Tabla in jih želi izvoziti v CSV, z izbiro kolon, ločila in filtra stanja. Izhodišče (`src/App.tsx`) bere projekte in opravila prek javnega API-ja (`/api/projects`, `/api/projects/:id/tasks`) ter prikazuje oba pogleda; izvoza še ni. Nova funkcionalnost je v celoti v `src/`; stanje nastavitev je lokalno trenutnemu projektu in se ne shranjuje na strežnik.

## Vhodi, dejanja in izidi

**Podatkovna polja** (`shared/types.ts`): `Task { id, projectId, title, description, status, assignee, dueDate }`, `Project { id, name }`, `TaskStatus = 'todo' | 'in_progress' | 'done'`. Tipi so nespremenljivi.

**Dejanja**: vklop/izklop checkboxa za vsako kolono (dostopno ime `Stolpec <ime>`); izbira `Ločilo CSV` (`;`/`,`); izbira `Filter izvoza` (`all`/`todo`/`in_progress`/`done`); klik na `Izvozi CSV`; preklop pogleda, menjava projekta, osvežitev strani.

**Uspeh**: brskalnik prenese `folio-<projectId>.csv` z bajti po pravilih spodaj; vmesnik in podatki se ne spremenijo, nova stran se ne odpre. **Onemogočeno**: če je izbira kolon prazna (S = ∅) ali je filtrirani rezultat prazen (R = ∅), je gumb onemogočen in klik ne ustvari prenosa. Napake branja ostanejo domena obstoječega `useResource`/`LoadError`.

**Predpostavke**: ID-ji opravil so enolični; besedila so navadno besedilo z Unicode znaki in ločili; `dueDate` je `YYYY-MM-DD`; API vrne opravila v izvornem vrstnem redu in vsako pripada svojemu projektu. `osvežitev` pomeni ponovno nalaganje strani/remount; stanje se čez osvežitev ne ohrani. Testi lahko uporabijo drugačne podatke iz te domene.

## Zahteve in pravila

**Simboli.** C = [id, projectId, title, status, assignee, dueDate, description] (nespremenljiv vrstni red). P = trenutni projekt; T(P) = opravila iz `GET /api/projects/{P.id}/tasks` v vrstnem redu odgovora. S ⊆ C = izbrane kolone, vedno urejene po C; privzeto S = C. d ∈ {`;`, `,`} = ločilo, privzeto `;`. f ∈ {all, todo, in_progress, done} = filter, privzeto `all`. R = [t ∈ T(P) | f = all ∨ t.status = f], v izvornem vrstnem redu. `quote(v)` = `"` + v z vsakim `"` podvojenim (`""`) + `"`. `nevtraliziraj(v)` = `"'" + v`, če `/^[ \t\r\n]*[=+\-@]/.test(v)`, sicer v. `cell(t,c)` = `quote(nevtraliziraj(t[c]))`; glava = `quote(c)`. BOM = U+FEFF. `dat(P,S,d,f)` = BOM + glava(S,d) + CRLF + Σ po R (vrstica(t,S,d) + CRLF), kjer je vrstica(t,S,d) = join(d, [cell(t,c) za c ∈ S]). `omogočeno` ⇔ S ≠ ∅ ∧ R ≠ ∅. `privzeto` = (S = C, d = `;`, f = `all`).

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Izvoz zajame T(P) v izvornem vrstnem redu; prvi izvoz velja privzeto (S = C, d = `;`, f = all). | D01: ime in začetek z BOM + glavo C, ločeno s `;`. Lastni test: vrstni red vrstic = vrstni red API-ja tudi pri enakih naslovih. |
| R02 | S ⊆ C; glava in vrednosti so vedno v vrstnem redu C ne glede na vrstni red klikov; checkbox `Stolpec <ime>`. | D02: ostane samo `id` → glava `"id"`. Lastni test: kliki v obratnem vrstnem redu dajo enak vrstni red. |
| R03 | S = ∅ ⇒ izvoz onemogočen, klik ne ustvari prenosa; ponovni izbor kolone ob R ≠ ∅ izvoz omogoči. | Lastni test: izklop vseh → gumb onemogočen, brez dogodka `download`; vklop ene → prenos. |
| R04 | f omeji samo R; vmesnik še prikazuje T(P). T(P) = ∅ ali R = ∅ ⇒ izvoz onemogočen. | D02: filter `done` → v datoteki le `done`. Lastni test: prazen projekt/rezultat → gumb onemogočen, prikaz nespremenjen. |
| R05 | Ime `folio-<P.id>.csv`; bajti se začnejo z BOM; ni nove strani in ni pošiljanja vsebine strežniku. | D01, D04: ime, BOM, brez ne-GET zahtevkov na `/api/`. Lastni test: enak URL, brez POST/PUT/PATCH. |
| R06 | d je `;` ali `,`; vsaka glava in vrednost je v `"`; vsak notranji `"` je podvojen. | D02: ločilo `,`. D03: `"Zapis, ""citat"""`. |
| R07 | Vrstice ločene s CRLF; tudi zadnja se konča s CRLF; `;`, `,`, CR, LF v vrednostih ostanejo znotraj navedene vrednosti. | D01: `endsWith('\r\n')`. D03: `Prva vrstica\nDruga vrstica; čšž`. Lastni test z `\r\n` v vrednosti. |
| R08 | Če `/^[ \t\r\n]*[=+\-@]/.test(v)`, dodaj apostrof na sam začetek izvirnega niza; druge nize pusti nespremenjene; ne velja za glavo. | D03: `"'=SUM(A1)"`. Lastni test: `+`, `-`, `@`, vodilni presledek/tab/CR/LF; navaden niz brez apostrofa. |
| R09 | Unicode, presledki in opisi ostanejo nespremenjeni razen R08; `status` kot interna vrednost, `dueDate` kot izvirni `YYYY-MM-DD`. | D01/D03: čšž in opis. Lastni test: status/datum enaka izvirniku, ne lokalizirana. |
| R10 | Preklop Preglednica/Tabla ohrani S, d, f; za iste (P,S,d,f) in podatke sta datoteki bajtno enaki v obeh pogledih; kontrole so dosegljive v obeh. | D04: izvoz pred in po preklopu na Tablo je enak. |
| R11 | Menjava projekta ali osvežitev ponastavi na privzeto; vsak izvoz odraža trenutne nastavitve. | Lastni test: sprememba → zamenjava projekta in vrnitev → privzeto; reload → privzeto; zaporedna izvoza po spremembi se razlikujeta. |
| R12 | Izvoz ne spremeni opravil, izvornih polj ali bralnih funkcij; ni zapisov na API; `src/` ne uporablja `/__test/`; videz Folio ostane. | D04: `readonly` (brez zapisov, `saveRequests = 0`, brez vodoravnega prelivanja). Lastni test: ista opravila pred/po; `rg "__test" src/` prazno. |

**Dogovor o vmesniku** (obvezujoč): checkboxi `Stolpec id`, `Stolpec projectId`, `Stolpec title`, `Stolpec status`, `Stolpec assignee`, `Stolpec dueDate`, `Stolpec description`; select `Ločilo CSV` z `;` in `,`; select `Filter izvoza` z `all`/`todo`/`in_progress`/`done`; gumb `Izvozi CSV`. Ohranijo se `data-task-id` na vrsticah in karticah, obstoječa dostopna imena pogledov/stolpcev in `aria-label="Pregled stanj opravil"`. Nova dejanja ob opravilu so zunaj njegove povezave. Pri 390 piks se stran ne razširi; notranje drsenje preglednice in table je dovoljeno. Besedilo in razporeditev novih kontrol nista predpisana.

**Splošno pravilo proti testnemu primeru**: D01–D04 so primeri, ne celoten obseg; končni podatki so lahko drugačni (nič, eno ali več opravil, drugi ID-ji, enaki naslovi, drug vrstni red).

## Izvedba in sledljivost

Predvidena nosilca: `src/App.tsx` (stanje S/d/f v `ProjectView`, vezanem na `project.id`, zato menjava projekta ponastavi) in nova pomožna funkcija za serializacijo (npr. `src/csv.ts`); kontrole so v skupnem delu pogleda za oba pogleda. Izidi se vpišejo po dejanskem zagonu; neizvedenih testov ni dovoljeno označiti kot uspešnih.

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | privzeto: BOM + glava C z `;` + T(P) v izvornem vrstnem redu | D01 + lastni test | `src/csv.ts`, `src/App.tsx` | neizvedeno (vpiše izvajalec) |
| R02 | vrstni red glave in celic = C | D02 + lastni test | `src/csv.ts` | neizvedeno |
| R03 | S = ∅ ⇒ brez prenosa; ponovni izbor omogoči | lastni test | `src/App.tsx`, `src/csv.ts` | neizvedeno |
| R04 | f filtrira R; T(P) = ∅ ali R = ∅ ⇒ onemogočeno | D02 + lastni test | `src/App.tsx` | neizvedeno |
| R05 | ime `folio-<id>.csv`, BOM, brez nove strani/pošiljanja | D01, D04 | `src/App.tsx` (Blob), `src/csv.ts` | neizvedeno |
| R06 | d ∈ {`;`, `,`}; vsa polja navedena; `"` → `""` | D02, D03 | `src/csv.ts` | neizvedeno |
| R07 | CRLF za vsako vrstico, tudi zadnjo | D01, D03 + lastni test | `src/csv.ts` | neizvedeno |
| R08 | nevtralizacija po predikatu, samo podatki | D03 + lastni test | `src/csv.ts` | neizvedeno |
| R09 | Unicode, status, datum nespremenjeni | D01, D03 + lastni test | `src/csv.ts` | neizvedeno |
| R10 | preklop ohrani S/d/f; enaki bajti | D04 | `src/App.tsx` | neizvedeno |
| R11 | menjava projekta/osvežitev → privzeto; izvoz odraža trenutno stanje | lastni test | `src/App.tsx` (`key={project.id}`) | neizvedeno |
| R12 | brez sprememb podatkov/zapisov; brez `/__test/` v `src/` | D04 + lastni test + `rg` | `src/` | neizvedeno |

## Odprta vprašanja in omejitve

- Razporeditev/besedilo novih kontrol nista predpisana; zahtevana so le dostopna imena in vrednosti; implementer jih umesti v skupni del projekta.
- Stanje izvoza je lokalno trenutnemu projektu; po osvežitvi se ne ohrani; URL se ne spreminja (ni zahteve po trajni shrambi ali zapisu v URL).
- Nezaključeno nalaganje in sočasne spremembe brez osvežitve niso del obsega.
- D01–D04 ne pokrijejo v celoti R03, R04 (prazni primeri), R05 (nova stran), robnih primerov R08/R09 in R11; implementer doda lastne teste v `tests/agent/`.
- Dejanski dokazi o izvajanju še niso vpisani; izvajalec navede imena testov in dnevnik zagona (npr. `npx playwright test tests/development/P06.spec.ts tests/agent`).
