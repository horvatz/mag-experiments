# P07 – specifikacija (postopek A, en agent)

## Problem in kontekst

Folio prikazuje opravila trenutnega projekta v preglednici in na tabli ter odpira podrobnosti po ID-ju. Dodatek omogoči neodvisno označevanje priljubljenih, skupni filter obeh pogledov in trajno lokalno shranjevanje globalne množice ID-jev. Obstoječi javni API ostane vir opravil; podatkov opravil ne spreminjamo. Izrecna zahteva P07 za localStorage velja za priljubljene, ne za kopijo podatkov API-ja.

## Vhodi, dejanja in izidi

- Vhodi so projekti in opravila iz `/api/`, zlasti `id`, `projectId` in `status`; ostala polja služijo obstoječemu prikazu. Naslovi niso identifikatorji.
- Stanje: globalna množica nizov F, seznam opravil trenutnega projekta T v vrstnem redu API-ja, projektni filter q (privzeto false), opozorilo ob napaki shrambe.
- Dejanja: preklop posameznega ID-ja, preklop filtra, odstranitev priljubljenih celotnega trenutnega projekta, menjava pogleda/projekta, osvežitev in dogodek `storage`.
- Sprememba priljubljenih takoj spremeni pomnilnik in poskusi zapisati samo `{version:1,ids:[...]}` pod `folio:favorites:v1`. Napaka zapisa ne razveljavi spremembe v pomnilniku. Napaka branja začne s prazno množico in opozorilom. Napačna vsebina začne s prazno množico brez samodejnega popravljanja shrambe.
- Dejanja so takojšnja in ne zahtevajo potrditve; uporabnik lahko preklop ali filter obrne. Navigacija in zapiranje podrobnosti ohranita priljubljene.

## Zahteve in pravila

Naj bo I(T) množica ID-jev vseh opravil trenutnega projekta. Vidni seznam V je T, če q=false, sicer stabilna podsekvenca `[t ∈ T | t.id ∈ F]`. X=|F ∩ I(T)| in M=|T|. ID-ji so enkratni med opravili; lahko se ponavljajo v shranjenem zapisu.

Validacija D(s): če je s veljaven JSON objekt z `version === 1` in poljem `ids`, ki je seznam izključno nizov, vrne množico teh nizov; sicer ∅. Tudi `null` oziroma manjkajoči ključ da ∅. Neznani ID-ji se ne filtrirajo iz F. Zapis S(F) vsebuje `version:1` in enkratne ID-je v privzetem JavaScript vrstnem redu UTF-16 (`sort()` brez primerjalnika).

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Gumb z imenom `Priljubljeno opravilo <id>` in `aria-pressed` je zunaj povezave. Preklop i da F′=F Δ {i}; podrobnosti se ne odprejo. | D01; lastni primer enakih naslovov v obeh pogledih in tipkovnica. |
| R02 | Vsak uporabniški zapis je S(F), brez polj opravil. | D03; lastni primer podvojitev, Unicode in zaporedja. |
| R03 | Začetek/osvežitev uporablja D; neznani ID-ji ostanejo shranjeni, ne ustvarijo vrstic. | D03; lastni primer neznanih in podvojenih ID-jev. |
| R04 | Vsaka neveljavna oblika da ∅; inicializacija ne zapisuje. | Lastni podatkovno vodeni primeri napačnih zapisov in nadzor zapisovanja. |
| R05 | Checkbox ima dogovorjeno ime; q=false ob začetku; V ohrani vrstni red T. | D02; lastni primer drugačnega vrstnega reda. |
| R06 | Pri q=true odstranitev takoj skrije opravilo. Če V=[], je vidno `Ni priljubljenih opravil.` in filter je še dosegljiv. | D02; lastni primer obeh pogledov in praznega projekta. |
| R07 | Pogleda uporabljata isti F in q, podrobnosti ostanejo vezane na ID. | D04; lastni prehod preglednica–tabla–podrobnosti. |
| R08 | Menjava projekta in osvežitev nastavita q=false; F se pri menjavi ohrani, pri osvežitvi obnovi iz shrambe. | Lastni primer dveh projektov in osvežitve. |
| R09 | Odstranitev projekta da F′=F \\ I(T), tudi ob aktivnem filtru; gumb je onemogočen natanko pri X=0. | Lastni primer dveh projektov, neznanega ID-ja in praznega projekta. |
| R10 | Status `Število priljubljenih` vedno vsebuje `Priljubljeno: X od M.`; števec vsakega stolpca je število njegovih vidnih opravil. | Lastni primer filtra in stanj table. |
| R11 | Pravi ključ dogodka zamenja F z D(newValue), brez zapisa; drugi ključ ne spremeni F. Izjema branja/zapisa ohrani uporaben pomnilnik in prikaže role=alert z besedo `shramba`. | Lastni dogodki in dejanska sinhronizacija zavihkov; simulirani izjemi shrambe. |
| R12 | Spremembe priljubljenih ne pišejo API-ja in ne spreminjajo opravil; Folio, nalaganje, navigacija ter 390 px prikaz ostanejo uporabni. | D04, celotna regresijska zbirka, lastni pregled podatkov in ozkega prikaza. |

