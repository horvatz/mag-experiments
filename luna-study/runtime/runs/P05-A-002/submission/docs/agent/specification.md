# Specifikacija P05: straničenje in filter stanja

## Problem in kontekst

Folio trenutno prikaže vsa opravila projekta v izbranem pogledu. Pri dolgih
seznamih uporabnik potrebuje lokalni filter po stanju in straničenje. Projekt,
opravila ter podrobnosti se še naprej berejo prek obstoječega javnega API-ja;
nova stanja filtra in strani ostanejo v pomnilniku trenutnega projekta.

## Vhodi, dejanja in izidi

Vhod je urejeno polje opravil trenutnega projekta z `id` in `status`
(`todo`, `in_progress`, `done`). Uporabnik izbere velikost `all`, `2`, `5` ali
`10`, filter `all`, `todo`, `in_progress` ali `done`, navigira na prvo,
prejšnjo, naslednjo ali zadnjo stran ter preklaplja preglednico/tablo in
podrobnosti opravila. Filtriranje ohrani izvorni vrstni red; najprej nastane
filtrirano polje, nato njegov odsek za trenutno stran.

Ob uspešnem dejanju velikost/filter se stran nastavi na 1; navigacija spremeni
jo samo na veljavno stran. Pogled in podrobnosti ne spreminjajo strani, velikosti
ali filtra. Menjava projekta ali ponovna naložitev strani ponastavi vse tri na
`all`, `all`, 1. Napake pri nalaganju ohranijo obstoječi prikaz napake in
ponovnega poskusa. Straničenje je samo prikazno in ne pošilja sprememb API-ju.

## Zahteve in pravila

Naj bo `T` izvorno polje projekta, `f` izbrani filter, `S = [t ∈ T | f = all
ali t.status = f]`, `s` velikost strani, `p` številka strani z začetkom pri 1,
`Y = 0`, ko je `|S| = 0`, sicer `ceil(|S| / s)` za številski `s` in 1 za
`all`. `p` je 1 ob praznem rezultatu, sicer omejen na `[1,Y]`. `V` je celotno
`S`, če je `s=all`, sicer odsek `S[(p−1)s : min(ps,|S|)]`. Ti predikati so
splošna pravila, ne vezani na začetne podatke.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Začetno `s=f=all`, `p=1`; `V=T` v istem vrstnem redu. | Razvojni testi ter lastni začetni prikaz. |
| R02 | Za `s ∈ {2,5,10}` so strani zaporedni disjunktni odseki `S`, katerih unija je `S`. | Test strani 2; ročna oziroma lastna pokritost drugih velikosti/robov. |
| R03 | Navigacija nastavi `p` na ustrezni rob ali `p±1`; gumb onemogočen zunaj dovoljenega območja. | Razvojni testi navigacije in preverjanje robov. |
| R04 | Sprememba `s` nastavi `p=1`; `all` pomeni eno stran, kadar `S` ni prazen. | Razvojni testi spremembe velikosti. |
| R05 | Filtriranje pred odsekom; sprememba `f` nastavi `p=1` in ohrani vrstni red. | Razvojni testi filtra. |
| R06 | ID-ji tabele in združenih stolpcev table so natanko ID-ji v `V`. | Razvojni testi obeh pogledov. |
| R07 | Sprememba pogleda in odpiranje/zapiranje podrobnosti ohranita `s,f,p`. | Razvojni testi pogleda in podrobnosti. |
| R08 | Menjava projekta in osvežitev začneta pri `all,all,1`; ne zapisuj v URL/trajno shrambo. | Razvojni testi projekta; statični pregled stanja. |
| R09 | `|S|>0`: status ima `Stran p od Y` in `Prikazano A–B od |S|.`; A/B sta indeksa z 1. | Razvojni testi statusa. |
| R10 | `|S|=0`: `Stran 0 od 0`, `Prikazano 0–0 od 0.` in vsi navigacijski gumbi onemogočeni; odstranitev filtra začne pri 1. | Razvojni testi praznih podatkov/filtra. |
| R11 | Pregled stanj uporablja `T`; števec projekta ostane `|T|`; števci stolpcev table uporabljajo `V`. | Razvojni testi števcev. |
| R12 | Straničenje ne spremeni opravila in ne pošlje zapisovalne zahteve; obstoječi podatkovni in odzivni prikazi ostanejo delujoči. | Izhodiščni API/UI testi in statični pregled klicev. |

