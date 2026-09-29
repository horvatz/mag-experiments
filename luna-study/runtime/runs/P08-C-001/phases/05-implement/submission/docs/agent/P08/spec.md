# P08: Koledarski pregled rokov

## Problem in kontekst

Folio uporabniku že omogoča izbiro projekta ter pregled opravil v preglednici ali na tabli. Opravila se berejo iz javnega API-ja; pregled je bralni. P08 doda koledarsko razvrščanje rokov, pet številčnih povzetkov in filter skupine. Uporabnik mora lahko spreminjati referenčni datum za pregled, ne da bi spreminjal opravila. Dopolnitev ohrani potrjeni videz in prilagodljivo obnašanje Folia iz `docs/dizajn.md`.

Začetno stanje P08 in vedenje po osvežitvi ali menjavi projekta sta določena: referenčni datum `2026-09-21`, izbrana skupina `all`. Opis velja za poljuben veljaven seznam opravil trenutnega projekta, tudi prazen seznam, podvojene naslove, Unicode besedilo in neprivzeti vrstni red. Identiteta opravila je `id`, ne naslov.

## Vhodi, dejanja in izidi

| Vhod ali dejanje | Pogoji | Izid |
| --- | --- | --- |
| Naloži oziroma izberi projekt | Uporabi obstoječa `GET /api/projects` in `GET /api/projects/:id/tasks`; opravila pripadajo izbranemu projektu. | Po uspešnem nalaganju se opravila razvrstijo glede na začetni referenčni datum in `all`. Obstoječe stanje nalaganja in napake ostane v veljavi. |
| Spremeni `Referenčni datum` | Kontrola je `input type="date"`; veljaven datum je koledarski `YYYY-MM-DD`. | Veljaven vnos postane novi referenčni datum in takoj preračuna skupine, števce ter prikazane vrstice. |
| Izprazni datum | Vrednost polja je prazna. | Polje ostane prazno, prikaže se `role="alert"` z besedilom `Vnesi veljaven referenčni datum.`; izračun še naprej uporablja zadnji veljavni datum. |
| Izberi pogled rokov | Vrednost je `all`, `overdue`, `today`, `week`, `later` ali `done`. | Prikazane so vse naloge oziroma naloge iz izbrane skupine; datumi in stanja nalog se ne spreminjajo. |
| Preklopi preglednico/tabla | Projekt ostane isti. | Drugi prikaz uporabi iste filtrirane ID-je in ohrani referenčni datum, besedilo datuma ter izbrano skupino. |
| Zamenjaj projekt ali osveži stran | Uporabi obstoječo navigacijo oziroma osvežitev. | Datum in skupina se ponastavita na začetni vrednosti. Filtrirno stanje se ne obnovi iz shrambe ali URL-ja. |

Pregled ne kliče zapisovalnih API-jev in ne spremeni polj opravila. Obstoječi bralni pogled podrobnosti ostane dostopen. Aplikacija uporablja samo `/api/`; nadzorovani odzivi in poti `/__test/` so pripomočki testnega programa, ne del uporabniškega vmesnika.

## Zahteve in pravila

Naj bo `P` trenutno izbrani projekt, `T(P)` njegov seznam opravil iz API-ja v izvornem vrstnem redu, `D` zadnji veljavni referenčni datum, `F` izbrana skupina ter `V` prikaz (`table` ali `board`). Vsako `dueDate` je veljaven koledarski datum `YYYY-MM-DD`. `D + n` pomeni koledarski datum, dobljen s prištetjem `n` dni; računanje ne sme biti odvisno od časovnega pasu ali ure na napravi.

Pripadajočo skupino določimo s predikatom:

```text
group(t, D) =
  done                         če t.status = done
  overdue                     če t.status ≠ done in t.dueDate < D
  today                       če t.status ≠ done in t.dueDate = D
  week                        če t.status ≠ done in D < t.dueDate ≤ D + 7
  later                       če t.status ≠ done in t.dueDate > D + 7
```

Primerjava in prištevanje sta koledarska. Za veljavna datuma `YYYY-MM-DD` primerjava ne vključuje časa; prištevanje mora pravilno prečkati meje meseca in leta ter prestopni februar. Vrstni red opravil znotraj skupine izhaja iz `T(P)`, saj filtriranje seznama vrstni red ohrani.

