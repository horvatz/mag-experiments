# P08 — Koledarski pregled rokov

Različica: 1.0. Status: specifikacija je pripravljena pred izvedbo.

## Problem in kontekst

Folio že omogoča izbiro projekta, pregled opravil v preglednici ali tabli, odpiranje podrobnosti in preklop med obstoječima prikazoma. Uporabnik potrebuje dodatni koledarski pregled rokov: roki se razvrstijo glede na izrecen referenčni datum, skupine pa lahko izbere in šteje po celotnem trenutnem projektu.

Sprememba dopolni obstoječi vmesnik in ne zamenja potrjenega dizajna Folio. Podatkovni vmesnik, strežnik, skupni tipi, obstoječe poti in testna infrastruktura ostanejo nespremenjeni.

## Vhodi, dejanja in izidi

### Podatki

- Projekt: `id`, `name`.
- Opravilo: `id`, `projectId`, `title`, `description`, `status`, `assignee`, `dueDate`.
- `status` je `todo`, `in_progress` ali `done`; `dueDate` je veljaven koledarski zapis `YYYY-MM-DD`.
- Podatke se bere samo prek javnega API-ja `/api/projects` in `/api/projects/:id/tasks`; izbira je vedno po `id`.

### Uporabniška dejanja

- Izberi projekt iz obstoječe navigacije.
- Vnesi ali spremeni referenčni datum z `input type="date"` z oznako `Referenčni datum`.
- Izberi skupino rokov s HTML izbirnikom `Pogled rokov` z vrednostmi `all`, `overdue`, `today`, `week`, `later` in `done`.
- Preklopi med obstoječima preglednico in tablo.
- Odpri obstoječe podrobnosti opravila ali se vrni na projekt.

### Izidi

- Pet števcev prikazuje števila skupin `overdue`, `today`, `week`, `later` in `done` za celoten trenutni projekt.
- Preglednica in tabla prikazujeta isti filtriran seznam opravil v izvornem vrstnem redu od API-ja.
- Prazen projekt prikaže pet ničel; prazna izbrana skupina v nepraznem projektu prikaže sporočilo `Ni opravil v izbrani skupini.` in omogoča preklop na drugo skupino ali `all`.
- Pregled ne shranjuje podatkov na API, v trajno shrambo ali v URL; obstoječe poti za projekt, prikaz in podrobnosti ostanejo nespremenjene.

## Pravila sprememb stanja

Naj bosta `R` veljaven referenčni datum in `F` izbrana skupina. Ob vsakem začetku prikaza projekta velja:

- `R = 2026-09-21`, `F = all`, vnosno polje za datum pa ima besedilno vrednost `2026-09-21`.
- `F` se ohrani ob veljavni spremembi datuma in ob preklopu med preglednico in tablo.
- Veljavna sprememba datuma takoj nastavi novi `R`, preračuna skupine in vidne vrstice ter odstrani opozorilo.
- Prazno ali brskalniško neveljavno datumsko polje prikaže `role="alert"` z besedilom `Vnesi veljaven referenčni datum`, ohrani zadnji veljaven `R`, zadnji veljavni prikaz ter izbrani `F`.
- Nov veljaven datum odstrani opozorilo in znova preračuna prikaz.
- Sprememba `F` spremeni samo filtriran prikaz; ne spreminja `R`, datumov, stanj ali vrstnega reda opravil.
- Menjava projekta ali osvežitev strani ponastavita `R` in `F` na začetni vrednosti.
- Stanje koledarskega pregleda se ne zapiše v `localStorage`, drugo trajno shrambo ali URL.

## Predikati razvrščanja

Za opravilo `t` z datumom `D = t.dueDate` velja:

- `isOpen(t) := t.status !== "done"`.
- `dayAdd(date, n)` pomeni koledarsko dodajanje `n` dni v zapisu `YYYY-MM-DD`, neodvisno od ure, časovnega pasu in poletnega časa.
- `group(t, R)` je enoličen in določen takole:
  1. če `t.status = "done"`, je `done`;
  2. sicer če `D < R`, je `overdue`;
  3. sicer če `D = R`, je `today`;
  4. sicer če `dayAdd(R, 1) <= D <= dayAdd(R, 7)`, je `week`;
  5. sicer je `later`.
