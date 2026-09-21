# P10 — preverjanje izvedbe

2026-09-22. Podlagi: [specifikacija](P10/spec.md), [načrt](P10/plan.md), [naloge](P10/tasks.md); merilo so izvirne R01–R12. Po navodilu koraka implement je osrednji dnevnik tukaj, namesto v podimeniku P10.

Dovoljene spremembe: `src/`, `tests/agent/`, `docs/agent/` in dve izrecno dovoljeni procesni datoteki Spec Kit. Infrastruktura, odvisnosti, strežnik in skupni testi ostanejo nespremenjeni.

## Dnevnik

- Začetek: prebrani kontekst in naloge, preverjen čas. Implementacija in testi še neizvedeni. Končni skriti testi niso dostopni.
- T002–T003: reducer hotov. `npx playwright test tests/agent/taskOrder.spec.ts --project=agent`: **5/5 uspešno**; [dnevnik](P10/model-tests.log). Preverjeni nespremenljivost, robovi, razvejitev, reset, 21 premikov/20 undo/20 redo in prazno/eno opravilo.
- T004–T006: povezani preglednica in tabla, skupne kontrole in zgodovina. Stanje se inicializira ob prikazu naloženih opravil; obstoječi ključ projekta določa ponastavitev. Dopolnjeni so samo slogi novih kontrol. Preverjanje vmesnika sledi.
- Prvi `npm run check`: lint uspešen, preverjanje tipov je odkrilo napačno možnost `disabled` v dveh lastnih testnih trditvah. Popravljeno na podprti `toBeEnabled({ enabled })`; aplikacijska koda ni bila vzrok. [Prvi dnevnik](P10/check-first.log). Ponovni celovit zagon sledi.
- Drugi `npm run check`: lint, tipi in gradnja uspešni; **57/58 testov uspešno** (vseh 38 osnovnih in 8 razvojnih uspešnih). A06 je po miškini menjavi pogleda programatsko nastavil fokus in napačno pričakoval `:focus-visible`. Test je popravljen na dejansko tipkovnično navigacijo Tab/Shift+Tab; preverjanje vidnega fokusa ostaja. [Drugi dnevnik](P10/check-second.log).
- Vizualni skript `node docs/agent/P10/visual.mjs` prek `chromium.connect`: oba pogleda pri 1440 in 390 pikah, širina dokumenta je enaka širini okna. [Meritve](P10/visual.json); posnetki so v imeniku P10. Vmesnik ohranja Folio, nove kontrole so kompaktne in vrstica zgodovine se prelomi.
- Končni `npm run check`: **uspešen, izhodna koda 0**. Lint, TypeScript in produkcijska gradnja uspešni; **58/58 testov v 23,6 s**: 38 osnovnih, 8 razvojnih P10, 12 lastnih (7 uporabniških, 5 modelnih). [Celotni dnevnik](P10/check.log). Po tem zagonu aplikacijska koda in testi niso več spremenjeni.
- Vizualno pregledani vsi štirje posnetki: [preglednica 1440](P10/folio-1440-table.png), [tabla 1440](P10/folio-1440-board.png), [preglednica 390](P10/folio-390-table.png), [tabla 390](P10/folio-390-board.png). Ohranjeni meni, tipografija, barve, kartice in stalni stolpci. Na telefonu je drsenje notranje; A06 je preveril tipkovnično dejanje in vidni fokus.
- Pregled obsega po časih sprememb od začetka pilota: [zapis](P10/scope-audit.json), brez sprememb zunaj dovoljenih poti (generirani build/test artefakti izločeni). `git status/diff` ni deloval zaradi manjkajoče sistemske poti CommandLineTools; infrastrukture nisem popravljal. Časovni pregled ni primerjava vsebine z izhodiščem. Vsi izvedeni ročni zapisi so bili v dovoljenih poteh.

## Izvedba in sledljivost R01–R12

