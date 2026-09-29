# P04: Stabilno razvrščanje z dvema ključema

## Problem in kontekst

Folio trenutno prikazuje opravila projekta v preglednici ali na tabli in odpre podrobnosti posameznega opravila. Opravila prejme prek javnega API-ja; preglednica sledi prejetemu vrstnemu redu, tabla pa jih razdeli v stalne stolpce `todo`, `in_progress`, `done`. Uporabnik potrebuje možnost urejanja prikaza z dvema neodvisno usmerjenima ključema, pri čemer enaki ključi ohranijo izvorni vrstni red.

Sprememba doda štiri lokalne kontrole za razvrščanje in gumb **Izvorni vrstni red**. Ista razvrščena projekcija napaja preglednico in vrstni red opravil znotraj stolpcev table. Podrobnosti, štetja, projektna pripadnost, podatki in potrjeni videz Folio ostanejo skladni z izhodiščem.

## Vhodi, dejanja in izidi

### Vhodi in kontrole

Za izbrani projekt je vhodno polje `D = [t₀, …, tₙ₋₁]` seznam opravil iz `GET /api/projects/:id/tasks`, v vrstnem redu odgovora. Uporabljena polja so `id`, `projectId`, `title`, `description`, `status`, `assignee` in `dueDate`; dejanski zapisi se pri razvrščanju ne spreminjajo.

Vmesnik vsebuje HTML `select` z dostopnimi imeni in vrednostmi:

| Kontrola | Možnosti |
| --- | --- |
| Primarni ključ | `original`, `title`, `assignee`, `status`, `dueDate` |
| Primarna smer | `asc`, `desc` |
| Sekundarni ključ | `none`, `title`, `assignee`, `status`, `dueDate` |
| Sekundarna smer | `asc`, `desc` |

Razvrstitveno stanje označimo z `S = (p, dp, s, ds)`: primarni ključ, njegova smer, sekundarni ključ in njegova smer. Privzeto stanje je `S₀ = (original, asc, none, asc)`. Vrednosti so lokalne trenutnemu projektu; niso zapisane v URL ali trajno shrambo.

### Pravila primerjave in projekcije

Izvorni indeks `i(t)` je položaj opravila `t` v trenutnem `D`. Smer `asc` ima predznak `+1`, `desc` pa `−1`. Primerjalne funkcije vrnejo negativen, ničeln ali pozitiven rezultat.

- Za `title` in `assignee` naj bo `N(x) = lowercase(remove U+0300–U+036F from NFD(x))`. Primerjava `N(a)` in `N(b)` je leksikografska po UTF-16 z `<` in `>`; ne uporablja jezikovnega ali številskega razvrščanja.
- Za `status` je vrstni red `todo < in_progress < done`.
- Za `dueDate` je vrstni red kronološki po veljavnem datumu `YYYY-MM-DD`.
- Za `original` velja `cmp(original, a, b) = i(a) − i(b)`.

Če je `p = original`, je izhod vedno `D` v izvornem vrstnem redu, ne glede na preostale tri nastavitve. Sicer velja: če je `c₁ = sign(dp) × cmp(p, a, b)` neničeln, določi vrstni red. Ob `c₁ = 0` se pri `s ≠ none` uporabi `c₂ = sign(ds) × cmp(s, a, b)`; neničeln `c₂` določi vrstni red. Če sta primerjana ključa enaka (ali je `s = none`), odloči `i(a) − i(b)`. Smeri torej obrnejo samo neničelni izid pripadajočega ključa, ne končnega polja ali izenačenih opravil. Dovoljena sta enak primarni in sekundarni ključ; po enakosti obeh ostane izvorni vrstni red.

Naj bo `O = sort(D, S)` ta stabilno razvrščena projekcija. Preglednica prikaže `O`. Tabla prikaže stolpce v nespremenjenem vrstnem redu `todo`, `in_progress`, `done`; vsebina stolpca `q` je `Oq = [t ∈ O | t.status = q]`. Tako stolpec ohrani relativni vrstni red iz iste projekcije.

### Spremembe stanja

