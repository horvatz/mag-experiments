# P02: Množična sprememba stanja opravil

Različica: 0.1. Druga, samostojna pilotna naloga. Vsi postopki dobijo isti
opis, izhodišče in razvojne teste. P01 ni predpogoj in njegove rešitve niso
del vhodnega gradiva. Ohranimo potrjeni videz aplikacije Folio.

## Naloga

Uporabnik izbere več opravil trenutnega projekta in jim določi novo stanje.
Vsako opravilo se shrani posebej. Če del zahtev odpove, uspešne spremembe
ostanejo shranjene, uporabnik pa lahko ponovno pošlje samo neuspele.
Naslovi, opisi, odgovorne osebe, roki in pripadnost projektu se ne urejajo.

## Zahteve

| ID | Pričakovano delovanje |
| --- | --- |
| R01 | Vsako opravilo v preglednici in na tabli ima potrditveno polje za izbor po identifikatorju. Enaki naslovi ne povežejo izborov. Sprva ni izbrano nobeno opravilo. Klik polja ne odpre podrobnosti. |
| R02 | Skupno potrditveno polje izbere vsa opravila trenutnega projekta oziroma počisti celoten izbor. Pri delnem izboru ima vmesno stanje; v praznem projektu je neoznačeno in onemogočeno. Prikazano število izbranih opravil je vedno usklajeno. |
| R03 | Preklop Preglednica/Tabla ohrani izbor, ciljno stanje in morebitne rezultate oziroma napake. Menjava projekta ter osvežitev strani začneta brez izbora, cilja ali starih sporočil. Shranjeni podatki se pri tem ohranijo. |
| R04 | Ciljno stanje je sprva neizbrano. Izbrati je mogoče Pripravljeno (`todo`), V delu (`in_progress`) ali Končano (`done`). Brez izbora opravil ali ciljnega stanja shranjevanje ni omogočeno. Sam izbor in sprememba cilja ne pošljeta zapisov ali spremenita bralnih prikazov. |
| R05 | Potrditev zajame trenutni izbor in cilj. Za vsak izbrani ID pošlje natanko eno zahtevo `PATCH /api/tasks/:id` s shranjenim naslovom in ciljnim stanjem. To velja tudi, če opravilo že ima ciljno stanje. Za neizbrana opravila ne pošlje zapisov. Zaporedni in sočasni način sta dovoljena; vrstni red zahtev ni predpisan. |
| R06 | Uspešen odgovor posodobi samo stanje pripadajočega opravila. Njegov potrjeni rezultat se prikaže tudi, če druge zahteve še čakajo ali pozneje odpovejo. Preglednica, tabla, števci in pozneje odprte podrobnosti pokažejo shranjene podatke, tudi po osvežitvi. |
| R07 | Zavrnitev enega opravila ne razveljavi uspešnih sprememb in ne prepreči obdelave drugih izbranih opravil. Zavrnjeno opravilo ostane nespremenjeno. Po odgovorih vseh zahtev je prikazan povzetek uspehov in neuspehov ter sporočilo za vsak neuspešni ID z njegovim naslovom. |
| R08 | Po delnem ali popolnem neuspehu ostanejo izbrana samo neuspešna opravila; ciljno stanje se ohrani. »Ponovi neuspele« pošlje natanko eno novo zahtevo za vsak še neuspešni ID, z istim ciljem. Že uspešnih ne pošilja ponovno. To velja tudi za več zaporednih zavrnitev in ponovitev. |
| R09 | Povzetek med ponovitvami šteje uspešno shranjena opravila celotne trenutne operacije, vsako največ enkrat, ter trenutno neuspešna opravila. Po popolnem uspehu izginejo napake, izbor se izprazni in cilj se ponastavi. Ponovni poskus ni več na voljo. |
| R10 | Med shranjevanjem so izbori, cilj, potrjevanje, ponavljanje in čiščenje onemogočeni; viden je napredek. Hitri zaporedni pritiski ali Enter ne podvojijo zahtev. Dokler ostajajo napake, so izbori, cilj in običajna potrditev zaklenjeni; uporabnik lahko ponovi neuspele ali počisti izbor. |
| R11 | »Počisti izbor« zunaj shranjevanja zavrže izbor, cilj, napake in povzetek, brez novih zapisov. Že uspešnih sprememb ne razveljavi. Omogoči začetek nove, neodvisne operacije. |
| R12 | Za neizbrana opravila in druge projekte ostanejo vsa polja nespremenjena. Pri izbranih opravilih se lahko spremeni samo stanje. Obstoječi projekti, pogleda in bralne podrobnosti še delujejo. |

