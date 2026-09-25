# P07 – priljubljena opravila in trajna shramba

Stanje: v1, pripravljeno za predajo implementerju. Navodila, tipi, relevantna koda, dizajn in razvojni testi so prebrani. Izvirni pogoji `task/instructions.md` R01–R12 ostajajo obvezni. Aplikacija in testi v tej vlogi niso zagnani. Zgodovina: [specification-history.md](specification-history.md).

## Problem in kontekst

Obstoječi Folio dopolnimo z globalno množico priljubljenih ID-jev, trajno lokalno shrambo in filtrom trenutnega projekta. Ohranimo slovenski vmesnik, obstoječi dizajn, navigacijo in nalaganje. Podatki opravil ostanejo na javnem `/api/`; priljubljene ne spreminjajo podatkov opravil in ne povzročijo zapisov na API.

## Vhodi, dejanja in izidi

`shared/types.ts` določa `Project {id, name}` in `Task {id, projectId, title, description, status, assignee, dueDate}`. Vsa polja so nizi; `status` je `todo | in_progress | done`. `id` je identiteta, `projectId` določa pripadnost, `status` stolpec table. Naslovi niso identiteta. Število opravil je poljubno (0, 1, več kot 10), oba projekta sta lahko prazna, zaporedje je poljubno, datumi veljavni, besedila vsebujejo Unicode in ločila. ID-jev ne normaliziramo, ne krajšamo in ne omejujemo na začetne primere.

Podatki prihajajo iz GET `/api/projects`, `/api/projects/:projectId/tasks` in `/api/tasks/:taskId`, z obstoječim kodiranjem ID-jev v URL. Dodatna vhoda sta zapis `folio:favorites:v1` in `StorageEvent.newValue`. Dejanja so preklop priljubljenega, filter, menjava pogleda/projekta in odstranitev priljubljenih celotnega trenutnega projekta. Sprememba priljubljenih je takoj vidna; uspešen zapis jo ohrani po osvežitvi. Filter se začne z `false`, se ne shranjuje in ne potrebuje URL-parametra. Potrjevanje ali preklic teh dejanj nista zahtevana.

Neveljavna vsebina shrambe pomeni prazno množico brez samodejnega popravila zapisa. Izjema dostopa do shrambe je ločena napaka: začetno neuspešno branje da prazno množico v pomnilniku; neuspešen zapis ohrani že izvedeno lokalno spremembo. Aplikacija ostane uporabna in pokaže `role=alert` z besedo `shramba`. Obstoječe napake API-ja, nalaganje in ponovitev zahteve se ohranijo.

## Zahteve in pravila

Simboli: `Tₚ` je celoten urejeni seznam opravil trenutnega projekta iz API-ja, `Iₚ = {t.id : t ∈ Tₚ}`, `F` globalna množica priljubljenih nizov, `q` stanje filtra in `K = folio:favorites:v1`.

