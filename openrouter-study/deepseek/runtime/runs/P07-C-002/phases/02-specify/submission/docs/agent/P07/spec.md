# P07: Priljubljena opravila in trajna shramba — specifikacija

Vir zahtev: `task/instructions.md` (R01–R12). Ustava: `.specify/memory/constitution.md`.
Potrjeni dizajn: `docs/dizajn.md`. Predloga: `task/specification-template.md`. Datum: 2026-10-30.
Ta specifikacija ne spreminja izvirnih zahtev in ne dodaja novih.

## Problem in kontekst

Uporabnik želi v aplikaciji Folio označevati opravila kot priljubljena, da jih
v velikih projektih hitro najde. Začetna aplikacija omogoča projekte, pogled
preglednice in table, podrobnosti opravila, nalaganje in ozki prikaz, ne
pozna pa priljubljenih. Sprememba doda izbiro priljubljenih, trajno shrambo v
`localStorage`, filter prikaza, odstranitev priljubljenih tega projekta, števec
in usklajevanje med zavihki. Vse je lokalno: podatki opravil in API ostanejo
nespremenjeni (R12); videz Folio se ohrani.

## Vhodi, dejanja in izidi

Vhodi:
- Opravila iz javnega API-ja `/api/`: enolični nizi `id`, `projectId`, naslov,
  opis, oseba, rok; polja ostanejo enaka izhodišču.
- Shramba `localStorage`: ključ `folio:favorites:v1`, JSON `{version:1, ids:[...]}`.
- Dogodki `storage` za ta ključ iz drugih zavihkov.

Dejanja:
- Klik gumba Priljubljeno opravilo `<id>` preklopi samo ta ID (R01).
- Checkbox Prikaži le priljubljena vklopi oziroma izklopi filter (R05).
- Gumb Odstrani priljubljene tega projekta odstrani priljubljene trenutnega projekta (R09).
- Menjava projekta, preklop pogleda med preglednico in tablo (R07, R08).

Pričakovano stanje po uspehu: prikaz in shramba ustrezata pravilom spodaj.
Ob napaki shrambe aplikacija ostane uporabna v pomnilniku in prikaže opozorilo
(R11). Preklica ni; neveljaven zapis se ob nalaganju ne prepiše (R04).

## Zahteve in pravila

Simboli: F = globalna množica ID-jev priljubljenih; P = opravila trenutnega
projekta; ids(P) = njihovi ID-ji; V = vidna opravila; showOnly = stanje filtra.
`zapis(F)` pomeni shranitev v `folio:favorites:v1` kot `{version:1, ids:[...]}`.
`normalize(v)` je branje po pravilih P2.

Splošna pravila sprememb stanja:
- P1 (R02): `zapis(F)` vsebuje samo enkratne nize, razvrščene po UTF-16; polja opravil se ne shranjujejo.
- P2 (R03, R04): branje ob podvojenih ID-jih obravnava enega, neznane ohrani; manjkajoč ključ,
  neveljaven JSON, `version != 1`, manjkajoč `ids` ali neniz v `ids` pomenijo `F = ∅`;
  ob nalaganju se shramba ne prepiše.
- P3 (R05): `showOnly = false` privzeto; ob vklopu je `V = [t ∈ P : t.id ∈ F]` v izvornem vrstnem redu.
- P4 (R06): ob odstranitvi priljubljenega med aktivnim filtrom se opravilo takoj odstrani iz `V`;
  prazno stanje pokaže `Ni priljubljenih opravil.` in kontrolo za izklop filtra.
- P5 (R08): menjava projekta ohrani `F`, `showOnly := false`; osvežitev obnovi `F` iz shrambe,
  `showOnly := false`.
- P6 (R09): gumb odstrani `F := F \ ids(P)`; ID-ji drugih projektov in neznani ostanejo;
  brez priljubljenih v `P` je onemogočen.
- P7 (R10): števec vedno `Priljubljeno: X od M.`, kjer je `X = |{t ∈ P : t.id ∈ F}|` in
  `M = |P|`, tudi ob aktivnem filtru; števci stolpcev table štejejo vidna opravila.
- P8 (R11): dogodek `storage` za pravi ključ nastavi `F := normalize(newValue)`, `null` pomeni `∅`,
  brez povratnega zapisa; drug ključ se ignorira; izjema pri branju ali zapisu pomeni
  opozorilo (`role=alert`, vsebuje `shramba`) in delovanje v pomnilniku.

