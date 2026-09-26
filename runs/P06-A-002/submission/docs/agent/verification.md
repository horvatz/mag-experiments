# P06 – dejansko izvedeno preverjanje

Postopek A, en agent. Delo je potekalo 26. 9. 2026 po lokalnem času
Europe/Ljubljana (25. 9. po UTC), znotraj omejitve 20 minut. Najprej je bila
zapisana [specifikacija](specification.md), nato implementacija in lastni testi.

Končni rezultat: **`npm run check` uspešen, izhodna koda 0, 56/56 testov**.
To vključuje ESLint, TypeScript, produkcijsko gradnjo Vite, 38 izhodiščnih,
8 razvojnih preverjanj P06 in 10 dodatnih testov. Trajanje končnega testnega
dela: 23,9 s. Celoten izpis je v [check.log](check.log).

## Izvedeni zagoni in popravki

| Preverjanje | Dejanski rezultat | Dokaz |
| --- | --- | --- |
| `npm run lint && npm run typecheck` po prvi implementaciji | Uspešno, izhodna koda 0. | Konzolni izpis med izvedbo; enaki preverjanji sta nato uspešni tudi v končnem dnevniku. |
| `npx playwright test --project=development-desktop --project=development-mobile` | 8/8 uspešnih, 4,1 s. | Konzolni izpis; vseh 8 je znova uspešnih v `check.log`. |
| Prvi `npm run check` z lastnimi testi | Lint in gradnja uspešna; 55 uspešnih, 1 neuspešen test, izhodna koda 1. | [check-initial.log](check-initial.log), A04. |
| Končni `npm run check` po popravku | Lint, TypeScript, gradnja in 56/56 testov uspešnih, izhodna koda 0. | [check.log](check.log). |
| Vizualni pregled posnetka mobilne table | Kontrole in besedilo ostanejo v širini 390 px; tabla se pomika znotraj svojega prikaza; fokus gumba je viden. | [mobile.png](mobile.png), ustvarjen v A09 in vizualno pregledan. |
| Pregled spremenjene kode | Izvoz nima `fetch`, zapisov ali testnih kontrol; uporablja čisto filtriranje in preslikavo brez spreminjanja vhodov. | [csv.ts](../../src/csv.ts), [CsvExport.tsx](../../src/CsvExport.tsx), vključitev v [App.tsx](../../src/App.tsx). |

Prvi neuspeh A04 je izviral iz lastnega testnega pripomočka: ponovno odpiranje
istega naslova s hashom je ohranilo dokument in že naložena opravila, čeprav je
test namestil nov prazen odgovor. Pripomoček zdaj pred novo množico podatkov
odpre `about:blank` in odstrani prejšnjo pot prestrezanja API-ja. A04 je nato
uspešno preveril oba prazna projekta. Napaka ni bila prikrita s spremembo
pričakovanega izida ali izločitvijo testa.

Pri vizualnem pregledu je bila popravljena še specifičnost sloga gumba, da
obstoječi splošni slog `.button` ne prepiše modrega poudarka za izvoz. Končni
zagon in posnetek vključujeta ta popravek.

## Povezava zahtev z dokazi

Vsi testi A so v [tests/agent/p06.spec.ts](../../tests/agent/p06.spec.ts).
D01–D04 so [skupni razvojni testi](../../tests/development/P06.spec.ts),
vsak izveden na namiznem in mobilnem projektu. Vsi spodaj navedeni testi so
dejansko uspešni v končnem dnevniku; pogoji in deli kode so dodatno povezani
v tabeli sledljivosti specifikacije.

