# Folio — ustava projekta P06

Ta ustava povzema pravila dela iz `PROJECT_RULES.md` in skupne predloge
(`task/specification-template.md`). Ne dodaja zahtev, odvisnosti ali
arhitekturnih preureditev; izvirne zahteve naloge so merilo.

## Temeljna načela

### I. Meje dovoljenih sprememb
Spreminjamo samo kodo vmesnika v `src/` (vključno s slogi in uporabo javnega
API-ja), lastne teste v `tests/agent/` in lastno dokumentacijo v `docs/agent/`.
Začetni podatki, `server/`, `shared/`, skupni testi `tests/baseline.spec.ts` in
`tests/api.spec.ts`, odvisnosti ter nastavitve zagona in preverjanja ostanejo
nespremenjeni. Sprememba skupne infrastrukture bi zahtevala vnaprej dogovorjeno
posodobitev izhodišča za vse postopke.

### II. Javni vmesnik je edini vir podatkov
Podatke beremo in shranjujemo izključno prek javnega vmesnika `/api/` in
izbiramo po `id`. Strežnika ne nadomeščamo z lokalno kopijo podatkov ali
`localStorage`. Vmesnik ne uporablja testnih kontrol `/__test/`, ne pošilja
zapisov, ki jih zahteve ne določajo, in ne uvaja novih zapisovalnih API-jev.

### III. Potrjeni videz Folio in slovenski vmesnik
Ohranjamo potrjeni videz Folio po `docs/dizajn.md` in slovenska poimenovanja.
Ohranimo `data-task-id` na vrsticah in karticah, dostopna imena obstoječih
pogledov in stolpcev, `aria-label="Pregled stanj opravil"` ter pri širini
390 pik preprečimo razširitev strani (notranje drsenje je dovoljeno). Nova
dejanja ob opravilu so zunaj njegove povezave.

### IV. Preverjanje z dejanskimi dokazi
Vsaka zahteva R01–R12 dobi lastno preverjanje; skupni testi preverjajo izhodišče
in infrastrukturo, konkretne zahteve P06 pa ločeno pripravljeni testi naloge.
Kot uspešne navajamo samo dejansko izvedene teste; neizvedene ali nedostopne
primere jasno zapišemo kot nepreverjene. Dokazila (ime testa, dnevnik zagona)
beležimo sproti.

### V. Minimalni poseg in obseg zahtev
Izvedemo samo zahteve naloge P06 (R01–R12) brez širjenja obsega. Stanje nove
funkcionalnosti je lokalno trenutnemu projektu, razen kadar zahteva določa
drugače. Dokumentov ne podvajamo; povezave na dokumente Spec Kit zadoščajo.

## Upravljanje

Ta ustava velja za vse delo v pilotu P06; skupna pravila in zahteve naloge so
merilo tudi, kadar specifikacija kaj izpusti. Spremembe ustave so mogoče le z
enako, vnaprej dogovorjeno posodobitvijo izhodišča za vse postopke. Vsak korak
mora upoštevati meje dovoljenih sprememb iz načela I.

**Različica**: 1.0.0 | **Sprejeto**: 2026-10-09 | **Zadnja sprememba**: 2026-10-09
