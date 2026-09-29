# Implementacija in preverjanje P04-B-003

## Začetni zapis — izvajalec

Faza implementacije se je začela 2026-09-27; časovni proračun ob začetku je bil 557 s za fazo in 917 s za celoten postopek (`node task/time-budget.mjs`). Rok faze je 2026-09-27T14:00:16.790Z. Pregledana so bila `PROJECT_RULES.md`, `task/instructions.md`, `task/specification-template.md` in predana `docs/agent/specification.md`.

Predana specifikacija pokriva R01–R12. Izvirna navodila ostajajo merodajna. Načrt preverjanj: pregled obstoječe implementacije in razvojnih testov; implementacija vseh zahtev brez posega v skupno infrastrukturo; zagon `npm run check`; po potrebi razvojnih Playwright testov; pregled diff-a in dejanskih rezultatov. Lastni robni testi bodo dodani v `tests/agent/`, če ostane dovolj časa.

### Še neizvedeno ob začetku

- Pregled izvornih komponent, API-ja, slogov in razvojnih testov.
- Implementacija R01–R12.
- Dodajanje/izvedba lastnih preverjanj za Unicode, stabilnost, prazne/enojne podatke, reset, menjavo projekta, sočasnost pogledov in širino 390 px.
- `npm run check` ter morebitni ločeni razvojni testi.
- Končni pregled sprememb in zapis dokazov/omejitev.

### Omejitve okolja opažene ob začetku

- `git status --short && git branch --show-current` ni uspel: `xcrun` javlja manjkajočo aktivno Command Line Tools pot. Stanja veje/diff zato še ni bilo mogoče ugotoviti.
- Javni internet je po navodilih nedostopen; Chromium in odvisnosti naj bi bili lokalno nameščeni. Uporabniški vmesnik sme klicati samo obstoječi `/api/`, ne `/__test/`.

## Dnevnik implementacije in preverjanj

### Izvedene spremembe

- `src/App.tsx`: dodani so štirje lokalni kontrolniki in `Izvorni vrstni red`; seznam se kopira z izvornimi indeksi in razvrsti s primarnim ključem, neodvisnim sekundarnim ključem ter izvornim indeksom za stabilnost. `original` vrne izvorno polje in prezre preostale nastavitve. Besedilni ključi uporabijo NFD, odstranitev U+0300–U+036F, male črke in primerjavo z `<`/`>`; stanja imajo ekspliciten rang, veljavni datumi se primerjajo po ISO zapisu. Tabla in preglednica prejmeta isto urejeno projekcijo; števci še vedno izhajajo iz izvornega polja.
- Nastavitve so `useState` v `ProjectView`, ki ima ključ projekta; preklop pogleda in prikaz podrobnosti ga ne odstranita. Osvežitev ali menjava projekta zato začneta s privzetimi vrednostmi, brez URL-ja ali trajne shrambe.
- `src/styles.css`: dodan je zadržan slog kontrolnikov Folio; kontrolniki se prelomijo v več vrstic in ne širijo strani na ozkem zaslonu.
- `tests/agent/sorting.spec.ts`: dodani so štirje testi za normalizacijo in stabilnost besedila, samostojni smeri, ohranitev stanja, ponastavitev ob menjavi projekta/osvežitvi, prazne/enojne podatke.

### Sledljivost zahtev in izidi

