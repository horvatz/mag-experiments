# P10 — izvedbeni načrt

## Obseg in tehnični kontekst

Folio uporablja React 19, TypeScript 6 in Vite 8; odvisnosti so že nameščene. Podatke o projektih in opravilih nalaga obstoječi useResource prek javnega GET API-ja. ProjectView v src/App.tsx prikaže preglednico ali TaskBoard; TaskDetails se odpre glede na trenutno pot. Tabla filtrira seznam v tri stalne stolpce. src/styles.css že vsebuje prilagodljivo postavitev in notranje drsenje obeh pogledov.

Izvedba bo omejena na src/, lastne teste v tests/agent/ in dokumentacijo v docs/agent/. Ne spreminjajo se API, skupni tipi, strežnik, skupni testi, nastavitve ali odvisnosti. Potrjeni videz Folio in obstoječe slovenske oznake ostanejo.

## Odločitve in arhitektura

1. **Stanje kot permutacija ID-jev.** Dodati majhen, čist model prehodov v src/taskOrder.ts: izvorni in trenutni seznam ID-jev ter sklada undo/redo. Premik zamenja samo sosednja ID-ja; zgodovina razveljavitev je omejena na 20. Robna dejanja vrnejo nespremenjeno stanje. Reset je eno dejanje, ki shrani prejšnji vrstni red in počisti redo. Task objekti se ne klonirajo ali spreminjajo.
2. **Lastništvo stanja.** ProjectView v src/App.tsx upravlja model trenutnega projekta in ga inicializira, ko so opravila naložena. Njegov ključ po ID-ju projekta povzroči ponastavitev ob menjavi projekta; sprememba pogleda ali taskId ohrani komponento in zgodovino. Osvežitev znova naloži API in začne z njegovim vrstnim redom. Ne shranjuje se v URL ali trajno shrambo.
3. **En vrstni red za oba pogleda.** Iz trenutnih ID-jev izpeljati seznam opravil z iskanjem po ID-ju. Preglednica ga prikaže neposredno; TaskBoard ga filtrira po nespremenjenih statusnih stolpcih, zato relativni vrstni red ostane pravilen, dejanje na kartici pa vedno uporabi globalnega soseda.
4. **Kontrole in dostopnost.** V App.tsx dodati kontrolno skupino za razveljavitev, ponovitev, začetni vrstni red in števec role=status. V preglednici in TaskBoard.tsx dodati globalno mesto ter gumba ob vrstici/kartici, kot sorojenca povezave. Ohraniti data-task-id, obstoječa imena pogledov/stolpcev in zahtevano ime pregleda stanj.
5. **Slogi.** V src/styles.css dodati le potrebne razmike, velikosti in stanja kontrol z obstoječimi barvami in spremenljivkami. Ne preurejati postavitve. Preveriti širino 390 px; uporabljati obstoječe drsne ovoje za preglednico in tablo.
6. **Brez novega omrežnega toka.** Opravila ostanejo izključno iz obstoječih GET klicev. Preurejanje ne kliče updateTask, ne uporablja /__test/ v aplikaciji in ne spreminja podatkovnih polj.

## Datoteke

| Datoteka | Načrtovana sprememba |
| --- | --- |
| src/taskOrder.ts | Nov tip stanja in čisti prehodi za move, undo, redo, reset ter inicializacija; invariant ID-permutacije. |
| src/App.tsx | Stanje projekta, izpeljava urejenega seznama, kontrolna skupina, globalna mesta in kontrole preglednice. |
| src/TaskBoard.tsx | Prejeti urejeni seznam in callback za premik; globalna mesta/kontrole kartic; ohraniti stolpce, povezave in aria imena. |
| src/styles.css | Slogi novih kontrol, prilagoditev širini in vidnemu fokusu ob ohranitvi Folio. |
| tests/agent/P10.spec.ts | Lastni Playwright sprejemni scenariji; uporabiti obstoječe testne helperje, brez posega v skupne teste. |
| docs/agent/P10/spec.md | Po izvedbi dopolniti sledljivost z dejanskimi datotekami, testi, izidi in dokazili. |

src/TaskDetails.tsx, navigacija, javni API, tipi in projektne nastavitve ostanejo nespremenjeni.

## Preverjanje in zaporedje dela

1. Implementirati ter preveriti čiste prehode za sosednji premik, robove, razveljavitve/ponovitve, vejo po razveljavitvi, omejitev 20 in reset.
2. Povezati stanje v ProjectView, nato dodati kontrolno skupino, preglednico in tablo. Ob tem zagotoviti ohranitev stanja pri preklopu pogleda/podrobnosti ter reset ob menjavi projekta.
3. V tests/agent/P10.spec.ts pokriti R01–R12: začetni vrstni red in podvojeni naslovi; več undo/redo ter 21 premikov; reset; globalni sosed na tabli; navigacija; prazen/enojni in večji seznam; nespremenjena polja/statusi in nič zapisov; oznake, števec in širina 390 px. Uporabiti nadzorovane GET odgovore samo prek priloženih test helperjev.
4. Zagnati skupne razvojne in regresijske teste ter npm run lint in npm run build. Že obstoječi tests/development/P10.spec.ts je dodatna pokritost, ne nadomestilo za vse zahtevane robne primere. V spec.md zabeležiti samo dejansko izvedene teste in rezultate.

## Omejitve

Načrt ne uvaja novih odvisnosti, endpointov, infrastrukture, trajne shrambe ali dodatnih uporabniških zahtev. Nedostopnih končnih testov se ne bo predstavljalo kot izvedenih; odstopanja in nepreverjeni primeri bodo navedeni pri predaji.
