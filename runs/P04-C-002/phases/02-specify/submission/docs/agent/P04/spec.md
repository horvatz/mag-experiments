# P04 — Stabilno razvrščanje z dvema ključema

Različica 1.0, 2026-09-25. Postopek C, Spec Kit 1.0.8 / Lean 1.0.0.

## Problem in kontekst

Uporabnik želi opravila trenutnega projekta pregledati po dveh izbranih ključih, pri tem pa ohraniti izvorni vrstni red izenačenih opravil in možnost vrnitve na prvotni prikaz. Izhodiščni Folio prikazuje prejeto polje v preglednici in ga za tablo razdeli po stanjih; omogoča menjavo projekta, pogleda in ogled podrobnosti. Dodamo lokalno razvrščanje ter štiri kontrole in gumb za ponastavitev.

Merilo so vse izvirne zahteve [R01–R12](../../../task/instructions.md), [projektna pravila](../../../PROJECT_RULES.md), [ustava](../../../.specify/memory/constitution.md) in [potrjeni dizajn](../../dizajn.md). Ta dokument izpolnjuje [skupno predlogo](../../../task/specification-template.md). Ne uvaja sprememb strežnika, infrastrukture, odvisnosti, skupnih tipov ali skupnih testov.

## Vhodi, dejanja in izidi

Vhod `A` je polje opravil iz obstoječega javnega `/api/` za trenutni projekt. Relevantna polja so `id`, `projectId`, `title`, `assignee`, `status`, `dueDate`; ostala polja, vključno z opisom, se ohranijo. ID-ji so enkratni, naslovi so lahko enaki, naslovi in imena so nizi z Unicode znaki in ločili, datum je veljaven koledarski datum `YYYY-MM-DD`, stanje je `todo`, `in_progress` ali `done`. Veljajo poljubno zaporedje, nič, eno ali več kot deset opravil in tudi oba prazna projekta. ID-ji in vsebina se ne smejo predpostavljati iz začetnih podatkov.

Kontrole so izvorni HTML `select` z dostopnimi imeni:

- **Primarni ključ**: `original`, `title`, `assignee`, `status`, `dueDate`.
- **Primarna smer**: `asc`, `desc`.
- **Sekundarni ključ**: `none`, `title`, `assignee`, `status`, `dueDate`.
- **Sekundarna smer**: `asc`, `desc`.
- Gumb **Izvorni vrstni red** ponastavi vse štiri vrednosti.

Izbira deluje neposredno, brez potrditvenega ali preklicnega koraka. Uspeh spremeni samo projekcijo opravil. Odpiranje in zapiranje podrobnosti ohrani vrstni red; preklic v smislu zapiranja podrobnosti ne spreminja nastavitev. Nalaganje, napake API-ja in ponovni poskus ohranijo obstoječe bralno delovanje; razvrščanje ne dodaja zahtev API-ja, novih napak shranjevanja ali testnih kontrol v aplikacijo. Manjkajoči datumi niso del zahtevane vhodne domene.

### Pravila stanja

Naj bo `S = (p, dp, s, ds)` stanje štirih kontrol in `D = (original, asc, none, asc)` privzeto stanje. `P` označuje trenutni projekt, `V` pogled in `T` odprte podrobnosti.

| Dogodek | Stanje po dogodku |
| --- | --- |
| Začetni prikaz ali osvežitev strani | `S' = D` |
| Izbira ene kontrole | Spremeni samo ustrezno komponento `S`; ostale tri ostanejo enake |
| Preglednica ↔ Tabla | `S' = S`; spremeni se `V` |
| Odpiranje/zapiranje podrobnosti | `S' = S`; spremeni se `T` |
| Menjava projekta `P' ≠ P` | `S' = D` |
| Gumb Izvorni vrstni red | `S' = D` |

Nastavitve niso shranjene v URL-ju, lokalni ali drugi trajni shrambi. `p = original` vedno povzroči izvorni prikaz, ne glede na preostale kontrole; samo ta izbira ni enaka gumbu za ponastavitev vseh kontrol.

## Zahteve in pravila

### Predikati razvrščanja

Za niz `x` naj bo `N(x)` zaporedje operacij: Unicode NFD, odstranitev vseh znakov U+0300–U+036F, pretvorba v male črke. `cmp(x,y)` vrne `-1`, `0` ali `1` z uporabo `<` in `>` po UTF-16. Ne uporablja jezikovne primerjave ali številčnega razvrščanja delov nizov.

