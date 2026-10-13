# P04 — Stabilno razvrščanje z dvema ključema

**Status**: Specifikacija | **Različica**: 1.0

**Viri**: `task/instructions.md`, `task/specification-template.md`, `PROJECT_RULES.md`, `docs/dizajn.md`, `.specify/memory/constitution.md`.

## Problem in kontekst

Folio omogoča pregled opravil projekta v preglednici, tabli in podrobnostih. Uporabnik želi nadzorovati vrstni red z dvema ključema in neodvisnima smere ter želi biti prepričan, da razvrščanje ostane stabilna projekcija prejetih podatkov.

P04 doda štiri kontrole razvrščanja: primarni ključ in smer ter sekundarni ključ in smer, plus gumb za povrnitev izvornega vrstnega reda. Ohraniti je treba potrjeni videz Folio, obstoječa dostopna imena, `data-task-id`, bralne funkcije in javni API `/api/`.

## Vhodi, dejanja in izidi

- **Podatkovna polja opravila**: `id`, `projectId`, `title`, `description`, `status`, `assignee`, `dueDate`. Polja so enaka skupnim tipom v `shared/types.ts`.
- **Primarni ključ**: `original` ali `title` ali `assignee` ali `status` ali `dueDate`.
- **Primarna smer**: `asc` ali `desc`.
- **Sekundarni ključ**: `none` ali `title` ali `assignee` ali `status` ali `dueDate`.
- **Sekundarna smer**: `asc` ali `desc`.
- **Dejanja**: izbira štirih kontrol, preklop med preglednico in tablo, odpiranje in zapiranje podrobnosti, menjava projekta, osvežitev ter klik na gumb `Izvorni vrstni red`.
- **Uspeh**: vsi prejeti ID-ji so prikazani natanko enkrat, v skladu z izbranim primerjalnim pravilom; obstoječe funkcije in videz Folio ostanejo nespremenjeni.
- **Napaka pri branju**: velja obstoječe obnašanje prikaza napake. Razvrščanje samo ne kliče zapisovalnega API-ja in ne spreminja podatkov, zato nima posebne napake.

## Pravila razvrščanja in sprememb stanja

Naj bo `tasks` polje opravil v vrstnem redu, ki ga je vrnil API. Za vsak `task` naj `index(task)` označuje njegov indeks v tem izvornem polju.

Nastavitev razvrščanja je stanje:

```text
SortingState = {
  primary: 'original' | 'title' | 'assignee' | 'status' | 'dueDate',
  primaryDirection: 'asc' | 'desc',
  secondary: 'none' | 'title' | 'assignee' | 'status' | 'dueDate',
  secondaryDirection: 'asc' | 'desc'
}
```

Privzeto stanje po zagonu, osvežitvi, menjavi projekta ali kliku na `Izvorni vrstni red` je:

```text
{ primary: 'original', primaryDirection: 'asc',
  secondary: 'none', secondaryDirection: 'asc' }
```

Nizovna primerjava za `title` in `assignee` uporablja:

```text
normalize(value) =
  value.normalize('NFD')
       .replace(/[\u0300-\u036F]/g, '')
       .toLowerCase()
```

Nato primerja niza leksikografsko po zaporednih enotah UTF-16 z `<` in `>`. Ne uporablja `localeCompare`, števniškega niza ali jezikovno prilagojenega razvrščanja.

Status ima stalen vrstni red `todo < in_progress < done`. Veljaven `dueDate` v obliki `YYYY-MM-DD` se primerja kronološko po komponentah koledarskega datuma. Sekundarni ključ `none` vrne izid primerjave `0`.

Za dve opravili `left` in `right` izračunaj:

```text
primaryResult = compare(primary, left, right)
displayPrimaryResult =
  primary == 'original'
    ? 0
    : primaryResult * (primaryDirection == 'desc' ? -1 : 1)
```

Če je `displayPrimaryResult != 0`, odloča samo ta izid. Sicer:

```text
secondaryResult = compare(secondary, left, right)
displaySecondaryResult =
  secondaryResult * (secondaryDirection == 'desc' ? -1 : 1)
```

Če je tudi ta izid `0`, odloča `index(left) < index(right)` v naraščajočem vrstnem redu. Smer nikoli ne obrača celotnega končnega polja in ne obrača vrstnega reda izenačenih elementov. Če sta primarni in sekundarni ključ enaka, oba računata isti izid `0`, zato ne dodata dodatnega obrata.

`original` kot primarni ključ vedno povrne izvorni vrstni red, ne glede na smeri in sekundarni ključ.

Stanje razvrščanja je trenutno stanje trenutnega projekta:

- Preklop med preglednico in tablo ohrani vse štiri nastavitve.
- Odpiranje in zapiranje podrobnosti ohrani vse štiri nastavitve.
- Menjava projekta ponastavi vse štiri nastavitve.
- Osvežitev začne s privzetimi vrednostmi.
- Nastavitve se ne shranjujejo v `localStorage`, druge trajne shrambe ali URL.

## Zahteve in sprejemni pogoji

| Zahteva | Pravilo ali sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Začetno stanje je `{original, asc, none, asc}`, prikaz pa sledi vrstnemu redu prejetega polja. | Naloži projekt, preveri izbrane vrednosti in vrstni red prvega prikaza. |
| R02 | `title` in `assignee` uporabljata `normalize`, nato leksikografsko primerjavo po UTF-16 brez jezikovno ali števniško prilagojenega razvrščanja. | Primerjalni test s kombiniranimi diakritiki, velikimi in malimi črkami ter Unicode znaki. |
| R03 | `status` sledi `todo`, `in_progress`, `done`; `dueDate` je kronološki za veljavne `YYYY-MM-DD`. | Preveri znane statuse in vsaj dva datuma v preklopnem vrstnem redu. |
| R04 | Smer spremeni samo predznak izida primerjave izbranega ključa; izenačeni elementi ostanejo v izvornem vrstnem redu. | Preklopi smer na podatkih z enakimi vrednostmi in primerjaj začetni ter končni indeks. |
| R05 | Sekundarni ključ se uporabi samo, ko je primarni izid `0`, in ima svojo neodvisno smer. | Nastavi primarni ključ z izenačenimi skupinami ter preklopi samo sekundarno smer. |
| R06 | Ob enakosti obeh ključev ostane izvorni vrstni red. Enak primarni in sekundarni ključ ne povzroči dodatnega obrata; `original` kot primarni ključ vedno povrne izvorno polje. | Preveri enake primarne in sekundarne vrednosti, vključno s `title/title` in kontrolami nad `original`. |
| R07 | Tabla vedno ohrani stolpce `todo`, `in_progress`, `done`; znotraj stolpca je relativni vrstni red enak razvrščenemu polju v preglednici. | Pridobi ID-je po stolpcih in jih primerjaj s projekcijo razvrščenega polja. |
| R08 | Preklop pogleda ter odpiranje in zapiranje podrobnosti ohranita vse štiri nastavitve. | Spremeni vse štiri kontrole, izvedi vsa dejanja in preveri izbrane vrednosti. |
| R09 | Menjava projekta ter osvežitev ponastavita vse štiri nastavitve; stanje ni v trajni shrambi ali URL-ju. | Spremeni stanje, zamenjaj projekt ter osveži in preveri privzete vrednosti ter URL/shrambo. |
| R10 | Gumb `Izvorni vrstni red` ponastavi vse štiri kontrole. Prazen projekt in projekt z enim opravilom delujeta za vse ključe in smeri. | Klikni gumb ter preveri privzete vrednosti; izvedi matrični preizkus praznega in enoopravilnega projekta. |
| R11 | Razvrščanje je projekcija: ne spreminja polj, pripadnosti, števil, izvornega polja in ne pošilja zapisov na API. | Preveri nespremenjene podatke po vseh razvrstitvah in nadziraj omrežne zahteve. |
| R12 | Vsak ID je prikazan natanko enkrat v vsakem pogledu, podrobnost se odpre po ID-ju tudi pri enakih naslovih, obstoječe bralne funkcije in Folio ostanejo ohranjeni. | Preveri enake naslove, `data-task-id`, klik obeh opravil in obstoječe dostopne atribute. |

