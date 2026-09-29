# P06: Nastavljiv izvoz CSV — specifikacija

Stanje: pripravljeno za predajo implementerju, 23. 9. 2026. Izvirna
[navodila](../../task/instructions.md) in [pravila](../../PROJECT_RULES.md)
ostajajo obvezna. Zgodovina je v [specification-history.md](specification-history.md).

## Problem in kontekst

Folio trenutno bere projekte in opravila ter jih prikazuje v preglednici,
tabli in podrobnostih; izvoza še nima. Uporabnik potrebuje lokalni CSV
trenutnega projekta z izbranimi kolonami, filtrom stanja in ločilom.
Sprememba mora ohraniti slovenski vmesnik, bralne funkcije in
[potrjeni videz](../dizajn.md).

## Vhodi, dejanja in izidi

- `Project` ima nizovna `id`, `name`. Vsa polja `Task` so obvezni nizi:
  `id`, `projectId`, `title`, `status`, `assignee`, `dueDate`, `description`;
  `status ∈ {todo, in_progress, done}`, `dueDate` je veljaven `YYYY-MM-DD`.
  Vir tipov: [shared/types.ts](../../shared/types.ts), samo za branje.
- Vir vrstic je obstoječi GET `/api/projects/<encoded projectId>/tasks`.
  Projekt in opravila se določajo po ID-jih; ni deduplikacije po naslovu,
  omejitve števila vrstic ali razvrščanja po ID-ju/stanjih.
- Checkbox za vsako dovoljeno kolono ima dostopno ime `Stolpec <ime>`.
  HTML select `Ločilo CSV` ima vrednosti `;`, `,`; HTML select `Filter izvoza`
  ima vrednosti `all`, `todo`, `in_progress`, `done`. Gumb je `Izvozi CSV`.
  Kontrole so dostopne v obeh pogledih, tudi pri praznem projektu.
- Ob uspehu se prenese ena datoteka `folio-<projectId>.csv`; stran, opravila
  in nastavitve ostanejo enaki. Ni nove strani, nalaganja vsebine na strežnik
  ali zapisovalnih zahtev. Imena/ID-ji projektov vsebujejo črke, številke in vezaje.
- Brez izbranih kolon ali ustreznih vrstic je gumb onemogočen in ne sproži
  prenosa. Med začetnim nalaganjem ali napako GET ni veljavnega izvoza;
  ostaneta obstoječa prikaz napake in ponovni poskus. Preklic prenosa v
  brskalniku ne spreminja aplikacijskega stanja; dodatni dialog ni zahtevan.

## Zahteve in pravila

Oznake: `p` je trenutni ID projekta, `T` je zaporedje opravil iz njegovega
API odgovora, `K = [id, projectId, title, status, assignee, dueDate, description]`,
`S ⊆ K` je izbor kolon, `f` filter, `d` ločilo. Nastavitve so `E=(S,f,d)`.

```text
E0 = (vse K, all, ;)
C = elementi K, ki pripadajo S, v vrstnem redu K
V = elementi T, za katere f = all ali task.status = f, v vrstnem redu T
canExport ⇔ podatki so uspešno naloženi ∧ |C| > 0 ∧ |V| > 0
N(s) = apostrof + s, če /^[ \t\r\n]*[=+\-@]/ ustreza s; sicer s
Q(s) = dvojni narekovaj + s.replaceAll('"', '""') + dvojni narekovaj
header = C.map(Q).join(d)
row(t) = C.map(c => Q(N(t[c]))).join(d)
CSV = U+FEFF + [header, ...V.map(row)].join(CRLF) + CRLF
```

CSV se kodira v UTF-8; začetni bajti so `EF BB BF`. `N` velja za vsako
podatkovno kolono, nikoli za glavo. Uporabi izvirni niz: ne odstranjuj
začetnih presledkov, ne uporabljaj širšega `\s`, ne normaliziraj Unicode ali
notranjih prelomov vrstic. Npr. ` ␉=1` dobi apostrof pred presledkom;
`abc=1`, že začetni apostrof in NBSP pred `=1` ostanejo nespremenjeni.
`␉` v tem primeru označuje dejanski tabulator, ne znaka v podatkih.

