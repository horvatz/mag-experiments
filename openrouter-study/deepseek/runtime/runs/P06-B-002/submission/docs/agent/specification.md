# P06 – Razvojna specifikacija: Nastavljiv izvoz CSV

- Status: v1.0, predaja implementerju (2026-10-30)
- Avtor: agent v vlogi pisca specifikacije
- Vir zahtev: `task/instructions.md` (R01–R12), `PROJECT_RULES.md`, `task/specification-template.md`
- Izhodišče: aplikacija Folio brez izvoza CSV; branje prek `GET /api/projects`, `GET /api/projects/:id/tasks`, `GET /api/tasks/:id`

## Problem in kontekst

Uporabnik v Folio pregleduje opravila enega projekta v pogledu Preglednica ali
Tabla. Potrebuje izvoz opravil trenutnega projekta v datoteko CSV, pri čemer
izbere kolone, filter stanja in ločilo. Prenos mora nastati v brskalniku brez
zapisovanja na strežnik in brez spremembe podatkov. Namen je varen prenos
(zaščita pred vstavljanjem formul), zvest prenos Unicode vsebine in enako
obnašanje v obeh pogledih.

## Vhodi, dejanja in izidi

**Podatki** (nespremenjeni tipi iz `shared/types.ts`):

- `Project { id, name }`, `Task { id, projectId, title, description, status, assignee, dueDate }`
- `status ∈ {todo, in_progress, done}`, `dueDate` veljavni datum v obliki `YYYY-MM-DD`
- Opravila pridejo iz `GET /api/projects/:projectId/tasks`; njihov vrstni red je izvorni vrstni red izvoza
- Projekti so lahko prazni; API lahko vrne poljubno število opravil (0, 1, >10), enake naslove, drugačne ID-je; ID/ime projekta vsebuje črke, številke in vezaje

**Dejanja uporabnika:**

1. Odkljukaj/obkljukaj katero koli kolono prek checkboxa z dostopnim imenom `Stolpec <ime>` (npr. `Stolpec title`).
2. Izberi ločilo v selectu `Ločilo CSV` (`;` ali `,`, privzeto `;`).
3. Izberi filter v selectu `Filter izvoza` (`all`, `todo`, `in_progress`, `done`, privzeto `all`).
4. Klikni gumb `Izvozi CSV`.

**Pričakovano stanje:**

- Uspeh: brskalnik prenese datoteko `folio-<projectId>.csv` z vsebino po spodnjih pravilih; stran se ne zamenja, ni novega zavihka, ni zahtevkov, ki bi pisali na strežnik.
- Preklic/nedovoljeno: gumb `Izvozi CSV` je onemogočen, kadar ni izbrane nobene kolone ali je filtrirani nabor prazen; klik ne sproži prenosa.
- Napaka branja opravil: obstoječi `LoadError` z gumbom Poskusi znova; prenosa ni.

**Dogovor o vmesniku (nespremenljivo):** dostopna imena iz točk 1–4; `data-task-id` ostane na vrsticah in karticah; `aria-label="Pregled stanj opravil"` ostane; nova dejanja ob opravilu so zunaj njegove povezave; pri širini 390 pik se cela stran ne razširi (notranje drsenje preglednice/table je dovoljeno).

## Simboli in predpostavke

- `C = [id, projectId, title, status, assignee, dueDate, description]` – nespremenljiv vrstni red kolon.
- `S ⊆ C` – izbrane kolone, urejene po `C` ne glede na vrstni red klikov. Privzeto `S₀ = C`.
- `F ∈ {all, todo, in_progress, done}` – filter, privzeto `F₀ = all`.
- `d ∈ {';', ','}` – ločilo, privzeto `d₀ = ';'`.
- `T = [t₁ … tₙ]` – opravila trenutnega projekta v izvornem vrstnem redu.
- `filter(F) = T`, če `F = all`, sicer `[t ∈ T : t.status = F]` (vrstni red ohranjen).
- `v(c, t)` – surova vrednost polja `c` opravila `t` (za `status` interna vrednost, za `dueDate` izvirni `YYYY-MM-DD`).
- `neutralize(x) = "'" + x`, če `x` ustreza `/^[ \t\r\n]*[=+\-@]/`, sicer `x`.
- `quote(x) = '"' + x.replaceAll('"', '""') + '"'`.
- `cell(c, t) = quote(v(c, t))` za podatkovno kolono, `quote(c)` za glavo.
- `row(t) = cell(c₁, t) d cell(c₂, t) … d cell(cₖ, t)` za `S = [c₁ … cₖ]`.
- `payload = "\uFEFF" + glave v vrstnem redu S, ločene z d + "\r\n" + row(t₁) + "\r\n" + … + row(tₘ) + "\r\n"`, kjer so `tᵢ ∈ filter(F)` v izvornem vrstnem redu.
- `enabled(S, F, T) ⇔ S ≠ ∅ ∧ |filter(F)| > 0`.
- Predpostavke: API vrača samo opravila izbranega projekta in jih ohranja v izvornem vrstnem redu; stanje nove funkcionalnosti je lokalno trenutnemu projektu (brez trajne shrambe, URL-ja, `localStorage`); strežnik in skupni tipi se ne spreminjajo; UI bere samo `/api/`, nikoli `/__test/`.

