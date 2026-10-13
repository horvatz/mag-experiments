# P08: Koledarski pregled rokov

Različica 1.0, glavna naloga. Vsi postopki prejmejo iste zahteve, izhodišče in razvojne teste. Začetni Folio ne vsebuje rešitve pilotov ali drugih glavnih nalog.

## Zahteve

| ID | Pričakovano delovanje |
| --- | --- |
| R01 | Referenčni datum je ob vsakem začetku projekta izrecno 2026-09-21; ni odvisen od trenutne ure naprave. Začetni izbrani pogled rokov je all. |
| R02 | Opravilo s statusom done vedno spada v skupino done ne glede na rok; ne šteje v nobeno od štirih skupin odprtih opravil. |
| R03 | Odprto opravilo z dueDate pred referenčnim datumom spada v overdue; z enakim datumom v today. |
| R04 | Odprto opravilo z datumom od naslednjega dne do vključno sedmega dne spada v week; poznejši rok spada v later. Skupine so disjunktne in skupaj vsebujejo vsa opravila. |
| R05 | Datumi se obravnavajo kot koledarski YYYY-MM-DD neodvisno od časovnega pasu in poletnega časa. Seštevanje dni deluje čez meje meseca, leta in prestopni februar. |
| R06 | Pet števcev prikazuje število opravil celotnega trenutnega projekta v skupinah overdue/today/week/later/done; aktivni filter ne spremeni teh števil. |
| R07 | Izbirnik Pogled rokov all/overdue/today/week/later/done prikazuje ustrezno skupino v izvornem vrstnem redu. Izbor ne spreminja datumov ali stanj opravil. |
| R08 | Veljaven nov referenčni datum takoj preračuna skupine in vidne vrstice, pri tem pa ohrani aktivni filter. Prazno polje prikaže opozorilo in ohrani zadnji veljavni preračun; ponoven veljavni datum opozorilo odstrani. |
| R09 | Preglednica in tabla prikazujeta iste filtrirane ID-je. Preklop pogleda ohrani referenčni datum, trenutno besedilo polja in izbrano skupino. |
| R10 | Menjava projekta in osvežitev ponastavita datum in skupino na začetni vrednosti. Noben podatek o filtru se ne hrani v trajni shrambi ali URL-ju. |
| R11 | Prazen projekt daje pet ničel. Prazna skupina v nepraznem projektu prikaže Ni opravil v izbrani skupini. ter omogoča preklop na drugo skupino ali all. |
| R12 | Datumi podatkov so veljavni YYYY-MM-DD, tudi prestopni. Pregled ne pošilja zapisov na API; polja in bralne podrobnosti ostanejo nespremenjeni, ohranjen je prilagodljiv Folio. |

## Dogovor o vmesniku

- input type=date z oznako Referenčni datum; HTML select Pogled rokov: all/overdue/today/week/later/done.
- Pet elementov ima aria-label=Število rokov <ključ> in samo številsko vrednost, npr. Število rokov overdue.
- Prazen datum: role=alert z besedilom Vnesi veljaven referenčni datum. Imena skupin so Zapadlo, Danes, Naslednjih 7 dni, Pozneje in Končano.

Ohrani `data-task-id` na vrsticah in karticah, dostopna imena obstoječih pogledov in stolpcev ter `aria-label="Pregled stanj opravil"`. Nova dejanja ob opravilu morajo biti zunaj njegove povezave. Na širini 390 pik se cela stran ne razširi; notranje drsenje preglednice in table je dovoljeno. Besedilo, ki ni izrecno določeno zgoraj, in razporeditev novih kontrol nista predpisana.

## Podatki, obseg in preverjanje

Podatke preberi iz obstoječega javnega API-ja. Testi lahko vrnejo poljubno število opravil (tudi nič, eno in več kot deset), drugačne enkratne ID-je, enake naslove, različno zaporedje in veljavne koledarske datume. Tipi in polja so enaki izhodišču. Projekta sta lahko prazna. Naslovi, opisi in imena so navadno besedilo, tudi z Unicode znaki in ločili. V nalogah z izbiro odgovorne osebe so imena neprazna in različna od rezervirane vrednosti `all`. Vsako opravilo pripada svojemu projektu.

Javni pripomoček razvojnih testov podaja dodatne podatke z nadzorovanimi GET odgovori. To je testni mehanizem, ki ga uporabniški vmesnik ne sme uvažati ali uporabljati. Aplikacija bere samo `/api/`; ne bere testnih kontrol `/__test/`. Strežnika, infrastrukture, odvisnosti in skupnih tipov ne spreminjaj. Razvojni primeri niso celoten obseg zahtev; končni primeri lahko uporabijo drugačne podatke iz opisane domene.

Navigacije med nezaključenim nalaganjem in novih sočasnih sprememb podatkov brez osvežitve ne širimo prek obstoječih regresijskih zahtev. Če posamezna zahteva ne določa trajne shrambe ali URL-ja, je stanje nove funkcionalnosti lokalno trenutnemu projektu. Ne dodajaj novih zapisovalnih API-jev.

## Oddaja

Spreminjaj samo `src/`, lastne teste v `tests/agent/` in dokumente v `docs/agent/`. Veljajo projektna pravila; omembe pilotov v dokumentih izhodišča so zgodovinske. Pripravi specifikacijo po skupni predlogi in poveži vseh R01–R12 s pogoji, kodo in dejansko izvedenimi testi. Izbrane pogoje opredeli tudi s predikati. Zapiši nepreverjene dele in omejitve; nedostopnih končnih testov ne navajaj kot opravljenih.
