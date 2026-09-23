# P08 — Koledarski pregled rokov

**Stanje:** implementirano in preverjeno; podrobni izidi v [dokazilih](../verification.md).  
**Datum:** 2026-09-23. **Različica:** 1.1.

## Problem in kontekst

Uporabnik želi opravila trenutnega projekta pregledovati glede na koledarski rok in izbrani referenčni datum. Folio trenutno bere projekte in opravila iz javnega API-ja ter prikazuje preglednico, tablo s stolpci po stanju, števce stanj in bralne podrobnosti. Dodamo pet skupin rokov, njihove števce in filter, ki enako določa vidna opravila v obeh pogledih.

Merilo ostaja vseh R01–R12 iz [izvirnih navodil](../../../task/instructions.md), [projektna pravila](../../../PROJECT_RULES.md), [potrjeni dizajn](../../dizajn.md) in [ustava](../../../.specify/memory/constitution.md). Ta dokument izpolnjuje [skupno predlogo](../../../task/specification-template.md); izvedbene povezave in dejanska dokazila se dopolnijo v naslednjih korakih.

## Vhodi, dejanja in izidi

- Vhod je urejeno zaporedje opravil `T` trenutnega projekta iz obstoječega `/api/`. Vsako opravilo ima enkraten `id`, `projectId`, `status` (`todo`, `in_progress`, `done`), veljaven koledarski `dueDate` v obliki `YYYY-MM-DD` ter obstoječa besedilna polja. Naslovi niso identifikatorji. Podprti so prazni projekti, eno ali več kot deset opravil, različna zaporedja, ponovljeni naslovi, Unicode in ločila.
- Uporabnik spreminja polje `input type=date` z oznako **Referenčni datum** in HTML `select` z oznako **Pogled rokov**. Vrednosti izbirnika so `all`, `overdue`, `today`, `week`, `later`, `done`. Imena skupin so **Zapadlo**, **Danes**, **Naslednjih 7 dni**, **Pozneje**, **Končano**; za `all` uporabimo **Vsa opravila**.
- Izbor in veljaven datum takoj posodobita prikaz. Posebnega potrjevanja ali preklica ni; zaprtje datumskega izbirnika brez spremembe pusti stanje nespremenjeno.
- Prazno polje sproži `role=alert` z besedilom **Vnesi veljaven referenčni datum.** Izračun ostane vezan na zadnji veljaven datum. Ponovni veljaven vnos odstrani opozorilo.
- Preklop Preglednica/Tabla ohrani stanje filtrov in vsebino datumskega polja. Menjava projekta in osvežitev strani stanje ponastavita.
- Bralne podrobnosti, nalaganje, napake API-ja in obstoječi ponovni poskus ostanejo po izhodišču. Pregled rokov ne spreminja opravil in ne pošilja zapisovalnih zahtev.

## Zahteve in pravila

### Predikati razvrščanja

Naj bo `r` zadnji veljavni referenčni datum, `d(t)` koledarski rok opravila, `D(x)` pa zaporedna številka koledarskega dne v gregorijanskem koledarju. `D` ni lokalni časovni žig; prehod na poletni čas in časovni pas ne smeta vplivati na razliko dni. `open(t) ≡ t.status ≠ done` in `Δ(t,r) = D(d(t)) − D(r)`.

```
G(t,r) = done     če t.status = done
         overdue  če open(t) ∧ Δ(t,r) < 0
         today    če open(t) ∧ Δ(t,r) = 0
         week     če open(t) ∧ 1 ≤ Δ(t,r) ≤ 7
         later    če open(t) ∧ Δ(t,r) > 7
```

Za vsak veljaven vhod velja natanko ena veja. Za `K = {overdue,today,week,later,done}` je `C(k,T,r) = |{t ∈ T : G(t,r)=k}|` in `Σ C(k,T,r) = |T|`. Števci ne vsebujejo pogoja izbranega filtra `f`.