Prikazani seznam `L` je `T(P)`, kadar je `F = all`, sicer je to podseznam `T(P)`, za katerega velja `group(t,D) = F`. Število skupine `g` je `count(g) = |{t ∈ T(P) : group(t,D) = g}|`; vseh pet števil se računa iz celotnega projekta ne glede na `F`. Tabla lahko seznam `L` razdeli v obstoječe stolpce statusov; unija ID-jev njenih kartic mora biti enaka ID-jem vrstic preglednice za isti `P`, `D` in `F`.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Ob začetku projekta, osvežitvi in menjavi projekta je `D = 2026-09-21` in `F = all`, ne glede na uro ali datum naprave. | T-R01: preveri začetno stanje, osveži in zamenjaj projekt pod različnimi sistemskimi datumi. |
| R02 | `t.status = done ⇒ group(t,D) = done`, ne glede na rok. Opravilo done ni član nobene odprte skupine. | T-R02: zaključena opravila s preteklim, današnjim in prihodnjim rokom. |
| R03 | Za odprto opravilo: `dueDate < D ⇒ overdue`; `dueDate = D ⇒ today`. | T-R03: roka dan pred D, na D in primerjava števcev/skupin. |
| R04 | Za odprto opravilo: `D < dueDate ≤ D+7 ⇒ week`; `dueDate > D+7 ⇒ later`. Pet skupin je paroma disjunktnih in njihova unija je `T(P)`. | T-R04: meje D+1, D+7, D+8; preveri, da je vsako opravilo v natanko eni skupini. |
| R05 | `D+n` je koledarsko prištevanje dni, ne časovni zamik; razvrščanje je neodvisno od časovnega pasu in poletnega časa. | T-R05: prehod meseca in leta, prestopni ter običajni februar in različni časovni pasovi izvajanja brskalnika. |
| R06 | Za vsak `g ∈ {overdue,today,week,later,done}` je prikazanih `count(g)` opravil projekta P; sprememba F teh števil ne spremeni. Vsak element ima `aria-label="Število rokov <g>"` in samo številsko vrednost. | T-R06: primerjaj pet števcev s celotnim seznamom in nato spreminjaj filter; preveri dostopna imena in vrednosti. |
| R07 | Kontrola je HTML `select` z oznako `Pogled rokov` in vrednostmi `all/overdue/today/week/later/done`. Filter `all` pokaže `T(P)`, ostali ustrezno skupino v izvornem vrstnem redu; izbor ne spreminja `dueDate` ali `status`. | T-R07: izberi vsako možnost, preveri ID-je in vrstni red ter nespremenjene podatke. |
| R08 | Veljaven nov datum `D'` takoj zamenja D in preračuna števce/vrstice, F pa ostane enak. Prazna vrednost nastavi besedilo polja na prazno, prikaže točno opozorilo iz dogovora in pusti D ter izračun pri zadnji veljavni vrednosti. Naslednji veljaven datum opozorilo odstrani. | T-R08: sprememba datuma ob izbranem filtru, brisanje vnosa in vnos veljavnega datuma. |
| R09 | Za isti P, D in F sta množici `data-task-id` v preglednici in na tabli enaki. Preklop V ohrani D, trenutno besedilo datuma in F. | T-R09: zajemi ID-je v obeh pogledih ter preklapljaj pogled z veljavnim in praznim besedilom datuma. |
| R10 | Menjava projekta in osvežitev inicializirata D na `2026-09-21` in F na `all`. Noben podatek o filtru (datum ali skupina) ni v trajni shrambi ali URL-ju. | T-R10: nastavi datum/filter, zamenjaj projekt, vrni se in osveži; preglej URL ter trajno shrambo. |
| R11 | Prazen `T(P)` pomeni nič za vseh pet števcev. Če je projekt neprazen, a je `L` prazen za izbrani F, je prikazano `Ni opravil v izbrani skupini.`; mogoče je izbrati drugo skupino ali `all`. | T-R11: prazen projekt ter neprazen projekt s prazno izbrano skupino, v obeh pogledih. |
| R12 | Podatkovni roki so veljavni datumi `YYYY-MM-DD`, tudi 29. februar v prestopnem letu. Pregled ne pošilja zapisov API-ju; obstoječa polja in bralne podrobnosti ostanejo nespremenjeni, Folio ostane prilagodljiv. | T-R12: preveri veljavne prestopne datume, odsotnost zapisovalnih zahtev/sprememb podatkov, bralne podrobnosti in širino 390 px. |

