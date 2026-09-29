# Načrt izvedbe P08

2026-09-25. Podlaga: [specifikacija](spec.md), [ustava](../../../.specify/memory/constitution.md) in izvirne [zahteve](../../../task/instructions.md). V tem koraku je izveden samo lokalni pregled in načrtovanje.

## Tehnični kontekst

Obstoječa aplikacija uporablja React 19.3, TypeScript 6, Vite 8.3, `lucide-react` ter navadni CSS. Nameščeni so Playwright 1.63, ESLint in Chromium. `src/App.tsx` vsebuje projektni prikaz in preglednico; `src/TaskBoard.tsx` tablo s tremi stolpci stanj; `src/TaskDetails.tsx` bralne podrobnosti. `src/useResource.ts` in `src/api.ts` že izvajata branje javnega API-ja. `src/navigation.ts` upravlja hash navigacijo. `src/formatDate.ts` že oblikuje datume z izrecnim UTC.

Obstoječi `ProjectView` ima `key={project.id}`. Pri menjavi projekta se ustvari nova instanca, pri preklopu pogleda pa ista instanca ostane. To je ustrezna meja lokalnega stanja iz R01/R09/R10. Tabla že stabilno filtrira opravila po statusu in ohranja ID-je.

Odvisnosti, API, strežnik, skupni tipi, konfiguracija in skupni testi ostanejo obstoječi. Ni novih paketov ali arhitekturnega preurejanja.

## Odločitve in tok podatkov

1. **Koledarski izračun v `src/deadlines.ts` (R02–R05).** Dodamo majhen čist modul s konstanto `2026-09-21`, tipi skupin in preslikavo slovenskih imen. Koledarski dan pretvorimo z izrecnim ISO zapisom `YYYY-MM-DDT00:00:00Z` v celo število dni. Razlika teh števil neposredno določi meje 0, 1, 7 in 8, brez lokalnih časovnih pasov, poletnega časa ali odvisnosti od trenutne ure. Uporabimo predikate iz specifikacije, pri čemer `done` preverimo prvi. Datumi podatkov so po pogodbi veljavni; ne dodajamo popravljanja podatkov.

2. **Tri lokalne vrednosti v `ProjectView` (R01, R08–R10).** `dateInput` hrani vrednost polja, `referenceDate` zadnji veljavni datum, `deadlineFilter` pa `all` ali skupino. Oba datuma se inicializirata s konstanto; filter z `all`. Veljaven neprazen vnos posodobi oba datuma, prazen samo polje. Upoštevamo veljavnost izvornega datumskega vnosa; opozorilo sledi praznemu polju. Stanje ni podrejeno tabli ali preglednici in se ne zapisuje v URL ali shrambo. Obstoječi ključ projekta zagotovi ponastavitev; učinek za sinhronizacijo filtrov ni potreben.

3. **En izračun nad trenutnim odgovorom API-ja (R06–R07, R09).** Iz vseh `tasks` izpeljemo klasifikacijo, pet števcev in stabilno filtrirano zaporedje `visibleTasks`. Ne spreminjamo nalaganega polja ali objektov. Števci uporabljajo celoten projekt; aktivni filter določa le `visibleTasks`. Preglednica izriše `visibleTasks`, tabla prejme isto polje. Obstoječi števci stanj ostanejo izračunani iz vseh opravil. Izpeljanih podatkov ne hranimo kot dodatno stanje.

4. **Kontrole in prazna stanja v `src/App.tsx` (R06–R12).** Nad prikaz opravil dodamo označen datumski vnos, izvorni `select` in pet številskih elementov z zahtevanimi oznakami. Upoštevamo točna besedila iz specifikacije. Kontrole ostanejo vidne tudi ob nič rezultatih. Prazno skupino v nepraznem projektu označimo z zahtevanim sporočilom v obeh pogledih; pri tabli ohranimo tudi obstoječo regijo in stolpce. Za povsem prazen projekt ohranimo obstoječi prazni prikaz in pokažemo pet ničel. Filtrirana prazna preglednica ne sme prikazati sporočila, da je celoten projekt prazen. Bralne podrobnosti še naprej uporabljajo originalni ID in javni API.

5. **Dopolnilni slogi v `src/styles.css` (R12).** Uporabimo obstoječe barve, obrobe, odmike in vidni fokus. Nova vrstica kontrol se prelomi, mreža petih števcev se prilagaja širini, dolga oznaka skupine se lahko prelomi. Pri 390 pikah kontrolam omogočimo krčenje in prelom brez širjenja strani. Obstoječe notranje drsenje preglednice/table, navigacija, kartice in splošni Folio ostanejo.

