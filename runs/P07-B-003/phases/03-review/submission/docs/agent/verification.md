# P07 — implementacija in preverjanje

Status: implementacija in preverjanje sta zaključena; pripravljeno za pregledovalca. Končni `npm run check` je uspel z izhodom 0: lint, typecheck, build in vseh 67 testov (38 osnovnih, 8 razvojnih P07, 21 lastnih). Končna koda po tem uspešnem zagonu ni bila spremenjena.

Prebrani so PROJECT_RULES.md, task/instructions.md, task/specification-template.md in predana docs/agent/specification.md. Izvirne R01–R12 ostajajo merilo. Specifikacija pravilno razloži izjemo R02 glede localStorage: shrani se samo množica ID-jev, podatki opravil ostanejo iz API-ja. Za zdaj ni zaznanih napak specifikacije.

## Načrt sprememb

- R02–R04, R08, R11: globalni hook za validacijo, branje, kanonični zapis ID-jev in dogodke storage; varno delovanje v pomnilniku ob izjemah.
- R01, R05–R10: skupne projektne kontrole, števec, filter in gumba zunaj povezav v preglednici ter na tabli.
- R12: ohranitev dizajna Folio, javnega API-ja, navigacije, nalaganja in ozkega prikaza.

## Začetni načrt preverjanja — ob ustvarjanju še neizveden

1. Prebrati obstoječo kodo, dizajn in razvojne/regresijske teste.
2. Dodati lastne scenarije v tests/agent/ za validacijo brez zapisov, UTF-16, neznane ID-je, več projektov, prazne projekte, storage dogodke in izjeme.
3. Pred daljšim zagonom preveriti čas z node task/time-budget.mjs, izvesti npm run check in zapisati dejanske rezultate.
4. Preveriti prikaz pri 390 px ter podrobnosti po ID-ju in zapisati dokaze.
5. Najmanj minuto pred rokom 2026-09-25T19:35:08.181Z zaključiti predajo pregledovalcu.

## Omejitve

Spreminjam le src/, tests/agent/ in lastne zapise docs/agent/. Infrastruktura, odvisnosti, skupni testi, specifikacija in pregled so samo za branje. Drugih agentov ne zaganjam. Javni internet je blokiran; uporabljam le lokalne storitve. Za lastne brskalniške skripte je zahtevan chromium.connect(wsEndpoint) iz task/browser.json. Končni testi niso dostopni in niso izvedeni.

## Izvedene spremembe

- `src/useFavorites.ts`: enoten validator za branje in storage dogodke, globalna množica ID-jev, kanonično pisanje samo ob uporabniških spremembah, ohranitev neznanih ID-jev, varovanje branja/pisanja in nadaljnje delo v pomnilniku.
- `src/App.tsx`: globalni hook in opozorilo, projektni filter, števec celotnega projekta, brisanje celotnega projekta, prazno stanje ter filtrirana preglednica.
- `src/FavoriteButton.tsx`, `src/TaskBoard.tsx`: skupni dostopni gumb zunaj povezav, isti izbor v obeh pogledih, vidni števci stolpcev. Dostopno ime kartice uporablja neposredno besedilo, da tudi ID-ji s presledki ne pokvarijo povezav aria-labelledby.
- `src/styles.css`: majhne zvezdice, prelomljive kontrole in opozorilo v obstoječem slogu Folio.
- `tests/agent/favorites.spec.ts`: A01–A07 z več primeri za validacijo, napake shrambe ter velikosti projektov. Vseh 21 primerov je uspešnih.

## Dosedanji dejanski rezultati

`npm run lint && npm run build` je končal z izhodom 0; ESLint, TypeScript in produkcijska gradnja so uspeli. To preverjanje je bilo pred dodajanjem lastnih testov in zadnjim popravkom dostopnega imena kartice; celotni pregled bo preveril končno stanje.

Prvi celotni zagon se je ustavil pri dveh napakah tipov v novih testih (pretvorba razširjenega window in klic unije metod Storage). Popravljena sta bila samo testna tipizacija in klic prek Reflect.apply. Ponovljeni `npm run check` je preveril končno stanje in uspešno zaključil vseh 67 testov v 26,7 s. Celoten dnevnik je [check.log](check.log); poročilo Playwright je `playwright-report/html/index.html`.

## Sledljivost R01–R12

Vsi spodnji testi so dejansko opravljeni v uspešnem zagonu, dokumentiranem v `check.log`. D01–D04 so iz `tests/development/P07.spec.ts`, A01–A07 iz `tests/agent/favorites.spec.ts`; natančna imena in parametri so v dnevniku.

