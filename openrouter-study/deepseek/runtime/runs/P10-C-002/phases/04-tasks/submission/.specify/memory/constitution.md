# Ustava projekta Folio (P10)

## Osnovna načela

### I. Stroge meje sprememb (NEDOGOVORLJIVO)
Spreminjajo se lahko samo `src/`, lastni testi v `tests/agent/` in dokumentacija v `docs/agent/`.
Za postopek C velja dodatna izjema: `.specify/memory/constitution.md` in `.specify/feature.json`.
Vse ostalo — izhodiščni podatki, `server/`, `shared/`, skupni testi `tests/baseline.spec.ts` in
`tests/api.spec.ts`, odvisnosti, nastavitve zagona in preverjanja, uradne predloge in datoteke
veščin — ostane nespremenjeno. Obseg naloge se ne širi.

### II. Potrjeni videz Folio
Uporabniški vmesnik ostane potrjeni Folio iz `docs/dizajn.md`: slovenska poimenovanja, obstoječi
gradniki in slogovne spremenljivke, obstoječa dostopna imena pogledov in stolpcev, `data-task-id`,
`aria-label="Pregled stanj opravil"` ter viden fokus. Nova dejanja ob opravilu so zunaj njegove
povezave; razporeditev novih kontrol, ki ni predpisana, ostane svobodna.

### III. Javni API kot edini vir podatkov
Branje in shranjevanje poteka izključno prek javnega API-ja `/api/`; opravila se razlikujejo po
`id` in enaki naslovi se ne povezujejo. Testne kontrole `/__test/` uporablja samo testni program;
uporabniški vmesnik jih ne uvaža, ne bere testnega stanja in ne ponastavlja podatkov. Strežnika se
ne nadomešča z lokalno kopijo ali `localStorage`; novih zapisovalnih API-jev ni. Spremembe
vrstnega reda so lokalne permutacije iste množice ID-jev.

### IV. Dokazi o preverjanju
Vsaka zahteva R01–R12 dobi pogoj, kodo in dejansko izveden test. Pred oddajo se poženejo skupni
testi in ločeni testi te naloge; izidi se zabeležijo z imenom testa in dnevnikom zagona.
Neizvedenih ali nedosegljivih testov se ne navaja kot uspešnih; nepreverjeni deli in omejitve se
zapišejo.

### V. Sledljiva specifikacija po skupni predlogi
Izdelek je specifikacija po skupni predlogi (`task/specification-template.md`), ki poveže vse
zahteve R01–R12 in izbrane pogoje izrazi s predikati. Vsebine se ne podvaja; sklicuje se na dele
dokumentov Spec Kit. Pojasnila se črpajo iz obstoječih zahtev; če bistvenega podatka ni, se
omejitev zapiše in delo ustavi, odgovora pa se ne izmisli.

## Dodatne omejitve

- Stanje nove funkcionalnosti je lokalno trenutnemu projektu; trajna shramba ni predpisana, razen
  kjer zahteva določa drugače. Nove odvisnosti in spremembe tehnologije (React, Vite, TypeScript)
  niso dovoljene.
- Navigacija med nezakučenim nalaganjem in sočasne spremembe podatkov brez osvežitve niso del
  obsega.
- Delo poteka v enem agentu z ohranjeno zgodovino; vej in commitov se ne ustvarja, tuja orodja in
  viri niso dostopni.

## Razvojni tok

- Vrstni red korakov Spec Kit: specify → plan → tasks → implement, vsak z lokalno veščino iz
  `.agents/skills/`.
- Vsaka sprememba mora ustrezati načelu I; kršitev zahteva vnaprej dogovorjeno posodobitev
  izhodišča za vse postopke.
- Dokazi se beležijo sproti; zadnja minuta roka je namenjena predaji in končnemu odgovoru.

## Upravljanje

Ustava prevlada nad drugimi praksami; zahteve R01–R12 iz `task/instructions.md` ostajajo obvezne
ne glede na to, ali jih posamezen dokument izpusti. Spremembe ustave zahtevajo zapis, obrazložitev
in preverjanje skladnosti z mejami načela I.

**Različica**: 1.0.0 | **Sprejeto**: 2026-11-01 | **Zadnja sprememba**: 2026-11-01
