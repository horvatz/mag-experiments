# Načrt izvedbe P08

**Datum:** 2026-09-23. **Stanje:** izvedeno; rezultati v [dokazilih](../verification.md).

Načrt izvaja [specifikacijo](spec.md) in vseh R01–R12 iz [izvirnih navodil](../../../task/instructions.md). Skupna predloga, predikati, sprejemni pogoji in začetna sledljivost so v specifikaciji; tukaj jih ne podvajamo.

## Tehnični kontekst

- Obstoječa aplikacija: React 19, TypeScript 6, Vite 8, CSS in `lucide-react`; nameščeni Node 24 in Playwright s Chromiumom. Novih odvisnosti ne potrebujemo.
- `src/App.tsx`: `ProjectView` pridobi opravila z `useResource`, prikaže števce stanj, preglednico in `TaskBoard`. Starš ga že označi s `key={project.id}`; menjava projekta zato ponastavi lokalno stanje. Sprememba pogleda istega projekta ga ne odmontira.
- `src/TaskBoard.tsx`: obstoječi stolpci stanj in stabilno filtriranje vhodnega zaporedja. Sprejme isti filtrirani seznam kot preglednica.
- `src/navigation.ts`, `src/api.ts`, `src/useResource.ts`, `src/TaskDetails.tsx` in skupni tipi ostanejo uporabljeni po obstoječem dogovoru. `src/formatDate.ts` že oblikuje koledarski datum v UTC.
- `src/styles.css` vsebuje potrjeno postavitev, slogovne spremenljivke, vidni fokus ter notranje drsenje. Dodamo samo sloge novih kontrol in števcev.

## Izvedbene odločitve

### Koledarska logika in podatki — R02–R07, R12

V `src/deadlines.ts` dodamo majhne čiste funkcije za razvrščanje, števce in stabilno filtriranje. Uporabimo obstoječi tip `Task`, konstanto `2026-09-21`, ključe skupin ter slovenska imena. Rok in referenco pretvorimo iz izrecnega `YYYY-MM-DDT00:00:00Z` v zaporedni dan UTC; razlika celih dni določi predikate iz specifikacije. Tako ni lokalnega časovnega pasu, DST ali seštevanja milisekund lokalnemu polnočnemu času. Prednostno obravnavamo `status === 'done'`.

Števce izpeljemo iz vseh opravil projekta, vidne podatke pa iz istih opravil in aktivne skupine. Ne sortiramo in ne spreminjamo izvornega seznama ali opravil. Izpeljane podatke izračunamo med izrisom; ločena shramba in učinki za sinhronizacijo niso potrebni. Obseg ne zahteva dodatne optimizacijske infrastrukture.

### Življenjski cikel stanja — R01, R08–R10

V `ProjectView` hranimo trenutno vrednost datumskega polja, zadnji veljavni referenčni datum in aktivni filter. Inicializacija uporabi fiksni datum in `all`. Veljaven vnos posodobi oba datuma; prazen vnos spremeni samo vsebino polja. Opozorilo izpeljemo iz veljavnosti polja. Brskalnikov datum in koledarsko veljavnost preverimo pred spremembo reference.

Stanje ostane nad obema prikazoma, zato preklop pogleda ohrani tudi prazno vsebino in zadnji veljavni izračun. Obstoječi ključ projekta ter nova namestitev aplikacije ob osvežitvi izvedeta zahtevano ponastavitev. Ne spreminjamo URL-ja ali uporabljamo trajne shrambe za datum oziroma skupino. Obstoječi URL parameter prikaza table ostane obstoječa navigacijska funkcija.

### Vmesnik in Folio — R06–R09, R11–R12

V obstoječi razdelek opravil dodamo označena `input type=date` in `select`, opozorilo ter pet števcev rokov. Številski element vsakega števca ima točen `aria-label="Število rokov <ključ>"`; besedilna oznaka je ločena. Obstoječi pregled stanj še naprej šteje celoten projekt.

Preglednica izriše filtrirano zaporedje, tabla ga prejme kot `tasks`. Prazno skupino v nepraznem projektu označimo s predpisanim sporočilom in ohranimo dostopne kontrole. Tabla ohrani svojo regijo in stolpce tudi brez zadetkov; prazen projekt ohrani obstoječo predstavitev in dobi pet ničel. `data-task-id`, povezave opravil, bralne podrobnosti in dostopna imena ostanejo ohranjeni.