| Dogodek | Novo stanje |
| --- | --- |
| Prvi prikaz projekta ali osvežitev | `S := S₀` |
| Sprememba enega `select` | Spremeni se samo pripadajoča komponenta `S`; druge tri ostanejo enake. |
| Preklop preglednica/tabla | `S` ostane nespremenjen. |
| Odpiranje ali zapiranje podrobnosti | `S` ostane nespremenjen. |
| Menjava projekta | Izbrani projekt se spremeni in `S := S₀`. |
| Klik **Izvorni vrstni red** | `S := S₀`. |

Izračun `O` je projekcija, ne dejanje shranjevanja. Ne spremeni opravil, polj, pripadnosti, seštevkov ali vhodnega `D` ter ne pošilja zapisov na API. Obstoječi prikaz nalaganja, napake in ponovnega poskusa ostane veljaven. Obseg ne vključuje novih pravil za navigacijo med nedokončanim nalaganjem ali za sočasne spremembe podatkov brez osvežitve.

## Zahteve in pravila

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Začetne kontrole so `original/asc` in `none/asc`; izhod je v vrstnem redu API polja. | Preveri vrednosti kontrol in zaporedje ID-jev ob prvem prikazu. |
| R02 | Primarna besedilna ključa sledita definiciji `N(x)` in UTF-16 primerjavi zgoraj. | Podatki z velikimi/malimi črkami, šumniki/diakritiko in ločili; primerjaj z relacijskim vrstnim redom. |
| R03 | Status sledi vrstnemu redu `todo`, `in_progress`, `done`; veljavni datumi se uredijo kronološko. | Preveri vrstni red vsakega primarnega ključa na podatkih z vsemi stanji in različnimi datumi. |
| R04 | Smer ključa pomnoži samo njegov rezultat primerjave; enaki ključi ohranijo izvorni vrstni red. | Primerjaj `asc` in `desc` z več enakimi primarnimi vrednostmi. |
| R05 | Sekundarni ključ se uporabi samo ob primarni enakosti, njegova smer je neodvisna. | Kombiniraj oba ključa z obema smereh in preveri primarni ključni vrstni red. |
| R06 | Izenačenost obeh ključev je stabilna; enaka ključa sta dovoljena; primarni `original` vedno vrne `D`. | Preveri enake vrednosti, enak izbiri ključev in `original` ob vseh drugih nastavitvah. |
| R07 | Vrstni red stolpcev table je fiksen, znotraj vsakega je vrstni red iz `O`. | Primerjaj ID-je po stolpcih med obema pogledoma. |
| R08 | Pogled in podrobnosti ne spremenijo `S`. | Spremeni nastavitve, preklapljaj pogled ter odpiraj/zapiraj podrobnosti; preveri vse štiri kontrole in vrstni red. |
| R09 | Menjava projekta in osvežitev nastavita `S₀`; nastavitve niso v URL-ju ali trajni shrambi. | Nastavi nestandardne vrednosti, zamenjaj projekt oziroma osveži ter preveri privzete vrednosti in URL. |
| R10 | Gumb ponastavi vse štiri vrednosti; nič in eno opravilo ne povzročita napake za nobeno izbiro/smer. | Preveri ponastavitev in izčrpne izbire na praznem ter enoelementnem seznamu. |
| R11 | Razvrščanje spremeni le `O`; zapisi, seštevki, pripadnosti in API ostanejo nespremenjeni. | Primerjaj izvorne podatke in seštevke pred/po spremembi ter preveri, da ni zapisnega API klica. |
| R12 | Vsak ID je v trenutnem projektu prikazan natanko enkrat; povezava odpre podrobnosti istega ID-ja tudi ob podvojenih naslovih. Obstoječe bralne funkcije, dostopna imena in Folio ostanejo; pri širini 390 px ni razširitve cele strani. | Preveri enoličnost ID-jev in cilj povezav, bralne tokove, zahtevana dostopna imena ter širino s pomikanjem znotraj preglednice/table. |

## Izvedba in sledljivost

Spodnja mesta kode so izhodiščne točke za načrtovanje, ne trditev o že izvedeni spremembi. Natančno mesto morebitnega primerjalnega pripomočka se določi med načrtom/izvedbo. Za vsako vrstico se po implementaciji dopolni konkretna datoteka, ime izvedenega testa in dokaz iz zagona.

