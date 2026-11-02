# Specifikacija: Vrstni red z razveljavitvami — Pilot P10

**Status:** Načrtovanje **Datum:** 2026-11-01

## Problem in kontekst

Aplikacija za upravljanje opravil (Folio) trenutno prikazuje opravila v fiksnem vrstnem redu, prejetem poljnim. Pilot P10 uvaja funkcionalnost za sprostno permutacijo opravil s podprto zgodovino razveljitev in ponovitev. Uporabniki morajo lahko premikajo opravila gor ali dol v globalnem vrstnem redu. Vsak veljaven premik se zapiše v zgodovino kot permutacija. Zgodovina omogoča razveljavi posamezen premik in ponovi vse razveljavljene korake. Aplikacija ostaja lokalna; podatki se ne shranjujejo trajno brez eksplicitne shranjevanja.

## Vhodi, dejanja in izidi

- **Podatkovni vhodi:** Poljubno število kartic z edinstvenimi ID-ji, naslovom, opisom, imenom, statusom in datumom.
- **Priznanje testnega mehanizma:** Razvojni testi vračajo nadzorovane GET odgovore preko `/__test/`, dostopne le za testske namene.
- **Dovoljena dejanja:** Premakni <id> gor, Premakni <id> dol, Razveljavi premik, Ponovi premik, Začetni vrstni red.
- **Pogoji uporabe:** Prvi ali zadnji element v vrstnem redu ne dovoljuje premika izven meja. Vsak veljaven premik doda prejšnjo celotno permutacijo v zgodovino razveljitev. Največ 20 prejšnjih permutacij se hrani za razveljavo; ob 21. veljavnem premiku se zavrže najstarejša. Nov veljaven premik po razveljavitvi zavrže vso zgodovino ponovitev. Neveljaven premik na robu zgodovine ponovitev ne zavrže. Gumb Začetni vrstni red vrne izvorno permutacijo kot eno novo razveljavljivo dejanje in počisti ponovitve. Če je vrstni red že izvoren, je gumb onemogočen in ne spreminja zgodovine.
- **Pričakovano stanje po uspehu:** Vsak veljaven premik spremeni vrstni red opravil, ne polj in statusa. Zgodovina razveljitev hrani najpozneje 20 prejšnjih permutacij. Števec prikaže Razveljavitve: U. Ponovitve: R. in je usklajen z gumbi, ki sta onemogočena pri ničli. Prazen projekt in projekt z enim opravilom ostaneta uporabna brez dovoljenega premika. Vse spremembe so lokalne permutacije iste množice ID-jev; ni zapisov na API ali sprememb polj. Štenci stanj in pravilne podrobnosti ostanejo enaki, prilagodljiv Folio je ohranjen.

## Zahteve in pravila

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Obratoma enačba: vrstni red = prejetem polju na začetku. Globalno mesto vsakega opravila je od 1 do N. Enaki naslovi se ne povezujejo. | Avtomatski testi z različnimi vsemi ID-ji v različnih zaporedjih. |
| R02 | Gumb Premakni <id> gor zamenja z neposrednim globalnim predhodnikom; dol z naslednikom. Polja in status ostajajo nespremenjeni. | Simulacijski test vmesnika s spremljanjem vrstnega reda ID-jev. |
| R03 | Prvi ali zadnji element v vrstnem redu ne dovoljuje premika izven meja. Neveljavnost ali ponovljeno robno dejanje ne spremeni vrstnega reda in ne doda zgodovine. | Test robnih elementov z preverjanjem odsotnosti sprememb. |
| R04 | Vsak veljaven premik doda prejšnjo celotno permutacijo v zgodovino razveljitev. Razveljavi premik obnovi zadnjo prejšnjo permutacijo in trenutni vrstni red shrani za ponovno izvedbo. | Zapisi testnih rezultatov po vsakem premiku in razveljavitvi. |
| R05 | Gumb Ponovi premik obnovi zadnjo razveljavljeno permutacijo. Več razveljitev in ponovitev ohranita pravilni zaporedji brez izgube ali podvajanja ID-jev. | Test več zaporedne razveljitev in ponovitev z enim vrstnim redom. |
| R06 | Nov veljaven premik po razveljavitvi zavrže vso zgodovino ponovitev. Neveljaven premik na robu zgodovine ponovitev ne zavrže. | Test stanja zgodovine ponovitev po robnih in sredinskih premikih. |
| R07 | Hrana se največ 20 prejšnjih permutacij za razveljavo; ob 21. veljavnem premiku se zavrže najstarejša. Ponovitve delujejo za vse trenutno razveljavljene korake. | Test prenosa 21+ permutacij z verifikacijo obrezovanja najstarejše. |
| R08 | Gumb Začetni vrstni red vrne izvorno permutacijo kot eno novo razveljavljivo dejanje in počisti ponovitve. Če je vrstni red že izvoren, je gumb onemogočen in ne spreminja zgodovine. | Testnogo zagon po začetnem stanju in po seriji sprememb. |
| R09 | Preglednica prikazuje globalni vrstni red, tabla pa njegov relativni vrstni red znotraj stalnih stolpcev stanj. Na tabli premiki še vedno uporabljajo globalnega soseda, kar pokaže globalno mesto; ne spreminjajo statusa. | Test prikaza globalnega in relativnega vrstnega reda s tabličnimi nadzori. |
| R10 | Preklop pogleda in odpiranje/zapiranje podrobnosti ohranita vrstni red ter obe zgodovini. Menjava projekta in osvežitev vse ponastavita na njegovo izhodišče. Podatki se ne shranjujejo trajno. | Test obnašanja med preklopi in ponoven nalad, s preverjanjem lokalnega stanja. |
| R11 | Števec kaže Razveljavitve: U. Ponovitve: R. in je usklajen z gumbi, ki sta onemogočena pri ničli. Prazen projekt in projekt z enim opravilom ostaneta uporabna brez dovoljenega premika. | Test števcem v vseh kombinacijah praznih, enim in več elementov. |
| R12 | Vse spremembe so lokalne permutacije iste množice ID-jev; ni zapisov na API ali sprememb polj. Štenci stanj in pravilne podrobnosti ostanejo enaki, prilagodljiv Folio je ohranjen. | Preverjanje API-ja pred in po vrstni redi, vključno s polji datotek. |

