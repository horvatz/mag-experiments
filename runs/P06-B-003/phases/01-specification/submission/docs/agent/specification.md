# P06: Nastavljiv izvoz CSV — specifikacija

## Problem in kontekst

Uporabnik izvozi opravila trenutnega projekta v lokalno datoteko CSV z izbiro kolon, statusa in ločila. Obstoječi slovenski vmesnik in dizajn Folio ostaneta ohranjena. Izvirne zahteve v `task/instructions.md` so obvezne. Različica 1.0, pripravljena za implementacijo po statičnem pregledu kode; izvoz še ni implementiran.

Izhodišče: `src/App.tsx` bere projekte in opravila ter prikazuje preglednico oziroma `src/TaskBoard.tsx`. Podrobnosti bere `src/TaskDetails.tsx`. `ProjectView` ima `key={project.id}`: menjava projekta ga ponovno ustvari, preklop pogleda pa ohrani. Nastavitve izvoza sodijo v ta projektni obseg, zunaj vejitve pogledov.

## Vhodi, dejanja in izidi

Vhod so opravila trenutnega projekta iz javnega `/api/`, s polji `id`, `projectId`, `title`, `status`, `assignee`, `dueDate`, `description`. Kontrole: sedem checkboxov `Stolpec <ime>`, HTML select `Ločilo CSV` (`;`, `,`), HTML select `Filter izvoza` (`all`, `todo`, `in_progress`, `done`) in gumb `Izvozi CSV`. Privzeto so izbrane vse kolone, filter `all`, ločilo `;`. Brez kolon ali ustreznih opravil ni prenosa. Uspeh prenese `folio-<projectId>.csv`, ne navigira in ne zapisuje na API.

`shared/types.ts` določa vsa polja `Task` kot obvezne nize, `status` pa kot unijo `todo | in_progress | done`. Datum je veljaven izvirni koledarski niz `YYYY-MM-DD`. Projekti imajo `id` in `name`. Uporabi že pridobljeni odgovor GET `/api/projects/<encodeURIComponent(project.id)>/tasks`; ne zbiraj podatkov iz DOM-a, ne omejuj števila vrstic in ne združuj enakih naslovov. Odgovor vsebuje opravila tega projekta v vrstnem redu API-ja; identiteta je vedno `id`. Veljajo tudi nič, ena in več kot deset vrstic, drugačni ID-ji, enaki naslovi in poljubno zaporedje.

Sprememba kontrole sama ne prenese datoteke. Uspešen izvoz ne spremeni nastavitev ali opravil. Preklic prenosa v brskalniku ne zahteva spremembe stanja aplikacije. Med nalaganjem ali ob napaki API ni izvoza brez veljavnih podatkov; ohrani obstoječe stanje nalaganja, sporočilo napake in ponovni poskus. Poseben dialog za izvoz, trajna shramba in zapis nastavitev v URL niso zahtevani.

## Zahteve in pravila

Naj bo `T` izvorno polje opravil trenutnega projekta, `C = [id, projectId, title, status, assignee, dueDate, description]`, `S` množica izbranih kolon, `f` filter in `d` ločilo. `K = C.filter(c => S.has(c))`; `E = T.filter(t => f === 'all' || t.status === f)`. Filtriranje ohrani vrstni red. Velja `enabled ⇔ podatki_naloženi ∧ |K| > 0 ∧ |E| > 0`. Preglednica, tabla, števci in podrobnosti še vedno uporabljajo celotni `T`.

Za izvirni niz `s` definiraj `N(s) = "'" + s`, če ustreza `/^[ \t\r\n]*[=+@-]/`, sicer `N(s) = s`. Upoštevajo se natanko SP, TAB, CR in LF; ne uporabljaj `trim()` ali širšega `\s`. Primer: `" \t=1"` postane `"' \t=1"`; `"x=1"`, že apostrofirani niz, prazen niz in niz z NBSP pred `=` ostanejo nespremenjeni. Apostrof se doda pred vse izvirne začetne presledke. Pravilo uporabi za vsako podatkovno celico, tudi ID, in nikoli za glavo.