## Zahteve in pravila

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Izvoz vsebuje natanko `filter(F)` v izvornem vrstnem redu `T`. Ob odprtju velja `S = S₀`, `F = F₀`, `d = d₀`. | Razvojni D01 (privzeti okvir); agentni test z več opravili in preverjanjem vrstnega reda |
| R02 | Glave in vrednosti sledijo vrstnemu redu `C`, ne glede na vrstni red klikov checkboxov; izbirati je mogoče samo kolone iz `C`. | Razvojni D02; agentni test s klikom v obratnem vrstnem redu |
| R03 | `S = ∅ ⇒ ¬enabled`; klik na onemogočen gumb ne sproži prenosa. Po ponovnem izboru kolone je izvoz omogočen, če `|filter(F)| > 0`. | Agentni test: preveri `disabled`/odsotnost dogodka `download` in ponovno omogočenje |
| R04 | Filter omejuje le izvožene vrstice (`filter(F)`), UI še naprej prikazuje vsa opravila projekta. Prazen projekt ali prazen `filter(F)` onemogoči izvoz. | Razvojni D02 (filter done); agentni test s praznim projektom in praznim filtrom |
| R05 | Prenos ima ime `folio-<projectId>.csv` in se začne z UTF-8 BOM `U+FEFF`. Ni nove strani/zavihka in ni pošiljanja vsebine na strežnik. | Razvojni D01 (ime, BOM) in D04 (brez zapisov, `readonly`) |
| R06 | Ločilo je `d` (`;` ali `,`). Vsaka glava in vsaka vrednost je vedno v dvojnih narekovajih; vsak notranji `"` je podvojen (`""`). | Razvojni D02 (ločilo `,`), D03 (podvojeni narekovaji) |
| R07 | Vrstice so ločene s `CRLF`, tudi za zadnjo vrstico je `CRLF`. Ločila in prelomi v vrednostih ostanejo znotraj navedene vrednosti in se ne izgubijo. | Razvojni D01 (`endsWith('\r\n')`), D03 (večvrstični opis in `;` v vrednosti) |
| R08 | `cell(c, t) = quote(neutralize(v(c, t)))` za vsako podatkovno kolono; glava se ne nevtralizira. Nevtralizira se samo, kadar po poljubnih začetnih znakih presledek/tabulator/CR/LF sledi `=`, `+`, `-` ali `@`; takrat se apostrof doda na sam začetek izvirnega niza. Drugi nizi ostanejo nespremenjeni. | Razvojni D03 (`=SUM(A1)`); agentni testi za `+`, `-`, `@`, začetni presledek/tabulator/CR/LF in nespremenjene primere |
| R09 | Šumniki, drugi Unicode znaki, presledki in vsebina opisov ostanejo ohranjeni, razen izrecne nevtralizacije. `status` se izvozi kot interna vrednost (`todo`/`in_progress`/`done`), `dueDate` kot izvirni `YYYY-MM-DD`. | Razvojni D03 (Unicode, večvrstični opis); agentni test za status/datum |
| R10 | Preklop Preglednica/Tabla ohrani `S`, `d` in `F`; izvoz v obeh pogledih vrne iste bajte datoteke. | Razvojni D04 (primerjava dveh prenosov) |
| R11 | Menjava projekta in osvežitev strani ponastavita `S = S₀`, `d = d₀`, `F = F₀`. Zaporedna izvoza po spremembi nastavitev odražata trenutne nastavitve. | Agentni test: spremeni nastavitve, zamenjaj projekt/osveži, preveri privzete; dva zaporedna izvoza z različnimi nastavitvami |
| R12 | Izvoz in njegove kontrole ne spremenijo nobenega opravila, izvornega polja ali obstoječih bralnih funkcij; na API se ne pošlje noben zapis (samo `GET`). Videz Folio ostane, pri 390 pik ni vodoravnega razširjanja cele strani. | Razvojni D04 (`readonly`: brez zapisov, `saveRequests = 0`, širina); izhodiščni `tests/baseline.spec.ts`; agentni test pri 390 pik |

