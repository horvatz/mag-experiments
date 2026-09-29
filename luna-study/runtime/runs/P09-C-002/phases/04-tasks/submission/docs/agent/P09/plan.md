# P09 — izvedbeni načrt

## Tehnični kontekst

- Izhodišče je React 19, TypeScript 6 in Vite 8; Playwright 1.63 je že nameščen. `npm run check` poganja lint, build/typecheck in obstoječe teste. Ne dodajamo odvisnosti ali spreminjamo nastavitev.
- Trenutne poti in `view` razčlenjuje `src/navigation.ts`; `src/App.tsx` nalaga projekte/opravila prek obstoječega `/api/` in izrisuje preglednico. `src/TaskBoard.tsx` izriše kartice, `src/TaskDetails.tsx` upravlja podrobnosti, `src/styles.css` vsebuje Folio slog in odzivne prelome.
- Playwright uporablja `tests/` z namenskim projektom `agent` za `tests/agent/**/*.spec.ts`. Dodani testi sodijo samo v `tests/agent/`.
- Vodilna merila so R01–R12 v [specifikaciji](spec.md) in projektna načela v ustavi. Strežnik, skupni tipi/testi, nastavitve in odvisnosti ostanejo nespremenjeni.

## Odločitve izvedbe

1. **URL ostane vir potrjenega stanja.** V `src/navigation.ts` razširi model poti za `q`, `status`, `order` in `view`; ohrani obstoječe poti projekta/opravila. Pri razčlenjevanju uporabi prvo pojavitev, privzete vrednosti za neznane izbire ter brez stranskega učinka pusti neveljaven/neznan query do dejanja uporabnika. Serializer naj kodira parametre, izpusti privzete filtre in pri izgradnji ciljnih URL-jev ohrani zahtevane filtre ali pogled.
2. **Loči osnutek od potrditve.** V `src/App.tsx` kontrolam nastavi potrjeni URL ob začetku in vsaki navigaciji; urejanje lokalnega osnutka ne sme filtrirati rezultatov. »Uporabi pogled« obreže `q` in potrdi trojico skupaj. Ob spremembi zapiše en hash zgodovinski vnos; enaka potrditev ne sme ustvariti vnosa. Potrditev odstrani neznane parametre, ohrani `view=board` in pri nespremenjenih filtrih po potrebi zamenja trenutni URL brez novega vnosa. Navigacija, Nazaj/Naprej, pogled in podrobnosti uskladijo osnutek s ciljnim URL-jem. Projektna povezava namerno uporabi privzete filtre in ohrani `view`.
3. **Filtriraj in sortiraj podatke API pred izrisom.** V obstoječem `ProjectView` dodaj normalizacijo ene fraze in presečno filtriranje po `title`, `description`, `assignee`, `id` ter `status`. Sortiranje naslovov naj primerja normalizirane nize po UTF-16 in uporabi izvorni indeks za stabilne izenačitve. Isti urejeni nabor posreduj preglednici in tabli; ne spreminjaj API ali podatkov.
4. **Ohrani obstoječe komponente.** `TaskBoard` naj uporablja URL pomočnik za povezave do ID-jev; `TaskDetails` naj pri odpiranju/zapiranju ohrani query in pogled. Nova prazna filtrirana stanje ter števec sodita k pregledu v `App.tsx`. Slogovne dopolnitve naredi v `src/styles.css` z obstoječimi spremenljivkami, vidnim fokusom in notranjim drsenjem pri 390 px; ne preurejaj potrjenega dizajna Folio.
5. **Odjemalec ostane samo bralnik.** Uporabi obstoječe klice `/api/`. Ne uporabi `updateTask`, `/__test/`, lokalne kopije podatkov ali `localStorage` za vedenje aplikacije.

## Datoteke in zaporedje dela

1. `src/navigation.ts` — parse/serialize filtrov in poti; preveri, da projekt, pogled, podrobnosti, fragment query in zgodovina delujejo skupaj.
2. `src/App.tsx` — potrjeno stanje/osnutek, kontrole, filter/sort, prazni rezultat in števec; navigacije obstoječih projektov in pregledov naj uporabljajo pomočnike.
3. `src/TaskBoard.tsx`, `src/TaskDetails.tsx` — posreduj filtrirane/urejene podatke in ohrani potrjene parametre ter ID pri odpiranju in zapiranju.
4. `src/styles.css` — slog novih kontrol in odzivnost v skladu z `docs/dizajn.md`.
5. `tests/agent/P09.spec.ts` — dodaj Playwright scenarije za R01–R12, vključno z neposrednimi URL-ji, neveljavnimi/ponovljenimi parametri, Unicode in stabilnim sortiranjem, osnutkom/potrditvijo/ponastavitvijo, zgodovino, obema pogledoma, podrobnostmi, menjavo projekta, praznim rezultatom, brez zapisov in širino 390 px. Za različne nabore podatkov uporabi testne prestreznike GET; testne kontrole naj kliče samo testni program.

## Preverjanje in meje

- Med razvojem ciljano poženi nove scenarije `agent`; ob predaji poženi `npm run check` in poročaj o dejanskih rezultatih. Skupnih testov in infrastrukture ne spreminjaj.
- Zaključno preveri vse vrstice R01–R12 iz [specifikacije](spec.md), tudi ohranitev obstoječega prikaza pri nalaganju, napaki, neznani poti in podrobnostih. Končni testi, ki niso v izvozu, ostanejo nepreverjeni in se ne navajajo kot uspešni.
- Delo je omejeno na `src/`, `tests/agent/` in `docs/agent/`; ta načrt je dokument postopka C. Implementacija, testi in meritve v tem koraku niso izvedeni.