| Zahteva | Pogoj | Test ali scenarij | Izhodiščna datoteka / predvideno mesto | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | `S = S₀`, izhod `D` | Privzete kontrole in API vrstni red | `src/App.tsx` (`ProjectView`); projekcija še ni določena | Ni izvedeno; test/dokaz dopolniti po implementaciji. |
| R02 | `cmp(title/assignee)` po `N(x)` | Normalizirano besedilo in UTF-16 | `src/App.tsx`; primerjalni pripomoček še ni določen | Ni izvedeno; test/dokaz dopolniti po implementaciji. |
| R03 | Status rank in kronološki `dueDate` | Vsa stanja in veljavni datumi | `src/App.tsx`; primerjalni pripomoček še ni določen | Ni izvedeno; test/dokaz dopolniti po implementaciji. |
| R04 | Samo predznak ključa se obrne | Smer in stabilna izenačenja | `src/App.tsx`; primerjalni pripomoček še ni določen | Ni izvedeno; test/dokaz dopolniti po implementaciji. |
| R05 | Sekundarna primerjava le pri `c₁ = 0` | Neodvisni smeri primarnega/sekundarnega ključa | `src/App.tsx`; primerjalni pripomoček še ni določen | Ni izvedeno; test/dokaz dopolniti po implementaciji. |
| R06 | Izvorni indeks razreši končno izenačenje; `original` vrne `D` | Podvojeni in enaki ključi | `src/App.tsx`; primerjalni pripomoček še ni določen | Ni izvedeno; test/dokaz dopolniti po implementaciji. |
| R07 | `Oq` znotraj fiksnih stolpcev | Ujemanje vrstnega reda pogledov | `src/App.tsx`, `src/TaskBoard.tsx` | Ni izvedeno; test/dokaz dopolniti po implementaciji. |
| R08 | `S` se pri pogledu/podrobnostih ohrani | Preklop pogleda in podrobnosti | `src/App.tsx`, `src/TaskDetails.tsx`, `src/navigation.ts` | Ni izvedeno; test/dokaz dopolniti po implementaciji. |
| R09 | Menjava projekta/osvežitev → `S₀` | Ponastavitev projekta in osvežitev | `src/App.tsx`, `src/navigation.ts` | Ni izvedeno; test/dokaz dopolniti po implementaciji. |
| R10 | Gumb/robni velikosti polja | Ponastavitev; nič in eno opravilo | `src/App.tsx`; slogi po potrebi v `src/styles.css` | Ni izvedeno; test/dokaz dopolniti po implementaciji. |
| R11 | Podatki ostanejo enaki; brez zapisnega klica | Projekcija in brez API zapisa | `src/App.tsx`, obstoječa bralna plast `src/api.ts` | Ni izvedeno; test/dokaz dopolniti po implementaciji. |
| R12 | En ID, pravilne podrobnosti, ohranjen Folio | Podvojeni naslovi, dostopnost in 390 px | `src/App.tsx`, `src/TaskBoard.tsx`, `src/TaskDetails.tsx`, `src/styles.css` | Ni izvedeno; test/dokaz dopolniti po implementaciji. |

Specifikacija ne navaja še izvedenih testov; v tem koraku kode ali testov nisem spreminjal oziroma zaganjal. Končni testi niso dostopni in niso označeni kot opravljeni.

## Odprta vprašanja in omejitve

Odprto poslovno vprašanje, ki bi preprečevalo specifikacijo, ni ugotovljeno. Vhodni datumi so veljavni nizi `YYYY-MM-DD`, polja `title` in `assignee` so nizi; podpora manjkajočim datumom ni zahtevana. Razvojni primeri niso celoten podatkovni obseg. Navigacija med nedokončanim nalaganjem in nove sočasne spremembe podatkov brez osvežitve ostanejo zunaj obsega, kot določa naloga.

Spremembe so omejene na UI v `src/`, lastne teste v `tests/agent/` in dokumentacijo v `docs/agent/`, poleg izrecno dovoljenih procesnih datotek. Začetni podatki, strežnik, skupni tipi in testi, odvisnosti ter nastavitve ostanejo nespremenjeni. Uporabniški vmesnik uporablja samo `/api/`; kontrol `/__test/` ne uvaža ali kliče. Potrjeni videz Folio iz `docs/dizajn.md` ostane merilo.
