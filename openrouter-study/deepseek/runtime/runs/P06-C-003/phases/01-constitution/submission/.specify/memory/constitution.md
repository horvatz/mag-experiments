# Ustava projekta Folio

## Temeljna načela

### I. Omejene dovoljene spremembe
Spremembe so dovoljene samo v `src/`, `tests/agent/` in `docs/agent/`; procesno velja izjema za `.specify/memory/constitution.md` in `.specify/feature.json`. Strežnik (`server/`), skupni tipi (`shared/`), skupni testi (`tests/baseline.spec.ts`, `tests/api.spec.ts`), odvisnosti ter nastavitve zagona in preverjanja ostanejo nespremenjeni.

### II. Javni API je edini vir podatkov
Aplikacija bere in shranjuje podatke izključno prek javnega vmesnika `/api/`. Testnih kontrol `/__test/` uporabniški vmesnik ne uporablja, ne bere testnega stanja in ne nadomešča strežnika z lokalno kopijo podatkov ali `localStorage`.

### III. Ohranjen videz Folio
Potrjeni dizajn Folio (`docs/dizajn.md`) in slovenska poimenovanja se ohranijo; dopolnitve uporabljajo obstoječe gradnike in slogovne spremenljivke.

### IV. Sledljivost zahtev
Vsaka zahteva R01–R12 je povezana s pravilom, kodo in dejansko izvedenim preverjanjem. Izida se ne označi kot uspešnega brez dokaza; neizvedeni testi se navedejo kot neizvedeni.

### V. Brez širjenja obsega
Ne dodajamo novih zahtev, odvisnosti, zapisovalnih API-jev ali infrastrukturnih preureditev. Če bistvenega podatka ni, se omejitev jasno zapiše in delo ustavi; manjkajočega odgovora se ne izmišljuje.

## Dodatne omejitve

- Začetni podatki in delovanje izhodišča se ohranijo; sprememba skupne infrastrukture zahteva vnaprej dogovorjeno posodobitev izhodišča za vse postopke.
- Stanje nove funkcionalnosti je lokalno trenutnemu projektu, razen kjer posamezna zahteva določa drugače.
- Videz ostane prilagodljiv; na širini 390 pik se cela stran ne razširi.

## Razvojni tok

- Pred izvedbo se zahteve preberejo in zajamejo po skupni predlogi specifikacije.
- Preverjanje poteka s skupnimi testi in smiselnimi lastnimi preverjanji v `tests/agent/`.
- Predaja vsebuje opis sprememb, izvedena preverjanja, njihove rezultate in morebitne neizpolnjene zahteve.

## Upravljanje

Ta ustava velja za delo na nalogi P06. Izvirne zahteve naloge so merilo tudi, če jih posamezna specifikacija izpusti. Spremembe ustave se dokumentirajo.

**Različica**: 1.0.0 | **Sprejeto**: 2026-10-10 | **Nazadnje spremenjeno**: 2026-10-10
