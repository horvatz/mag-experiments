# Specifikacija P04 — Stabilno razvrščanje z dvema ključema

Različica 1.0 (glavna naloga, postopek A — en agent). Dokument sledi
`task/specification-template.md`. Spremembe specifikacije so zabeležene v
poglavju »Zgodovina sprememb«.

## Problem in kontekst

Folio trenutno prikazuje opravila projekta v vrstnem redu, kot ga vrne
`GET /api/projects/:id/tasks`, brez možnosti razvrščanja. Uporabnik želi
opravila urediti po dveh neodvisnih ključih (primarnem in sekundarnem) ter
smeri, pri čemer mora biti razvrščanje stabilno: izenačena opravila ohranijo
vrstni red prejetega polja, smer pa obrne samo izid primerjave posameznega
ključa. Razvrščanje je zgolj projekcija pogleda — ne spreminja podatkov,
ne piše prek API-ja in se ne shranjuje (niti v URL niti v trajno shrambo).

Začetno stanje: preglednica in tabla izrisujeta `tasks` neposredno; kontrole
razvrščanja ne obstajajo. Sprememba je omejena na `src/`, lastne teste
`tests/agent/` in dokumente `docs/agent/`.

## Vhodi, dejanja in izidi

Podatki: `Task { id, projectId, title, description, status, assignee, dueDate }`
iz obstoječega javnega API-ja (`/api/projects`, `/api/projects/:id/tasks`,
`/api/tasks/:id`). Podprti so prazni projekti, eno opravilo, poljubno število
opravil, enaki naslovi in veljavni datumi `YYYY-MM-DD`.

Dejanja uporabnika:

- izbira primarnega ključa (`original`, `title`, `assignee`, `status`,
  `dueDate`) in primarne smeri (`asc`, `desc`);
- izbira sekundarnega ključa (`none`, `title`, `assignee`, `status`,
  `dueDate`) in sekundarne smeri (`asc`, `desc`);
- klik na gumb **Izvorni vrstni red** (ponastavi vse štiri kontrole);
- preklop pogleda preglednica/tabla, odpiranje/zapiranje podrobnosti,
  menjava projekta, osvežitev strani.

Pričakovano stanje:

- po uspehu se vrstni red vrstic preglednice in kartic znotraj stolpcev table
  spremeni skladno s pravili R01–R07; kontrole odražajo izbrane vrednosti;
- preklop pogleda in odpiranje/zapiranje podrobnosti ohranita vse štiri
  nastavitve (R08);
- menjava projekta in osvežitev vrneta privzete nastavitve
  (`original`, `asc`, `none`, `asc`) (R09);
- napake branja podatkov se obnašajo kot doslej (obstoječi `LoadError`);
- razvrščanje ne pošilja nobene ne-GET zahteve na `/api/` (R11).

## Zahteve in pravila