## Izvedba in sledljivost

Predlagana razdelitev (implementer jo lahko prilagodi, ne da bi spremenil pogoje): čista funkcija za sestavo CSV (npr. `src/exportCsv.ts`), kontrolniki (npr. `src/ExportControls.tsx`) in vključitev v `ProjectView` v `src/App.tsx`. Implementer doda lastne teste v `tests/agent/`; izide zabeleži v svojih zapiskih, reviewer v `docs/agent/review.md`.

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | `filter(F)` v izvornem vrstnem redu; privzete nastavitve | D01; agentni test vrstnega reda | `src/` (določi implementer) | Ni izvedeno – čaka implementacijo |
| R02 | Vrstni red kolon `C` neodvisen od klikov | D02; agentni test | `src/` (določi implementer) | Ni izvedeno – čaka implementacijo |
| R03 | `S = ∅ ⇒ disabled`, brez prenosa; ponovni izbor omogoči | agentni test stanj gumba | `src/` (določi implementer) | Ni izvedeno – čaka implementacijo |
| R04 | Filter le na izvozu; prazen nabor onemogoči izvoz | D02; agentni test praznih podatkov | `src/` (določi implementer) | Ni izvedeno – čaka implementacijo |
| R05 | `folio-<projectId>.csv`, BOM, brez strani/zapisov | D01; D04 | `src/` (določi implementer) | Ni izvedeno – čaka implementacijo |
| R06 | `d`; vsa polja navedena; `""` za notranji narekovaj | D02; D03 | `src/` (določi implementer) | Ni izvedeno – čaka implementacijo |
| R07 | `CRLF` tudi na koncu; vrednosti z `\n` in `;` cele | D01; D03 | `src/` (določi implementer) | Ni izvedeno – čaka implementacijo |
| R08 | `neutralize` po predikatu; velja za vse podatkovne kolone | D03; agentni testi robnih znakov | `src/` (določi implementer) | Ni izvedeno – čaka implementacijo |
| R09 | Unicode ohranjen; interni status; izvirni datum | D03; agentni test | `src/` (določi implementer) | Ni izvedeno – čaka implementacijo |
| R10 | Preklop pogleda ohrani nastavitve; isti bajti | D04 | `src/` (določi implementer) | Ni izvedeno – čaka implementacijo |
| R11 | Ponastavitev ob menjavi projekta/osvežitvi | agentni test | `src/` (določi implementer) | Ni izvedeno – čaka implementacijo |
| R12 | Brez sprememb podatkov in zapisov; videz in 390 pik | D04; `tests/baseline.spec.ts`; agentni test | `src/` (določi implementer) | Ni izvedeno – čaka implementacijo |

Opomba: v tabeli so izidi označeni kot neizvedeni, dokler jih implementer ne
zažene in zabeleži. Uspešnih izidov brez dejanskega zagona ni dovoljeno navesti.

## Odprta vprašanja in omejitve

- Razporeditev novih kontrol ni predpisana; ne sme pokvariti obstoječih dostopnih imen, `data-task-id` ali videza Folio.
- Razvojni testi D01–D04 so pomožni in ne pokrijejo vseh robov (npr. `+`/`-`/`@`, začetni tabulator/CR/LF, prazni projekti, ponastavitev ob menjavi projekta, 390 pik) – implementer jih doda v `tests/agent/`.
- Končni testi lahko uporabijo drugačne podatke znotraj opisane domene; specifikacija velja za vse take podatke.
- Trajna shramba, URL-ji za nastavitve izvoza in novi zapisovalni API-ji niso del obsega.
- Nejasnosti med izvajanjem se zapišejo tukaj; spremembe specifikacije se vodijo v `docs/agent/specification-history.md`.
