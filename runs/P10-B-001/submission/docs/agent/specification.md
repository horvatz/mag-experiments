# P10 — Lokalni vrstni red z razveljavitvami

Status: zaključena specifikacija za predajo implementerju, različica 1.0. Prebrani so navodila, tipi, relevantna izvorna koda in razvojni testi; aplikacija in testi niso bili zagnani. Izvirne zahteve v `task/instructions.md` ostajajo obvezne.

## Problem in kontekst

Folio trenutno izriše polje API neposredno v preglednici, na tabli pa ga filtrira po statusu. Dodati je treba lokalno urejanje globalnega vrstnega reda po ID-jih, razveljavitve, ponovitve in vrnitev na začetni vrstni red. Ohrani slovenski vmesnik in potrjeni videz iz `docs/dizajn.md`. Podatkov in zgodovine ne zapisuj trajno.

## Vhodi, dejanja in izidi

V `shared/types.ts` ima `Project` polji `id` in `name`; `Task` ima `id`, `projectId`, `title`, `description`, `status`, `assignee`, `dueDate`. Vsa polja so nizi, status je `'todo' | 'in_progress' | 'done'`. Tipov ne spreminjaj. Podatki pridejo z GET `/api/projects`, `/api/projects/:id/tasks` in za podrobnosti `/api/tasks/:id`; ID-je v poteh kodiraj z obstoječimi pripomočki.

Vhod je celotno polje opravil trenutnega projekta v vrstnem redu odgovora API. Identiteta je enkratni ID, ne naslov, indeks ali številčna pripona ID-ja. Podprti so poljubni enkratni ID-ji, enaki naslovi, Unicode, ločila, veljavni datumi in poljubno število opravil, tudi 0, 1 in več kot 10. Vsako opravilo pripada svojemu projektu; oba projekta sta lahko prazna. Besedilo obravnavaj kot navadno besedilo.

Dejanja so premik gor/dol, razveljavitev, ponovitev, začetni vrstni red, preklop pogleda, odpiranje/zapiranje podrobnosti, menjava projekta in osvežitev. Uspešen lokalni ukaz spremeni le zaporedje ID-jev in zgodovino. Onemogočen oziroma neveljaven ukaz ne spremeni ničesar. Zapiranje podrobnosti z gumbom, Escape ali obstoječo navigacijo ne prekliče premikov. Ohranijo se obstoječa stanja nalaganja, napake, ponovni poskus in neznane poti; pred uspešnim nalaganjem ni veljavnih premikov. Napaka podrobnosti ne sme izbrisati vrstnega reda ali zgodovine.

## Zahteve in pravila

Naj bo T prejeto polje, O = T.map(t ⇒ t.id), P trenutno zaporedje, U sklad prejšnjih permutacij in R sklad ponovitev; vrh sklada je na desni. M preslika ID v nespremenjeno opravilo. Enakost zaporedij pomeni enako dolžino in enak ID na vsakem mestu. `tail20` obdrži zadnjih največ 20 elementov, `+ [P]` doda posnetek na vrh, `last` in `dropLast` prebereta oziroma odstranita vrh. Posnetki se pozneje ne mutirajo.