Simbologija: `T = [t0, t1, … tn-1]` je vrstni red, kot ga vrne API (izvorni
vrstni red). `P` = primarni ključ, `Dp` = primarna smer, `S` = sekundarni
ključ, `Ds` = sekundarna smer. `norm(x)` = `x.normalize('NFD')` z odstranjenimi
znaki U+0300–U+036F in pretvorbo v male črke. `cmp(x, y)` za nize je
`-1/0/1` glede na leksikografsko primerjavo po UTF-16 (`<`, `>`), brez
jezikovnega ali številskega prilagajanja. `dir(c, d) = c` pri `asc`,
`-c` pri `desc`. Razvrščanje je definirano kot stabilna projekcija:
`out = stable_sort(T, key)`, kjer je `key(a, b) = dir(cmpP(a,b), Dp)` in ob
`cmpP = 0` še `dir(cmpS(a,b), Ds)`; ob obeh ničlah se ohrani relativni
izvorni vrstni red (tie-break po indeksu v `T`).

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Ob inicializaciji velja `P=original`, `Dp=asc`, `S=none`, `Ds=asc`; `out = T` (prikaz v vrstnem redu prejetega polja). Predikat: `defaults = {P:'original', Dp:'asc', S:'none', Ds:'asc'} ∧ out = T`. | razvojni D01, lastni A01/A02 (privzeti vrstni red in vrednosti kontrol) |
| R02 | Za `P ∈ {title, assignee}`: `cmpP(a,b) = cmp(norm(a[P]), norm(b[P]))`, kjer `norm` = NFD + odstranitev U+0300–U+036F + male črke; primerjava po UTF-16 z `<`/`>`. Predikati: `norm('Čas') = norm('cas')`; `cmp('Alfa 10','alfa 2') < 0`; `cmp('=SUM(A1)','Alfa') < 0`. | razvojni D01, lastni A03/A04 |
| R03 | Za `P=status` velja rang `todo=0 < in_progress=1 < done=2`. Za `P=dueDate`: veljavni `YYYY-MM-DD` se primerjajo kronološko (leksikografsko po istem zapisu). | razvojni D02, lastni A05 |
| R04 | `dir` obrne samo izid primerjave izbranega ključa: `cmp' = -cmp` pri `desc`; izenačeni elementi se ne obrnejo (tie-break ostane izvorni indeks). Predikat: `∀ a,b: cmpP(a,b)=0 ⇒ out-order(a,b) = T-order(a,b)` tudi pri `Dp=desc`. | lastni A06, A07 |
| R05 | Sekundarni ključ se uporabi natanko takrat, ko je `cmpP = 0`, in sicer s svojo smerjo `Ds`, neodvisno od `Dp`. Predikat: `S≠none ∧ cmpP(a,b)=0 ⇒ odloči dir(cmpS(a,b), Ds)`. | razvojni D02, lastni A08 |
| R06 | Ob enakosti obeh ključev ostane izvorni vrstni red. `S=P` je dovoljen in ne doda obrata (drugi `dir` se izvede le, če je prvi `cmp=0`, in tudi takrat ob `cmp=0` odloči indeks). `P=original ⇒ out=T` ne glede na `S`, `Ds`. | lastni A02, A06, A09 |
| R07 | Tabla ohrani stalni vrstni red stolpcev `todo, in_progress, done`; kartice v stolpcu so filtrirane iz istega razvrščenega polja, torej ohranijo relativni vrstni red preglednice. Predikat: `column(status) = [t ∈ out : t.status = status]`. | razvojni D03, lastni A10 |
| R08 | Preklop pogleda (isti projekt) ohrani vse štiri nastavitve; odpiranje in zapiranje podrobnosti ne ponastavi vrstnega reda. Predikat: `settings' = settings` po vsakem od teh dejanj. | lastni A11 |
| R09 | Menjava projekta ponastavi vse štiri nastavitve; osvežitev začne s privzetimi. Stanje ni v trajni shrambi ali URL-ju. Predikat: ob `projectId' ≠ projectId` ali reloadu velja `settings = defaults`; `location.hash` ne vsebuje ključev razvrščanja. | lastni A12 |
| R10 | Gumb **Izvorni vrstni red** ponastavi vse štiri kontrole na privzete vrednosti in s tem `out = T`. Prazni projekt in projekt z enim opravilom delujeta pri vseh ključih in smereh (brez napak, z ustreznim številom vrstic). | razvojni D04, lastni A13, A14 |
| R11 | Razvrščanje je projekcija: polja opravil, pripadnost, skupna števila in izvorno polje ostanejo nespremenjeni; med razvrščanjem in odpiranjem podrobnosti se ne pošlje nobena ne-GET zahteva na `/api/`. | razvojni D04 (`readonly`), lastni A15 |
| R12 | Vsi ID-ji so prikazani natanko enkrat in odpirajo prave podrobnosti tudi pri enakih naslovih; ohranijo se ostale bralne funkcije in prilagodljiv videz Folio. Predikat: `multiset(ids(out)) = multiset(ids(T))`, vsak `data-task-id` vodi na dialog s svojim ID-jem; pri 390 px `document.documentElement.scrollWidth ≤ innerWidth`. | lastni A16, A17, skupni baseline testi |

