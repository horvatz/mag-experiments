# P08: Koledarski pregled rokov

## Problem in kontekst

Uporabnik v Folio trenutno vidi opravila projekta v preglednici ali tabli,
razvrščena po stanju. P08 doda koledarski pregled rokov: za določeni
referenčni datum je mogoče videti odprta opravila po časovni oddaljenosti in
končana opravila ločeno, ob tem pa ohraniti obstoječa pogleda, podrobnosti,
navigacijo, dostopnost in potrjeni prilagodljivi dizajn Folio.

Začetni seznam prihaja iz javnega `GET /api/projects/:id/tasks`; podrobnosti
se še naprej berejo prek obstoječega API-ja. `Task` vsebuje `id`, `projectId`,
`title`, `description`, `status`, `assignee` in `dueDate`. Naloge pripadajo
izbranemu projektu, datumi so veljavni koledarski nizi `YYYY-MM-DD`, ID-ji so
enkratni, vrstni red odziva pa je izvorni vrstni red prikaza. Uporabniški
vmesnik ne bere `/__test/`, ne uporablja lokalne kopije podatkov ali
`localStorage` in ne zapisuje opravil.

## Vhodi, dejanja in izidi

- Ob začetku projekta je referenčni datum `2026-09-21`, izbrana skupina pa
  `all`. Datum v napravi ne vpliva na začetno vrednost.
- Uporabnik spremeni datum v polju `type="date"` z oznako `Referenčni datum`
  ali izbere `all`, `overdue`, `today`, `week`, `later` oziroma `done` v
  izbirniku `Pogled rokov`.
- Veljaven datum takoj preračuna skupine in vrstice; trenutna skupina ostane
  izbrana. Prazna vrednost prikaže opozorilo, vendar za prikaz ohrani zadnji
  veljavni izračun. Naslednji veljavni datum opozorilo odstrani.
- Preklop med preglednico in tablo spremeni samo način prikaza; ohrani datum,
  trenutno besedilo datumske kontrole in skupino. V obeh pogledih so isti
  filtrirani ID-ji v istem vrstnem redu.
- Menjava projekta in osvežitev začneta lokalno stanje filtra znova z datumom
  `2026-09-21` in skupino `all`. Datum in skupina se ne zapisujeta v trajno
  shrambo ali URL; obstoječa navigacija za projekt, opravilo in pogled ostane.
- Ni ločenega dejanja preklica. Edino opredeljeno neveljavno stanje je prazna
  datumska vrednost; napake pri branju podatkov ostanejo v okviru obstoječega
  prikaza napak in ponovnega poskusa.

## Zahteve in pravila

Naj bo `T` seznam opravil trenutno izbranega projekta, `D` zadnji veljavni
referenčni datum, `F` izbrana skupina in `V` pogled (`table` ali `board`).
`day(x)` pomeni koledarski dan iz veljavnega niza `YYYY-MM-DD`, izračunan brez
odvisnosti od lokalnega časovnega pasu; `D+7` je koledarski seštevek sedmih
dni, tudi čez mesec, leto in prestopni februar.

Skupina opravila `bucket(t,D)` je določena v tem vrstnem redu:

1. `done`, če je `t.status === "done"`, ne glede na rok.
2. `overdue`, če je opravilo odprto in `day(t.dueDate) < day(D)`.
3. `today`, če je opravilo odprto in `day(t.dueDate) = day(D)`.
4. `week`, če je opravilo odprto in `day(D) < day(t.dueDate) ≤ day(D+7)`.
5. `later`, če je opravilo odprto in `day(t.dueDate) > day(D+7)`.

Pri veljavnih statusih in datumih velja, da so skupine paroma disjunktne in
njihova unija vsebuje vsa opravila `T`. Za `k ∈ {overdue,today,week,later,done}`
je `count(k) = |{t ∈ T : bucket(t,D)=k}|`; števci se ne filtrirajo po `F`.
`visible(T,D,F)` je `T`, kadar `F=all`, sicer iz `T` izbrana podlista
`bucket(t,D)=F`; izvorni vrstni red se ohranja. Preglednica in tabla izrišeta
isto zaporedje `id`-jev.

Stanje filtra se spreminja takole:

