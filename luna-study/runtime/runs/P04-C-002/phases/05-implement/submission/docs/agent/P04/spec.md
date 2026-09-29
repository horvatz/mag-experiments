# P04: Stabilno razvrščanje z dvema ključema

**Stanje:** specifikacija za implementacijo; preverjanja funkcionalnosti še niso izvedena.

## Problem in kontekst

Folio uporabniku že kaže opravila iz izbranega projekta v preglednici ali na tabli. Začetni pogled ohranja vrstni red, ki ga vrne API; tabela ima povezave do podrobnosti, tabla pa stalne stolpce Pripravljeno, V delu in Končano. Uporabnik potrebuje enaka, predvidljiva merila za razvrščanje v obeh pogledih, z možnostjo sekundarnega ključa in brez spreminjanja podatkov. Obstoječi slovenski vmesnik, potrjeni dizajn Folio, bralne funkcije in javni API ostanejo izhodišče.

## Vhodi, dejanja in izidi

Vhod je zaporedje opravil iz `GET /api/projects/:id/tasks`; pomembna polja so `id`, `projectId`, `title`, `assignee`, `status` in veljavni datum `dueDate` v obliki `YYYY-MM-DD`. API lahko vrne prazen seznam, eno opravilo ali poljubno več opravil. Naslovi in imena so nizi; naslovi se lahko ponavljajo. Vsako opravilo pripada svojemu projektu.

Kontrole so štirje izbirniki HTML `select`: Primarni ključ (`original/title/assignee/status/dueDate`), Primarna smer (`asc/desc`), Sekundarni ključ (`none/title/assignee/status/dueDate`) in Sekundarna smer (`asc/desc`), ter gumb **Izvorni vrstni red**. Začetno stanje je `S₀ = (original, asc, none, asc)`. Izbira kontrole spremeni samo njeno vrednost. Gumb vrne vse štiri vrednosti v `S₀`.

Izbrane vrednosti so lokalno stanje izbranega projekta: niso zapisane v URL ali trajno shrambo. Preklop preglednice/table in odpiranje ali zapiranje podrobnosti ohrani stanje; menjava projekta in osvežitev ga ponastavita na `S₀`. Razvrščanje ustvari prikazno zaporedje; ne zapisuje sprememb in ne potrebuje preklica ali shranjevanja. Obstoječe nalaganje, napaka in ponovni poskus API-ja ostanejo nespremenjeni.

### Pravila primerjave in stanja

Naj bo `T = [t₀, …, tₙ₋₁]` prejeto zaporedje, `i(t)` pa prvotni indeks opravila. `cmpₖ(a,b)` je primerjava naraščajoče po ključu `k` in vrne `-1`, `0` ali `1`. Za naslov in odgovorno osebo se niz najprej pretvori v NFD, odstranijo se znaki U+0300–U+036F in rezultat pretvori v male črke; primerjata se niza z običajnima leksikografskima operatorjema `<` in `>` (UTF-16). Jezikovno in številčno razvrščanje se ne uporablja. Za stanje velja rang `todo < in_progress < done`; veljavni datumi `YYYY-MM-DD` se primerjajo kronološko. Ista primerjava velja, kadar je ključ sekundarni.

Smer funkcijskega ključa je `dir(c, d) = c`, če je `d=asc`, sicer `-c`; obrne samo neničelni izid tega ključa. Primerjava za prikaz je:

1. Če je primarni ključ `original`, primerjaj po `i(a)` in `i(b)`; sekundarne nastavitve tega ne spremenijo.
2. Sicer izračunaj `p = dir(cmpₖ₁(a,b), d₁)`. Če `p ≠ 0`, je to rezultat.
3. Če `p = 0` in sekundarni ključ ni `none`, izračunaj `s = dir(cmpₖ₂(a,b), d₂)`. Če `s ≠ 0`, je to rezultat.
4. Sicer vrni predznak `i(a) - i(b)`.

Tako tudi enak primarni in sekundarni ključ ohrani vrstni red vira. Za `none` se drugi ključ preskoči. Preglednica uporabi razvrščeno zaporedje; tabla iz istega zaporedja filtrira opravila po stanju v treh nespremenljivo urejenih stolpcih, zato vrstni red znotraj posameznega stolpca ostane relativen vrstnemu redu v preglednici.

## Uporabniški scenariji

- Uporabnik izbere primarni in po potrebi sekundarni ključ ter njuni smeri; oba pogleda pokažeta isti vrstni red po navedenih pravilih.
- Uporabnik odpre in zapre podrobnosti ali preklopi pogled; izbrane štiri nastavitve ostanejo enake.
- Uporabnik izbere drug projekt ali osveži stran; kontrole in vrstni red se vrnejo na `S₀`.
- Uporabnik pritisne **Izvorni vrstni red**; vse kontrole se ponastavijo in prikaz obnovi izvorni vrstni red.
- Uporabnik pregleda prazen projekt, projekt z enim opravilom ali seznam z enakimi naslovi; vmesnik ostane uporaben, ID-ji in povezave do podrobnosti pa identificirajo prava opravila.

