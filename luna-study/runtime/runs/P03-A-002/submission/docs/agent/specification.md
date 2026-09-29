# Specifikacija P03: iskanje in sestavljeni filtri

## Problem in kontekst

Folio že bere projekte in njihova opravila prek javnega `/api/`, omogoča
preglednico, tablo in bralne podrobnosti. Trenutno prikaže celoten seznam
izbranega projekta in števce stanj projekta. Uporabnik potrebuje lokalno
iskanje po besedilu ter sestavljena filtra stanja in odgovorne osebe, ki
delujeta enako v obeh pogledih. Podatke in njihov izvorni vrstni red je treba
ohraniti; izbira filtrov ne sme povzročati zapisov.

## Vhodi, dejanja in izidi

Vhod je odgovor `Task[]` za trenutno izbrani projekt: `id`, `title`,
`description`, `assignee` in `status` so pomembni za filtriranje; druga polja
ostanejo nespremenjena za prikaz in podrobnosti. Iskalno polje sprejme
besedilo. Izbirnika sprejmeta stanja `all`, `todo`, `in_progress`, `done` ter
osebo `all` ali točno ime, ki obstaja v celotnem projektu. Uporabnik lahko
preklaplja preglednico in tablo ali v enem dejanju počisti vse filtre.

Ob uspešnem nalaganju se izračuna ustrezen podnabor v izvornem vrstnem redu.
Prikaza, števci in stanje rezultatov izhajajo iz tega podnabora. Preklop
projekta začne nove privzete filtre. Ponovna naložitev strani začne s
privzetimi filtri; URL in trajna shramba jih ne hranita. Napaka nalaganja
ohrani obstoječi prikaz napake in možnost ponovnega poskusa; pred uspešnim
nalaganjem ni filtrov ali rezultatov za prikaz.

## Zahteve in pravila

Naj bo `T` seznam opravil trenutnega projekta v vrstnem redu odgovora API-ja,
`q` besedilo iskanja, `s` izbrano stanje in `a` izbrana oseba. Normalizacija
`N(x) = lowerCase(remove U+0300–U+036F from NFD(x))`. Sestavljeno besedilo
`F(t) = N(t.id + " " + t.title + " " + t.description + " " + t.assignee)`.
Besede `W(q)` so neprazni deli `q`, ločeni z belinami, vsak normaliziran z
`N`. Ustreznost je:

`match(t) = (s = all ∨ t.status = s) ∧ (a = all ∨ t.assignee = a) ∧ ∀w ∈ W(q): w ⊆ F(t)`.

Če je `W(q)` prazna, je besedilni pogoj resničen. `R = [t ∈ T | match(t)]`
ohrani vrstni red `T`. Filtri imajo samo lokalno stanje trenutnega projekta.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Ob vstopu `q=""`, `s=all`, `a=all`; prikazan je ves `T` po vrsti. | Razvojni in izhodiščni testi; preveri privzeto stanje. |
| R02 | `F` in `W` uporabljata NFD, odstranita samo U+0300–U+036F in primerjata male črke; išče se po id, naslovu, opisu in osebi. | Razvojni iskalni primeri ter dodatni primeri Unicode. |
| R03 | Vse besede iz `W(q)` so dobesedni podnizi istega `F(t)`; vrstni red ne vpliva, ločila niso vzorci; prazen vnos ne omejuje. | Iskanje več besed, besed v drugem vrstnem redu, ločil in belin. |
| R04 | `R` hkrati izpolni izbrano stanje in natančno, nenormalizirano ime osebe. | Kombiniran izbor stanja, osebe in iskanja. |
| R05 | Možnosti oseb so `all` in unikatna neprazna imena iz `T`, ne glede na trenutni `R`; po menjavi projekta ni imena prejšnjega projekta. | Pregled opcij pod dodatnim filtrom ter preklop projekta. |
| R06 | Tabela in tabla kažeta iste ID-je iz `R`; tabela ohrani vrstni red `T`, tabela ne spreminja filtrov, vsak stolpec table pa vsebuje samo svoj status. | Isti filter v obeh pogledih, pregled ID-jev in stolpcev. |
| R07 | Sprememba projekta zamenja `T` in ponastavi `q`, `s`, `a`; filtriranje ne pregleduje drugega projekta. | Izbor projekta po nastavitvi vseh filtrov. |
| R08 | Stanje filtrov ni v URL-ju ali trajni shrambi; osvežitev jih postavi na privzete vrednosti. | Preveri URL, shrambo in stanje po ponovnem nalaganju. |
| R09 | Statusno besedilo je `Prikazano: |R| od |T|.`; povzetek stanj in števci stolpcev štejejo samo `R`. | Preveri status ter povzetek in števce po filtriranju. |
| R10 | Če `|T|>0` in `|R|=0`, oba pogleda povesta `Ni zadetkov.`; prazen `T` ohrani običajno prazno stanje in 0 od 0. | Brez zadetkov v tabeli in na tabli; ločen prazen projekt. |
| R11 | Gumb počisti v enem dejanju nastavi `q=""`, `s=all`, `a=all`; seznam se vrne na `T` brez mutacije podatkov. | Počisti po sestavljenem filtru in preveri vsa opravila. |
| R12 | Obstoječa navigacija, podrobnosti, Folio in ozka postavitev ostanejo uporabni; filtriranje ne kliče zapisovalnih metod `/api/`. | Izhodiščni regresijski testi, razvojni read-only/390 px preverjanje. |

