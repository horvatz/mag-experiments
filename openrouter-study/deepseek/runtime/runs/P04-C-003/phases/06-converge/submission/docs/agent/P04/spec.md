# P04 — Specifikacija: Stabilno razvrščanje z dvema ključema

Izvor zahtev: `task/instructions.md` (R01–R12), obvezujoče merilo tudi ob morebitnih izpustih.
Skupna predloga: `task/specification-template.md`. Pravila projekta: `PROJECT_RULES.md`.
Pot funkcionalnosti: `docs/agent/P04`. Datum: 2026-10-11.

## Problem in kontekst

Folio je React aplikacija s simuliranim strežnikom: uporabnik izbira projekt, pregleduje
opravila v preglednici ali na tabli in odpira podrobnosti. Naloga doda nadzor vrstnega reda:
izbiro primarnega in sekundarnega ključa s samostojnima smerema ter gumb za izvorni vrstni
red. Razvrščanje je samo projekcija prejetih podatkov iz javnega API-ja; podatkov ne
spreminja in nastavitev ne shranjuje trajno.

## Vhodi, dejanja in izidi

**Podatki (nespremenjena polja izhodišča):** `id`, `title`, `assignee`, `status`
(todo, in_progress, done), `dueDate` (veljaven YYYY-MM-DD) in pripadnost projektu.
Naslovi, opisi in imena so navadno besedilo, tudi z Unicode znaki. Opravila se berejo
prek GET `/api/` in izbirajo po `id`; UI ne uporablja `/__test/`, `localStorage` niti
novih zapisovalnih API-jev.

**Dovoljena dejanja in pričakovano stanje po uspehu:**

- Izbira primarnega ključa (original/title/assignee/status/dueDate) in primarne smeri (asc/desc).
- Izbira sekundarnega ključa (none/title/assignee/status/dueDate) in sekundarne smeri (asc/desc).
- Gumb Izvorni vrstni red: vse štiri kontrole se nastavijo na privzete vrednosti, prikaz je izvorni.
- Preklop pogleda preglednica/tabla: vse štiri nastavitve se ohranijo.
- Odpiranje in zapiranje podrobnosti: vrstni red se ne ponastavi.
- Menjava projekta: vse štiri nastavitve se ponastavijo na privzete vrednosti.
- Osvežitev strani: privzete vrednosti; nastavitve niso v trajni shrambi ali URL-ju.
- Prazen projekt in projekt z enim opravilom delujeta pri vseh ključih in smereh.
- Napake in preklici: obstoječi prikaz nalaganja, napake s ponovnim poskusom in praznega
  stanja se ohranijo; naloga ne uvaja novih načinov odpovedi.

## Zahteve in pravila

**Simboli in predpostavke:**

- `S` = izvorno zaporedje prejetega polja opravil (indeksni vrstni red).
- `Kp`, `Dp` = primarni ključ in smer; `Ks`, `Ds` = sekundarni ključ in smer.
- `norm(x)` = NFD, odstranitev znakov U+0300–U+036F, male črke; primerjava je
  leksikografska po UTF-16 z `<` in `>`, brez jezikovnih in številskih prilagoditev.
- `rang`: todo = 0 < in_progress = 1 < done = 2; `dueDate` se primerja kronološko.
- `cmp_p`, `cmp_s` = izid primerjave izbranega ključa; smer obrne samo predznak
  primerjave tega ključa. Ob `cmp = 0` se relativni vrstni red `S` ohrani (stabilno).
- Privzete vrednosti: `Kp = original`, `Dp = asc`, `Ks = none`, `Ds = asc`.

**Pravila sprememb stanja (za vsako zahtevo):**

- **R01**: ob zagonu velja privzeti četverec; prikaz je natanko `S`.
- **R02**: za title/assignee velja `cmp = compare(norm(a), norm(b))` z UTF-16 `<` in `>`.
- **R03**: status primerja `rang(a) − rang(b)`; dueDate primerja veljavne koledarske datume
  YYYY-MM-DD kronološko.