## Zahteve in pravila

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Ob prvem prikazu so kontrole `(original, asc, none, asc)`. Tabela ohrani `T`; tabla znotraj vsakega od stalno urejenih statusnih stolpcev ohrani relativni vrstni red iz `T`. | Preveri začetne vrednosti kontrol, vrstni red tabele in vrstni red ID-jev po filtriranju `T` v vsak stolpec table. |
| R02 | Za `title` ali `assignee` se uporablja zgoraj definirana NFD-normalizacija, odstranjevanje U+0300–U+036F, male črke in UTF-16 primerjava z `<`/`>`; brez jezikovnega ali številčnega primerjanja. | Primerjaj pare z diakritiko, velikostjo črk, Unicode in števkami proti pričakovanemu vrstnemu redu. |
| R03 | `status` sledi `todo`, `in_progress`, `done`; veljavni datumi `dueDate` se uredijo kronološko. | Preveri vse tri statuse in več veljavnih datumov v obeh smereh. |
| R04 | `asc/desc` obrne samo rezultat primerjave trenutnega ključa; izenačenja in izvorni vrstni red se ne obrnejo. | Primerjaj asc/desc za podatke z izenačenji; preveri relativni vrstni red izenačenih ID-jev. |
| R05 | Sekundarni ključ (`title`, `assignee`, `status`, `dueDate`) se primerja samo, ko je primarni izenačen; njegova smer je neodvisna. `none` ga preskoči. | Izberi podatke z izenačenim primarnim in različnim sekundarnim ključem; zamenjaj samo sekundarno smer. |
| R06 | Ob izenačenju obeh ključev velja prvotni indeks. Enak primarni in sekundarni ključ ne uvede dodatnega obrata. `original` kot primarni ključ vedno ohrani `T`, ne glede na ostale kontrole. | Preveri stabilnost izenačenih parov, enak ključ na obeh ravneh ter `original` z desc in izbranim sekundarnim ključem. |
| R07 | Tabla ohrani stolpce Pripravljeno, V delu, Končano; znotraj stolpca ohrani relativni vrstni red filtriranega razvrščenega zaporedja. | Primerjaj ID-je posameznih stolpcev s filtriranim zaporedjem preglednice. |
| R08 | Preklop pogleda in odpiranje/zapiranje podrobnosti ne spremeni nobene od štirih nastavitev. | Nastavi neprivzete kontrole in preveri stanje pred in po vsakem dejanju. |
| R09 | Menjava projekta in osvežitev nastavita vse kontrole na `S₀`; nastavitev ni v URL-ju ali trajni shrambi. | Nastavi neprivzete vrednosti, zamenjaj projekt oziroma osveži in preveri kontrole ter URL/shrambo. |
| R10 | **Izvorni vrstni red** ponastavi vse štiri kontrole. Prazen in enoelementni seznam delujeta za vse dovoljene ključe in smeri. | Preveri gumb, nato prazen in enoelementni seznam z vsako kombinacijo ključev in smeri. |
| R11 | Razvrščanje je projekcija: ne spremeni opravil, polj, projektne pripadnosti, izvornega zaporedja ali skupnih števil; ob spremembi vrstnega reda se ne pošlje zapis na API. | Pred/po primerjaj prejete podatke in števila ter spremljaj, da ni zahtev za zapis. |
| R12 | Vsak ID se v izbranem pogledu prikaže natanko enkrat in odpre podrobnosti za isti ID tudi pri enakih naslovih. Na vrsticah in karticah ostane `data-task-id`; ohranijo se dostopna imena pogledov in stolpcev ter `aria-label="Pregled stanj opravil"`. Nova dejanja pri opravilu so zunaj njegove povezave. Ohranijo se ostale bralne funkcije in potrjeni Folio; pri 390 px se stran ne razširi, dovoljeno je notranje drsenje preglednice oziroma table. | Preveri enoličnost ID-jev in povezavo ID–podrobnosti pri ponovljenih naslovih, navedene atribute in dostopna imena, položaj dejanj ter širino 390 px. |

## Izvedba in sledljivost