Pravila stanja: `preklop pogleda(E)=E`, `menjava projekta(E)=E0`,
`osvežitev(E)=E0`, `izvoz(E)=E`. Tudi povratek v prejšnji projekt začne z
`E0`. Sprememba kolon, filtra ali ločila učinkuje pri naslednjem kliku izvoza.
Ob vseh izvoznih dejanjih ostanejo `T`, objekti opravil in bralni prikazi enaki.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Izvoz uporablja samo `T` trenutnega projekta, brez spremembe vrstnega reda; začetno stanje je `E0`. | S1: primerjava vseh vrstic z nadzorovanim API odgovorom in privzetih kontrol. |
| R02 | Glava in celice imajo natanko kolone `C`, v vrstnem redu `K`, ne v vrstnem redu klikov ali deklaracije tipa. | S2: izbor description, id, title v tem vrstnem redu da id, title, description. |
| R03 | Prazen `C` pomeni onemogočen gumb in nič prenosov; ponovni izbor omogoči izvoz le ob nepraznem `V`. | S2: odznači vse, nato označi eno; ponovi pri praznem rezultatu. |
| R04 | `V` ustreza izbranemu filtru; preglednica, tabla, povzetki in števci še uporabljajo celoten `T`. Prazen `V` onemogoči izvoz. | S3: vsi štirje filtri, manjkajoče stanje, prazna projekta v obeh pogledih. |
| R05 | En lokalni prenos s točnim imenom in UTF-8 BOM; brez navigacije, nove strani ali pošiljanja CSV na strežnik. | S1/S7: ime in surovi bajti prenosa, URL, število strani, omrežni dogodki. |
| R06 | `d` je ; ali ,; vsaka glava in vrednost, tudi prazna, je navedena z `Q`, notranji narekovaji so podvojeni. | S4: obe ločili, prazne vrednosti, narekovaji, vejice in podpičja. |
| R07 | Zapisi so ločeni s CRLF, tudi zadnji ima CRLF; prelomi LF/CR/CRLF in ločila v celicah ostanejo nespremenjeni znotraj navedbe. | S4: natančna primerjava bajtov večvrstičnega CSV; ne deli na vrstice z navadnim split. |
| R08 | `N` je izveden pred `Q` za vse podatkovne kolone; doda natanko začetni apostrof ob predpisanem vzorcu, vse ostalo ohrani. | S5: vsak =,+,-,@, samostojno in po mešanih presledkih/tab/CR/LF; varni proti-primeri. |
| R09 | Ohranjeni so Unicode, presledki in celotni opisi; interni status in izvirni datum, brez prikaznega formatiranja. Edina vsebinska izjema je `N`. | S4/S5: šumniki, emoji, kombinirani znaki, robni presledki, izvirne vrednosti status/datum. |
| R10 | Preklop Preglednica/Tabla ohrani `E`; za enake `T,E` sta datoteki bajtno enaki. Izvoz iz table ne uporablja vrstnega reda skupin stanj. | S6: nestandardne nastavitve, izvoza pred/po preklopu, primerjava kontrol in bajtov. |
| R11 | Menjava projekta in osvežitev nastavita `E0`; zaporedni izvozi sledijo trenutnim nastavitvam brez zastarelega izbora. | S6: spremeni vsako nastavitev in ponovno izvozi; projekt A→B→A ter osvežitev v obeh pogledih. |
| R12 | Izvoz in kontrole ne mutirajo polja `T` ali njegovih objektov, ne zapisujejo na API in ne okrnijo bralnih funkcij; videz ostane prilagodljiv. | S7: nespremenjenost podatkov, omrežje, skupne regresije, tipkovnica, 390 px in namizje. |

## Izvedba in sledljivost

Prebrane vstopne točke: [App.tsx](../../src/App.tsx) vsebuje `ProjectView`,
GET opravil, števce in preglednico. `App` že uporablja `key={project.id}`;
lokalno stanje v `ProjectView` ali njegovi stalni izvozni komponenti zato
omogoča zahtevano življenjsko dobo brez trajne shrambe. Kontrol ne veži na
komponento, ki se odstrani ob preklopu pogledov.
[TaskBoard.tsx](../../src/TaskBoard.tsx) razvršča prikaz po stanju; izvoz naj
uporabi izvorni `tasks`, ne DOM ali združenih stolpcev table.
[formatDate.ts](../../src/formatDate.ts) in `StatusBadge` sta prikazna
pretvornika, ne vir izvoznih vrednosti. `src/api.ts:updateTask` obstaja,
vendar ga izvoz ne uporablja.