`c_title(a,b) = cmp(N(a.title), N(b.title))` in analogno za `assignee`. Za `status` uporabimo vrednosti `todo → 0`, `in_progress → 1`, `done → 2`. Za `dueDate` primerjamo kronološki datum; pri veljavnem fiksnem zapisu `YYYY-MM-DD` to ustreza primerjavi nizov. Sekundarni ključi uporabljajo iste primerjave.

Naj bo `d(asc)=1`, `d(desc)=-1`, `i(a)` pa indeks opravila v prejetem polju `A`. Primerjava za projekcijo `B`:

1. Če `p = original`, je `B` v enakem vrstnem redu kot `A`.
2. Sicer izračunamo `q = d(dp) × c_p(a,b)`; če `q ≠ 0`, odloča `q`.
3. Če je `q = 0` in `s ≠ none`, izračunamo `r = d(ds) × c_s(a,b)`; če `r ≠ 0`, odloča `r`.
4. V vseh preostalih primerih odloča `i(a) - i(b)` brez obračanja s smerjo.

S tem velja stabilnost: `c_p(a,b)=0 ∧ (s=none ∨ c_s(a,b)=0) ∧ i(a)<i(b) ⇒ index_B(a)<index_B(b)`. Če sta ključa enaka, sekundarna smer ne spremeni vrstnega reda. Celotnega polja zaradi smeri nikoli ne obrnemo.

Za vsak vhodni ID velja `count_B(id)=count_A(id)=1`, `length(B)=length(A)` in polja opravil ostanejo enaka. Vhodno polje `A` ohrani vrednosti in vrstni red. Za stolpec stanja `k` velja `board(k)=filter(B, status=k)`; stolpci vedno sledijo `todo`, `in_progress`, `done`. Sprememba `S` povzroči nič zapisovalnih zahtev API-ja in ne spremeni skupnih števil.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Ob začetku `S=D`; prikazani ID-ji imajo zaporedje prejetega polja. | S1: neurejen vhod in pregled vrednosti kontrol ter ID-jev. |
| R02 | `title` in `assignee` uporabljata natančno `N` in primerjavo UTF-16. | S2: sestavljeni/razstavljeni naglasi, velikost črk, ločila in npr. `Naloga 10` pred `Naloga 2`; oba ključa. |
| R03 | Stanja so `todo < in_progress < done`; datumi so kronološki. | S2: premešana stanja in datumi prek mesecev in let, obe smeri. |
| R04 | Smer obrne samo primerjavo ključa; izenačeni elementi ohranijo relativni vrstni red. | S2/S3: asc in desc z več izenačenimi opravili. |
| R05 | Sekundarni ključ deluje samo ob enakem primarnem; smeri sta neodvisni, `none` ne primerja. | S3: vsi sekundarni ključi, skupine primarnih izenačenj in kombinacije smeri. |
| R06 | Izenačenje obeh ključev ostane stabilno; isti ključ je dovoljen; `original` prezre druge kontrole. | S3: nasprotni smeri istega ključa, popolna izenačenja, `original` ob neprivzetih kontrolah. |
| R07 | Tabla ohrani tri stolpce in relativni vrstni red filtrirane skupne projekcije. | S4: primerjava ID-jev preglednice z vsakim stolpcem pri več kombinacijah. |
| R08 | Pogled in podrobnosti ohranijo vse štiri nastavitve ter vrstni red. | S4: preglednica → tabla → podrobnosti → zapiranje → preglednica. |
| R09 | Menjava projekta in osvežitev nastavita `D`; ni trajnega zapisa ali parametrov razvrščanja v URL-ju. | S5: menjava obeh projektov, vrnitev in osvežitev ob neprivzetem stanju. |
| R10 | Gumb nastavi `D`; prazno polje in eno opravilo delujeta za vse ključe in smeri. | S5/S6: vse štiri kontrole, vseh 100 kombinacij na nič in enem opravilu. |
| R11 | Projekcija ohrani vhod, vse podatke, pripadnost in števila; ne zapisuje API-ja. | S3/S6: preverjanje nespremenjenega vhoda in vsebine ter spremljanje omrežnih zapisov. |
| R12 | Vsak ID je v aktivnem prikazu natanko enkrat in odpira svoje podrobnosti tudi ob enakih naslovih; bralne funkcije in Folio ostanejo. | S4/S6: dvojniki naslovov, drugačni ID-ji, več kot deset opravil, skupni regresijski testi in širina 390 pik. |

### Uporabniški scenariji in merila uspeha