`Q(s)` obdaja niz z ASCII dvojnima narekovajema in vsak notranji `"` zamenja z `""`. Natančna vsebina datoteke je UTF-8 kodiranje `U+FEFF + K.map(Q).join(d) + CRLF + E.map(t => K.map(c => Q(N(t[c]))).join(d) + CRLF).join('')`. Prvi trije bajti so `EF BB BF`; meje zapisov so `0D 0A`. Notranjih LF, CR ali CRLF v celicah ne normaliziraj. Prazna podatkovna celica se zapiše kot `""`.

Pravila stanja: začetno stanje je `(S=C, d=';', f='all')`; preklop pogleda ohrani `(S,d,f)`; menjava projekta, tudi vrnitev na prej obiskani projekt, in osvežitev vrneta začetno stanje. Izvoz vedno izračuna datoteko iz trenutnega `(T,S,d,f)`. Za isto projektno stanje velja `bytes(table) = bytes(board)` in `T_po = T_pred`.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Samo opravila trenutnega projekta, izvorni vrstni red; vse kolone, `all`, `;` privzeto. | Preveri privzete kontrole in bajte izvoza obeh projektov. |
| R02 | Dovoljene kolone v stalnem vrstnem redu `id, projectId, title, status, assignee, dueDate, description`. | Izberi podmnožico v drugem vrstnem redu in preveri glavo ter vrednosti. |
| R03 | Ni izbranih kolon ⇒ izvoz onemogočen, brez prenosa; ponovni izbor ga omogoči, kadar so vrstice. | Izklopi vse in znova izberi eno kolono. |
| R04 | Filter `all/todo/in_progress/done` velja le za izvoz; prazni rezultati onemogočijo izvoz in ne ustvarijo prenosa. | Vsi statusi, prazen projekt in prazen rezultat; UI in števci kažejo cel projekt. |
| R05 | Lokalni prenos pravilnega imena, UTF-8 BOM na začetku, brez nove strani ali pošiljanja vsebine. | Preglej surove bajte, ime, navigacijo in omrežje. |
| R06 | Izbrano ločilo `;` ali `,`; vsaka celica, tudi glava, je navedena, notranji narekovaji podvojeni. | Natančna primerjava z obema ločiloma in narekovaji v vrednostih. |
| R07 | CRLF med vrsticami in za zadnjo; izvirni prelomi in ločila znotraj celic ostanejo. | Primerjaj bajte večvrstičnih vrednosti. |
| R08 | Podatkovni niz, ki po začetnih znakih SP/TAB/CR/LF začne z `=`, `+`, `-`, `@`, dobi apostrof na sam začetek pred navajanjem. Glava je izjema. | Nevarni in nenevarni nizi v vseh podatkovnih kolonah. |
| R09 | Unicode, presledki in celotni opisi ostanejo, razen R08; status je interna vrednost, datum izvirni `YYYY-MM-DD`, brez `formatDate`. | Primerjaj izvirne podatke in izvožene vrednosti. |
| R10 | Menjava Preglednica/Tabla ohrani nastavitve in bajte izvoza. | Nastavi izvoz, zamenjaj pogled, primerjaj bajte. |
| R11 | Menjava projekta in osvežitev povrneta privzete nastavitve; zaporedni prenosi uporabljajo trenutne nastavitve. | Spremeni nastavitve, izvozi večkrat, zamenjaj projekt in osveži. |
| R12 | Brez mutacije izvornega polja ali opravil in brez zapisov na API; ohranjene obstoječe bralne funkcije, dostopnost in odzivni dizajn. | Regresije, primerjava podatkov pred/po, nadzor omrežja in pregled pri širini 390 px. |

