# Folio — Priljubljena opravila in trajna shramba

**Priredba:** P07.1.0. Glavna naloga. Vse dopolnitve ohranjajo potrjeni dizajn Folio iz *`docs/dizajn.md`*.

## Problem in kontekst

Uporabniki aplikacije Folio nadzirajo liste opravil za več projektov. Zaradi dolžine lista je pomembno označiti določena opravila kot **priljubljena** za hiter nadzor. Priljubljena opravila se lokalno shranjujejo glede na trenutni projekt in jih je mogoče prikazati v ločenem filtriranem pogledu.

Funkcionalnost je popolnoma lokalna: ne spreminja stanja opravil na strežniku oziroma v `/api/`, hramba je v `localStorage` z edinstvenim ključem, ki preprečuje konflikt z drugimi izdajami.

Predvidena sprememba: dodajanje dveh gumbov na vsako opravilo (priprava in odstranitev prilegajočega ID-ja v globalno mnozico priljubljenih, checkbox za filtriranje po priljubljenih, element statusa za pregled števila priljubljenih). Preglednica in tabla uporabljata isto množico in filter, preklop pogleda hkrati spremene ohranja.

## Vhodi, dejanja in izidi

### Podatkovni vhodi

- **API `/api/`**: vpiše `{ tasks: { [id]: { task_id: string, title: string, ... } } }`
- **localStorage**: ključ `folio:favorites:v1`, oblika `{ version: 1, ids: ["...", "..."] }`

### Dovoljena dejanja

- Klik gumba **Priljubljeno opravilo <id>** s `aria-pressed` za preklop stanja tega ID-ja
- Klik gumba **Odstrani priljubljene tega projekta** za čiščenje množice priljubljenih tega projekta
- Aktivacija/deaktivacija checkboxa **Prikaži le priljubljene** za pripravo filtera

### Izidi

- Stanje priljubljenost ID-ja se spremeni in se takoj odraza v UI
- Množica priljubljenih se shrani v `localStorage` z ključem `folio:favorites:v1`
- Filter upošteva samo priljubljena opravila trenutnega projekta
- Števec prikazuje `Priljubljeno: X od M.` za celoten projekt

### Pogoje uporabe

- Navajanje pravilnega ID-ja opravila
- Prisotnost opravil z istim ID-jem v celotnem projektu
- Vsak projekt ima lastno množico priljubljenih ID-jev

### Stanja po uspehu

- ID je prisoten/odsoten v množici priljubljenih
- Filter omogoča prikaz samo priljubljenih
- Množica je sortiran po UTF-16, vsebuje samo enkratne ID-je, polja opravil se ne shranjujejo

### Stanja po preklicu

- Klik gumba **Priljubljeno opravilo <id>** izklopi
- Checkbox **Prikaži le priljubljene** je deaktiviran
- Števec se prilagodi novemu številu priljubljenih

### Stanja napake

- Neveljaven JSON v `localStorage`: se obravnava kot prazna množica
- Prizemljeno prepovedano pisanje: UI ostane delno dostopen z napotitvijo v preglednik

## Zahteve in pravila

| ID | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | vsako opravilo imenuje `aria-pressed` gumb **Priljubljeno opravilo <id>**; klik samo preklopi ID, ne odpre podrobnosti; enaki naslovi so neodvisni | UI preverja `aria-pressed` na vsakem gumbnem elementu |
| R02 | priljubljene shrambi ključ `folio:favorites:v1` v lokalni shrambi kot JSON `{version:1,ids:[...]}`; ID-ji so enkratni nizi in seštevani po UTF-16; polja upravljajo opraviloma ni shrambe | preverjanje `localStorage.getItem("folio:favorites:v1")` vrne veljaven JSON |
| R03 | osvežitev obnovi shranjene ID-je; veljaven zapis vsebuje podvojene ID-je ali trenutno neznane ID-je; podvojeni obravnavo kot enega, neznane ohranila za druge projekte, ne ustvari izmišljenih opravil | preverjanje `localStorage` po refreshu prikaže samo obstoječa opravila |
| R04 | manj ključ, neveljaven JSON, napačna verzija, manj `ids` ali kačejki `ids` brez niza pomeni prazno začetno mnozico; aplikacijski ne odpove in ne prepisuje `localStorage` | preverjanje `localStorage` po napačnih podatkih vrne prazno množico |
| R05 | checkbox **Prikaži le priljubljena** omeji prikaz na priljubljene na trenutni projekt, izvorni vrstni red; privzeta vrednost je `false` | privzeta vrednost checkboxa je `false`; filter izvorna vrstnoreda upošteva |
| R06 | odstranitev priljubljenega med aktivnim filtrom ga takoj odstrani iz prikaza; ko ni rezultatov, se pokaže **Ni priljubljenih opravil.** in kontrole omogočajo izklop filtra | preverjanje UI po odstranitvi privzeta filtra je prikazano |
| R07 | preglednica in tabla uporabljata isto množico in filter; preklop pogleda izgubi sprememb; podrobnosti ostanejo dostopne po pravilnem ID-ju preverjanje spremembe pogleda ohranja spremembe | preverjanje spremembe pogleda ohranja spremembe |
| R08 | menjava projekta ohrani globalno množico priljubljenih, filter je ponastaven na `false`; osvežitev obnovi množico, filter je prav tako `false` preverjanje menjava projekta resetira filter | preverjanje menjava projekta resetira filter |
| R09 | gumb **Odstrani priljubljene tega projekta** odstrani samo ID-je opravil celotnega trenutnega projekta; ID-ji drugih projektov in neznani ID-ji ostanejo; brez priljubljenih tega projekta je gumb onemogočen | preverjanje gumba odstranjenega priljubljenih togle projekte |
| R10 | element števca vselej kaže **Priljubljeno: X od M.**, kjer se X/M nanaša celoten trenutni projekt, tudi ko je filter aktiven; števec stolpcev table šteje vidna opravila preverjanje števca prikaže pravilno število priljubljenih | preverjanje števca prikaže pravilno število priljubljenih |
| R11 | dogodek `storage` za pravi ključ takoj uskladi množico z novo vrednostjo po istih pravilih validacije; `null` jo izprazni; drug ključ se ignorira; dogodek ne sproži povratnega zapisu; če branje ali zapis shrambe vrže izjemo, aplikacija ostane uporabna v pomnilniku in prikaže opozorilo o nedostopni shrambi | preverjanje `storage` dogodka uskladi množico z novo vrednostjo |
| R12 | vse spremembe priljubljenih so lokalne: ni zapisov na API, nobeno polje opravila se ne spremeni; ohranjen Folio, nalaganje, navigacija in ozki prikaz | preverjanje `fetch` na `/api/` ne vpiše nobenega novega zapisa |