| Zahteva | Izvedba in pogoj | Preverjanje in dejanski izid |
| --- | --- | --- |
| R01 | `FavoriteButton.tsx`, `App.tsx`, `TaskBoard.tsx`: gumb po ID-ju z aria-pressed, zunaj povezave | D01 v obeh velikostih, A07 tipkovnica in ID z ločili; uspešno, klik ne odpre dialoga. |
| R02 | `useFavorites.ts` / save: samo `{version:1,ids:[...ids].sort()}` | A01 preveri celoten zapis, deduplikacijo in vrstni red praznega niza, velikih/malih črk, Unicode ter nadomestnih parov; uspešno. |
| R03 | `decodeFavorites`, globalni hook v `App` | A01 podvojitve/neznani ID-ji in osvežitev, A03 dva projekta, D03; uspešno. Neznani ID-ji ne ustvarijo vrstic. |
| R04 | `decodeFavorites`, `readFavorites`: zavrnitev celotnega napačnega zapisa, brez pisanja ob nalaganju | A02: 11 primerov (manjkajoč ključ, JSON, null, polje, različice, manjkajoča/nepoljska ids, nenizi). A01 preveri tudi veljaven zapis brez normalizacijskega pisanja; uspešno. |
| R05 | `ProjectView` / onlyFavorites in visibleTasks: filtriranje izvornega seznama | D02, A06 z 0/1/13 opravili preveri izvorni vrstni red; uspešno. |
| R06 | `App.tsx`: prazno sporočilo ob aktivnem filtru in ohranjene kontrole | D02, A06 odznači vse v tabli, preklopi v preglednico in izklopi filter; uspešno tudi za prazen projekt. |
| R07 | Skupni hook za oba pogleda; nespremenjeni `taskUrl` in podrobnosti | D04, A03, A06, A07 in osnovni testi navigacije; uspešno. |
| R08 | `App` hrani F; `ProjectView key={project.id}` hrani q | A03 preveri oba projekta in ponastavitev filtra, A01 osvežitev; uspešno. |
| R09 | `clearFavorites(tasks.map(...))`, disabled pri favoriteCount=0 | A03 preveri izbris celotnega projekta z aktivnim filtrom ter ohranitev drugega/neznanega ID-ja; A06 prazen projekt; uspešno. |
| R10 | `ProjectView`: števec iz vseh tasks; `TaskBoard`: counts iz vidnih tasks | A03, A04, A06 preverijo globalni števec in vse stolpce, tudi ničelne; uspešno. |
| R11 | `useFavorites.ts`: storage poslušalec, isti validator, brez povratnega zapisa, catch branja/pisanja; globalni alert | A04 dogodki in nič zapisov, A05 izjeme getItem/setItem/getter ter nadaljnja uporaba; uspešno. Dodatno dejansko usklajevanje dveh zavihkov uspešno (`manual-check.log`). |
| R12 | Spremembe samo stanja ID-jev; API/navigacija ohranjena, slogi Folio | D04, A07 omrežje in stanje API-ja, vseh 38 osnovnih testov, razvojna desktop/mobile sklopa; uspešno. Pri 390 px preglednica in tabla ne razširita strani. |

## Dodatno preverjanje brskalnika in videza

Lokalni ogled je uporabil predpisana porta 5193/3123 ter `chromium.connect(wsEndpoint)` iz `task/browser.json`. Dejanski dogodek storage je med dvema stranema istega konteksta uskladil dodajanje in odstranjevanje priljubljenega; obe preverjanji sta uspeli. Pri 390 px je za preglednico in tablo veljalo `document.documentElement.scrollWidth <= document.documentElement.clientWidth`. Dokaz: [manual-check.log](manual-check.log).

Shranjeni posnetki: [mobile-table.png](mobile-table.png), [mobile-board.png](mobile-board.png), [desktop-board.png](desktop-board.png), [mobile-favorites.png](mobile-favorites.png). Vizualno sta pregledana mobilna preglednica in namizna tabla: ohranjeni so Folio, barve, meniji, kartice in notranje drsenje; nove kontrole so vidne in pri ozkem prikazu prelomljene.

## Končna predaja in preostale omejitve

- Ni znanih neizpolnjenih zahtev R01–R12 in ni ugotovljene napake predane specifikacije. Specifikacija, njena zgodovina in datoteke pregledovalca niso spremenjene.
- Končni/skriti testi niso dostopni in niso izvedeni. Izjeme shrambe so preverjene z nadzorovanim metanjem izjem v Chromiumu; drugih brskalniških pogonov nisem preverjal.
- `git diff` ni bil mogoč: okolje vrne `xcrun: error: invalid active developer path`, ker manjkajo Command Line Tools. Nobena veja ni ustvarjena ali potisnjena. Spremembe so omejene na zgoraj našteto izvorno kodo, lastne teste in implementerjeve dokaze.
- npm opozarja na nastavitev `http-proxy`; to ni preprečilo nobenega preverjanja. Javni internet ni bil uporabljen. Testna infrastruktura in odvisnosti so ostale nespremenjene.
- Pregledovalec lahko začne pri `src/useFavorites.ts` ter tabeli sledljivosti; glavni ponovljivi ukaz je `npm run check`. Predaja je pripravljena več kot minuto pred rokom faze.
