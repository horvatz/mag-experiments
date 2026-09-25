# P08 — izvedbeni načrt

2026-09-25. Podlaga: [specifikacija in sledljivost R01–R12](spec.md), [ustava](../../../.specify/memory/constitution.md), [izvirna navodila](../../../task/instructions.md) in [Folio](../../dizajn.md). Status: načrt izveden; izidi so v [dnevniku preverjanj](../verification.md).

## Tehnični kontekst

Obstoječa aplikacija uporablja React 19, TypeScript 6, Vite 8, sistemsko pisavo in `lucide-react`. Node 24, Playwright in Chromium so že na voljo. Ne dodajamo odvisnosti in ne spreminjamo nastavitev, strežnika, skupnih tipov ali testov.

`src/App.tsx` vsebuje `ProjectView`, pridobivanje opravil, tri obstoječe števce stanj in preglednico; `TaskBoard.tsx` prikazuje opravila po statusnih stolpcih. `TaskDetails.tsx` in `useResource.ts` že urejata bralne podrobnosti ter nalaganje/napake. `navigation.ts` uporablja hash poti in obstoječi parameter pogleda. `App` že uporablja `<ProjectView key={project.id}>`. `formatDate.ts` že prikazuje datum v UTC; ostane nespremenjen.

Javni podatkovni tok ostane `/api/projects`, `/api/projects/:id/tasks` in `/api/tasks/:id`. Za novo funkcijo niso potrebni dodatni zahtevki. Skupni tip `Task` se samo uvozi.

## Odločitve in zasnova

1. **Koledarska pravila kot čiste funkcije** (`src/deadlines.ts`, R02–R07). Datum `YYYY-MM-DD` pretvorimo z izrecnim UTC časom `T00:00:00Z` v zaporedno številko dneva. Razlika teh števil je koledarska razdalja, brez lokalnega časovnega pasu, DST ali posebne obravnave mesecev. Ne uporabljamo trenutne ure ali lokalnih konstruktorjev datuma. Pravila `done`, `<0`, `=0`, `1..7`, `>7` sledijo predikatom v specifikaciji. Skupne konstante določijo začetni datum, ključe in slovenska imena skupin. Tipi skupine in filtra ostanejo lokalni kodi v `src/`.
2. **Projektno stanje** (`ProjectView`, R01, R08–R10). React `useState` hrani trenutno besedilo in zadnji veljavni referenčni datum, začetno oba `2026-09-21`, ter filter `all`. Ob veljavnem nepraznem vnosu posodobi oba datuma; ob praznem samo besedilo. Opozorilo izhaja iz praznega besedila. Brez učinkov za sinhronizacijo izpeljanih vrednosti. Obstoječi ključ projekta ponastavi stanje ob menjavi, osvežitev ponovno inicializira komponento; sprememba pogleda ne spremeni ključa. Ni zapisovanja v URL ali shrambo.
3. **En podatkovni tok** (`ProjectView`, R06–R09). Iz celotnega nespremenjenega `tasks` izračunamo pet števcev in stabilno filtrirano zaporedje. Obstoječi števci stanj še naprej izhajajo iz vseh opravil. Preglednica in `TaskBoard` prejmeta iste filtrirane podatke. Ne sortiramo, ne spreminjamo objektov, ne izbiramo po naslovu. Tabla ohrani obstoječe statusne stolpce in relativni vrstni red znotraj njih. Izračun je linearen; predpomnjenje ni potrebno.
4. **Kontroli in števci** (`App.tsx`, R01, R06–R08, R12). Nad prikazom opravil dodamo povezani oznaki in native `date`/`select` kontroli ter pet številskih elementov z dogovorjenimi `aria-label`. Točna opozorila, imena skupin in vrednosti možnosti sledijo specifikaciji. Ohranimo obstoječa dostopna imena, `data-task-id`, povezave in pregled stanj. Nobena nova kontrola ni v povezavi opravila.
5. **Prazni izidi** (`App.tsx`, R11). Števci praznega projekta so nič; njegovo obstoječe prazno stanje ostane. Pri nepraznem projektu in nič vidnih opravil pokažemo predpisano sporočilo, kontroli in preklop pogleda ostanejo na voljo. Tabla lahko še vedno pokaže obstoječe prazne statusne stolpce; predpisano sporočilo mora biti prisotno tudi v tem pogledu.
6. **Folio in odzivnost** (`styles.css`, R12). Dodamo samo sloge novih kontrol in petih števcev z obstoječimi spremenljivkami, nevtralnimi površinami, zaobljenimi robovi in vidnim fokusom. Kontrole se prelomijo, mreža števcev se prilagodi razpoložljivi širini. Pri 390 pik ne sme nastati drsenje cele strani. Postavitev navigacije, modri znak F in obstoječe notranje drsenje ostanejo.

