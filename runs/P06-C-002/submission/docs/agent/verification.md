# P06 — Preverjanje in predaja

Začetek implementacije: 2026-09-26 (lokalni datum); datum pilota 2026-09-25 UTC.

Viri: [specifikacija](P06/spec.md), [načrt](P06/plan.md), [naloge](P06/tasks.md). Pregledani so projektna pravila, izvirne R01–R12, skupna predloga, obstoječi projektni pogled, slogi in razvojni testi. Dovoljene meje ostajajo nespremenjene.

## Sprotni rezultati

- T001: pregled izhodišča opravljen. Preverjanja implementacije: še niso izvedena.
- Po navodilu implementacijskega koraka je osrednji zapis ta datoteka; `P06/validation.md` vsebuje samo povezavo nanjo.

## Omejitve

Nedostopni končni testi niso izvedeni. Rezultati implementacije in sledljivost bodo dopolnjeni po dejanskih preverjanjih.

- T002–T005: implementirani čista serializacija, izvozne kontrole, integracija in odzivni slogi. Koda uporablja izvorna opravila brez mutacij in obstoječi projektni ključ za ponastavitev. Testi še niso izvedeni.

- T006–T007: dodanih devet agentovih testov (A01 za obe ločili in A02–A08), vključno s primerjavo bajtov, nespremenljivostjo ter brskalniškimi prehodi. Zagon še sledi.

## Izvedeno preverjanje

`npm run check > docs/agent/P06/check.log 2>&1` se je končal z izhodno kodo **0**. Lint, TypeScript in produkcijska gradnja so uspešni; Playwright je uspešno izvedel **55 testov v 21,5 s**: 38 osnovnih (14 API + 12 namiznih + 12 mobilnih), 8 razvojnih P06 (D01–D04 na obeh širinah) in 9 agentovih. Dnevnik: [check.log](P06/check.log). Noben test ni spodletel ali bil preskočen. Okoljska opozorila npm o `http-proxy` ter Node o barvah niso vplivala na izid; konfiguracije nismo spreminjali.

Lastni testi v [tests/agent/P06.spec.ts](../../tests/agent/P06.spec.ts):

| Test | Preverjeno | Rezultat |
| --- | --- | --- |
| A01, obe ločili | Točni UTF-8 bajti z BOM, navajanje, CR/LF/CRLF, Unicode, prazne vrednosti, vrstni red kolon, izvirni datum/status in zamrznjen vhod | 2/2 uspešno |
| A02 | 4 sprožilci × 6 začetnih kombinacij × 7 podatkovnih kolon ter varni podobni nizi; apostrof pred izvirnimi presledki | Uspešno |
| A03 | Stabilni filter, vrstni red, nič kolon/vrstic/zadetkov | Uspešno |
| A04 | 13 opravil, drugačni ID-ji in enaki naslovi, vsi filtri, ponovni izbor kolon, celotni pregled/povzetek/tabla/podrobnosti, brez zapisov in novih strani | Uspešno |
| A05 | Eno opravilo, prazen projekt in prazen filter, omogočenost po ponovnem izboru | Uspešno |
| A06 | Enaki bajti med pogledoma, zaporedni izvozi, ponastavitve ob menjavi/vrnitvi projekta in osvežitvi | Uspešno |
| A07 | Dejanski prenos posebnih Unicode/formulskih nizov in notranjih prelomov za obe ločili | Uspešno |
| A08 | Dogovorjena dostopna imena, tipkovnica, oba pogleda pri 390 pikah, brez razširitve strani ali zapisov API | Uspešno |

### Vizualni pregled

Ročni strežnik je bil zagnan z `WEB_PORT=5193 API_PORT=3123 npm run dev`. Skripta je prebrala `wsEndpoint` iz `task/browser.json` in uporabila `chromium.connect(wsEndpoint)`. Pred vsakim zajemom je preverila aktivni pogled (`aria-pressed=true`) in vidnost ustreznega vsebnika. Prvi namizni zajem table je bil prehiter; ponovljeni zajem s tem čakanjem ga je nadomestil.

Pregledani so vsi štirje posnetki: [namizna preglednica](P06/folio-1440-table.png), [namizna tabla](P06/folio-1440-board.png), [mobilna preglednica](P06/folio-390-table.png), [mobilna tabla](P06/folio-390-board.png). Ohranjeni so Folio, navigacija, modri poudarki, nevtralne površine in notranje drsenje pogledov; nove kontrole se pri 390 pikah prelomijo znotraj vsebine. Meritve [manual-view.json](P06/manual-view.json) potrjujejo `scrollWidth=1440` oziroma `390` v obeh pogledih, sedem checkboxov in nič napak `pageerror`.

- T008: zaključeno; zahtevana preverjanja in vizualni pregled so uspešni.

## Sledljivost zahtev in obseg sprememb

Vseh **R01–R12** je povezanih s sprejemnimi pogoji, konkretnimi deli kode, dejansko izvedenimi testi in tem dokazilom v [matriki specifikacije](P06/spec.md#izvedba-in-sledljivost). Predikati `K`, `E`, `enabled`, `N`, `Q` in spremembe stanja ostajajo merilo; testni primeri ne omejujejo domene zahtev.

Implementacija dodaja `src/csv.ts` in `src/CsvExport.tsx`, vključi komponento v `src/App.tsx` in doda omejene sloge v `src/styles.css`. Lastni testi so samo v `tests/agent/P06.spec.ts`. Dokumentacija in dokazila so v `docs/agent/`. Strežnik, skupni tipi/testi, nastavitve in odvisnosti niso bili spreminjani; ni novih API-jev, vej ali commitov. Aplikacijska koda ne uvaža testnih pripomočkov in ne uporablja `/__test/` ali lokalne nadomestne shrambe.

## Končne omejitve

- Znanih neizpolnjenih zahtev R01–R12 ni. Vse preveritve iz tega poročila so dejansko izvedene.
- Končni skriti testi niso dostopni in niso izvedeni. Preverjanje poteka v nameščenem Chromiumu; drugih brskalnikov nismo preverjali.
- Brskalnikovega uporabniškega preklica shranjevanja datoteke nismo avtomatizirali; koda ob izvozu spreminja samo začasno povezavo/Blob URL, brez sprememb podatkov in nastavitev. Nove sočasne spremembe podatkov in navigacija med nalaganjem ostajajo v dogovorjenem regresijskem obsegu.
- A02 za preverjanje splošnega pravila vseh sedmih kolon neposredno kliče serializator tudi z nizi zunaj ožje domene statusa/datuma/ID-ja. Brskalniški testi uporabljajo veljavne statuse, datume in projektne ID-je.

- T009: matrika vseh R01–R12, konkretna koda, dejanski testi, dokazi in omejitve so dopolnjeni. Vse naloge T001–T009 so opravljene.

Zaključni pregled dokumentov: vse povezave veljavne, T001–T009 označene kot opravljene, vsaka R01–R12 ima sprejemni pogoj in vrstico dejanske sledljivosti. Pregled novih izvoznih modulov in integracije ni našel referenc na testne kontrole, testne pripomočke ali `localStorage`. Strežnik za ročni pregled je ustavljen. Označb kontrolnega seznama kakovosti zahtev nismo spreminjali.
