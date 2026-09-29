# Folio — ustava projekta P06

**Različica:** 1.0.0 | **Sprejeto:** 2026-09-23 | **Zadnja sprememba:** 2026-09-23

## Projektna načela

1. **Izvirne zahteve so merilo.** Nastavljiv izvoz CSV mora izpolniti vseh dvanajst zahtev R01–R12 in dogovor o vmesniku iz [navodil naloge](../../task/instructions.md). Specifikacija, načrt ali razvojni primeri teh zahtev ne smejo zožiti. Ne dodajamo novih zahtev, odvisnosti ali obveznih arhitekturnih preureditev.
2. **Ohranimo Folio.** Uporabimo obstoječe gradnike, slogovne spremenljivke in slovenska poimenovanja ter ohranimo [potrjeni dizajn](../../docs/dizajn.md), dostopna imena, vidni fokus in obstoječe bralne funkcije. Na širini 390 pik se stran ne razširi; preglednica in tabla smeta drseti znotraj prikaza.
3. **Podatki iz javnega API-ja.** Aplikacija bere podatke prek `/api/` in izbira po `id`; delovati mora za celotno opisano domeno podatkov. Izvoz in njegove kontrole ne spreminjajo opravil ali izvornega polja in ne pošiljajo zapisov na API. Strežnika ne nadomeščamo z lokalno kopijo ali `localStorage`; `/__test/` in testni pripomočki so namenjeni samo testnemu programu.
4. **Omejen obseg sprememb.** Po [projektnih pravilih](../../PROJECT_RULES.md) so spremembe omejene na `src/`, lastne teste `tests/agent/` in dokumentacijo `docs/agent/`; izrecna dopolnitev postopka C dovoljuje še `.specify/memory/constitution.md` in `.specify/feature.json`. Strežnik, začetni podatki, skupni tipi in testi, odvisnosti, nastavitve, infrastruktura, uradne predloge, veščine in preostale datoteke Spec Kit ostanejo samo berljivi.
5. **Sledljivost in dejanska dokazila.** [Skupna predloga](../../task/specification-template.md) je obvezna; lahko povezuje dokumente Spec Kit brez podvajanja. Vseh R01–R12 povežemo s sprejemnimi pogoji, kodo in dejansko izvedenimi testi; izbrane pogoje izrazimo s pojasnjenimi predikati. Preverjamo skupne teste in smiselne dodatne scenarije. Rezultat navedemo z določljivim dokazom; neizvedenih ali nedostopnih končnih testov ne označimo za uspešne. Zapišemo omejitve, odstopanja in zgodovino sprememb specifikacije.

## Potek in veljavnost

Postopek C izvaja en persistenten agent brez drugih agentov, vej ali commitov. Izvajalnik sproža lokalne veščine Spec Kit 1.0.8 s presetom Lean 1.0.0 po korakih; vsak turn opravi samo navedeni korak. Funkcionalnost je v `docs/agent/P06`. Raziskovanje uporablja le lokalno kodo in priložena navodila. Delo in dokazila shranjujemo sproti, čas preverjamo z `node task/time-budget.mjs`, zadnjo minuto skupnega roka namenimo predaji.

Ta ustava povzema veljavne zahteve in jih ne razširja. Ob neskladju se ravnamo po izvirnih zahtevah in izrecnih navodilih uporabnika. Bistvenega manjkajočega podatka ne izmišljamo: omejitev jasno navedemo in se ustavimo.
