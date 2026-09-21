# Preverjanje P06

Naloga je izvedena po postopku A z enim agentom, 22. septembra 2026 po
lokalnem času Europe/Ljubljana. Specifikacija je nastala pred implementacijo.
Spremenjeni oziroma dodani viri so samo v `src/`, `tests/agent/` in
`docs/agent/`; orodja so ustvarila tudi običajne rezultate gradnje in testov
v za to dovoljenih izhodnih mapah. Infrastruktura, odvisnosti, skupni tipi,
strežnik in skupni testi niso bili spremenjeni.

## Izvedena rešitev

- [csv.ts](../../src/csv.ts): določeno zaporedje sedmih kolon, čista
  serializacija, UTF-8 BOM, navedba vseh polj, podvojitev narekovajev,
  natančni CRLF in nevtralizacija formul pred navedbo.
- [CsvExport.tsx](../../src/CsvExport.tsx): dostopni checkboxi in selecti,
  privzete nastavitve, filter samo za izvoz, onemogočanje praznega izvoza,
  lokalni Blob/prenos in sprostitev objektnega URL-ja.
- [App.tsx](../../src/App.tsx): kontrole so na stalnem mestu obeh pogledov;
  obstoječi ključ `project.id` ponastavi stanje ob menjavi projekta.
- [styles.css](../../src/styles.css): obstoječe barve in gradniki Folio,
  prelomi kontrol na ozkih zaslonih ter vidni fokusi.

## Dejanski zagoni in rezultati

| Ukaz oziroma preverjanje | Dejanski rezultat | Dokaz |
| --- | --- | --- |
| `npm run check` pred dodatnimi testi | Izhod 0; ESLint, TypeScript in Vite uspešni; 46/46 testov (38 izhodiščnih + 8 razvojnih), 17,1 s za teste. | [check-initial.log](check-initial.log) |
| `npm run check` po dodatnih testih | Izhod 0; ESLint, TypeScript in Vite uspešni; 54/54 testov (38 izhodiščnih + 8 razvojnih + 8 lastnih), 23,3 s za teste. | [check-final.log](check-final.log) |
| `WEB_PORT=5193 API_PORT=3123 npm run dev` | Lokalna strežnika sta se zagnala na predpisanih vratih; uporabljena za vizualni pregled. | [skripta pregleda](../../tests/agent/inspect.mjs) |
| `node tests/agent/inspect.mjs` | Izhod 0; Chromium prek `chromium.connect`; preglednica in tabla pri 1440 in 390 px; vse štiri meritve `scrollWidth = innerWidth`; brez `pageerror`. | [visual-check.log](visual-check.log) in posnetki spodaj |
| `npx eslint tests/agent/inspect.mjs` | Izhod 0, brez diagnostičnih sporočil; preverjena tudi naknadno dodana pomožna skripta. | [inspect-lint.log](inspect-lint.log), prazna datoteka ob uspehu |
| Pregled kode in iskanje `__test`, `localStorage`, `fetch`, `request` v `src/` | Novi izvoz ne uporablja API-ja, testnih kontrol ali trajne shrambe. Obstoječa bralna pot in pripravljeni, neuporabljeni zapisovalni API izhodišča ostaneta. | `csv.ts`, `CsvExport.tsx`, `App.tsx`, `api.ts`, `useResource.ts` |

Celotni `npm run check` je oba zagona zaključil brez neuspešnih testov.
Dnevniki vsebujejo okoljska opozorila npm o `http-proxy` ter opozorila o
`NO_COLOR`/`FORCE_COLOR`; niso ustavila preverjanja.

Prvi zajem slik po kliku Tabla ni čakal na asinhrono spremembo pogleda in je
ustvaril napačno označen posnetek preglednice. Skripta je bila popravljena z
izrecnim čakanjem na regijo Tabla opravil in ponovno uspešno izvedena.
Shranjeni končni posnetki so iz popravljenega zagona; aplikacije zaradi tega
ni bilo treba spreminjati.

## Sledljivost vseh zahtev

Oznake D01–D04 so skupni razvojni testi, vsak izveden na namiznem in mobilnem
projektu. A01–A03 so v [csv.spec.ts](../../tests/agent/csv.spec.ts), A04–A08 v
[export.spec.ts](../../tests/agent/export.spec.ts). Vsi spodaj navedeni testi
so dejansko uspešno izvedeni v [končnem dnevniku](check-final.log).