## Izvedba in sledljivost

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | vsako opravilo ima `aria-pressed` gumb | klik gumba na vrstici in kartici | `src/` | UI preverja `aria-pressed` na vsakem gumbnem elementu |
| R02 | priljubljene shrambi ključ `folio:favorites:v1` v lokalni shrambi kot JSON | preverjanje `localStorage.getItem("folio:favorites:v1")` | `src/` | `localStorage` povrne veljaven JSON |
| R03 | osvežitev obnovi shranjene ID-je; preverjanje `localStorage` po refreshu | `src/` | UI prikaže samo obstoječa opravila | Priljubljena opravila ohranena po refreshu |
| R04 | neveljaven JSON, napačna verzija, manj `ids` ali napačen `ids` pomeni prazno množico | `src/` | UI prikaza prazno množico | Aplikacija ne odpove, `localStorage` ni prepisana |
| R05 | checkbox **Prikaži le priljubljena** omeji prikaz na priljubljene na trenutni projekt, izvorna vrstni red | `src/` | filter prikaza le priljubljene | Privzeta vrednost checkboxa je `false` |
| R06 | odstranitev priljubljenega med aktivnim filtrom ga takoj odstrani iz prikaza | `src/` | filter prikaza le priljubljene | Ko ni rezultatov, se pokaže "Ni priljubljenih opravil." |
| R07 | preglednica in tabla uporabljata isto množico in filter | `src/` | preklop pogleda spremembe | Podrobnosti ostanejo dostopne po pravilnem ID-ju |
| R08 | menjava projekta ohrani globalno množico priljubljenih, filter je `false` | `src/` | menjava projekta resetira filter | Osvežitev obnovi množico, filter je `false` |
| R09 | gumb **Odstrani priljubljene tega projekta** odstrani samo ID-je opravil celotnega trenutnega projekta | `src/` | test odstranitev priljubljenih | ID-ji drugih projektov in neznani ID-ji ostanejo |
| R10 | element števca vselej kaže **Priljubljeno: X od M.** | `src/` | preverjanje števca prikaže pravilno število priljubljenih | Če filter aktiven, števec stolpcev tabele šteje vidna opravila |
| R11 | dogodek `storage` za pravi ključ takoj uskladi množico z novo vrednostjo | `src/` | test `storage` dogodka uskladi množico z novo vrednostjo | `null` izprazni; drug ključ se ignorira |
| R12 | vse spremembe priljubljenih so lokalne; ni zapisov na API | `src/` | preverjanje `fetch` na `/api/` | noben nov zapis na API |

## Odprta vprašanja in omejitve

- **Testna infrastruktura:** `/__test/` kontrole so namenjeni samo testnim opravilom; uporabniški vmesnik jim ne smega dostopa.
- **Navigacija med nezaključenim nalaganjem**: ne širimo prek obstoječih regresijskih zahtev.
- **Razvojni primeri:** niso celoten obseg zahtev; končni primeri lahko uporabijo drugačne podatke.
- **Dostopni testi:** končni testi zahtevane funkcionalnosti še niso izvedeni; sledovni dokumenti bodo posodobljeni po uspešnem preverjanju.
- **Neznani ID-ji:** ne ustavljamo izmišljenih opravil; se obravnavajo kot prazna množica.

---

*Ta specifikacija je izdelek postopka P07. Vzdržuje se skupno predlogo P07 in vseh dvanajst zahtev.*

