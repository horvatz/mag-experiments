# P05 — implementacija in preverjanje

Začetni zapis implementerja, 2026-09-25. Prebrani so PROJECT_RULES.md, task/instructions.md, task/specification-template.md in predana specifikacija 1.0. Izvirne zahteve R01–R12 so obvezne. Specifikacija in njena zgodovina ostajata nespremenjeni.

## Začetni načrt (shranjen pred implementacijo)

- Implementacija: še ni izvedena. Lokalno stanje velikosti, filtra in strani v ProjectView; enoten filtriran odsek za preglednico in tablo; projektni števci uporabljajo celotni projekt. Ohraniti dizajn Folio in obstoječe nalaganje/podrobnosti.
- R01–R06, R09–R11: načrtovani dodatni testi poljubnih ID-jev, zaporedja, strani vseh velikosti, filtrov, robnih/praznih rezultatov, istih ID-jev v obeh pogledih in števcev. Še niso izvedeni.
- R07–R08: načrtovano preverjanje ohranitve stanja pri pogledu/podrobnostih in ponastavitve ob projektu/osvežitvi. Še ni izvedeno.
- R12: načrtovan celoten `npm run check`, spremljanje odsotnosti zapisovalnih API zahtev ter vizualni/mobilni pregled. Še ni izvedeno.
- Pred daljšimi zagoni preveriti čas z `node task/time-budget.mjs`; končno predajo zaključiti vsaj minuto pred 21:10:37.148Z.

## Omejitve

Spremembe so omejene na src/, tests/agent/ in ta zapis. Infrastruktura, skupni testi, odvisnosti in dokumenti drugih vlog so samo berljivi. Javni internet ni na voljo. Za lastne brskalniške skripte je dovoljen obstoječi Chromium prek `chromium.connect(wsEndpoint)` iz task/browser.json; `chromium.launch()` ni na voljo. Končni skriti testi niso dostopni in niso izvedeni. Drugih agentov ne zaganjam.

## Dejanski rezultati

Implementacija je dodana v `src/App.tsx` (ProjectView): lokalni pageSize/pageFilter/page, stabilni filter pred enim odsekom visibleTasks, odsek za preglednico in TaskBoard, dostopni selecti in status ter štirje robno onemogočeni gumbi. Obstoječi projektni števci ostajajo vezani na tasks; življenjska doba ProjectView ohranja ali ponastavlja stanje po R07/R08. `src/styles.css` dodaja nevtralne kontrole z obstoječimi spremenljivkami in mobilnim prelomom.

Dodani so `tests/agent/pagination.spec.ts`: A01 (osem velikosti vhodnega polja, vse tri številčne velikosti in all, zaporedje/unikatnost, vsi premiki/statusi), A02 (ponastavitev še veljavne strani, vsi filtri pred skupnim odsekom, projektni/stolpčni števci), A03 (oba pogleda, tri načine zapiranja podrobnosti, fokus, menjava projekta, osvežitev, shramba/URL), A04 (prazen projekt in filter, vse velikosti, oba pogleda, onemogočeni premiki), A05 (1440/390 px, oba pogleda, širina dokumenta in posnetki). Testi uporabljajo poljubne nesortirane Unicode ID-je, enake naslove in prestopni datum.

Prvi `npm run check` je uspešno prestal lint, nato se je ustavil pri tipu napačnega argumenta `toBeDisabled` v lastnem testu (dnevnik `docs/agent/check.log`); preverjanje je popravljeno na dejansko DOM lastnost `disabled`. Aplikacijska koda tega popravka ni potrebovala.

Ponovljeni celoten `npm run check` se je končal z izhodom 0: lint, preverjanje tipov, produkcijska gradnja in **60/60 testov uspešno** (28,9 s za teste: 38 osnovnih, 8 razvojnih P05, 14 lastnih). Dokaz: `docs/agent/check-final.log`.

Pregledani so štirje posnetki A05 za 1440/390 px. Kontrole, barve, kartice in širina ustrezajo pričakovanjem. Mobilni zajem po kliku spodnjega gumba je sprva pokazal lepljivo navigacijo nad delom naslova zaradi pomika dokumenta; za jasnejši pregled začetnega položaja je samo zajem testa dopolnjen s `window.scrollTo(0, 0)`. Ciljno ponovljeni A05 je uspešen: **2/2**, izhod 0, 1,6 s (`docs/agent/visual-check.log`), aplikacijska koda ostaja enaka uspešnemu celotnemu zagonu. Ponovno pregledana mobilna posnetka prikazujeta cel naslov, oba izbirnika, status in štiri gumbe brez razširitve dokumenta. Namizna posnetka ohranjata levi meni, projektni pregled in oba pogleda Folio. To je vizualni pregled posnetkov testnega brskalnika, ne ločen zagon ročnega strežnika.

Napake predane specifikacije doslej niso ugotovljene.

Okoljska omejitev: `git status --short` se ni izvedel zaradi manjkajočega `/Library/Developer/CommandLineTools/usr/bin/xcrun`. Git metapodatkov, vej ali oddaljenih repozitorijev nisem spreminjal.

## Končna sledljivost in predaja

