# Projektna ustava Folio — pilot P02, postopek C

## Vodilna načela

1. **Izvirne zahteve so merilo.** Veljajo `PROJECT_RULES.md`, vseh dvanajst zahtev R01–R12 in dogovor o vmesniku iz `task/instructions.md`. Specifikacija, načrt ali testi njihovega obsega ne zmanjšajo in ne širijo. Naloga obsega množično spremembo stanja opravil trenutnega projekta; drugih polj se ne ureja.

2. **Ohranitev obstoječega izdelka.** Ohranijo se potrjeni videz Folio iz `docs/dizajn.md`, slovenska poimenovanja, projekti, preglednica, tabla in bralne podrobnosti. Upoštevajo se predpisana dostopna imena, stanja kontrol in omejitve prikaza na ozkem zaslonu. Ustava ne zahteva novih odvisnosti ali arhitekturnih preureditev.

3. **Javni API in celovitost podatkov.** Podatki se berejo in shranjujejo prek `/api/`, opravila se izbirajo po `id`. Posamezni zapis pošlje nespremenjeni prebrani naslov in ciljno stanje. Potrjeni uspehi ostanejo shranjeni ob delnem neuspehu; ponovitev zajame samo neuspele ID-je. Neizbrana opravila, drugi projekti in druga polja ostanejo nespremenjeni. Ni povratnih zapisov, lokalnega nadomestka strežnika ali trajnega izbora v brskalniku. Kontrole `/__test/` uporablja samo testni program.

4. **Sledljivost brez podvajanja.** Dokumenti v `docs/agent/P02` skupaj pokrijejo `task/specification-template.md`; dovoljene so povezave med dokumenti Spec Kit. Vsaka zahteva R01–R12 se poveže s pravilom oziroma sprejemnim pogojem, preverjanjem, kodo in dejanskim dokazom. Delni uspeh, ponavljanje in nespremenljivost neizbranih podatkov se izrazijo tudi s predikati z razloženimi simboli. Ohrani se zgodovina sprememb specifikacije.

5. **Preverljiva in poštena oddaja.** Rešitev se preveri s skupnimi testi in ločenimi preverjanji zahtev P02; smiselno se dodajo lastna preverjanja. Uspeh razvojnih testov sam ne dokazuje vseh zahtev. Zapis oddaje navede spremembe, dejansko izvedene teste, rezultate z določljivim izvorom ter neizpolnjene ali nepreverjene zahteve. Neizvedenih testov se ne označuje kot uspešnih.

## Neprekoračljive meje

- Aplikacijske spremembe so omejene na `src/`, lastne teste `tests/agent/` in dokumente `docs/agent/`. Postopek C lahko dodatno spremeni `.specify/memory/constitution.md` in `.specify/feature.json`.
- Začetni podatki, `server/`, `shared/`, skupni in priloženi testi, odvisnosti, nastavitve, uradne predloge, datoteke veščin in ostale datoteke Spec Kit so samo berljivi.
- Korake izvaja isti agent z ohranjeno zgodovino po izrecno sproženih lokalnih veščinah Spec Kit 1.0.8, preset Lean 1.0.0. Ne zaganja drugih agentov, ne ustvarja vej ali commitov ter ne uporablja drugih projektov, konektorjev, oddaljenih repozitorijev ali javnega interneta.
- Delo se sproti shrani; čas se preverja z `node task/time-budget.mjs`. Celoten potek ima največ 20 minut, zadnja minuta je namenjena predaji. Bistven manjkajoči podatek se navede kot omejitev in delo ustavi; uporabnikovih odgovorov se ne izmišlja.

## Veljavnost

Ustava povzema obstoječa pravila in izrecna navodila pilota; ne uvaja dodatnih zahtev. Ob neskladju imajo prednost izvirne zahteve in izrecna navodila uporabnika. Spremembe dokumentov ohranijo sledljivost do teh virov.

**Različica:** 1.0.0 | **Sprejeto:** 2026-09-21 | **Zadnja sprememba:** 2026-09-21 (datum pilota, Europe/Ljubljana)
