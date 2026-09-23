# Neodvisni pregled P03

Pregledane so izvirne zahteve `task/instructions.md`, projektna pravila, predloga, specifikacija in njena zgodovina, implementacija, razvojni in lastni testi, osnovni testi vmesnika ter `verification.md` z dokazi. Pri primerjavi vseh R01–R12 ni konkretne ugotovitve, ki bi zahtevala spremembo specifikacije ali kode.

## Pregled po zahtevah

| Zahteva | Neodvisno pregledan dokaz | Presoja |
| --- | --- | --- |
| R01 | `App.tsx:17–21`: prazno iskanje, oba `all`, stabilni `filter`; S01/S06 in primera velikosti 0/1. | Privzete kontrole in izvorni vrstni red so zajeti. |
| R02 | `App.tsx:11–12,20–22`: NFD, odstranjevanje U+0300–036F in male črke za vnos ter vsa štiri zahtevana polja; S02. | Normalizacija ustreza izvirni zahtevi in predikatu specifikacije. |
| R03 | `App.tsx:20–23`: delitev po belinah, neprazne besede, `every` in dobesedni `includes`; S02. | Vse besede se sestavljajo z IN; prazne besede ne omejujejo. |
| R04 | `App.tsx:23–25,65–66`: trojni IN, natančna primerjava osebe in zahtevane vrednosti stanja; S03/S05. | Brez normalizacije pri izbiri osebe. |
| R05 | `App.tsx:27,68–69`: Set nad celotnim seznamom, izločitev praznega niza, izvirne vrednosti možnosti; S03/S05 in S04. | Možnosti niso odvisne od zadetkov; menjava projekta ponastavi osebo. |
| R06 | `App.tsx:75,79` in `TaskBoard.tsx`: isti filtrirani seznam, stabilna razdelitev po stanjih; S01/S06 in S03/S05. | Pogleda kažeta iste ID-je in ohranjata kontrole. Globalni vrstni red table se upravičeno razlikuje zaradi stolpcev. |
| R07 | `App.tsx:119`: ključ po project.id; `useResource.ts`: preklic in preverjanje ključa podatkov; S04 ter osnovni test menjave med nalaganjem. | Stanje in podatki so ločeni po projektu. |
| R08 | Lokalni `useState` v `App.tsx`, poti v `navigation.ts`, S04. | Ni zapisa filtrov v URL ali trajno shrambo; nova stran začne s privzetimi vrednostmi. |
| R09 | `App.tsx:33–36,45–48,73` in števci `TaskBoard.tsx`; S03/S05. | N in pregled stanj iz filtriranega seznama, M iz celotnega projekta; besedilo in dostopno ime statusa ustrezata dogovoru. |
| R10 | `App.tsx:74–75`, prazni stolpci `TaskBoard.tsx`; S03/S05 in primera velikosti 0/1. | Ni zadetkov je ločeno od praznega projekta; kontrole in preklop ostanejo prisotni. |
| R11 | `App.tsx:28–31`, nemutirajoča izpeljava seznama; S01/S06 in S03/S05. | En klik ponastavi vse tri kontrole; izvorni vrstni red in objekti niso spremenjeni. |
| R12 | `App.tsx`, `TaskDetails.tsx`, `TaskBoard.tsx`, `navigation.ts`, `useResource.ts`, `api.ts`, `styles.css`; osnovni testi in S07; trije vizualni posnetki. | Filtrirni dogodki spreminjajo le lokalno stanje. Pripravljeni `updateTask` nima klicatelja v teh poteh. Navigacija, podrobnosti, oznake in Folio so ohranjeni; nove kontrole se pri ozki širini zložijo. |

Specifikacija vsebuje vse rubrike predloge, vse zahteve, predikate, prehode in načrt preverjanja. Njene oznake »Ni izvedeno« opisujejo fazo avtorja; dejanski rezultati implementacije so sledljivi v `verification.md` in `check.log`. Nobena izvirna zahteva ni izpuščena ali oslabljena.

## Izvor preverjanj in omejitve

- Sam sem pregledal navedeno kodo, specifikacijo, testne scenarije, poročilo in dnevnik. Sam sem vizualno pregledal `desktop-table.png`, `mobile-table.png` in `mobile-board.png` glede na `docs/dizajn.md`.
- Predani `check.log` poroča o uspešnih lint/typecheck/build ter 53 testih: 38 osnovnih/API, 8 razvojnih in 7 lastnih. To je implementerjev zagon, ne moj ponovni zagon. Poročilo se ujema z dnevnikom in vsebino pregledanih scenarijev; brez konkretnega razloga preverjanja nisem ponovil.
- Meritve 1440/390/390 v `visual-check.json` in dinamična preverjanja interakcij izvirajo iz implementerjevega preverjanja; sam jih nisem ponovno izvedel.
- Končni testi niso dostopni, javni internet je blokiran. Živega brskalnika, drugih brskalnikov in bralnika zaslona nisem preizkusil. Morebitne lastne brskalniške skripte bi morale uporabiti nameščeni Chromium prek `chromium.connect(wsEndpoint)`.
- Predana dokumentacija navaja nedelujoči sistemski Git zaradi manjkajočega xcrun. Tega nisem ponovno preverjal in zato ne potrjujem popolnega obsega sprememb z Gitovim diffom.

Pregledovalec je spremenil samo `docs/agent/review.json` in ta dokument. Koda, specifikacija, testi in infrastruktura ostajajo nespremenjeni.
