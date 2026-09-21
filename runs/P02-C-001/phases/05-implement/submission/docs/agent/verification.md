# Preverjanje P02

2026-09-21, postopek C. Viri: [specifikacija](P02/spec.md), [načrt](P02/plan.md), [naloge](P02/tasks.md), [izvirne zahteve](../../task/instructions.md).

## Izvedba in rezultati

Implementirani so izbor po ID v preglednici in na tabli, skupni izbor, cilj, posamično shranjevanje s sprotnim prikazom uspehov, neodvisna obravnava zavrnitev, ponavljanje samo neuspelih, kumulativni povzetek in čiščenje operacije. Projektno stanje ohrani preklop pogleda in se ponastavi ob menjavi projekta/osvežitvi. Sinhrona zaščita prepreči dvojni zagon; potrjeni podatki se spreminjajo funkcijsko, samo v polju `status` pripadajočega ID-ja.

Spremenjeni so `src/App.tsx`, `src/TaskBoard.tsx`, `src/useResource.ts`, `src/styles.css`; dodana sta `src/useBulkStatus.ts` in `src/BulkActions.tsx` ter `tests/agent/P02.spec.ts`. Javni API, bralne podrobnosti, infrastruktura, odvisnosti, skupni tipi/testi in priloženi razvojni testi/pripomoček so ostali nespremenjeni. Kontrolnega seznama kakovosti zahtev ta korak ni spreminjal.

| Preverjanje | Dejanski izid | Dokaz |
| --- | --- | --- |
| Začetni `npm run lint` | Uspeh, izhod 0. | [lint-initial.log](P02/lint-initial.log) |
| Začetni `npm run build` | Uspeh, TypeScript in produkcijska gradnja, izhod 0. | [build-initial.log](P02/build-initial.log) |
| Končni `npm run check` | Uspeh, izhod 0: lint, tipi, gradnja in **55 uspešnih testov**, 22,5 s za testni del. | [check.log](P02/check.log) |
| Skupni testi | 38 uspešnih: 14 API, 12 namiznih in 12 mobilnih. | Projekti api/desktop/mobile v `check.log`. |
| Razvojni P02 | D01–D04 uspešni v namiznem in mobilnem projektu, skupaj 8. | Projekta development-desktop/development-mobile v `check.log`. |
| Lastni P02 | A01 pri 1440 in 390 px ter A02–A08, skupaj 9 uspešnih. | Projekt agent v `check.log`; [testi](../../tests/agent/P02.spec.ts). |
| Vizualni pregled Folio | Pregledana oba posnetka: ohranjeni navigacija, gradniki, barve, kartice; kontrole se na ozki širini prelomijo. Test dodatno potrdi vidni fokus in odsotnost zunanjega vodoravnega prelivanja v obeh pogledih. | [1440 px](P02/folio-1440.png), [390 px](P02/folio-390.png). Mobilni posnetek prikazuje tablo po notranjem pomiku do izbranega polja. |

Preverjanja so bila opravljena z nespremenjeno konfiguracijo in pripravljenim brskalniškim endpointom. Aplikacija ne uporablja testnih kontrol. Lastni testi uporabljajo javni pripomoček `tests/development/helpers.ts` za izide posameznih ID-jev, dnevnik zahtev in celotne podatkovne posnetke. Uspeh ni sklepan samo iz razvojnih testov.

## Sledljivost R01–R12

