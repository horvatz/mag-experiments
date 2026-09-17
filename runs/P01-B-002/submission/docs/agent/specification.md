# P01 — razvojna specifikacija urejanja opravila

Status: pripravljeno za predajo implementatorju, 17. 9. 2026; implementacija še ni izvedena. Vir zahtev: `task/instructions.md`, različica 0.2. Veljajo tudi `PROJECT_RULES.md`, potrjeni dizajn `docs/dizajn.md` in skupni dogovor o uporabniškem vmesniku. Ta dokument ne nadomešča izvirnih zahtev. Zgodovina: `docs/agent/specification-history.md`.

## Problem in kontekst

Folio omogoča izbiro projekta, preglednico in tablo opravil ter modalne podrobnosti. Začetni `src/TaskDetails.tsx` prikazuje podatke brez urejanja. Uporabnik mora v podrobnostih z gumbom »Uredi« spremeniti naslov in stanje trenutno izbranega opravila ter spremembo potrditi z »Shrani« ali zavreči s »Prekliči«.

`src/App.tsx` pridobiva seznam opravil projekta in iz njega računa števce; `src/TaskDetails.tsx` ločeno pridobiva posamezno opravilo. Zato je treba po uspešnem zapisu uskladiti oba vira prikaza. `src/api.ts` že ponuja `updateTask(id, { title, status })`, ki pošlje `PATCH /api/tasks/:id` in vrne shranjeni `Task`. `src/TaskBoard.tsx` razvršča opravila glede na stanje. Izbira in posodobitev morata vedno uporabljati `id`.

## Vhodi, dejanja in izidi

- Urejani polji: besedilno polje z oznako »Naslov« in HTML `select` z oznako »Stanje«. Možnosti so Pripravljeno (`todo`), V delu (`in_progress`), Končano (`done`).
- Nespremenljiva polja: `id`, `projectId`, `description`, `assignee`, `dueDate`. Obrazec jih ne ureja in zahteva za zapis vsebuje samo `title` ter `status`.
- »Uredi« je na voljo pri uspešno naloženem opravilu pravilnega projekta. Ustvari nov osnutek iz shranjenih vrednosti, brez starih napak.
- »Shrani« najprej normalizira in preveri naslov, nato pošlje eno zahtevo za obe polji. Do uspešnega odgovora shranjeni prikazi ostanejo nespremenjeni.
- Ob uspehu se urejevalni obrazec zapre, podrobnosti kažejo shranjeno opravilo, seznam, tabla in števci so usklajeni; osvežitev strani ohrani zapis.
- »Prekliči« zapre urejevalni obrazec, zavrže osnutek in napake ter ne pošlje PATCH. Podrobnosti ostanejo v načinu prikaza.
- Ob zavrnitvi ostane obrazec odprt z uporabnikovim vnosom, vidno napako in možnostjo ponovnega poskusa; shranjeni podatki se ne spremenijo.
- Med shranjevanjem so obe polji ter »Shrani« in »Prekliči« onemogočeni, prikaz z `role="status"` pa jasno pove, da shranjevanje poteka.

Dogovor o dostopnosti: dejanske povezane oznake polj so »Naslov« in »Stanje«, imena gumbov pa »Uredi«, »Shrani«, »Prekliči«. Napaka naslova je povezana s poljem prek `aria-describedby`; neveljavno polje ima `aria-invalid="true"`. Sporočila napak imajo `role="alert"`. Ob veljavnem popravku se napaka naslova in neveljavnost umakneta že med urejanjem. Napaka strežnika je ločena od napake vnosa; ob uspehu izgine. Ohraniti je treba `data-task-id` na vrsticah in karticah, poimenovane stolpce ter `aria-label="Pregled stanj opravil"` na pregledu števcev.