| Dogodek | Novo stanje in izid |
| --- | --- |
| Začetek projekta, menjava projekta ali osvežitev | `D := 2026-09-21`, besedilo datuma `:= 2026-09-21`, `F := all`; izračun se izvede za novi `T`. |
| Vnos veljavnega datuma `d` | `D := d`, besedilo `:= d`, opozorilo odstranjeno, `F` nespremenjen; števci in vidne vrstice se takoj preračunajo. |
| Izpraznitev datuma | Besedilo `:= ""`, `D` in `F` ostaneta nespremenjena, opozorilo se prikaže; izračun ostane vezan na zadnji veljavni `D`. |
| Izbira skupine `f` | `F := f`; `D` ostane nespremenjen, prikaže se ustrezna podlista. |
| Preklop pogleda | Spremeni se samo `V`; `D`, besedilo datuma, `F` in filtrirani ID-ji ostanejo. |

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Za vsak nov začetek projekta je `D=2026-09-21` in `F=all`, ne glede na uro naprave. | Odpri projekt z datumom naprave, ki ni referenčni; preveri začetni datum in izbrani pogled. |
| R02 | Če je `status=done`, potem `bucket=done` za vsak veljaven rok; opravilo ni v drugih skupinah. | Podatkovni primer končanega opravila z rokom pred, na in po `D`; preveri skupino in števce. |
| R03 | Za odprto opravilo je rok pred `D` `overdue`, rok enak `D` pa `today`. | Primerjaj odprta opravila z obema mejnima datumoma. |
| R04 | Odprti rok `D+1…D+7` spada v `week`, rok po `D+7` pa v `later`; vsako opravilo pripada natanko eni od petih skupin. | Preveri oba roba intervala, datum po njem ter particijo vseh ID-jev. |
| R05 | Primerjava in seštevanje obravnavata samo koledarske datume, ne lokalnih ur ali časovnih pasov; `D+7` pravilno prečka mesece, leta in prestopni februar. | Preveri mejne datume čez časovni pas/DST, prehod leta in prestopni februar. |
| R06 | Pet števcev `overdue/today/week/later/done` je izračunanih iz vseh `T`; sprememba `F` ne spremeni vrednosti. | Preveri števila pred in po več izbirah skupine, vključno s praznim projektom. |
| R07 | Izbirnik `Pogled rokov` ponuja `all/overdue/today/week/later/done`; izbira prikaže podlisto v izvornem vrstnem redu in ne spremeni rokov ali statusov. | Za vsako možnost primerjaj vrstice/kartice in podatke opravila. |
| R08 | Veljaven datum takoj posodobi izračun in ohrani `F`; prazno polje pokaže `role=alert` z besedilom `Vnesi veljaven referenčni datum.`, ne spremeni `D` ali prikazanega izračuna; veljaven ponovni vnos opozorilo odstrani. | Vnesi veljaven datum, izprazni polje, preveri opozorilo in nespremenjen izračun, nato vnesi datum znova. |
| R09 | Preglednica in tabla kažeta enak filtriran seznam ID-jev. Preklop ohrani `D`, trenutno besedilo polja in `F`. | Primerjaj urejena seznama `data-task-id` pred preklopom in po njem; preveri datum ter skupino. |
| R10 | Menjava projekta in osvežitev ponastavita `D` in `F` na začetni vrednosti; vrednosti filtra niso v trajni shrambi ali URL-ju. | Spremeni datum/skupino, zamenjaj projekt in osveži; preveri privzete vrednosti in URL/shrambo. |
| R11 | Prazen projekt ima vseh pet števcev `0`. Prazna izbrana skupina v nepraznem projektu prikaže `Ni opravil v izbrani skupini.` in dovoljuje izbiro druge skupine ali `all`. | Preveri prazen odziv ter skupino brez opravil v sicer nepraznem odzivu. |
| R12 | Podatkovni roki so veljavni `YYYY-MM-DD` (tudi veljavni prestopni datumi). Pregled ne pošilja zapisov; podatkovna polja opravil in njihove bralne podrobnosti ostanejo nespremenjene. Ohrani se prilagodljivi Folio. | Uporabi veljavne datume in preveri bralne podrobnosti/API brez zapisov; pri 390 px preveri širino strani in notranje drsenje pogledov. |

Vmesnik dodatno ohrani dogovorjene oznake: pet številskih števcev ima
`aria-label="Število rokov <ključ>"` in vsebujejo samo številsko vrednost;
skupine so poimenovane `Zapadlo`,
`Danes`, `Naslednjih 7 dni`, `Pozneje` in `Končano`. Na vrsticah in karticah
ostane `data-task-id`; ohranijo se dostopna imena obstoječih pogledov in
stolpcev ter `aria-label="Pregled stanj opravil"`. Morebitna nova dejanja ob
opravilu so zunaj njegove povezave. Pri 390 px se celotna stran ne razširi;
preglednica in tabla se lahko pomikata znotraj svojega prikaza.

Podatkovni primeri lahko vsebujejo 0, 1 ali več kot 10 opravil, enake
naslove, različne enkratne ID-je, poljuben izvorni vrstni red in običajno
besedilo z Unicode znaki ter ločili. Obseg zahtev ne predpostavlja konkretnih
ID-jev ali naslovov iz začetnih podatkov. Razvojni testni mehanizem je samo
vir nadzorovanih GET odgovorov za teste; aplikacija uporablja obstoječi `/api/`
in ne dodaja zapisovalnih zahtev.

## Uporabniški scenariji in uspeh

1. **Pregled vseh rokov:** uporabnik odpre projekt in vidi referenčni datum,
   vseh pet nefiltriranih števil ter vsa opravila po pravilih za skupine.