### Dogovor o vmesniku in ohranitev Folia

- Referenčni datum je `input type="date"` z oznako `Referenčni datum`. Izbira skupine je HTML `select` z oznako `Pogled rokov`.
- Skupine imajo vidna slovenska imena: `Zapadlo`, `Danes`, `Naslednjih 7 dni`, `Pozneje` in `Končano`. Njihove vrednosti so `overdue`, `today`, `week`, `later` in `done`; dodatna vrednost za izbirnik je `all`.
- Prazno polje sproži `role="alert"` z dobesednim besedilom `Vnesi veljaven referenčni datum.`
- Ohranijo se `data-task-id` na vrsticah in karticah, dostopna imena obstoječih pogledov in stolpcev ter `aria-label="Pregled stanj opravil"`. Morebitno novo dejanje ob opravilu je zunaj njegove povezave.
- Pri širini 390 px se širina celotne strani ne poveča; notranje vodoravno drsenje preglednice in table je dovoljeno. Uporabijo se potrjeni Folio, obstoječi gradniki in slogi iz `docs/dizajn.md`.

## Uporabniški scenariji

1. **Pregled začetnih rokov.** Uporabnik odpre projekt. Vmesnik naloži njegova opravila, uporabi `2026-09-21`, izbere `all`, razvrsti vsako opravilo v natanko eno skupino in prikaže pet nefiltriranih števcev.
2. **Pregled posamezne skupine.** Uporabnik izbere `Zapadlo`, `Danes`, `Naslednjih 7 dni`, `Pozneje` ali `Končano`. Vrstice oziroma kartice se omejijo na izbrano skupino, njihov izvorni vrstni red pa se ohrani; števci ostanejo enaki.
3. **Premik referenčnega datuma.** Uporabnik izbere veljaven datum. Skupine, števci in vidna opravila se takoj preračunajo, izbrana skupina ostane ista. Če datum izbriše, vidi opozorilo in zadnji veljaven izračun; z veljavnim datumom nadaljevanje opozorilo odstrani.
4. **Preklop prikaza in navigacija.** Uporabnik preklopi preglednico/tablo in vidi ista filtrirana ID-je ter ohranjen datum, polje in skupino. Ko zamenja projekt ali osveži stran, se datum in skupina vrneta na začetni vrednosti.
5. **Prazen rezultat in bralna uporaba.** Uporabnik pregleda prazen projekt ali skupino brez zadetkov, nato preklopi na drugo skupino oziroma `all`. Lahko odpre obstoječe podrobnosti opravila; pregled ne spremeni podatkov.

## Merila uspeha

- SC-1: Za vsak projekt in veljavno D vsak task pripada natanko eni od petih skupin po zgornjem predikatu; meje D, D+7 in D+8 so pravilne.
- SC-2: Števci se ujemajo z razvrstitvijo celotnega projekta; filter in vrstni red se ujemata z R06–R07.
- SC-3: Prazno/veljavno urejanje datuma ter menjava prikaza/projekta/ponovni zagon sledijo pravilom prehodov R08–R10.
- SC-4: Preglednica in tabla imata iste filtrirane ID-je; prazni primeri in dogovorjeni dostopni vmesnik ustrezajo R09 in R11.
- SC-5: Obstoječi API, podatkovna polja, podrobnosti ter odzivnost potrjenega Folia ostanejo skladni z R12 in omejitvami projekta.

## Izvedba in sledljivost