Vidno zaporedje `V(T,r,f)` je `T`, če `f=all`, sicer stabilno filtrirano zaporedje vseh `t ∈ T`, za katere velja `G(t,r)=f`. Preglednica ohrani vrstni red `V`; tabla ohrani svoje stolpce stanj in znotraj vsakega stolpca vrstni red pripadajočih opravil iz `V`. Množici vidnih ID-jev obeh pogledov sta enaki.

### Pravila sprememb stanja

Stanje pregleda označimo `(x,r,f)`, kjer je `x` trenutna vsebina datumskega polja, `r` zadnji veljaven datum in `f` izbrana skupina. `r₀ = 2026-09-21`.

| Dogodek | Novo stanje in izid |
| --- | --- |
| Začetek projekta, menjava projekta, osvežitev | `(r₀,r₀,all)`; brez opozorila, neodvisno od ure naprave in prejšnjih izborov. |
| Vnos veljavnega datuma `v` | `(v,v,f)`; takojšen preračun `C` in `V`; brez opozorila. |
| Izpraznitev datuma | `('',r,f)`; opozorilo; `C` in `V` še vedno uporabljata `r`. |
| Izbira skupine `g` | `(x,r,g)`; spremeni samo `V`, števci `C` ostanejo enaki. |
| Preklop preglednica/tabla | `(x,r,f)` ostane enako, tudi pri praznem polju in opozorilu. |

Noben od dogodkov ne spremeni `T`, rokov ali stanj opravil in ne shrani filtrov v URL ali trajno shrambo. Za datum uporabljamo koledarska pravila, vključno s prestopnim februarjem ter mejami meseca in leta; začetni datum ni današnji sistemski datum.

### Sprejemni pogoji

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Vsak začetek projekta ima datum `2026-09-21` in `all`, ne glede na uro naprave. | S1: začetno stanje pri drugačni sistemski uri. |
| R02 | `done` ima prednost pred vsakim rokom; zaključeno opravilo šteje samo v `done`. | S2: zaključena opravila pred, na in po referenci. |
| R03 | Odprti roki pred `r` so `overdue`, na `r` pa `today`. | S2: meja −1/0 dni in oba odprta statusa. |
| R04 | Odprti roki +1 do +7 vključujoče so `week`, +8 in pozneje `later`; skupine tvorijo particijo. | S2: meje +1/+7/+8, enkratna pripadnost vseh ID-jev in vsota števcev. |
| R05 | Razvrščanje uporablja koledarske dni neodvisno od pasu/DST, tudi čez mesec, leto in prestopni februar. | S3: robni koledarski datumi in različni časovni pasovi. |
| R06 | Pet števcev za `K` šteje ves projekt; vsak ima `aria-label="Število rokov <ključ>"` in samo številsko vsebino. Filter jih ne spremeni. | S2/S4: pričakovani števci pred in po izborih. |
| R07 | Izbirnik ima šest dogovorjenih vrednosti; vsaka izbere `V` brez sprememb podatkov in z ohranjenim izvornim vrstnim redom. | S4: vse vrednosti, preurejeni podatki in ponovljeni naslovi; primerjava ID-jev. |
| R08 | Veljaven datum preračuna ob ohranjenem filtru; prazno polje opozori in zadrži izračun; popravek opozorilo odstrani. | S5: veljaven → prazen → veljaven datum ob aktivnem filtru. |
| R09 | Oba pogleda kažeta iste filtrirane ID-je; preklop ohrani `x`, `r` in `f`. | S5/S6: preklopi pri veljavnem in praznem polju, primerjava ID-jev. |
| R10 | Menjava projekta in osvežitev ponastavita `(x,r,f)`; filtrskih podatkov ni v URL ali trajni shrambi. | S6: projekt A → B → A in osvežitev po spremembah; pregled URL in shrambe. |
| R11 | Prazen projekt ima pet ničel. Neprazen projekt s prazno skupino prikaže **Ni opravil v izbrani skupini.** in ohrani možnost izbire skupine ali `all`. | S7: prazna projekta ter prazna skupina v nepraznem projektu v obeh pogledih. |
| R12 | Veljavni datumi, vključno s prestopnimi, delujejo; pregled nima zapisov na API; obstoječa polja, bralne podrobnosti in prilagodljivi Folio so ohranjeni. | S3/S8: opazovanje zahtev, regresijski testi, prikaz pri 390 pik in pregled podrobnosti. |