Spodaj so načrtovane povezave za implementacijo in preverjanje, ne dokaz o že obstoječi kodi ali opravljenem testu. Začetna aplikacija razvrščanja še nima; ustreznih testov P04 še ni v `tests/agent/`.

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | Začetne kontrole in prejeto zaporedje | Začetni prikaz v obeh pogledih | `src/App.tsx`: kontrole in tabela; `src/TaskBoard.tsx`: tabla | Ni izvedeno; začetna implementacija še ne obstaja. |
| R02 | NFD, odstranjevanje diakritičnih znakov, male črke in UTF-16 vrstni red | Primeri z diakritiko, velikostjo črk, Unicode in števkami | Logika primerjave v `src/`, uporabljena v `src/App.tsx` in `src/TaskBoard.tsx` | Ni izvedeno; testi P04 še niso ustvarjeni. |
| R03 | Rang statusov in kronološki veljavni datumi | Vsi statusi in več datumov v obeh smereh | Logika primerjave v `src/`, uporabljena v obeh pogledih | Ni izvedeno; testi P04 še niso ustvarjeni. |
| R04 | Smer obrne samo rezultat trenutnega ključa | Asc/desc z izenačenimi vrednostmi | Logika primerjave v `src/` | Ni izvedeno; testi P04 še niso ustvarjeni. |
| R05 | Sekundarni ključ samo ob izenačenju primarnega; neodvisna smer | Različna sekundarna vrednost in sprememba samo njene smeri | Logika primerjave v `src/` | Ni izvedeno; testi P04 še niso ustvarjeni. |
| R06 | Izvorni indeks razreši izenačenja; `original` prevlada nad drugimi kontrolami | Podvojena ključa, isti ključ na obeh ravneh ter `original` z desc | Logika primerjave v `src/` | Ni izvedeno; testi P04 še niso ustvarjeni. |
| R07 | Fiksni stolpci, vrstni red kartic iz filtriranega zaporedja | Primerjava ID-jev stolpcev s filtriranim vrstnim redom tabele | `src/TaskBoard.tsx`: filtriranje v tri stolpce in kartice | Ni izvedeno; začetni prikaz filtrira neurejena opravila. |
| R08 | Nastavitve preživijo pogled in podrobnosti | Preklop pogleda ter odpiranje/zapiranje podrobnosti | `src/App.tsx`: stanje kontrol; `src/TaskDetails.tsx`: dialog; `src/navigation.ts`: usmerjanje | Ni izvedeno; testi P04 še niso ustvarjeni. |
| R09 | Projekt/osvežitev vrne privzete vrednosti; brez URL/trajne shrambe | Menjava projekta, osvežitev in pregled URL/shrambe | `src/App.tsx`: stanje vezano na projekt; `src/navigation.ts`: obstoječe usmerjanje | Ni izvedeno; testi P04 še niso ustvarjeni. |
| R10 | Gumb ponastavi štiri kontrole; seznam nič/en element deluje | Gumb ter vse ključe in smeri za prazen/enoelementni seznam | `src/App.tsx`: gumb in projekcija | Ni izvedeno; testi P04 še niso ustvarjeni. |
| R11 | Projekcija brez mutacij in zapisovalnih zahtev | Podatki/števila pred in po razvrščanju; nadzor zapisovalnih zahtev | Projekcija v `src/`; bralne zahteve v `src/api.ts` ostanejo obstoječe | Ni izvedeno; preverjanje zapisovalnih zahtev še ni narejeno. |
| R12 | Identiteta, podrobnosti, dostopnost in odzivnost ostanejo pravilne | Ponovljeni naslovi, ID-ji, a11y atributi, dejanja izven povezave, širina 390 px | `src/App.tsx`, `src/TaskBoard.tsx`, `src/TaskDetails.tsx`, `src/styles.css` | Ni izvedeno; te zahteve je treba preveriti po implementaciji. |

## Merila uspeha

- Vseh R01–R12 je mogoče preveriti s pogoji v zgornji tabeli; vsak končni rezultat ima določljive testne dokaze.
- Preglednica in tabla iz istega prejetega zaporedja uporabljata enaka primerjalna pravila; tabla ohrani vrstni red znotraj svojih stalnih statusnih stolpcev.
- Menjava pogleda/podrobnosti in ponastavitveni dogodki sledijo pravilom stanja, brez trajnega shranjevanja nastavitev.
- Razvrščanje ne sproži zapisovanja, ne spremeni vira podatkov ter ohrani identiteto opravil in potrjeni Folio.

## Odprta vprašanja in omejitve

Za opisane domenske vrednosti ni odprtega funkcionalnega vprašanja: datumi so veljavni `YYYY-MM-DD`, imena in naslovi so nizi, manjkajoči datumi niso zahtevani, prazni seznami in ponovljeni naslovi pa so izrecno zajeti. Natančna razporeditev novih kontrol in besedilo, ki nista določena v dogovoru o vmesniku, ostajata implementacijska izbira. Funkcionalnost, koda, razvojni in končni testi ter širina 390 px v tem koraku niso bili preverjeni; končni testi P04 niso dostopni v tej specifikaciji.
