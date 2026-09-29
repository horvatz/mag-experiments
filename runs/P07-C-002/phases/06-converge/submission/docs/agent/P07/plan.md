# Načrt izvedbe P07

Datum: 2026-09-25. Podlaga: [specifikacija](spec.md), [načela](../../../.specify/memory/constitution.md), [izvirne zahteve](../../../task/instructions.md). Načrt ne spreminja obsega R01–R12. Načrt je izveden; dejanski rezultati in sledljivost so v [verification.md](../verification.md).

## Tehnični kontekst

- Obstoječi React 19.3 / TypeScript 6 / Vite 8, ikone `lucide-react`, npm in Node 24; vse odvisnosti so že nameščene. Brez dodajanja paketov ali spreminjanja nastavitev.
- `src/App.tsx`: trajni koren `App`, nalaganje projektov in `ProjectView key={project.id}` z nalaganjem opravil, preglednico in izbiro pogleda. Ključ projekta že omogoča pravilno ponastavitev lokalnega stanja.
- `src/TaskBoard.tsx`: tri po stanju razvrščene skupine, števci iz prejetih opravil, kartice s povezavo na podrobnosti. `src/navigation.ts` uporablja hash in kodira ID-je; `TaskDetails.tsx` nalaga podrobnosti po ID-ju.
- `useResource.ts`, `api.ts` in `shared/types.ts` ostanejo vir podatkov in tipov. Nobenega novega API-ja ali spremembe strežnika.
- `src/styles.css` vsebuje potrjene barve, gradnike, vidni fokus in notranje drsenje. `main.tsx` uporablja React StrictMode.
- Playwright že vključuje skupna projekta desktop/mobile, API, razvojne teste in projekt `agent` za `tests/agent/`. Uporabi se obstoječi zagon strežnika in nameščeni Chromium brez sprememb konfiguracije.

## Odločitve in razdelitev datotek

| Datoteka | Odgovornost in sprememba | Zahteve |
| --- | --- | --- |
| `src/useFavorites.ts` (nova) | Enotno branje/validacija, množica ID-jev, kanoničen zapis, preklop, odstranitev množice ID-jev, poslušalec `storage`, opozorilo o napaki dostopa. | R02–R04, R08–R09, R11–R12 |
| `src/FavoriteButton.tsx` (nova) | Majhen skupen gumb z ikono zvezde, točnim dostopnim imenom po ID-ju, `aria-pressed` in povratnim klicem. | R01, R07, R12 |
| `src/App.tsx` | `App` kliče hook enkrat in stanje podaja projektu. `ProjectView` hrani samo filter, izračuna vidna opravila ter projektni števec, prikaže filter/odstranitev/opozorilo/prazni rezultat in gumb v vsaki vrstici. | R01, R05–R10, R12 |
| `src/TaskBoard.tsx` | Prejme filtrirana opravila, množico in preklop; doda gumb kot sorojenca povezave znotraj iste kartice. Števce še naprej računa iz prejetih opravil. | R01, R06–R07, R10, R12 |
| `src/styles.css` | Slog gumba in prelomljive vrstice kontrol, diskretno opozorilo, umestitev gumba ob povezavo kartice; uporaba obstoječih spremenljivk in notranjega drsenja. | R01, R12 |
| `tests/agent/P07.spec.ts` (nova) | Dopolnilni vedenjski testi robnih primerov, shrambe, pogledov, projektov in širine 390 px. | R01–R12 |
| `docs/agent/P07/spec.md`, `tasks.md`, `../verification.md` | Sledljivost dejanske kode/testov, napredek nalog ter jedrnati rezultati in omejitve z dnevniki. | Predaja |

### Shramba in življenjska doba stanja

Hook se inicializira z lenim branjem `localStorage` znotraj `try/catch`; `JSON.parse` in validacija sledita funkciji `D` v specifikaciji. `Set<string>` odstrani podvojitve, neznanih ID-jev ne filtrira po trenutno naloženih opravilih. Zapis uporabi `[...ids].sort()` (privzeto UTF-16) in samo `{version: 1, ids}`.

Uporabniški dogodki najprej izračunajo novo množico, jo objavijo v pomnilniku in poskusijo zapis. Zapis ne sodi v inicializacijo, učinek ob vsaki spremembi ali funkcijo posodobitve React stanja, saj bi to povzročilo začetne/povratne zapise oziroma ponovitve v StrictMode. Za zaporedne dogodke se lahko uporabi referenca zadnjega posnetka, ki jo posodobijo samo dogodki. Napaka zapisa ne povrne prejšnje množice.

