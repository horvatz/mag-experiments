# Projektna ustava Folio — pilot P07, postopek C

**Različica:** 1.0.0 · **Sprejeto:** 2026-09-25 · **Zadnja sprememba:** 2026-09-25

## Projektna načela

1. **Izvirne zahteve so merilo.** Upoštevamo vseh R01–R12 iz `task/instructions.md`, `PROJECT_RULES.md` in izrecne dopolnitve uporabnika za postopek C. Izpust v specifikaciji ne odpravi zahteve. Ne dodajamo funkcionalnosti, odvisnosti ali obveznih arhitekturnih preureditev.
2. **Ohranimo Folio.** Dopolnjujemo obstoječi vmesnik skladno z `docs/dizajn.md`: slovenska poimenovanja, dostopnost, dogovorjena imena in atributi, nalaganje, navigacija ter ozki prikaz ostanejo skladni z zahtevami. Opravila izbiramo po `id`, ne po naslovu.
3. **Ločimo podatke opravil od priljubljenih.** Podatke opravil beremo prek javnega `/api/`; ne kopiramo jih v lokalno nadomestno shrambo in ne uporabljamo `/__test/` v aplikaciji. Izrecna izjema P07 je lokalna množica ID-jev priljubljenih v `localStorage` pod `folio:favorites:v1`, skladno z R02–R04 in R11. Spremembe priljubljenih ne zapisujejo na API in ne spreminjajo polj opravil.
4. **Spoštujemo meje sprememb.** Dovoljeni so `src/`, `tests/agent/`, `docs/agent/` ter procesni datoteki `.specify/memory/constitution.md` in `.specify/feature.json`. Strežnik, začetni podatki, skupni tipi in testi, nastavitve, odvisnosti, uradne predloge, veščine in preostale datoteke Spec Kit so samo berljivi. Funkcionalnost dokumentiramo v `docs/agent/P07`.
5. **Specifikacija in dokazila so sledljivi.** Pokrijemo vse razdelke `task/specification-template.md`; povezave na dokumente Spec Kit lahko nadomestijo podvajanje. Vsako R01–R12 povežemo s sprejemnim pogojem, kodo in dejansko izvedenim preverjanjem. Izbrane pogoje izrazimo s pojasnjenimi predikati. Pravila veljajo za celotno opisano podatkovno domeno, ne le razvojne primere.
6. **Poročamo o dejanskem stanju.** Rešitev preverimo s skupnimi testi in smiselnimi lastnimi preverjanji. Sproti beležimo rezultate, določljiva dokazila, spremembe specifikacije ter omejitve. Neizvedenih ali nedostopnih končnih testov ne predstavljamo kot uspešnih. Bistvenih manjkajočih odgovorov ne izmišljamo.

## Potek in upravljanje

Isti agent z ohranjeno zgodovino izvaja samo korak lokalne uradne veščine, ki ga sproži izvajalnik; drugih agentov ne zaganja. Ne uporablja drugih projektov, javnega interneta, povezovalnikov, oddaljenih repozitorijev, vej ali commitov. Upošteva skupni časovni proračun, delo sproti shranjuje in zadnjo minuto nameni predaji.

Ta ustava povzema obstoječa pravila in jih ne razširja. Ob neskladju velja izvirna zahteva oziroma izrecna uporabnikova dopolnitev; popravimo ustavo in prizadeto dovoljeno dokumentacijo, brez spreminjanja zaščitenih predlog ali infrastrukture.
