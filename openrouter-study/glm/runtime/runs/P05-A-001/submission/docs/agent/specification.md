# Specifikacija P05: Straničenje in filter stanja

## Problem in kontekst

Folio trenutno prikaže vsa opravila izbranega projekta v izvornem vrstnem redu. Uporabnik potrebuje nadzorovan pregled večjih naborov: izbiro velikosti strani, filter stanja in premikanje po straneh brez sprememb podatkov ali trajnega stanja.

## Vhodi, dejanja in izidi

- Podatki se pridobijo z `GET /api/projects/:id/tasks`; zaporedje iz API-ja se ne spreminja.
- Vnos `Velikost strani` ima vrednosti `all`, `2`, `5` in `10`.
- Vnos `Filter strani` ima vrednosti `all`, `todo`, `in_progress` in `done`.
- Dejanja so `Prva stran`, `Prejšnja stran`, `Naslednja stran`, `Zadnja stran`, preklop pogleda ter odpiranje in zapiranje podrobnosti.
- Tabela in tabla prikazujeta isti odsek filtriranega polja, status pa izpiše stran in obseg prikazanih opravil.
- Stanje je lokalno trenutnemu projektu in se ne prenaša v URL ali trajno shrambo.

## Zahteve in pravila

| Zahteva | Pravilo ali sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Privzeti sta vrednost `all/all`, stran 1; vidna so vsa opravila v izvornem zaporedju. | Lastni test primerja prikazane ID-je. |
| R02 | Velikosti 2, 5 in 10 ustvarijo zaporedne odseke; noben ID se ne izgubi ali podvoji. `all` pomeni eno stran pri nepraznem polju. | Lastni test preveri vse odseke. |
| R03 | Premiki spreminjajo stran samo znotraj 1..Y; na robu so gumbi onemogočeni in brez učinka. | Lastni test preveri vse premike. |
| R04 | Sprememba velikosti vedno vrne stran 1; za neprazno polje ima `all` eno stran. | Lastni test preveri preklop z višje strani. |
| R05 | Filter stanja se uporabi pred straničenjem; sprememba filtra vrne stran 1 in ne spremeni zaporedja. | Lastni test preveri vse filtre. |
| R06 | Tabela in tabla uporabita isti trenutni odsek; tabla združi samo ta odsek v stolpce. | Lastni test primerja obe pogledi in števce. |
| R07 | Preklop pogleda ter odpiranje in zapiranje podrobnosti ohranita velikost, filter in stran. | Lastni test preveri stanje po dejanjih. |
| R08 | Menjava projekta in osvežitev začneta z `all/all/stran 1`; stanje ni trajno ali v URL-ju. | Lastni test preveri projekta in osvežitev. |
| R09 | Za neprazno filtrirano polje velja `Stran X od Y. Prikazano A–B od N.` z indeksoma A/B od 1 in velikostjo N. | Lastni test preveri natančna besedila. |
| R10 | Za prazen projekt ali prazen filter velja `Stran 0 od 0. Prikazano 0–0 od 0.`; vsi štirje gumbi so onemogočeni. Po odstranitvi filtra je spet prva stran. | Lastni test preveri obe situaciji. |
| R11 | Pregled stanj šteje celoten nefiltriran projekt; števci stolpcev table štejejo trenutno stran; skupno število se ne spremeni. | Lastni test preveri števce. |
| R12 | Straničenje ne povzroči zapisovalnih zahtev ali sprememb podatkov in ohrani obstoječe povezave, podrobnosti, nalaganje, napake in prilagodljiv videz. | Lastni test preveri ohranjeno delovanje in število zapisov. |

## Izvedba in sledljivost

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | Privzeto prikaže vsa opravila. | `tests/agent/P05.spec.ts:8` | `src/App.tsx:23`, `src/App.tsx:27` | Uspešno; podrobnosti v `docs/agent/verification.md`. |
| R02 | Velikosti 2, 5 in 10 ustvarijo zaporedne odseke. | `tests/agent/P05.spec.ts:8` | `src/App.tsx:29`, `src/App.tsx:34` | Uspešno; podrobnosti v `docs/agent/verification.md`. |
| R03 | Premiki veljajo samo znotraj območja strani. | `tests/agent/P05.spec.ts:8` | `src/App.tsx:40`, `src/App.tsx:82` | Uspešno; podrobnosti v `docs/agent/verification.md`. |
| R04 | Sprememba velikosti vrne stran 1. | `tests/agent/P05.spec.ts:8` | `src/App.tsx:70` | Uspešno; podrobnosti v `docs/agent/verification.md`. |
| R05 | Filter se uporabi pred straničenjem in vrne stran 1. | `tests/agent/P05.spec.ts:44` | `src/App.tsx:27`, `src/App.tsx:77` | Uspešno; podrobnosti v `docs/agent/verification.md`. |
| R06 | Tabela in tabla uporabita isti trenutni odsek. | `tests/agent/P05.spec.ts:44` | `src/App.tsx:88`, `src/TaskBoard.tsx:13` | Uspešno; podrobnosti v `docs/agent/verification.md`. |
| R07 | Pogled in podrobnosti ohranijo stanje. | `tests/agent/P05.spec.ts:64` | `src/App.tsx:21`, `src/App.tsx:104` | Uspešno; podrobnosti v `docs/agent/verification.md`. |
| R08 | Projekt in osvežitev začneta s privzetim stanjem. | `tests/agent/P05.spec.ts:64` | `src/App.tsx:23`, `src/App.tsx:132` | Uspešno; podrobnosti v `docs/agent/verification.md`. |
| R09 | Status izpiše natančne indekse. | `tests/agent/P05.spec.ts:8`, `tests/agent/P05.spec.ts:44` | `src/App.tsx:31`, `src/App.tsx:87` | Uspešno; podrobnosti v `docs/agent/verification.md`. |
| R10 | Prazen projekt ali filter pomeni stran 0 in onemogočene gumbe. | `tests/agent/P05.spec.ts:88`, `tests/agent/P05.spec.ts:107` | `src/App.tsx:30`, `src/App.tsx:82` | Uspešno; podrobnosti v `docs/agent/verification.md`. |
| R11 | Pregled šteje celoten projekt, tabla trenutno stran. | `tests/agent/P05.spec.ts:44` | `src/App.tsx:35`, `src/TaskBoard.tsx:17` | Uspešno; podrobnosti v `docs/agent/verification.md`. |
| R12 | Straničenje je odvodeno, samo za branje in prilagodljivo. | `tests/agent/P05.spec.ts:97` | `src/App.tsx:21`, `src/styles.css:181` | Uspešno; podrobnosti v `docs/agent/verification.md`. |

## Odprta vprašanja in omejitve

- Testni pripomoček `/__test/` je namenjen samo testom; uporabniški vmesnik ga ne uporablja.
- Rezultati izvedenih preverjanj so zapisani v `docs/agent/verification.md`.

## Zgodovina sprememb specifikacije

- 2026-10-08: Ustvarjena specifikacija za zahteve P05 R01–R12 pred implementacijo.
- 2026-10-08: Dopolnjena sledljivost do kode in lastnih testov po implementaciji.