| Zahteva | Koda oziroma pogoj | Dejanski dokaz |
| --- | --- | --- |
| R01 | `initialSortSettings`; `ProjectView` prikaže `orderedTasks`. | D01 na namizju in mobilnem profilu ter agentni testi: privzeti vrstni red ustreza API polju. |
| R02 | `compareText` izvede NFD, odstrani U+0300–U+036F, zniža črke in uporabi `<`/`>`; brez lokalnega ali številskega primerjanja. | D01 preveri naslove; lastni test preveri naslov in odgovorno osebo z NFC/NFD, diakritiko ter `Alfa 10` pred `alfa 2`. |
| R03 | `compareByKey` uporablja `statusOrder` in leksikografski veljavni ISO datum. | D02 preveri rang stanj in datum kot sekundarni ključ; D03 preveri vrstni red table. |
| R04 | Smer množi samo rezultat posameznega comparatorja. | D02 ter lastni asc/desc primer s skupinami enakih naslovov. |
| R05 | Sekundarni comparator se kliče samo, ko je primarni rezultat 0, z lastnim predznakom. | D02 in lastni primer s štirimi nastavitvami. |
| R06 | Izvorni indeks je zadnji kriterij; `original` se vrne pred obdelavo drugih nastavitev. | Lastni test preveri stabilne NFC/NFD izenačitve v obeh smereh in podvojeni ključ; D01/D04 preverita izvorni vrstni red. |
| R07 | `TaskBoard` in preglednica uporabljata isti `orderedTasks`; `TaskBoard` ohranja fiksne stolpce in filtrira seznam. | D03 na namizju in mobilnem profilu; lastni test preklopi pogled in preveri enak globalni vrstni red v tabeli. |
| R08 | Stanje ostane v `ProjectView` med spremembo `view` in prikazom/skritjem `TaskDetails`. | Lastni test nastavi vse štiri vrednosti, preklopi na tablo, odpre/zapre podrobnost in vrne tabelo; nastavitve ostanejo enake. |
| R09 | Lokalni začetni state, brez persistence; `ProjectView key={project.id}`. | Lastni test potrdi privzete vrednosti po menjavi projekta in po `page.reload()`. Pregledana koda ne zapisuje kontrol v URL ali trajno shrambo. |
| R10 | Gumb ponastavi celoten objekt nastavitev. | D04 in lastni test za prazen in enoopravilni projekt; ponastavitev vrne vse štiri kontrole na privzete vrednosti. |
| R11 | Razvrščanje je projekcija novih parov `{ task, index }`; izvirno polje/objekti in števci se ne spreminjajo, ni zapisovalnega klica. | D04 preveri brez zapisov; pregled kode potrdi kopijo pred `sort` in števce nad `tasks`. |
| R12 | Ključi vrstic/kartic in povezave ostanejo po `task.id`; obstoječe oznake in podrobnosti so ohranjene. | Osnovni namizni/mobilni testi preverijo podrobnosti po ID in dostopnost; D04 preveri širino dokumenta, agentni enojni test prav tako. Razvojni mobilni zagon pokriva 390 px profil in notranji pomik table/preglednice. |

### Izvedeni ukazi in omejitve

- `npm run check` — uspešno: lint, TypeScript, Vite build in vseh 50 Playwright testov (14 API + 24 osnovnih namiznih/mobilnih + 8 razvojnih namiznih/mobilnih + 4 lastni); končni izhod `50 passed (19.7s)`. Vmesni prvi poskus je razkril napako izolacije lastnega testa, ne aplikacije; test je bil razdeljen na ločeni strani in uspešno preverjen še z `npx playwright test --project=agent` (4 passed), nato pa še enkrat v celotnem uspešnem zagonu.
- Chromium je bil uporabljen prek nastavljenega `wsEndpoint` v `task/browser.json` preko Playwright configa; `chromium.launch()` ni bil uporabljen. Razvojni namizni in mobilni projekti so vključeni v zgornji `npm run check`.
- npm izpiše opozorilo `Unknown env config "http-proxy"`; ni vplivalo na uspeh. Javni internet ni bil potreben in ni bil uporabljen.
- Git status/veje ni bilo mogoče preveriti: `git status --short && git branch --show-current` se je končal z napako `xcrun: error: invalid active developer path ... missing xcrun`. Zato delovnega drevesa/veje z Git orodjem ni bilo mogoče neodvisno popisati.
- Končni, ločeno pripravljeni testi niso bili dostopni. Ročni vizualni pregled pri 390 px ni bil izveden; avtomatska mobilna preverjanja širine dokumenta so uspela. Pri pregledani specifikaciji ni bilo ugotovljene napake.
