# Neodvisni pregled P08

Pregled R01–R12 je končan. Konkretnih odstopanj specifikacije ali implementacije od izvirnih zahtev nisem našel. Popravki niso zahtevani. Strojna predaja je v `review.json`.

Pregledal sem izvirna navodila, predlogo, specifikacijo in njeno zgodovino, relevantno izvorno kodo, razvojne in lastne teste, `verification.md`, `check.log`, potrjeni dizajn ter štiri implementerjeve posnetke. Specifikacija zajema vseh dvanajst zahtev, vsebuje predikate in jasno ločuje predvidene scenarije od pozneje izvedenih preverjanj. Dejanske rezultate povezuje implementerjev `verification.md`.

| Zahteva | Lastni pregled in sklep | Prevzeto dokazilo izvajanja |
| --- | --- | --- |
| R01 | `deadlines.ts` določa konstanto 2026-09-21; `ProjectView` inicializira oba datuma in all. Ura naprave se ne uporablja. Brez ugotovitve. | D01 in S01/S03 z uro v letu 2037. |
| R02 | `deadlineGroup` vrne done pred vsakim datumskim pogojem. Brez ugotovitve. | S01/S03 pokrije done na vseh datumskih mejah. |
| R03 | Negativna razlika pomeni overdue, nič today. Brez ugotovitve. | S01/S03 vsebuje odprti opravili pred referenco in na njej. |
| R04 | Po predhodnih pogojih razlika do vključno 7 pomeni week, večja later. Vsako opravilo dobi eno skupino. Brez ugotovitve. | D02 in S01/S03 preverita r+1, r+7, r+8 ter vse števce. |
| R05 | UTC polnoč in razlika ordinalov odstranita vpliv lokalnega pasu in DST; veljavni koledarski datumi prečkajo mesec, leto in februar brez ročnega omejevanja dneva. Brez ugotovitve. | S02: osem primerov v vsakem od treh časovnih pasov. |
| R06 | Pet pravilno označenih elementov strong vsebuje samo številko; izračun iz groupedTasks ni odvisen od filtra. Brez ugotovitve. | S01/S03 preveri vse števce pri vseh filtrih in obeh prikazih. |
| R07 | Stabilni filter/map ohrani API zaporedje in objekte opravil. Tabla ohrani zaporedje znotraj obstoječih stolpcev. Brez ugotovitve. | S01/S03 uporablja 12 opravil, druge ID-je, podvojene naslove in premešana stanja. |
| R08 | Ločena dateInput in referenceDate ohranita zadnji veljavni izračun. Filter se ob vnosu ne spremeni; opozorilo in njegovo besedilo ustrezata dogovoru. Brez ugotovitve. | D03 in S04 preverita prazen vnos, ohranjene števce in ponovno veljaven datum. |
| R09 | Preglednica in TaskBoard prejmeta isti visibleTasks. Sprememba view ne spremeni ključa ProjectView ali lokalnega stanja. Brez ugotovitve. | S01/S03 in S04 preverita ID-je in preklop ob praznem vnosu. |
| R10 | Ključ project.id ponastavi stanje ob menjavi projekta; osvežitev ga ponovno inicializira. V kodi ni shrambe filtra ali novih URL-parametrov. Brez ugotovitve. | S05 preveri menjavo, vrnitev, osvežitev obeh pogledov in local/sessionStorage. |
| R11 | Prazno polje opravil da pet ničel; prazna skupina nepraznega projekta pokaže zahtevano sporočilo, kontrole ostanejo prisotne. Brez ugotovitve. | S06 ter osnovna testa prazne preglednice in table. |
| R12 | Pregled uporablja GET, brez klicev updateTask ali testnih kontrol. Podrobnosti ostajajo bralne; data-task-id, imena pogledov, stolpci in pregled stanj so ohranjeni. Novi slogi sledijo Foliu. Brez ugotovitve. | S01/S03, S07, osnovni/API testi ter shranjeni namizni in mobilni posnetki. |

Sam sem vizualno pregledal `desktop-table.png`, `desktop-board.png`, `mobile-table.png` in `mobile-board.png`; primerjal sem jih z `docs/dizajn.md` in izhodiščnim `docs/predogled/telefon.png`. Posnetki kažejo ohranjeno navigacijo, tipografijo, barve, preglednico in tablo; pri mobilnem prikazu so kontrole in opozorilo znotraj strani. Meritve scrollWidth iz implementerjevega preverjanja niso moje meritve.

`check.log` vsebuje uspešen lint, preverjanje tipov, gradnjo in 54 uspešnih testov (38 osnovnih/API, 8 razvojnih P08, 8 lastnih). Prebral sem vsebino relevantnih testov in primerjal njihove trditve z zahtevami ter dokumentiranimi rezultati. Testov in brskalniških interakcij nisem ponovno izvajal, ker pregled ni pokazal konkretnega razloga za ponovitev; navedeni uspešni zagoni pripadajo implementerju.

Omejitve: nedostopni končni testi niso preverjeni. Pregled uporablja samo lokalni izvoz; javni internet je blokiran. Po navodilih je za brskalnik na voljo chromium.connect, ne chromium.launch; sam brskalnika nisem zaganjal. Lastni poskus `git status --short` je odpovedal zaradi manjkajočega xcrun v /Library/Developer/CommandLineTools, zato neodvisne primerjave obsega sprememb z Gitom ni. Spreminjal sem samo review.json in review.md.