Ohrani `data-task-id` na vrsticah in karticah, dostopna imena gumbov `Preglednica`/`Tabla`, regije `Tabla opravil`, stolpcev `Pripravljeno`/`V delu`/`Končano` ter `aria-label="Pregled stanj opravil"`. Morebitna nova dejanja ob opravilu so zunaj njegove povezave. Kontrole naj uporabljajo slogovne spremenljivke in gradnike `src/styles.css`, vidni fokus ter prilagodljivo postavitev. Pri širini 390 px velja `document.documentElement.scrollWidth <= window.innerWidth`; notranje vodoravno drsenje preglednice in table je dovoljeno. Ohraniti je treba tudi vizualno usmeritev `docs/dizajn.md` (barve, navigacijo, kartice, sistemsko pisavo). Razpored novih kontrol in dodatna slovenska besedila so prosta.

## Izvedba in sledljivost

Pregledani so bili tipi, komponente, nalaganje/navigacija, relevantni slogi in razvojni testi. V spodnji tabeli so mesta predvidene implementacije, ne trditev, da rešitev že obstaja. `CSV` pomeni predlagani novi čisti modul `src/csv.ts` za pretvorbo v CSV; implementer lahko izbere drugo ime in zabeleži dejansko mesto. `PV` pomeni `src/App.tsx`, funkcijo `ProjectView`. Vsi testi so **NEIZVEDENI** v tej fazi.

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | Izvorni vrstni red, privzete nastavitve, pravi projekt. | D01 + S01. | PV: vir `useResource`, začetno stanje; CSV: izbor vrstic. | Neizvedeno; statično potrjen vir API. |
| R02 | `K` sledi `C`, glava in celice imata iste kolone. | D02 + S02, ponovni izbor v obratnem vrstnem redu. | PV: checkboxi; CSV: stalni seznam kolon. | Neizvedeno; nov del kode. |
| R03 | `|K|=0` prepreči prenos. | S02: vse izklopljeno, ena znova vključena. | PV: stanje in pogoj gumba/izvoza. | Neizvedeno; nov del kode. |
| R04 | `E` filtrira samo izvoz; `|E|=0` prepreči prenos. | D02/D04 + S01/S02; vsi statusi in oba prazna projekta. | PV: filter, polni podatki za UI; CSV: vrstice. | Neizvedeno; nov del kode. |
| R05 | Ime, BOM, lokalni prenos brez navigacije. | D01 + S03/S06; surovi bajti in dogodki strani. | PV oziroma novi izvozni komponent: prenos Blob in začasni URL. | Neizvedeno; nov del kode. |
| R06 | `Q` za vse glave in celice; obe ločili. | D02/D03 + S03: natančni pričakovani bajti. | CSV: narekovaji in sestavljanje. | Neizvedeno; nov del kode. |
| R07 | CRLF za vsak zapis, ohranjeni notranji prelomi. | D01/D03 + S03: LF, CR, CRLF, oba ločila. | CSV: sestavljanje vrstic. | Neizvedeno; nov del kode. |
| R08 | `N` pred `Q`, samo podatkovne celice. | D03 + S04: vsi štirje sprožilci in začetni znaki. | CSV: nevtralizacija, uporabljena za vsako kolono. | Neizvedeno; nov del kode. |
| R09 | Ohranjeni nizi in izvirni status/datum. | D03 + S03/S04: Unicode, presledki, polni opisi. | CSV: neposredno `task[c]`; obstoječi `src/formatDate.ts` le za UI. | Neizvedeno; statično potrjeni tipi. |
| R10 | Preklop pogleda ohrani stanje in bajte. | D04 + S05 z neprvzetimi vsemi tremi nastavitvami. | PV: stanje zunaj pogojnega prikaza; `src/navigation.ts`. | Neizvedeno; statično potrjena življenjska doba PV. |
| R11 | Menjava projekta/osvežitev ponastavi; novi izvoz uporabi nove nastavitve. | S05: A→B→A, osvežitev, zaporedni prenosi. | `src/App.tsx`: `ProjectView key={project.id}` in trenutno stanje ob kliku. | Neizvedeno; statično potrjen projektni ključ. |
| R12 | Brez mutacij/zapisov, regresije in Folio pri 390 px. | D04 + S06, skupni API in baseline testi. | PV, CSV, `src/styles.css`; ohrani `TaskBoard`, `TaskDetails`, `useResource`, `navigation`. | Neizvedeno; vizualni pregled pripada implementerju. |

