# P04 — Specifikacija: Stabilno razvrščanje z dvema ključema

Vir zahtev: `task/instructions.md` (R01–R12). Skupna predloga: `task/specification-template.md`.
Načrt in razčlenitev nalog: `plan.md`, `tasks.md` (nastaneta v naslednjih korakih).

## Problem in kontekst

Uporabnik želi v aplikaciji Folio na pregledu opravil izbrati primarni in sekundarni
ključ razvrščanja z neodvisnima smerema, pri čemer mora biti razvrščanje stabilno:
izenačena opravila obdržijo izvorni vrstni red. Aplikacija trenutno prikazuje
opravila v vrstnem redu prejetega polja in nima kontrol za razvrščanje.
Razvrščanje je projekcija prikaza: polja opravil, pripadnost, skupna števila in
izvorno polje ostanejo nespremenjeni, API ne prejme nobenega zapisa.

## Vhodi, dejanja in izidi

Podatki (tipi in polja enaki izhodišču): opravilo ima `id`, `title`, `assignee`,
`status`, `dueDate`; bere se prek javnega API-ja `/api/`, izbira po `id`. Datumi so
veljavni koledarski `YYYY-MM-DD`; imena in naslovi so nizi, tudi z Unicode znaki in
ločili. ID-ji so enkratni, naslovi so lahko enaki; vsak projekt je lahko prazen.

Kontrole (dogovor o vmesniku): Primarni ključ (original/title/assignee/status/dueDate),
Primarna smer (asc/desc), Sekundarni ključ (none/title/assignee/status/dueDate),
Sekundarna smer (asc/desc), gumb Izvorni vrstni red.

Stanje nastavitev: `S = (k1, d1, k2, d2)`; privzeto `D = (original, asc, none, asc)`.

Dejanja in izidi:

- Sprememba katere koli kontrole: `S` se posodobi; preglednica in tabla se ponovno
  izrišeta iz istega razvrščenega polja.
- Preklop pogleda preglednica/tabla: `S` ostane nespremenjeno; tabla znotraj vsakega
  stolpca uporabi isti relativni vrstni red kot preglednica.
- Odpiranje/zapiranje podrobnosti: `S` ostane nespremenjeno.
- Menjava projekta: `S := D`.
- Osvežitev strani: `S := D` (nastavitve niso v trajni shrambi ali URL-ju).
- Klik na gumb Izvorni vrstni red: `S := D`.
- Napake: ni predvidenih novih napak; prazen projekt in projekt z enim opravilom
  delujeta pri vseh ključih in smereh.

## Zahteve in pravila

Simboli in predpostavke:

- `normalize(s)` = `s` v NFD, odstranjeni znaki U+0300–U+036F, male črke.
- `<` in `>` pomenita leksikografsko primerjavo po UTF-16 kodnih enotah, brez
  jezikovno ali številsko prilagojenega razvrščanja.
- `rank(status)`: todo = 0, in_progress = 1, done = 2.
- `cmp_K(a, b)` primerja ključ `K` (0 ob enakosti); za `original` velja izvorni
  vrstni red polja.
- Smer: `asc` uporabi `cmp_K`, `desc` uporabi `-cmp_K`. Smer obrne samo izid
  primerjave izbranega ključa, ne celotnega polja in ne vrstnega reda izenačenih.
- Razvrščanje je stabilno: ob enakosti primarnega ključa se uporabi sekundarni
  (če ni `none`), ob enakosti obeh ostane izvorni vrstni red; `k2 = k1` ne uvede
  dodatnega obrata; `k1 = original` vedno vrne izvorni vrstni red.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Ob odprtju projekta in ob osvežitvi je `S = D`; prikaz ohrani vrstni red prejetega polja. | scenarij A (privzete vrednosti in vrstni red) |
| R02 | Za `title`/`assignee`: `cmp(a,b)` primerja `normalize(a)` in `normalize(b)` z `<`/`>` po UTF-16; brez `localeCompare` in številskih pravil. | scenariji B (Unicode, velike/male črke, ločila) |
| R03 | `status`: vrstni red todo < in_progress < done; `dueDate`: veljavni datumi `YYYY-MM-DD` kronološko. | scenariji C (status, datumi) |
| R04 | `desc` zanika samo `cmp_K` izbranega ključa; izenačeni ohranijo relativni izvorni vrstni red. | scenariji D (obe smeri, izenačeni) |
| R05 | Sekundarni ključ se uporabi samo, ko je `cmp_k1(a,b) = 0`; njegova smer je neodvisna od primarne. | scenariji E (kombinacije ključev in smeri) |
| R06 | Ob enakosti obeh ključev ostane izvorni vrstni red; `k2 = k1` brez dodatnega obrata; `k1 = original` vedno vrne izvorni vrstni red ne glede na `k2`, `d1`, `d2`. | scenariji F (stabilnost, original) |
| R07 | Tabla ima stalni vrstni red stolpcev todo, in_progress, done; znotraj stolpca velja relativni vrstni red istega razvrščenega polja kot v preglednici. | scenariji G (tabla) |
| R08 | Preklop pogleda ohrani `S`; odpiranje in zapiranje podrobnosti ne ponastavi vrstnega reda. | scenariji H (pogled, podrobnosti) |
| R09 | Menjava projekta nastavi `S := D`; osvežitev prav tako; nastavitve niso v trajni shrambi ali URL-ju. | scenariji I (projekt, osvežitev) |
| R10 | Gumb Izvorni vrstni red nastavi `S := D`; prazen projekt in projekt z enim opravilom delujeta pri vseh ključih in smereh. | scenariji J (ponastavitev, robni primeri) |
| R11 | Razvrščanje ne spremeni polj opravil, pripadnosti, skupnih števil ali izvornega polja in ne pošlje nobenega zapisa na API. | scenariji K (nespremenjeni podatki, brez zapisov) |
| R12 | Vsi ID-ji so prikazani natanko enkrat in odpirajo prave podrobnosti tudi pri enakih naslovih; bralne funkcije in prilagodljiv videz Folio se ohranijo. | scenariji L (ID-ji, podrobnosti, 390 pik) |

## Izvedba in sledljivost

Pogoji so vezani na scenarije A–L; izvedba in dokazi se vpišejo ob izvajanju
(`tasks.md`, dnevnik zagonov). Izidov, ki še niso izvedeni, ni dovoljeno označiti
kot uspešne.

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01–R12 | pravila iz preglednice zgoraj | scenariji A–L v `tests/agent/` | `src/` (izbira in razvrščanje) | še ni izvedeno; vpiše se ob izvedbi |

## Odprta vprašanja in omejitve

- Navigacija med nezaključenim nalaganjem in nove sočasne spremembe podatkov brez
  osvežitve niso del obsega (obstoječe regresijske zahteve).
- Manjkajoči datumi niso zahtevani; podatki so veljavni `YYYY-MM-DD`.
- Stanje razvrščanja je lokalno trenutnemu projektu: brez trajne shrambe, URL-ja in
  novih zapisovalnih API-jev.
- Končni testi lahko uporabijo drugačne podatke znotraj opisane domene; razvojni
  primeri niso celoten obseg.
- Testne kontrole `/__test/` so samo za testni program; UI jih ne uporablja.
