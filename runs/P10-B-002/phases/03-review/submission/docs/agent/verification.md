# Implementacija in preverjanje P10

Začetni zapis implementerja, 2026-09-26. Prebrani so PROJECT_RULES.md, task/instructions.md, task/specification-template.md in predana specifikacija. Obvezne so vse R01–R12. Specifikacije in pregledovalčevih datotek ne spreminjam.

## Začetni načrt (ob nastanku zapisa še neizveden; zdaj opravljen)

1. Pregledati obstoječo kodo in dizajn; dodati lokalno stanje permutacije z atomskimi prehodi, zgodovino največ 20 korakov in ponastavitvijo ob menjavi projekta.
2. Dodati dostopne kontrole in globalna mesta v preglednico in tablo; ohraniti polja, podrobnosti, števce in odzivni Folio.
3. Dodati smiselne teste v tests/agent/ za več korakov, mejo 20, globalne premike table, posebne ID-je, prazne/enojne projekte in lokalnost.
4. Izvesti npm run check (slog, tipi, gradnja, osnovni, razvojni in lastni testi). Rezultati še niso znani. Pred daljšim preverjanjem preveriti čas.
5. Če čas dopušča, preveriti izgled obeh pogledov pri 390 px. Končnih nedostopnih testov ne navajati kot opravljenih.

## Spremembe in rezultati

Implementirano: `src/useTaskOrder.ts` hrani nespremenljive posnetke ID-jev in atomsko izvaja premik/undo/redo/reset; `src/App.tsx` hrani hook v naloženem TaskSection pod ključem projekta. `src/TaskOrderControls.tsx` daje obema pogledoma globalna mesta in robno onemogočene gumbe; `src/TaskBoard.tsx` filtrira urejeni seznam po obstoječih stanjih. Dodani slogi uporabljajo Folio spremenljivke in omogočajo prelom orodne vrstice. Polja opravil in API niso spremenjeni.

Specifikacija nima opažene napake. Pri implementaciji je dodatno odpravljena odvisnost dostopnega imena kartice od HTML ID-jev, sestavljenih iz poljubnega ID-ja opravila: zdaj ima povezava neposredno aria-label z istim naslovom in ID-jem, zato delujejo tudi presledki v ID-ju.

Dodani so testi S1–S6 v `tests/agent/order.spec.ts` (S6 za 0 in 1 opravilo). Končni `npm run check` je uspel: ESLint, TypeScript, produkcijska gradnja in **53/53 testov** (38 osnovnih, 8 razvojnih P10, 7 lastnih). Testni del je trajal 27,5 s. Dokaz: [check-final.log](check-final.log), poročilo Playwright: `playwright-report/html/index.html`.

Zgodovina preverjanja:

- Prvi `npm run lint && npm run build`: lint uspešen, TypeScript je našel preširoko združeno vejo tipa OrderAction. Popravljeno v ločene diskriminirane variante za undo/redo/reset.
- Prvi celotni `npm run check`: lint, tipi in gradnja uspešni, 52/53 testov uspešnih; [check.log](check.log). Lastni S4 je napačno pričakoval `:focus-visible` po programskem fokusu, ko je bil brskalnik še v miškinem načinu. Test zdaj uporabi Tab in Shift+Tab, preveri viden fokus ter izvede premik z Enter. Produkcijska koda zaradi tega testa ni bila spremenjena.
- Ponovni celotni `npm run check`: 53/53 uspešnih; končni dnevnik zgoraj. Noben skupni test ni bil spremenjen.
- Lokalni ogled na 5193/3123 prek `chromium.connect(wsEndpoint)`: oba pogleda pri 1440 in 390 px. Izmerjeno `scrollWidth === innerWidth` v vseh štirih primerih; [manual-check.json](manual-check.json). Opravljeno tudi vizualno branje posnetkov preglednice ter table; ohranjeni navigacija, sistemska pisava, nevtralne površine, modri poudarki, statusni stolpci in notranje drsenje.
- Dokazi izgleda: [preglednica 390](folio-table-390.png), [tabla 390](folio-board-390.png), [preglednica 1440](folio-table-1440.png), [tabla 1440](folio-board-1440.png). Lastni S4 dodatno shrani [mobilno tablo z dolgim naslovom](mobile-board.png) in [mobilno preglednico](mobile-table.png).
- Statično iskanje v `src/` ni našlo `localStorage`, `sessionStorage` ali `/__test/`. Obstoječa funkcija `updateTask` ostaja samo definirana v `src/api.ts`; nova funkcionalnost je ne kliče. S1/S4/S5/S6 spremljajo omrežje in preverijo nič zapisov ter nespremenjeno število shranjevanj strežnika.

## Sledljivost R01–R12

S1–S6 pomenijo dejansko izvedene teste iz [order.spec.ts](../../tests/agent/order.spec.ts), D01–D04 pa razvojne teste iz `tests/development/P10.spec.ts`, izvedene za namizni in mobilni prikaz. Vsi spodaj navedeni testi so uspešni v `check-final.log`.

