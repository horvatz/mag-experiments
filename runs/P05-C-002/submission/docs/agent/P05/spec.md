# P05 — Straničenje in filter stanja

Različica 1.1 · 2026-09-23 · status: implementirano; celotno preverjanje uspešno (58/58).

## Problem in kontekst

Uporabnik Folio želi omejiti število hkrati prikazanih opravil in prikazati le izbrano stanje. Izhodiščni `ProjectView` v [App.tsx](../../../src/App.tsx) prikazuje celoten projekt v preglednici ali tabli, omogoča podrobnosti in prikazuje skupne števce. Dodamo filter ter skupno straničenje obeh pogledov; izvorni podatki ostanejo nespremenjeni.

Merilo so vseh dvanajst zahtev in dogovor o vmesniku iz [izvirnih navodil](../../../task/instructions.md), [projektna pravila](../../../PROJECT_RULES.md), [potrjeni dizajn Folio](../../dizajn.md) in [ustava](../../../.specify/memory/constitution.md). Ta dokument izpolnjuje [skupno predlogo](../../../task/specification-template.md). Nova funkcionalnost ne vključuje urejanja opravil, novih API-jev, shranjevanja nastavitev ali prenove arhitekture.

## Vhodi, dejanja in izidi

Vir je obstoječi javni `/api/`: projekti in urejeno polje opravil izbranega projekta. Projekt ima `id` in `name`; opravilo ima `id`, `projectId`, `title`, `description`, `status`, `assignee` in `dueDate`, skladno z obstoječimi skupnimi tipi. `status` je `todo`, `in_progress` ali `done`. ID-ji so enkratni, naslovi se lahko ponovijo. Izbira in povezave temeljijo na ID-ju. Število opravil je poljubno, tudi 0, 1 ali več kot 10. Besedila so navadno besedilo, lahko vsebujejo Unicode in ločila; datumi so veljavni koledarski datumi. Vsako opravilo pripada svojemu projektu. Vrstni red iz API-ja je merodajen.

| Dejanje oziroma stanje | Pogoj in izid |
| --- | --- |
| Prvi prikaz projekta | Po uspešnem nalaganju: velikost `all`, filter `all`, prva stran in vsa opravila. |
| Izbira velikosti | HTML `select` z dostopnim imenom `Velikost strani`, vrednosti `all`, `2`, `5`, `10`; sprememba ponastavi stran na prvo. |
| Izbira filtra | HTML `select` z dostopnim imenom `Filter strani`, vrednosti `all`, `todo`, `in_progress`, `done`; sprememba filtrira celoten projekt in ponastavi stran na prvo. |
| Premik strani | Gumbi `Prva stran`, `Prejšnja stran`, `Naslednja stran`, `Zadnja stran`; veljaven premik spremeni le stran, neveljaven je onemogočen in brez učinka. |
| Preklop Preglednica/Tabla | Stran, velikost in filter ostanejo isti; spremeni se samo razporeditev trenutnega odseka. |
| Odpiranje podrobnosti | Obstoječa povezava odpre pravilno opravilo po ID-ju; stran, velikost in filter ostanejo isti. |
| Zapiranje oziroma preklic podrobnosti | Obstoječi gumb ali Escape zapre podrobnosti in ohrani stran, velikost, filter ter obstoječe ravnanje s fokusom. |
| Menjava projekta ali osvežitev brskalnika | Velikost in filter se ponastavita na `all`, stran na prvo; vrnitev v prejšnji projekt ne obnovi starih nastavitev. |
| Nalaganje, napaka in ponovni poskus | Ohrani obstoječe prikaze nalaganja, napak in ponovnega poskusa prek javnega API-ja. Napaka nalaganja ni prazen uspešen rezultat. Ne dodajamo novih stanj napak ali preklica za lokalne selektorje. |

Status ima `role="status"` in `aria-label="Stanje straničenja"` ter natančno besedilo, določeno spodaj. Ohranijo se `data-task-id` na vrsticah in karticah, dostopna imena pogledov in stolpcev ter `aria-label="Pregled stanj opravil"`. Nova dejanja ob opravilu morajo biti zunaj njegove povezave. Razporeditev novih kontrol in druga besedila niso predpisana; uporabijo obstoječi slog Folio, slovenska poimenovanja in vidni fokus. Pri širini 390 pik ni vodoravne razširitve celotne strani; notranje drsenje preglednice in table je dovoljeno.

