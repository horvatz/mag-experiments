# P06 — Nastavljiv izvoz CSV

## Problem in kontekst

Uporabnik želi izvoziti opravila trenutnega projekta v CSV z izbranimi kolonami, filtrom statusa in ločilom. Izhodišče prikazuje preglednico, tablo, povzetke stanj in podrobnosti; izvoza še nima. Obstoječi videz Folio iz `docs/dizajn.md`, slovenska poimenovanja in bralne funkcije ostanejo ohranjeni. To je dokončana predaja avtorja specifikacije; implementer in reviewer beležita izvedbo ter dejanske rezultate v svojih dokumentih, s sklici na R01–R12.

## Vhodi, dejanja in izidi

Vir je obstoječi javni API `/api/`. Dovoljene kolone so po vrsti `id, projectId, title, status, assignee, dueDate, description`. Privzeto so izbrane vse, filter je `all`, ločilo `;`. Uporabnik spreminja checkboxe `Stolpec <ime>`, HTML select `Ločilo CSV`, HTML select `Filter izvoza` ter sproži `Izvozi CSV`. Izvoz prenese lokalno datoteko `folio-<projectId>.csv`; nobenega opravila ne spremeni.

Prebrani `shared/types.ts` določa `Project { id: string, name: string }` in `Task`: vsa izvozna polja so obvezni nizi; `status` je unija `todo | in_progress | done`, `dueDate` veljaven koledarski datum `YYYY-MM-DD`. Opravila imajo enkratne ID-je, naslovi se lahko ponovijo. Vsako pripada svojemu projektu. Število ni omejeno na izhodiščne podatke. Projektni identifikator za ime datoteke ima črke, številke in vezaje.

Kontrole so dostopne v obeh pogledih. Vsak checkbox ima točno dostopno ime `Stolpec id`, `Stolpec projectId`, `Stolpec title`, `Stolpec status`, `Stolpec assignee`, `Stolpec dueDate` ali `Stolpec description`. Select `Ločilo CSV` ima vrednosti `;` in `,`; select `Filter izvoza` vrednosti `all`, `todo`, `in_progress`, `done`. Gumb ima dostopno ime `Izvozi CSV`. Preostale oznake in postavitev niso predpisane.

Po uspešnem izvozu podatki, nastavitve, pogled in lokacija ostanejo enaki. Ob praznem rezultatu ali brez kolon ni prenosa. Med nalaganjem oziroma ob napaki brez podatkov izvoz ni na voljo; obstoječa stanja nalaganja, napake in ponovnega poskusa ostanejo. Preklic prenosa v brskalniku nima učinka na podatke ali nastavitve; dodaten aplikacijski dialog za preklic ni zahtevan.

## Zahteve in pravila

Naj bo `T` izvorno urejeno polje opravil trenutnega projekta iz API, `K = [id, projectId, title, status, assignee, dueDate, description]`, `S` množica izbranih kolon, `d` ločilo in `f` filter. `C = K.filter(k => S.has(k))`; `E = T.filter(t => f === 'all' || t.status === f)`. Filtriranje ohrani relativni vrstni red in ne spremeni `T`.