- **R04**: `Dp = desc` spremeni `cmp_p` v `−cmp_p`; obrne se le izid primerjave izbranega
  ključa, ne celotno končno polje in ne vrstni red izenačenih elementov.
- **R05**: `Ks` se uporabi samo ob `cmp_p = 0` in `Ks ≠ none`; `Ds` je neodvisen od `Dp`.
- **R06**: ob `cmp_p = 0` in (`Ks = none` ali `cmp_s = 0`) ostane `S`. `Kp = original`
  vedno vrne `S` ne glede na `Dp`, `Ks`, `Ds`; `Ks = Kp` je dovoljen in ne doda obrata.
- **R07**: tabla ohrani stalni vrstni red stolpcev todo, in_progress, done; relativni
  vrstni red opravil v vsakem stolpcu je enak relativnemu vrstnemu redu istega
  razvrščenega polja v preglednici.
- **R08**: preklop pogleda ohrani `(Kp, Dp, Ks, Ds)`; odpiranje/zapiranje podrobnosti
  ne ponastavi vrstnega reda.
- **R09**: menjava projekta nastavi `(Kp, Dp, Ks, Ds)` na privzete vrednosti; osvežitev
  začne privzeto; nastavitev ni v trajni shrambi ali URL-ju.
- **R10**: gumb Izvorni vrstni red nastavi vse štiri kontrole na privzete vrednosti;
  prazen projekt in eno opravilo delujeta pri vseh ključih in smereh.
- **R11**: razvrščanje ne spremeni polj opravil, pripadnosti, skupnih števil ali `S`;
  sprememba vrstnega reda ne pošilja zapisov na API (samo branje).
- **R12**: vsak `id` je prikazan natanko enkrat in odpre prave podrobnosti tudi ob enakih
  naslovih; ostale bralne funkcije in prilagodljiv videz Folio se ohranijo.

**Dogovor o vmesniku (obstoječi gradniki):** oznake selectov Primarni ključ, Primarna smer,
Sekundarni ključ, Sekundarna smer; gumb Izvorni vrstni red; `data-task-id` na vrsticah in
karticah; obstoječa dostopna imena pogledov in stolpcev; `aria-label="Pregled stanj opravil"`;
nova dejanja ob opravilu zunaj njegove povezave; pri širini 390 pik se cela stran ne razširi,
notranje drsenje preglednice in table je dovoljeno. Razporeditev novih kontrol ni predpisana.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Začetni četverec je (original, asc, none, asc); prikaz = `S`. | Playwright: privzeti selecti in vrstni red ob nalaganju. |
| R02 | title/assignee se primerjata z `norm` in UTF-16 `<`/`>`. | Enotni predikat nad primerjalnikom + UI test z Unicode in ločili. |
| R03 | status po todo < in_progress < done; dueDate kronološko. | UI test z znanimi datumi in statusi. |
| R04 | Smer obrne le `cmp` izbranega ključa; izenačeni ohranijo `S`. | UI test asc/desc z izenačenimi ključi. |
| R05 | Sekundarni ključ se uporabi le ob enakosti primarnega; smeri neodvisni. | UI test štirih kombinacij smeri. |
| R06 | Ob enakosti obeh ključev ostane `S`; `Kp = original` vrne `S`. | UI test stabilnosti in originala z nastavljenim sekundarnim ključem. |
| R07 | Stolpci todo, in_progress, done; znotraj stolpca isti relativni vrstni red. | UI test primerjave zaporedja med tablo in preglednico. |
| R08 | Preklop pogleda in podrobnosti ohranita nastavitve in vrstni red. | UI test preklopa in odpiranja/zapiranja. |
| R09 | Menjava projekta in osvežitev ponastavita na privzete vrednosti; brez trajne shrambe in URL-ja. | UI test menjave projekta, osvežitve in pregleda URL-ja. |
| R10 | Gumb Izvorni vrstni red ponastavi vse štiri kontrole; prazno/eno opravilo deluje. | UI test gumba in praznega projekta. |
| R11 | Razvrščanje ne spremeni podatkov in ne piše na API. | UI test nespremenjenih polj; nadzor prometa (samo GET). |
| R12 | Vsak `id` natanko enkrat; prave podrobnosti ob enakih naslovih. | UI test enakih naslovov in odpiranja podrobnosti. |