- Inicializacija uspešno naloženega projekta: `(P,U,R) = (O,[],[])`.
- Invarianta vsakega trenutnega in shranjenega zaporedja Q: `length(Q) = length(O)`, `Set(Q) = Set(O)` in brez podvojenih ID-jev. Vsa polja `M[id]` ostanejo nespremenjena.
- Premik ID-ja x za d ∈ {−1,+1}: i = indexOf(P,x); veljaven je samo, če `i ≥ 0` in `0 ≤ i+d < length(P)`. Zamenjaj mesti i in i+d v kopiji P ter nastavi `(P',U',R') = (swap(P,i,i+d),tail20(U+[P]),[])`. Sicer je stanje v celoti enako prejšnjemu, tudi R.
- Razveljavitev pri nepraznem U: `(last(U),dropLast(U),R+[P])`; pri praznem U brez spremembe.
- Ponovitev pri nepraznem R: `(last(R),tail20(U+[P]),dropLast(R))`; pri praznem R brez spremembe.
- Začetni vrstni red pri P ≠ O: `(O,tail20(U+[P]),[])`; pri P = O brez spremembe. Tudi ta ukaz spoštuje omejitev 20 razveljavitev.
- Globalno mesto x je `indexOf(P,x)+1`; stolpec statusa s kaže `P.filter(id ⇒ M[id].status = s)` v tem vrstnem redu. Statusi se nikoli ne spreminjajo.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Začetni P = O; vsaka vrstica/kartica kaže globalno mesto 1…N po ID-ju, tudi pri enakih naslovih. | S01: drugačen vrstni red API in poljubni ID-ji. |
| R02 | Gor/dol zamenja opravilo z neposrednim globalnim sosedom, brez spremembe katerega koli polja ali statusa. | D01, S01, S06: obe smeri, primerjava s pričakovano permutacijo. |
| R03 | Gor na prvem in dol na zadnjem mestu sta onemogočena; neveljavno ali ponovljeno robno dejanje ohrani P, U in R. | D01, S03, S07: robovi, vključno z obstoječimi ponovitvami. |
| R04 | Vsak veljaven premik shrani prejšnjo celotno permutacijo v U; razveljavitev obnovi vrh U in shrani trenutni P v R. | D02, S02: preveri vsak vmesni vrstni red in števec. |
| R05 | Ponovitev obnovi vrh R in shrani trenutni P v U. Zaporedne razveljavitve/ponovitve ne izgubijo ali podvojijo ID-jev. | D02, S02, S04: celotna zaporedja in množice ID-jev. |
| R06 | Nov veljaven premik izprazni ves R; neveljaven robni premik ga ohrani. | D03, S03: razvejitev zgodovine in ohranitev pri no-op. |
| R07 | Vedno length(U) ≤ 20. Ob 21. veljavnem premiku izgine najstarejši posnetek; vsi trenutno razveljavljeni koraki so ponovljivi. | S04: 21 različnih prehodov, 20 razveljavitev in 20 ponovitev. |
| R08 | Začetni vrstni red pri P ≠ O vrne O kot eno novo razveljavljivo dejanje in izprazni R. Pri P = O je gumb onemogočen in ohrani oba sklada. | D04, S05: razveljavi in ponovi ponastavitev, no-op z nepraznim R. |
| R09 | Preglednica kaže P; tabla ohrani stolpce Pripravljeno, V delu, Končano ter relativni vrstni red iz P. Premik uporablja globalnega soseda tudi v drugem stolpcu, mesto je globalno. | D04, S06: premik čez status ter premik znotraj istega statusa. |
| R10 | Preklop pogleda ter odpiranje/zapiranje podrobnosti ohranijo P, U, R. Menjava projekta, tudi vrnitev na prejšnjega, in osvežitev začnejo z njegovim prejetim O in praznima skladoma. Brez trajne shrambe. | S06: oba sklada neprazna med navigacijo, nato menjava in osvežitev. |
| R11 | Števec kaže natančno `Razveljavitve: U. Ponovitve: R.` z dolžinama skladov. Razveljavi je onemogočen natanko pri U = []; Ponovi natanko pri R = []. Prazen projekt in eno opravilo ostaneta uporabna brez veljavnega premika. | D03, S02, S04, S07: števci po vsakem koraku, 0/1 opravil v obeh pogledih. |
| R12 | Vse spremembe so lokalne permutacije iste množice ID-jev. Brez zapisovalnih API zahtev in sprememb polj; števci statusov in podrobnosti po ID so nespremenjeni. Ohrani prilagodljiv Folio in dostopnost. | D04, S01, S08 ter regresijski testi: omrežje, podatki, tipkovnica, 390 px. |

Obvezna pogodba vmesnika: ob vsaki vrstici/kartici sta gumba z dostopnima imenoma `Premakni <id> gor` in `Premakni <id> dol`, zunaj povezave do podrobnosti. Element `aria-label="Mesto opravila <id>"` vsebuje globalno številko. Skupni gumbi imajo imena `Razveljavi premik`, `Ponovi premik`, `Začetni vrstni red`. Števec ima `role="status"`, `aria-label="Zgodovina vrstnega reda"` in zgoraj navedeno besedilo z eno končno piko. Uporabi dejansko stanje `disabled` za onemogočene gumbe.

Ohrani `data-task-id` na vrsticah in karticah, dostopna imena pogledov (`Preglednica`, `Tabla`, skupina `Prikaz opravil`), table (`Tabla opravil`), vseh treh stolpcev ter `aria-label="Pregled stanj opravil"`. Na 390 px mora veljati `document.documentElement.scrollWidth ≤ innerWidth`; dovoljeno je notranje drsenje preglednice/table. Nove kontrole uporabljajo obstoječe slogovne spremenljivke in viden fokus. Razporeditev kontrol in drugo besedilo nista predpisana.