Kontrole se prelamljajo, števci uporabljajo prilagodljivo mrežo in obstoječe barve, robove ter tipografijo. Na 390 pik ne nastane vodoravno drsenje celotne strani. Novega dejanja znotraj povezave opravila ne dodajamo.

## Datoteke in zaporedje izvedbe

| Korak | Datoteke | Namen in pokritost |
| --- | --- | --- |
| 1 | `src/deadlines.ts` | Koledarski dnevi, skupine, nespremenljivi števci in stabilno filtriranje; R02–R07. |
| 2 | `src/App.tsx` | Stanje projekta, kontrole, opozorilo, števci, oba filtrirana pogleda in prazna stanja; R01, R06–R12. |
| 3 | `src/styles.css` | Prilagodljiv prikaz kontrol in števcev v slogu Folio; R12. |
| 4 | `tests/agent/P08.spec.ts` | Dodatni neodvisni scenariji in robovi, ki jih razvojni testi ne pokrijejo. |
| 5 | `docs/agent/P08/spec.md`, `docs/agent/verification.md` | Posodobljena sledljivost vseh zahtev, dejanski rezultati in omejitve. Dnevniki pod `docs/agent/P08/`. |

Poseg v `TaskBoard.tsx` ni predviden: obstoječi vhod `tasks` že omogoča zahtevano filtriranje. Če izvedba pokaže nujen manjši popravek v `src/`, ga zabeležimo v načrtu in sledljivosti. Drugih datotek ali infrastrukture ne spreminjamo.

## Načrt preverjanja

Uporabimo obstoječo konfiguracijo Playwright, povezavo do nameščenega Chromiuma in upravljani razvojni strežnik. Ukaz `npm run check` izvede lint, preverjanje tipov, gradnjo in celotni razpoložljivi nabor testov. Dnevnike shranimo v `docs/agent/P08/`; napake popravimo in ponovimo ustrezna preverjanja.

Razvojni P08 testi D01–D04 že preverjajo fiksno referenco, zapadla opravila, vključujočo tedensko mejo, prazen datum ter zaključena opravila na tabli brez zapisov. Teh datotek ne spreminjamo. Lastni testi v `tests/agent/` uporabijo javni testni pripomoček samo v testnem programu in dodajo:

- S1/S2/S4: drugačno uro naprave, vse skupine in njihove števce, roke −1/0/+1/+7/+8 ter zaključena opravila z različnimi roki; preurejene enkratne ID-je, ponovljene naslove, več kot deset opravil in vrstni red.
- S3: koledarske meje meseca in leta, prestopni februar ter prehod DST v različnih časovnih pasovih; pričakovani rezultati so določeni v testnih podatkih, ne izračunani s produkcijsko funkcijo.
- S5/S6: veljaven → prazen → preklop prikaza → veljaven datum, ohranjen filter in enaki ID-ji; menjava projekta in osvežitev; brez filtrskih podatkov v URL ali shrambi.
- S7/S8: prazen projekt in prazna skupina v obeh pogledih, vrnitev na `all`, bralne podrobnosti, nespremenjeni podatki, brez zapisovalnih zahtev na API ter širina 390 pik. Vizualni pregled ohranitve Folio podpre posnetek zaslona.

Skupni testi API-ja in izhodiščnega vmesnika preverijo regresije. Končni nedostopni testi niso del trditve o uspehu. Sledljivost v specifikaciji po izvedbi poveže vsako zahtevo s točnim testom, delom kode in dnevnikom; dejanski izidi so povezani v specifikaciji in osrednjem dokazilu.

## Skladnost in omejitve

Načrt je skladen z ustavo: en agent, lokalno raziskovanje, brez vej, commitov, novih odvisnosti, strežniških sprememb ali testnih kontrol v aplikaciji. Obstoječi javni API zadošča; pogodbe in podatkovne migracije niso potrebne. Vsa razrešena pojasnila so v specifikaciji. Bistvenih odprtih vprašanj ni. Celoten preostali potek ostaja znotraj skupnega časovnega proračuna, zadnja minuta je namenjena predaji.

## Zabeleženo odstopanje ob izvedbi

Po izrecnem navodilu koraka implementacije je osrednje dokazilo `docs/agent/verification.md` namesto prvotno načrtovanega `docs/agent/P08/validation.md`. Funkcionalna zasnova in obseg datotek sta ostala enaka.