P1–P8 in S1–S6 so opredeljeni v [specifikaciji](P10/spec.md). M01–M05 so konkretna imena testov v [taskOrder.spec.ts](../../tests/agent/taskOrder.spec.ts), A01–A06 v [P10.spec.ts](../../tests/agent/P10.spec.ts); A05 ima dva primera (0 in 1 opravilo). D01–D04 so nespremenjeni razvojni testi, izvedeni na obeh velikostih. Vse spodnje oznake »uspešno« se nanašajo na lokalna dokazila iz končnega [check.log](P10/check.log).

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | P1: vhodno zaporedje in mesta po ID-ju | M01, A01 (13 poljubnih ID-jev in enaka naslova), D01 | `src/taskOrder.ts:createOrder`; `src/App.tsx:ProjectTasks`; `src/TaskOrderControls.tsx` | Uspešno, check.log. |
| R02 | P2/P3: neposredni globalni sosed, nespremenjena polja | M01/M02, A01 v obeh pogledih | `src/taskOrder.ts:orderReducer(move)`; `src/App.tsx:move`; `src/TaskBoard.tsx` | Uspešno; A01 primerja polja po ID-ju pred/po premiku. |
| R03 | P3: oba roba in ponovljen neveljaven korak | M02/M05, A01/A02, D01 | `src/taskOrder.ts:orderReducer(move)`; `src/TaskOrderControls.tsx:disabled` | Uspešno; neveljavna dejanja ohranijo oba sklada. |
| R04 | P3/P4: polni posnetki in undo | M01/M03, A02/A03, D02 | `src/taskOrder.ts:remember/undo`; `src/App.tsx:ProjectTasks` | Uspešno; primerjave celotnih zaporedij. |
| R05 | P2/P5: pravilni večkratni redo | M01/M03, A02/A03, D02 | `src/taskOrder.ts:orderReducer(redo)` | Uspešno; 20 ponovitev po 20 razveljavitvah. |
| R06 | P3: nova veja počisti R, neveljaven korak ga ohrani | M02, A02, D03 | `src/taskOrder.ts:move/remember` | Uspešno; obe poti iz nepraznega R. |
| R07 | največ 20 prejšnjih permutacij | M03 (24 ID-jev/21 premikov), A03 (21 premikov) | `src/taskOrder.ts:remember/redo`, `slice(-20)` | Uspešno; najstarejši posnetek izrinjen, 20 undo/redo. |
| R08 | P6: razveljavljiv reset in reset brez učinka | M02/M04, A02, D04 | `src/taskOrder.ts:isInitialOrder/reset`; `src/App.tsx` | Uspešno; reset počisti R samo ob spremembi. |
| R09 | P7: relativni stolpci, globalni sosed/mesto | A01, D04 | `src/TaskBoard.tsx:positions/entries`; `src/App.tsx:orderedTasks` | Uspešno; soseda različnih statusov, stolpci in mesta preverjeni. |
| R10 | P8: ohranitev ob pogledu/podrobnostih, reset projekta/osvežitve | A04, osnovni navigacijski testi | `src/App.tsx:ProjectTasks` in `ProjectView key={project.id}` | Uspešno; A04 z obema nepraznima skladoma, vrnitev v projekt in osvežitev. |
| R11 | status in gumbi sledijo dolžinam; N=0/1 | M05, A02/A03/A05, D03 | `src/App.tsx:order-toolbar`; `src/TaskOrderControls.tsx` | Uspešno; točno besedilo, omogočenost, oba prazna projekta in eno opravilo. |
| R12 | P2/P7, brez zapisov in nespremenjen Folio | A01/A02/A04/A05/A06, D04, vseh 38 osnovnih | `src/taskOrder.ts`; `src/App.tsx`; `src/TaskBoard.tsx`; `src/styles.css:order-* / task-order-* / board-task` | Uspešno; nič zapisov, nespremenjena polja/števci/podrobnosti; 390 px in štirje pregledani posnetki. |

## Omejitve in predaja

Ni znane neizpolnjene obvezne zahteve R01–R12 v lokalnem preverjanju. Končni skriti testi niso dostopni in niso bili izvedeni. Primeri so končna množica preverjanj splošnih pravil, ne dokaz za vse možne vhodne podatke. Fizični telefon ni bil uporabljen; preverjen je Chromium pri 390 pikah ter obstoječa telefonska emulacija.

Spremenjena aplikacija: `src/App.tsx`, `src/TaskBoard.tsx`, `src/styles.css`; dodana `src/taskOrder.ts` in `src/TaskOrderControls.tsx`. Dodana sta dva testna modula pod `tests/agent/`. Javnega API-ja, strežnika, skupnih tipov/testov in nastavitev ni bilo treba spreminjati. Naslednji korak `converge` sproži izvajalnik.
- Predaja: preverjene lokalne povezave dokumentov, vseh 12 vrstic sledljivosti in devet zaključenih nalog. Ročni razvojni strežnik 5193/3123 je ustavljen. Kontrolni seznam kakovosti zahtev ni bil spreminjan.