| Zahteva | Izvedeno preverjanje in rezultat |
| --- | --- |
| R01 | D01 in A01: privzeto vseh 7 kolon, `all`, `;`; vseh 14 opravil v izvornem nesortiranem vrstnem redu. Natančni bajti se ujemajo. |
| R02 | D02 in A02: izbor v obratnem vrstnem redu; glava in celice sledijo zahtevanemu fiksnemu vrstnemu redu. |
| R03 | A03: odstranitev vseh kolon onemogoči gumb; programski klik ne sproži prenosa; izbor ene kolone omogoči en pravilen prenos. |
| R04 | A04: `all`, `todo`, `in_progress`, `done` omejijo samo CSV. Vse vrstice, kartice in števci ostanejo. Prazen rezultat in oba prazna projekta onemogočijo izvoz. |
| R05 | D01, A01 in A06: UTF-8 BOM bajti EF BB BF; ime uporablja ID trenutnega projekta. A01 preveri nespremenjen URL, število strani in odsotnost novih zahtev med prenosom. |
| R06 | D02–D03, A02 in oba A07: podpičje in vejica, navedene glave in vrednosti, podvojeni narekovaji, pravilno navedene prazne celice. |
| R07 | D01, D03 in oba A07: natančna primerjava prenešenih bajtov, CRLF med vrsticami in na koncu; notranji CR, LF, CRLF in obe ločili ohranjeni. |
| R08 | D03, A07 in A08: apostrof pred izvirni niz za vse 4 začetne operatorje in 6 preslednih prefiksov; posebni primeri v ID-ju, ID-ju projekta, naslovu, odgovorni osebi in opisu. A08 preveri tudi 11 nizov, ki morajo ostati nespremenjeni (med njimi NBSP, VT, FF in BOM pred operatorjem). |
| R09 | A01, A07 in A08: ohranjeni šumniki, kitajski znak, emoji, začetni/končni presledki, interni statusi, prestopni datum `2028-02-29` in celotni opisi. |
| R10 | D04 in A05: neprivzeti izbor kolon, vejica in filter `in_progress` ostanejo pri preklopu v tablo in nazaj; vsebine prenosov so bajtno enake. Tudi ogled podrobnosti ne izgubi nastavitev. |
| R11 | A02 in A06: zaporedna izvoza odražata spremenjen izbor in ločilo; menjava projekta, vrnitev in osvežitev ponastavijo vse 3 nastavitve. Ime in vsebina ustrezata trenutnemu projektu. |
| R12 | 38 izhodiščnih testov in D04 so uspešni. A04–A09 preverjajo nespremenjene prikaze, branje podrobnosti po ID, nič zapisovalnih zahtev, zamrznjena vhodna polja, odsotnost dostopa UI do `/__test/`, tipkovnico in meje kontrol pri 390 px. |

## Obseg sprememb

- `src/csv.ts`: enoten vrstni red kolon, nevtralizacija formul, navedba celic,
  BOM in CRLF.
- `src/CsvExport.tsx`: dostopne kontrole, lokalno stanje nastavitev, izvoz
  prek Blob in povezave `download`, onemogočanje praznega izvoza.
- `src/App.tsx`: vključitev nad preglednico/tablo z obstoječo življenjsko dobo
  projekta; obstoječi prikaz še naprej dobi celotno polje opravil.
- `src/styles.css`: panel izvoza, prelamljanje kontrol, barve Folio.
- `tests/agent/p06.spec.ts` in `docs/agent/`: lastni testi ter dokumentacija.

Odvisnosti, infrastruktura, strežnik, skupni tipi in skupni testi niso bili
spremenjeni. Ni uporabe drugih agentov, zunanjih povezovalnikov ali interneta.
Preverjanja uporabljajo obstoječo nastavitev povezave s Chromiumom in lokalni
testni strežnik na 5174/3102. Lastni testi ne uvažajo razvojnega pripomočka.

## Omejitve in nepreverjeno

- Nedostopni končni/skriti testi niso bili izvedeni.
- Preverjen je nameščeni Chromium, vključno z mobilnim profilom skupnih testov
  in lastnim pogledom 390 × 844. Drugi brskalniki, fizični telefoni in uvoz v
  namizne programe za preglednice niso bili preverjeni; vsebina CSV je preverjena
  neposredno na bajtih prenosa.
- Preklic shranjevanja ali napaka diska v upravljalniku prenosov nista bila
  simulirana. Aplikacija nima povratnega API-ja za izid shranjevanja na disk.
- Nove sočasne spremembe podatkov brez osvežitve niso del naloge. Obstoječa
  regresijska preverjanja nalaganja, napak, ponovnega poskusa in navigacije so
  bila uspešna.
- Okolje je izpisalo opozorili npm `http-proxy` ter `NO_COLOR`/`FORCE_COLOR`;
  noben zahtevan korak ni bil blokiran. Končni zagon se je končal uspešno.

Ni znanih neizpolnjenih zahtev R01–R12.