Predikati P1–P9 in scenariji S1–S8 so v [specifikaciji](P02/spec.md#model-in-predikati). Spodnja tabela je izvedbeni del skupne predloge. Vsi navedeni testi so bili izvedeni v uspešnem [končnem zagonu](P02/check.log).

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | P1–P2: izbor po ID, oba pogleda, enaki naslovi, brez navigacije | A01-1440, A01-390; S1 | `src/useBulkStatus.ts`: toggle; `src/App.tsx`: ProjectView checkbox; `src/TaskBoard.tsx`: checkbox zunaj povezave | Uspeh; `check.log` A01. |
| R02 | P2: skupni/delni/prazni izbor in števec | A01, A02; S1 | `src/BulkActions.tsx`: all/indeterminate/count; `src/useBulkStatus.ts`: toggleAll | Uspeh; `check.log` A01–A02. |
| R03 | P9: pogled ohrani stanje, projekt/osvežitev ponastavita | A01, A03, A04, A06, A08; S2 | `src/App.tsx`: ProjectView in ključ project.id; stanje `useBulkStatus` | Uspeh; priprava, končni povzetek in delne napake preverjeni med preklopi. |
| R04 | P3: prazen cilj, veljavnost, priprava brez zapisov | D01, A01, A03; S1, S3 | `src/BulkActions.tsx`: select/apply disabled; `src/useBulkStatus.ts`: changeTarget/apply | Uspeh; nič zahtev med pripravo/čiščenjem, nespremenjen posnetek. |
| R05 | P3: natanko en zapis na ID, naslov in zajeti cilj, tudi enako stanje | D02, A03, A04, A05; S3, S6 | `src/useBulkStatus.ts`: apply/run; obstoječi `src/api.ts`: updateTask | Uspeh; točni ID-ji, število in telesa zahtev. |
| R06 | P4: posamični potrjeni podatki takoj, trajnost in skladni prikazi | A03, A04, A06; S3–S4 | `src/useResource.ts`: updateData; `src/App.tsx`: onSaved/status in counts; `TaskBoard`; obstoječi `TaskDetails` GET | Uspeh; zadržana druga zahteva, tabela/tabla/števci, pozneje odprte podrobnosti in osvežitev. |
| R07 | P4–P5, P8: neodvisni izidi in sporočilo po ID | D03, A04, A05, A06; S4–S5 | `src/useBulkStatus.ts`: run try/catch in rejected; `src/BulkActions.tsx`: alerts/result | Uspeh; delne in popolne zavrnitve, ID/naslov/razlog, nespremenjeni zavrnjeni podatki. |
| R08 | P5–P6: samo neuspešni, isti cilj pri ponovitvah | D03, A04–A06; S5 | `src/useBulkStatus.ts`: failures/retry/operation | Uspeh; dnevnik več ponovitev vsebuje samo neuspele. |
| R09 | P5–P6: kumulativni različni uspehi in končno praznjenje | A03, A05, A06; S5 | `src/useBulkStatus.ts`: successful Set/result in konec run; `BulkActions` | Uspeh; povzetki 1/2 → 2/1 → 3/0 in 0/2 → 1/1, končne kontrole. |
| R10 | P3, P7: zaklepi, napredek, brez dvojnih zahtev | D04, A04, A05; S6 | `src/useBulkStatus.ts`: inFlight/locked in varovala dejanj; `BulkActions`, checkboxi obeh pogledov | Uspeh; hitri kliki/Enter, vmesni napredek in zaklep med shranjevanjem ter po napaki. |
| R11 | P1, P9: čiščenje brez zapisov in nova neodvisna operacija | D01, A01, A07; S7 | `src/useBulkStatus.ts`: clear/apply; `BulkActions`: clear button | Uspeh; uspehi ostanejo, ni dodatne zahteve ob čiščenju, nova operacija šteje 1/0. |
| R12 | P8: samo status uspešnih izbranih, ohranitev drugih podatkov in Folio | D02–D03, A01, A03–A08, osnovni testi; S3–S8 | `src/App.tsx`: preslikava samo status po ID; `useBulkStatus`: izbrani vnosi; `src/styles.css`: dodatki | Uspeh; celotni posnetki vseh projektov in bralna regresija, obe širini. |

## Omejitve in predaja

V izvedenih preverjanjih ni preostalega neuspeha ali ugotovljene neizpolnjene obvezne zahteve. Nedostopni končni testi niso bili izvedeni. Izidi testov so dokaz za navedene scenarije, ne za vse možne podatke; splošna pravila P1–P9 so preverjena tudi s pregledom kode. Sočasno urejanje drugih uporabnikov, negotov izid povezave in navigacija/osvežitev med shranjevanjem ostajajo izven dogovorjenega obsega.

Sprotni potek: začetni zapis je bil ustvarjen pred implementacijo; nato so bili zapisani integracija T002–T005 in začetni izidi lint/build; ta končna različica dodaja končni zagon, vizualni pregled in sledljivost. Naloge T001–T010 so dokončane. Naslednji korak converge sproži izvajalnik; ta korak ga ni izvajal.
