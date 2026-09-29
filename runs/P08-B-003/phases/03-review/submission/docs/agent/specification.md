# P08 – Koledarski pregled rokov

Predaja v1.0, 2026-09-25. Navodila `task/instructions.md` so obvezna v celoti. Specifikacija temelji na prebrani kodi in testih; aplikacija, testi in vizualni pregled v tej vlogi niso bili zagnani. Zgodovina: [specification-history.md](specification-history.md).

## Problem in kontekst

Obstoječi Folio dopolnimo z lokalnim koledarskim pregledom rokov trenutnega projekta. Ohranimo slovenski vmesnik, obstoječi dizajn, preglednico, tablo in bralne podrobnosti. Podatki ostanejo v javnem `/api/`; novi pregled ne zapisuje podatkov.

## Vhodi, dejanja in izidi

Podatki iz `shared/types.ts`: `Project { id, name }`; `Task { id, projectId, title, description, status, assignee, dueDate }`. Vsa polja razen statusa so nizi; `status` je `todo | in_progress | done`. Odprto pomeni `status !== 'done'`. `dueDate` je veljaven koledarski `YYYY-MM-DD`, tudi prestopni; manjkajoči ali neveljavni roki niso del podatkovne domene.

API: `GET /api/projects`, `GET /api/projects/:id/tasks` in obstoječi `GET /api/tasks/:id` za podrobnosti. Izbiramo po ID-ju, s kodiranjem segmentov poti. Seznam je lahko prazen, z enim ali več kot deset opravili, drugačnim vrstnim redom in novimi ID-ji; podvojeni naslovi niso identiteta. Besedila z Unicode znaki in ločili ostanejo navadno besedilo.

Lokalno stanje projekta označimo `(x, a, f)`: `x` je trenutna vrednost datumskega polja, `a` zadnji veljavni referenčni datum in `f` filter. Začetek projekta in osvežitev nastavita `('2026-09-21', '2026-09-21', 'all')`. Ob veljavnem vnosu `d` stanje postane `(d, d, f)` in opozorilo izgine. Prazen vnos nastavi `('', a, f)` ter opozorilo; števci in vrstice še vedno uporabljajo `a`. Menjava filtra spremeni samo `f`; preklop preglednice/table ohrani celotno trojico, tudi prazen `x`. Ponovni obisk projekta ne obnovi njegove prejšnje trojice.

Ni potrditve ali shranjevanja filtra. Odpiranje in zapiranje obstoječih bralnih podrobnosti (tudi Escape) ne spreminja projektnega stanja. Napake nalaganja ohranijo obstoječi prikaz in možnost ponovnega poskusa iz `useResource`/`LoadError`; ne nadomeščamo jih s praznim projektom.

Dogovor vmesnika je obvezen:

- `input type="date"` z dostopno oznako `Referenčni datum`; HTML `select` z oznako `Pogled rokov` in vrednostmi `all/overdue/today/week/later/done`.
- Imena petih skupin so `Zapadlo`, `Danes`, `Naslednjih 7 dni`, `Pozneje`, `Končano`. Oznaka za `all` ni predpisana; smiselno `Vsa opravila`.
- Natanko pet števcev rokov: vsak ima `aria-label="Število rokov <ključ>"` in besedilno vsebino samo števila. Ime skupine je ločeno od številske vsebine.
- Prazen datum: `role="alert"` in `Vnesi veljaven referenčni datum.`; prazna skupina nepraznega projekta: `Ni opravil v izbrani skupini.` v obeh pogledih. Kontroli ostaneta uporabni.
- Ostanejo `data-task-id` na vrsticah/karticah, dostopna imena `Preglednica`, `Tabla`, `Tabla opravil`, stolpci `Pripravljeno`, `V delu`, `Končano` in obstoječi `aria-label="Pregled stanj opravil"`. Obstoječi trije števci stanj ostanejo ločeni od petih števcev rokov. Morebitna nova dejanja ob opravilu so zunaj njegove povezave.

## Zahteve in pravila