- Omogočen izvoz natanko tedaj, ko so podatki naloženi, `C.length > 0` in `E.length > 0`; tudi obravnava dejanja preveri ta pogoj. Število podatkovnih zapisov CSV je `E.length`, število celic vsakega zapisa in glave `C.length`.
- Za izvirni niz `s` velja `N(s) = "'" + s`, če `/^[ \t\r\n]*[=+@-]/.test(s)`, sicer `N(s) = s`. Uporabi samo te štiri začetne bele znake, brez `trim()` ali splošnega `\s`. `Q(s) = '"' + s.replaceAll('"', '""') + '"'`. Glave so `Q(k)`, podatki `Q(N(t[k]))` za vsako izbrano kolono.
- Vsebina je UTF-8 kodiranje `U+FEFF + C.map(Q).join(d) + CRLF + E.map(t => C.map(k => Q(N(t[k]))).join(d) + CRLF).join('')`. Začetni bajti BOM so `EF BB BF`. Notranji CR/LF ostanejo izvirni; CRLF se dodaja samo med zapisi in na konec vsakega zapisa.
- Privzeto stanje je `(S, d, f) = (vse K, ';', 'all')`. Preklop pogleda in izvoz stanje ohranita; menjava projekta (tudi vrnitev v že obiskanega) in osvežitev ga ponastavita. Novo stanje ne potrebuje URL-ja ali trajne shrambe. `CSV(T,S,d,f,table) = CSV(T,S,d,f,board)` bajt za bajtom.
- V vseh izvoznih dejanjih velja `T_po = T_pred` po vsebini in vrstnem redu, vidni seznam in povzetki uporabljajo celoten `T`, število zapisovalnih zahtev API je nič.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Samo opravila trenutnega projekta v izvornem vrstnem redu; privzete nastavitve kot zgoraj. | Primerjava prenosa z zaporedjem API. |
| R02 | Glava in vrednosti vsebujejo izbrane kolone v fiksnem dovoljenem vrstnem redu, ne vrstnem redu klikov. | Izbira kolon v obrnjenem vrstnem redu. |
| R03 | Brez izbranih kolon je gumb onemogočen in ni prenosa; ponovni izbor ga omogoči, če obstajajo vrstice. | Preklopi checkboxov in opazovanje prenosa. |
| R04 | Filter `all/todo/in_progress/done` vpliva samo na izvoz; prazen rezultat ali projekt onemogoči izvoz. | Primerjava izvoza in vidnih opravil. |
| R05 | Lokalni prenos `folio-<projectId>.csv`, UTF-8 BOM U+FEFF na začetku, brez nove strani ali pošiljanja vsebine strežniku. | Bajti, ime prenosa, strani in promet. |
| R06 | Ločilo `;` ali `,`; vsaka glava in vrednost sta navedeni z dvojnimi narekovaji; notranji narekovaji podvojeni. | Natančna primerjava CSV. |
| R07 | CRLF med vrsticami in po zadnji; izvirna ločila in prelomi znotraj vrednosti so ohranjeni. | Primerjava bajtov večvrstičnih vrednosti. |
| R08 | Če po poljubnih začetnih presledkih, tabulatorjih, CR ali LF sledi `=`, `+`, `-` ali `@`, dodaj apostrof na začetek izvirne podatkovne vrednosti pred navedbo; glave ne spreminjaj. | Pozitivni in negativni primeri v vseh kolonah. |
| R09 | Unicode, presledki in opisi ostanejo enaki razen R08; status je interna vrednost in datum izvirni YYYY-MM-DD. | Surova primerjava vrednosti. |
| R10 | Preklop Preglednica/Tabla ohrani vse nastavitve in ustvari enake bajte ob enakih podatkih. | Izvoz v obeh pogledih. |
| R11 | Menjava projekta in osvežitev ponastavita vse nastavitve; vsak zaporedni izvoz upošteva aktualne. | Preklop projekta, reload, zaporedna prenosa. |
| R12 | Nobenih mutacij podatkov ali zapisov API; ohranjeni bralni prikazi, dostopnost in odzivni dizajn. Pri 390 px velja `document.documentElement.scrollWidth <= innerWidth`; notranje drsenje preglednice/table je dovoljeno. | Regresije, promet, primerjava podatkov in preverjanje preliva. |

Ohrani `data-task-id` na vrsticah in karticah, gumba `Preglednica`/`Tabla` in njun `aria-pressed`, skupino `Prikaz opravil`, regijo `Tabla opravil`, dostopna imena obstoječih stolpcev ter `aria-label="Pregled stanj opravil"`. Nova dejanja ob opravilu so zunaj njegove povezave. Uporabi obstoječe slogovne spremenljivke, viden fokus in prilagodljive kontrole; navigacija do 760 px ostane nad vsebino. Povzetki, števec, podrobnosti in navigacija po ID-ju ne smejo uporabljati izvoznega filtra.

## Izvedba in sledljivost

Prebrane integracijske točke: `src/App.tsx` — `ProjectView` pridobi `Task[]` z `useResource` na `/api/projects/${encodeURIComponent(project.id)}/tasks`, neposredno izriše preglednico in preda celoten `tasks` v `TaskBoard`. `App` že uporablja `key={project.id}` za `ProjectView`: lokalno stanje izvoza v tem življenjskem ciklu omogoča ponastavitev pri menjavi projekta in ohranitev pri preklopu pogleda. Kontrole naj bodo skupne obema pogledoma, zunaj pogojne veje za tablo/preglednico.