## Skupni dogovor o vmesniku

- HTML `input type="checkbox"` ob opravilu ima dostopno ime
  `Izberi opravilo <id>`; skupno polje ima ime »Izberi vsa opravila«.
  Delni izbor skupnega polja izrazi lastnost `indeterminate`.
- Število je v elementu `aria-label="Število izbranih opravil"` z besedilom
  `Izbrano: N`. Ciljni HTML `select` ima oznako »Novo stanje« in začetno
  prazno vrednost `""`.
- Gumbi so »Uporabi za izbrana«, »Ponovi neuspele« in »Počisti izbor«.
  Ponovitev je lahko skrita ali onemogočena, ko ni neuspehov.
- Napredek ima `role="status"` in dostopno ime »Potek množične spremembe«.
  Končni povzetek ima `role="status"`, ime »Rezultat množične spremembe«
  in besedilo `Uspešno: X. Neuspešno: Y.`. Med pošiljanjem je lahko skrit.
- Vsako sporočilo o neuspehu ima `role="alert"` in vsebuje ID, naslov ter
  razumljiv razlog. Ostalo besedilo in postavitev nista predpisana.
- Ohranijo se `data-task-id` na vrsticah/karticah, poimenovani stolpci table
  in `aria-label="Pregled stanj opravil"`. Na ozkem zaslonu se vsebina strani
  ne razširi čez zaslon; obstoječe notranje drsenje tabele/table je dovoljeno.

## Podatkovni vmesnik in obseg

Uporabi obstoječi `updateTask` oziroma isti javni API. Ta zahteva obe polji
`title` in `status`; naslov prepiši iz prebranega opravila, brez spreminjanja.
Začetni naslovi so veljavni in že normalizirani. Uspeh vrne celotno opravilo;
HTTP zavrnitev pomeni, da za ta ID ni bilo zapisa. Zahteve imajo lahko
različne zakasnitve, vsaka pa se konča z uspehom ali zavrnitvijo brez zapisa.
Odjemalec nima skupinske transakcije in ne sme pošiljati povratnih zapisov.

Sočasnih sprememb drugih uporabnikov, negotovega izida izgubljene povezave,
navigacije ali osvežitve **med** shranjevanjem ter urejanja posameznega
opravila po P01 ne ocenjujemo. Izbor ni trajen in se ne shranjuje v brskalnik.
Posamezen scenarij začne s ponastavljenimi podatki. Podatki in izidi so lahko
drugačni kot v razvojnih primerih; končni testi ne uvajajo dodatnih zahtev.

Spreminjaj samo `src/`, lastne teste `tests/agent/` in dokumente `docs/agent/`.
Strežnik, skupni tipi, odvisnosti, skupni in priloženi testi ostanejo enaki.
Testnih kontrol `/__test/` uporabniški vmesnik ne uporablja. Pravila iz
`PROJECT_RULES.md` veljajo tudi za P02; njegove omembe P01 opisujejo zgodovino
izhodišča. Razvojne teste in njihov javni pripomoček je treba izvoziti skupaj.

## Oddaja

Pripravi specifikacijo po predlogi, implementacijo in zapis dejanskih
preverjanj. Poveži R01–R12 s pravili, testi in spremembami kode. Opiši delni
uspeh, ponavljanje in nespremenljivost neizbranih podatkov tudi s predikati.
Uspeh razvojnih testov sam po sebi ni dokaz izpolnitve vseh zahtev.