- **P1 – validacija:** `V(raw) = Set(o.ids)` samo, če se `raw` razčleni v objekt `o`, je `o.version === 1`, `Array.isArray(o.ids)` in je vsak element niz. Sicer `V(raw) = ∅`, tudi za `null`. En neniz zavrne celoten zapis. Dodatna polja niso razlog za zavrnitev, vendar se pri zapisovanju ne ohranijo. Prazen niz ni izrecno prepovedan ID v shranjeni množici; ne uvajamo dodatne validacije.
- **P2 – preklop in zapis:** `toggle(i): F′ = F △ {i}`. Ob lokalni spremembi se poskusi zapisati `JSON.stringify({version:1, ids: [...F′].sort()})`; privzeti nizovni `sort()` pomeni vrstni red kodnih enot UTF-16, ne `localeCompare`. Zapis vsebuje samo verzijo in ID-je. Inicializacija, preklop filtra/pogleda/projekta in sprejem dogodka storage sami ne zapisujejo.
- **P3 – prikaz:** `visible(Tₚ,F,q) = Tₚ.filter(t => !q || F.has(t.id))`. V preglednici ostane vrstni red API-ja, v tabli isti vrstni red znotraj vsakega obstoječega stolpca stanja. Neznani ID-ji nikoli ne ustvarijo vrstice ali kartice.
- **P4 – števec in brisanje:** `X = |F ∩ Iₚ|`, `M = |Tₚ|`; odstranitev projekta da `F′ = F ∖ Iₚ`, gumb je onemogočen natanko pri `X = 0`. Stolpec stanja `s` šteje `|{t ∈ visible : t.status = s}|`. Števec priljubljenih se ne računa iz `visible`.
- **P5 – življenjski cikel:** začetek/osvežitev: `(F,q) = (V(getItem(K)),false)` ob uspešnem branju; menjava projekta: `(F′,q′) = (F,false)`; menjava pogleda: `(F′,q′) = (F,q)`. `storage` z `event.key === K` nadomesti `F` z `V(event.newValue)` brez združevanja in brez povratnega zapisa; filter ostane isti. Ostali ključi se prezrejo.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Vsako opravilo v obeh pogledih ima ločen gumb `Priljubljeno opravilo <id>` z `aria-pressed`; klik spremeni le ta ID in ne odpre podrobnosti. | Enaka naslova, različna ID-ja; oba pogleda. |
| R02 | Zapis vsebuje samo `{version:1,ids:[...]}` pod `folio:favorites:v1`; ID-ji so enkratni nizi, urejeni po UTF-16. | Pregled localStorage po spremembi. |
| R03 | Osvežitev obnovi veljavne ID-je, združi dvojnike in ohrani neznane brez ustvarjanja opravil. | Prednaložen zapis z dvojniki in neznanimi ID-ji. |
| R04 | Manjkajoč ali neveljaven zapis po P1 da prazno začetno množico brez odpovedi ali samodejnega prepisa shrambe. | Neveljaven JSON, null/skalar, napačna version (tudi niz), manjkajoči ids, ids, ki ni polje, in mešanica nizov/nenizov; merjenje zapisov ob zagonu. |
| R05 | Checkbox `Prikaži le priljubljena` privzeto ni označen; omeji na priljubljene trenutnega projekta v izvornem vrstnem redu. | Preklop filtra nad drugačnim vrstnim redom. |
| R06 | Odstranitev med filtrom takoj skrije opravilo; pri aktivnem filtru in nič rezultatih oba pogleda kažeta `Ni priljubljenih opravil.` in omogočata izklop filtra. Kontrole ostanejo tudi pri praznem projektu. | Odstranitev zadnjega vidnega priljubljenega v obeh pogledih in prazen projekt. |
| R07 | Pogleda delita množico in filter; podrobnosti se odpirajo po pravilnem ID-ju. | Menjava preglednica–tabla–preglednica, povezava opravila. |
| R08 | Menjava projekta ohrani globalne ID-je in ponastavi filter; osvežitev obnovi ID-je in ponastavi filter. | Dva projekta in osvežitev. |
| R09 | `Odstrani priljubljene tega projekta` odstrani ID-je celotnega trenutnega projekta, ohrani druge/neznane; onemogočen je, ko v projektu ni priljubljenih. | Mešan zapis in aktivni filter, prazen projekt. |
| R10 | Element `role=status`, `aria-label=Število priljubljenih`, besedilo `Priljubljeno: X od M.` vedno šteje celoten trenutni projekt po P4, tudi pri aktivnem filtru in praznem projektu (`0 od 0`). Stolpci table štejejo vidna opravila. | Primerjava števcev pred filtrom in po njem; prazni stolpci ostanejo s številom 0. |
| R11 | Dogodek storage za pravi ključ validira novo vrednost, null izprazni; drug ključ prezre; ni povratnega zapisa. Izjeme branja/zapisa ne preprečijo uporabe in sprožijo opozorilo. | Dogodki in ločeno simulirana neuspešna branja/zapisi. |
| R12 | Spremembe so lokalne, brez zapisov na API ali sprememb polj opravil; ohranjen Folio in delovanje na 390 px. | Omrežje, podatki, regresije in pregled ozkega prikaza. |