Videz: obrazec umesti v obstoječi desni modalni panel podrobnosti (`.task-dialog`), ki je na telefonu širok do celotnega zaslona. Uporabi obstoječe sistemsko besedilo, barvne spremenljivke, gumbe in razmike; dopolnilni slogi naj ostanejo lokalni obrazcu. Ohranijo se navigacija, tabela, tabla, prikaz ostalih podatkov, vidni fokus, nevtralne površine in moder poudarek glavnega dejanja. Na širini 390 px morajo biti polji, napake in gumba dosegljivi brez širjenja strani; dolg naslov se ustrezno prikaže v obstoječih pogledih. Ne uvajaj novega vizualnega sistema ali odvisnosti.

## Zahteve in pravila

Naj bo `S[id]` zadnja uspešno shranjena vrednost opravila, `D` osnutek in `q` stanje urejanja (`prikaz`, `urejanje`, `shranjevanje`). `T(x)` odstrani samo največji začetni in končni niz znakov U+0020, U+0009, U+000A, U+000D. Notranji znaki in vsi drugi znaki, tudi U+00A0, ostanejo. Splošni `String.trim()` zato ni ustrezen. Veljaven naslov pomeni `T(D.title).length > 0`.

Odprtje: `q=prikaz → q=urejanje`, `D=(S[id].title,S[id].status)`, napake se počistijo. Sprememba osnutka ne spremeni `S`. Neveljavna oddaja ostane v urejanju brez PATCH. Veljavna oddaja preide v shranjevanje in pošlje `(T(D.title),D.status)` za izbrani `id`. Uspeh zamenja izbrano shranjeno opravilo z vrnjenim zapisom ter preide v prikaz. Zavrnjena zahteva ohrani `S` in osnutek ter vrne urejanje z napako. Preklic ohrani `S` in preide v prikaz.

Za projekt `p` in stanje `s` velja `C(p,s)=|{t: t.projectId=p ∧ t.status=s}|`. Po uspehu se v starem stanju odšteje ena in v novem prišteje ena, če sta različni; pri istem stanju števci ostanejo enaki. To je pravilo prikaza, ne navodilo za ročno vzdrževanje ločenih števcev: priporočeno je obstoječe računanje iz seznama. V vsakem trenutku je število odprtih PATCH zahtev iz enega obrazca največ ena. Za isto stanje in nespremenjen veljaven naslov ni zahtevana posebna optimizacija.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Odprtje urejanja izpolni obe polji iz trenutno shranjenega opravila, določenega z `id`. | Odpri opravili z enakim naslovom in preveri vsak identifikator ter začetne vrednosti. |
| R02 | V urejanju in med čakanjem velja `S'=S`; seznam, tabla in števci uporabljajo shranjene vrednosti. | Spremeni obe polji brez shranjevanja ter med zakasnjenim PATCH preveri prikaze in API. |
| R03 | Pred validacijo in zapisom uporabi `T`; prazna vrednost ne pošlje PATCH. Napaka je ob polju in izgine ob veljavnem popravku. | Preveri prazen vnos, samo dovoljene robne bele znake, mešane robove, notranje presledke ter U+00A0. |
| R04 | `D.status ∈ {todo,in_progress,done}`; dovoljenih je vseh šest prehodov med različnimi stanji. | Preveri možnosti in vse usmerjene prehode, tudi zapis samo naslova ali samo stanja. |
| R05 | Uspeh skupaj posodobi obe polji. Števec stanja je število opravil s tem shranjenim stanjem; kartica je v ustreznem stolpcu. | Po zapisu preveri podrobnosti, preglednico, tablo, števce ter osvežitev strani. |
| R06 | Preklic pošlje nič PATCH, zavrže osnutek in napake. | Prekliči spremenjen in neveljaven obrazec; ponovno odpri in preveri shranjene vrednosti. |
| R07 | Za vsak `j≠id` velja `S'[j]=S[j]`; pri `id` so druga polja enaka kot prej. | Primerjaj podatke pred/po, tudi dvojni naslov ter opravila drugega projekta. |
| R08 | Zavrnitev ohrani `S`, obrazec in vnos; vidna napaka dovoljuje ponoven poskus, uspeh jo odpravi. | Zavrni PATCH, preveri stanje in ponovi uspešno. |
| R09 | Med čakanjem največ ena aktivna zahteva, viden status ter štirje onemogočeni kontrolniki; po zavrnitvi se omogočijo. | Zakasnitev odgovora, več hitrih oddaj, štetje PATCH, preverjanje `disabled` in ponovnega poskusa. |
| R10 | Po koncu urejanja delujejo projekti, pogledi in podrobnosti; drug obrazec nima starega vnosa ali napak. | Po uspehu, preklicu in napaki s preklicem odpri drugo opravilo ter zamenjaj projekt in pogled. |

