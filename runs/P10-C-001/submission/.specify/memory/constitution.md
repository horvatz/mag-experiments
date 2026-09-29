# Folio — projektna ustava pilota P10, postopek C

**Različica:** 1.0.0 · **Sprejeto:** 2026-09-22 · **Zadnja sprememba:** 2026-09-22

## Projektna načela

1. **Izvirne zahteve so merilo.** Upoštevaj `PROJECT_RULES.md`, vseh dvanajst zahtev R01–R12 in dogovor o vmesniku iz `task/instructions.md`. Specifikacija, načrt in razvojni primeri ne smejo zožiti njihove veljavnosti ali dodajati novih zahtev. Rešitev mora delovati za celotno opisano domeno podatkov, ne le za začetne primere.
2. **Ohrani Folio.** Dopolnjuj obstoječi vmesnik, slovenska poimenovanja, dostopnost in potrjeni prilagodljivi dizajn iz `docs/dizajn.md`. Ohrani zahtevana dostopna imena, oznake in izbiro opravil po `id`; enaki naslovi niso identiteta. Pri širini 390 pik je dovoljeno notranje drsenje preglednice in table, ne širjenje cele strani.
3. **Javni API in lokalni vrstni red.** Podatke beri prek obstoječega `/api/`. P10 spreminja samo lokalne permutacije iste množice ID-jev, brez sprememb polj ali statusov, zapisov na API ali trajnega shranjevanja. Uporabniški vmesnik ne uporablja `/__test/`, testnih pripomočkov ali nadomestne zbirke v `localStorage`. Življenjsko dobo vrstnega reda in zgodovine določajo izvirne zahteve.
4. **Omejen obseg sprememb.** Spreminjaj samo `src/`, `tests/agent/`, `docs/agent/` ter procesni datoteki `.specify/memory/constitution.md` in `.specify/feature.json`. Strežnik, začetni podatki, skupni tipi in testi, odvisnosti, nastavitve, uradne predloge in veščine ostanejo nespremenjeni. Ne uvajaj novih odvisnosti ali obveznih arhitekturnih preureditev.
5. **Preverljiva sledljivost.** V dokumentih pod `docs/agent/P10` pokrij vse razdelke `task/specification-template.md`; povezave med dokumenti so dovoljene. Vseh R01–R12 poveži s sprejemnimi pogoji, kodo, testi in dejanskimi rezultati. Izbrane pogoje izrazi s predikati ter pojasni simbole. Preveri skupne teste in posebne zahteve P10; zabeleži izvor dokazil, neizvedena preverjanja, omejitve in zgodovino sprememb specifikacije. Nedostopnih končnih testov ne označi kot opravljenih.

## Postopek in veljavnost

Isti agent z ohranjeno zgodovino izvaja le lokalni korak Spec Kit, ki ga sproži izvajalnik; ne zaganja drugih agentov, ne ustvarja vej ali commitov ter ne uporablja zunanjih projektov ali gradiv. Delo shranjuje sproti in spremlja skupni čas z `node task/time-budget.mjs`; zadnjo minuto nameni predaji. Bistvenega manjkajočega podatka ne izmisli, temveč navede omejitev in se ustavi.

Ta ustava povzema obstoječa pravila in izrecno procesno dopolnitev uporabnika. Ne nadomešča izvirnih zahtev. Ob spremembi ustave zabeleži datum in razlog; odvisne dokumente uskladi samo znotraj dovoljenih poti. Ne spreminjaj infrastrukture ali uradnih predlog zaradi predloge ustave.