- **S1 — Začetek:** uporabnik odpre projekt z neurejenim poljem; vidi izvorno zaporedje in `D`.
- **S2 — En ključ:** izbira naslov, osebo, stanje ali rok v obeh smereh; rezultat sledi pravilom, izenačenja ostanejo stabilna. Primeri nizov so ilustracije; pravilo velja za celotno vhodno domeno.
- **S3 — Dva ključa:** uporabnik uredi izenačenja po drugem ključu z lastno smerjo; preveri `none`, isti ključ, popolna izenačenja in `original`. Vhodni podatki ostanejo nespremenjeni.
- **S4 — Isti podatki v pogledih:** uporabnik menja pogled in odpira podrobnosti tudi med enakimi naslovi; ohrani nastavitve, identiteto in pravilni vrstni red v stolpcih.
- **S5 — Ponastavitve:** uporabnik pritisne gumb, zamenja projekt ali osveži stran; vsak ustrezni dogodek vrne `D`.
- **S6 — Robni in regresijski primeri:** nič, eno in več kot deset opravil, Unicode/ločila, poljubni ID-ji, dolgi naslovi, prazen projekt, napaka/ponovni poskus in prikaz pri 390 pikah delujejo v zahtevanem obsegu.

Uspeh pomeni izpolnitev vseh R01–R12 z določljivimi rezultati preverjanj. Ohranijo se `data-task-id` na vrsticah/karticah, dostopna imena pogledov in stolpcev ter `aria-label="Pregled stanj opravil"`. Nova dejanja ob opravilu so zunaj povezave opravila. Pri 390 pikah ni vodoravne razširitve celotne strani; notranje drsenje preglednice in table je dovoljeno. Nove kontrole uporabljajo obstoječi vizualni jezik Folio in vidni fokus. Razporeditev kontrol in nenaročeno besedilo sta izvedbeni izbiri, ne novi funkcionalni zahtevi.

## Izvedba in sledljivost

To je specifikacijska faza: spodnje lokacije so mesta predvidene integracije, ne trditev o izvedbi. Po implementaciji se dopolnijo z dejanskimi deli kode, imeni testov in povezavami na dnevnike. Splošni sprejemni pogoji so v tabeli zgoraj.

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | Privzeto stanje in izvorni prikaz | S1 | `src/App.tsx`, ProjectView — predvideno | Ni izvedeno |
| R02 | Normalizacija in UTF-16 | S2 | Primerjalnik v `src/` — določi načrt | Ni izvedeno |
| R03 | Stanja in datumi | S2 | Primerjalnik v `src/` — določi načrt | Ni izvedeno |
| R04 | Neodvisen obrat primerjave | S2/S3 | Primerjalnik v `src/` — določi načrt | Ni izvedeno |
| R05 | Sekundarna primerjava | S3 | Primerjalnik in ProjectView — predvideno | Ni izvedeno |
| R06 | Stabilnost in original | S3 | Primerjalnik v `src/` — določi načrt | Ni izvedeno |
| R07 | Filtrirana projekcija table | S4 | `src/App.tsx`, `src/TaskBoard.tsx` — predvideno | Ni izvedeno |
| R08 | Ohranitev nastavitev | S4 | `src/App.tsx`, ProjectView — predvideno | Ni izvedeno |
| R09 | Menjava projekta/osvežitev | S5 | `src/App.tsx`, App/ProjectView — predvideno | Ni izvedeno |
| R10 | Gumb in robni polji | S5/S6 | ProjectView in primerjalnik — predvideno | Ni izvedeno |
| R11 | Nespremenljivost podatkov | S3/S6 | Projekcija v `src/` — določi načrt | Ni izvedeno |
| R12 | ID-ji, branje in Folio | S4/S6 | `src/App.tsx`, `src/TaskBoard.tsx`, `src/TaskDetails.tsx`, `src/styles.css` — predvideno | Ni izvedeno |

## Odprta vprašanja in omejitve

Bistvenih odprtih vprašanj ni; imenik `docs/agent/P04` je podal uporabnik. Veljavne datume in enkratne ID-je zagotavlja vhodna domena. Navigacije med nedokončanim nalaganjem in novih sočasnih sprememb podatkov ne širimo prek obstoječih regresijskih zahtev. Aplikacija ne uporablja `/__test/`, testnih pripomočkov ali novih zapisovalnih API-jev.

V tej fazi niso izvedeni implementacija, razvojni testi, skupni testi ali vizualno preverjanje. Končni testi niso dostopni in ne bodo navedeni kot opravljeni. Lokalno sta pregledana izhodiščni `src/App.tsx` in dizajn; nadaljnjo tehnično razčlenitev vsebuje načrt v naslednji fazi.

## Zgodovina sprememb

- 2026-09-25, 1.0: začetna specifikacija vseh R01–R12, pravila projekcije in sprememb stanja, scenariji in začetna sledljivost; brez sprememb implementacije.