## Izvedba in sledljivost

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | `s=f=all`, `p=1`, vsi ID-ji v izvornem vrstnem redu. | Agent: `first, previous, 10 and all page boundaries` (začetno stanje). | [App.tsx](../../src/App.tsx): lokalni `useState` in `ProjectView`. | Uspešno; polni `npm run check`, 52 testov. |
| R02 | Velikosti 2/5/10 ustvarijo disjunktne dele brez izgub. | D01, D02; Agent: `first, previous, 10 and all page boundaries`; `size 10 paginates arbitrary lists larger than ten`. | [App.tsx](../../src/App.tsx): izračun `visibleTasks`; [TaskBoard.tsx](../../src/TaskBoard.tsx): skupine trenutnega odseka. | Uspešno; polni `npm run check`, 52 testov, tudi 13 opravil. |
| R03 | Prva/prejšnja/naslednja/zadnja stran in robni gumbi. | D02; Agent: `first, previous, 10 and all page boundaries`. | [App.tsx](../../src/App.tsx): štirje navigacijski gumbi. | Uspešno; robovi in onemogočeni gumbi preverjeni. |
| R04 | Sprememba velikosti vrne na stran 1; `all` ima največ eno stran. | D04; Agent: `first, previous, 10 and all page boundaries`. | [App.tsx](../../src/App.tsx): `pageCount`, izbirnik velikosti. | Uspešno; polni `npm run check`, 52 testov. |
| R05 | Filter pred straničenjem; sprememba filtra vrne na stran 1. | D03; Agent: `empty filter status and removing the filter returns to page one`. | [App.tsx](../../src/App.tsx): `filteredTasks` in izbirnik filtra. | Uspešno; ID-ji filtra in ponastavitev preverjeni. |
| R06 | Tabela in tabla uporabita iste ID-je `V`; tabla jih združi po stanju. | D03; Agent: `page state survives view and details...`, `project totals remain full...`. | [App.tsx](../../src/App.tsx): `visibleTasks` kot vhod obeh pogledov; [TaskBoard.tsx](../../src/TaskBoard.tsx): razvrstitev vidnega odseka. | Uspešno; ID-ji obeh pogledov preverjeni. |
| R07 | Pogled in modal ohranita stran, velikost in filter. | Izhodišče: direktne podrobnosti; Agent: `page state survives view and details...`. | [App.tsx](../../src/App.tsx): stanje v `ProjectView`; [TaskDetails.tsx](../../src/TaskDetails.tsx): odpiranje/zapiranje modala. | Uspešno; stran 2 ohranjena po Escape in preklopu pogleda. |
| R08 | Menjava projekta/osvežitev ponastavi `all,all,1`; brez URL/trajne shrambe. | Agent: `page state survives view and details...`. | [App.tsx](../../src/App.tsx): začetna lokalna stanja in `key={project.id}`. | Uspešno; menjava projekta in ponovni zagon preverjena. |
| R09 | Status izpiše pravilen X/Y in vključujoči obseg A–B. | D02; Agent: `first, previous, 10 and all page boundaries`. | [App.tsx](../../src/App.tsx): status straničenja in izračun obsega. | Uspešno; preverjena zadnja krajša stran in ena stran. |
| R10 | Prazen projekt/filter izpiše 0/0 in 0–0/0, gumbi onemogočeni. | Agent: `empty filter status...`; `empty project has a zero page status...`. | [App.tsx](../../src/App.tsx): prazno stanje, status in `disabled` pogoji. | Uspešno; odstranitev filtra vrne na prvo stran. |
| R11 | Pregled stanj in skupno število uporabita celoten projekt; števec table trenutno stran. | Agent: `project totals remain full while board columns count the current page`. | [App.tsx](../../src/App.tsx): `counts` in `count-badge`; [TaskBoard.tsx](../../src/TaskBoard.tsx): `entries.length`. | Uspešno; celotni števci 4/2/2 in števci strani 1/1/0. |
| R12 | Brez zapisov API; obstoječi podatkovni prikazi ostanejo delujoči. | D04; vsi izhodiščni API/UI testi in polni sklop. | [App.tsx](../../src/App.tsx): samo nalaganje opravil v `ProjectView`; stranjenje je lokalno. | Uspešno; D04 preveri brez zapisov, vseh 52 testov uspešnih. |

Zapis dopolnitve specifikacije: 27. 9. 2026 — po izvedbi so dodane dejanske
povezave testov, kode in dokazov. Sprejemna pravila R01–R12 niso bila
spremenjena.

## Odprta vprašanja in omejitve

Navodila določajo točno besedilo statusa in kontrol, ne pa njune vizualne
razporeditve. Kontrole bodo v slogu obstoječega Folio in prilagodljive pri
ozkem pogledu. Končni testi niso dostopni; njihovo pokritost bo mogoče potrditi
le dosegom opisanih scenarijev in izvedenih lokalnih testov.
