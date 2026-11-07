# P03 – Iskanje in sestavljeni filtri (specifikacija)

Vir zahtev: `task/instructions.md` (R01–R12), skupna predloga
`task/specification-template.md`, pravila `PROJECT_RULES.md` in
`.specify/memory/constitution.md`. Pot funkcionalnosti: `docs/agent/P03`.
Zahteve veljajo tudi tam, kjer ta dokument kaj povzame le na kratko; merilo je
izvirnik.

## Problem in kontekst

Uporabnik v projektu Folio pregleduje opravila v preglednici ali na tabli, a
nima načina, da bi med opravili poiskal po vsebini in jih hkrati omejil po
stanju ter odgovorni osebi. V izhodišču prikazujeta oba pogleda vsa opravila
trenutnega projekta; stanje povzetka in stolpcev je vezano na celoten projekt.

Cilj: uporabnik lahko v enem projektu vpiše iskalne besede in izbere stanje
oziroma osebo; oba pogleda in povzetki prikazujejo natanko ustrezna opravila,
izbire pa se ne prenašajo med projekti in se po osvežitvi ne ohranijo.
Dodajanje filtrov je razširitev obstoječih pogledov; potrjeni dizajn Folio
(`docs/dizajn.md`) in obstoječe bralne poti ostanejo nespremenjeni.

## Vhodi, dejanja in izidi

Podatki (nespremenjeni tipi iz `shared/types.ts`): `Task` s polji `id`,
`projectId`, `title`, `description`, `status ∈ {todo, in_progress, done}`,
`assignee`, `dueDate`; `Project` s `id` in `name`. Opravila se berejo iz
`GET /api/projects/{id}/tasks` v vrstnem redu, ki ga vrne strežnik; ta vrstni
red je "izvorni vrstni red" in se med filtriranjem ne spreminja.

Stanje filtriranja (lokalno, vezano na trenutni projekt):

| Simbol | Pomen | Privzeto |
| --- | --- | --- |
| `s` | iskalni niz | `""` |
| `f_status` | `all`, `todo`, `in_progress`, `done` | `all` |
| `f_assignee` | `all` ali točno ime odgovorne osebe | `all` |
| `view` | `table` ali `board` (obstoječa pot) | iz usmerjevalnika |

Dejanja in izidi:

- Vpis v iskalni vnos (brez oddaje obrazca) sproti posodobi `s`; izid je nov
  seznam ustreznih opravil v obeh pogledih. Vnos je `input type=search` z
  dostopnim imenom `Išči opravila`.
- Izbira v `select` z imenom `Filter stanja` (možnosti `all`, `todo`,
  `in_progress`, `done`) posodobi `f_status`.
- Izbira v `select` z imenom `Filter odgovorne osebe` (`all` ali točno ime)
  posodobi `f_assignee`.
- Gumb `Počisti filtre` v enem dejanju povrne `s`, `f_status` in `f_assignee`
  na privzete vrednosti.
- Preklop pogleda in odpiranje podrobnosti filtriranja ne spremenita; ob
  vrnitvi nazaj so filtri enaki.
- Menjava projekta ponastavi `s`, `f_status` in `f_assignee` na privzeto in
  ponovno izračuna možnosti oseb iz novega projekta.
- Osvežitev strani (ali nov obisk povezave) začne s privzetimi filtri.
- Napaka branja ostane v obstoječem prikazu napake s ponovnim poskusom; filtri
  se ob napaki ne uporabijo na nepopolnih podatkih.

Dogovor o vmesniku (iz izvirnih zahtev): poleg zgoraj navedenih kontrol je
rezultat povzet v elementu `role=status` z `aria-label="Rezultati filtriranja"`
in besedilom `Prikazano: N od M.`; ohranjeni so `data-task-id` na vrsticah in
karticah, dostopna imena obstoječih pogledov in stolpcev ter
`aria-label="Pregled stanj opravil"`. Nova dejanja ob opravilu morajo biti
zunaj njegove povezave. Pri širini 390 pik se cela stran ne razširi; notranje
drsenje preglednice in table je dovoljeno. Besedilo, ki ni izrecno določeno, in
razporeditev novih kontrol nista predpisana.

## Zahteve in pravila