V spodnji tabeli C01–C12 pomenijo sprejemne pogoje iz nespremenjene predane specifikacije. A01–A05 so dejansko izvedeni testi v [pagination.spec.ts](../../tests/agent/pagination.spec.ts), D01–D04 razvojni testi v `tests/development/P05.spec.ts`. Vsi navedeni uspehi so iz [celotnega dnevnika](check-final.log); ponovljeni vizualni test je v [vizualnem dnevniku](visual-check.log).

| Zahteva | Pogoj in koda | Dejanski test/scenarij in izid |
| --- | --- | --- |
| R01 | C01; `src/App.tsx:16` začetno all/all/1, `:19` stabilno polje, `:71` vrstni red | A01: N=1,2,3,5,6,10,11,23 ter A04: N=0; privzeti izbirniki, status in ID-ji uspešni. |
| R02 | C02; `src/App.tsx:20`–`:26` izračun odseka | A01: vsaka stran pri 2/5/10, konkatenacija enaka vhodu, brez podvojenih ID-jev, polna/krajša zadnja stran; D01; uspešno. |
| R03 | C03; `src/App.tsx:27` robova, `:83`–`:86` štirje gumbi | A01: prvi/prejšnji/naslednji/zadnji ter disabled na vsakem robu; A04: programatski click na onemogočene gumbe ne spremeni ničelnega statusa; D02; uspešno. |
| R04 | C04; `src/App.tsx:60` ponastavitev strani ob velikosti | A02: stran 2 velikosti 2 → velikost 5 vrne prvo stran, čeprav je druga še veljavna; A01 vse velikosti/all; D04; uspešno. |
| R05 | C05; `src/App.tsx:19` filter pred slice, `:63` ponastavitev | A02: vsi štirje filtri iz neprve strani, ID-ji prve/zadnje filtrirane strani; D03; uspešno. |
| R06 | C06; `src/App.tsx:67` in `:71` delita visibleTasks, nespremenjeni `TaskBoard` združi ta odsek | A02: enaki ID-ji obeh pogledov, vrstni red po stolpcih; A05: mešana druga stran pri 1440/390 px; D03; uspešno. |
| R07 | C07; `src/App.tsx:14` lokalno stanje, `:92` podrobnosti, `:120` ključ projekta | A03: filtrirana druga stran, oba pogleda, zapiranje z gumbom/Escape/nazaj, ohranitev velikosti/filtra/strani in vrnitev fokusa; uspešno. |
| R08 | C08; `src/App.tsx:16` privzeto stanje in `:120` key projekta | A03: menjava projekta in vrnitev, osvežitev s filtrom in neprvo stranjo v tabli, brez novega stanja v URL ali shrambi; uspešno. |
| R09 | C09; `src/App.tsx:20`–`:25` indeksi, `:81` natančni status | A01: status vsake strani za vse velikosti; A02: filtrirani N; A03: 3–4 od 8; A05: 6–10 od 23; D02: krajša zadnja stran; uspešno. |
| R10 | C10; `src/App.tsx:22`–`:28`, `:67`, `:81`–`:86` ničelni rezultat | A04: prazen projekt/prazen filter, obe predstavitvi, all/2/5/10, vsi gumbi disabled, odstranitev filtra vrne prvo stran; osnovni testi prazne preglednice/table; uspešno. |
| R11 | C11; `src/App.tsx:29` counts iz tasks, `:53` skupno število, `:89` zaključeni/skupaj; `TaskBoard` entries | A02: projektni števci ostanejo 8/8/7 in 23, zaključeni 7/23, vsak stolpec šteje samo svojo prikazano stran; uspešno. |
| R12 | C12; novi handlerji so samo setState, obstoječi API/navigacija/podrobnosti nespremenjeni; `src/styles.css:66` in `:177` | Vseh 38 osnovnih testov, 8 razvojnih, A02/A03/A05 brez zapisov; A05 širina dokumenta ≤ viewport pri 1440/390 px; vizualni pregled; lint/tipi/gradnja uspešni. Statično v src/ ni testnih kontrol ali nove trajne shrambe. |

Ohranjeni vizualni dokazi: [preglednica 1440](screenshots/table-1440.png), [tabla 1440](screenshots/board-1440.png), [preglednica 390](screenshots/table-390.png), [tabla 390](screenshots/board-390.png). Artefakti so kopirani v lastno dokumentacijo, da jih naslednji testni zagon ne izbriše.

Končne spremembe: `src/App.tsx`, `src/styles.css`, `tests/agent/pagination.spec.ts`, ta zapis, trije dnevniki in štirje posnetki v `docs/agent/`. Specifikacija, zgodovina specifikacije, reviewerjevi dokumenti, infrastruktura, skupni testi, tipi in odvisnosti niso bili spremenjeni. Generirana gradnja in testna poročila so v dovoljenih izhodnih mapah.

Ni znanih neizpolnjenih zahtev ali napak specifikacije. Skriti končni testi niso dostopni; ročni pregled s pomočjo bralnika zaslona ni izveden. Pokritost poljubnih podatkov temelji na splošnem izračunu in navedenih konkretnih primerih, ne na izčrpnem preizkusu vseh vhodov. Delo je pripravljeno za neodvisni pregled; dodatni agenti niso bili zagnani. Zadnja sprememba po celotnem uspešnem preverjanju je samo pomik pred zajemom posnetkov v testu A05, ki je nato ponovno uspešno izveden.