Spodaj so pričakovane integracijske točke za načrtovanje, ne trditev, da je implementacija že prisotna. Natančna razdelitev logike znotraj `src/` ostaja odločitev izvedbe. Testni ID-ji so načrtovani scenariji, ne obstoječa imena ali dokaz uspešnega zagona.

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | Začetna vrednost datuma in skupine. | T-R01 | `src/App.tsx` – stanje projekta in kontrole datuma/skupine. | Ni izvedeno v fazi specify; test in dokaz sodita v izvedbo. |
| R02 | Prednost `done` pred primerjavo roka. | T-R02 | `src/App.tsx` – razvrščanje projekta. | Ni izvedeno v fazi specify; test in dokaz sodita v izvedbo. |
| R03 | Odprti roki pred D in na D. | T-R03 | `src/App.tsx` – razvrščanje projekta in vidne vrstice. | Ni izvedeno v fazi specify; test in dokaz sodita v izvedbo. |
| R04 | Interval week in later; popolna particija. | T-R04 | `src/App.tsx`; prikaz izbranega seznama v `src/TaskBoard.tsx`. | Ni izvedeno v fazi specify; test in dokaz sodita v izvedbo. |
| R05 | Koledarska primerjava in prištevanje. | T-R05 | `src/` – izračun koledarskega datuma in skupine. | Ni izvedeno v fazi specify; test in dokaz sodita v izvedbo. |
| R06 | Pet števcev iz celotnega T(P). | T-R06 | `src/App.tsx` – povzetek projekta. | Ni izvedeno v fazi specify; test in dokaz sodita v izvedbo. |
| R07 | Izbirnik in filter z ohranjenim vrstnim redom. | T-R07 | `src/App.tsx`; vrstice `src/TaskBoard.tsx`. | Ni izvedeno v fazi specify; test in dokaz sodita v izvedbo. |
| R08 | Veljaven datum, prazen vnos in opozorilo. | T-R08 | `src/App.tsx` – stanje polja ter preračun. | Ni izvedeno v fazi specify; test in dokaz sodita v izvedbo. |
| R09 | Enaka množica ID-jev, ohranjeno stanje ob pogledu. | T-R09 | `src/App.tsx`, `src/TaskBoard.tsx`, obstoječi preklop v `src/navigation.ts`. | Ni izvedeno v fazi specify; test in dokaz sodita v izvedbo. |
| R10 | Ponastavitev brez trajnega/URL stanja. | T-R10 | `src/App.tsx` – življenjski cikel projekta; obstoječa navigacija. | Ni izvedeno v fazi specify; test in dokaz sodita v izvedbo. |
| R11 | Prazni projekt in prazna filtrirana skupina. | T-R11 | `src/App.tsx`, `src/TaskBoard.tsx` – prazna stanja. | Ni izvedeno v fazi specify; test in dokaz sodita v izvedbo. |
| R12 | Veljavni datumi, brez zapisov, ohranjen UI. | T-R12 | `src/App.tsx`, `src/TaskBoard.tsx`, obstoječi bralni pogled `src/TaskDetails.tsx`, slogi v `src/styles.css`. | Ni izvedeno v fazi specify; test in dokaz sodita v izvedbo. |

V tem koraku ni bila izvedena implementacija ali test. Testi izhodišča in ločeni testi P08 ostajajo za poznejšo izvedbo; ni rezultatov, ki bi jih bilo mogoče označiti kot uspešne. Za razvojne primere se lahko uporabi priloženi nadzorovani testni mehanizem, vendar ga aplikacija sama ne uporablja. Končnih testov, ki niso dostopni, ta dokument ne navaja kot izvedenih.

## Odprta vprašanja in omejitve

Za funkcionalno vedenje ni odprtih vprašanj: začetne vrednosti, meje skupin, datum, besedila vmesnika, ponastavitve in bralni obseg določa `task/instructions.md`. Predpostavka, ki jo je treba ohraniti, je veljavnost koledarskih datumov podatkov `dueDate`; poljubno število nalog in vrstni red pa nista omejena. Obstoječe vedenje nalaganja in napak ostane v veljavi. Navigacije med nezaključenim nalaganjem in novih sočasnih sprememb podatkov brez osvežitve se ne širi prek obstoječih regresijskih zahtev.

Izvedba je omejena na `src/`, lastne teste v `tests/agent/` in dokumente v `docs/agent/`. Ne spreminjajo se strežnik, začetni podatki, skupni tipi/testi, nastavitve ali odvisnosti; ni novih zapisovalnih API-jev. Veljajo projektna načela iz `.specify/memory/constitution.md`.