Tok: javni API → izvorni `tasks` + lokalni `referenceDate` → klasifikacija in števci → filter → isto `visibleTasks` za preglednico in tablo. `dateInput` ločeno določa opozorilo.

## Datoteke in sledljivost

| Datoteka | Predvidena sprememba | Zahteve |
| --- | --- | --- |
| `src/deadlines.ts` (nova) | Konstanta, tipi/oznake, koledarski dnevi, klasifikacija in izpeljava pregleda | R01–R07 |
| `src/App.tsx` | Lokalno stanje projekta, kontrole, števci, skupno filtriranje, prazno sporočilo | R01, R06–R12 |
| `src/styles.css` | Samo slogi dodatnih kontrol, števcev in opozorila | R12 |
| `tests/agent/P08.spec.ts` (nova) | Robni koledarski primeri in uporabniški prehodi, ki dopolnjujejo razvojne teste | R01–R12 |
| `docs/agent/P08/spec.md` | Dejanske povezave na kodo, teste in izide ter zgodovina sprememb | R01–R12 |
| `docs/agent/verification.md` in dnevniki | Jedrnati ukazi, rezultati in omejitve brez podvajanja specifikacije | R01–R12 |

`TaskBoard`, `TaskDetails`, API, navigacija in oblikovanje datumov predvidoma ne potrebujejo sprememb; njihovo obstoječe vedenje vključimo v regresijo.

## Preverjanje izvedbe

Obstoječa konfiguracija samodejno vključuje `tests/agent/**/*.spec.ts`. Skupni projekti preverjajo API ter Folio na namizju in mobilni napravi; razvojna projekta izvajata štiri priložene teste P08 na obeh velikostih. Testni strežnik in povezava z nameščenim Chromiumom sta že konfigurirana. Konfiguracije ne spreminjamo.

Lastni testi dopolnijo, ne prepišejo štirih razvojnih primerov:

- Tabelarični koledarski primeri z vnaprej določenimi pričakovanji: `done` pri različnih rokih, odmiki −1/0/1/7/8, konec meseca, leta, prestopni februar in stoletno pravilo; preverjanje disjunktnosti in popolnosti skupin (S02–S05).
- Uporabniški pregled z več kot deset opravili, enakimi naslovi, Unicode besedilom in premešanimi ID-ji: vseh šest filtrov, izvorni vrstni red, pet nespremenjenih števcev, isti ID-ji table in preglednice (S01, S06–S07, S09).
- Veljaven → prazen → preklop pogleda → veljaven datum ob aktivnem filtru, nato menjava projekta, vrnitev in osvežitev. Preverimo opozorilo, zadnji veljavni preračun, ponastavitev ter odsotnost filtra v URL-ju in trajni shrambi (S08–S10).
- Prazna projekta in prazna skupina nepraznega projekta v obeh pogledih; prehod nazaj na `all` (S11).
- Časovna pasova `Europe/Ljubljana` in `America/New_York` prek možnosti testnega konteksta, koledarski robovi in prehodi poletnega časa; začetni datum pri drugačni uri naprave (S01, S05).
- Ohranitev podatkov in bralnih podrobnosti po ID-ju, spremljanje zapisovalnih zahtev ter preverjanje 390 pik, oznak in vidnega fokusa (S12). Testi lahko uporabijo obstoječi javni testni pripomoček za nadzorovane GET odgovore; aplikacija ga ne uvaža.

Predvideni glavni ukaz je `npm run check` (lint, preverjanje tipov, produkcijska gradnja in celoten Playwright nabor). Za razreševanje posamezne napake uporabimo ciljno `npm test -- --project=agent` ali ustrezni obstoječi projekt. Dnevnike shranimo v `docs/agent/P08/`; dejanski izhod in uspeh ukaza zapišemo šele po zagonu. Ne ponavljamo uspešnih preverjanj brez spremembe ali ugotovljenega razloga.

## Meje, tveganja in predaja

Načrt je skladen z ustavo in vsemi R01–R12. Ne predvideva dodatnih funkcionalnosti, odvisnosti ali sprememb infrastrukture. Najpomembnejši tveganji sta izguba zadnjega veljavnega datuma ob praznem vnosu in napačna ponastavitev pri preklopu pogleda; rešujeta ju ločeno stanje vnosa ter obstoječa meja projekta. Koledarske napake preprečimo z izrecnim UTC in preverjenimi robnimi primeri.

Implementacija in funkcionalni testi v fazi načrta niso izvedeni. Končni testi niso dostopni. Naslednji izvajalnikov korak lahko iz tega načrta pripravi naloge; v tem turnu jih ne ustvarjamo in ne implementiramo.
