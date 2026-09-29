# Projektna ustava Folio — pilot P05, postopek C

## Projektna načela

1. **Izvirne zahteve so merilo.** Upoštevaj vseh R01–R12 in dogovor o vmesniku iz [navodil naloge](../../task/instructions.md), tudi če jih izvedbeni dokument izpusti. Ne dodajaj novih zahtev, odvisnosti ali obveznih arhitekturnih preureditev.
2. **Ohrani Folio.** Dopolnjuj obstoječi vmesnik s slovenskimi poimenovanji in obstoječimi gradniki po [potrjenem dizajnu](../../docs/dizajn.md). Ohrani dostopnost, povezave, podrobnosti, nalaganje in prilagodljivost, vključno s širino 390 pik brez razširitve celotne strani.
3. **Spoštuj meje sprememb.** Spreminjaj samo `src/`, `tests/agent/`, `docs/agent/`, `.specify/memory/constitution.md` in `.specify/feature.json`. Strežnik, začetni podatki, skupni tipi in testi, odvisnosti, nastavitve ter druge datoteke Spec Kit, uradne predloge in veščine so samo za branje.
4. **Javni API in stabilna identiteta.** Aplikacija uporablja samo javni `/api/` in izbira opravila po `id`. Ne uporablja testnih kontrol `/__test/`, testnih pripomočkov ali lokalnega nadomestka strežniških podatkov. Filter in straničenje ne spreminjata podatkov in ne pošiljata zapisov na API; njuno stanje se ne hrani trajno ali v URL-ju. Rešitev velja za celotno opisano domeno podatkov, ne le razvojne primere.
5. **Sledljivost in preverljiva dokazila.** Izpolni [skupno predlogo](../../task/specification-template.md); povezave na dokumente v `docs/agent/P05` lahko nadomestijo podvajanje. Vseh R01–R12 poveži s pogoji, kodo, testi in dejanskimi izidi; izbrane pogoje izrazi s pojasnjenimi predikati. Izvedi skupne in ustrezne dodatne teste. Neizvedenih ali nedostopnih testov ne označi kot uspešnih. Sproti beleži dokazila, omejitve in zgodovino sprememb specifikacije.

## Postopek in veljavnost

Ta ustava povzema [projektna pravila](../../PROJECT_RULES.md), skupno predlogo in izrecna navodila pilota; ne nadomešča izvirnih zahtev. En isti agent zaporedno izvaja le sproženi korak lokalnih uradnih veščin Spec Kit 1.0.8 s presetom Lean 1.0.0, brez drugih agentov, vej ali commitov. Raziskovanje je omejeno na lokalno kodo in priložena navodila. Bistvenih manjkajočih podatkov ne izmišljaj: navedi omejitev in se ustavi.

Upoštevaj skupni časovni proračun, preverjaj ga z `node task/time-budget.mjs` in zadnjo minuto nameni predaji. Končna predaja navede spremembe, izvedena preverjanja, rezultate in neizpolnjene zahteve.

**Različica:** 1.0.0 | **Sprejeto:** 2026-09-23 | **Zadnja sprememba:** 2026-09-23
