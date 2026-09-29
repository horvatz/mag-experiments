# Projektna ustava Folio — pilot P06, postopek C

Različica: 1.0.0. Sprejeto in zadnjič posodobljeno: 2026-09-22 (datum pilota, Europe/Ljubljana).

## Projektna načela

1. **Izvirne zahteve so merilo.** Upoštevamo [projektna pravila](../../PROJECT_RULES.md) in vseh R01–R12 ter dogovor o vmesniku iz [navodil P06](../../task/instructions.md), tudi če jih izvedbeni dokument izpusti. Obseg je nastavljiv izvoz CSV obstoječega Folia; ne dodajamo novih zahtev, odvisnosti ali obveznih arhitekturnih preureditev.

2. **Ohranimo Folio.** Dopolnimo obstoječi vmesnik skladno s [potrjenim dizajnom](../../docs/dizajn.md), slovenskimi poimenovanji, dostopnimi imeni in obstoječimi bralnimi funkcijami. Ohranimo zahtevane oznake elementov ter prilagodljivost pri širini 390 pik; dovoljeno je notranje drsenje preglednice in table.

3. **Podatki in identiteta ostanejo zanesljivi.** Podatke beremo iz javnega `/api/` in izbiramo po `id`. Izvoz in njegove kontrole ne spreminjajo opravil, izvornega polja ali podatkov na strežniku in ne pošiljajo zapisov na API. Ne nadomeščamo strežnika z lokalnimi podatki ali `localStorage`. Testne kontrole `/__test/` in testni pripomočki so namenjeni samo testom, nikoli aplikaciji. Pravila veljajo za celotno domeno podatkov iz navodil, ne le za razvojne primere.

4. **Spremembe ostanejo znotraj dovoljenih meja.** Dovoljeni so `src/`, lastni testi v `tests/agent/`, dokumenti v `docs/agent/` ter procesni datoteki `.specify/memory/constitution.md` in `.specify/feature.json`. Začetni podatki, `server/`, `shared/`, skupni testi, nastavitve, odvisnosti, uradne predloge, veščine in druge datoteke Spec Kit ostanejo nespremenjeni.

5. **Zahteve povežemo z dejanskimi dokazi.** Dokumentacija sledi [skupni predlogi](../../task/specification-template.md): problem, vhodi in izidi, pravila in izbrani predikati z razlago simbolov, sledljivost vseh R01–R12 do pogojev, kode in testov ter omejitve. Povezave med dokumenti lahko nadomestijo podvajanje. Preverjamo skupne regresije in zahteve P06 z ustreznimi dodatnimi testi. Uspeh navedemo samo po izvedenem preverjanju z določljivim dokazom; neizvedene in nedostopne teste označimo. Po popravkih posodobimo povezave in zgodovino sprememb specifikacije.

## Izvedba postopka in veljavnost

Isti agent z ohranjeno zgodovino izvaja samo korak lokalne veščine, ki ga sproži izvajalnik; brez drugih agentov, vej ali commitov. Spec Kit 1.0.8 uporablja uradni preset Lean 1.0.0; imenik funkcionalnosti je `docs/agent/P06`. Raziskovanje je omejeno na lokalno kodo in priložena navodila. Delo sproti shranjujemo, čas preverjamo z `node task/time-budget.mjs`, zadnjo minuto skupnega roka namenimo predaji.

Ta ustava povzema obstoječa pravila in jih ne razširja. Izvirna navodila in izrecna dopolnitev dovoljenih procesnih datotek imajo prednost. Nejasnosti rešujemo iz obstoječih zahtev; ob manjkajočem bistvenem podatku zapišemo omejitev in se ustavimo. Predaja vsebuje spremembe, dejansko izvedena preverjanja z rezultati ter neizpolnjene zahteve in omejitve.
