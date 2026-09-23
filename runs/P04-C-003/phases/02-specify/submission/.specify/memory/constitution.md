# Folio — projektna načela pilota P04, postopek C

**Različica:** 1.0.0 | **Sprejeto:** 2026-09-23 | **Posodobljeno:** 2026-09-23

## 1. Izvorne zahteve in omejen obseg

Merilo so [projektna pravila](../../PROJECT_RULES.md) in vseh dvanajst zahtev R01–R12 iz [navodil P04](../../task/instructions.md), tudi kadar jih izvedbeni dokument izpusti. Specifikacija sledi [skupni predlogi](../../task/specification-template.md); povezave med dokumenti Spec Kit lahko nadomestijo podvajanje. Ne dodajamo zahtev, odvisnosti ali obveznih arhitekturnih preureditev.

## 2. Ohranjeni Folio in identiteta opravil

Dopolnjujemo obstoječi vmesnik ter ohranimo slovenska poimenovanja, [potrjeni dizajn Folio](../../docs/dizajn.md), dostopnost in prilagodljivost. Upoštevamo predpisane kontrole, oznake in `data-task-id`; opravila izbiramo po `id`, tudi ob enakih naslovih. Ostale bralne funkcije ostanejo delujoče.

## 3. Javni API in nespremenjeni podatki

Aplikacija bere podatke iz javnega `/api/`; `/__test/` je namenjen samo testnemu programu. Strežnika ne nadomeščamo z lokalno kopijo ali `localStorage`. Razvrščanje je stabilna projekcija po pravilih R01–R12, brez spreminjanja izvornega polja, podatkov opravil ali zapisov na API. Nastavitve imajo življenjski cikel, določen v zahtevah, brez trajne shrambe ali URL-ja. Rešitev podpira opisano domeno podatkov, ne le razvojnih primerov.

## 4. Meje sprememb

Dovoljene so spremembe v `src/`, `tests/agent/` in `docs/agent/`; postopek C dodatno dovoljuje `.specify/memory/constitution.md` in `.specify/feature.json`. Začetni podatki, `server/`, `shared/`, skupni testi, odvisnosti, nastavitve, uradne predloge, veščine in druge datoteke Spec Kit ostanejo samo berljive. Dokumentacija funkcionalnosti je v `docs/agent/P04`. Ne ustvarjamo vej ali commitov in ne uporabljamo drugih projektov, konektorjev ali oddaljenih repozitorijev.

## 5. Sledljivost in dejanska dokazila

Vsako R01–R12 povežemo s sprejemnim pogojem, kodo, testom oziroma scenarijem in dejanskim izidom. Izbrane pogoje izrazimo tudi s predikati in pojasnimo simbole. Izvedbo preverimo s skupnimi testi in smiselnimi dodatnimi preverjanji P04. Dokazila shranjujemo sproti, z določljivim virom rezultata; po popravkih posodobimo povezave in ohranimo zgodovino sprememb specifikacije. Neizvedenih ali nedostopnih končnih testov ne označujemo kot uspešnih. Predaja navede spremembe, preverjanja, neizpolnjene zahteve in omejitve.

## Vodenje postopka

Isti agent izvaja le korak lokalne uradne veščine, ki ga sproži izvajalnik, brez drugih agentov. Ta načela povzemajo izvorna pravila in jih ne nadomeščajo ali širijo. Odprta vprašanja rešujemo iz zahtev; ob manjkajočem bistvenem podatku jasno navedemo omejitev in se ustavimo. Upoštevamo skupni časovni okvir, preostanek preverjamo z `node task/time-budget.mjs`, delo shranjujemo sproti in zadnjo minuto namenimo predaji.