Naj bo `T` zaporedje vseh opravil trenutnega projekta v vrstnem redu API-ja, `a ⊕ n` datum po `n` koledarskih dnevih in `G(t,a)` skupina opravila. Primerjava datumov je koledarska; za normalizirane veljavne nize `YYYY-MM-DD` je primerjava po nizu enakovredna kronološki.

```text
G(t,a) = done     če t.status = done (prednost pred vsemi roki)
         overdue če t.status ≠ done in t.dueDate < a
         today   če t.status ≠ done in t.dueDate = a
         week    če t.status ≠ done in a < t.dueDate ≤ a ⊕ 7
         later   če t.status ≠ done in t.dueDate > a ⊕ 7
C[g] = število t v T, za katere G(t,a) = g
V(T,a,f) = T, če f = all; sicer stabilni filter T po G(t,a) = f
```

Za vsako opravilo velja natanko ena skupina; vsota petih `C[g]` je `T.length`. `C` ni odvisen od `f`. Preglednica prikazuje `V` v izvornem vrstnem redu. Tabla ohrani tri obstoječe stolpce stanj; vsak vsebuje stabilno podzaporedje `V` tega stanja. Množici vidnih ID-jev sta enaki; globalni DOM-vrstni red table zaradi stolpcev ni nujno enak preglednici. Pri vseh lokalnih dejanjih velja `T_po = T_pred` za vsa polja in ni zapisovalne zahteve.

Koledarsko seštevanje mora delovati čez mesec, leto in prestopni februar brez lokalnega časovnega pasu ali DST. Izvedba je prosta (npr. pravilna UTC aritmetika ali čista koledarska funkcija); ne uporabljaj trenutne ure kot privzetega datuma niti lokalnega dodajanja 24 ur kot definicije koledarskega dne.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Ob začetku projekta datum `2026-09-21`, filter `all`, neodvisno od ure naprave. | Vstop v projekt in osvežitev. |
| R02 | `done` je vedno samo v `done`. | Končana opravila z različnimi roki. |
| R03 | Odprti rok pred datumom → `overdue`; enak → `today`. | Mejni datumi. |
| R04 | Odprti rok od +1 do vključno +7 → `week`; pozneje → `later`; skupine razdelijo vsa opravila. | +1, +7, +8, vsota števcev. |
| R05 | Koledarska aritmetika `YYYY-MM-DD`, neodvisna od pasu in DST. | Meje meseca, leta in prestopni februar. |
| R06 | Pet števcev vedno šteje celoten projekt. | Filtriranje ne spremeni števcev. |
| R07 | `Pogled rokov` filtrira po skupini, ohrani izvorni vrstni red in podatke. | Vseh šest izbir in izvorni ID-ji. |
| R08 | Veljavni datum takoj preračuna ob ohranitvi filtra; prazno polje opozori in ohrani zadnji veljavni preračun. | Veljaven → prazen → veljaven vnos. |
| R09 | Preglednica in tabla prikazujeta iste filtrirane ID-je; preklop ohrani datum, besedilo polja in filter. | Preklopi tudi med praznim vnosom. |
| R10 | Menjava projekta in osvežitev ponastavita datum in filter; stanje ni v trajni shrambi ali URL-ju. | Menjava projektov in reload. |
| R11 | Prazen projekt: pet ničel. Prazna skupina: `Ni opravil v izbrani skupini.` in delujoč izbirnik. | Prazen projekt ter prazna skupina nepraznega projekta. |
| R12 | Podatki ostanejo nespremenjeni, samo bralni API, obstoječi dostopni Folio je prilagodljiv. | Regresije, omrežne zahteve, širina 390 px. |

## Izvedba in sledljivost