## Izvedba in sledljivost

Preglednica se izpolni med izvedbo; povezave na načrt in naloge: `docs/agent/P04/plan.md`,
`docs/agent/P04/tasks.md`. Izida ni dovoljeno označiti kot uspešnega brez dejanske izvedbe.

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | Privzeti četverec in `S` | tests/agent/… (privzeti prikaz) | src/… (stanje in privzetki) | Uspešno: agent R01; npm run check 60/60. |
| R02 | `norm` in UTF-16 primerjava | tests/agent/… (primerjalnik) | src/… (primerjava) | Uspešno: agent R02; npm run check 60/60. |
| R03 | Rang statusa in datumi | tests/agent/… (status, dueDate) | src/… (primerjava) | Uspešno: agent R03; npm run check 60/60. |
| R04 | Obrat le izbranega ključa | tests/agent/… (asc/desc) | src/… (smer) | Uspešno: agent R04; npm run check 60/60. |
| R05 | Sekundarni ključ ob enakosti | tests/agent/… (kombinacije) | src/… (primerjava) | Uspešno: agent R05; npm run check 60/60. |
| R06 | Stabilnost in original | tests/agent/… (izenačeni) | src/… (razvrščanje) | Uspešno: agent R06; npm run check 60/60. |
| R07 | Stolpci in relativni vrstni red | tests/agent/… (tabla) | src/… (tabla) | Uspešno: agent R07; npm run check 60/60. |
| R08 | Ohranitev nastavitev | tests/agent/… (preklop, podrobnosti) | src/… (stanje) | Uspešno: agent R08; npm run check 60/60. |
| R09 | Ponastavitev ob projektu in osvežitvi | tests/agent/… (projekt, reload) | src/… (stanje) | Uspešno: agent R09; npm run check 60/60. |
| R10 | Gumb in robna primera | tests/agent/… (gumb, prazno) | src/… (kontrola) | Uspešno: agent R10; npm run check 60/60. |
| R11 | Projekcija brez zapisov | tests/agent/… (podatki, promet) | src/… (branje) | Uspešno: agent R11; npm run check 60/60. |
| R12 | ID-ji in podrobnosti | tests/agent/… (enaki naslovi) | src/… (seznam, podrobnosti) | Uspešno: agent R12; npm run check 60/60. |

Skupni testi `tests/baseline.spec.ts` in `tests/api.spec.ts` ostanejo nespremenjeni in
preverjajo, da se obstoječe delovanje ni poslabšalo. Lastna preverjanja P04 se dodajo
v `tests/agent/`.

## Odprta vprašanja in omejitve

- R06 je upoštevan dobesedno: `Kp = original` vedno vrne `S` ne glede na `Dp`, `Ks` in `Ds`.
  Drugačna razlaga bi pomenila spremembo zahteve in ni predpostavljena.
- Navigacija med nezaključenim nalaganjem in nove sočasne spremembe podatkov brez osvežitve
  niso del obsega (task/instructions.md).
- Datumi so vedno veljavni YYYY-MM-DD; manjkajoči datumi niso v obsegu.
- Skritih končnih testov ni mogoče izvesti; v poročilu se navedejo kot neizvedeni.
- Besedilo in razporeditev novih kontrol nista predpisana; ohranijo se slovensko
  poimenovanje in potrjeni videz Folio iz `docs/dizajn.md`.
