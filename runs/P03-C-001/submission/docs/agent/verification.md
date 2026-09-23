# P03 — Preverjanje izvedbe

2026-09-24 · postopek C · Spec Kit 1.0.8 / Lean 1.0.0.

Izvedba vseh R01–R12 je zaključena. `npm run check` je uspešen (izhodna koda 0): lint, preverjanje tipov, produkcijska gradnja in **56/56 testov** — 38 osnovnih (14 API + 12 desktop + 12 mobile), 8 razvojnih P03 ter 10 lastnih. Dokaz: [celoten dnevnik z ukazom, časoma in izhodno kodo](P03/evidence/check.log).

Podlaga: [specifikacija in predikati](P03/spec.md), [načrt](P03/plan.md), [naloge](P03/tasks.md), [izvirne zahteve](../../task/instructions.md).

## Spremembe

- [src/taskFilters.ts](../../src/taskFilters.ts): čisto normalizirano iskanje po štirih poljih, vse besede kot dobesedni podnizi, presek s stanjem in natančno osebo; vhodni podatki ostanejo nespremenjeni.
- [src/App.tsx](../../src/App.tsx): tri projektne kontrole, enkratna ponastavitev, možnosti oseb iz celotnega projekta, isti rezultat za preglednico/tablo, usklajeni števci in ločeni prazni stanji. Obstoječi ključ projekta ponastavi lokalno stanje; filtri ne uporabljajo URL-ja ali shrambe.
- [src/styles.css](../../src/styles.css): omejeni slogi novih kontrol in statusa, prilagojeni tudi ozki širini.
- [tests/agent/P03.spec.ts](../../tests/agent/P03.spec.ts): 10 dodatnih testov S01–S08 z neodvisnimi pričakovanji, nadzorovanimi GET podatki in posnetki. S06 in S08 imata po dva primera.

API, strežnik, skupni tipi/testi, nastavitve, odvisnosti, obstoječa tabla in podrobnosti niso bili spremenjeni. Aplikacija ne uporablja testnih kontrol; testni pripomoček se uvaža samo v lastnih testih.

## Sprotni potek in rezultati

1. Ob začetku je bil ustvarjen ta dnevnik z oznako, da testi še niso izvedeni.
2. T001–T005: pripravljeni robni podatki; izvedeni filter, lokalno stanje, kontrole, rezultati in slogi.
3. T006: dodanih 10 testov; v tem trenutku še brez trditve o uspehu.
4. T007: en zagon `npm run check`, izhod 0; **56 passed (21.7s)**. Noben test ni bil preskočen ali popravljen zaradi neuspeha. Gradnja in preverjanje tipov sta del istega ukaza. Okoljska opozorila npm/Node niso povzročila napake.
5. Vizualno pregledani vsi štirje spodaj povezani posnetki. Ohranjen je moder znak F, nevtralna paleta, meni, kartice, tabela in viden fokus po zapiranju podrobnosti. Pri 390 pikah sta projekta nad vsebino, kontrole se prelomijo in stran se ne razširi. Tabla in preglednica se pomikata znotraj svojega prikaza. S08 dodatno preveri širino z dolgim imenom osebe.
6. T008: dopolnjeni dokazi, sledljivost, stanje specifikacije in označbe izvedbenih nalog. Kontrolni seznam kakovosti zahtev ni bil spreminjan.

## Izvedba in sledljivost

