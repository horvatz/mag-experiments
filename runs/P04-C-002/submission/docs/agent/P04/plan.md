# P04 — Izvedbeni načrt

2026-09-25. Podlaga: [specifikacija](spec.md), izvirne [R01–R12](../../../task/instructions.md), [ustava](../../../.specify/memory/constitution.md) in [dizajn Folio](../../dizajn.md).

## Tehnični kontekst

Obstoječa aplikacija uporablja React 19, TypeScript 6, Vite 8, `lucide-react` in Playwright. Vse odvisnosti in Chromium so nameščeni; novih ne potrebujemo. Obstoječe skripte `npm run lint`, `npm run build` in `npm test` ostanejo nespremenjene.

`src/App.tsx` vsebuje `ProjectView`, pridobivanje opravil prek `useResource`, števila stanj, preglednico in izbiro pogleda. `App` že uporablja `ProjectView key={project.id}`. `src/TaskBoard.tsx` filtrira prejeto polje po treh stalnih stolpcih. `src/navigation.ts` in `src/TaskDetails.tsx` izvajata navigacijo in podrobnosti po ID-ju. `shared/types.ts` določa `Task` z veljavnimi nizi datumov; datoteka ostane nespremenjena. `src/styles.css` vsebuje potrjeni vizualni jezik in odzivno postavitev.

Playwrightova obstoječa konfiguracija že vključuje skupne API/regresijske teste, razvojne teste na namiznem in mobilnem prikazu ter projekt `agent` za `tests/agent/**/*.spec.ts`. Uporabimo obstoječi strežnik, priklop Chromium in konfiguracijo brez posegov.

## Odločitve in podatkovni tok

1. **Čista projekcija v `src/taskSorting.ts` (novo).** Izvozimo tipe ključev in smeri, privzeto stanje ter funkcijo `sortTasks(tasks, settings)`. Uporablja obstoječi tip `Task`; vhod sprejme kot `readonly Task[]`. Za `original` vrne kopijo v izvorni razvrstitvi. Sicer ustvari pomožne pare opravilo/izvorni indeks, uredi samo to novo polje in vrne opravila. Izvorni indeks je zadnji, vedno naraščajoči kriterij. To neposredno podpira stabilnost in nespremenljivost R01–R06 ter R11.
2. **Natančne primerjave.** Naslov in oseba: NFD → odstranitev U+0300–U+036F → male črke → `<`/`>`. Status primerjamo po določeni preslikavi. Veljavni `YYYY-MM-DD` omogočajo kronološko primerjavo nizov brez lokalnega časa. Smer pomnoži samo izid primerjave svojega ključa. Sekundarna primerjava se izvede samo ob primarnem izenačenju in ključu, različnem od `none`; enak ključ je dovoljen. Ni `localeCompare`, numerične kolacije ali obračanja celotnega polja.
3. **Eno lokalno stanje v `ProjectView`.** `useState` hrani objekt štirih vrednosti. Vsaka kontrola posodobi samo svoje polje, gumb nastavi privzeti objekt. Obstoječa identiteta komponente po projektu zagotovi novo stanje pri menjavi projekta; osvežitev ustvari novo stanje. Menjava pogleda in podrobnosti spreminja props iste komponente, zato stanje ostane. Ne dodajamo učinkov za ponastavitev, globalne shrambe ali parametrov URL-ja.
4. **Ena projekcija za oba pogleda.** Iz prejetih opravil in nastavitev izračunamo `sortedTasks` (po potrebi z `useMemo`). Preglednica uporablja `sortedTasks.map`, tabla prejme `sortedTasks`. `TaskBoard` že ohranja vrstni red znotraj filtriranih stolpcev in pravilne ID-je, zato spremembe te komponente niso predvidene. Števila stanj in skupno število še naprej izhajajo iz izvornih podatkov. Ne uvajamo novih API-klicev.
5. **Kontrole in Folio.** V `ProjectView` pod glavo razdelka dodamo štiri označene HTML selecte ter gumb `Izvorni vrstni red`, tudi kadar je naloženo polje prazno. Imena in vrednosti so natančno določeni v specifikaciji. Kontrole so zunaj povezav opravil. CSS uporabi obstoječe barve, robove, pisavo in fokus; skupina se prelomi na ozkem zaslonu. Ohranjeni ostanejo stranski meni, povzetek, preglednica, tabla in podrobnosti. Brez vodoravnega raztezanja strani pri 390 pikah.

