# Ustava projekta Folio

**Različica**: 1.0.0 | **Sprejeto**: 2026-10-09 | **Zadnja sprememba**: 2026-10-09

## Identiteta projekta

Folio je potrjen vizualni in interakcijski izhod za repozitorij `mag-app`. Delo v aplikaciji ohranja obstoječo Folio oblikovno govorico, javne bralne funkcije, dostopnostne dogovore in slovenska poimenovanja vmesnika.

## Vodilna načela

1. **Ohranjaj dogovorjen obseg.** Spremembe aplikacije so omejene na `src/`, lastni testi na `tests/agent/`, lastna dokumentacija pa na `docs/agent/`. Postopek C lahko dodatno posodobi `.specify/memory/constitution.md` in `.specify/feature.json`. Strežnik, skupni tipi, skupni testi, odvisnosti, nastavitve, infrastruktura, uradne predloge in veščine ostanejo nespremenjeni.
2. **Upoštevaj javni API kot podatkovno mejo.** Uporabniški vmesnik bere in shranjuje podatke prek `/api/`. Ne bere, uvaža ali kliče testnih kontrol `/__test/` in ne nadomešča stanja strežnika s krajevno kopijo ali `localStorage`.
3. **Ohranjaj Folio in obstoječe delovanje.** Novo delo uporablja potrjene gradnike in slogovne spremenljivke Folio, ohranja identifikatorje opravil, dostopna imena in obstoječe bralne funkcije ter ne razširi strani na dogovorjeni ozki širini.
4. **Zahteve in dokazila naj bodo izrecna.** Specifikacija sledi skupni predlogi, zajame vsako izvirno zahtevo, loči splošno pravilo od posameznega primera in poveže zahteve z izvedbo ter dejanskimi testi. Uspeh se ne navaja brez izvedenega preverjanja.
5. **Ne širi obsega naloge ali infrastrukture.** Ne dodajaj novih zahtev, odvisnosti, zapisovalnih API-jev, obvezne shrambe ali arhitekturnih preureditev, razen če izrecno projektno navodilo spremeni izhodišče.

## Neogovorljiva pravila

- Izvirne zahteve naloge so merilo, tudi če jih izpeljana specifikacija izpusti.
- Izvoz in njegove kontrole ne spreminjajo opravil, izvornih polj ali obstoječih bralnih funkcij.
- Poročila navajajo opravljeno delo, izvedena preverjanja, dejanske izide in znane omejitve, ne pa neizvedenih testov kot uspešnih.

## Upravljanje

Ta ustava vodi agentsko delo v tem pilotu. Spremembe zahtevajo izrecno procesno navodilo in opis vpliva na obstoječe izhodišče; posledica izvedbe funkcije ni sama po sebi sprememba ustave.