Oznake. Za opravilo `t` naj bo `norm(x)` = `lowercase(NFD(x))` z odstranjenimi
znaki U+0300–U+036F; `polja(t) = id + " " + title + " " + description + " " +
assignee`; `W(s)` = neprazne besede niza `s`, razdeljene po belinah (ločila v
besedah niso regularni izrazi, temveč dobesedni znaki); `zadene(t, s)` ⇔ vsak
`w ∈ W(s)` je dobesedni podniz `norm(polja(t))`. Naj bo `T_P` množica opravil
trenutnega projekta `P` v izvornem vrstnem redu in `V = [t ∈ T_P : zadene(t, s)
∧ (f_status = all ∨ t.status = f_status) ∧ (f_assignee = all ∨ t.assignee =
f_assignee)]` (primerjava osebe je natančna, brez normalizacije). `N = |V|`,
`M = |T_P|`. Prazno iskanje ne omejuje: `W("") = ∅`, zato `zadene(t, "") = true`.
Zapis `ni zadetkov` pomeni `M > 0 ∧ N = 0`.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Ob nalaganju velja `s = ""`, `f_status = all`, `f_assignee = all`; oba pogleda prikažeta `V = T_P` v izvornem vrstnem redu. | Test nalaganja projekta: privzete vrednosti kontrol in enak seznam ID-jev ter vrstni red kot v odgovoru API-ja. |
| R02 | `zadene` uporablja `norm` nad združenimi `id`, `title`, `description`, `assignee`; velja `zadene(t, "č")` ⇔ `zadene(t, "c")` in iskanje ni občutljivo na velikost črk. | Primeri z `č`/`C`, velikimi/malimi črkami in Unicode znaki; iskanje po vsakem od štirih polj. |
| R03 | `W(s)` so neprazne besede po belinah; zadostuje konjunkcija dobesednih podnizov, vrstni red besed ni pomemben, ločila se obravnavajo dobesedno, `s = ""` ne omejuje. | Večbesedna iskanja v različnih vrstnih redih, beseda z ločilom, samo beline. |
| R04 | `V` je presek pogojev iskanja, stanja in osebe (logični IN); `f_status` dovoli `all` ali natanko eno od `todo`, `in_progress`, `done`; `f_assignee` se primerja natančno. | Kombinacije iskanja in obeh filtrov; mešana velikost črk v imenu ne ujame drugačnega zapisa. |
| R05 | Možnosti izbirnika so `all` in vsako različno neprazno ime iz `T_P`, vsako natanko enkrat, ne glede na trenutno vidnost; menjava projekta ne obdrži stare osebe in privzeto nastavi `f_assignee = all`. | Seznam možnosti v projektu s skritimi in ponovljenimi imeni; menjava projekta in preverjanje vrednosti izbirnika. |
| R06 | Oba pogleda prikazujeta isti `V`; preklop pogleda ohrani `s`, `f_status`, `f_assignee`; stolpci table vsebujejo natanko `[t ∈ V : t.status = <stanje stolpca>]`. | Primerjava `data-task-id` med pogledoma; preklop po filtriranju; vsebina posameznih stolpcev. |
| R07 | Ob menjavi projekta velja `s = ""`, `f_status = all`, `f_assignee = all`; filtri se nikoli ne uporabijo na opravilih drugega projekta. | Filtriranje v prvem projektu, nato prehod v drugega: privzeto stanje in vsa njegova opravila. |
| R08 | Začetno stanje po osvežitvi je privzeto; `s`, `f_status`, `f_assignee` se ne zapišejo v URL ali trajno shrambo brskalnika. | Osvežitev po filtriranju; pregled naslova in shrambe brskalnika. |
| R09 | `role=status` z `aria-label="Rezultati filtriranja"` kaže `Prikazano: N od M.`; povzetek stanj in števci stolpcev štejejo samo `V`. | Branje besedila in števcev ob različnih filtrih ter praznem/nefiltriranem projektu. |
| R10 | Če `M > 0 ∧ N = 0`, je prikazano sporočilo `Ni zadetkov.` in oba pogleda ostaneta uporabna; če `M = 0`, ostane običajno prazno stanje s števcem `0 od 0`. | Projekt brez zadetkov (oba pogleda, tudi po čiščenju filtrov) in prazen projekt. |
| R11 | `Počisti filtre` nastavi `s = ""`, `f_status = all`, `f_assignee = all` in prikaže `T_P`; filtriranje ne spremeni vrstnega reda ali polj podatkov. | Eno dejanje po filtriranju; primerjava seznama in polj opravil s stanjem pred filtriranjem. |
| R12 | Obstoječa navigacija in bralne podrobnosti delujejo; dejanja filtriranja ne pošljejo `POST/PATCH/PUT/DELETE` na `/api/`; Folio in prikaz pri ozki širini ostaneta. | Skupni regresijski testi, opazovanje omrežnih zahtev med filtriranjem in preverjanje postavitve pri 390 pik. |