## Izvedba in sledljivost

| Zahteva | Načrtovana koda | Test ali scenarij | Izid in dokaz |
| --- | --- | --- | --- |
| R01 | Razvrščevalna projekcija v `src/App.tsx` in njena predstavitev v obstoječem pogledu. | `tests/agent/p04.spec.ts`: privzete kontrole in izvorni vrstni red. | Ni izveden; ta datoteka je specifikacijska sledljivost pred implementacijo. |
| R02 | Normalizacija in primerjalna funkcija v `src/App.tsx`. | `tests/agent/p04.spec.ts`: normalizirana niza in UTF-16. | Ni izveden. |
| R03 | Primerjalni veji za `status` in `dueDate` v `src/App.tsx`. | `tests/agent/p04.spec.ts`: statusni in datumski primer. | Ni izveden. |
| R04 | Predznak smeri v primerjalni funkciji v `src/App.tsx`. | `tests/agent/p04.spec.ts`: asc/desc z izenačenimi elementi. | Ni izveden. |
| R05 | Sekundarna primerjava v `src/App.tsx`. | `tests/agent/p04.spec.ts`: neodvisna sekundarna smer. | Ni izveden. |
| R06 | Končna izenačitev po izvornem indeksu in kratki stik za `original` v `src/App.tsx`. | `tests/agent/p04.spec.ts`: enak ključ in `original`. | Ni izveden. |
| R07 | Filtriranje obstoječih ID-jev v treh stalnih stolpcih v `src/TaskBoard.tsx`. | `tests/agent/p04.spec.ts`: stolpci in relativni vrstni red. | Ni izveden. |
| R08 | Stanje razvrščanja v `src/App.tsx` ostane zunaj pogleda in podrobnosti. | `tests/agent/p04.spec.ts`: preklop pogleda in podrobnosti. | Ni izveden. |
| R09 | Ponastavitev stanja ob menjavi projekta v `src/App.tsx`. | `tests/agent/p04.spec.ts`: menjava projekta in osvežitev. | Ni izveden. |
| R10 | Gumb in popolna ponastavitev v `src/App.tsx` ter prazna ali enoopravilna projekcija. | `tests/agent/p04.spec.ts`: reset in robni projekta. | Ni izveden. |
| R11 | Čista projekcija brez mutacij in brez API zapisov v `src/App.tsx` in `src/TaskBoard.tsx`. | `tests/agent/p04.spec.ts`: nespremenjeni podatki in omrežni nadzor. | Ni izveden. |
| R12 | Obstoj `data-task-id`, ID kot ključ in navigacija po ID-ju v `src/App.tsx`, `src/TaskBoard.tsx` in `src/TaskDetails.tsx`. | `tests/agent/p04.spec.ts`: podvojeni naslovi in odpiranje pravih podrobnosti. | Ni izveden. |

## Odprta vprašanja in omejitve

- Ni odprtih vprašanj, ki bi ovirala pripravo specifikacije.
- Testni podatki vključujejo tudi prazen projekt, eno opravilo, več kot deset opravil, enake naslove, različno zaporedje, Unicode, veljavne koledarske datume in drugačne enkratne ID-je.
- Manjkajoči ali neveljavni datumi niso zahtevani, ker navodilo določa veljavne `YYYY-MM-DD`.
- Razvrščanje ne uvaja novih API-jev, zapisovalnih klicev, trajnih meritev, odvisnosti ali sprememb infrastrukture.
- Končni testi niso na voljo v tej fazi; zato se izidi zgoraj izrecno ne označujejo kot uspešni.