Obvezna dostopnost in dizajn: ohraniti `data-task-id` na vrsticah/karticah, imena `Preglednica`, `Tabla`, `Tabla opravil`, stolpce `Pripravljeno`, `V delu`, `Končano` in `aria-label="Pregled stanj opravil"`. Novi gumbi so zunaj povezave opravila tudi v tabli; `aria-pressed` je vedno `true` ali `false`. Tipkovnični fokus ostane viden. Ohraniti obstoječo paleto, gradnike, levi meni in mobilno navigacijo po `docs/dizajn.md`; pri 390 px mora veljati `document.documentElement.scrollWidth <= window.innerWidth`, notranje vodoravno drsenje preglednice/table pa je dovoljeno. Brez aktivnega filtra ostaneta obstoječi prazni stanji; tabla ohrani tri stolpce tudi brez opravil.

## Izvedba in sledljivost

Preverjena izhodiščna mesta: `src/App.tsx` vsebuje `App`, `ProjectView`, izris vrstic in projektne števce; `ProjectView` ima `key={project.id}`. Globalno množico in napako shrambe je zato smiselno držati nad to mejo (v `App`, z ločenim pripomočkom/hookom v `src/`), projektni filter pa v `ProjectView`. Tako se filter ob menjavi projekta ponastavi, množica pa preživi tudi neuspešne zapise. `TaskBoard` naj prejme isti filtrirani seznam, množico in preklopno dejanje; trenutno je celotna kartica povezava, zato je treba gumb dodati kot ločen element. `src/TaskDetails.tsx` že nalaga podrobnosti po ID-ju, `src/navigation.ts` kodira poti, `src/useResource.ts` ureja nalaganje/napake. `updateTask` v `src/api.ts` obstaja, vendar ga ta funkcionalnost ne kliče. To so predvidena mesta sprememb, ne trditev o izvedeni implementaciji.

Oznake **D01–D04** so obstoječi testi v `tests/development/P07.spec.ts`. **S01–S08** spodaj so načrtovani dopolnilni scenariji, ne obstoječi ali izvedeni testi. Implementer naj rezultate, končne datoteke/funkcije, imena testov in dnevnike poveže z R01–R12 v lastnem dokumentu `docs/agent/implementation.md`; specifikacijo in njeno zgodovino spreminja samo njen avtor.

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | P2; ločen dostopen gumb za ID. | D01; S01: oba pogleda, isti naslov, posebni ID-ji, klik ne odpre dialoga. | `src/App.tsx` vrstice; `src/TaskBoard.tsx` kartice. | Ni izvedeno; koda samo prebrana. |
| R02 | P2; kanonični zapis. | D03 delno; S02: več ID-jev v obratnem vrstnem redu, Unicode, natančna vsebina zapisa brez podatkov opravil. | Predvideni pripomoček za shrambo v `src/`, povezan z `App`. | Ni izvedeno. |
| R03 | P1, P3; dvojniki in neznani ID-ji. | D03 delno; S02: prednaloženi dvojniki, ID drugega projekta in neznani ID; osvežitev, preklop in zapis ohranita neznane. | Inicializacija globalnega stanja; `ProjectView` izpeljani prikaz. | Ni izvedeno. |
| R04 | P1; ob nalaganju ni zapisov. | S03: vsaka neveljavna oblika iz R04; opazovanje `setItem` in izvornega zapisa tudi pri veljavnem nekanoničnem zapisu. | Parser in inicializacija shrambe v `src/`. | Ni izvedeno. |
| R05 | P3; q privzeto false. | D02 delno; S04: 0, 1 in več kot 10 opravil, drugačen vrstni red, filtriranje obeh pogledov. | `ProjectView` checkbox in izpeljani seznam; `TaskBoard` entries. | Ni izvedeno. |
| R06 | Takojšnja odstranitev, dostopne kontrole. | D02; S04: odstranitev zadnjega v tabli, izklop praznega filtra, prazen projekt. | `ProjectView` prazno stanje in kontrole. | Ni izvedeno. |
| R07 | P5; ista F in q, pravilni ID-ji. | D04 delno; S01/S04: aktiven filter skozi oba pogleda, podrobnosti po ID-ju in vrnitev. | `App`, `ProjectView`, `TaskBoard`; ohraniti `navigation.ts` in `TaskDetails.tsx`. | Ni izvedeno. |
| R08 | P5; reset samo projektnega filtra. | S05: označi v dveh projektih, filtriraj, menjaj in se vrni; osveži z aktivnim filtrom. | `App` globalno stanje; `ProjectView key={project.id}`. | Ni izvedeno. |
| R09 | P4; odstranitev celotnega Iₚ. | S05: mešan F z ID-ji obeh projektov in neznanim, aktivni filter; preveri ohranjene ID-je in disabled tudi pri praznem projektu. | `ProjectView` projektno dejanje; globalna mutacija F. | Ni izvedeno. |
| R10 | P4; celoten projekt proti vidnim stolpcem. | S06: natančno dostopno ime/besedilo, q=true/false, mešana stanja, 0/0; vsi stolpci, tudi prazni. | `ProjectView` status; `TaskBoard` column-count. | Ni izvedeno. |
| R11 | P1, P5; uskladitev brez povratnega zapisa. | S07: pravi/drug ključ, veljavno/neveljavno/null, zamenjava namesto unije, aktiven filter; ločeno izjema getItem in setItem, nadaljnji kliki in menjava projekta v pomnilniku. | Globalni pripomoček: listener s čiščenjem, parser, try/catch, opozorilo. | Ni izvedeno. |
| R12 | Samo lokalna mutacija F, regresije in Folio. | D04 delno; S08: vsa dejanja brez zapisov API/sprememb Task; preglednica, tabla, prazno stanje in opozorilo na 390 px; skupne regresije. | `src/App.tsx`, `src/TaskBoard.tsx`, `src/styles.css`; obstoječi API/navigacija. | Ni izvedeno; vizualni pregled ni opravljen. |