## Zahteve in pravila

### Model in predikati

`T` je urejeno polje vseh opravil projekta, `f` izbrani filter, `s ∈ {all, 2, 5, 10}` velikost in `p` interna stran, šteta od 1. `F = [t ∈ T | f = all ∨ t.status = f]`, z ohranjenim izvornim vrstnim redom. `N = |F|`. Če `N = 0`, je število strani `Y = 0`; sicer `Y = 1` za `s = all` oziroma `Y = ceil(N / s)`.

Za neprazen rezultat velja `1 ≤ p ≤ Y`; pri praznem rezultatu ostane interna začetna stran `p = 1`, uporabniški prikaz strani pa je 0. Za `N > 0` sta `A = 1`, `B = N`, kadar `s = all`; sicer `A = (p − 1) · s + 1`, `B = min(p · s, N)`. Trenutni odsek `V = F[A − 1 : B]` uporablja izključni zgornji indeks; pri `N = 0` je `V = []` in `A = B = 0`.

- **Razrez:** za fiksna `T`, `f`, `s` zaporedna konkatenacija vseh strani vrne `F`; množice ID-jev različnih strani so disjunktne. Noben ID ni izgubljen ali podvojen.
- **Pogleda:** `IDs(preglednica) = IDs(V)` v istem vrstnem redu; množica `IDs(tabla) = množica IDs(V)`. Posamezni stolpec table je `V` filtriran po svojem stanju in ohrani relativni vrstni red. Globalni vrstni red DOM table lahko zaradi združevanja odstopa od preglednice.
- **Števci:** skupni števec je `|T|`; pregled stanja `q` je `|[t ∈ T | t.status = q]|`; števec stolpca `q` je `|[t ∈ V | t.status = q]|`.
- **Nespremenljivost:** lokalna dejanja filtra in straničenja ohranijo vse podatke `T`; število zapisovalnih API zahtev, povzročenih s temi dejanji, je 0. V URL ali trajno shrambo ne zapisujejo `p`, `s` ali `f`.

| Dogodek | Prehod `(s, f, p)` |
| --- | --- |
| Začetek, menjava projekta, osvežitev brskalnika | `(all, all, 1)` |
| Sprememba velikosti na `s′` | `(s′, f, 1)`, tudi če bi bila stara stran še veljavna |
| Sprememba filtra na `f′`, tudi odstranitev filtra | `(s, f′, 1)` |
| Prva / prejšnja, če `N > 0 ∧ p > 1` | `(s, f, 1)` / `(s, f, p − 1)` |
| Naslednja / zadnja, če `N > 0 ∧ p < Y` | `(s, f, p + 1)` / `(s, f, Y)` |
| Neveljaven premik, preklop pogleda, odprtje ali zaprtje podrobnosti | `(s, f, p)` |

Pri `N = 0` so vsi štirje gumbi onemogočeni; sicer sta prva in prejšnja onemogočena natanko pri `p = 1`, naslednja in zadnja natanko pri `p = Y`.

### Sprejemni pogoji

Scenariji S01–S08 spodaj določajo preverjanje; dejanski izidi so v poročilu. Posamezni primer ne omejuje splošnega pravila.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Privzeto `(all, all, 1)` in vsa opravila v vrstnem redu API-ja. | S01: vrednosti selektorjev, zaporedje ID-jev. |
| R02 | Velikosti 2/5/10 tvorijo disjunktne zaporedne odseke `F`, zadnji je lahko krajši. | S02: obhod vseh strani, konkatenacija in enkratnost ID-jev; D01, D02. |
| R03 | Štirje gumbi sledijo prehodom in robnim pogojem; neveljavno dejanje je onemogočeno in ne spremeni stanja. | S02: vsi premiki in robovi; D01, D02. |
| R04 | Vsaka sprememba velikosti vrne na prvo stran, tudi ko je prejšnja številka še veljavna; `all` ima pri `N > 0` eno stran. | S03: spremembe med vsemi velikostmi z višjih strani; D04. |
| R05 | Filter se uporabi pred razrezom in ohrani relativni vrstni red; vsaka sprememba vrne na prvo stran. | S03: vsi filtri, filter z višje strani, vrnitev na `all`; D03. |
| R06 | Oba pogleda prikazujeta iste ID-je `V`; tabla šele nato združuje po stanju. | S04: primerjava ID-jev, skupin in vrstnega reda v stolpcih; D03. |
| R07 | Preklop pogleda ter odprtje/zaprtje podrobnosti ohranijo `(s, f, p)`. | S04: ponovljen preklop in pravilne podrobnosti v obeh pogledih. |
| R08 | Menjava projekta in osvežitev vrneta `(all, all, 1)`; stanje ni shranjeno trajno ali v URL-ju. | S05: menjava in vrnitev projekta, reload, pregled URL in shrambe. |
| R09 | Pri `N > 0` je besedilo natanko `Stran X od Y. Prikazano A–B od N.`, kjer `X = p` in veljajo zgornje formule. | S02, S03: prve, vmesne, zadnje strani in filtrirani imenovalec; D02. |
| R10 | Pri `N = 0` je besedilo natanko `Stran 0 od 0. Prikazano 0–0 od 0.`; vsi štirje gumbi so onemogočeni. Odstranitev filtra vrne prvo stran. | S06: prazen projekt in prazen filter v obeh pogledih ter odstranitev filtra. |
| R11 | Skupno število in pregled stanj izhajata iz `T`; števci stolpcev iz `V`. | S04: števci pred/po filtriranju in premiku strani, tudi prazni stolpci. |
| R12 | Ni sprememb podatkov ali zapisov na API zaradi straničenja; obstoječe povezave, ID-ji, podrobnosti, nalaganje in prilagodljivi Folio ostanejo uporabni. | S07, S08 in skupni regresijski testi; D04. |