## Izvedba in sledljivost

Preverjena integracijska mesta: `src/App.tsx` / `ProjectView` naloži opravila, izračuna števce in izriše preglednico. `App` že uporablja `ProjectView key={project.id}`, kar podpira ponastavitev pri menjavi projekta. Pogled in taskId sta lastnosti istega projektnega pogleda; stanje vrstnega reda mora preživeti njune spremembe. Inicializacija mora upoštevati asinhroni prihod `tasks` iz `useResource`, brez ponastavljanja ob navadnem ponovnem izrisu. Možen je ločen hook ali reducer v `src/`; končno organizacijo izbere implementer.

`src/TaskBoard.tsx` / `TaskBoard` že uporablja stalne stolpce in `filter`; prejme urejena opravila ter globalna mesta in dejanja iz istega projektnega stanja. Indeks v filtriranem stolpcu ni globalno mesto. `src/TaskDetails.tsx` bere opravilo po ID; sprememba vrstnega reda ne zahteva spremembe podatkov podrobnosti. `src/navigation.ts` ohranja obstoječo navigacijo. `src/api.ts` vsebuje `updateTask`, vendar se za P10 ne uporablja. Prilagoditve slogov sodijo v `src/styles.css`.

Spodnja mesta so načrtovane povezave na preverjeno izhodišče, ne trditev o že izvedeni implementaciji. D01–D04 so obstoječi testi v `tests/development/P10.spec.ts`; S01–S08 so spodaj določeni dodatni scenariji za implementerja.

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | O iz odgovora, identiteta in globalno mesto | S01 | `src/App.tsx`: ProjectView, izris vrstic; `src/TaskBoard.tsx`: kartice | Ni izvedeno; izhodišče nima prikaza mesta. |
| R02 | Zamenjava globalnih sosedov | D01, S01, S06 | `src/App.tsx`: projektno stanje in dejanja; `src/TaskBoard.tsx`: gumbi | Ni izvedeno; predvidena dopolnitev. |
| R03 | Robni no-op in disabled | D01, S03, S07 | Projektni prehodi stanja in gumbi obeh pogledov | Ni izvedeno. |
| R04 | Celoten posnetek in razveljavitev | D02, S02 | Projektno stanje, U/R in skupne kontrole v `src/App.tsx` oziroma novem modulu `src/` | Ni izvedeno. |
| R05 | Ponovitev in invarianta ID-jev | D02, S02, S04 | Isti prehodi projektnega stanja | Ni izvedeno. |
| R06 | Razvejitev prazni R le ob veljavnem premiku | D03, S03 | Isti prehodi projektnega stanja | Ni izvedeno. |
| R07 | Omejitev U na 20 | S04 | Isti prehodi projektnega stanja, dodajanje posnetka | Ni izvedeno; D01–D04 meje ne pokrivajo. |
| R08 | Ponastavitev kot dejanje/no-op | D04, S05 | Projektno stanje in gumb Začetni vrstni red | Ni izvedeno. |
| R09 | Stabilni stolpci, globalni sosed/mesto | D04, S06 | `src/TaskBoard.tsx`: columns, entries in izris kartic | Ni izvedeno. |
| R10 | Življenjska doba stanja projekta | S06, regresijska navigacija | `src/App.tsx`: ProjectView/key; `src/navigation.ts`; `src/TaskDetails.tsx` | Ni izvedeno; obstoječa meja projekta potrjena z branjem. |
| R11 | Števec, omogočenost, 0/1 opravil | D03, S02, S04, S07 | `src/App.tsx`: skupne kontrole, prazno stanje; `src/TaskBoard.tsx`: prazni stolpci | Ni izvedeno. |
| R12 | Lokalnost, polja, videz | D04, S01, S08, baseline/API | `src/App.tsx`, `src/TaskBoard.tsx`, `src/TaskDetails.tsx`, `src/styles.css`; bralna pot `src/useResource.ts` | Ni izvedeno; brez zagona ali vizualnega pregleda v tej vlogi. |

Dodatni scenariji (splošna pravila so zgoraj; primeri ne omejujejo vhodne domene):

