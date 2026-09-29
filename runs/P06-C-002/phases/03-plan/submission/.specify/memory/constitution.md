# Folio — projektna načela pilota P06, postopek C

## Načela

1. **Izvirne zahteve so merilo.** Vseh R01–R12 iz `task/instructions.md` ostaja obveznih tudi ob izpustu v izpeljanih dokumentih. Specifikacija sledi `task/specification-template.md`; vsebino lahko poveže z dokumenti Spec Kit brez podvajanja. Ne dodajamo zahtev, odvisnosti ali obveznih arhitekturnih preureditev.
2. **Ohranitev Folio.** Dopolnjujemo obstoječi vmesnik, slovenska poimenovanja, dostopnost in potrjeni dizajn iz `docs/dizajn.md`. Ohranimo obstoječa dostopna imena in oznake, `data-task-id` ter odzivnost brez razširitve cele strani pri 390 pikah.
3. **Javni podatkovni vmesnik in nespremenljivost podatkov.** Podatke beremo prek `/api/` in izbiramo po `id`. Izvoz in njegove kontrole ne spreminjajo opravil, izvornega polja ali obstoječih bralnih funkcij in ne pošiljajo zapisov na API. Uporabniški vmesnik ne uporablja `/__test/`, testnih pripomočkov, lokalne kopije strežnika ali `localStorage` kot nadomestne shrambe.
4. **Omejen obseg sprememb.** Dovoljeni so `src/`, `tests/agent/`, `docs/agent/` ter procesni datoteki `.specify/memory/constitution.md` in `.specify/feature.json`. Strežnik, začetni podatki, skupni tipi in testi, nastavitve, odvisnosti, uradne predloge, veščine in preostale datoteke Spec Kit ostanejo samo berljivi.
5. **Sledljivost in poštena dokazila.** Za vsako R01–R12 povežemo sprejemni pogoj, kodo, test ali scenarij ter dejanski izid. Izbrane pogoje izrazimo s predikati z razloženimi simboli; splošna pravila ločimo od posameznih primerov. Izvedemo skupne in ustrezne lastne preizkuse; neizvedene ali nedostopne teste jasno označimo. Sproti ohranjamo dokaze, omejitve in zgodovino sprememb specifikacije.

## Potek in veljavnost

En persistenten agent izvaja samo korak, ki ga sproži izvajalnik, po lokalni veščini uradnega preseta Lean 1.0.0 za Spec Kit 1.0.8. Dokumenti funkcionalnosti sodijo v `docs/agent/P06`. Ne zaganjamo drugih agentov, ne uporabljamo drugih projektov, povezovalnikov, javnega interneta ali oddaljenih repozitorijev ter ne ustvarjamo vej ali commitov. Delo sproti shranjujemo, skupni čas preverjamo z `node task/time-budget.mjs` in zadnjo minuto namenimo predaji.

Ta načela povzemajo `PROJECT_RULES.md`, skupno predlogo, izvirna navodila P06 in izrecne procesne dopolnitve uporabnika; ne nadomeščajo izvirnih zahtev in ne širijo naloge. Bistvenega manjkajočega podatka ne izmišljamo: zapišemo omejitev in se ustavimo. Ob predaji navedemo spremembe, dejansko izvedena preverjanja, rezultate ter neizpolnjene zahteve.

**Različica:** 1.0.0 | **Sprejeto:** 2026-09-25 | **Zadnja sprememba:** 2026-09-25
