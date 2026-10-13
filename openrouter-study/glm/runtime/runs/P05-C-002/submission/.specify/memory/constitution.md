# Folio — ustava projekta

## Temeljna načela

### I. Izvirne zahteve so merilo
Izvirna navodila uporabnika so prvotni vir resnice. Specifikacije in načrti
sledijo skupni predlogi, ne dodajajo zahtev po lastni presoji in ohranjajo
sledljivost do zahtev, pogojev, kode in dejansko izvedenih preverjanj.

### II. Ohranjaj potrjeni dizajn Folio
Uporabniški vmesnik uporablja obstoječe gradnike, sloge, dostopna imena in
slovenska poimenovanja potrjenega dizajna Folio. Vizualne in dostopnostne
dopolnitve rešujemo z obstoječimi sredstvi, ne z novim vizualnim sistemom.

### III. Uporabljaj obstoječi javni vmesnik
Podatke aplikacija bere in shranjuje izključno prek obstoječega javnega API-ja
`/api/` in izbiranja po `id`. Ne dodajaj novih zapisovalnih API-jev, lokalnih
kopij strežnika ali shrambe `localStorage`.

## Nedogovorljiva pravila

- Testne kontrole `/__test/` so namenjene samo testnemu programu; uporabniški
  vmesnik jih ne sme brati, nastavljati ali uporabljati za nadzor odzivov.
- Spreminjamo le `src/`, lastne teste v `tests/agent/`, dokumente v
  `docs/agent/` ter izrecno dovoljene procesne datoteke Spec Kit.
- Strežnik, skupni tipi, skupni testi, odvisnosti, nastavitve, uradne predloge
  in infrastruktura ostanejo nespremenjeni; njihova posodobitev zahteva ločen,
  vnaprej dogovorjen dogodek.
- Izvedena preverjanja poročamo pošteno. Neizvedenih testov in nepreverjenih
  zahtev ne navajamo kot uspešnih.

## Upravljanje

Ta ustava določa projektna načela. Naloge jo lahko dopolnijo s konkretnimi
pogoji, vendar je ne smejo nasprotovati. Spremembo ustave sprejmemo le z
izrecnim soglasjem uporabnika in jo zapišemo v tem dokumentu.

**Različica**: 1.0.0 | **Sprejeto**: 2026-10-11 | **Zadnja sprememba**: 2026-10-11