## Izvedba in sledljivost

Spodaj so predlagana mesta sprememb, ne trditev o izvedeni kodi. D01–D04 so obstoječi testi v `tests/development/P01.spec.ts`; izvajajo se v projektih `development-desktop` in `development-mobile` (skupaj osem preverjanj). Scenariji S01–S07 so dodatni predlogi za implementatorjeve teste v `tests/agent/`, ki še niso napisani. Obstoječi testi API dokazujejo le vedenje strežnika, ne izpolnitve zahtev v UI.

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | Polji odražata opravilo izbranega `id`. | D01; S01 | `src/TaskDetails.tsx`: odprtje in inicializacija osnutka | Koda pregledana: gumba Uredi še ni; potrjeno z ogledom B01. Testi P01 niso izvedeni. |
| R02 | Osnutek in čakanje ne spreminjata shranjenega prikaza. | D03 delno; S04 | `src/TaskDetails.tsx`: lokalni osnutek; `src/App.tsx`: seznam | Načrtovano, ni izvedeno. |
| R03 | Natančen `T`, validacija, odstranjevanje napake, nič PATCH ob praznem naslovu. | D04; S02 | `src/TaskDetails.tsx`: validacija in oddaja; morebitna pomožna funkcija v `src/` | Načrtovano, ni izvedeno. |
| R04 | Tri možnosti in vsi prehodi. | D01/D02 delno; S03 | `src/TaskDetails.tsx`: select in osnutek stanja | Načrtovano, ni izvedeno. |
| R05 | En zapis obeh polj; usklajeni prikazi, števci in osvežitev. | D02; S03/S07 | `src/api.ts`: obstoječi updateTask; `src/TaskDetails.tsx` in `src/App.tsx`: prevzem uspešnega zapisa; `src/useResource.ts`: po potrebi posodobitev vira | Načrtovano, ni izvedeno. |
| R06 | Preklic brez PATCH; sveže odprtje brez napak. | D03; S06 | `src/TaskDetails.tsx`: preklic in ponovni začetek | Načrtovano, ni izvedeno. |
| R07 | Izolacija po `id`, nespremenjena druga polja in projekti. | S01/S07 | `src/TaskDetails.tsx`: izbran id in vsebina zahteve; `src/App.tsx`: zamenjava samo ustreznega zapisa | Načrtovano, ni izvedeno. |
| R08 | Zavrnjeni zapis ohrani vnos in podatke; ponovni poskus uspe. | S05 | `src/TaskDetails.tsx`: obravnava zavrnitve in ponovna oddaja; `src/api.ts`: obstoječa napaka request | Načrtovano, ni izvedeno. |
| R09 | Status, disabled, največ ena aktivna zahteva in odklep ob napaki. | S04/S05 | `src/TaskDetails.tsx`: varovalo oddaje, stanje čakanja in konec zahteve | Načrtovano, ni izvedeno. |
| R10 | Delujoča nadaljnja navigacija in izolirani obrazci. | S06/S07; osnovni testi navigacije | `src/App.tsx`: ProjectView; `src/TaskDetails.tsx`: življenjski cikel; `src/navigation.ts`: obstoječe poti | Izhodiščna navigacija preverjena z B01, vedenje po urejanju še ni izvedeno. |