Prebrane točke vključitve: `src/App.tsx:ProjectView` pridobi celoten `Task[]`, izračuna obstoječe števce stanj in izbira preglednico/tablo. `App` že uporablja `key={project.id}` za `ProjectView`, kar omogoča ponastavitev lokalnega stanja ob menjavi projekta ter ohranitev ob spremembi `view`. Skupno klasifikacijo, števce in filtrirano zaporedje izračunaj pred razcepom obeh pogledov; pomožno funkcijo je mogoče dodati znotraj `src/`. `src/TaskBoard.tsx:TaskBoard` že stabilno filtrira po statusih. `src/formatDate.ts` že izrecno prikazuje datume v UTC in ostane skladen z obstoječim prikazom.

Spodaj so sprejemni scenariji, ne trditve o uspešnih testih:

- **S01 – meje in particija:** pri `a=2026-09-21` odprti roki `09-20/09-21/09-22/09-28/09-29` istega leta pripadajo `overdue/today/week/week/later`. Dodaj `done` v preteklosti, na referenčni datum in v prihodnosti; vsi gredo samo v `done`. Vsota števcev je število vseh opravil. Preveri oba odprta statusa.
- **S02 – stabilno filtriranje:** podatki z novimi ID-ji, enakimi naslovi in premešanim vrstnim redom; preveri vseh šest filtrov, nespremenjene števce in povrnitev celotnega zaporedja z `all`. V obeh pogledih primerjaj množico ID-jev, na tabli vrstni red znotraj vsakega stolpca. Ponovi s številom opravil nad deset.
- **S03 – koledar:** npr. `2026-01-28 ⊕ 7 = 2026-02-04`, `2027-12-28 ⊕ 7 = 2028-01-04`, `2028-02-28 ⊕ 1 = 2028-02-29`, `⊕ 7 = 2028-03-06`. Preveri vključitev +7 in izključitev +8; enak rezultat pri pasovih UTC, Europe/Ljubljana in America/New_York, tudi okoli prehodov DST.
- **S04 – vnos in pogleda:** izberi filter, spremeni datum, izprazni polje, preklopi na tablo in nazaj. Prazen vnos in opozorilo ostaneta, skupine uporabljajo zadnji veljavni datum; filter ohrani izbiro. Nato veljaven datum odstrani opozorilo in takoj preračuna oba pogleda. Pri praznem polju deluje tudi sprememba filtra.
- **S05 – življenjski cikel:** spremeni datum/filter, preidi na drug projekt in nazaj ter osveži v obeh pogledih; vsakič datum `2026-09-21`, filter `all`, brez opozorila. Začetna vrednost ni vezana na simulirano uro naprave. V shrambi in URL-ju ni novega stanja filtra/datuma (obstoječi `view=board` je dovoljen).
- **S06 – praznine:** prazen projekt v obeh pogledih → pet ničel, ohranjena navigacija in preklop pogledov. Tabla ohrani vse tri stolpce tudi prazna. Neprazen projekt s prazno skupino → točno zahtevano sporočilo; prehod na drugo skupino ali `all` spet pokaže opravila. Vključi tudi projekt z enim opravilom.
- **S07 – regresije in videz:** odpri pravo opravilo po ID-ju ob podvojenih naslovih, preveri vsa bralna polja in zapiranje. Med lokalnimi dejanji ni POST/PATCH/PUT/DELETE na `/api/`, nobenega dostopa UI do `/__test/` in nobene spremembe podatkov. Pri 390 px velja `document.documentElement.scrollWidth <= document.documentElement.clientWidth`; notranje drsenje table/preglednice ostane dovoljeno. Preglej Folio na namizju in telefonu, prelom kontrol ter vidni fokus.

