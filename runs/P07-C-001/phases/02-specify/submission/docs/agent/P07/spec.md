# P07 — Priljubljena opravila in trajna shramba

Različica 1.0 · 2026-09-25 · Status: specifikacija, izvedba in testi še niso opravljeni.

## Problem in kontekst

Uporabnik želi označiti posamezna opravila kot priljubljena, hitro omejiti njihov prikaz in ohraniti izbor po osvežitvi ter med projekti. Izhodiščni Folio nalaga projekte in opravila iz javnega API-ja, omogoča preglednico, tablo in podrobnosti po ID-ju; priljubljenih še nima. Dodatek ohrani ta potek in [potrjeni dizajn](../../dizajn.md).

Merilo so vseh R01–R12 v [izvirnih navodilih](../../../task/instructions.md), [projektna pravila](../../../PROJECT_RULES.md) in [ustava](../../../.specify/memory/constitution.md). Ta dokument izpolnjuje razdelke [skupne predloge](../../../task/specification-template.md). Izvirne zahteve veljajo tudi ob izpustu v tem dokumentu.

## Vhodi, dejanja in izidi

- Projekt vsebuje `id`, `name`. Opravilo vsebuje `id`, `projectId`, `title`, `description`, `status`, `assignee`, `dueDate`; tipi ostanejo nespremenjeni. Identiteta je izključno `id`. Statusi so `todo`, `in_progress`, `done`.
- API lahko vrne prazna projekta, eno ali poljubno mnogo opravil, drugačen vrstni red, enake naslove, poljubne enkratne ID-je in veljavne koledarske datume. Besedila so navadno besedilo, tudi Unicode in ločila. Izbor ne temelji na vzorčnih naslovih, številu ali ID-jih.
- Vhod shrambe je besedilo ali `null` za ključ `folio:favorites:v1`. Veljavna vsebina je JSON objekt z `version: 1` in `ids`, ki je polje samih nizov. Podvojeni in trenutno neznani nizi so dovoljeni.
- Uporabnik preklopi priljubljenost, vključi/izključi filter, odstrani priljubljene celotnega trenutnega projekta, preklopi pogled, odpre/zapre podrobnosti, zamenja projekt ali osveži stran. Dejanja priljubljenih učinkujejo takoj in nimajo potrditvenega dialoga; ponovni preklop povrne članstvo ID-ja. Zapiranje oziroma preklic podrobnosti ne spreminja priljubljenih ali filtra.
- Uspešen lokalni zapis shrani samo različico in kanoničen seznam ID-jev. Napaka branja pomeni začetno prazno množico in opozorilo; napaka zapisa ohrani novo stanje v pomnilniku in prikaže opozorilo. Napake nalaganja API-ja ostanejo obravnavane po obstoječem poteku.

### Model stanja in predikati

`P` je trenutni projekt, `T(P)` celoten urejeni seznam njegovih opravil iz API-ja, `I(P) = {t.id | t ∈ T(P)}`, `F` globalna množica priljubljenih ID-jev, `q` lokalni logični filter in `v` izbrani pogled. `K = "folio:favorites:v1"`. `W` označuje opozorilo o nedostopni shrambi. Vrstni red iz API-ja je izvorni vrstni red; tabla ga ohrani znotraj posameznega stolpca.

- `valid(x) ⇔ x` je neničeln JSON objekt, `x.version === 1`, `Array.isArray(x.ids)` in `∀ id ∈ x.ids: typeof id === "string"`.
- `decode(s) = Set(JSON.parse(s).ids)`, če se razčlenitev uspešno konča in je `valid` resničen; sicer `decode(s) = ∅`. `decode(null) = ∅`. Neveljaven posamezen element zavrne celoten zapis.
- Inicializacija: `F := decode(getItem(K)); q := false`. Izjema dostopa/branja: `F := ∅; W := true`. Inicializacija ne zapisuje ali popravlja shrambe.
- Preklop ID-ja `i`: `F' = F △ {i}` (simetrična razlika). Drugi ID-ji, podatki opravil in trenutna pot ostanejo enaki. `aria-pressed(i) ⇔ i ∈ F`.
- Odstranitev projekta: `F' = F \ I(P)`. Gumb je onemogočen natanko, ko `F ∩ I(P) = ∅`. Uporabi celoten projekt, ne le trenutnega prikaza.
- Po uporabniški spremembi `F` se poskusi `setItem(K, JSON.stringify({version:1, ids:sortUTF16([...F])}))`. Zaporedje je brez dvojnikov; primerjava sledi zaporedju kodnih enot UTF-16 (brez jezikovnega razvrščanja). Ne zapisujemo polj opravil. Ob izjemi ostane `F'` uporabno v pomnilniku in `W := true`.
- Vidni seznam `V(P,F,q) = T(P)`, če `q=false`; sicer `V = [t ∈ T(P) | t.id ∈ F]`, s stabilnim vrstnim redom. Neznani ID-ji ne ustvarijo opravil.
- `X = |F ∩ I(P)|`, `M = |T(P)|`; števec projekta prikazuje `Priljubljeno: X od M.` neodvisno od filtra. Za status `s` števec stolpca kaže `|{t ∈ V | t.status=s}|`.
- Menjava pogleda spremeni samo `v`; menjava projekta ohrani `F` in nastavi `q := false`. Osvežitev ponovno inicializira `F` iz shrambe in `q := false`.
- `storage` z `event.key === K`: `F := decode(event.newValue)` takoj, brez povratnega zapisa; `null` izprazni množico. Drug ključ se ignorira. Filter ostane nespremenjen.
- Invarianta lokalnosti: dejanja priljubljenih ne povzročijo zapisovalnega API zahtevka in ne spremenijo nobenega polja opravila.

