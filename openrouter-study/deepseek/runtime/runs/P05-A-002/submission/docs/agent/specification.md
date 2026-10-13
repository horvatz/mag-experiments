# P05 – Razvojna specifikacija: straničenje in filter stanja

Postopek A (en agent). Datum: 2026-10-11. Izdelek temelji na
`task/instructions.md` (R01–R12) in predlogi `task/specification-template.md`.

## Problem in kontekst

Folio trenutno prikaže vsa opravila projekta v izvornem vrstnem redu, brez
straničenja in filtriranja. Pri projektih z veliko opravili je seznam
nepregleden, tabla pa vedno združi celoten seznam. Namen spremembe je dodati
straničenje s štirimi dejanji premikanja, izbiro velikosti strani in filter
stanja, pri čemer se podatki še naprej berejo iz javnega API-ja `/api/`
(brez zapisov) in videz Folio ostane nespremenjen.

Stanje straničenja je lokalno trenutnemu projektu, ni shranjeno v trajni
shrambi niti v URL-ju. Menjava projekta in osvežitev strani stanje ponastavita.

## Vhodi, dejanja in izidi

- Vhodni podatki: `Task[]` iz `GET /api/projects/:id/tasks` (polja `id`,
  `projectId`, `title`, `description`, `status`, `assignee`, `dueDate`).
  Vrstni red odgovora je izvorni vrstni red prikaza.
- Dejanja: izbira velikosti strani (`all`, `2`, `5`, `10`), izbira filtra
  (`all`, `todo`, `in_progress`, `done`), `Prva stran`, `Prejšnja stran`,
  `Naslednja stran`, `Zadnja stran`, preklop pogleda Preglednica/Tabla,
  odpiranje/zapiranje podrobnosti, menjava projekta, osvežitev.
- Uspeh: prikazana je izbrana stran filtriranega polja, status opisuje stanje,
  neveljavna dejanja so onemogočena. Napaka nalaganja ostane obstoječi
  `LoadError` z ponovitvijo; straničenje ne spreminja podatkov in ne piše na API.

Simboli: `T` = vsa opravila projekta v izvornem vrstnem redu, `N = |T|`.
`f ∈ {all, todo, in_progress, done}` je filter, `s ∈ {all, 2, 5, 10}` velikost
strani, `k` trenutna stran. `F = [t ∈ T : f = all ∨ t.status = f]`,
`n = |F|`, `c = t.status`. Efektivna velikost `se = s` za `s ≠ all`,
`se = max(n, 1)` za `s = all`. `m = 0`, če `n = 0`, sicer
`m = ceil(n / se)` (za `s = all` je `m = 1`). Odsek strani `k` je
`S_k = F[(k−1)·se .. min(k·se, n) − 1]` (indeksi od 0).

## Zahteve in pravila

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Začetno stanje vsakega projekta: `f = all`, `s = all`, `k = 1`; prikazan `S_1 = T` v izvornem vrstnem redu. | D01; A01 |
| R02 | Za `s ∈ {2,5,10}` velja `S_i ∩ S_j = ∅` za `i ≠ j` in `∪ S_i = F`; `|S_m| ≤ s`, `|S_i| = s` za `i < m`. Noben ID se ne izgubi ali podvoji. | D01, D02; A02, A07 |
| R03 | `Prva/Prejšnja` nastavita `k = 1` oz. `max(1, k−1)`; `Naslednja/Zadnja` `min(m, k+1)` oz. `m`. Ob `k = 1` sta Prva in Prejšnja onemogočeni, ob `k = m` Naslednja in Zadnja; onemogočeno dejanje ne spremeni stanja. | D02; A03, A10 |
| R04 | Sprememba `s → s2` nastavi `k = 1`; `s = all` pomeni `m = 1` pri `n > 0`. | D04; A04 |
| R05 | `F` se izračuna iz `T` pred razdelitvijo na strani; sprememba `f → f2` nastavi `k = 1`; vrstni red `F` je podvrstni red `T`. | D03; A05 |
| R06 | Preglednica in tabla prikažeta isti `S_k`; tabla združi `S_k` v tri stolpce po `c` (brez ločenega straničenja stolpcev). | D03; A06 |
| R07 | Preklop pogleda, odpiranje in zapiranje podrobnosti ohranijo `(f, s, k)`. | A07 |
| R08 | Menjava projekta ali osvežitev nastavi `(f, s, k) = (all, all, 1)`; stanje ni v `localStorage`/`sessionStorage` niti v URL-ju. | A08 |
| R09 | Za `n > 0`: status = `Stran k od m. Prikazano A–B od n.`, `A = (k−1)·se + 1`, `B = A + |S_k| − 1`; ločilo med A in B je pomišljaj `–` (U+2013). | D02; A02, A09 |
| R10 | Za `n = 0`: status = `Stran 0 od 0. Prikazano 0–0 od 0.` in vsi štirje gumbi onemogočeni; po odstranitvi filtra je `k = 1`. | A09, A10 |
| R11 | Pregled stanj (`Pregled stanj opravil`) šteje celoten `T`; števci stolpcev table štejejo `S_k`; skupno število opravil se s straničenjem ne spremeni. | A06, A11 |
| R12 | Straničenje ne kliče PATCH/POST; `data-task-id`, povezave, podrobnosti, nalaganje in prilagodljiv videz ostanejo. | D04; A12 |

