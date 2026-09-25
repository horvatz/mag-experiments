# P06 — Načrt izvedbe

Datum pilota: 2026-09-25 · Stanje: načrt, brez implementacije

## Tehnični kontekst

Obstoječa aplikacija uporablja React 19.3, TypeScript 6, Vite 8 in `lucide-react`; nameščeni Playwright 1.63 uporablja obstoječi Chromium prek konfigurirane povezave. Novih odvisnosti ne potrebujemo. [Specifikacija](spec.md) določa vsa pravila R01–R12, predikate in scenarije S01–S08; [projektna načela](../../../.specify/memory/constitution.md) in [izvirne zahteve](../../../task/instructions.md) ostajajo merilo.

Lokalno pregledano izhodišče:

- `src/App.tsx`: `ProjectView` naloži opravila prek `useResource`; celotno polje uporablja za povzetek, preglednico in tablo. `App` že uporablja `key={project.id}` za projektni pogled.
- `src/useResource.ts` in `src/api.ts`: obstoječi GET tok, nalaganje, napaka in ponovitev; za izvoz jih ni treba spreminjati.
- `src/TaskBoard.tsx`: razvrstitev prikaza po stanju; izvoz ne sme uporabljati vrstnega reda kartic v DOM-u.
- `shared/types.ts`: obstoječa tipa `Task` in `TaskStatus`, vsa izvozna polja so nizi; datoteka ostane nespremenjena.
- `src/styles.css` in `docs/dizajn.md`: obstoječe barvne spremenljivke, nevtralne površine, modra dejanja, zaobljeni robovi, viden fokus in notranje drsenje.
- `playwright.config.ts`: že vključuje projekte za skupne, razvojne in agentove teste. `tests/development/P06.spec.ts` ima štiri osnovne scenarije; ne pokriva vseh robnih pogojev.

## Odločitve in odgovornosti

### Serializacija in podatkovni tok

V `src/csv.ts` dodamo majhno čisto funkcijo za ustvarjanje CSV ter kanonični seznam kolon. Uporabi obstoječi `Task`, lasten tip dovoljene kolone, ločila in izvoznega filtra. Sprejme samo bralno polje opravil in trenutne nastavitve. Izbrane kolone projicira po kanoničnem seznamu; vrstice stabilno filtrira po stanju. Noben `sort`, mutacija opravila ali ponovna uporaba lokaliziranega prikaznega besedila ni potrebna.

Serializacija neposredno sledi funkcijam `N`, `Q` in `CSV` iz specifikacije: nevtralizacija vseh podatkovnih celic pred podvajanjem narekovajev, vedno navedene glave/vrednosti, izbrano ločilo, BOM ter CRLF po vsakem zapisu. Regex uporabi samo `[ \t\r\n]`, ne splošnega `\s` in ne `trim`. Funkcija pri nič kolonah ali nič ustreznih vrsticah vrne prazen rezultat, ki ne sproži prenosa. To omogoča preverjanje robnih primerov brez odvisnosti od DOM-a.

### Kontrole, stanje in prenos

V `src/CsvExport.tsx` dodamo komponento s props `projectId` in naloženimi opravili. V njej so lokalne nastavitve: vse kolone, podpičje, `all`. Kontrole uporabljajo točna dostopna imena in HTML elemente iz specifikacije. Checkboxi spreminjajo izbor nespremenljivo; gumb uporablja predikat `enabled`, varovalo velja tudi v obdelovalniku klika. Vsak klik serializira trenutne props in stanje, zato zaporedni izvozi ne uporabljajo zastarelih nastavitev.

Komponenta je v skupnem delu `ProjectView`, znotraj uspešno naloženih opravil in zunaj vejitve Preglednica/Tabla. Zato preklop pogleda ne odstrani njenega stanja. Obstoječi `key={project.id}` ponastavi stanje ob vsaki menjavi projekta; osvežitev ga naravno ustvari na novo. Ni shrambe v `localStorage`, URL-ju ali globalnem stanju.

Prenos uporablja `Blob` tipa `text/csv;charset=utf-8`, `URL.createObjectURL` in začasen element `a` z atributom `download="folio-<projectId>.csv"`. Element se po kliku odstrani; URL se po začetku prenosa sprosti z odloženim `URL.revokeObjectURL`, da ne prekine prenosa. Vsebina se ne pošlje na omrežje; ne uporabljamo nove strani ali zapisovalnega API-ja.

### Umestitev v Folio

V `src/App.tsx` dodamo izvozno komponento pod naslov in preklop pogledov, pred vsebino preglednice/table. Celotni `tasks` ostane vhod za oba prikaza, povzetek in podrobnosti; izvozna komponenta filtrira samo svoj izhod. Obstoječi `data-task-id`, dostopna imena in povezave se ohranijo.