- **S01:** poljubni ID-ji v nesortiranem odgovoru, enaki naslovi in različni statusi; preveri začetni P, mesta, oba premika, nespremenjena polja in pravilne podrobnosti po ID-ju.
- **S02:** pri O = [a,b,c,d] premakni c gor → [a,c,b,d], d gor → [a,c,d,b], a dol → [c,a,d,b]. Trikrat razveljavi do O in trikrat ponovi do zadnjega stanja; po vsakem koraku preveri celoten P, oba števca in omogočenost.
- **S03:** po dveh razveljavitvah iz S02 nov veljaven premik izbriše obe ponovitvi. Ločeno pri nepraznem R ponovljeno robno dejanje ne spremeni ničesar; preveri disabled v UI in zaščito prehoda stanja.
- **S04:** z 23 opravili premakni zadnjega 21-krat gor. U = 20; 20 razveljavitev konča v stanju po prvem premiku, dodatna ni dovoljena. R = 20; vseh 20 ponovitev obnovi končno stanje. Preveri tudi ponastavitev pri polnem U.
- **S05:** iz neizvornega P z nepraznim R ponastavi na O; R = 0 in U se poveča za enega do meje 20. Razveljavi in ponovi ponastavitev. Ločeno naredi premik in razveljavitev do O: onemogočen Začetni vrstni red mora ohraniti neprazen R.
- **S06:** pri obeh nepraznih skladih preklopi preglednica–tabla, odpri in zapri podrobnosti ter preveri ohranitev stanja. Na tabli uporabi globalnega soseda drugega statusa: položaj znotraj stolpca lahko ostane enak, globalno mesto pa se spremeni. Preveri tudi soseda istega statusa, nato tabelo. Menjaj projekt in se vrni; oba začneta brez zgodovine. Osveži tudi neposredno pot podrobnosti/table: izvorni red in prazna sklada.
- **S07:** 0 in 1 opravilo v vsakem projektu, tudi oba prazna. Števca sta 0, zgodovinski gumbi in ponastavitev onemogočeni; pri enem opravilu mesto 1 in oba premika onemogočena. Preglednica, tabla s tremi stalnimi stolpci in navigacija delujejo.
- **S08:** zaporedje lokalnih dejanj v obeh pogledih spremljaj glede API zapisov (pričakovano nič), nespremenjenih števcev statusov, podatkov in podrobnosti. Pri namizju in 390 px preveri Folio, viden fokus, dosegljive kontrole zunaj povezav ter odsotnost razširitve cele strani. Osvežitev potrdi odsotnost trajne shrambe.

Implementer izvede skupne preverbe (`npm run lint`, `npm run build`, `npm test`) in smiselne lastne teste v `tests/agent/`; ne spreminja skupnih testov ali nastavitev, tudi če lastni scenarij zahteva izrecen zagon. Regresije vključujejo napake/ponovni poskus, neznane poti, nalaganje med menjavo projekta in navigacijo podrobnosti. Rezultate, dejanske poti lastne kode/testov in dokaz (ukaz, izid, dnevnik) poveže z R01–R12 v svojih implementacijskih opombah v `docs/agent/`; ta dokument ostaja v lasti avtorja specifikacije.

## Odprta vprašanja in omejitve

Ni odprtega vprašanja, ki bi preprečevalo implementacijo. Predpostavke: posnetki so lokalni trenutni obiskani projektni instanci; vrnitev na projekt ne obnovi stare zgodovine. Neveljaven ID se obravnava kot no-op. Klik na že izbrani pogled/projekt brez dejanske menjave projekta ni menjava projekta. Omejitev 20 velja za vse razveljavljive ukaze, tudi ponastavitev. Nespremenjeni red O ne pomeni nujno praznih skladov.

Navigacije med nedokončanim nalaganjem in novih sočasnih sprememb podatkov ne širimo prek obstoječih regresijskih zahtev. Ni novega API-ja, shrambe, URL-stanja vrstnega reda ali dodatnih funkcij. UI ne uporablja `/__test/`, razvojnih pomočnikov ali lokalne nadomestne baze. Strežnik, skupni tipi, infrastruktura, odvisnosti, skupni testi in navodila ostanejo samo berljivi.

V tej vlogi so izvedeni le branje in zapis specifikacije. Vsi funkcionalni scenariji, testi, preverjanje omrežja in videza so še neizvedeni; končni skriti testi niso dostopni. Nadaljnjo implementacijo in preverjanje opravi naslednji agent. Zgodovina priprave je v `specification-history.md`.