## Uporabniški scenariji in merilo uspeha

- **S01 — začetni prikaz:** uporabnik odpre projekt; selektorja sta `all`, vidi vse izvorne ID-je. Ponovi z enim opravilom in s preurejenimi podatki z enakimi naslovi.
- **S02 — strani in robovi:** uporabnik za vsako velikost 2/5/10 prehodi projekt z več kot deset opravili, uporabi vse štiri premike, preveri krajšo zadnjo stran, onemogočene robove in natančen status. Skupni seznam ID-jev se ujema z vhodom.
- **S03 — spremembe nastavitev:** uporabnik z višje strani spremeni velikost, tudi ko bi bila stara stran še veljavna. Nato preizkusi vsak filter, prehodi filtrirane strani, zamenja filter ter obnovi `all`; vedno se začne na prvi strani novega rezultata.
- **S04 — usklajeni pogledi in podrobnosti:** uporabnik nastavi filter in višjo stran, preklopi v tablo in nazaj ter odpre/zapre pravo opravilo po ID-ju. Preveri ohranitev vseh nastavitev, ID-je in števce celotnega projekta proti števcem trenutne strani.
- **S05 — življenjska doba stanja:** uporabnik nastavi velikost, filter in stran, zamenja projekt, se vrne in osveži brskalnik. Vsak reset vrne privzete vrednosti; nove nastavitve niso v URL-ju ali trajni shrambi.
- **S06 — praznina:** uporabnik odpre prazen projekt ali izbere stanje brez ujemanj. Oba pogleda kažeta nič opravil, prazen status in štiri onemogočene premike. Odstranitev filtra na nepraznem projektu pokaže prvo stran.
- **S07 — nespremenjeni podatki in regresije:** spremljanje zahtev potrdi odsotnost zapisov ob novih dejanjih. Obstoječi testi preverijo povezave, podrobnosti, napake, nalaganje in ponovni poskus; posebni ID-ji in ponovljeni naslovi ne zamenjajo opravil.
- **S08 — dostopnost in Folio:** pri širini 390 pik so kontrole dosegljive, tipkovnični fokus viden in dokument ni širši od okna. Preglednica in tabla se lahko pomikata interno. Ohranijo se navedene oznake, atributi in potrjeni vizualni gradniki.

Uspeh pomeni izpolnitev vseh R01–R12 in dogovora o vmesniku na opisani domeni podatkov, podprto z dejansko izvedenimi razvojnimi, dodatnimi in skupnimi testi. Ne uvajamo zunanjih meritev ali novih funkcionalnih ciljev.

## Izvedba in sledljivost

