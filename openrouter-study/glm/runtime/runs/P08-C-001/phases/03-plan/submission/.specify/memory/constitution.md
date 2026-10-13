# Ustava projekta Folio

## Temeljna načela

### I. Izvirne zahteve

Izvirna naloga P08 in skupna predloga razvojne specifikacije določata merilo obsega. Vsaka zahteva se sledi od specifikacije prek izvedbe do preverjanja, brez novih zahtev ali skritega obsega.

### II. Omejene spremembe

Delo v aplikaciji je omejeno na `src/`, `tests/agent/` in `docs/agent/`, skupaj z dovoljenimi procesnimi datotekami Spec Kita. Strežnik, skupni tipi, skupni testi, odvisnosti, nastavitve, predloge in infrastruktura ostanejo nespremenjeni, razen če vnaprej dogovorjena posodobitev izhodišča velja za vse postopke.

### III. Zveznost dizajna Folio

Potrjeni dizajn Folio, slovenska poimenovanja, obstoječa imena pogledov in stolpcev, dostopnost ter prilagodljivost ostanejo izhodišče. Dopolnitve uporabljajo obstoječe gradnike in slogovne spremenljivke namesto zamenjave potrjenega videza.

### IV. Integriteta javnega vmesnika

Uporabniški vmesnik bere in shranjuje podatke samo prek javnega `/api/` vmesnika in izbira zapise po `id`. Ne uporablja testnih kontrol, lokalnih kopij podatkov ali trajne shrambe za stanje, ki je po nalogi lokalno trenutnemu projektu. Novi zapisovalni API-ji se ne uvajajo.

### V. Pošteno preverjanje

Preverjanja se izberejo za dejanske zahteve. Rezultate, nepreverjene scenarije in omejitve poročamo točno; neizvedenega preverjanja nikoli ne navajamo kot uspešnega.

## Upravljanje

Ta ustava ureja samo projektni proces in meje. Spremembe zahtevajo izrecno navodilo pilota, ohranjajo izvirne zahteve in ne dodajajo odvisnosti ali obveznih arhitekturnih preureditev.

**Različica**: 1.0 | **Sprejeto**: 2026-10-09 | **Zadnja sprememba**: 2026-10-09