Priporočena povezava podatkov: `TaskDetails` po uspehu prevzame vrnjeni `Task` in o uspehu obvesti `ProjectView`, ki zamenja samo zapis z enakim `id` ali ponovno pridobi seznam. `useResource` trenutno vrača samo `data`, `error`, `loading`, `retry`, zato bo treba omogočiti posodobitev shranjenega prikaza ali uporabiti premišljeno ponovno branje. Izbrana izvedba ne sme ob novem GET vrniti starega naslova po že uspešnem PATCH. Osnutek ne sme neposredno mutirati objekta vira. Ob prehodu na drugo opravilo/projekt obstoječa ključa `taskId` in `project.id` pomagata ločiti stanje, vendar je treba ponastavitev zagotoviti tudi pri ponovnem odprtju urejanja istega opravila. Števci in tabla naj še naprej izhajajo iz istega seznama opravil.

### Dodatni preverljivi scenariji

- **S01 — enaki naslovi in izolacija:** posnemi vseh šest zapisov prek API oziroma testnega stanja. Uredi samo `web-02` (»Pregled vsebine«, `todo`); `web-01` in `launch-01` imata enak naslov in se ne smeta spremeniti. Preveri en PATCH na pravi URL z le dvema ključema, nespremenjena druga polja ter vse ostale zapise. Ponovi za drug projekt. ID-ji so primeri, splošno pravilo velja za poljubne veljavne podatke.
- **S02 — natančni beli znaki:** vhod `" \tŽanov  pregled\r\n"` se pošlje in shrani kot `"Žanov  pregled"`; prazen niz in `" \t\r\n"` pokažeta povezano napako brez PATCH. Vnos `"\u00a0Naslov\u00a0"` ohrani oba nedeljiva presledka; tudi sam `"\u00a0"` je po izrecnem pravilu veljaven. Po neveljavnem vnosu veljaven popravek odstrani napako pred novo oddajo. Preveri telo PATCH, da strežniška normalizacija ne prikrije napačne normalizacije v UI. Če enovrstični kontrolnik odstrani CR/LF še pred obdelavo, normalizacijo vseh štirih znakov dodatno preveri neposredno na funkciji; test naj jasno loči vedenje kontrolnika in pravilo `T`.
- **S03 — prehodi in števci:** preveri `todo→in_progress`, `todo→done`, `in_progress→todo`, `in_progress→done`, `done→todo`, `done→in_progress`. Vsakič preveri stanje API, podrobnosti, vrstico, kartico, poimenovani stolpec in števce; skupno število opravil ostane enako. Dodaj spremembo samo naslova in samo stanja ter ponovno odprtje.
- **S04 — zadržani zapis:** testni program nastavi `POST /__test/next-save` z `{ "mode": "hold" }`, spremeni obe polji in hitro večkrat sproži oddajo. Počakaj na `pending=1` prek `GET /__test/state`. Zahtevana sta porast `saveRequests` za natanko ena ter onemogočena polja/gumba in viden `role="status"`; API, trenutni seznam in števci še kažejo stare vrednosti. Testni program sprosti zahtevo s `POST /__test/release`, `{ "outcome": "success" }`; preveri R05. Ponovi začetek iz table in sprostitev z `reject`. Med odprtim modalnim urejanjem ne zahtevaj uporabniške navigacije do drugega pogleda.
- **S05 — zavrnitev in ponoven poskus:** `POST /__test/next-save`, `{ "mode": "reject" }`; ob poskusu ostanejo vsi zapisi in prikazi enaki, obrazec vsebuje uporabnikov osnutek in jasen `role="alert"`, kontrole so omogočene. Ponovna oddaja istega vnosa uspe, obrazec in napaka izgineta, oba podatka sta shranjena. Isto preveri po zadržani in nato zavrnjeni zahtevi.
- **S06 — preklic in čist začetek:** prekliči veljaven osnutek, nato obrazec z napako naslova in obrazec po zavrnjenem zapisu. Sam preklic ne doda nobene zahteve, ponovno odprtje istega ali drugega opravila pokaže shranjene vrednosti brez starega vnosa ali napak. Pri naslednjem opravilu preveri tudi začetno stanje izbirnega seznama.
- **S07 — nadaljevanje in obstojnost:** po uspehu in po preklicu zapri podrobnosti, preklopi preglednica/tabla, odpri drugo opravilo, izberi drug projekt in se vrni. Po uspehu osveži stran; podatki ostanejo shranjeni. Preveri namizni in telefonski pogled, oznake, dosegljivost kontrol in ohranjen videz. Osvežitev strani ni ponovni zagon strežnika: podatkovna storitev je ob zagonu na novo inicializirana, kar ni predmet spremembe.

