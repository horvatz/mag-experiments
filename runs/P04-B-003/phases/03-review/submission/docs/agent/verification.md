# P04 – implementacija in preverjanje

Začetni zapis implementerja, 2026-09-23. Prebrani so `PROJECT_RULES.md`, `task/instructions.md`, predloga in predana specifikacija. Izvirne zahteve R01–R12 so obvezne; specifikacije in dokumentov drugih vlog ne spreminjam.

## Začetni načrt (zgodovinski zapis pred implementacijo)

- Še ni izvedeno: čista stabilna projekcija z dvema ključema v `src/`, štiri lokalne kontrole in ponastavitev v obstoječem Folio dizajnu.
- Še ni izvedeno: lastni testi normalizacije, neodvisnih smeri, stabilnosti, nespremenljivosti vhodov, praznega/enoelementnega projekta in prehodov pogleda/projekta/podrobnosti.
- Še ni izvedeno: `npm run check` (slog, tipi, gradnja, osnovni, razvojni in lastni testi).
- Še ni izvedeno: ročni pregled namizja in širine 390 px prek nameščenega Chromium s `chromium.connect(wsEndpoint)` iz `task/browser.json`.
- Ob koncu: povezave R01–R12 s končno kodo, dejanskimi testi in rezultati; predaja najmanj minuto pred rokom faze.

## Omejitve

Dovoljene spremembe so samo `src/`, `tests/agent/` in lastni zapisi v `docs/agent/`. Infrastruktura, odvisnosti, skupni testi in navodila so samo za branje. Uporabljam le lokalni izvoz in lokalne storitve; javni internet je blokiran. `chromium.launch()` v tem okolju ni podprt. Končni skriti testi niso dostopni in ne bodo navedeni kot opravljeni.

## Spremembe in izidi

Implementirano: `src/sortTasks.ts` izvaja normalizacijo NFD, odstrani samo U+0300–U+036F in primerja z `<`/`>`; rang statusa ter ISO datume primerja neposredno. Primerjalnik najprej uporabi primarni, nato sekundarni ključ z neodvisno smerjo, nazadnje izvorni indeks. Vhod se ne sortira na mestu. Primarni `original` vrne kopijo izvornega zaporedja.

`src/SortControls.tsx` dodaja štiri označene HTML select kontrole in gumb za popolno ponastavitev. `src/App.tsx::ProjectView` hrani stanje lokalno in podaja isto memoizirano projekcijo preglednici in tabli. Obstoječi ključ komponente po ID-ju projekta ponastavi stanje ob menjavi projekta. `src/styles.css` dopolni obstoječi dizajn z odzivno vrstico kontrol in obstoječimi barvnimi spremenljivkami.

Dodani testi: `tests/agent/sortTasks.spec.ts` (S01, S02, S05/S06) in `tests/agent/sorting-ui.spec.ts` (S03/S04/S06 in S05). Pokrivajo konkretna pričakovana zaporedja, Unicode, datume, vse kombinacije smeri in sekundarnih ključev, zamrznjene vhode, 0/1/17 opravil, podvojene naslove in lokalni življenjski cikel nastavitev.

Pri branju predane specifikacije nisem našel odstopanja od izvirnih zahtev. Specifikacija, njena zgodovina, `review.md` in `review.json` niso bili spremenjeni.

Omejitev okolja: `git status --short` ni deloval, ker sistemski Git javlja manjkajočo pot CommandLineTools (`xcrun: invalid active developer path`). Tudi sistemski python3 ni na voljo iz istega razloga; zapis je bil posodobljen z Node. Neuspela ukaza nista spremenila datotek. Veje, oddaljeni repozitoriji in potiski niso del naloge.

## Končni rezultati preverjanja

`npm run check > .tmp/check.log 2>&1` se je zaključil z izhodno kodo **0**. Uspešni so ESLint, TypeScript (`tsc --noEmit`), produkcijska gradnja Vite in **59/59 testov** v 20,6 s: 38 osnovnih (API, namizje, mobilni prikaz), 8 razvojnih P04 in 13 lastnih. Trajni dnevnik predaje: [check.log](check.log). HTML poročilo je v `playwright-report/html/index.html`.

Zagon je izpisal nenevarni okoljski opozorili za npm `http-proxy` ter sočasna `NO_COLOR`/`FORCE_COLOR`; brez napak sloga, tipov, gradnje ali testov. Ponovitve preverjanja po uspehu niso bile potrebne; pozneje so bila dodana le dokazila in dokumentacija.

Ročni pregled je uporabil `WEB_PORT=5193 API_PORT=3123 npm run dev` in `chromium.connect(wsEndpoint)` iz `task/browser.json`. Pregledani so vsi štirje posnetki: [1440 – preglednica](visual-1440-table.png), [1440 – tabla](visual-1440-board.png), [390 – preglednica](visual-390-table.png), [390 – tabla](visual-390-board.png). Videz Folio ostaja ohranjen, kontrole se pri 390 px zložijo v dve koloni, preglednica in tabla se pomikata znotraj svojega prikaza. Meritve so v [visual-results.json](visual-results.json): širina dokumenta/zaslona je pri obeh pogledih 1440/1440 oziroma 390/390, zajete napake JavaScript so prazen seznam. Pri zajemu table je bilo izrecno počakano na regijo `Tabla opravil`.

## Sledljivost R01–R12

S01–S06 spodaj so oznake dejansko izvedenih lastnih testov; celotna imena so v dnevniku in povezanih datotekah. D01–D04 so obstoječi razvojni testi, izvedeni na namiznem in mobilnem projektu.