V `src/styles.css` dodamo omejene razrede za izvozne kontrole: nevtralna površina, obstoječe spremenljivke, prelomi vrstic v skupini checkboxov in izbirnikov, `min-width: 0` tam, kjer ga potrebuje vsebnik. Pri 390 pikah se kontrole zložijo; ne spreminjamo osnovne postavitve ali notranjega drsenja pogledov. Uporabimo obstoječi slog gumba in viden fokus. Nova dejanja niso del povezav opravil.

## Datoteke in pokritost

| Datoteka | Načrtovan poseg | Zahteve |
| --- | --- | --- |
| `src/csv.ts` | Kanonične kolone, stabilni filter, čista serializacija in prazni rezultat | R01–R09, R12 |
| `src/CsvExport.tsx` | Dostopne kontrole, lokalne nastavitve, omogočenost in lokalni prenos | R01–R05, R10–R12 |
| `src/App.tsx` | Vključitev v skupni del projektnega pogleda | R04, R10–R12 |
| `src/styles.css` | Odzivne kontrole v potrjenem slogu | R12 in dogovor o vmesniku |
| `tests/agent/P06.spec.ts` | Dodatni testi serializacije, brskalniških prenosov in prehodov stanja | R01–R12, S01–S08 |
| `docs/agent/P06/spec.md` | Posodobitev obstoječe matrike s kodo, testi, rezultati in zgodovino | Sledljivost R01–R12 |
| `docs/agent/P06/validation.md` in dnevniki v isti mapi | Kratko dokazilo dejansko izvedenih preverjanj in omejitev | Predaja po skupni predlogi |

## Preverjanje

1. **Čista serializacija v agentovih Playwright testih:** ročno določeni pričakovani nizi/bajti za obe ločili, prazne celice, narekovaje, Unicode, začetne/končne presledke ter notranje CR/LF/CRLF. Preverimo vse sprožilce formul in dovoljene začetne znake, varne podobne nize, kanonični vrstni red, interne statuse in datume. Zamrznjena vhodna opravila/polje ter primerjava pred/po preverita odsotnost mutacij. Pričakovane vsebine ne izračunavamo z implementacijo, ki jo preverjamo.
2. **Brskalniški testi s testnim nadzorom GET:** prenesene bajte beremo iz Playwrightovega toka prenosa, da ohranimo BOM in CRLF. Preverimo nič kolon/ponovni izbor, vse filtre in prazne rezultate, 0/1/več kot 10 opravil z drugačnimi ID-ji in ponovljenimi naslovi, enakost obeh pogledov, ponastavitve ter zaporedne prenose. Spremljamo omrežne zapise in nove strani, ohranitev vidnih opravil/povzetka/podrobnosti ter širino 390 pik. Testni pripomoček sme uporabiti samo testni program.
3. **Skupna regresija in razvojni testi:** izvedemo `npm run check`, ki zažene lint, TypeScript/build in vse projekte Playwright (API, izhodišče na namizju/mobilno, razvojni P06 na obeh in agentove teste). Med razvojem lahko najprej uporabimo `npm test -- --project=agent`; po popravkih ponovimo relevantne neuspele preizkuse in zahtevana preverjanja.
4. **Dokazi:** shranimo izhod ukazov v `docs/agent/P06/`, v `validation.md` navedemo ukaz, izid, število testov in omejitve; obstoječa matrika specifikacije poveže posamezne R z dejanskimi testi in kodo. Morebitni posnetki dizajna sodijo v isto dokumentacijsko mapo. Nedostopnih končnih testov ne označimo kot izvedenih.

## Vrstni red, tveganja in omejitve

Izvedba: serializacija → kontrole in integracija → slogi → dodatna preverjanja → skupno preverjanje in dopolnitev dokazov. Naloge se razčlenijo v naslednjem koraku; ta dokument ne izvaja implementacije.

Glavna tveganja so izguba BOM pri branju testnih datotek, napačna nevtralizacija zaradi preširokega razreda presledkov, vezava izvoza na vrstni red table, izguba nastavitev ob preklopu in preširoke kontrole na mobilnem zaslonu. Načrt jih preverja z bajti, izvirnim poljem API, skupno komponento in merjenjem širine strani. Brskalnikov preklic prenosa ne uvaja sprememb stanja; obstoječe obravnavanje nalaganja in napak ostane enako.

Ni bistvenih odprtih vprašanj. Spreminjajo se samo dovoljene aplikacijske/testne/dokumentacijske datoteke. Strežnik, API, skupni tipi/testi, konfiguracija, odvisnosti in uradni viri ostanejo nespremenjeni. Ta faza je opravila pregled lokalnega izhodišča; aplikacijski testi še niso bili izvedeni.