Splošni pogoji in simboli so opredeljeni v [specifikaciji](P03/spec.md#predikati-in-spremembe-stanja); spodnji scenariji so konkretni dokazi, ne omejitev veljavnosti pravil. S01–S08 so dejanska imena oziroma predpone testov v [lastni zbirki](../../tests/agent/P03.spec.ts). D01–D04 so [razvojni testi](../../tests/development/P03.spec.ts), izvedeni na desktop in mobile. Vsi navedeni testi so v [check.log](P03/evidence/check.log).

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | `F₀`, vsi ID-ji in izvorni vrstni red | D01; S01 (14 in 1), S06 (0) | `src/taskFilters.ts`: defaultFilters; `src/App.tsx`: ProjectView, visibleTasks | Uspešno; check.log, S01/S06/D01. |
| R02 | NFD, samo U+0300–U+036F, male črke, vsa štiri polja | D01; S02; S07 (znamenje zunaj območja) | `src/taskFilters.ts`: normalize in združevanje polj | Uspešno; check.log, S02/S07/D01. |
| R03 | vse besede, prazne beline, vrstni red, dobesedna ločila | S02: obrnjene besede, tabulator, `.*`, `[`, `+`, prazen vnos | `src/taskFilters.ts`: words, every/includes | Uspešno; check.log, S02. |
| R04 | iskanje IN stanje IN natančna oseba | D02/D04; S03, S05 | `src/taskFilters.ts`: filterTasks; `src/App.tsx`: select kontrole | Uspešno; check.log, S03/S05/D02/D04. |
| R05 | unikatna imena celotnega projekta, neodvisna od rezultata | S03: možnosti pred/po filtriranju; S04: oseba drugega projekta | `src/App.tsx`: assignees iz tasks, Set, filter praznih imen | Uspešno; check.log, S03/S04; izločanje praznih imen potrjeno s pregledom kode (domena določa neprazna imena). |
| R06 | isti ID-ji in ustrezni stolpci; ohranjene kontrole | D02; S05: vse kontrole, vrstni red in števci stolpcev | `src/App.tsx`: visibleTasks za oba pogleda; `src/TaskBoard.tsx`: entries | Uspešno; check.log, S05/D02. |
| R07 | menjava projekta → `F₀`, brez mešanja podatkov | S04; osnovni test `switching project during loading never shows the previous project tasks` | `src/App.tsx`: key projekta; obstoječi `src/useResource.ts`: ključ poti | Uspešno; check.log, S04 in osnovni test na desktop/mobile. |
| R08 | reload → `F₀`; brez URL/shrambe filtrov | S04: URL, localStorage, sessionStorage in reload; pregled kode | `src/App.tsx`: lokalni useState brez trajnega zapisa | Uspešno; check.log, S04. |
| R09 | natančen status N/M in števci iz V | D04; S01, S03, S05, S06 | `src/App.tsx`: counts, role=status, značka in footer; `src/TaskBoard.tsx`: column-count | Uspešno; check.log, navedeni testi. |
| R10 | ločeni nič zadetkov in prazen projekt, uporabna pogleda | D03; oba S06 | `src/App.tsx`: M/N vejitve in sporočilo; nespremenjeni prazni stolpci table | Uspešno; check.log, S06/D03. |
| R11 | enkratna ponastavitev, nespremenjena polja in vrstni red | D03; S03, S06, S07 (zamrznjeni podatki in reference) | `src/App.tsx`: setFilters(defaultFilters); `src/taskFilters.ts`: filter | Uspešno; check.log, S03/S06/S07/D03. |
| R12 | navigacija/podrobnosti, brez zapisov, Folio, 390 pik | D04; S08 pri 1440/390; 24 osnovnih UI testov | `src/App.tsx`: obstoječe povezave/podrobnosti; `src/styles.css`: task-filters in media pravila | Uspešno; check.log in vizualni pregled spodnjih posnetkov. |

## Vizualni dokazi

- [Preglednica pri 1440 pikah](P03/evidence/folio-1440-table.png)
- [Tabla pri 1440 pikah](P03/evidence/folio-1440-board.png)
- [Preglednica pri 390 pikah](P03/evidence/folio-390-table.png)
- [Tabla pri 390 pikah](P03/evidence/folio-390-board.png)

Posnetke je ustvaril S08 v obstoječem Playwright okolju; pregled je vizualen glede na `docs/dizajn.md`, ne avtomatizirana primerjava pikslov.

## Omejitve in predaja

Ni znanih neizpolnjenih obveznih zahtev. Končni testi niso dostopni in niso bili izvedeni. Dokazi veljajo za lokalna preverjanja z nameščenim Chromiumom; drugih brskalnikov nismo preverjali. Testni podatki pokrivajo reprezentativne robne primere, ne vseh možnih besedil; splošni predikati so implementirani neposredno. Nove sočasne spremembe podatkov brez osvežitve niso del dogovorjenega obsega. Bistvenih odprtih vprašanj ni.

Izvedbene naloge T001–T008 so opravljene. Naslednji korak `speckit-converge` sproži izvajalnik; v tem koraku ni bil zagnan.