## Zahteve in pravila

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Vsaka vrstica in kartica ima gumb `Priljubljeno opravilo <id>` z `aria-pressed=true/false`, zunaj povezave. Preklop spremeni samo ta ID in ne odpre podrobnosti, tudi pri enakih naslovih. | S01: oba pogleda, dva enaka naslova, stanje gumba, nespremenjena pot in zaprt dialog. |
| R02 | Uporabniška sprememba shrani pod K samo `{version:1,ids:[...]}`; ID-ji so enkratni nizi, urejeni po UTF-16. | S02: razčlenitev dejanskega zapisa, Unicode vrstni red, preverjanje odsotnosti polj opravil. |
| R03 | Osvežitev obnovi množico; dvojniki se združijo, neznani ID-ji ostanejo v F in naslednjem zapisu brez izmišljenih opravil. | S03: prednaložen veljaven zapis, osvežitev, preklop in menjava projekta. |
| R04 | Manjkajoč ključ, neveljaven JSON, napačna version, odsotni/nepravilni ids ali katerikoli neniz dajo prazno množico; nalaganje ne prepiše shrambe. | S04: matrika neveljavnih vhodov, odsotnost zapisov in uporabnost UI. |
| R05 | Checkbox `Prikaži le priljubljena` privzeto ni označen in filtrira po V samo trenutni projekt v izvornem vrstnem redu. | S05: izklop/vklop, drugačno API zaporedje, preglednica in vrstni red znotraj stolpcev. |
| R06 | Odstranjeni ID med aktivnim filtrom takoj izgine. Pri praznem filtriranem rezultatu je vidno `Ni priljubljenih opravil.`; filter ostane mogoče izklopiti. | S06: zadnje priljubljeno opravilo, oba pogleda in prazen projekt. |
| R07 | Oba pogleda delita F in q. Preklopi ter odpiranje/zapiranje podrobnosti ohranijo stanje; podrobnosti se odprejo za pravi ID. | S07: preglednica → tabla → podrobnosti → zapri → preglednica. |
| R08 | Menjava projekta ohrani F, q postane false; osvežitev obnovi F iz shrambe in q je false. | S08: dva projekta, povratek in osvežitev. |
| R09 | `Odstrani priljubljene tega projekta` uporabi F \ I(P), ohrani tuje in neznane ID-je ter je brez lokalnih priljubljenih onemogočen. | S09: prednaložena mešana množica, oba pogleda, aktiven filter in prazen projekt. |
| R10 | `role=status`, `aria-label=Število priljubljenih` vsebuje `Priljubljeno: X od M.` za celoten projekt; stolpci štejejo vidna opravila. | S10: števec pred/po filtru, preklopu in odstranitvi, vključno z 0 od 0. |
| R11 | Pravi storage dogodek uporabi decode brez zapisovanja, null izprazni, drug ključ nima učinka. Izjema branja/zapisa ne blokira dejanj v pomnilniku; opozorilo ima `role=alert` in vsebuje `shramba`. | S11: veljavni/neveljavni dogodki, null, napačen ključ, štetje zapisov in ločeni izjemi branja/zapisa. |
| R12 | Priljubljene so lokalne, API in opravila ostanejo nespremenjeni. Folio, nalaganje, navigacija in širina 390 px delujejo. Ohranjeni so data-task-id, imena pogledov/stolpcev in `aria-label="Pregled stanj opravil"`. | S12: nadzor metod API, primerjava podatkov, skupni regresijski testi ter namizni in ozki prikaz. |

### Uporabniški scenariji in merilo uspeha

