# P09 — neodvisni pregled (reviewer)

Faza: pregled. Pregledani viri: docs/agent/specification.md, docs/agent/specification-history.md, docs/agent/verification.md, src/, tests/agent/, tests/development/, tests/baseline.spec.ts, tests/api.spec.ts.

## Metoda

- Statična presoja vsake zahteve R01–R12: pravilo v specifikaciji, dejanska koda, test in zapisan dokaz.
- Samostojno izvedeno: npm run check (slog, tipi, gradnja; 58/58 zelenih: 38 osnovnih/API + 8 razvojnih D01–D04 + 12 lastnih).
- Ločeno izvedeno: npx playwright test --project=development-desktop --project=development-mobile --project=agent (20/20).
- Trije dodatni scenariji pregledovalnika (v .tmp, niso del predaje): neposredna povezava na opravilo s parametri in board, zavržen osnutek ob odprtju podrobnosti, vrstni red znotraj stolpca table. Vsi uspešni.
- Skriti končni testi naloge niso dostopni; ocena temelji na razpoložljivih testih in ročnem pregledu kode.

## Ugotovitve

Brez konkretnih ugotovitev glede zahtev. Zastavici specificationChangesRequired in codeChangesRequired ostaneta false, findings je prazen.

## Presoja po zahtevah

| Zahteva | Presoja | Ključni dokaz |
| --- | --- | --- |
| R01 | Izpolnjena. Trojka se bere iz fragmenta za pot projekta in opravila; privzete vrednosti veljajo; neposredna povezava takoj filtrira. | src/navigation.ts, src/viewState.ts; testa R01 in D01; dodatni scenarij na poti opravila. |
| R02 | Izpolnjena. norm (trim, NFD, odstranitev U+0300–U+036F, male črke) in dobesedni podniz po title/description/assignee/id; brez regexa in deljenja besed. | src/viewState.ts; test R02 (šumniki, regexu podoben q, večbesedna fraza). |
| R03 | Izpolnjena. status IN q; order original/title-asc/title-desc z normirano UTF-16 primerjavo in ohranitvijo izvornega vrstnega reda pri izenačenju. | src/viewState.ts; test R03; dodatni scenarij z vrstnim redom znotraj stolpca table. |
| R04 | Izpolnjena. Neznani status/order → privzeto; prva pojava ponovljenega parametra; neznani parametri ne vplivajo; ob odprtju se URL ne prepiše. | src/viewState.ts, src/navigation.ts; test R04. |
| R05 | Izpolnjena. Kontrole spreminjajo le osnutek; Uporabi pogled potrdi vse tri hkrati in doda največ eno zgodovinsko stanje. | src/ViewFilters.tsx, src/App.tsx; testa R05/R06 in D02. |
| R06 | Izpolnjena. q se obreže, privzeti parametri se izpustijo, preostali se kodirajo, view=board se ohrani, neznani parametri se odstranijo; ponovitev ne doda stanja. | src/viewState.ts, src/App.tsx; test R06 in D02. |
| R07 | Izpolnjena. Nazaj/Naprej in osvežitev obnovijo potrjeno stanje, prikaz in osnutek. | src/navigation.ts, src/ViewFilters.tsx; test R07 in D03. |
| R08 | Izpolnjena. Preklop pogleda ohrani parametre in iste ID-je; osnutek se zavrže ob navigaciji (tudi ob odprtju podrobnosti). | src/App.tsx; test R08; dodatni scenarij z osnutkom. |
| R09 | Izpolnjena. Podrobnosti in zapiranje (gumb ali Escape) ohranijo parametre in način; povezava po id deluje pri enakih naslovih. | src/TaskDetails.tsx, src/TaskBoard.tsx; test R09; dodatni scenarij na poti opravila. |
| R10 | Izpolnjena. Klik na drugi projekt začne privzeti pregled in ohrani table/board; neposredna povezava s parametri jih upošteva. | src/App.tsx (projectUrl z privzetim stanjem); test R10. |
| R11 | Izpolnjena. Ponastavi pogled počisti filtre in osnutek, ohrani način in uporabi isto pravilo zgodovine; N = 0 ob M > 0 pokaže Ni zadetkov.; števec je Prikazano: N od M. | src/ViewFilters.tsx, src/App.tsx; testa R11 in D04. |
| R12 | Izpolnjena. Samo bralne zahteve na /api/, brez localStorage, ohranjeni neznana pot, nalaganje, podrobnosti, dizajn in ozek zaslon. | src/api.ts, src/useResource.ts; test R12 in 38 osnovnih/API testov. |

## Omejitve in opombe

- Skriti končni testi niso dostopni; R01–R12 so preverjeni z razvojnimi D01–D04, lastnimi testi in dodatnimi scenariji.
- Ob aktivnih filtrih in praznem projektu (M = 0) se prikaže izhodiščno sporočilo V tem projektu še ni opravil, ne Ni zadetkov.; izhodiščni testi to zahtevajo, zato interpretacije ne štejem kot kršitev R11.
- Presledek v q se v fragment zapiše kot +; URLSearchParams ga pri branju dekodira, zato je krog skladen z R06.
- Vedenje ob zelo velikih naborih, med nedokončanim nalaganjem in ob sočasnih spremembah podatkov ni preverjeno (izven obsega po navodilih).
- Razdelek Izvedba in sledljivost v specification.md ostaja v fazi načrta (Ni izvedeno), dejanski dokazi pa so v verification.md; pogoji, koda in izvedeni testi so določljivi in preverjeni, zato sprememba specifikacije ni potrebna.
