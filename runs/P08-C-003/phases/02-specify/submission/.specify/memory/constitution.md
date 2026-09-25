# Ustava projekta Folio — pilot P08, postopek C

**Različica:** 1.0.0 | **Sprejeto:** 2026-09-25 | **Zadnja sprememba:** 2026-09-25

## Projektna načela

1. **Izvirne zahteve ostajajo merilo.** Izvedba koledarskega pregleda rokov mora zajeti vseh R01–R12 in dogovor o vmesniku iz `task/instructions.md`, tudi če nadaljnji dokument kakšno zahtevo izpusti. Razvojni primeri ne omejujejo veljavne podatkovne domene. Ne dodajamo novih funkcionalnih zahtev ali obveznih arhitekturnih preureditev.

2. **Ohranimo Folio.** Dopolnjujemo obstoječi vmesnik s slovenskimi poimenovanji in potrjenim dizajnom iz `docs/dizajn.md`. Ohranimo zahtevana dostopna imena, oznake, `data-task-id`, obstoječa polja in bralne podrobnosti ter prilagodljivost pri širini 390 pik; notranje drsenje preglednice in table je dovoljeno.

3. **Javni API je vir podatkov.** Aplikacija uporablja samo obstoječi `/api/` in izbira opravila po `id`. Pregled rokov ne pošilja zapisov na API. Ne nadomeščamo strežnika z lokalno kopijo podatkov ali `localStorage`; stanje filtra se ne shranjuje trajno ali v URL. Kontrole `/__test/` so izključno za teste in jih vmesnik ne uporablja.

4. **Meje sprememb so obvezne.** Dovoljeni so `src/`, lastni testi v `tests/agent/`, dokumenti v `docs/agent/` ter izrecno dovoljeni procesni datoteki `.specify/memory/constitution.md` in `.specify/feature.json`. Začetni podatki, strežnik, skupni tipi in testi, odvisnosti, nastavitve, uradne predloge, veščine in ostale datoteke Spec Kit ostanejo nespremenjeni. Ne dodajamo odvisnosti ali spreminjamo infrastrukture.

5. **Dokumentacija omogoča sledljivost in preverjanje.** Skupno predlogo `task/specification-template.md` izpolnimo tudi s povezavami na dokumente v `docs/agent/P08`, brez podvajanja. Vsako R01–R12 povežemo s sprejemnim pogojem, kodo, testom ali scenarijem in dejanskim izidom. Izbrane pogoje izrazimo s predikati in pojasnimo simbole. Po popravkih posodobimo povezave ter ohranimo zgodovino sprememb specifikacije.

6. **Dokazila so dejanska.** Rešitev preverimo s skupnimi testi in smiselnimi dodatnimi preverjanji zahtev P08. Sproti zapišemo izvedena preverjanja, rezultate in določljiv vir dokazov. Neizvedenih ali nedostopnih končnih testov ne označimo kot uspešnih. Predaja navede spremembe, neizpolnjene zahteve, nepreverjene scenarije in omejitve.

## Pravila postopka

Isti agent z ohranjeno zgodovino izvaja samo korak lokalne uradne veščine, ki ga sproži izvajalnik. Ne zaganjamo drugih agentov, ne uporabljamo drugih projektov, zunanjih gradiv ali povezovalnikov ter ne ustvarjamo vej ali commitov. Delo sproti shranjujemo; čas preverjamo z `node task/time-budget.mjs` in zadnjo minuto skupnega roka namenimo predaji.

Ta ustava povzema `PROJECT_RULES.md`, `task/instructions.md`, skupno predlogo in izrecna navodila pilota; ne nadomešča izvirnih zahtev in ne širi dovoljenega obsega. Odprta vprašanja rešujemo iz teh virov. Ob manjkajočem bistvenem podatku jasno navedemo omejitev in se ustavimo, brez izmišljanja uporabnikovega odgovora.