## Izvedba in sledljivost

Spodnja sledljivost je posodobljena po implementaciji in dejanskem preverjanju. Vseh 69 preverjanj je uspelo; celoten dnevnik je [check-final.log](check-final.log), podrobnosti in omejitve pa v [verification.md](verification.md). Lastni scenariji A01–A09 so v [favorites.spec.ts](../../tests/agent/favorites.spec.ts); parametrizacija skupaj ustvari 23 preverjanj.

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | F′=F Δ {i}; ločen gumb z aria-pressed | D01, A03, A05; tipka Space | [FavoriteButton](../../src/FavoriteButton.tsx), [preglednica](../../src/App.tsx), [tabla](../../src/TaskBoard.tsx) | Uspešno; check-final.log, manual-review.log. |
| R02 | Samo kanonični S(F), UTF-16 | D03, A01 (tudi emoji, zasebni Unicode znak in prazen niz) | [useFavorites](../../src/useFavorites.ts) – commit | Uspešno; check-final.log, A01. |
| R03 | D odpravi podvojitve in ohrani neznane nize | D03, A01, A04 | [useFavorites](../../src/useFavorites.ts) – parseFavorites/readFavorites | Uspešno; check-final.log, A01/A04. |
| R04 | Neveljavno → ∅ brez začetnega zapisa | A02 (12 vhodov), A06 | [useFavorites](../../src/useFavorites.ts) – parseFavorites/readFavorites | Uspešno; check-final.log, A02/A06. |
| R05 | Stabilna podsekvenca T; začetni q=false | D02, A01, A03, A04 | [App](../../src/App.tsx) – onlyFavorites/visibleTasks | Uspešno; check-final.log. |
| R06 | Odstranitev takoj skrije; prazno stanje ohrani kontrole | D02, A04, A05 (0 in 1 opravilo, oba pogleda) | [App](../../src/App.tsx) – kontrolna vrstica in prazno stanje | Uspešno; check-final.log, mobile-0/1 posnetki. |
| R07 | F in q sta skupna pogledoma; podrobnosti po ID-ju | D04, A03 z ID-jem `Ω / # ? " č` | [App](../../src/App.tsx), [TaskBoard](../../src/TaskBoard.tsx) – posredovanje stanja in povezave | Uspešno; check-final.log, A03. |
| R08 | Projekt ponastavi q, ohrani F; osvežitev obnovi F | A01, A04, A08 | [App](../../src/App.tsx) – globalni hook in ProjectView s key=project.id | Uspešno; check-final.log. |
| R09 | F′=F \\ I(T); disabled ⇔ X=0 | A04, A05 | [App](../../src/App.tsx) – celotni tasks; [useFavorites](../../src/useFavorites.ts) – remove | Uspešno; check-final.log, A04/A05. |
| R10 | X/M iz celega projekta; stolpci iz V | A03, A04, A05, A06 | [App](../../src/App.tsx) – favoriteCount/status; [TaskBoard](../../src/TaskBoard.tsx) – entries | Uspešno; check-final.log. |
| R11 | Zamenjava ob dogodku brez zapisa; izjeme ne prekinejo dela | A06, A07 (dva zavihka), A08 (3 vrste izjem) | [useFavorites](../../src/useFavorites.ts) – receive/commit; [App](../../src/App.tsx) – opozorilo | Uspešno; check-final.log. |
| R12 | Brez pisanja API-ja; Folio, navigacija, 390 px | D04, A03–A05, A08–A09, 38 regresijskih preverjanj, vizualni pregled | [App](../../src/App.tsx), [TaskBoard](../../src/TaskBoard.tsx), [styles](../../src/styles.css) | Uspešno; check-final.log in [manual-review.log](manual-review.log). |

## Odprta vprašanja in omejitve

- Neznani nizi (tudi prazen niz) so veljavni člani F; naloga ne predpisuje dodatne validacije ID-ja.
- Opozorilo o neuspehu shrambe ostane vidno v trenutni seji; shranjevanje ob nadaljnjih dejanjih se še vedno poskuša.
- Sočasno združevanje sprememb ni predpisano: dogodek `storage` zamenja celotno množico z novo vrednostjo.
- Pri praznem filtriranem prikazu table ostanejo prikazani vsi trije stolpci s števcem 0; skupno sporočilo o praznem rezultatu je nad njimi. Prikaz ohrani obstoječa imena stolpcev.
- Dostopno ime povezave kartice je sestavljeno neposredno iz naslova in ID-ja, zato posebni znaki oziroma presledki v ID-ju ne pokvarijo sklicev ARIA.
- Nedostopnih končnih testov ne moremo potrditi. Razpoložljiv čas je največ 20 minut, vključno s specifikacijo in preverjanjem.

## Zgodovina sprememb specifikacije

- v1, 2026-09-25: začetna specifikacija pred implementacijo, vključuje R01–R12 in načrt preverjanja.
- v1.1, 2026-09-25: po preverjanju zamenjani načrtovani izidi z dejanskimi rezultati in povezavami za vsako zahtevo; pojasnjen prikaz prazne table in dostopno ime pri posebnih znakih v ID-ju. Sprejemni pogoji R01–R12 niso spremenjeni.