Tok podatkov: javni GET → `useResource<Task[]>` → izvorna opravila in lokalne nastavitve → `sortTasks` → preglednica ali filtriranje v `TaskBoard`. Podrobnosti se še naprej pridobijo po ID-ju prek obstoječega javnega API-ja.

## Datoteke in izvedbeni vrstni red

| Korak | Datoteke | Namen in zahteve |
| --- | --- | --- |
| 1 | `src/taskSorting.ts` | Čista stabilna primerjava in privzeto stanje; R01–R06, R10–R11. |
| 2 | `src/App.tsx` | Lokalne kontrole, ponastavitev, skupna projekcija; R01, R05–R12. |
| 3 | `src/styles.css` | Slogi novih kontrol in prilagodljivost brez spremembe potrjenega dizajna; R12. |
| 4 | `tests/agent/P04.spec.ts` | Dopolnilni logični in brskalniški testi; sprejemni pogoji vseh R01–R12. |
| 5 | `docs/agent/P04/spec.md`, `docs/agent/P04/validation.md` | Dejanske povezave pogoj → koda → test → rezultat ter dnevnik preverjanj. |

Koraki so zaporedni; izvaja jih isti agent. Strežnik, skupni tipi, infrastruktura, konfiguracija, odvisnosti, skupni testi in razvojni testi se ne spreminjajo.

## Preverjanje in dokazila

Obstoječi razvojni testi D01–D04 pokrijejo začetno stanje/naslov, sekundarni datum z neodvisno smerjo, vrstni red table in ponastavitev brez zapisov. Skupni testi preverijo API, bralno navigacijo, podrobnosti, napake/ponovni poskus, prazna stanja ter namizni in mobilni prikaz.

Lastna preverjanja v že podprtem projektu Playwright `agent` dopolnijo vrzeli:

- Neposredno uvozijo čisto funkcijo in primerjajo ročno določena zaporedja ID-jev: Unicode normalizacija obeh nizovnih ključev, UTF-16, datumi prek let, vrstni red stanj, desc brez obrata izenačenj, vsi sekundarni ključi in smeri, isti ključ ter `original`. Pričakovanj ne računajo z isto produkcijsko funkcijo.
- Preverijo stabilnost popolnih izenačenj in nespremenljivost zamrznjenega vhodnega polja/objektov; nič in eno opravilo preverijo pri vseh 100 kombinacijah kontrol.
- Brskalnik uporabi nadzorovane GET odgovore samo iz testne kode, z drugačnimi ID-ji, enakimi naslovi in več kot deset opravili. Preveri vse štiri vrednosti po menjavi pogleda, odpiranju/zapiranju podrobnosti, menjavi projekta, osvežitvi in ponastavitvi; `original` tudi ob neprivzetih drugih kontrolah.
- Preveri ID-je in relativni vrstni red v vseh treh stolpcih, ohranitev podatkov/povzetkov, odsotnost zapisovalnih zahtev ter prazni prikaz z dostopnimi kontrolami. Pri 390 pikah preveri širino strani; posnetek namiznega in mobilnega prikaza omogoči pregled ohranitve Folio in novih kontrol.

Po izvedbi zaženemo `npm run lint`, `npm run build` in `npm test` (vsi konfigurirani projekti). Izhode shranimo v `docs/agent/P04/`; ob neuspehu navedemo točen ukaz, rezultat in omejitev, po popravku izvedemo prizadeta preverjanja. `validation.md` poveže dnevnike in po potrebi posnetke; tabela v specifikaciji poveže vseh dvanajst zahtev z dejanskimi testi in deli kode. Končnih nedostopnih testov ne označimo kot opravljenih.

## Skladnost in trenutno stanje

Načrt spoštuje ustavo in izvirne zahteve, uporablja samo dovoljene datoteke in ne zahteva novih odvisnosti ali arhitekturne preureditve. Bistvenih odprtih vprašanj ni. Glavna tveganja so obrat izenačenj pri desc, reset ob napačni življenjski dobi komponente in preširoke kontrole; zgornja zasnova in preverjanja jih neposredno pokrivajo.

V tej fazi je opravljen samo lokalni pregled kode, razvojnih testov in konfiguracije ter izdelava načrta. Implementacija in zagoni testov še niso izvedeni. Preostali čas se pred nadaljnjim delom preveri z `node task/time-budget.mjs`.