`src/TaskBoard.tsx` združuje opravila po statusu, zato DOM table ni vir vrstnega reda izvoza. `src/components.tsx` prevaja statuse in `src/formatDate.ts` oblikuje datum samo za prikaz; izvoz uporabi neposredna polja `Task`. `src/api.ts` vsebuje pripravljeni `updateTask`, ki ga izvoz ne kliče. `src/useResource.ts`, `src/navigation.ts` in `src/TaskDetails.tsx` ohranijo obstoječe branje, navigacijo in napake. Za pretvorbo je primeren čist pomožni modul, npr. **predlagani, še neobstoječi** `src/csv.ts`; prenos lahko uporabi lokalni `Blob`, object URL in povezavo z `download`, nato sprosti URL.

`D01`–`D04` spodaj so obstoječi testi v `tests/development/P06.spec.ts`, ki so bili samo prebrani. `S01`–`S06` so načrtovani dopolnilni scenariji za implementerjeve teste v `tests/agent/`; še niso napisani ali izvedeni. Imena novih modulov so predlog, končne lokacije in rezultate implementer navede v svoji dokumentaciji.

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | T, privzeto stanje, izvorno zaporedje | D01 (delno), S01 | `src/App.tsx`: `ProjectView`; predlagani `src/csv.ts`: izbor vrstic | Ni izvedeno; prebrana le izhodiščna koda/test. |
| R02 | C sledi K, vse dovoljene kolone | D02 (delno), S02 | `src/App.tsx`: kontrole; predlagani `src/csv.ts`: projekcija kolon | Ni izvedeno. |
| R03 | Omogočenost in zaščita dejanja | S02 | `src/App.tsx`: kontrole in obravnava izvoza | Ni izvedeno. |
| R04 | E filtrira samo izvoz, prazni rezultati | D02 (delno), S01, S02 | `src/App.tsx`: celoten T za prikaz; predlagani `src/csv.ts`: E | Ni izvedeno. |
| R05 | Ime, BOM, lokalni prenos | D01 (delno), S05 | `src/App.tsx`: dejanje prenosa; predlagani `src/csv.ts`: BOM | Ni izvedeno. |
| R06 | Q, obe ločili | D02/D03 (delno), S03 | Predlagani `src/csv.ts`: navedba in sestava | Ni izvedeno. |
| R07 | CRLF in nespremenjeni notranji prelomi | D01/D03 (delno), S03, S05 | Predlagani `src/csv.ts`: sestava zapisov | Ni izvedeno. |
| R08 | N pred Q za vse podatkovne kolone | D03 (delno), S03 | Predlagani `src/csv.ts`: nevtralizacija | Ni izvedeno. |
| R09 | Izvirni nizi, status in datum | D03 (delno), S01, S03 | `shared/types.ts`: prebrani Task; predlagani `src/csv.ts`: surova polja | Ni izvedeno. |
| R10 | Ohranjeno stanje in enaki bajti med pogledoma | D04 (delno), S04 | `src/App.tsx`: stanje v `ProjectView` in skupne kontrole | Ni izvedeno. |
| R11 | Ponastavitev in aktualne nastavitve ob vsakem izvozu | S04 | `src/App.tsx`: `key={project.id}`, inicializacija in dejanje | Ni izvedeno. |
| R12 | Nespremenjeni podatki/prikazi, brez zapisov, dostopnost in širina | D04 (delno), S02, S05, S06; skupne regresije | `src/App.tsx`, `src/TaskBoard.tsx`, `src/TaskDetails.tsx`, `src/styles.css` | Ni izvedeno; vizualni pregled ni opravljen. |

Predlagani scenariji (splošna pravila veljajo tudi za druge podatke):

