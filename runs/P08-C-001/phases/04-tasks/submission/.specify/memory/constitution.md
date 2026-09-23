# Ustava projekta Folio — pilot P08, postopek C

## Projektna načela

### 1. Izvirne zahteve in omejen obseg

Merilo so [PROJECT_RULES.md](../../PROJECT_RULES.md) in vseh dvanajst zahtev R01–R12 iz [navodil P08](../../task/instructions.md), tudi kadar jih izvedbeni dokument izpusti. Dopolnimo obstoječi vmesnik s koledarskim pregledom rokov brez novih zahtev, odvisnosti, zapisovalnih API-jev ali obveznih arhitekturnih preureditev.

### 2. Ohranitev potrjenega vmesnika

Ohranimo slovenska poimenovanja, prilagodljiv dizajn [Folio](../../docs/dizajn.md), obstoječa polja, bralne podrobnosti in dogovorjene dostopne oznake. Upoštevamo dogovor P08 za nove kontrole, opozorila, števce, prazna stanja in identifikatorje vrstic ter kartic. Pri širini 390 pik se cela stran ne razširi; dovoljeno je notranje drsenje preglednice in table.

### 3. Javni API in pravilna identiteta podatkov

Aplikacija podatke bere prek obstoječega `/api/` in opravila izbira po `id`; pregled rokov ne zapisuje na API. Ne uporablja `/__test/`, testnih pripomočkov ali lokalne kopije strežniških podatkov. Rešitev podpira opisano domeno podatkov, vključno s praznimi projekti, poljubnim številom opravil, različnimi ID-ji, ponovljenimi naslovi in veljavnimi koledarskimi datumi. Stanje filtra ostaja lokalno trenutnemu projektu brez trajne shrambe ali URL-ja.

### 4. Sledljivost in resnična dokazila

[Skupna predloga](../../task/specification-template.md) je obvezna; lahko jo izpolnimo s povezavami na dokumente Spec Kit v `docs/agent/P08/`. Vseh R01–R12 povežemo s sprejemnimi pogoji, kodo, testi oziroma scenariji ter dejanskimi izidi in določljivimi dokazili. Izbrane pogoje izrazimo s predikati, pojasnimo simbole in ločimo splošna pravila od primerov. Ohranimo zgodovino sprememb specifikacije ter navedemo odprta vprašanja, omejitve in nepreverjene dele.

### 5. Preverjanje ob nespremenjenem izhodišču

Rešitev preverimo s skupnimi testi in smiselnimi lastnimi preverjanji zahtev P08. Izhodiščni testi sami ne dokazujejo vseh zahtev. Neizvedenih ali nedostopnih končnih testov ne navajamo kot uspešnih. Predaja navede spremembe, izvedena preverjanja, rezultate in neizpolnjene zahteve.

## Nedotakljive meje in potek

- Spremembe so omejene na `src/`, `tests/agent/`, `docs/agent/` ter procesni datoteki `.specify/memory/constitution.md` in `.specify/feature.json`.
- Začetni podatki, `server/`, `shared/`, skupni testi, odvisnosti, nastavitve zagona in preverjanja, uradne predloge, veščine ter druge datoteke Spec Kit ostanejo samo berljive.
- Postopek vodi isti agent z ohranjeno zgodovino, brez drugih agentov, vej ali commitov. Izvede samo korak lokalne veščine, ki ga sproži izvajalnik. Raziskovanje je omejeno na lokalno kodo in priložena navodila.
- Delo in dokazila shranjujemo sproti, preostanek skupnih 20 minut preverjamo z `node task/time-budget.mjs`, zadnjo minuto namenimo predaji. Ob manjkajočem bistvenem podatku zapišemo omejitev in se ustavimo; odgovora uporabnika ne izmišljamo.

## Upravljanje

Ustava povzema obstoječa projektna pravila in izrecno procesno dopolnitev uporabnika; ne razširja obsega naloge. Ob neskladju veljajo izvirne zahteve in uporabnikova navodila. Spremembe ustave morajo ostati znotraj teh meja.

**Različica**: 1.0.0 | **Sprejeto**: 2026-09-23 | **Nazadnje spremenjeno**: 2026-09-23