Obstoječi testi D01–D04 so v `tests/development/P06.spec.ts` (imena: `default file framing`, `selected fields and separator`, `escaped quotes and neutralized formula`, `view parity and no writes`). Pokrivajo le del pravil. Predlagani dopolnilni scenariji za `tests/agent/`:

- **S01 — podatki:** 0, 1 in več kot 10 opravil, različni ID-ji, podvojeni naslovi, premešano zaporedje; oba projekta ter vsi filtri. Primerjaj izvožene ID-je v vrstnem redu API in nespremenjen celotni prikaz/števce.
- **S02 — izbira:** podmnožica kolon s kliki v drugem vrstnem redu; izklop vseh, ponovni vklop; prazna rezultata zaradi projekta in filtra. Preveri `disabled` in odsotnost prenosa.
- **S03 — bajti:** natančna pričakovana datoteka za obe ločili, BOM, končni CRLF, prazne vrednosti, narekovaje, Unicode, vodilne/končne presledke in mešane notranje prelome. Pričakovanje sestavi neodvisno od produkcijskega serializerja.
- **S04 — formule:** vsak od `= + - @` brez predpone in za posameznimi/kombiniranimi SP/TAB/CR/LF; apostrof gre na začetek izvirnega niza. Negativni primeri: navadno besedilo, nevarni znak sredi niza, že začetni apostrof, samo presledki, NBSP pred znakom. Enotni postopek velja za vse kolone, tudi če veljavna domena statusa/datuma nevarnega začetka ne dopušča.
- **S05 — življenjska doba:** nastavi podmnožico kolon, vejico in status, primerjaj prenosa med pogledoma; spremeni vsako nastavitev in takoj znova izvozi; preveri ponastavitev pri A→B→A in osvežitvi v obeh pogledih.
- **S06 — regresije:** omrežje brez zapisov iz izvoznih kontrol, brez pošiljanja CSV, novih strani ali sprememb URL ob izvozu; brez mutacije vhodnih podatkov; podrobnosti po ID, nalaganje/napaka/ponovni poskus, ohranjene oznake in klaviatura. Preglej Folio na namizju in pri 390 px, v obeh pogledih in s kontrolami.

Implementer naj izvede `npm run check` (lint, typecheck/build, skupni in razvojni ter dodani testi) ter smiselne dodatne scenarije in vizualni pregled. Dejanska imena testov, spremenjene datoteke, ukaze, rezultate, dokaze in vrzeli zapiše v lastne implementacijske dokumente v `docs/agent/`; ta specifikacija ostaja v lasti avtorja. Končni nedostopni testi niso dokaz uspeha.

## Odprta vprašanja in omejitve

Specifikacijska faza obsega samo branje in ta dokument. Zagon aplikacije, testi in pregled videza so naloga implementerja. Infrastruktura, odvisnosti, skupni tipi in testi ostanejo nespremenjeni; UI ne uporablja `/__test/`, testnih pripomočkov ali lokalne nadomestne podatkovne shrambe. Obseg navigacije med nalaganjem in sočasnih sprememb se ne širi prek obstoječih regresij.

Ni odprtih vsebinskih vprašanj, ki bi preprečevala implementacijo. Predpostavka glede preklica je odsotnost lastnega izvoznega dialoga; brskalnikov preklic ne spremeni aplikacijskih podatkov. Lokalno stanje nastavitev ne uporablja `localStorage`. Ne uporabljaj drugih projektov, povezovalnikov ali oddaljenih repozitorijev. Dovoljene implementacijske spremembe so `src/`, `tests/agent/` in implementerjevi dokumenti; obstoječi `updateTask` se za izvoz ne uporablja. Nobeno izvajalno ali vizualno preverjanje še ni opravljeno.