2. **Zoženje in preračun:** uporabnik izbere skupino, spremeni datum in
   opazuje takoj posodobljene vrstice/števce; pri praznem polju vidi opozorilo
   in zadnji veljavni prikaz.
3. **Delo v obeh pogledih:** uporabnik preklaplja med preglednico in tablo;
   filtrirani ID-ji, njihov vrstni red in stanje filtra ostanejo enaki.
4. **Ponovni začetek:** po menjavi projekta ali osvežitvi sta datum in
   skupina privzeta; filter ni obnovljen iz URL-ja ali trajne shrambe.
5. **Prazni podatki:** prazen projekt kaže ničle; prazna skupina v
   nepraznem projektu pojasni, da v njej ni opravil, in omogoča drugo izbiro.

Funkcionalni uspeh pomeni izpolnitev vseh sprejemnih pogojev R01–R12 in
dogovora o vmesniku. Specifikacija ne določa novih meritev učinkovitosti ali
zunanjih odvisnosti.

## Izvedba in sledljivost

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | Začetna prehoda stanja zgoraj. | Projekt se začne ob datumu naprave, ki ni `2026-09-21`. | Predvideno: lokalno stanje projekta v `src/App.tsx`. | Ni preverjeno v tem koraku. |
| R02 | Prvo pravilo `bucket(t,D)`. | Opravilo `done` z rokom pred, na in po `D`. | Predvideno: izračun skupine v `src/`. | Ni preverjeno v tem koraku. |
| R03 | Drugo in tretje pravilo `bucket(t,D)`. | Odprti opravili z rokom `D-1` in `D`. | Predvideno: izračun skupine v `src/`. | Ni preverjeno v tem koraku. |
| R04 | Četrto in peto pravilo `bucket(t,D)` ter disjunktnost/izčrpnost. | Odprti roki `D+1`, `D+7` in `D+8`; primerjaj vse ID-je. | Predvideno: izračun skupine v `src/`. | Ni preverjeno v tem koraku. |
| R05 | Koledarska definicija `day` in `D+7`. | Mesec/leto, prestopni februar in časovni pas/DST. | Predvideno: datumski izračun v `src/`. | Ni preverjeno v tem koraku. |
| R06 | Definicija `count(k)` iz celotnega `T`. | Primerjaj vseh pet števil pri `F=all` in pri izbranih skupinah. | Predvideno: števci pogleda projekta v `src/App.tsx`. | Ni preverjeno v tem koraku. |
| R07 | Definicija `visible(T,D,F)`; izvorni vrstni red. | Izberi vsako možnost in primerjaj vrstni red ID-jev ter polja opravila. | Predvideno: izbirnik in projekcija seznama v `src/App.tsx`. | Ni preverjeno v tem koraku. |
| R08 | Prehodi za veljaven in prazen vnos v tabeli zgoraj. | Spremeni datum pri izbrani skupini, izprazni in ponovno izpolni polje. | Predvideno: stanje datuma in opozorilo v `src/App.tsx`. | Ni preverjeno v tem koraku. |
| R09 | Prehod ob menjavi `V`; isti `visible` ID-ji. | Primerjaj urejene `data-task-id` v preglednici in tabli pred/po preklopu. | Predvideno: `src/App.tsx` in `src/TaskBoard.tsx`. | Ni preverjeno v tem koraku. |
| R10 | Prehod ob projektu/osvežitvi; `D` in `F` se ne shranjujeta. | Spremeni datum/skupino, zamenjaj projekt in osveži; preveri URL/shrambo. | Predvideno: lokalno stanje v `src/App.tsx`; brez nove trajne shrambe. | Ni preverjeno v tem koraku. |
| R11 | Pravilo praznega projekta in prazne skupine. | Prazen API-odziv ter prazna skupina v nepraznem odzivu. | Predvideno: prazna stanja v `src/App.tsx` in `src/TaskBoard.tsx`. | Ni preverjeno v tem koraku. |
| R12 | Brez zapisovalnih zahtev; nespremenjene lastnosti opravil; Folio odziven. | Bralne podrobnosti, API brez zapisov, stran pri 390 px. | Predvideno: `src/`; lastni scenariji v `tests/agent/`. | Ni preverjeno v tem koraku. |

To je specifikacija pred izvedbo. Noben test P08 ni bil izveden v tem koraku;
konkretne datoteke kode, imena testov, rezultati in dokazila se dopolnijo po
dejanski implementaciji in preverjanju. Skupni testi izhodišča sami po sebi
ne dokazujejo zahtev P08.

## Odprta vprašanja in omejitve

Zahteve določajo privzeti datum, meje skupin, prazno opozorilo, prazno skupino,
stanje ob menjavi projekta/osvežitvi, hranjenje filtra ter odzivni prikaz;
dodatna uporabniška odločitev ni potrebna. Za nedoločeno besedilo kontrol,
njihovo razporeditev in vizualne detajle velja potrjeni dizajn Folio ter
obstoječi slog aplikacije. Končni testi niso dostopni v tem koraku in se ne
štejejo kot izvedeni.