Oznaka **N** spodaj pomeni: ni izvedeno; dokaz rezultata še ne obstaja. Navedene kode so obstoječe točke vključitve, ne že izdelana rešitev.

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | Začetna trojica stanja | S05; razvojni D01 | `src/App.tsx`: `ProjectView`, `App` | N |
| R02 | Prednost `done` | S01; D04 | `src/App.tsx`: klasifikacija pred prikazoma | N |
| R03 | Rok < a oziroma = a | S01; D01, D03 | `src/App.tsx`: klasifikacija | N |
| R04 | +1…+7 vključeno; particija | S01; D02 | `src/App.tsx`: klasifikacija/števci | N |
| R05 | Koledarsko seštevanje brez pasu | S03 | Pomožna funkcija v `src/` po izbiri implementerja; `src/formatDate.ts` prikaz | N |
| R06 | C neodvisen od f | S01, S02; D02 preveri le week=2 | `src/App.tsx`: števci iz celotnih `tasks` | N |
| R07 | Stabilni V, podatki nespremenjeni | S02, S07; D01, D02, D04 delno | `src/App.tsx`: select, vrstice; `src/TaskBoard.tsx`: kartice | N |
| R08 | Prehodi (x,a,f), opozorilo | S04; D03 | `src/App.tsx`: lokalno stanje in kontrola datuma | N |
| R09 | Isti ID-ji, stanje se ohrani | S02, S04; D04 delno | `src/App.tsx`: razcep pogledov; `src/TaskBoard.tsx`; `src/navigation.ts` | N |
| R10 | Ponastavitev ob projektu/reload | S05 | `src/App.tsx`: `key={project.id}`, inicializacija | N |
| R11 | Pet ničel ali prazna skupina | S06; obstoječi testi praznega projekta/table | `src/App.tsx`: prazno stanje; `src/TaskBoard.tsx`: stolpci | N |
| R12 | Samo branje, polja, Folio | S03, S07; D04; baseline/api | `src/api.ts`, `src/useResource.ts`, `src/TaskDetails.tsx`, `src/styles.css` | N |

Razvojni D01–D04 so v `tests/development/P08.spec.ts`; pripomoček `helpers.ts` je samo za teste. Za njegove privzete podatke projekta web je pet števcev pri začetnem datumu `[2, 0, 2, 2, 2]` v vrstnem redu overdue/today/week/later/done. To je posamezen primer, ne dovoljenje za vezavo kode na fixture.

Implementer naj izvede `npm run check` (lint, typecheck/build, skupni, razvojni in lastni testi) ter smiselne dodatne scenarije S01–S07 v `tests/agent/`, zlasti manjkajoče meje, ponastavitve in praznine. Dejanske datoteke/funkcije, imena testov, ukaz, izid in dokaz zagona zapiše v svoj dokument `docs/agent/implementation.md` ali enakovreden lastni zapis ter ga poveže z R01–R12. Ta dokument ostane last avtorja specifikacije; pripombe za spremembo se vrnejo avtorju. Nedostopni končni testi niso opravljeni.

## Odprta vprašanja in omejitve

Ni blokirajočih odprtih vprašanj. Razlaga vrstnega reda table zgoraj ohranja obstoječi dizajn stolpcev; za povsem prazen projekt ostanejo obstoječa prazna stanja, za prazno izbrano skupino nepraznega projekta velja novo točno besedilo. Neveljaven ali delni vnos, ki ga `input type=date` izpostavi kot prazno vrednost, sledi pravilu za prazen vnos; zadnjega veljavnega datuma ne sme prepisati.

Spremembe implementacije so omejene na `src/`, lastne teste `tests/agent/` in lastne dokumente v `docs/agent/`. Strežnik, začetni podatki, skupni tipi/testi, infrastruktura, odvisnosti in navodila so samo za branje. UI ne uvaža testnih pripomočkov, ne uporablja `/__test/`, lokalne kopije podatkov ali trajne shrambe za nadomestitev API-ja. Dovoljen je le ta izvoz projekta in njegove lokalne storitve; drugih projektov, konektorjev ali oddaljenih repozitorijev ne uporabljamo.

Obstoječe regresije navigacije med nalaganjem ostanejo veljavne; dodatno širjenje sočasnih sprememb brez osvežitve ni del obsega. Oblikovanje sledi `docs/dizajn.md` in `src/styles.css`, brez prenove Folia. Zagon aplikacije, testi in pregled videza pripadajo implementerju; vsi rezultati izvajanja in vizualne skladnosti ob tej predaji ostajajo nepreverjeni.