Splošna pravila veljajo za poljubne podatke iz opisane domene (tudi 0, 1,
več kot 10 opravil, enaki naslovi, poljubni ID-ji, Unicode besedilo).

## Izvedba in sledljivost

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | privzeto `all/all`, izvorni vrstni red | D01, A01 | `src/App.tsx` (`ProjectView`, `useState("all")`) | uspešno – glej `verification.md` |
| R02 | zaporedni, neprekrivajoči se odseki | D01, D02, A02, A07 | `src/App.tsx` (`slicePage`) | uspešno |
| R03 | robovi in onemogočena dejanja | D02, A03, A10 | `src/App.tsx` (gumbi, `disabled`) | uspešno |
| R04 | menjava velikosti vrne na prvo stran | D04, A04 | `src/App.tsx` (`onChange` za velikost) | uspešno |
| R05 | filter pred straničenjem, ponastavitev strani | D03, A05 | `src/App.tsx` (`filtered`, `onChange` za filter) | uspešno |
| R06 | ista stran v obeh pogledih, združevanje `S_k` | D03, A06 | `src/App.tsx`, `src/TaskBoard.tsx` | uspešno |
| R07 | ohranitev stanja pri pogledu/podrobnostih | A07 | `src/App.tsx`, `src/navigation.ts` | uspešno |
| R08 | ponastavitev ob projektu/osvežitvi | A08 | `src/App.tsx` (`key={project.id}`) | uspešno |
| R09 | natančno besedilo statusa | D02, A02, A09 | `src/App.tsx` (`pageStatus`) | uspešno |
| R10 | prazen rezultat in onemogočeni gumbi | A09, A10 | `src/App.tsx` | uspešno |
| R11 | pregled celotnega projekta, števci strani | A06, A11 | `src/App.tsx`, `src/TaskBoard.tsx` | uspešno |
| R12 | brez zapisov, ohranjene povezave | D04, A12 | `src/App.tsx`, obstoječe komponente | uspešno |

Dejansko izvedena preverjanja z dnevniki in omejitvami so v
`docs/agent/verification.md`.

## Odprta vprašanja in omejitve

- Besedilo in razporeditev novih kontrol nista predpisana; izbrana sta
  "Velikost strani", "Filter strani" in vrstni red gumbov iz dogovora.
- Pri praznem projektu ostanejo kontrole vidne (filter je mogoče odstraniti);
  prikazano je obstoječe prazno stanje.
- Sočasne spremembe podatkov brez osvežitve in navigacija med nalaganjem nista
  razširjeni prek obstoječih regresijskih zahtev; stran se ob spremembi
  podatkov normalizira na veljavno stran.
- Končnih skritih testov izvajalca ni mogoče zagnati; pokriti so enakovredni
  scenariji v `tests/agent/`.

## Zgodovina sprememb specifikacije

- 2026-10-11: prva različica pred implementacijo (R01–R12, predikati).
- 2026-10-11: po implementaciji dopolnjena tabela sledljivosti z dejanskimi
  datotekami in rezultati preverjanja; vsebina zahtev nespremenjena.
- 2026-10-11: med preverjanjem popravljeni lastni testi (drugi `mount` istega
  URL-ja zahteva osvežitev strani); zahteve in pogoji nespremenjeni.