## Izvedba in sledljivost

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | Vrstni red na začetku enaka prejetemu polju | `tests/agent/p10-initial-order.spec.ts` | Testno zagon s vsaj 3 opravili | Pogled v testne rezultate in odziv API-ja |
| R02 | Premakni gor z neposrednim predhodnikom | `tests/agent/p10-move-up.spec.ts` | Simulacija gumba z API-kliki | Sprememba vrstnega reda v odzivu |
| R03 | Robni elementi onemogočeni | `tests/agent/p10-move-edge.spec.ts` | Premik prvi element gor | Brez sprememb vrstnega reda |
| R04 | Zapis permutacij v zgodovino razveljitev | `tests/agent/p10-history.spec.ts` | Serija premikov s tracking | Zapisi zgodovine v lokalni pomnilnik |
| R05 | Več razveljitev in ponovitev | `tests/agent/p10-redo.spec.ts` | Serija razveljitev in ponovitev | Pomnilnik zgodovine ponovitev |
| R06 | Zavrženje zgodovine ponovitev | `tests/agent/p10-history-reset.spec.ts` | Nov veljaven premik po razveljavi | Zapis zgodovine ponovitev |
| R07 | Omejitev 20 prejšnjih permutacij | `tests/agent/p10-history-limit.spec.ts` | 21+ premikov in preverjanje obrezovanja | Zapisi disket pomnilnika |
| R08 | Začetni vrstni red vrne izvorno permutacijo | `tests/agent/p10-reset.spec.ts` | Serija sprememb z razveljavitvijo | Obnova izvornega vrstnega reda |
| R09 | Premiki uporabljajo globalne sosede | `tests/agent/p10-grid-view.spec.ts` | Test premika na tabli | Sprememba vrstnega reda, ne statusa |
| R10 | Ohranjanje vrstnega reda med preklopi | `tests/agent/p10-views.spec.ts` | Preklop pogleda in osvežitev | Vrstni vrstni red ostaja enak |
| R11 | Števec usklajen s gumbi | `tests/agent/p10-counter.spec.ts` | Premik in upravljanje zgor | Števec se posodablja |
| R12 | Ni zapisov na API | `tests/agent/p10-api-integrity.spec.ts` | API kliki pred in po | Vse polje API-ja enako, razen vrstnega reda |

## Odprta vprašanja in omejitve

- **Nepreverjeni scenariji:** o Interakcija z neveljavnim premikom na robu zgodovine ponovitev. o Obnašanje pri zelo velikih vrstnih redih (N > 1000). o Avtomatsko hranjenje prejšnjih permutacij med različnimi delovnimi seji. - **Pojasnila:** o `globalno mesto` po R09 se nanaša na indek vrstnega reda (1-based). o `izvoren vrstni red` v R08 je tisti, ki je bil prejet ob začetku seje brez sprememb. o Podatki se ne shranjujejo trajno; vsaka obnova se opravi preko API-ja brez lokali smisljenja. - **Odstopanja:** o Končni testi v tej specifikaciji še niso izvedeni; sledljivost zahteva pripravo ločenih datotek v `tests/agent/P10/` mapi. o Shranjevanje prejšnjih permutacij se obnaša lokalno v pomnilnik, ne v trajno zunanjo shrambo. - **Omejitve:** o Brez močnih testov za vse 2^20 možne zaporedja razveljitev. o Testni mehanizem `/__test/` je dostopen samo za testske namene; uporabniški vmesnik ne sme uporabljati. o Gumbi v vmesniku niso predpisani v natančni lokaciji, le vsiljeni besedilni oznaki. **Skupna predloga P10 in vseh dvanajst zahtev ostajata obvezna. Dokazila piši sproti in jedrnato. Omejitev: nepreverjeni scenariji v Odprta vprašanja in omejitve; končni testi v `tests/agent/P10/*.spec.ts` še niso napisani.