Dogovor o vmesniku: gumbi Priljubljeno opravilo `<id>` z `aria-pressed=true/false`
so ločeni od povezave opravila; checkbox Prikaži le priljubljena; gumb Odstrani
priljubljene tega projekta; element `role=status` z `aria-label=Število priljubljenih`.
Ohranjeni ostanejo `data-task-id`, dostopna imena pogledov in stolpcev ter
`aria-label="Pregled stanj opravil"`; pri širini 390 pik se stran ne razširi.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Vsako opravilo v preglednici in na tabli ima ločen gumb Priljubljeno opravilo `<id>` z `aria-pressed`; klik preklopi samo ta ID in ne odpre podrobnosti; enaki naslovi so neodvisni. | Novi testi P07; ročni pregled. |
| R02 | Zapis v `folio:favorites:v1` je `{version:1, ids:[...]}` z enkratnimi nizi, razvrščenimi po UTF-16; polja opravil se ne zapišejo. | Novi testi shrambe. |
| R03 | Osvežitev obnovi shranjene ID-je; podvojene obravnava kot enega, neznane ohrani, izmišljenih opravil ne ustvarja. | Novi testi. |
| R04 | Manjkajoč ključ, neveljaven JSON, napačna `version`, manjkajoč `ids` ali neniz v `ids` pomenijo prazno množico; aplikacija ne odpove in ob nalaganju ne prepiše shrambe. | Novi testi. |
| R05 | Filter omeji prikaz na priljubljene trenutnega projekta v izvornem vrstnem redu; privzeta vrednost je `false`. | Novi testi. |
| R06 | Odstranitev priljubljenega med aktivnim filtrom ga takoj odstrani iz prikaza; prazno stanje pokaže `Ni priljubljenih opravil.` in omogoča izklop filtra. | Novi testi. |
| R07 | Preglednica in tabla uporabljata isto množico in filter; preklop pogleda ne izgubi sprememb; podrobnosti ostanejo dostopne po ID-ju. | Novi testi; skupni regresijski testi. |
| R08 | Menjava projekta ohrani globalno množico, filter ponastavi na `false`; osvežitev obnovi množico, filter je `false`. | Novi testi. |
| R09 | Gumb odstrani samo ID-je opravil trenutnega projekta; ID-ji drugih projektov in neznani ostanejo; brez priljubljenih tega projekta je onemogočen. | Novi testi. |
| R10 | Števec kaže `Priljubljeno: X od M.` za celoten trenutni projekt tudi ob filtru; števci stolpcev table štejejo vidna opravila. | Novi testi. |
| R11 | Dogodek `storage` za pravi ključ uskladi množico po P2, `null` jo izprazni, drug ključ se ignorira, povratnega zapisa ni; izjema pri shrambi pomeni opozorilo in delovanje v pomnilniku. | Novi testi. |
| R12 | Spremembe so lokalne: ni zapisov na API in nobeno polje opravila se ne spremeni; Folio, nalaganje, navigacija in ozki prikaz so ohranjeni. | Skupni testi; novi testi. |

## Izvedba in sledljivost

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | preklop gumba ne odpre podrobnosti | novi testi v `tests/agent/` | `src/` (izvedba) | ni izvedeno; vpiše se med izvedbo |
| R02 | zapis normaliziran | novi testi | `src/` (izvedba) | ni izvedeno; vpiše se med izvedbo |
| R03 | obnova z normalizacijo | novi testi | `src/` (izvedba) | ni izvedeno; vpiše se med izvedbo |
| R04 | neveljaven zapis pomeni prazno | novi testi | `src/` (izvedba) | ni izvedeno; vpiše se med izvedbo |
| R05 | filter in izvorni vrstni red | novi testi | `src/` (izvedba) | ni izvedeno; vpiše se med izvedbo |
| R06 | takojšnja odstranitev in prazno stanje | novi testi | `src/` (izvedba) | ni izvedeno; vpiše se med izvedbo |
| R07 | skupno stanje pogledov | novi testi | `src/` (izvedba) | ni izvedeno; vpiše se med izvedbo |
| R08 | menjava projekta in osvežitev | novi testi | `src/` (izvedba) | ni izvedeno; vpiše se med izvedbo |
| R09 | brisanje po projektu | novi testi | `src/` (izvedba) | ni izvedeno; vpiše se med izvedbo |
| R10 | števec celotnega projekta | novi testi | `src/` (izvedba) | ni izvedeno; vpiše se med izvedbo |
| R11 | usklajevanje med zavihki | novi testi | `src/` (izvedba) | ni izvedeno; vpiše se med izvedbo |
| R12 | brez sprememb API in videza | skupni in novi testi | `src/` (izvedba) | ni izvedeno; vpiše se med izvedbo |

## Odprta vprašanja in omejitve

- Izvirne zahteve iz `task/instructions.md` so merilo; ta dokument jih ne širi.
- Razporeditev novih kontrol in besedilo, ki ni izrecno določeno, nista predpisana.
- Vrstni red prikaza je izvorni vrstni red opravil iz API-ja (R05).
- Dokazila o dejansko izvedenih testih se vpišejo med izvedbo; nedostopnih končnih testov ne navajamo kot opravljenih.
- Podatki končnih primerov so lahko drugačni od razvojnih, znotraj opisane domene.