| Zahteva | Pogoj in končna koda | Dejansko preverjanje | Rezultat |
| --- | --- | --- | --- |
| R01 | `S₀=(original,asc,none,asc)`, `B=A` po zaporedju. [Privzete vrednosti in original](../../src/sortTasks.ts), [lokalno stanje](../../src/App.tsx). | D01; S03/S04/S06 preveri vse štiri kontrole in izvorne ID-je. | Uspešno |
| R02 | NFD → odstranitev U+0300–U+036F → male črke → `<`/`>`. [compare/normalize](../../src/sortTasks.ts). | [S01 za title in assignee](../../tests/agent/sortTasks.spec.ts): sestavljeni/razstavljeni znaki, ločila, `Alfa 10`/`Alfa 2`, ohranitev U+1AB0, UTF-16 vrstni red emoji/U+FFFF in `İ`. D01. | Uspešno |
| R03 | `todo < in_progress < done`; primerjava veljavnih ISO datumov. [compare](../../src/sortTasks.ts). | S01 `statuses and calendar dates across years and leap day`, obe smeri; D02/D03. | Uspešno |
| R04 | Smer množi samo primerjavo posameznega ključa; izvorni indeks je vedno naraščajoč. [sortTasks](../../src/sortTasks.ts). | S01 oba besedilna ključa pri desc; S02 vse štiri kombinacije smeri z izenačenimi elementi. | Uspešno |
| R05 | Sekundarni ključ se uporabi samo pri primarni enakosti, s svojo smerjo. [sortTasks](../../src/sortTasks.ts), [kontrole](../../src/SortControls.tsx). | Pet S02 testov za `title/assignee/status/dueDate/none`, vsak z dvema primarnima skupinama in štirimi kombinacijami smeri; D02. | Uspešno |
| R06 | Dvojna enakost → izvorni indeks; isti ključ je dovoljen; original prezre ostale nastavitve. [sortTasks](../../src/sortTasks.ts). | S02 `identical keys do not reverse ties; original overrides all other settings`; S05/S06 original pri vseh kombinacijah. | Uspešno |
| R07 | Vsak stolpec dobi `B.filter(status)` in ohrani stalni položaj. [oba izrisa](../../src/App.tsx), nespremenjeni [TaskBoard](../../src/TaskBoard.tsx). | D03; [S03/S04/S06](../../tests/agent/sorting-ui.spec.ts) primerja vse tri stolpce s pričakovano skupno projekcijo in vrstni red naslovov stolpcev. | Uspešno |
| R08 | Sprememba pogleda/podrobnosti ohrani lokalni `sort`. [ProjectView](../../src/App.tsx). | S03/S04/S06: preglednica → tabla → preglednica, podrobnosti dveh enako naslovljenih opravil v obeh pogledih, zapiranje z gumbom in Escape; kontrola vseh štirih vrednosti in vrstnega reda. | Uspešno |
| R09 | Projektni `key={project.id}` in nov zagon vrneta S₀; brez shrambe/URL. [App/ProjectView](../../src/App.tsx). | S03/S04/S06: projekt A → prazen B → A, reload obeh pogledov, nespremenjeni URL/localStorage/sessionStorage ob razvrščanju. | Uspešno |
| R10 | Reset vrne vse štiri privzete vrednosti, 0/1 opravil ostane uporabnih. [SortControls](../../src/SortControls.tsx). | D04; S03/S04/S06 popoln reset; S05 UI vseh ključev in obeh smeri v obeh pogledih pri 0/1; S05/S06 čista funkcija vseh 100 kombinacij pri 0/1. | Uspešno |
| R11 | `count(B,id)=1`, nespremenjeni vhodni objekti/polje; brez zapisov API. [sortTasks](../../src/sortTasks.ts), povzetki iz izvornih podatkov v [App](../../src/App.tsx). | S05/S06 zamrznjeni vhodi dolžin 0/1/17 in vseh 100 kombinacij, enake reference objektov in množica ID-jev; UI spremlja zapise in povzetke [5,5,4]; D04. | Uspešno |
| R12 | ID-ji so React ključi, `data-task-id` in osnova povezav; ohranjena imena, ARIA povzetek ter odzivni Folio. [App](../../src/App.tsx), nespremenjena [TaskBoard](../../src/TaskBoard.tsx)/[TaskDetails](../../src/TaskDetails.tsx), [slogi](../../src/styles.css). | S03/S04/S06: 14 enakih naslovov s poljubnimi enkratnimi ID-ji, pravilni opisi v podrobnostih, vsi stolpci, 390 px; 38 osnovnih testov; štirje vizualni posnetki in meritve. | Uspešno |

## Omejitve dokazov in predaja

Ni znanih neizpolnjenih zahtev ali zaznanih napak predane specifikacije. Skriti končni testi niso dostopni. Vseh 100 kombinacij je izčrpno preverjenih na ravni čiste funkcije za robne dolžine in nespremenljivost, ne kot 100 ločenih klikov za vsako velikost zaslona. UI dodatno pokriva vse ključe, obe smeri, glavne prehode ter konkretne razvrstitve. Preverjanje drugih brskalnikov poleg zagotovljenega Chromium ni bilo izvedeno. Manjkajoči/neveljavni datumi so izven vhodne domene naloge.

Predaja je pripravljena več kot minuto pred rokom faze; ob zaključnem preverjanju časa je ostalo 179 s faze in 539 s skupnega proračuna. Pregledovalec lahko nadaljuje z obstoječim `npm run check`; testni strežnik 5174/3102 je bil samodejno ustavljen po testih. Ročni strežnik 5193/3123 je na voljo za pregled. Noben drug agent ni bil zagnan. Spremenjeni viri: `src/App.tsx`, `src/styles.css`; novi viri: `src/sortTasks.ts`, `src/SortControls.tsx`; lastna testa sta v `tests/agent/`. Infrastruktura, odvisnosti, skupni tipi in skupni testi niso bili spremenjeni.