Dogovor o vmesniku (iz navodil): HTML `select` z dostopnimi imeni **Primarni
ključ**, **Primarna smer**, **Sekundarni ključ**, **Sekundarna smer** in gumb
**Izvorni vrstni red**. Obstoječi `data-task-id`, dostopna imena pogledov in
stolpcev ter `aria-label="Pregled stanj opravil"` ostanejo.

## Izvedba in sledljivost

Predvidena izvedba: `src/sortTasks.ts` (čisti primerjalniki in `sortTasks`),
`src/App.tsx` (stanje v `ProjectView`, ki je vezano na `key={project.id}`,
orodna vrstica s kontrolami, razvrščeno polje za preglednico in tablo),
`src/styles.css` (orodna vrstica, odzivnost). Izidi so izpolnjeni v
`docs/agent/verification.md` z dejansko izvedenimi testi in dnevniki.

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | privzete vrednosti in izvorni vrstni red | D01, A01 | `App.tsx` (ProjectView, `defaultSortSettings`), `sortTasks.ts` | glej verification.md |
| R02 | normalizacija in UTF-16 | D01, A03, A04 | `sortTasks.ts` (`normalizeText`, `compareText`) | glej verification.md |
| R03 | status rang, datum kronološko | D02, A05 | `sortTasks.ts` (`statusRank`, `compareKey`) | glej verification.md |
| R04 | smer obrne le primerjavo ključa | A06, A07 | `sortTasks.ts` (`sortTasks`) | glej verification.md |
| R05 | sekundarni ključ ob enakosti | D02, A08 | `sortTasks.ts` (`sortTasks`) | glej verification.md |
| R06 | stabilnost in `original` | A02, A06, A09 | `sortTasks.ts` (tie-break po indeksu) | glej verification.md |
| R07 | stolpci in relativni vrstni red | D03, A10 | `TaskBoard.tsx`, `App.tsx` | glej verification.md |
| R08 | ohranitev nastavitev | A11 | `App.tsx` (stanje v ProjectView) | glej verification.md |
| R09 | ponastavitev ob menjavi/osvežitvi | A12 | `App.tsx` (`key={project.id}`), lokalno stanje | glej verification.md |
| R10 | gumb za ponastavitev, prazno/eno | D04, A13, A14 | `App.tsx` (gumb), `sortTasks.ts` | glej verification.md |
| R11 | brez zapisov in sprememb polj | D04, A15 | `App.tsx` (samo GET), `sortTasks.ts` (čista funkcija) | glej verification.md |
| R12 | ID-ji, podrobnosti, 390 px | A16, A17, baseline | `App.tsx`, `TaskBoard.tsx`, `styles.css` | glej verification.md |

## Zgodovina sprememb

| Različica | Datum | Sprememba |
| --- | --- | --- |
| 1.0 | 2026-10-30 | Prva različica specifikacije pred implementacijo. |
| 1.1 | 2026-10-30 | Po implementaciji dopolnjeni pogoji R04/R06 (tie-break po indeksu) in dodana povezava na `docs/agent/verification.md`. Bistvo zahtev nespremenjeno. |

## Odprta vprašanja in omejitve

- Končni ocenjevalni testi naloge niso dostopni; preverjanje temelji na
  skupnih testih izhodišča, razvojnih testih P04 in lastnih testih
  `tests/agent/`. Njihovo kritje je opisano v `docs/agent/verification.md`.
- Nezaključeno nalaganje in sočasne spremembe podatkov brez osvežitve niso
  del obsega (dogovor iz navodil).
- Manjkajoči ali neveljavni datumi niso v obsegu; podatki vsebujejo veljavne
  `YYYY-MM-DD`.
