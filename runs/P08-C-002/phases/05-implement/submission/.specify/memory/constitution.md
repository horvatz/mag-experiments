# Folio — pilot P08, postopek C

**Različica**: 1.0.0 | **Sprejeto**: 2026-09-25 | **Zadnja sprememba**: 2026-09-25

## Projektna načela

1. **Izvirne zahteve so merilo.** Upoštevaj vseh R01–R12 in dogovor o vmesniku iz [navodil naloge](../../task/instructions.md). Izpustitev v specifikaciji ne zmanjša obsega zahtev. Ne dodajaj novih zahtev, odvisnosti ali obveznih arhitekturnih preureditev.
2. **Ohrani Folio.** Dopolni obstoječi vmesnik v skladu s [potrjenim dizajnom](../../docs/dizajn.md); ohrani slovenska poimenovanja, dostopna imena, identifikatorje opravil, bralne podrobnosti in prilagodljivost, vključno s širino 390 pik.
3. **Uporabljaj javni API in identiteto podatkov.** Podatke beri prek `/api/`, opravila izbiraj po `id` in obravnavaj celotno dovoljeno podatkovno domeno, tudi prazne projekte. Pregled rokov ne pošilja zapisov. Uporabniški vmesnik ne uporablja `/__test/`, testnih pripomočkov ali lokalne kopije namesto strežnika.
4. **Spoštuj pravila datumov in stanja.** Koledarske datume obravnavaj neodvisno od časovnega pasu; začetni referenčni datum je izrecno `2026-09-21`. Pravila skupin, filtrov in ponastavitev izhajajo iz R01–R12. Novo stanje je lokalno trenutnemu projektu; filtra ne shranjuj trajno ali v URL.
5. **Zagotovi sledljivost in poštena dokazila.** Specifikacija po [skupni predlogi](../../task/specification-template.md) zajame vseh dvanajst zahtev, izbrane predikate, pogoje, kodo in dejansko izvedene teste. Dovoljene so povezave na dokumente Spec Kit brez podvajanja. Ohrani zgodovino sprememb specifikacije in po popravkih posodobi povezave.
6. **Preveri v dovoljenem obsegu.** Izvedbo preveri s skupnimi testi in smiselnimi dodatnimi preverjanji zahtev P08. Navedi spremembe, rezultate, določljiv izvor dokazil, neizvedene teste, neizpolnjene zahteve in omejitve. Nedostopnih končnih testov ne označi kot opravljenih.

## Nespremenljive meje dela

Veljajo [projektna pravila](../../PROJECT_RULES.md) in izrecna dopolnitev postopka C: spreminjati je dovoljeno samo `src/`, `tests/agent/`, `docs/agent/`, `.specify/memory/constitution.md` ter `.specify/feature.json`. Začetni podatki, `server/`, `shared/`, skupni testi, odvisnosti, nastavitve, uradne predloge, veščine in preostale datoteke Spec Kit ostanejo nespremenjeni.

En persistentni agent izvaja samo sproženi korak lokalnih uradnih veščin Spec Kit 1.0.8 s presetom Lean 1.0.0; ne zaganja drugih agentov. Dokumenti funkcionalnosti sodijo v `docs/agent/P08`. Ne uporablja drugih projektov, javnega interneta, povezovalnikov ali oddaljenih repozitorijev ter ne ustvarja vej ali commitov. Delo shranjuje sproti, čas preverja z `node task/time-budget.mjs` in zadnjo minuto skupnega roka nameni predaji.

## Upravljanje

Ta ustava povzema obstoječe zahteve in ne širi njihovega obsega. Spremembe morajo ostati skladne z izvirnimi navodili in mejami dovoljenih posegov. Bistveno manjkajočo informacijo jasno zapiši kot omejitev in se ustavi; uporabnikovih odgovorov ne izmišljaj.