| Zahteva | Pogoj in del kode | Izvedeni dokaz |
| --- | --- | --- |
| R01 | `useTaskOrder`: inicializacija iz GET polja, Map po ID; `TaskSection` in `TaskBoard`: globalna mesta. | S1 preveri 13 opravil, drugačen red, enake naslove, Unicode/ločila in ID s presledkom, poševnico ter narekovajem; S3 uporablja 24 opravil. |
| R02 | `orderReducer` veja move zamenja sosednja ID-ja v kopiji reda; izvornih Task objektov ne spreminja. | D01, S1, S2, S3 in S4 primerjajo celotne pričakovane permutacije; S1 podrobnosti, S4 stanja. |
| R03 | Guard za neznan ID in globalni rob vrne isto stanje; `TaskOrderControls` onemogoči gumba na robovih. | D01, S2 večkrat poskusi klik onemogočenih robnih gumbov ob treh ponovitvah, red in zgodovini ostanejo enaki; S6 oba roba pri N=1. Neznan ID preverjen statično, saj UI ponuja samo obstoječe ID-je. |
| R04 | Veja undo obnovi zadnji celotni posnetek in sedanji red prenese v redo. | D02, S2, S3 po vsakem koraku preverijo celotni red in oba števca. |
| R05 | Veja redo obnovi vrh sklada redo in shrani sedanji red v undo. | S2 tri undo/redo ter mešani koraki; S3 vseh 20 undo in redo brez izgube ali podvajanja ID-jev. |
| R06 | Veljaven move nastavi redo na []; robni guard stanja ne spreminja. | D03, S2 nova veja po dveh razveljavitvah in robni no-op ob nepraznem redo. |
| R07 | `remember` omeji zgodovino na zadnjih 20; uporablja se pri move, redo in reset. | S3: po 21 premikih 20 undo obnovi red po prvem premiku; 20 redo obnovi zadnji red. Reset pri polnem skladu odstrani najstarejši preostali posnetek, 20 undo pride do reda po drugem premiku. |
| R08 | Veja reset ob drugačnem redu doda en posnetek in počisti redo; `isInitial` onemogoči obnovo izvornega reda. | D04, S2 reset z nepraznim redo, undo in redo obnove, onemogočena obnova v izhodišču ohrani redo; S3 meja 20 pri obnovi. |
| R09 | `TaskSection` izriše urejene Task objekte; `TaskBoard` jih filtrira v stalne stolpce in uporablja globalno Map mest. | D04, S4 premik čez drugi status spremeni globalni mesti, nato premik istega statusa spremeni relativni red kartic; primerjava s preglednico in števci. |
| R10 | Hook je v TaskSection pod `ProjectView key={project.id}`, zunaj vej pogledov in podrobnosti. Reload znova prebere API. | S5 ohrani oba neprazna sklada skozi preklop, zaprtje podrobnosti z gumbom in Escape; preveri nadaljevanje zgodovine, oba projekta, vrnitev in reload. Osnovni regresijski testi pokrijejo navigacijo in retry. |
| R11 | Status iz dolžin obeh skladov; disabled za nič; začetni prazen/enojni red ostane veljaven. | S2/S3 preverjata oba števca in disabled po korakih; oba S6 preverita oba projekta, oba pogleda in navigacijo pri N=0 oziroma N=1. |
| R12 | Reducer spreminja samo ID-je, števci izhajajo iz izvornih Task objektov, podrobnosti ostanejo GET po ID; Folio slogi in ločeni gumbi. | S1 preveri podrobnosti posebnega ID-ja in števce, S4 članstvo stolpcev, tipkovnico ter gumbe zunaj povezav; S1/S4/S5/S6 nič zapisov. Osnovni testi preverijo regresije podrobnosti. S4/S6 ter lokalni ogled preverijo širino 390 px. |

## Omejitve in predaja

Spreminjam samo src/, tests/agent/ in lastne zapise docs/agent/. Infrastruktura, odvisnosti, skupni testi in navodila so samo berljivi. Javni internet je blokiran; uporabljam samo izvoženi projekt in lokalne storitve. Chromium je treba povezati prek wsEndpoint iz task/browser.json, chromium.launch() ni dovoljena delujoča pot. Drugih agentov ne zaganjam. Rok implementacije: 09:34:40.913 UTC; zadnja minuta je namenjena predaji, zadnjih šest minut skupnega časa pregledu in popravkom.

Omejitev okolja: poskus uporabe `python3` je vrnil napako manjkajočega Xcrun/CommandLineTools, še preden je skript spreminjal datoteke. Uporabljen je bil Node. npm opozarja na obstoječo nastavitev `http-proxy`, Node pa na kombinacijo NO_COLOR/FORCE_COLOR; preverjanja kljub temu uspejo. Infrastruktura ni bila prilagojena.

Neizvedeno: nedostopni končni testi, dejanski fizični telefon in ročno preverjanje z bralnikom zaslona. Testi uporabljajo nameščeni Chromium. Nove sočasne spremembe podatkov brez osvežitve so po navodilih zunaj obsega. Napake predane specifikacije ali znane neizpolnjene zahteve niso bile ugotovljene.

Predaja je pripravljena več kot 60 sekund pred rokom faze. Pregledovalec naj uporabi končni dnevnik, sledljivost in posnetke zgoraj ter samostojno pregleda implementacijo. Specifikacija, njena zgodovina in review.md/review.json niso bili spremenjeni.

Lokalni strežnik za ogled na 5193/3123 je po pregledu ustavljen; testni strežnik je zaključil skupaj s Playwrightom. Pregledovalec lahko storitvi ponovno zažene po navodilih.