- `visible(t, F, R) := F = "all" ali group(t, R) = F`.
- `count(k, R) := |{t : t pripada trenutnemu projektu in group(t, R) = k}|`, kjer je `k` ena od petih skupin.

Vidni zapisi v obeh prikazih so enaki in ohranijo izvorno zaporedje iz API-ja. Števci vedno štejejo celoten trenutni projekt in se ne spreminjajo z aktivnim `F`.

## Dogovor o vmesniku in dostopnosti

- Oznaka datumskega polja je `Referenčni datum`; polje je `input type="date"`.
- Oznaka izbirnika je `Pogled rokov`; vrednosti so natančno `all`, `overdue`, `today`, `week`, `later` in `done`.
- Pet števcev ima `aria-label="Število rokov <ključ>"`, na primer `Število rokov overdue`, in prikazuje samo številsko vrednost.
- Vidna imena skupin so `Zapadlo`, `Danes`, `Naslednjih 7 dni`, `Pozneje` in `Končano`.
- Ohranjeni so `data-task-id` na vrsticah in karticah, dostopna imena obstoječih pogledov in stolpcev ter `aria-label="Pregled stanj opravil"`.
- Nova dejanja ob opravilu, če jih izvedba potrebuje, so zunaj povezave do opravila.
- Na širini 390 pik se cela stran ne razširi; notranje vodoravno drsenje preglednice in table je dovoljeno.
- Ohranjen je potrjeni, prilagodljivi dizajn Folio iz `docs/dizajn.md`, vključno s tipografijo, barvami, vidnim fokusom in obstoječimi gradniki.

## Zahteve in sprejemni pogoji

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Ob vsakem začetku projekta sta `R = 2026-09-21` in `F = all`; vrednost neodvisna od ure, datuma, časovnega pasu ali poletnega časa naprave. | Nastavi sistemski čas v drugem pasu in/prestopni datum ter preveri začetni prikaz. |
| R02 | `done` ima prednost pred datumom; opravilo s tem stanjem ni v nobeni od štirih skupin odprtih opravil. | Uporabi done opravila z datumi pred, na in po referenčnem datumu ter preveri števce in filtriran prikaz. |
| R03 | Odprto opravilo z `D < R` je `overdue`; z `D = R` je `today`. | Preveri meji z enakim in prejšnjim datumom, vključno s prestopnimi in mesecnimi mejami. |
| R04 | Odprto opravilo z `dayAdd(R,1) <= D <= dayAdd(R,7)` je `week`; odprto opravilo s poznejšim datumom je `later`. Skupine so paroma disjunktne in pokrivajo vsa opravila. | Preveri dneve 1 in 7, dan 8, meje meseca, leta in februarja ter neodvisnost skupin. |
| R05 | Datumsko aritmetiko uporablja samo koledarski dan `YYYY-MM-DD`, brez ure, časovnega pasu in poletnega časa. | Preveri prehode 2026-02-28 → 03-01, 2026-12-31 → 2027-01-01 in 2028-02-28 → 02-29. |
| R06 | Pet števcev šteje celoten trenutni projekt po skupinah; aktivni `F` ne spremeni nobenega števca. | Preveri števce za več skupin, več opravil in več kot desetimi zapisi, nato menjaj `F`. |
| R07 | Izbirnik ponudi vseh šest vrednosti; izbor prikaže ustrezno skupino v izvornem vrstnem redu in ne spremeni datuma ali stanja. | Za vsak `F` preveri vidne `id`, zaporedje ter nespremenjene podatke. |
| R08 | Veljaven datum takoj preračuna skupine in vrstice ter ohrani `F`. Prazno polje prikaže opozorilo, ohrani zadnji veljavni izračun; nov veljaven datum opozorilo odstrani. | Spremeni veljaven datum, izprazni polje, preveri opozorilo in prikaz, nato vnesi nov veljaven datum. |
| R09 | Preglednica in tabla prikazujeta isti filtriran seznam `id`; preklop ohrani `R`, besedilo polja in `F`. | Primerjaj vidne `id` v obeh prikazih pred in po preklopu ter preveri polje in izbirnik. |
| R10 | Menjava projekta in osvežitev ponastavita `R` in `F`; filter ni v trajni shrambi ali URL-ju. | Nastavi neprivzeti `R` in `F`, menjaj projekt ter osveži; preveri tudi shrambo in URL. |
| R11 | Prazen projekt da pet ničel. Prazna izbrana skupina v nepraznem projektu prikaže navedeno sporočilo in omogoča preklop na drugo skupino ali `all`. | Preveri prazen projekt ter vsako prazno skupino v nepraznem projektu. |
| R12 | Vsi podatkovni datumi so veljavni `YYYY-MM-DD`, tudi prestopni. Pregled ne pošilja zapisov na API; polja, bralne podrobnosti in Folio ostanejo nespremenjeni. | Preveri veljavne prestopne datume, obstoječe stolpce in podrobnosti ter spremljaj omrežne zahteve med vsemi dejanji. |