## Datoteke in vrstni red izvedbe

| Datoteka | Predvideni poseg | Zahteve |
| --- | --- | --- |
| `src/deadlines.ts` (nova) | Konstante, tipi in koledarska razvrstitev/števci brez stranskih učinkov | R01–R07 |
| `src/App.tsx` | Lokalno stanje, kontrole, števci, skupni filter, prazni izidi | R01, R06–R12 |
| `src/styles.css` | Slogi novih kontrol in števcev ter prilagoditev ozki širini | R12 |
| `tests/agent/P08.spec.ts` (nova) | Dodatni scenariji za koledarske meje, domensko raznolikost, stanje in prikaz | R01–R12 |
| `docs/agent/P08/spec.md` | Dopolnitev obstoječega registra s konkretnimi mesti kode, testi in izidi; zgodovina | R01–R12 |
| `docs/agent/verification.md` in dnevniki | Kratki rezultati izvedenih ukazov, dokazila in omejitve | R01–R12 |

Najprej izvedemo čisto koledarsko logiko, nato povezavo s projektnim prikazom in sloge, nato dodatna preverjanja ter skupni pregled in posodobitev dokazil. `TaskBoard.tsx` potrebuje samo filtrirane props; `TaskDetails.tsx`, `navigation.ts`, `useResource.ts` in `formatDate.ts` predvidoma ne potrebujejo sprememb.

## Preverjanje in dokazila

Uporabimo nespremenjeno Playwright konfiguracijo: projekt `agent` že odkriva `tests/agent/**/*.spec.ts`, razvojna projekta izvajata P08 na namizju in mobilniku, skupni projekti preverjajo API in Folio. Obstoječi `tests/development/helpers.ts` se lahko uvozi samo v lastne teste; omogoča nadzorovane GET odgovore, poljubne podatke ter nadzor zapisov. Uporabniška koda ga ne uvaža.

Dodatni testi se osredotočijo na vrzeli štirih razvojnih primerov D01–D04:

- S01/S02/S04: začetni datum ob drugačni uri naprave, več kot deset opravil, done s preteklim/današnjim/prihodnjim rokom, meje −1/0/+1/+7/+8, neurejen vhod in podvojeni naslovi; vseh šest filtrov in nespremenjeni števci.
- S03: konec meseca in leta, prestopni februar, DST; iste pričakovane skupine v več časovnih pasovih z nastavitvijo posameznih Playwright kontekstov, brez spremembe konfiguracije. Pričakovani ID-ji in števci se določijo iz scenarijev, ne s klicanjem iste implementacije za izračun pričakovanega rezultata.
- S05/S06: sprememba datuma ob aktivnem filtru, prazno polje in preklop obeh pogledov, ponovna veljavna vrednost, menjava/vrnitev projekta, osvežitev, odsotnost filtra v shrambi in URL.
- S07/S08: nič in eno opravilo, prazna skupina v obeh pogledih, vrnitev na `all`, Unicode/ločila, nespremenjene bralne podrobnosti, nič API-zapisov in širina 390 pik. Pregledamo tudi dejanski posnetek ozkega prikaza.

Po izvedbi zaženemo `npm run lint`, `npm run build` (vključuje preverjanje tipov) in `npm test` (skupni, razvojni in lastni testi). Izhode shranimo v `docs/agent/P08/`; ob napaki popravimo dovoljeno kodo/test in ponovimo prizadeto preverjanje. Neizvedene ali nedostopne teste izrecno označimo. Načrt ne trdi, da je katero od preverjanj že uspelo.

## Skladnost in omejitve

Načrt ostaja v dovoljenih `src/`, `tests/agent/` in `docs/agent/`; procesna pot je že nastavljena. Ne spreminja infrastrukture, odvisnosti, izvornih podatkov ali uradnih dokumentov. Ni novih funkcionalnih zahtev, zunanjih meritev, agentov, vej ali commitov. Izvedba in testi so dokumentirani v [dnevniku preverjanj](../verification.md); končni testi niso dostopni. Meje nalaganja in sočasnih sprememb ostanejo kot v izvirnih navodilih.

## Zapis izvedbe

2026-09-25: izvedene predvidene tri datoteke v `src/` in dodatni testi. Po zadnjih navodilih je osrednji dnevnik `docs/agent/verification.md`. API, infrastruktura in odvisnosti niso zahtevali sprememb.
