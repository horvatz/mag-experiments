# P02 – implementacija in preverjanje

Vloga: implementer. Začetni zapis shranjen pred spremembami kode. Prebrani so `PROJECT_RULES.md`, `task/instructions.md`, predloga in predana `specification.md`; izvirne zahteve R01–R12 ostajajo obvezne. Specifikacija in pregledni dokumenti ostanejo nespremenjeni.

## Načrt in trenutno stanje

Začetni načrt je bil shranjen pred spremembami in je vsa preverjanja označeval kot še neizvedena. Ob predaji:

- Opravljeno: pregled obstoječih komponent in potrjenega dizajna Folio.
- Opravljeno: izbor po ID in skupne kontrole za oba pogleda (R01–R04), neodvisne zahteve in sprotni rezultati (R05–R07), ponavljanje ter zaklep (R08–R11), ohranitev podatkov in dizajna (R12).
- Opravljeno: lastni testi v `tests/agent/` za večkratno ponavljanje, sprotno prikazovanje, ponastavitve, zaklepe in nespremenljivost podatkov.
- Opravljeno: `npm run check` ter pregled posnetkov pri 1440/390 px. Končni rezultat: 57 uspešnih testov, brez neuspehov.

## Omejitve okolja in obsega

Dovoljene so spremembe samo `src/`, `tests/agent/` in lastnih zapisov v `docs/agent/`. Infrastruktura, odvisnosti, skupni testi in navodila so samo berljivi. Uporabljajo se samo lokalne storitve in izvoženo gradivo. Javni internet je blokiran. Chromium je že nameščen; ročne skripte morajo uporabiti `chromium.connect(wsEndpoint)` iz `task/browser.json`, ne `launch()`. Navigacija ali osvežitev med shranjevanjem in sočasne zunanje spremembe so zunaj obsega naloge.

## Spremembe, sledljivost in dejanski rezultati

Implementirano:

- `src/useBulkTaskStatus.ts`: izbor ID-jev, posnetek cilja, neodvisne sočasne zahteve, sprotno potrjeno stanje, napake, kumulativni uspehi, ponavljanje samo neuspešnih in sinhrona zaščita pred dvojnim zagonom (R01–R11).
- `src/BulkTaskControls.tsx`: skupni izbor z `indeterminate`, števec, cilj, dejanja, dostopna sporočila in zaklepi (R02, R04, R07–R11).
- `src/App.tsx`, `src/TaskBoard.tsx`: izbor v obeh pogledih; stanje operacije ostaja v `ProjectView`, ki ima ključ projekta (R01–R03, R06, R12).
- `src/useResource.ts`: funkcionalna posodobitev potrjenih podatkov za ustrezni ključ vira; spreminja se samo stanje uspešnega ID-ja (R06, R12).
- `src/styles.css`: kontrole uporabljajo barve, obrobe in zaobljenosti Folio; prelom kontrol in dolgih napak, samostojna potrditvena polja na karticah (R12).
- `tests/agent/bulk-status.spec.ts`: 11 dodatnih testov; vključeni sta širini 1440/390 px in vsa tri ciljna stanja.

Prvo preverjanje `npm run lint && npm run typecheck`: uspešno, izhodna koda 0. Prvi celotni `npm run check`: uspešno, izhodna koda 0, 56 testov (38 osnovnih, 8 razvojnih, 10 lastnih), 24,1 s za teste. Dnevnik: [check.log](check.log).

Vizualno pregledana dejanska posnetka namizne preglednice po uspehu (1440 px) in mobilne table po delnem neuspehu (390 px). Navigacija, tipografija, kartice in barve Folio so ohranjene; nove kontrole in napake se prelomijo znotraj strani. Samodejni testi so dodatno potrdili širino dokumenta. Posnetki so v `test-results/run/agent-bulk-status-E05-*/bulk-*.png`.

Po prvem uspešnem zagonu dopolnjen R10: ob ponovitvi stara opozorila in gumb za ponovitev ostanejo vidni do izidov; gumb je med shranjevanjem onemogočen. Dodan E10 z zadržano ponovitvijo, preverjanjem vseh zaklepov in hitrih zaporednih dogodkov. Končni `npm run check` je uspešen, izhodna koda 0: lint, typecheck, produkcijska gradnja ter **57 testov (38 osnovnih + 8 razvojnih + 11 lastnih), 24,8 s za teste**. Dokaz: [check-final.log](check-final.log), poročilo `playwright-report/html/index.html`. Po tem zagonu je bil dopolnjen samo ta dokument.

Git ni uporaben: `git status --short` je vrnil `xcrun: error: invalid active developer path (/Library/Developer/CommandLineTools)`. Veja, oddaja in oddaljene storitve niso del izvedbe. Za zdaj ni ugotovljenih napak predane specifikacije.

## Predikati implementacije

Naj bo `O` začetni izbor operacije, `t` zajeti cilj, `C` množica uspešnih ID-jev in `F` neuspešni ID-ji po končanem poskusu. Prvi poskus pošlje `A = O`; ponovitev pošlje `A = F`. Za vsak `i ∈ A` se pošlje natanko en `{ title: B[i].title, status: t }`, tudi če je `B[i].status = t`. V kodi so opravila poskusa posnetek prebranih objektov, cilj pa `Operation.target`.