Predaja preverjanja: implementer izvede `npm run check` (lint, tipi/gradnja in vsi konfigurirani testi, vključno z razvojnimi in lastnimi). `playwright.config.ts` že vključuje `tests/agent/**/*.spec.ts`; infrastrukture ni treba spreminjati. Dopolnilni testi naj uporabijo poljubne podatke dovoljene domene in pokrijejo predvsem S02/S03/S05/S06/S07, ker D01–D04 ne pokrivajo zahtev v celoti. Omrežno preverjanje se nanaša na uporabniška dejanja priljubljenih; skupni API-testi sami namenoma preverjajo obstoječe zapise. Testni program sme uporabiti `/__test/`, uporabniška koda pa ne. Pred daljšim preverjanjem preveriti čas z `node task/time-budget.mjs` in predajo shraniti vsaj minuto pred rokom svoje faze.

## Odprta vprašanja in omejitve

Ni blokirajočih nejasnosti. Izrecna R02 dovoljuje localStorage za ID-je priljubljenih; prepoved lokalnega nadomestila strežnika iz projektnih pravil še velja za podatke opravil. Globalnost F iz R08 je izjema splošnega pravila o stanju trenutnega projekta. Urejanje po UTF-16 velja za zapis ID-jev, ne vrstni red prikaza.

Ohranimo obstoječi povzetek stanj in skupno število opravil kot podatka celotnega projekta; zahteva izrecno predpisuje vidne števce le stolpcem table. Med še nedokončanim prvim nalaganjem M ni znan: ostane obstoječi indikator nalaganja; ko je seznam naložen, števec in kontrole ostanejo vidni tudi pri nič opravilih ali rezultatih. Dodatnega vedenja novih sočasnih sprememb podatkov brez osvežitve ali navigacije med nalaganjem ne širimo prek obstoječih regresij.

V tej vlogi so bili izvedeni samo branje ter pisanje specifikacije in zgodovine. Funkcionalni testi, gradnja, lint in vizualni pregled so še neizvedeni; nedostopni končni testi niso dokazani. Pretekli rezultati iz `docs/preverjanje-izhodisca.md` niso rezultati te spremembe. Implementer piše samo svojo implementacijo, lastne teste in dokumentacijo; infrastruktura, `shared/`, odvisnosti, skupni testi in navodila ostanejo samo berljivi. Dovoljeni so le ta izvoz in lokalne storitve naloge, brez drugih projektov, oddaljenih repozitorijev ali dodatnih agentov.
