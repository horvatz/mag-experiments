# P05 — Straničenje in filter stanja

## Problem in kontekst

Folio omogoča pregled opravil izbranega projekta v preglednici in tabli ter
odpiranje podrobnosti posameznega opravila. P05 doda enoten nadzor velikosti
strani in filtra stanja, ki velja za oba prikaza. Dizajn ostaja Folio; uporabimo
obstoječe gradnike, sloge, dostopna imena in slovenska poimenovanja.

Projektna načela so v `.specify/memory/constitution.md`. Izvirne zahteve so v
`task/instructions.md`; ta specifikacija jih razčlenjuje in ne dodaja novih
funkcionalnih zahtev.

## Vhodi, dejanja in izidi

- Podatki so obstoječi projekti in opravila javnega API-ja `/api/`; polja so
  enaka izhodiščnim (`id`, `title`, `description`, `status`, `assignee`,
  `dueDate`). Aplikacija ne dodaja novih zapisovalnih API-jev.
- Nova kontrola `Velikost strani` ponuja `all`, `2`, `5` in `10`.
- Nova kontrola `Filter strani` ponuja `all`, `todo`, `in_progress` in `done`.
- Gumbi `Prva stran`, `Prejšnja stran`, `Naslednja stran` in `Zadnja stran`
  spreminjajo samo trenutno stran. Na robu so onemogočeni in ne spremenijo stanja.
- Stanje straničenja je lokalno trenutnemu projektu. Ne hranimo ga v trajni
  shrambi ali URL-ju.
- Testne kontrole `/__test/` so izključno testni mehanizem; uporabniški vmesnik
  jih ne sme brati, nastavljati ali uporabljati za nadzor odzivov.

## Pravila stanja

Za izbran projekt naj bo `A` opravila v izvirnem vrstnem redu, prebranem iz
API-ja. Naj bo `f` trenutni filter, `s` trenutna velikost strani, `n` trenutna
številka strani in `F` filtrirano polje:

- `F = A` za `f = all`; sicer `F` vsebuje samo opravila z `status = f`, v
  izvirnem vrstnem redu.
- `N = |F|`.
- Za `s = all` je `Y = 1`, če je `N > 0`, sicer `Y = 0`.
- Za numerični `s` je `Y = ⌈N/s⌉`, če je `N > 0`, sicer `Y = 0`.
- `n` je veljavna stran `1 ≤ n ≤ Y`; za prazen rezultat je `n = 0`.
- Trenutna stran `V` je za `s = all` enaka `F`; sicer je zaporedni odsek
  `F[(n−1)s .. ns−1]`, skrajisan na dolžino `N`. Noben ID se ne izgubi niti ne
  podvoji.

Spremembe stanja:

- Nastavitev `s` ali `f` vedno nastavi `n = 1` novega nastavitve; za prazen
  rezultat je `n = 0`.
- `Prva stran` nastavi `n = 1`; `Prejšnja stran` nastavi `n − 1`;
  `Naslednja stran` nastavi `n + 1`; `Zadnja stran` nastavi `n = Y`.
  Neveljavno dejanje je onemogočeno: `Prva stran` in `Prejšnja stran`, če je
  `n ≤ 1`, ter `Naslednja stran` in `Zadnja stran`, če je `n ≥ Y` ali `Y = 0`.
- Preklop med preglednico in tablo ter odpiranje in zapiranje podrobnosti ne
  spremenita `s`, `f` in `n`.
- Menjava projekta ali osvežitev ponastavita `s = all`, `f = all` in `n = 1`
  (ozira `n = 0`, če je rezultat prazen).
- Straničenje ne spreminja podatkov, ne pošilja zapisov na API in ne vpliva na
  obstoječe povezave, `id`, podrobnosti, nalaganje ali prilagodljiv videz Folio.

## Zahteve in sprejemni pogoji