Po končanem poskusu velja `C ∩ F = ∅`, `C ∪ F = O`, povzetek pa je `(X,Y) = (|C|,|F|)`. `Operation.successful` je množica, zato ne šteje ponovljenih ID-jev dvakrat. Če `F ≠ ∅`, sta izbor `I = F` in cilj `t`; sicer sta izbor prazen in cilj `""`.

Za podatke vseh projektov po posameznih potrjenih odgovorih velja `D[i] = B[i]` za `i ∉ C` ter `D[i] = { ...B[i], status: t }` za `i ∈ C`. Posodobitev vira kopira samo `status` uspešnega ID-ja; zavrnitev ne izvede lokalne spremembe ali povratnega zapisa. Testni `onlyStatuses` primerja vsa polja vseh opravil, tudi v drugih projektih.

Med izvajanjem je `running.current = true` postavljen sinhrono pred prvo zahtevo. Vsa vstopna dejanja preverijo to varovalo. Kontrole so zaklenjene pri `progress ≠ null ∨ F ≠ ∅`, razen ponovitve/čiščenja po končanem neuspehu. Čiščenje izprazni stanje operacije brez PATCH; `ProjectView key={project.id}` zagotovi neodvisnost projektov.

## Sledljivost R01–R12

Imena E… pomenijo dejanske teste v [bulk-status.spec.ts](../../tests/agent/bulk-status.spec.ts); D… so nespremenjeni razvojni testi. Vsi navedeni testi so uspešni tudi v končnem celotnem zagonu, vključno z E10.

| Zahteva | Implementacija | Dejanski dokaz |
| --- | --- | --- |
| R01 | `App.tsx` in `TaskBoard.tsx`: samostojna polja; `useBulkTaskStatus.toggle`: ID | E01 pri 1440/390 px: enaka naslova, neodvisen izbor, brez dialoga; uspešno. |
| R02 | `BulkTaskControls`: skupno polje, `indeterminate`, števec | E01 in E01-empty: nič/del/vse, oba pogleda, prazen projekt; uspešno. |
| R03 | Stanje hooka v `ProjectView` s ključem projekta | E01, E05, E02/E06, E03: ohranitev med pogledi, reset projekta/osvežitve, ohranitev shranjenih podatkov; uspešno. |
| R04 | `target`, `changeTarget`, onemogočen običajni gumb | D01, E01, E03 za vse tri cilje: pogoji, brez zapisov pred potrditvijo; uspešno. |
| R05 | `send`: po en `updateTask` za vsak posneti objekt | D02, E03, E05: točni ID-ji, telesa, tudi že doseženi cilj; uspešno. |
| R06 | `useResource.updateData` ob posameznem uspehu | E04: uspeh med zadržanim odgovorom in oba pogleda/števci; E03: podrobnosti in osvežitev; uspešno. |
| R07 | Neodvisen `try/catch`, zbrana opozorila za vsak ID | D03, E04, E05, E02/E06: delni in popolni neuspeh, opozorila in podatki; uspešno. |
| R08 | `retryFailed` zajame samo objekte v `failures` | D03, E05, E02/E06: večkratne zavrnitve in zahteve samo za neuspešne; uspešno. |
| R09 | Množica `successful`, rezultat in končni reset | E05: `(1,2) → (2,1) → (3,0)`, števila zahtev `web-03:1`, `web-01:2`, `web-02:3`; uspešno. |
| R10 | `running` in `locked`, onemogočene kontrole, napredek | D04, E04, E05: zaklep in hitri dogodki; E10: zadržana ponovitev, vsi zaklepi in brez podvojenih zahtev; uspešno. |
| R11 | `clear`: reset brez zapisov ali povratnih sprememb | D01, E04: čiščenje po delnem uspehu, nova operacija s svežim povzetkom; uspešno. |
| R12 | PATCH vsebuje le naslov/stanje; lokalno se spremeni le stanje; slogi Folio | `onlyStatuses` v E03–E05/E10, 38 osnovnih testov, mobilni razvojni testi in vizualni pregled; uspešno. |

## Preostale omejitve preverjanja

Ni bilo ročnega preizkusa z bralnikom zaslona; dostopna imena, native polja, stanja in vloge preverjajo testi. Vizualno sta pregledana navedena posnetka, ne vsaka kombinacija ciljnega stanja in velikosti zaslona. Testi uporabljajo priložen javni testni transport z resničnim lokalnim API-jem; UI ne uporablja `/__test/`, `localStorage` ali lokalne kopije baze. Niso preverjani scenariji, ki jih izvirna naloga izrecno izloča.

## Predaja pregledovalcu

Implementacija in preverjanje sta zaključena pred rokom faze, z več kot minuto rezerve. Ni znane neizpolnjene zahteve ali ugotovljene napake predane specifikacije. Dokumenta specifikacije in njene zgodovine ter datoteki pregledovalca niso bili spreminjani. Strežnik, skupni tipi, odvisnosti, skupni/razvojni testi in konfiguracija niso bili spreminjani. Vse spremembe aplikacije so v šestih datotekah `src/` (dva nova modula in štiri dopolnjene), lastni testi so v eni datoteki `tests/agent/`; izvedbeni dokazi so ta dokument in oba dnevnika.

Pregledovalec lahko začne pri tabeli sledljivosti ter `useBulkTaskStatus.ts`, nato primerja `check-final.log` in teste z izvirnimi R01–R12. Ponovni zagon je `npm run check`; dodatne namestitve ali konfiguracija niso potrebne. Znana okoljska omejitev ostaja nedelujoč sistemski Git zaradi Xcode poti.