Spodnje lokacije so predlagana mesta dopolnitev, ne trditev o že izdelani kodi.
`CSV` pomeni predlagan nov čisti serializator v `src/csv.ts` (ime je prosto),
`UI` pa izvozne kontrole in handler ob `src/App.tsx:ProjectView`.
`D01–D04` so obstoječi testi v [P06.spec.ts](../../tests/development/P06.spec.ts);
`S1–S7` so zgoraj določeni scenariji za lastne teste v `tests/agent/`.

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | `E0`, izvorni `T` | D01 (delno), S1 | UI: vir in začetno stanje; CSV: iteracija | Ni izvedeno. |
| R02 | `C` v vrstnem redu `K` | D02 (delno), S2 | UI: checkboxi; CSV: projekcija kolon | Ni izvedeno. |
| R03 | `canExport`, brez prazne glave | S2 | UI: disabled in varovalo handlerja | Ni izvedeno. |
| R04 | `V`, celotni bralni prikazi | D02/D04 (delno), S3 | UI: ločeni izvozni filter, prikaz prejme `T` | Ni izvedeno. |
| R05 | Ime, BOM, lokalni prenos | D01 (delno), S1/S7 | CSV: BOM; UI: lokalni prenos | Ni izvedeno. |
| R06 | `Q`, obe ločili | D01–D03 (delno), S4 | CSV: navedba in ločilo | Ni izvedeno. |
| R07 | CRLF, ohranitev celic | D01/D03 (delno), S4 | CSV: sestavljanje zapisov | Ni izvedeno. |
| R08 | `N` pred `Q` | D03 (delno), S5 | CSV: nevtralizacija vsake celice | Ni izvedeno. |
| R09 | Izvirne vrednosti | D03 (delno), S4/S5 | CSV: neposredno branje polj `Task` | Ni izvedeno. |
| R10 | `preklop(E)=E`, enaki bajti | D04 (delno), S6 | App/ProjectView: življenjska doba UI | Ni izvedeno. |
| R11 | Ponastavitev, sveže nastavitve | S6 | App: ključ projekta; UI: lokalno stanje in handler | Ni izvedeno. |
| R12 | Nespremenjeni podatki in bralne funkcije | D04 (delno), S7, baseline/API | UI/CSV; App, TaskBoard, TaskDetails, styles.css | Ni izvedeno. |

S1–S7 morajo vključiti podatke z 0, 1 in več kot 10 opravili, drugačnimi
enkratnimi ID-ji, enakimi naslovi, mešanimi stanji in nesortiranim vrstnim
redom. S5 preveri varne proti-primere (prazno, samo presledki, `abc=1`,
začetni apostrof, NBSP pred znakom); statusi in datumi ostanejo veljavni po
tipih. Pravilo `N` se vseeno uporablja enotno za vseh sedem kolon.
Za S7 ohrani `data-task-id`, obstoječa dostopna imena pogledov/stolpcev,
`aria-label="Pregled stanj opravil"`, odpiranje po ID-ju, podrobnosti,
Escape, osvežitev, prazna in napakovna stanja ter ponovno nalaganje.
Nova dejanja ob opravilu morajo biti zunaj njegove povezave.
Pri 390 px velja `document.documentElement.scrollWidth <= innerWidth`;
notranje drsenje preglednice/table je dovoljeno. Ohrani barve, gradnike,
prelom navigacije do 760 px in viden fokus iz `src/styles.css`.

Implementer pred daljšim preverjanjem preveri časovni proračun. Predviden
skupni pregled je `npm run check` (lint, build/typecheck, vsi konfigurirani
Playwright projekti), vključno z lastnimi testi ter pregledom videza.
Dejanske lokacije implementacije, imena testov, ukaze, izide in poti do
dokazov zapiše v svoje izvedbene opombe v `docs/agent/`, povezane z R01–R12;
specifikacijo ob pripombah popravlja njen prvotni avtor.

## Odprta vprašanja in omejitve

- Blokirajočih vprašanj ni. Razporeditev kontrol, nepredpisano besedilo in
  način lokalnega prenosa so izbira implementerja ob ohranitvi videza.
- Nastavitve so lokalne projektu brez `localStorage` ali novega URL stanja.
  Ne dodajamo zahtev za nove sočasne spremembe brez osvežitve ali navigacijo
  med nalaganjem prek obstoječih regresij.
- Spreminjati je dovoljeno le datoteke svoje vloge. Implementer uporablja
  `src/`, `tests/agent/` in svoje dokumente; strežnik, skupni tipi, začetni
  podatki, odvisnosti, infrastruktura, skupni testi in navodila ostanejo enaki.
  Uporabniški vmesnik bere le `/api/`; ne uvaža testnih pripomočkov, ne
  uporablja `/__test/` in ne nadomešča strežnika z lokalno kopijo podatkov.
- V tej fazi so bila prebrana navodila, tipi, relevantna izvorna koda,
  konfiguracija in javni razvojni testi. Aplikacija ni bila zagnana; testi
  in pregled videza niso bili izvedeni. D01–D04 niso popolna pokritost;
  nedostopni končni testi niso preverjeni. To niso potrjeni izidi rešitve.