| Zahteva | Sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Privzeto sta `s = all` in `f = all`; vidna so vsa opravila v izvirnem vrstnem redu. | Uporabniški scenarij s projekтом, ki vsebuje različna stanja; preveri vrstni red ID-jev. |
| R02 | Vsaka numerična velikost `s` razdeli trenutno `F` na zaporedne, neprekrivajoče se odseke. Zadnja stran je lahko krajša; unija odsekov je enaka `F`. | Scenariji za `s = 2, 5, 10`, vključno z deljenim, enakim in viškim obsegom glede na velikost strani. |
| R03 | Štirje gumbi navigirajo po pravilih zgoraj. Na robu so onemogočeni in klik ne spremeni stanja. | Scenariji na prvi, zadnji, srednji in prazni strani; preveri `aria-disabled` ali atribut `disabled` ter viden odsek. |
| R04 | Sprememba `s` vedno nastavi `n = 1`; `s = all` pomeni eno stran pri `N > 0` in stran `0` pri `N = 0`. | Spremeni velikost z veljavne neprve strani in preveri vrnitev na prvo stran. |
| R05 | Filter se uporabi pred straničenjem, sprememba `f` nastavi `n = 1`, vrstni red ujemajočih se opravil ostane izviren. | Primerjaj ID-je pred in po filtriranju ter preveri resetiranje strani. |
| R06 | Preglednica in tabla prikazujeta enake ID-je trenutne strani. Stolpci table združijo samo `V`; vsak stolpec ni straničen ločeno. | Preklopi oba prikaza z enakim stanjem in primerjaj vrstice, kartice ter stolpce. |
| R07 | Preklop prikaza ter odpiranje in zapiranje podrobnosti ohranita `s`, `f` in `n`. | Izvedi dejanja na srednji strani in preveri enako stanje po vrnitvi. |
| R08 | Menjava projekta ali osvežitev ponastavita `s = all`, `f = all` in `n = 1`; stanja ni v trajni shrambi ali URL-ju. | Menjava med projekti, osvežitev in pregled ključev shrambe ter URL-ja. |
| R09 | Za `N > 0` status vsebuje natančno `Stran n od Y. Prikazano A–B od N.`, kjer sta `A = (n−1)s+1` in `B = min(ns,N)`. | Preveri besedilo na več straneh in velikostih, skupaj z znakom `–`. |
| R10 | Za prazen projekt ali prazen rezultat filtra status vsebuje `Stran 0 od 0. Prikazano 0–0 od 0.` in vsi štirje gumbi so onemogočeni. Odstranitev filtra vrne prvo stran. | Scenariji s praznim projektom in filtrom brez zadetkov; nato izberi `all`. |
| R11 | Pregled stanj šteje celoten nefiltrirani `A`. Števci stolpcev table štejejo `V`. Prikazano skupno število opravil se ne spremeni zaradi straničenja. | Primerjaj števce pred in po filtru ter straneh; preveri vsoto števil stolpcev glede na `V`. |
| R12 | Straničenje ne pošlje zapisov na API, ne spremeni podatkov in ohrani obstoječe povezave, `id`, podrobnosti, nalaganje in prilagodljiv videz Folio. | Regresija obstoječega delovanja ter nadzor omrežnih zahtev pri navigaciji, filtrih in velikostih. |

Status ima `role=status` in `aria-label="Stanje straničenja"`. Vrstice in kartice
ohranijo `data-task-id`, obstoječa dostopna imena pogledov in stolpcev ter
`aria-label="Pregled stanj opravil"` pa ostanejo nespremenjeni. Nova dejanja ob
opravilu morajo biti zunaj njegove povezave.

## Uporabniški scenariji

1. Uporabnik odpre projekt: vidi vsa opravila po privzetem stanju, pregled
   stanj pa šteje celoten projekt.
2. Uporabnik izbere velikost `5` in se pomika po straneh; preglednica in tabla
   kažeta isti odsek, status pa natančno pošteje trenutno območje.
3. Uporabnik izbere filter stanja: najprej se filtrira, nato straniči;
   sprememba filtra vrne na prvo stran, obstoječi vrstni red pa ostane.
4. Uporabnik odpre in zapre podrobnost ali preklopi prikaz: velikost, filter in
   stran ostanejo enaki.
5. Uporabnik zamenja projekt ali osveži stran: nastavitvi sta spet `all` in
   `all`, vidna pa je prva stran.

## Izvedba in sledljivost

| Zahteva | Pogoj | Načrtovano preverjanje | Izid |
| --- | --- | --- | --- |
| R01–R12 | Sprejemni pogoji iz tabele zgoraj. | Lastni agentni testi v `tests/agent/` in relevantni obstoječi skupni testi, ki pokrivajo povezave, podrobnosti, nalaganje in prilagodljivost. | Ni še izvedeno v fazi specifikacije. |

Vsak test bo moral povedati zahtevo, ki jo preverja, in dejanski izid. Neizvedenih
preverjanj ne bomo označevali kot uspešnih.

## Odprta vprašanja in omejitve

- Razporeditev novih kontrol ni predpisana, vendar mora slediti dizajnu Folio,
  ohranjati dostopnost in delovati na ozkem zaslonu z notranjim drsenjem.
- Besedilo, ki ni izrecno zahtevano, ni predpisano; ne dodajamo novih zahtev.
- Javni internet, zunanje meritve in spremembe strežnika ali infrastrukture niso
  v obsegu P05.
