# P04 — Stabilno razvrščanje z dvema ključema

## Problem in kontekst

Uporabnik želi opravila trenutnega projekta razvrščati po dveh ključih v preglednici in tabli ob ohranitvi videza Folio. Razvrščanje je lokalna projekcija podatkov javnega API-ja in ne zapisuje podatkov. Začetni zapis po branju pravil in predloge; konkretne povezave na kodo in preverjalne scenarije bodo dopolnjene po branju izhodišča.

## Vhodi, dejanja in izidi

Vhod je prejeto polje opravil z enkratnimi ID-ji; naslovi in odgovorne osebe so nizi, datumi so veljavni YYYY-MM-DD. Število opravil je poljubno, tudi 0 ali 1. Kontrole so štirje HTML selecti: Primarni ključ (original/title/assignee/status/dueDate), Primarna smer (asc/desc), Sekundarni ključ (none/title/assignee/status/dueDate), Sekundarna smer (asc/desc), ter gumb Izvorni vrstni red. Privzeto stanje je (original, asc, none, asc).

## Zahteve in pravila

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Privzete štiri vrednosti in vrstni red prejetega polja. | Začetno nalaganje projekta. |
| R02 | title/assignee: NFD, odstranitev U+0300–U+036F, male črke, primerjava UTF-16 z < in >. | Unicode, enakovredne normalizacije, številke v besedilu. |
| R03 | status: todo < in_progress < done; dueDate kronološko. | Vsi statusi in različni veljavni datumi. |
| R04 | desc obrne le primerjavo ključa; izenačeni elementi ostanejo stabilni. | Enakosti v obeh smereh. |
| R05 | Sekundarni ključ deluje le ob enakem primarnem; smer je neodvisna. | Kombinacije ključev in smeri. |
| R06 | Ob popolni enakosti ohrani izvorni vrstni red; enaka ključa sta dovoljena; original vedno prevlada. | Enaka ključa, none, original z različnimi ostalimi kontrolami. |
| R07 | Stolpci table ostanejo stalni; njihove kartice sledijo relativnemu vrstnemu redu razvrščene preglednice. | Primerjava ID-jev med pogledoma. |
| R08 | Preklop pogleda ter odpiranje/zapiranje podrobnosti ohranita nastavitve in vrstni red. | Navigacija z aktivnim razvrščanjem. |
| R09 | Menjava projekta in osvežitev ponastavita vse kontrole; brez trajne shrambe ali URL-ja. | Menjava projekta, osvežitev. |
| R10 | Izvorni vrstni red ponastavi vse kontrole; 0/1 opravil podpira vse ključe/smeri. | Ponastavitev in robna projekta. |
| R11 | Projekcija ne spreminja podatkov, izvornega polja, pripadnosti ali skupnih števil in ne zapisuje na API. | Primerjava podatkov in opazovanje zahtev. |
| R12 | Vsak ID natanko enkrat in prave podrobnosti tudi pri enakih naslovih; ohranjene bralne funkcije in odzivni Folio. | ID-ji, navigacija, regresija, širina 390 px. |

## Izvedba in sledljivost

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01–R12 | Zgornji sprejemni pogoji. | Dopolnitev po branju kode in obstoječih testov. | Še ni pregledano. | Testi niso izvedeni; ta vloga pripravi specifikacijo. |

## Odprta vprašanja in omejitve

Izvirna navodila so obvezna tudi ob izpustitvi v tem dokumentu. Specifikator piše samo to datoteko in specification-history.md; implementer izvede spremembe in preverjanja, pregledovalec poda neodvisen pregled. Infrastruktura, shared/, server/, odvisnosti in skupni testi ostanejo nespremenjeni. Aplikacija uporablja samo /api/; ne uporablja /__test/, testnih pripomočkov ali lokalnega nadomestka podatkov. Zagon aplikacije, testi in pregled videza niso naloga specifikatorja.
