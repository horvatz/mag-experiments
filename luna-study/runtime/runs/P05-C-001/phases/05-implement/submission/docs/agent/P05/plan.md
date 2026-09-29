# P05 implementation plan

Specifikacija z zahtevami in predikati: [`spec.md`](spec.md). Ta načrt določa izvedbeno usmeritev; ne spreminja projektnega obsega.

## Tehnični kontekst

- Aplikacija uporablja React 19, TypeScript 6 in Vite 8; odvisnosti ter nastavitve ostanejo nespremenjene.
- `App.tsx` (`ProjectView`) naloži opravila prek obstoječega `useResource` in `/api/projects/:id/tasks`. `api.ts`, skupni tipi, strežnik in URL-rute so izhodišče, ne predmet spremembe.
- `ProjectView` je ključan z ID-jem projekta. Njegovo lokalno stanje se zato ob menjavi projekta na novo ustvari, ob spremembi pogleda ali odprtju/zaprtju podrobnosti pa ostane. Osvežitev začne aplikacijo brez stanja straničenja.
- Tabla že razvršča prejeta opravila v statusne stolpce; predati ji je treba že filtriran in od straničen seznam.
- Preverjanje po izvedbi uporablja obstoječe skripte in lastne scenarije v `tests/agent/`. Ne spreminjaj nastavitev, skupnih testov ali testnega strežnika.

## Odločitve izvedbe

1. **Lokalno stanje v `ProjectView`.** Hrani samo velikost, filter in številko strani; ne dodajaj stanja v URL, trajno shrambo, API ali globalni kontekst.
2. **Izpeljava v zaporedju filter → stran.** Iz nespremenjenega seznama API-ja najprej izberi ujemajoča se stanja, nato izračunaj število strani in odsek. Sprememba filtra ali velikosti nastavi prvo stran; prazni rezultat ima izpeljan status 0/0.
3. **En seznam za oba pogleda.** Isti odsek ID-jev uporabi za preglednico in kot vhod table; tabla ga šele nato združi po statusu. Celotni pregled stanj in skupni števec ostaneta vezana na nefiltrirani seznam; števci stolpcev table na prejete kartice trenutne strani.
4. **Robovi in ohranjeni prehodi.** Navigacijske cilje izračunaj iz števila strani; na robu gumbe onemogoči. Preklop pogleda in podrobnosti ne posegata v lokalno stanje. Projekt in osvežitev sledita ponastavitvi iz specifikacije.
5. **Folio in podatkovna meja.** Uporabi obstoječe slovenske oznake, komponente, slogovne spremenljivke in notranje drseče vsebnike; pri 390 px prepreči širjenje celotne strani. Kontrole ostanejo dostopne s tipkovnico in imajo zahtevane statusne atribute. Branje ostane prek `/api/`; straničenje ne kliče zapisovalnega API-ja. Brez novih odvisnosti ali arhitekturnih preureditev.

## Datoteke in zaporedje dela

1. `src/App.tsx` — lokalno stanje in izračuni; kontrola velikosti/filtra, štirje navigacijski gumbi in status; uporabi odsek v preglednici in `TaskBoard`, ohrani celotne števce ter obstoječe podrobnosti (**R01–R05, R07–R10, R12**).
2. `src/TaskBoard.tsx` — ohrani obstoječe združevanje in `data-task-id`; preveri, da se stolpci in njihovi števci izračunajo samo iz podanega odseka. Spremeni le, če to zahteva povezava s kontrolami (**R06, R11, R12**).
3. `src/styles.css` — slog novih kontrol in statusa v vzorcu Folio; po potrebi prilagodi samo notranje drsenje pri ozkem zaslonu (**R03, R09, R10, R12**).
4. `tests/agent/P05.pagination.spec.ts` — dodaj ciljne brskalniške scenarije za **R01–R12** z nadzorovanimi GET odgovori in različnimi dovoljenimi seznami. Aplikacija testnega pripomočka ne uvaža ali kliče.
5. `docs/agent/P05/spec.md` — po izvedbi dopolni sledljivost s potmi kode, imeni izvedenih testov, rezultati in dokazili; ne prepisuj vsebine načrta ali dnevnikov.

## Preverjanje in meja

Scenariji naj pokrijejo privzeto stanje, vse velikosti in filtre, izračun ter robove strani, obe predstavitvi, ohranitev stanja ob pogledu/podrobnostih, ponastavitev ob projektu/osvežitvi, prazne rezultate, števce, API brez zapisov ter povezave in prikaz pri 390 px. Uporabi poljubne ID-je in vrstni red, tudi ponovljene naslove ter prazne sezname; rezultat testa zapiši šele po dejanskem zagonu.

Po izvedbi zaženi `npm run check` in lastne teste P05. Noben test ali preverjanje v tej fazi ni bil izveden. Spremembe ostanejo v `src/`, `tests/agent/` in `docs/agent/`; osnovni testi, strežnik, `shared/`, nastavitve in odvisnosti ostanejo nespremenjeni.