Spodnji deli kode so dejanska mesta izvedbe oziroma ohranjenega vedenja. Natančne lokacije, ukazi, izidi in omejitve so v [poročilu preverjanja](../verification.md). D01–D04 so obstoječi testi v [tests/development/P05.spec.ts](../../../tests/development/P05.spec.ts). S01–S08 so izvedeni v [lastnih testih](../../../tests/agent/P05.spec.ts); dokazila so v [celotnem dnevniku](check.log). Skupni testi so [baseline.spec.ts](../../../tests/baseline.spec.ts) in [api.spec.ts](../../../tests/api.spec.ts).

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | Privzeto stanje in vrstni red | S01 | `src/App.tsx`: ProjectView | Uspešno; [izid in dokaz](../verification.md#sledljivost-r01r12). |
| R02 | Razrez brez izgub/podvojitev | S02; D01, D02 | `src/App.tsx`: izpeljava prikazanih opravil | Uspešno; [izid in dokaz](../verification.md#sledljivost-r01r12). |
| R03 | Premiki in robovi | S02; D01, D02 | `src/App.tsx`: nove kontrole | Uspešno; [izid in dokaz](../verification.md#sledljivost-r01r12). |
| R04 | Reset ob velikosti | S03; D04 | `src/App.tsx`: stanje velikosti/strani | Uspešno; [izid in dokaz](../verification.md#sledljivost-r01r12). |
| R05 | Filter pred stranjo | S03; D03 | `src/App.tsx`: filter in izpeljava | Uspešno; [izid in dokaz](../verification.md#sledljivost-r01r12). |
| R06 | Skupni odsek obeh pogledov | S04; D03 | `src/App.tsx`: preglednica in podajanje v TaskBoard; `src/TaskBoard.tsx`: stolpci | Uspešno; [izid in dokaz](../verification.md#sledljivost-r01r12). |
| R07 | Ohranitev nastavitev | S04 | `src/App.tsx`: ProjectView; `src/TaskDetails.tsx`: close | Uspešno; [izid in dokaz](../verification.md#sledljivost-r01r12). |
| R08 | Reset življenjske dobe | S05 | `src/App.tsx`: ključ projekta in lokalno stanje | Uspešno; [izid in dokaz](../verification.md#sledljivost-r01r12). |
| R09 | Natančen neprazen status | S02, S03; D02 | `src/App.tsx`: novi status | Uspešno; [izid in dokaz](../verification.md#sledljivost-r01r12). |
| R10 | Prazen rezultat | S06 | `src/App.tsx`: praznina, status in kontrole | Uspešno; [izid in dokaz](../verification.md#sledljivost-r01r12). |
| R11 | Pravilni obsegi štetja | S04 | `src/App.tsx`: counts, count-badge; `src/TaskBoard.tsx`: entries | Uspešno; [izid in dokaz](../verification.md#sledljivost-r01r12). |
| R12 | Brez zapisov, regresije in videz | S07, S08; D04; skupni testi | `src/App.tsx`, `src/styles.css`; obstoječi `src/api.ts`, `src/useResource.ts`, `src/navigation.ts`, `src/TaskDetails.tsx` | Uspešno; [izid in dokaz](../verification.md#sledljivost-r01r12). |

## Odprta vprašanja in omejitve

Ni bistvenih odprtih vprašanj. Osvežitev pomeni osvežitev brskalnika; ne dodajamo gumba za osvežitev. Interna stran 1 pri praznini je modelna konvencija, prikaz je zahtevana stran 0. Izgled novih kontrol ni predpisan in mora slediti Folio. Navigacije med nedokončanim nalaganjem in novih sočasnih sprememb podatkov ne širimo čez obstoječe regresijske zahteve.

Aplikacija ne uporablja `/__test/` ali razvojnih testnih pripomočkov; nadzorovani GET odgovori so dovoljeni samo v testih. Infrastruktura, strežnik, skupni tipi, odvisnosti, skupni testi ter uradne predloge in veščine ostanejo nespremenjeni. Dovoljene poti določa ustava.

Implementacija je preverjena z `npm run check`: lint, tipi, gradnja in 58/58 uspešnih testov. Končni skriti testi niso dostopni. Izbira nativnega selektorja samo s tipkami v povezanem brskalniku ni potrjena; izbor prek `selectOption`, prehod fokusa s Tab in gumb z Enter so preverjeni. Podrobnosti in ohranjeni začetni neuspešni dnevniki so v [poročilu](../verification.md).

## Zgodovina sprememb

- 2026-09-23, 1.0: začetna specifikacija vseh R01–R12, model prehodov, scenariji in začetna sledljivost po skupni predlogi.

- 2026-09-23, 1.1: izvedba, 12 lastnih testov in 58/58 uspešnih preverjanj; dopolnjena sledljivost in omejitev avtomatizacije nativnega selektorja.