Ohranijo se `data-task-id` na vrsticah/karticah, dostopna imena pogledov in stolpcev ter `aria-label="Pregled stanj opravil"`. Morebitna nova dejanja ob opravilu sodijo zunaj njegove povezave. Pri 390 pik širine se cela stran ne razširi; preglednica in tabla se lahko pomikata znotraj prikaza. Uporabijo se obstoječi gradniki in slogovne spremenljivke Folio, vidni fokus ter slovenska besedila.

## Uporabniški scenariji in merilo uspeha

1. **Orientacija v projektu (S1–S4):** uporabnik odpre projekt, vidi vseh pet pravilnih števcev in vsa opravila; nato izbere vsako skupino. Mejni roki in zaključena opravila se razvrstijo po zgornjih predikatih.
2. **Druga referenca (S3, S5):** uporabnik ob aktivnem filtru spremeni datum, ga izbriše in nato popravi. Rezultati, opozorilo in ohranjen izbor sledijo tabeli sprememb stanja, tudi čez koledarske meje.
3. **Pogledi in projekti (S6):** uporabnik preklaplja med preglednico in tablo, zamenja projekt ter osveži stran. Pogled ohrani stanje, projekt in osvežitev ga ponastavita.
4. **Prazni rezultati in obstoječi Folio (S7–S8):** uporabnik vidi prazno skupino ali projekt, lahko zamenja filter ter še naprej odpre bralne podrobnosti. Vmesnik ostaja uporaben pri 390 pik, brez zapisov na API.

Uspeh pomeni izpolnitev vseh R01–R12 in ohranitev obstoječih regresijskih zahtev. Razvojni primeri niso celotna domena; nobena zunanja meritev ali dodatna funkcionalnost ni merilo.

## Izvedba in sledljivost

Celotna matrika vseh R01–R12 s pogoji, dejanskimi testi, deli kode in izidi je v [osrednjem dokazilu](../verification.md#sledljivost-r01r12). Rezultati: lint, tipi in gradnja uspešni; 53/53 testov (38 osnovnih, 8 razvojnih, 7 lastnih), ter uspešen ponovni A05 po popravku položaja zajema zaslona. Dnevniki in vizualni dokazi so povezani v istem dokumentu.

## Odprta vprašanja in omejitve

- Ni bistvenih odprtih vprašanj; pot funkcionalnosti je določil uporabnik. `all` je poimenovan Vsa opravila, ker besedilo ni predpisano.
- Podatkovni datumi so po pogodbi veljavni. Prazno datumsko polje ima izrecno predpisan odziv; novih zahtev za popravljanje neveljavnih strežniških podatkov ne dodajamo.
- Navigacije med nedokončanim nalaganjem in novih sočasnih sprememb ne širimo prek obstoječih regresijskih zahtev.
- Aplikacija uporablja samo javni API. Testni GET odzivi in `/__test/` so dovoljeni samo testnemu programu. Strežnik, skupni tipi, nastavitve, odvisnosti in skupni testi ostanejo nespremenjeni.
- Izvedeni testi in omejitve so v [dokazilih](../verification.md). Končni testi niso dostopni in niso označeni kot opravljeni. Znane neizpolnjene zahteve niso ugotovljene.

## Zgodovina sprememb

- 2026-09-23, 1.0: začetna specifikacija vseh R01–R12, koledarski predikati, prehodi stanja in začetna sledljivost po skupni predlogi.

- 2026-09-23, 1.1: izvedena funkcionalnost in preverjanja; matrika sledljivosti povezana z osrednjim `docs/agent/verification.md`, ki ga izrecno zahteva korak implementacije; funkcionalne zahteve nespremenjene.
