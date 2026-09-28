# Razvojna specifikacija: nastavljiv izvoz CSV

## Problem in kontekst

Uporabnik izvozi opravila trenutno izbranega projekta in lahko nastavi stolpce, ločilo ter filter statusa. Začetni Folio podatke projekta že bere v vrstnem redu API-ja ter jih pokaže v preglednici ali tabli. Dodatek mora ohraniti ta prikaz, potrjeni Folio slog in obstoječe branje podrobnosti.

## Vhodi, dejanja in izidi

Vir je `Task[]` iz `GET /api/projects/{projectId}/tasks`; polja tipa so določena v `shared/types.ts`. Za vsak projekt so nastavitve lokalne: izbrani stolpci, `;` ali `,`, ter `all` ali ena od vrednosti `TaskStatus`. Privzeto so izbrani vsi stolpci v vrstnem redu `id, projectId, title, status, assignee, dueDate, description`, ločilo je `;`, filter `all`.

Sprememba kontrol posodobi le lokalne nastavitve in izvozno projekcijo. Izvoz je omogočen natanko, ko velja `selected.length > 0 && filteredTasks.length > 0`. Sprožitev pripravi `folio-${project.id}.csv` za prenos; ne navigira in ne zapisuje na API. Med nalaganjem/napako ostanejo veljavna obstoječa stanja aplikacije. Menjava projekta in ponovno nalaganje vrneta privzete nastavitve; preklop pogleda jih ohrani.

## Zahteve in pravila

Naj bo `T` seznam opravil trenutnega projekta, `S` izbrani stolpci, `F` filter, `D` ločilo in `R = T`, če je `F=all`, sicer stabilni filter `T.filter(t => t.status === F)`. Noben korak ne sortira ali spreminja `T`. Izvozna polja so preslikana neposredno iz `Task`; `projectId` je ID projekta, ne ime.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Privzeto `F=all`, `D=';'`, `S` vsebuje vseh 7 polj v kanoničnem vrstnem redu. Vrstice so `R` v istem vrstnem redu kot `T`. | D01 privzeta glava/prenos; preveriti tudi vrstni red izvoznih ID-jev. |
| R02 | Stolpci so samo `id, projectId, title, status, assignee, dueDate, description`; glava in podatki uporabijo ta red, filtriran s `S`, ne red klikanja. Kontrole imajo `Stolpec <ključ>`. | Izbrati nepovezane stolpce v obratnem vrstnem redu in preveriti glavo ter vrednosti. |
| R03 | Prenos je onemogočen, če `|S|=0`; ponovno omogočen, ko `|S|>0 && |R|>0`. Ob onemogočenem gumbu ni dogodka prenosa. | Odkljukati vse stolpce, preveriti onemogočen gumb in da ni `download`, nato izbrati stolpec. |
| R04 | `F ∈ {all,todo,in_progress,done}` omeji samo `R`; celoten `T` ostane prikazan v tabeli in tabli. `|T|=0` ali `|R|=0` onemogoči izvoz. | Filtrirati vsako stanje in primerjati izvoz z nespremenjenim številom/vsebino prikaza; vključiti prazen projekt in prazen rezultat. |
| R05 | Prenos je lokalna datoteka `folio-${project.id}.csv`, prvi znak vsebine `U+FEFF`; brez nove strani ali vsebinskega API klica. | D01 ime in BOM; prestreči navigacijo ter vse ne-GET API zahteve. |
| R06 | `D ∈ {';', ','}`; vsako polje glave in podatka je obdano z `"`, notranji `"` se zapiše kot `""`. | D02 obe ločili in izbrana polja; D03 narekovaji, preverba celotnih bajtov. |
| R07 | Zapisi so združeni z `\r\n` in se z njim tudi končajo. Vsebinski CR/LF ostane v narekovanem polju. | D01 zaključek CRLF; D03 opis z notranjim LF ter dodaten primer CR. |
| R08 | Pred narekovanjem za vsak podatek `v` preveri `/^[ \t\r\n]*[=+@-]/`; če se ujema, uporabi `'${v}`, sicer nespremenjeni `v`. Glave se ne nevtralizirajo. | D03 enačba; dodatni primeri vodilnega presledka/tabulatorja/CR/LF, `+ - @` in neujemajočega niza. |
| R09 | Besedilna polja se izvozijo brez trimanja, normalizacije ali preoblikovanja. `status` je interna vrednost, `dueDate` izvirni `YYYY-MM-DD`; Unicode/opisi ostanejo, razen R08. | D03 šumniki; preveriti natančno surovo vrednost vsakega polja. |
| R10 | Nastavitve preživijo `table ↔ board`; za isti `(T,S,D,F)` so bajti obeh prenosov enaki. | D04 prenesti pred in po preklopu ter primerjati ime in vse bajte. |
| R11 | Ob spremembi `project.id` ali ponovnem nalaganju se `S,D,F` vrnejo na privzete. Vsak prenos uporabi trenutno stanje kontrol. | Nastaviti vse tri, menjati projekt/osvežiti, preveriti privzete vrednosti; nato spreminjati zaporedno in primerjati prenose. |
| R12 | Izvoz bere samo iz `T`, ne kliče zapisovalnega API-ja in ne spreminja opravil ali izvornih funkcij. Obstoječi pregled, `data-task-id`, imena pogledov in `aria-label="Pregled stanj opravil"` ostanejo; pri 390 px ni vodoravnega drsenja cele strani. | D04 preverba brez zapisov; regresijski pregledi DOM, bralnih funkcij ter ozkega prikaza. |

`F` pojasnjuje filter, `S` izbrani stolpčni ključi, `D` ločilo, `T` API-jev izvorni seznam, `R` vrstično projekcijo. Filter ne spreminja pregleda. Ni trajne shrambe ali URL stanja za nove nastavitve.

## Izvedba in sledljivost

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01–R02, R05–R09 | CSV natančno ustreza zgornjim vrstnim redom, ubežanju in kodiranju. | Razvojni `tests/development/P06.spec.ts`: D01–D03; razširiti manjkajoče robne primere. | Načrtovano: `src/App.tsx` kontrole/stanje; ločen serializator CSV pod `src/`; API tip ostaja `shared/types.ts`. | Ni izvedeno; specifikacijska faza ne zaganja aplikacije ali testov. |
| R03–R04, R10–R11 | Gumb sledi predikatu; filter ne vpliva na prikaz, projektna meja ponastavi, pogled ohrani stanje. | D02, D04 ter prazni projekt/izbor, menjava projekta, osvežitev. | Načrtovano: `src/App.tsx` v `ProjectView`; ključ komponente projekta je že `project.id`. | Ni izvedeno; implementer naj vpiše dejanske datoteke, teste in dnevnike po preverjanju. |
| R12 | Brez zapisov, spremembe podatkov ali regresije dostopnosti/prikaza. | D04; obstoječi skupni testi ter pregled pri 390 px. | Vmesnik v `src/App.tsx`/`src/styles.css`; obstoječi API bralniki ostanejo. | Ni izvedeno. |

## Odprta vprašanja in omejitve

`Task` je natanko `{id, projectId, title, description, status, assignee, dueDate}`; statusi so `todo | in_progress | done`. API odzivi lahko vsebujejo nič ali poljubno število opravil, zato ne uporabljati indeksov za identiteto ali fiksne dolžine. Razvojni testi D01–D04 so orientacijski, niso popolna pokritost R01–R12. V tej vlogi je bil opravljen pregled kode in testnih scenarijev; aplikacija in testi niso bili zagnani, implementacija in videz nista preverjena.
