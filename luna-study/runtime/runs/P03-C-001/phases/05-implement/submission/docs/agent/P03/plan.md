# P03: izvedbeni načrt

Vir sprejemnih pogojev: [specifikacija](spec.md), ki določa R01–R12 in njihove predikate. Ta načrt ohranja potrjeni dizajn [Folio](../../dizajn.md) in obstoječo infrastrukturo.

## Tehnični kontekst

Aplikacija uporablja React 19, TypeScript 6 in Vite 8; Playwright 1.63 in potrebne odvisnosti so že nameščeni. `ProjectView` v `src/App.tsx` naloži opravila trenutnega projekta prek javnega API-ja, izriše preglednico in statusni povzetek. `TaskBoard` v `src/TaskBoard.tsx` že razvršča podana opravila po stanjih. Navigacija pogleda je v obstoječem hashu. Playwright ima ločena projekta za razvojne teste na namizju in mobilnem zaslonu ter projekt `agent` za `tests/agent/**/*.spec.ts`.

Ne dodajamo odvisnosti, API-jev, shrambe, strežniških sprememb ali sprememb tipov, nastavitev in skupnih testov. Aplikacijske spremembe ostanejo v `src/`; lastni testi v `tests/agent/` uporabljajo obstoječi Playwright in testni pripomoček. Aplikacija testnih kontrol `/__test/` ne uvaža in jih ne kliče.

## Odločitve in izvedba

1. **Lokalno stanje filtrov:** `ProjectView` hrani `q`, `status` in `assignee` v React stanju. Komponenta je že ključena z ID-jem projekta, zato menjava projekta začne privzeto stanje; sprememba parametra pogleda ohrani isto instanco in filtre. Filtri ne spreminjajo hasha, URL-ja ali trajne shrambe.
2. **Eno izračunano zaporedje zadetkov:** dodati majhen čisti pripomoček `src/taskFilters.ts` za normalizacijo NFD, razdelitev iskalnega niza, dobesedno ujemanje in sestavo pogojev. Filtrira se izključno seznam nefiltriranih opravil trenutnega projekta; uporabljena naj bo stabilna operacija `filter`, brez spreminjanja opravil. Možnosti oseb se izračunajo iz celotnega seznama projekta, pred prikazom pa se odstranijo prazna in podvojena imena.
3. **Skupni prikazni podatki:** `App.tsx` enkrat izračuna rezultate, `N` in pregled po stanjih iz teh rezultatov. Isti seznam prejmeta preglednica in `TaskBoard`; tabla že gradi stolpce in njihove števce iz vhodnega seznama. Vmesnik loči prazen projekt od nepraznega projekta brez zadetkov ter ohrani obstoječo navigacijo in bralne podrobnosti.
4. **Videz in dostopnost:** kontrole in števec ostanejo v obstoječem Folio pogledu; `src/styles.css` dobi le potrebne sloge, vidni fokus in prilagoditev postavitve. Pri 390 px ostane stran znotraj širine, drsenje je lahko omejeno na preglednico in tablo.

## Datoteke

| Datoteka | Načrtovana sprememba |
| --- | --- |
| `src/taskFilters.ts` | Nov majhen čisti pripomoček za iskalne predikate in sestavljene filtre. |
| `src/App.tsx` | Stanje filtrov, kontrole z zahtevanimi imeni, možnosti oseb, izračun rezultatov/števil in različna prazna stanja; rezultati se posredujejo obema pogledoma. |
| `src/TaskBoard.tsx` | Uporabi podani filtrirani seznam; obstoječe grupiranje po stanju in dostopna imena ostanejo. Uredi le, če je za stanje brez zadetkov potrebna sprememba praznega prikaza. |
| `src/styles.css` | Slog kontrol in postavitev pri ozki širini v okviru Folio. |
| `tests/agent/P03.spec.ts` | Lastni Playwright scenariji, poimenovani po R01–R12; kontrolirani GET odgovori prek obstoječega testnega pripomočka. |

`src/api.ts`, `src/navigation.ts`, `src/TaskDetails.tsx`, `shared/`, `server/`, `tests/development/`, skupni testi in konfiguracije ostanejo nespremenjeni, razen če je treba poročati o že obstoječi težavi; obseg te naloge ne dovoljuje spremembe infrastrukture.

## Preverjanje

Obstoječi `tests/development/P03.spec.ts` pokriva privzeti seznam in normalizirano iskanje, kombinacijo filtrov in preklop pogleda, nič zadetkov/čiščenje ter števec in samo branje API-ja (D01–D04). Lastni testi dopolnijo nepokrite robove: dobesedne večbesedne poizvedbe in ločila; možnosti oseb iz celotnega projekta in ponastavitev pri menjavi projekta; osvežitev brez trajnega stanja; prazen projekt ločeno od nič zadetkov; števce stolpcev in iste ID-je v obeh pogledih; navigacijo/podrobnosti ter širino 390 px.

Po spremembah zaženemo `npm run check` (lint, typecheck/build in celoten Playwright nabor, vključno z osnovnimi, razvojnimi in agentnimi testi). Zabeležimo dejanski rezultat vsakega preverjanja; neizvedenih ali nedostopnih končnih testov ne označimo kot uspešnih.

## Omejitve

Podatkovni primeri lahko vsebujejo poljubno število opravil, ID-je, vrstni red, podvojene naslove, Unicode in ločila; rešitev se ne sme opirati na začetno velikost ali vsebino. Navigacija med nezaključenim nalaganjem in nove sočasne spremembe podatkov brez osvežitve ostanejo zunaj razširjenega obsega. Ta načrt ne predpisuje dodatnih zahtev ali večje preureditve aplikacije.
