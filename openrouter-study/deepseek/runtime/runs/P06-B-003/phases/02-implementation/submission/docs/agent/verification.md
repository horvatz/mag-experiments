# Poročilo izvajalca — P06 (nastavljiv izvoz CSV)

Vloga: implementer. Vir: `docs/agent/specification.md` (različica 1) + `task/instructions.md` R01–R12.

## Načrt preverjanj (še neizvedeno)

| Zahteva | Preverjanje | Načrtovan dokaz | Izid |
| --- | --- | --- | --- |
| R01 | privzeti izvoz: BOM, glava v vrstnem redu C, ločilo `;`, izvorni vrstni red vrstic | D01 + lastni test vrstnega reda z enakimi naslovi | neizvedeno |
| R02 | kliki checkboxov v obratnem vrstnem redu → glava in celice vedno v vrstnem redu C | lastni test | neizvedeno |
| R03 | izklop vseh kolon → gumb onemogočen, brez dogodka `download`; ponovni vklop → prenos | lastni test | neizvedeno |
| R04 | filter omeji samo vrstice; prazen projekt / prazen rezultat → onemogočeno, prikaz nespremenjen | D02 + lastni test | neizvedeno |
| R05 | ime `folio-<id>.csv`, BOM na začetku, brez nove strani, brez ne-GET zahtevkov | D01, D04 + lastni test | neizvedeno |
| R06 | ločilo `;`/`,`; vsa polja navedena; notranji `"` podvojen | D02, D03 + lastni test | neizvedeno |
| R07 | CRLF po vsaki vrstici, tudi zadnji; CR/LF/ločila znotraj vrednosti ostanejo | D01, D03 + lastni test z `\r\n` v opisu | neizvedeno |
| R08 | nevtralizacija `^[ \t\r\n]*[=+\-@]`; drugi nizi nespremenjeni; glava izvzeta | D03 + lastni test robnih predpon | neizvedeno |
| R09 | Unicode/opisi ohranjeni; status interno; datum `YYYY-MM-DD` | D01, D03 + lastni test | neizvedeno |
| R10 | preklop pogleda ohrani S/d/f; enaki bajti | D04 | neizvedeno |
| R11 | menjava projekta/osvežitev → privzeto; zaporedna izvoza odražata trenutne nastavitve | lastni test | neizvedeno |
| R12 | brez sprememb podatkov, brez zapisov; `src/` brez `/__test/`; brez vodoravnega prelivanja | D04 + `rg` | neizvedeno |

## Izvedene spremembe

(se sproti dopolnjuje)

## Dejanski rezultati

(se sproti dopolnjuje)

## Omejitve in odprta vprašanja

(se sproti dopolnjuje)
