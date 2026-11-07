# Ustava projekta Folio (pilot P09)

## Temeljna načela

### I. Zamejene spremembe (NEPOGOJNO)
Spreminjamo samo UI kodo v `src/`, lastne teste v `tests/agent/` in lastno dokumentacijo v `docs/agent/`. Strežnik (`server/`), skupni tipi (`shared/`), skupni testi (`tests/baseline.spec.ts`, `tests/api.spec.ts`), odvisnosti ter nastavitve zagona in preverjanja ostanejo nespremenjeni; sprememba skupne infrastrukture zahteva vnaprej dogovorjeno posodobitev izhodišča za vse postopke. Naloga se ne širi prek zahtev R01–R12.

### II. Potrjeni videz Folio
Uporabniški vmesnik ostaja Folio: obstoječi gradniki, slogovne spremenljivke in slovenska poimenovanja. Potrjeni dizajn iz `docs/dizajn.md` (barve, postavitev, fokus, odzivnost) se ohrani; nove kontrole se vključijo v obstoječe gradnike brez preureditve videza.

### III. Podatki samo prek javnega API-ja
Vsi podatki se berejo in shranjujejo prek javnega vmesnika `/api/` in izbirajo po `id`. UI ne uporablja testnih kontrol `/__test/`, ne nadomešča strežnika z lokalno kopijo podatkov ali `localStorage` in ne uvaja novih zapisovalnih API-jev.

### IV. Preverljivost in dokazila
Vsaka zahteva R01–R12 je povezana s pogoji, kodo in dejansko izvedenimi testi; izidi se navajajo šele po izvedbi. Neizvedenih preverjanj se ne navaja kot uspešnih; nepreverjeni deli in omejitve se izrecno zapišejo. Preverjanje vključuje skupne teste izhodišča in lastne teste naloge.

### V. Lokalno stanje brez širjenja obsega
Stanje nove funkcionalnosti je lokalno trenutnemu projektu, razen kadar zahteva določa URL ali trajno shrambo. Obseg se ne širi prek obstoječih regresijskih zahtev (npr. navigacije med nalaganjem, sočasnih sprememb podatkov brez osvežitve).

## Dodatne omejitve

- Tehnološki sklad in odvisnosti so nespremenjeni; brez novih knjižnic.
- Specifikacija sledi skupni predlogi P09 (`task/specification-template.md`); izbrane zahteve se izrazijo s predikati ali pravili spremembe stanja.
- Dokumenti se ne podvajajo; skupna predloga se lahko izpolni s povezavami na dokumente Spec Kit.

## Razvojni tok

- Zaporedje korakov: specifikacija → načrt → naloge → izvedba; vse korake opravlja isti agent z ohranjeno zgodovino, brez zaganjanja drugih agentov.
- Dokumenti Spec Kit so read-only, razen procesnih datotek, ki jih dovoljuje postopek C (`.specify/memory/constitution.md`, `.specify/feature.json`).
- Dokazila se pišejo sproti in jedrnato; končna oddaja opiše spremembe, izvedena preverjanja, njihove rezultate in neizpolnjene zahteve.

## Upravljanje

Ta ustava prevlada nad drugimi praksami projekta. Spremembe se dokumentirajo in obrazložijo; ob neskladju med zahtevo in ustavo se ustava posodobi ali zahteva zavrne. Skladnost preverjata načrt in izvedba.

**Različica**: 1.0.0 | **Sprejeta**: 2026-10-31 | **Zadnja sprememba**: 2026-10-31