Učinek registrira en poslušalec `storage` in ga ob odstranitvi komponente počisti. Samo pravi ključ zamenja množico prek iste validacije; ne kliče zapisovanja. Opozorilo je po prvi izjemi dostopa vidno do ponovnega nalaganja aplikacije; to je dovoljena izbira iz specifikacije. Napaka vsebine sama po sebi ni izjema dostopa.

### Pogledi in kontrole

Globalni hook v `App` preživi menjavo projekta. `ProjectView` uporablja `useState(false)` za filter; obstoječi `key={project.id}` ponastavi filter ob menjavi projekta, sprememba pogleda pa ga ohrani. Osvežitev znova prebere ID-je in začne z izključenim filtrom.

Iz celotnega `tasks` se izračunata `X` in `M`, omogočenost odstranitve ter seznam vseh ID-jev projekta. `visibleTasks` je stabilno filtriranje brez razvrščanja ali spreminjanja opravil. Preglednica in tabla prejmeta isti seznam. Obstoječi povzetek stanj projekta ostane vezan na celoten projekt; števci stolpcev table na vidna opravila.

Kontrole so pod izbiro pogleda in ostanejo prikazane pri nič rezultatih. Pri aktivnem praznem filtru se pokaže točno zahtevano sporočilo; tabla kljub temu ohrani vse tri stolpce z ničelnimi števci, preglednica pa ne izrisuje vrstic. Pri izključenem filtru se ohrani začetno vedenje praznega projekta.

Gumb priljubljenega ni otrok povezave: v preglednici je ob povezavi v celici, na tabli sorojenec obstoječe povezave znotraj `li[data-task-id]`. Umestitev zagotovi prostor za ID in naslov ter vidni fokus, brez prekrivanja besedila. Dekorativna ikona ima `aria-hidden`. Ohranijo se vse obstoječe oznake in poti podrobnosti.

## Vrstni red izvedbe in preverjanje

1. Implementiraj hook in skupni gumb; nato poveži stanje v `App`, filter, projektne kontrole in preglednico.
2. Dopolni tablo in minimalne sloge; ohrani podrobnosti in obstoječo navigacijo.
3. Dodaj lastne teste po scenarijih S01–S12, predvsem primere, ki jih štirje razvojni testi ne zajamejo: neveljavni zapisi, odsotnost začetnega zapisa, neznani/Unicode ID-ji, globalnost med projekti, projektna odstranitev, dogodki brez odmeva, izjeme branja/zapisa, prazni projekti ter števci.
4. Testi smejo uporabiti obstoječi `tests/development/helpers.ts` za nadzorovane GET odgovore in testne kontrole; produkcijska koda ga ne sme uvažati. Preveri drugačen vrstni red, enake naslove, Unicode, nič/eno/več kot deset opravil, pravilne podrobnosti in odsotnost zapisov na API.
5. Zaženi `npm run lint`, `npm run build` ter `npm test` (skupni API, obe širini izhodiščnih/razvojnih testov in lastni testi). V lastnih testih izrecno nastavi širino 390 px za oba pogleda in preveri tudi postavitev novih kontrol. Shrani izhode v `docs/agent/P07/` in vizualno preglej posnetek vmesnika.
6. Odpravi ugotovljene napake, ponovi relevantna preverjanja, nato posodobi sledljivost in navedi dejanske izide, neizvedene dele ter omejitve. Nedostopni končni testi ostanejo označeni kot neizvedeni.

## Preverjanje skladnosti in tveganja

Načrt uporablja samo dovoljene aplikacijske/testne/dokumentacijske poti, ohrani infrastrukturo in Folio, ne uvaja novih odvisnosti ter ne spreminja podatkov opravil. Ne zahteva zunanjih virov, drugih agentov ali Git operacij.

Najpomembnejši tveganji sta nenameren zapis ob inicializaciji/dogodku shrambe in izguba globalne množice ob menjavi projekta; ločitev eksplicitnega zapisovanja ter stanja v `App` ju naslavlja. Robne scenarije potrjujejo testi vedenja. Bistvenih odprtih vprašanj ni.