## Izvedba in sledljivost

| Zahteva | Načrtovani pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | začetno stanje projekta | scenarij začetka v drugačnem okolju časa | `src/App.tsx` ali pripadajoča stanja projekta | Načrtovano; preverjanje še ni izvedeno. |
| R02–R05 | enolična funkcija `group(t, R)` in koledarsko `dayAdd` | podatkovni primeri prek celotnih datumskih mej | nove pomožne funkcije v `src/` ter uporaba v projektnem prikazu | Načrtovano; preverjanje še ni izvedeno. |
| R06 | števci po celotnem projektu | več opravil in menjave `F` | projektni povzetek v `src/App.tsx` oziroma obstoječi povzetek | Načrtovano; preverjanje še ni izvedeno. |
| R07–R09 | skupni filtriran seznam za oba prikaza | preveri vseh šest izborov v preglednici in tabli | `src/App.tsx`, `src/TaskBoard.tsx` in skupni izbor | Načrtovano; preverjanje še ni izvedeno. |
| R08–R11 | pravila sprememb stanja in prazna stanja | veljaven, prazen in ponovno veljaven datum; projekti in skupine | stanje projektnega prikaza v `src/` | Načrtovano; preverjanje še ni izvedeno. |
| R12 | samo branje prek `/api/` in ohranjen Folio | omrežne zahteve, obstoječi stolpci, podrobnosti in širina 390 px | `src/api.ts`, `src/App.tsx`, `src/TaskBoard.tsx`, `src/styles.css` | Načrtovano; preverjanje še ni izvedeno. |

Preverjanja bodo izvedena v naslednjih korakih z razvojimi testi P08 in obstoječimi skupnimi testi, kadar bodo relevantni. V tej fazi ni še izvedenega testnega dnevnika, zato se noben izid ne navaja kot uspešen.

## Odprta vprašanja in omejitve

- Bistvenih odprtih vprašanj ni; izvirne zahteve določajo celoten obseg.
- Privzeta predpostavka: brskalnik pri neveljavem ali nepopolnem vnosu `input type="date"` vrne prazno vrednost, zato se uporabi enako opozorilo kot za izpraznjeno polje.
- Stanje koledarskega pregleda je lokalno trenutnemu projektu in se prenese le znotraj istega prikaza projekta ter med preklopom preglednice in table.
- Obstojeca navigacija med nezaključenim nalaganjem in sočasne spremembe podatkov brez osvežitve nista predmeta P08; ne razširjata se z novimi zahtevami.
- Končni skriti testi niso dostopni v tej fazi in se ne navajajo kot izvedeni.

**Sledljivost:** `task/instructions.md`, `task/specification-template.md`, `PROJECT_RULES.md`, `.specify/memory/constitution.md`.