| Zahteva | Preverjen pogoj in scenarij | Koda | Rezultat / dokaz |
| --- | --- | --- | --- |
| R01 | Vseh sedem privzetih kolon, `;`, `all`; 13 opravil z neurejenimi ID-ji, enakimi naslovi in izločenim drugim projektom. | `CsvExport`: useState/rows; `createCsv`: map | Uspešno: D01, A01, A04. |
| R02 | Izbor v obratnem vrstnem redu še vedno izpiše kanonično glavo in pripadajoče vrednosti. | `CSV_COLUMNS.filter` | Uspešno: D02, A01, A04, A07. |
| R03 | Odstranjene vse kolone: onemogočen gumb, tudi native click ne sproži prenosa; ponovni izbor omogoči prenos. | `enabled`, `download` guard, `disabled` | Uspešno: A05; števec prenosov zazna samo en veljaven prenos. |
| R04 | Vsi štirje filtri izvozijo ustrezne vrstice; izvorni prikaz in števci ostanejo; prazen filter in prazen projekt sta onemogočena tudi na tabli. | `rows`, izvorni `tasks` v App/TaskBoard | Uspešno: D02/D04, A04–A06. |
| R05 | Imeni folio-web.csv in folio-launch.csv; bajti EF BB BF; nespremenjen URL in število strani; nobene zahteve med izvozi. | `createCsv` BOM; `download` Blob/URL/anchor | Uspešno: D01, A04, A07. |
| R06 | Obe ločili, vedno navedene glave/vrednosti, prazna vrednost `""`, notranji citati podvojeni. | `quote`, `join(delimiter)` | Uspešno: D02/D03, A01/A02/A07. |
| R07 | Celoten pričakovani niz in bajti vključujejo CRLF za glavo, vrstice in konec; v vrednosti ostanejo mešani CR, LF, CRLF, vejice in podpičja. | `createCsv` sestava vrstic | Uspešno: D01/D03, A01/A02/A07. |
| R08 | Vsi štirje nevarni začetki neposredno in za presledkom, TAB, CR, LF ter njihovimi kombinacijami; apostrof pred izvirnim nizom; varni nizi, začetni apostrof, NBSP, VT in FF ostanejo. Preverjeni so tudi ID in projectId z začetnim minusom. | `neutralize(task[column])` za vse podatkovne kolone, glava uporablja samo `quote` | Uspešno: D03, A02/A03/A07; status in datum v dovoljeni domeni nista nevarna, ista funkcija velja tudi zanju. |
| R09 | Čšž, CJK, emoji, kombinirani Unicode, robni presledki, celoten opis, interna stanja in veljaven prestopni datum 2028-02-29. | `task[column]`, brez formatDate/trim/normalizacije | Uspešno: D03, A01–A03/A07. |
| R10 | Spremenjene kolone, ločilo in filter ostanejo ob table → board → table; prenosi so bajtno enaki. | Stalno mesto `CsvExport` v `ProjectView` | Uspešno: D04, A06/A07. |
| R11 | Drug projekt, vrnitev in reload ponastavijo vse tri nastavitve; zaporedni izvozi sledijo trenutnim izborom. | `ProjectView key={project.id}` in začetno lokalno stanje | Uspešno: A04/A06; reload preverjen tudi na praznem projektu. |
| R12 | Zamrznjeni vhodi se ne spreminjajo, ni zapisov API, ni zahtev med izvozom; podrobnosti ohranijo izvirni naslov/opis/datum; tipkovnica deluje; kontrol ni znotraj povezav opravil; 390px stran ne preseže širine. | `csv.ts`, `CsvExport.tsx`, `App.tsx`, `.csv-*` slogi | Uspešno: A01/A04/A05/A07/A08, D04, 38 regresijskih preverjanj in vizualni pregled. |

## Vizualni pregled

Dejansko pregledani posnetki:

- [Preglednica, 1440 px](preview-1440-table.png)
- [Tabla, 1440 px](preview-1440-board.png)
- [Preglednica, 390 px](preview-390-table.png)
- [Tabla, 390 px](preview-390-board.png)

Kontrole so čitljive in ostajajo znotraj širine strani. Uporabljeni so
sistemska pisava, nevtralne površine in modri poudarki Folio. Na telefonu
se stolpci in izbirniki prelomijo; gumb zavzame širino razpoložljivega prostora.
Preglednica in tabla ohranita dovoljeno notranje vodoravno drsenje.

## Omejitve in neizpolnjene zahteve

Ni znanih neizpolnjenih zahtev R01–R12. Preverjanja potrjujejo navedene
scenarije in ne pomenijo izčrpnega preverjanja vseh možnih podatkov.

- Nedostopni končni testi niso bili izvedeni ali predstavljeni kot uspešni.
- Preverjen je samo razpoložljivi Chromium, vključno z mobilno emulacijo;
  Firefox, WebKit in fizične naprave niso preverjeni.
- Bajti prenosa so preverjeni neposredno. Datoteke niso bile uvožene v
  zunanje preglednične programe; sistemski dialog za shranjevanje in njegov
  preklic nista bila ročno preverjena.
- Ni preizkusa izčrpanja pomnilnika pri zelo velikih podatkih ali simulacije
  napake `Blob`/objektnega URL-ja; zgornja meja števila opravil ni dodana.
- Noben potreben korak ni ostal blokiran zaradi dovoljenj okolja. Uporabljene
  so bile samo lokalne storitve naloge, brez dodatnih agentov ali odvisnosti.
