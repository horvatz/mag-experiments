# P06 — izvedbeni načrt

2026-09-23. Podlaga: [specifikacija](spec.md), [izvirne zahteve](../../../task/instructions.md), [ustava](../../../.specify/memory/constitution.md) in [dizajn Folio](../../dizajn.md). V tem koraku ni implementacije ali zagona aplikacijskih testov.

## Tehnični kontekst in ugotovitve pregleda

Nameščeni so React 19.3, TypeScript 6, Vite 8, lucide-react in Playwright 1.63; Node je 24.11. Obstoječi `npm run check` izvede lint, preverjanje tipov, gradnjo in Playwright. Konfiguracija že vključuje projekt `agent` za `tests/agent/**/*.spec.ts`, skupne teste in razvojne teste P06 na namizju in mobilni napravi. Chromium je dostopen prek obstoječe konfiguracije; te ne spreminjamo.

`src/App.tsx` vsebuje `ProjectView`, ki prek `useResource` bere celotno zaporedje opravil iz javnega API-ja. `ProjectView` je že vezan na `key={project.id}`. Preklop pogleda spreminja lastnost `view`, ohrani pa isto instanco projekta. Preglednica, tabla in povzetki uporabljajo isto polje opravil. To omogoča zahtevano življenjsko dobo nastavitev brez spreminjanja navigacije, nalaganja ali skupnih tipov.

## Odločitve in potek podatkov

1. **Čista pretvorba v `src/csv.ts` (R01, R02, R04, R06–R09, R12).** Določimo nespremenljivo zaporedje sedmih kolon, iz njega izpeljan tip kolone ter tip ločila in filtra. Funkcija `serializeCsv` prejme `readonly Task[]`, izbrane kolone, ločilo in filter. Kolone uredi po kanoničnem zaporedju, vrstice stabilno filtrira, ne sortira in ne spreminja vhodov. Vrne CSV ali `null`, kadar ni kolon oziroma ustreznih vrstic. Formula se nevtralizira pred navedbo vsake podatkovne celice z natanko `^[ \t\r\n]*[=+@-]`; glava se samo navede. Nizi se ne obrezujejo ali oblikujejo; interni status in izvorni datum se neposredno izvozita. Zapis se začne z BOM in vsaka zunanja vrstica konča s CRLF, vključno z zadnjo.
2. **Lokalno stanje v `src/CsvExport.tsx` (R01–R04, R10, R11).** Komponenta prejme `projectId` in izvorna opravila; hrani izbrane kolone, ločilo in filter z React `useState`. Začetne vrednosti so vse kolone, `;`, `all`. Komponenta je v `ProjectView` pred pogojnim izrisom preglednice/table, zato ostane nameščena ob preklopu pogleda. Obstoječi ključ projekta jo ob menjavi projekta ponovno ustvari; osvežitev prav tako obnovi privzete vrednosti. Ne potrebujemo učinka za ponastavitev, konteksta, URL-parametrov ali trajne shrambe.
3. **Izvoz ob kliku (R03, R05, R07, R11, R12).** Omogočenost gumba izhaja iz izbranih kolon in obstoja vrstice za filter. Obdelovalnik znova uporabi trenutne nastavitve in `serializeCsv`; pri `null` ne naredi ničesar. Sestavi `Blob` tipa `text/csv;charset=utf-8` brez pretvarjanja prelomov, ustvari object URL in začasno povezavo z atributom `download="folio-<projectId>.csv"`, sproži prenos ter povezavo odstrani. Object URL po sprožitvi asinhrono sprosti. Noben `fetch`, novo okno ali zapis API ni potreben.
4. **Integracija v `src/App.tsx` (R04, R10–R12).** Dodamo eno komponento kontrol v obstoječi razdelek opravil, ko so podatki na voljo, tudi za prazno polje. Originalni `tasks` ostane vhod za preglednico, tablo, števec in povzetke; filter izvoza se uporablja samo pri izvozu. Nalaganje, napake, podrobnosti, dostopna imena in `data-task-id` ostanejo ohranjeni.
5. **Slog v `src/styles.css` (R12 in dogovor o vmesniku).** Kontrole so kompaktna skupina nad prikazom: `fieldset` z legendo za kolone, označena izvorna HTML selecta in gumb `Izvozi CSV`. Checkboxi imajo točna dostopna imena `Stolpec <ime>`. Uporabimo obstoječe barvne spremenljivke, robove, zaoblitve, razred gumba in pravilo vidnega fokusa. Kontrole se prelamljajo znotraj razpoložljive širine; ne spreminjamo osnovne postavitve Folia ali drsenja table/preglednice.