1. Uporabnik v preglednici označi opravilo z enakim naslovom kot drugo, vključi filter in preklopi na tablo. Vidno je samo izbrano opravilo; gumb ne odpira dialoga, povezava odpre prave podrobnosti (S01, S05, S07, S10).
2. Uporabnik shrani izbore v dveh projektih in osveži stran. Izbori ostanejo, filter se ponastavi. Odstranitev priljubljenih enega projekta ohrani vse tuje in neznane ID-je (S02, S03, S08, S09).
3. Uporabnik med filtriranjem odstrani zadnje priljubljeno. Dobi prazno stanje in lahko izklopi filter ter spet vidi vsa opravila; enako velja na tabli (S06).
4. Neveljavna ali nedostopna shramba ne ustavi aplikacije. Zunanji storage dogodek uskladi oba pogleda brez zanke zapisovanja; ob nedostopnosti uporabnik nadaljuje v pomnilniku (S04, S11).

Uspeh pomeni izpolnitev vseh navedenih sprejemnih pogojev za opisano podatkovno domeno in ohranitev obstoječega Folio; ne uvajamo dodatnih funkcionalnih zahtev ali zunanjih meritev.

## Izvedba in sledljivost

Spodnja tabela je začetna sledljivost. V implementacijskem koraku se dopolni s točnimi lokacijami kode, imeni izvedenih testov in dnevniki. Navedene obstoječe datoteke so mesta povezave z izhodiščem, ne dokaz že izvedene funkcionalnosti.

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | Izoliran preklop po ID-ju | S01 | `src/App.tsx` vrstice, `src/TaskBoard.tsx` kartice; dodatek še ni izveden | Ni izvedeno. |
| R02 | Kanoničen zapis | S02 | Upravljanje priljubljenih še ni izvedeno | Ni izvedeno. |
| R03 | Obnova, dvojniki in neznani ID-ji | S03 | Upravljanje priljubljenih še ni izvedeno | Ni izvedeno. |
| R04 | Stroga validacija brez zapisa | S04 | Upravljanje priljubljenih še ni izvedeno | Ni izvedeno. |
| R05 | Stabilen filter | S05 | `src/App.tsx` ProjectView; dodatek še ni izveden | Ni izvedeno. |
| R06 | Takojšnja odstranitev in prazno stanje | S06 | `src/App.tsx` ProjectView; dodatek še ni izveden | Ni izvedeno. |
| R07 | Skupno stanje pogledov in pravilne podrobnosti | S07 | `src/App.tsx`, `src/TaskBoard.tsx`, obstoječi `src/TaskDetails.tsx` | Ni izvedeno. |
| R08 | Globalen izbor, lokalen filter | S08 | `src/App.tsx` App/ProjectView; dodatek še ni izveden | Ni izvedeno. |
| R09 | Odstranitev celotnega projekta | S09 | `src/App.tsx` ProjectView; dodatek še ni izveden | Ni izvedeno. |
| R10 | Projektni in vidni števci | S10 | `src/App.tsx`, `src/TaskBoard.tsx`; dodatek še ni izveden | Ni izvedeno. |
| R11 | Sinhronizacija in izjeme | S11 | Upravljanje priljubljenih še ni izvedeno | Ni izvedeno. |
| R12 | Lokalnost in regresije Folio | S12 | `src/App.tsx`, `src/TaskBoard.tsx`, `src/styles.css`; ohranitev izhodišča | Ni izvedeno. |

## Odprta vprašanja in omejitve

- Bistvenih odprtih vprašanj ni. Izrecna zahteva za localStorage priljubljenih dopolnjuje splošno prepoved lokalne kopije podatkov opravil.
- Prazno stanje `Ni priljubljenih opravil.` velja pri vključenem filtru in praznem V; brez filtra ohranimo obstoječe prazno stanje projekta. Splošni pregled stanj in podatki projekta ostanejo vezani na celoten projekt, stolpci table pa na vidna opravila.
- Razporeditev novih kontrol in nedoločena besedila sledijo obstoječim gradnikom Folio. Ne dodajamo trajnosti filtra, novih API-jev ali sprememb infrastrukture.
- Navigacije med nezaključenim nalaganjem in novih sočasnih sprememb podatkov brez osvežitve ne širimo prek obstoječih regresijskih zahtev.
- Trenutno ni izveden noben implementacijski ali funkcionalni test. Končni testi niso dostopni in ne bodo navedeni kot opravljeni.
- Dovoljene poti in omejitve postopka veljajo po ustavi; skupne predloge in testi so samo berljivi.

## Zgodovina sprememb

- 2026-09-25, 1.0: začetna specifikacija vseh R01–R12, predikati, scenariji S01–S12 in začetna sledljivost po skupni predlogi.