Dogovorjeni kontrolni elementi: `input[type=search]` z dostopnim imenom
`Išči opravila`, izbirnika z imeni `Filter stanja` in
`Filter odgovorne osebe`, gumb `Počisti filtre` in `role=status` z
`aria-label=Rezultati filtriranja`. V tabeli in karticah ostane
`data-task-id`; dostopna imena pogledov, table in stolpcev se ohranijo.

## Izvedba in sledljivost

Spodnja sledljivost je bila dopolnjena po izvedbi. Filtri, iskalni predikat,
kontrole in števci so v `src/App.tsx`; tabla razvrsti prejeti podnabor po
stanju v `src/TaskBoard.tsx`; postavitev kontrol in prilagoditev ozkemu
zaslonu sta v `src/styles.css`. Lastni Playwright scenariji so v
`tests/agent/`; rezultati in omejitve so v `docs/agent/verification.md`.

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | Privzeti filtri, vsi ID-ji v vrstnem redu odgovora | D01; `search normalizes diacritics…` preveri tudi začetni seznam | `src/App.tsx:17-27,119` | Opravljeno; `npm run check`, 54/54 testov |
| R02 | NFD, odstranjevanje U+0300–U+036F, male črke, štiri polja | D01; `search normalizes diacritics…`; `search words can match…` | `src/App.tsx:11-26` | Opravljeno; `npm run check`, 54/54 |
| R03 | Vse besede kot dobesedni podnizi; vrstni red ni pomemben | `search normalizes diacritics…` (ločila, beline in več besed); `search words can match…` | `src/App.tsx:21-26` | Opravljeno; `npm run check`, 54/54 |
| R04 | IN med stanjem, točno osebo in besedami | D02; `project navigation and reload reset local filters…`; `assignee filtering compares the selected name…` | `src/App.tsx:22-26,63-70` | Opravljeno; `npm run check`, 54/54 |
| R05 | Osebe iz celotnega projekta, enkrat; projekt zamenja možnosti | `assignee options come from the whole project…`; `assignee filtering compares the selected name…`; projektni preklop | `src/App.tsx:20,68-70,119` | Opravljeno; `npm run check`, 54/54 |
| R06 | Isti ustrezni ID-ji v obeh pogledih; tabla šteje in deli po stanju | D02; `filtered counts and board columns use the same subset…` | `src/App.tsx:22-31,59-60,75-87`; `src/TaskBoard.tsx:13-38` | Opravljeno; `npm run check`, 54/54 |
| R07 | Menjava projekta ponastavi iskanje in oba filtra | `project navigation and reload reset local filters…` | `src/App.tsx:17-19,119` | Opravljeno; `npm run check`, 54/54 |
| R08 | Osvežitev ponastavi filtre; URL in trajna shramba brez njih | `project navigation and reload reset local filters…` preveri hash, shrambo in osvežitev | `src/App.tsx:17-19,33-37` | Opravljeno; `npm run check`, 54/54 |
| R09 | Rezultatski števec in povzetki izhajajo iz `R` | D04; `filtered counts and board columns use the same subset…` | `src/App.tsx:28-31,45-49,73,88`; `src/TaskBoard.tsx:16-23` | Opravljeno; `npm run check`, 54/54 |
| R10 | Brez zadetkov pri nepraznem projektu; običajno prazno stanje pri 0 opravilih | `no results are explicit in both views…`; `empty project retains its standard empty state…`; baseline empty-board scenarij | `src/App.tsx:73-75`; `src/TaskBoard.tsx:24` | Opravljeno; `npm run check`, 54/54 |
| R11 | Počisti ponastavi vse kontrole v enem dejanju brez mutacije `T` | D03; `no results are explicit in both views…` | `src/App.tsx:33-37,71` | Opravljeno; `npm run check`, 54/54 |
| R12 | Bralna navigacija, brez zapisov API-ja, Folio in ozka postavitev | Izhodiščni namizni in mobilni testi; D04; `filtered counts…`; `empty project retains…` | `src/App.tsx:58-88`; `src/styles.css:62-69,177-179` | Opravljeno; `npm run check`, 54/54 |

## Odprta vprašanja in omejitve

V zahtevah ni določena vidna razporeditev kontrol; uporabijo se obstoječe
barve, pisava in razmiki Folio. Imena oseb v projektih so po predpostavki
naloge neprazna in se ne ujemajo z rezervirano vrednostjo `all`. Končni testi
naloge niso neposredno dostopni; izvedeni in neizvedeni pregledi bodo ločeno
navedeni v poročilu preverjanja.

### Zapis popravkov specifikacije

- Začetna specifikacija, različica 1: pripravljena pred implementacijo na
  podlagi zahtev P03 1.0, projektnih pravil in predloge. Popravkov še ni.
- Po izvedbi (2026-09-27): izpolnjena je bila tabela sledljivosti R01–R12 z
  dejanskimi lokacijami kode in rezultati. Sprejemni pogoji in predikati se
  niso spremenili.
