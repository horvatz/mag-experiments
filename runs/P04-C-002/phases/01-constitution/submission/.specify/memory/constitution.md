# Ustava projekta Folio — pilot P04, postopek C

## Projektna načela

1. **Izvirne zahteve so merilo.** Implementacija stabilnega razvrščanja z dvema ključema mora zajeti vseh R01–R12 iz [navodil naloge](../../task/instructions.md), tudi če jih nadaljnji dokument izpusti. Razvojni primeri ne nadomeščajo splošnih pravil. Ne dodajamo zahtev, odvisnosti ali obveznih arhitekturnih preureditev.

2. **Ohranitev Folio in identitete opravil.** Dopolnjujemo obstoječi vmesnik ter ohranimo slovenska poimenovanja, potrjeni [dizajn Folio](../../docs/dizajn.md), bralne funkcije, dostopna imena in prilagodljivost. Opravila izbiramo po `id`; ohranimo `data-task-id`, pravilne podrobnosti in vsa opravila natanko enkrat. Upoštevamo dogovorjene kontrole in omejitev širine strani pri 390 pikah.

3. **Javni API in nespremenjeni podatki.** Aplikacija podatke bere in shranjuje samo prek obstoječega `/api/`. Razvrščanje je stabilna projekcija izvornega polja: ne spreminja opravil, pripadnosti ali števil in ne sproža zapisov. Nove nastavitve ostanejo lokalne trenutnemu projektu ter sledijo zahtevanim ponastavitvam; niso v trajni shrambi ali URL-ju. Strežnika ne nadomeščamo z lokalnimi podatki. `/__test/` in testni pripomočki so namenjeni samo testom.

4. **Omejen obseg sprememb.** Dovoljene so spremembe v `src/`, lastni testi v `tests/agent/` in dokumenti v `docs/agent/`; izrecna dopolnitev postopka C dovoljuje še `.specify/memory/constitution.md` in `.specify/feature.json`. Strežnik, začetni podatki, skupni tipi in testi, nastavitve, odvisnosti, infrastruktura, uradne predloge ter veščine ostanejo samo berljivi. Dokumenti funkcionalnosti sodijo v `docs/agent/P04`. Ne uporabljamo drugih projektov, povezovalnikov, oddaljenih repozitorijev, vej ali commitov.

5. **Sledljivost in preverljiva dokazila.** [Skupna predloga](../../task/specification-template.md) je obvezna; sme povezovati dokumente Spec Kit brez podvajanja. Vseh R01–R12 povežemo s sprejemnimi pogoji, kodo in dejansko izvedenimi testi. Izbrane pogoje izrazimo s predikati ter pojasnimo simbole. Rešitev preverimo s skupnimi testi in smiselnimi preverjanji naloge; uspeh navedemo samo z dejanskim rezultatom in določljivim dokazom. Beležimo spremembe specifikacije, neizvedene teste, omejitve in neizpolnjene zahteve. Nedostopni končni testi niso opravljeni testi.

## Upravljanje postopka

Ustava povzema [projektna pravila](../../PROJECT_RULES.md), izvirna navodila in izrecne dopolnitve uporabnika; njihovega obsega ne širi in jih ne nadomešča. En isti agent z ohranjeno zgodovino izvaja samo sproženi korak lokalne uradne veščine Spec Kit 1.0.8 s presetom Lean 1.0.0, brez drugih agentov. Delo sproti shranjuje, proračun preverja z `node task/time-budget.mjs` ter upošteva skupni rok in čas za predajo. Bistvenih manjkajočih podatkov ne izmišljuje: omejitev jasno zapiše in se ustavi.

**Različica:** 1.0.0 | **Sprejeto:** 2026-09-25 | **Zadnja sprememba:** 2026-09-25