### Dejanski pregled izhodišča in načrt zagona

**B01, 17. 9. 2026, faza specifikacije:** začetna aplikacija je bila zagnana z `WEB_PORT=5193 API_PORT=3123 npm run dev`. Kratka skripta Node je prebrala `task/browser.json`, uporabila `chromium.connect(wsEndpoint)` in pregledala DOM v novem kontekstu; izhod je bil zabeležen v seji avtorja. Pri 1440 × 960 je projekt Spletna prenova prikazal tri vrstice ter števce 1/1/1. Podrobnosti `web-01` so pokazale »Pregled vsebine«, »V delu« in nič gumbov »Uredi«. Po čakanju na izris table so bile tri kartice in stolpci Pripravljeno, V delu, Končano; preklop na Jesensko kampanjo je pokazal tri kartice. Pri 390 × 844 je imel panel podrobnosti meje x=0, y=0, širina=390, višina=844, brez vodoravnega širjenja dokumenta. Prvo takojšnje branje table je prehitelo Reactov izris; ponovljena meritev s čakanjem na regijo in tri kartice je potrdila prikaz. To ni bil test nove funkcionalnosti. Pregledani so bili tudi `docs/dizajn.md`, referenčni posnetek obstoječega videza `docs/predogled/podrobnosti.png` in relevantna izvorna koda.

V tej fazi `npm run check` in razvojni testi niso bili zagnani; implementacije še ni. Implementator naj po spremembah izvede `npm run check` (lint, build, 38 osnovnih preverjanj, osem razvojnih in lastni testi). Samo razvojni testi: `npx playwright test --project=development-desktop --project=development-mobile`. Testna infrastruktura uporablja 5174/3102. Zapis izvedbe naj navede ukaz, datum, uspehe/neuspehe in dokaz (izhod, poročilo oziroma sled); uspeh razvojnih testov ne dokazuje vseh R01–R10. Rezultate in dejanska mesta kode implementator zapiše v svojo dokumentacijo, npr. `docs/agent/implementation.md`; specifikacijo ob potrebnih popravkih spremeni prvotni avtor v nadaljevani seji.

## Odprta vprašanja in omejitve

Ni sočasnih sprememb drugih uporabnikov; zavrnjen zapis ne spremeni podatkov. Escape, klik zunaj obrazca, navigacija med odprtim urejanjem, opozorilo ob zapustitvi strani in prijava niso predmet naloge. Zahtevana zaključka urejanja sta »Shrani« in »Prekliči«.

Avtor specifikacije spreminja samo ta dokument in `docs/agent/specification-history.md`; implementator ureja `src/`, lastne teste `tests/agent/` in svoje zapise v `docs/agent/`. Strežnik, skupni tipi, odvisnosti, infrastruktura, začetni podatki in skupni testi ostanejo enaki. UI uporablja javni `/api/`; `/__test/` je dovoljen samo testnemu programu. Ni lokalne nadomestne podatkovne zbirke ali `localStorage`.

Vsebinskih odprtih vprašanj za začetek izvedbe ni. Izraz »obrazec se zapre« je razložen kot vrnitev v podrobnosti istega opravila, skladno z razvojnim testom D02; modalni panel ostane odprt. Popolna matrika novih scenarijev še ni izvedena. Referenčna rešitev in končni testi niso dostopni; ta specifikacija temelji na izvirnih navodilih, dovoljeni kodi in razvojnih testih.

Omejitve okolja: javni internet in drugi projekti niso dovoljeni; uporabljene so bile le lokalne storitve naloge. Po navodilih `chromium.launch()` ni podprt; uporabljen `chromium.connect()` je deloval. Odvisnosti in Chromium so že nameščeni, zato namestitve ali spremembe infrastrukture niso potrebne. Izvoz nima zgodovine Git, zato predaja poteka prek datotek. Noben podagent ni bil zagnan.
