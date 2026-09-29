# Neodvisni pregled P08

Statično so primerjani izvirne zahteve R01–R12, predana specifikacija, produkcijska koda, razvojni in lastni testi ter `verification.md` in `check-final.log`. Pri vseh dvanajstih zahtevah doslej ni konkretnega odstopanja. Pregledovalec ne spreminja kode ali specifikacije.

| Zahteva | Pregledano pravilo in dokaz |
| --- | --- |
| R01 | `deadlines.ts` vsebuje konstanto 2026-09-21; `ProjectView` inicializira datum in all. S3 preverja drugo sistemsko uro. |
| R02 | `deadlineGroup` vrne done pred obdelavo datuma. S1 vsebuje done pri različnih rokih. |
| R03 | Negativna razlika koledarskih dni pomeni overdue, nič today. D01/D03 in S1 preverjajo meje. |
| R04 | Preostale razlike 1–7 pomenijo week, od 8 later. S1 preverja +1/+7/+8, vse ID-je in disjunktnost. |
| R05 | UTC-polnoči dajejo cele koledarske dneve brez DST. S2 vsebuje mesec, leto, oba februarja in DST v treh pasovih. |
| R06 | Vsa opravila se štejejo pred filtriranjem; označeni elementi vsebujejo le številke. S1/S3/S4 preverjajo števce. |
| R07 | Šest možnosti HTML selecta; stabilni Array.filter, nespremenjeni zapisi. S1 preverja vrstni red ID-jev. |
| R08 | Ločena dateInput/referenceDate; prazen vnos ohrani izračun in filter, veljaven odstrani opozorilo. D03/S3. |
| R09 | Oba prikaza prejmeta isti visibleTasks; stanje je nad vejo prikaza. S1/S3 pokrivata preklop in prazen datum. |
| R10 | Projektni key in lokalni useState; brez novih URL-parametrov ali shrambe. S3 pokriva menjavo, vrnitev in reload. |
| R11 | Pet začetnih ničel, zahtevano sporočilo za prazno skupino, ohranjene kontrole in stolpci. S4 in baseline. |
| R12 | GET prek useResource, brez uporabe updateTask; polja in podrobnosti po ID ostanejo. S1/S4/S5, baseline, CSS in Folio pravila. |

Rezultati implementerja: pregledani dnevnik `check-final.log` navaja uspešen lint, tipe, gradnjo in 52/52 testov. To so predani rezultati, ne ponovljen zagon pregledovalca. Specifikacija pravilno označuje svoje scenarije kot predlagane; dejanska sledljivost in rezultati so v `verification.md`.

Pred dodatnim preverjanjem je bil shranjen pregled vseh zahtev in preverjen čas: preostalo je 249 sekund faze.

## Lastna dodatna preverjanja

Pregledovalec je z Node neposredno uvozil `deadlineGroup` in `isCalendarDate` iz `src/deadlines.ts`. Šest eksplicitnih primerov pokriva sedmi/osmi dan v prestopnem letu 0096, prehod 1899/1900, neprestopna stoletna februarja 1900 in 2100, prestopni februar 2000 ter sedmi dan do 9999-12-31. Preverjena je tudi prednost done in zavrnitev praznega vnosa oziroma datumov 1900-02-29, 2100-02-29 in 2026-04-31. Rezultat lastnega zagona: `{"result":"PASS","cases":6,"assertions":38}`, izhodna koda 0. To dopolnjuje S2 brez ponovitve celotnega že uspešnega zagona implementerja.

Pregledovalec je sam odprl `desktop.png`, `mobile.png` in `mobile-board.png`. Predani posnetki so skladni z opisom Folio: barve, stranska oziroma zgornja navigacija, statusni povzetek, kontrole rokov ter notranji prikaz preglednice/table so ohranjeni. Posnetki niso nov živi pregled brskalnika; meritev širine in interakcijski rezultati ostajajo dokazila implementerja.

## Končna predaja

Pregled vseh R01–R12 je končan. Konkretnih napak specifikacije ali implementacije ni bilo ugotovljenih; obe zastavici v `review.json` sta false, findings je prazen. Dodatne ponovitve celotnega npm run check brez odkritega problema niso bile potrebne.

Omejitve: pregledovalec ni ponovno izvedel 52 brskalniških/API-testov, linta, tipov ali gradnje; njihov rezultat je preverjen v predanem dnevniku. Končni skriti testi so nedostopni. Živi pregled v tej vlogi, Firefox, WebKit in dejanske mobilne naprave niso bili preverjeni. Delo je bilo omejeno na ta izvoz; dodatni agenti, povezovalniki in oddaljeni repozitoriji niso bili uporabljeni. Omejitev Git/xcrun je navedena v implementerjevi predaji in v tej vlogi ni bila ponovno preizkušena. Spremenjena sta samo reviewerjeva dokumenta `review.json` in `review.md`.