Meje obsega: filtriranje je odjemalsko in ne spreminja podatkov na strežniku;
novih zapisovalnih API-jev, trajne shrambe, URL-parametrov ali zunanjih meritev
ni. Vmesnik ne uvaža in ne uporablja testnih kontrol `/__test/`.

## Izvedba in sledljivost

Ta razdelek se izpolni med izvedbo; izid se označi šele po dejanskem
preverjanju. Trenutno stanje: izvedba in testi P03 še niso izdelani, zato so
vsi izidi "ni izvedeno".

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | privzeti filtri in izvorni vrstni red | `tests/agent/p03-filters.spec.ts` (nalaganje) | `src/App.tsx` – stanje filtrov | ni izvedeno (pred izvedbo) |
| R02 | normalizacija NFD in neobčutljivost | test iskanja `č`/`c`, velikost črk | `src/filters.ts` (novo) | ni izvedeno (pred izvedbo) |
| R03 | besede, dobesedni podnizi, prazen vnos | test večbesednega iskanja in ločil | `src/filters.ts` (novo) | ni izvedeno (pred izvedbo) |
| R04 | IN med iskanjem, stanjem in osebo | test kombinacij filtrov | `src/filters.ts`, `src/App.tsx` | ni izvedeno (pred izvedbo) |
| R05 | možnosti oseb iz celotnega projekta | test izbirnika oseb in menjave projekta | `src/App.tsx` – možnosti | ni izvedeno (pred izvedbo) |
| R06 | enaki ID-ji v obeh pogledih, filtri ostanejo | test preklopa pogleda po filtriranju | `src/App.tsx`, `src/TaskBoard.tsx` | ni izvedeno (pred izvedbo) |
| R07 | ponastavitev ob menjavi projekta | test prehoda med projektoma | `src/App.tsx` – ključ projekta | ni izvedeno (pred izvedbo) |
| R08 | brez trajne shrambe in URL-ja | test osvežitve strani | `src/App.tsx` – lokalno stanje | ni izvedeno (pred izvedbo) |
| R09 | `Prikazano: N od M.` in števci | test besedila statusa in števcev | `src/App.tsx` – povzetek | ni izvedeno (pred izvedbo) |
| R10 | `Ni zadetkov.` in prazna projekta | test brez zadetkov in praznega projekta | `src/App.tsx` – prazna stanja | ni izvedeno (pred izvedbo) |
| R11 | čiščenje filtrov v enem dejanju | test gumba `Počisti filtre` | `src/App.tsx` – čiščenje | ni izvedeno (pred izvedbo) |
| R12 | regresije, brez pisanja na API, ozka širina | skupni testi + omrežje + 390 pik | `src/App.tsx`, `src/styles.css` | ni izvedeno (pred izvedbo) |

## Odprta vprašanja in omejitve

- Razporeditev in dodatno besedilo novih kontrol nista predpisana; izbira
  ostane znotraj obstoječih gradnikov Folio.
- Razvojni pripomoček testov ponuja nadzorovane odgovore GET, vendar končni
  primeri lahko uporabijo drugačne podatke opisane domene; specifikacija ne
  predpisuje testnih podatkov.
- Sočasne spremembe podatkov med nalaganjem in navigacija med nezaključenim
  nalaganjem nista del obsega.
- Izvorni vrstni red je vrstni red odgovora API-ja; specifikacija ne določa
  drugačnega razvrščanja.