Pot podatkov: javni API → obstoječi `useResource` → izvorni `tasks` → obstoječi prikaz in ločeno `CsvExport` → čista pretvorba → lokalni prenos. Testne kontrole niso del aplikacije.

## Datoteke in preverjanje

| Datoteka | Načrtovana sprememba / dokaz |
| --- | --- |
| `src/csv.ts` | Tipi in kanonične kolone, nevtralizacija in navedba celice, `serializeCsv`. |
| `src/CsvExport.tsx` | Kontrole, lokalne nastavitve, omogočenost in prenos s sprostitvijo URL-ja. |
| `src/App.tsx` | Uvoz in umestitev kontrol v `ProjectView`. |
| `src/styles.css` | Lokalni razredi kontrol, prelamljanje in uskladitev s Foliom. |
| `tests/agent/csv.spec.ts` | Čista pretvorba: natančni pričakovani nizi/bajti, kanonični vrstni red, obe ločili, notranji CR/LF/CRLF in narekovaji, Unicode, prazni primeri, vsi sprožilci formule in negativni primeri, zamrznjeni vhodi. |
| `tests/agent/export.spec.ts` | Prenosi in stanje prek Playwright: izklop/vklop kolon, vsi filtri, prazna projekta, vsaj 13 preurejenih opravil z enakimi naslovi, drugi projekt, preklop pogleda, ponastavitev in ponovljeni prenosi, odsotnost zapisov/novih strani ter širina 390 pik. |
| `docs/agent/P06/spec.md` | Po implementaciji dopolnitev sledljivosti R01–R12 z dejanskimi funkcijami, testi in izidi; dopolnitev zgodovine. |
| `docs/agent/P06/validation.md` in dnevniki | Kratek zapis ukazov, dejanskih rezultatov, pregleda dizajna in omejitev; povezave na dokaze brez podvajanja specifikacije. |

Testi lahko uporabljajo obstoječi razvojni pripomoček za nadzorovane GET odgovore; uporablja ga samo testna koda. Pričakovani izvozi ne smejo biti izračunani z isto funkcijo, ki jo preverjamo. Surovi bajti prenosa potrdijo BOM; ročno zapisani pričakovani primeri potrdijo nevtralizacijo, navedbo in prelome. Za pravilo vseh kolon lahko čista funkcija za celico preveri poljubni niz, medtem ko integracijski podatki ohranijo veljavne statuse in datume.

Najprej izvedemo lastne teste `npx playwright test --project=agent`; odpravimo ugotovljene napake. Nato izvedemo `npm run check` in shranimo dnevnik z dejansko izhodno kodo. Ta zajame skupne API/regresijske teste, razvojne D01–D04 v obeh velikostih in lastne teste. Posnetka pri 390 pikah in na namizju skupaj s pregledom potrdita umestitev kontrol in ohranitev Folia. Neuspehe, neizvedene scenarije in nedostopne končne teste jasno navedemo. Končnih testov ne štejemo kot opravljenih.

## Zaporedje in omejitve

Izvedba sledi odvisnostim: pretvorba in njeni testi → kontrole in integracija → slogi in testi stanja/prenosov → celotno preverjanje → sledljivost in predaja. Vse opravi isti agent zaporedno; veščina za naloge pozneje razčleni ta načrt.

Načrt je skladen z ustavo: brez novih odvisnosti, infrastrukturnih sprememb, vej, commitov, zapisovalnih API-jev ali arhitekturne preureditve. Ne spreminja strežnika, skupnih tipov, testov, nastavitev, uradnih predlog ali veščin. Bistvenih neznank ni. Glavni mesti preverjanja sta življenjska doba stanja ob preklopu in natančna ohranitev bajtov; oboje je pokrito z navedenimi scenariji iz specifikacije.