- **S01:** Ločeni primeri z 0, 1 in več kot 10 opravili; oba projekta prazna; drugačni enkratni ID-ji, enaki naslovi, premešano izvorno zaporedje in vsi statusi. Preveri vse privzete kontrole, točna polja in relativni vrstni red, tudi v tabli. Za prazne primere preveri onemogočen gumb in odsotnost prenosa.
- **S02:** Odznači vseh sedem kolon, poskusi izvoz, ponovno izberi eno; več kolon izberi v obrnjenem vrstnem redu. Preveri vse štiri filtre, tudi filter brez zadetkov, in obe ločili z več kolonami. Ves čas ostanejo prikazana vsa opravila, prvotni povzetki in delujoče podrobnosti po ID-ju. Ponovni izbor kolone ob praznem E ne omogoči izvoza.
- **S03:** Natančen pričakovani CSV za prazno besedilo, Unicode/emoji/šumnike, začetne/končne presledke, `;`, `,`, dvojne narekovaje ter notranje LF, CR in CRLF. Pozitivni primeri formul pokrijejo vse štiri sprožilce in njihove predpone iz presledkov/tabulatorjev/CR/LF, npr. ` \t\r\n+1` dobi apostrof pred presledek. Negativni primeri: `abc=1`, že dodan začetni apostrof, samo beli znaki, `\u00A0=1` in `\v=1` ostanejo enaki. Pravilo N velja za vsako podatkovno kolono; veljavne statuse in datume ohrani. Po potrebi izolirano preveri čisto funkcijo, ne omeji zaščite na title/description.
- **S04:** Z nespremenjenim T izberi več neprivzetih kolon, vejico in neprivzeti filter; izvoz v preglednici, tabli in nazaj mora biti bajtno enak. Spremeni vse nastavitve med zaporednima prenosoma in preveri nov rezultat. Menjaj projekt ter se vrni: privzete nastavitve in samo opravila izbranega projekta. Osveži po spremembi nastavitev v vsakem pogledu ter preveri ponastavitev.
- **S05:** Preveri dejanske bajte prenosa (UTF-8 BOM `EF BB BF`, CRLF po glavi in vsakem podatkovnem zapisu, tudi zadnjem), ime glede na aktualni projekt in točno vsebino. Ne štej CSV vrstic z golim split po LF, ker so prelomi tudi v celicah. Opazuj, da ni nove strani, spremembe lokacije, poslanih vsebin ali zapisovalnih API zahtev. Primerjaj izvorno polje/objekte pred izvozom in po njem; čisti pretvornik je mogoče preveriti z zamrznjenim vhodom.
- **S06:** Skupne regresije `tests/baseline.spec.ts` in `tests/api.spec.ts`, razvojni `tests/development/P06.spec.ts`, smiselni lastni testi ter predpisani lint/build. Vizualno preveri Folio na namizju in pri 390 px v obeh pogledih; brez preliva celotne strani, kontrole dosegljive s tipkovnico, viden fokus, zahtevana dostopna imena in atributi ohranjeni. API test lahko sam zapisuje kot del obstoječega preverjanja strežnika; prepoved zapisov velja za UI izvoza.

Implementer naj pri poročanju vsaki R doda dejanske končne datoteke/funkcije, ime izvedenega testa ali ročnega scenarija, ukaz in določljiv rezultat/dnevnik. Predlagana preverjanja niso dokaz uspeha; razvojni testi ne pokrijejo celotne specifikacije.

## Odprta vprašanja in omejitve

Veljajo izvirne zahteve v `task/instructions.md` in projektna pravila tudi ob morebitnem izpustu v tej specifikaciji. Ni odprtih vprašanj, ki bi blokirala izvedbo. Ker tip zahteva nize, obravnava `null`, manjkajočih polj ali neveljavnih datumov ni nova zahteva. Navigacija med nalaganjem in sočasne spremembe brez osvežitve ostanejo v obstoječem regresijskem obsegu.

Infrastruktura, strežnik, začetni podatki, skupni tipi, odvisnosti, skupni testi in navodila so samo berljivi. Aplikacija uporablja le `/api/`, ne `/__test/`, ne uvaža testnih pomočnikov in ne uporablja lokalne kopije podatkov ali `localStorage` namesto API. Dovoljeni so le izvoz in lokalne storitve te naloge, brez drugih projektov, konektorjev ali oddaljenih repozitorijev.

Avtor je prebral navodila, predlogo, podatkovne tipe, relevantno kodo, dizajnerska pravila in razvojne teste; aplikacije, testov in vizualnega pregleda ni zaganjal. Vsi izvajalni pogoji R01–R12 še čakajo implementerjevo preverjanje. Nedostopni končni testi niso bili izvedeni. Zgodovina je v `docs/agent/specification-history.md`.
