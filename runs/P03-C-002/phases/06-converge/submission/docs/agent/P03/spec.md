# P03 — Iskanje in sestavljeni filtri

Različica 1.1, 2026-09-23. Postopek C, Spec Kit 1.0.8 / Lean 1.0.0.

## Problem in kontekst

Uporabnik želi v trenutnem projektu hitro omejiti opravila po besedilu, stanju in odgovorni osebi ter ohraniti izbor ob preklopu med preglednico in tablo. Izhodiščni Folio prikazuje vsa opravila iz javnega API-ja, pregled stanj, oba pogleda in bralne podrobnosti. Dopolnitev doda sestavljene filtre, števec rezultatov in čiščenje filtrov; ohrani navigacijo, podatke in [potrjeni dizajn Folio](../../dizajn.md).

Merilo so vsa izvirna [navodila R01–R12](../../../task/instructions.md), [projektna pravila](../../../PROJECT_RULES.md) in [ustava](../../../.specify/memory/constitution.md). Ta dokument izpolnjuje razdelke [skupne predloge](../../../task/specification-template.md). Opuščena podrobnost v dokumentih ne razveljavi izvirne zahteve.

## Vhodi, dejanja in izidi

- Podatki: urejen seznam opravil trenutnega projekta iz `/api/`; iskalna polja `id`, `title`, `description`, `assignee`, filter `status` in pripadnost `projectId`. `dueDate` ostane del obstoječega prikaza. ID-ji so enkratni; naslovi se lahko ponavljajo. Število opravil je poljubno, tudi 0, 1 ali več kot 10. Besedila vsebujejo Unicode in ločila; datumi so veljavni. Imena za izbiro oseb so neprazna in niso rezervirana vrednost `all`.
- Dejanja: vpis iskanja, izbira stanja ali osebe, čiščenje filtrov, preklop pogleda/projekta, osvežitev strani, odpiranje in zapiranje obstoječih bralnih podrobnosti. Filtriranje samo izpelje prikaz iz prebranih podatkov.
- Uspeh: oba pogleda prikazujeta ustrezne ID-je, števci sledijo rezultatom, polja podatkov in izvorni vrstni red ostanejo nespremenjeni.
- Preklic: filtriranje nima postopka potrditve ali novega dejanja preklica; uporabnik spremeni kontrole ali izbere `Počisti filtre`. Zapiranje podrobnosti uporablja obstoječe vedenje.
- Napaka/nalaganje: ohranita obstoječa prikaza nalaganja, napake in ponovnega poskusa. Napaka pridobivanja podatkov ni stanje »Ni zadetkov.«. Ne dodajamo novih potekov za navigacijo med nalaganjem ali sočasne spremembe podatkov.

### Dogovor o vmesniku

Iskalnik je `input type="search"` z dostopnim imenom `Išči opravila`. Filtra sta HTML `select` z imenoma `Filter stanja` (vrednosti `all`, `todo`, `in_progress`, `done`) in `Filter odgovorne osebe` (`all` ali točno ime). Gumb ima ime `Počisti filtre`. Števec ima `role="status"`, `aria-label="Rezultati filtriranja"` in besedilo `Prikazano: N od M.`.

Ohranimo `data-task-id` na vrsticah/karticah, dostopna imena pogledov in stolpcev ter `aria-label="Pregled stanj opravil"`. Nova dejanja ob opravilu morajo biti zunaj njegove povezave. Razporeditev kontrol in drugo besedilo sledita obstoječemu Foliu; nista dodatno predpisana. Na širini 390 pik ni vodoravnega razširjanja cele strani; notranje drsenje table/preglednice je dovoljeno.

## Zahteve in pravila

### Predikati in spremembe stanja

Naj bo `T_p` izvorni urejeni seznam opravil projekta `p`, `q` iskalni vnos, `s` izbrano stanje in `a` izbrana oseba. Privzeti filtri so `F₀ = ("", all, all)`.

- `norm(x) = lowercase(remove[U+0300–U+036F](NFD(x)))`.
- `H(t) = norm(joinWithSpaces(t.id, t.title, t.description, t.assignee))`. Presledek med polji prepreči zlepljanje besed s sosednjih polj.
- `W(q)` je seznam nepraznih besed po delitvi `norm(q)` po belinah.
- `search(t,q) ⇔ ∀w ∈ W(q): H(t).includes(w)`. `includes` pomeni dobeseden podniz, brez interpretacije regularnih izrazov. Pri praznem seznamu besed velja predikat za vsako opravilo.
- `match(t,q,s,a) ⇔ search(t,q) ∧ (s=all ∨ t.status=s) ∧ (a=all ∨ t.assignee=a)`. Primerjava osebe je natančna, brez normalizacije.
- `V = filter(T_p, match)` ohrani relativni vrstni red in ne spreminja polj. Možnosti oseb so `{all} ∪ distinct(t.assignee za t ∈ T_p, t.assignee ≠ "")`; ne izhajajo iz `V`.
- `N=|V|`, `M=|T_p|`; `C_k=|{t∈V: t.status=k}|`. Pregled stanj in števci stolpcev uporabljajo `C_k`. Stolpec `k` vsebuje urejeno podzaporedje `V` s stanjem `k`; množici ID-jev obeh pogledov sta enaki.
- Prvo nalaganje ali osvežitev: `F := F₀`. Sprememba kontrole spremeni ustrezno sestavino `F` in izpelje `V`. Preklop pogleda ohrani `F`. Menjava projekta `p→p'` ponastavi `F:=F₀`; podatki in možnosti oseb izvirajo izključno iz `T_p'`. Tudi vrnitev v prej obiskani projekt začne s privzetimi filtri.
- `Počisti filtre`: v enem dejanju `F:=F₀`, zato `V=T_p`. Filtri se ne kodirajo v URL in ne zapisujejo v trajno shrambo brskalnika. Obstoječi URL za projekt/pogled/podrobnosti ostane dovoljen.
- `M>0 ∧ N=0` pomeni sporočilo `Ni zadetkov.` in uporabna oba pogleda s kontrolami. `M=0` ohrani običajno prazno stanje posameznega pogleda in števec `Prikazano: 0 od 0.`; to ni neuspešno iskanje.

### Sprejemni pogoji

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Ob nalaganju `F=F₀`, prikazana vsa opravila trenutnega projekta v izvornem vrstnem redu. | S01: prazne/privzete kontrole in točno zaporedje ID-jev. |
| R02 | `norm` se uporabi na iskalniku in vseh štirih združenih poljih. | S02: zadetek po vsakem polju, č/c, velike/male črke, sestavljeni in razstavljeni Unicode. |
| R03 | Vse neprazne besede morajo biti dobesedni podnizi, ne glede na vrstni red; beline/prazen vnos ne omejujejo. | S02: več besed čez različna polja, obrnjeni vrstni red, tabulatorji, presledki in ločila `.*[]`. |
| R04 | Iskanje, stanje in točna oseba so združeni z IN; stanja imajo dogovorjene vrednosti. | S03: preseki treh pogojev in različni, podobno zapisani imeni. |
| R05 | Osebe vsebujejo `all` in vsa različna neprazna imena celotnega projekta po enkrat; projekt ne podeduje stare osebe. | S03/S05: podvojena imena, oseba skrita zaradi drugih pogojev, menjava projekta. |
| R06 | Oba pogleda imata iste ustrezne ID-je; preklop ohrani kontrole; stolpci imajo samo svoje stanje. | S04: preglednica → tabla → preglednica, ID-ji, vrednosti kontrol in stolpci. |
| R07 | Menjava projekta ponastavi tri kontrole; ni uporabe filtrov na tujih podatkih. | S05: filtriran prvi projekt → drugi → prvi, tudi prazen drugi projekt. |
| R08 | Osvežitev vrne privzete filtre; URL in trajna shramba ne vsebujeta filtrov. | S05: osvežitev filtriranega pogleda, pregled URL-ja in brskalnikove shrambe. |
| R09 | Števec je točno `Prikazano: N od M.`; pregled stanj in stolpci štejejo `V`. | S04: primerjava N/M/C_k v obeh pogledih, tudi pri nič rezultatih. |
| R10 | Za neprazen projekt brez zadetkov je `Ni zadetkov.`; oba pogleda ostaneta uporabna. Prazen projekt ohrani svoje prazno stanje in 0 od 0. | S06: nič zadetkov v obeh pogledih, nato resnično prazen projekt. |
| R11 | En klik čiščenja ponastavi vse tri kontrole; podatki in vrstni red ostanejo izvorni. | S01/S06: čiščenje kombinacije vseh filtrov, točno zaporedje ID-jev in nespremenjeni podatki. |
| R12 | Navigacija, bralne podrobnosti, Folio in širina 390 pik ostanejo uporabni; filtriranje ne povzroči POST/PATCH/PUT/DELETE na `/api/`. | S07: regresijski testi, podrobnosti po ID-ju, beleženje omrežja, pregled obeh pogledov pri 390 pik. |

### Uporabniški scenariji in merilo uspeha

- **S01 — Začetni pregled:** uporabnik odpre projekt, vidi privzete kontrole in vsa opravila v zaporedju API-ja; po poljubnem filtriranju jih obnovi z enim klikom.
- **S02 — Iskanje:** uporabnik poišče besede iz ID-ja, naslova, opisa ali imena. Različna velikost črk in diakritika ne spremenita rezultatov; več besed in ločila sledijo predikatu, ne regularnim izrazom.
- **S03 — Presek filtrov:** uporabnik združi iskanje, stanje in osebo; izbirnik oseb ostane popoln, primerjava osebe ostane natančna.
- **S04 — Dva pogleda:** uporabnik preklaplja prikaza z aktivnimi filtri; ID-ji in števci so skladni, vrstni red znotraj posameznega stanja sledi API-ju.
- **S05 — Življenjska doba:** uporabnik menja projekte in osveži stran; kontrole se ponastavijo in prikaz pripada samo trenutnemu projektu.
- **S06 — Prazni izidi:** uporabnik razlikuje prazen projekt od neuspešnega iskanja ter lahko preklopi pogled ali počisti filtre.
- **S07 — Obstoječi Folio:** uporabnik odpre pravilne podrobnosti po ID-ju tudi pri enakih naslovih, navigira in uporablja oba pogleda pri 390 pik; filtriranje ne zapisuje podatkov.

Uspeh pomeni izpolnjene R01–R12 ter ohranjeno izhodiščno delovanje, dokazano z dejansko izvedenimi preverjanji. Razvojni primeri so primeri, ne omejitev dovoljene domene; zunanjih meritev ali novih funkcionalnosti ne uvajamo.

## Izvedba in sledljivost

Izpolnjena tabela vseh R01–R12 s pogoji, dejanskimi deli kode, imeni testov in izidi je v [osrednjem poročilu preverjanja](../verification.md#sledljivost-r01r12). S tem je razdelek skupne predloge izpolnjen prek povezave, brez podvajanja dokazil.

Implementirane naloge so v [tasks.md](tasks.md). Izveden je `npm run check`: lint, tipi, gradnja in 54/54 testov so uspešni (38 osnovnih, 8 razvojnih, 8 lastnih). [Dnevnik](check.log) vsebuje dejanska imena in izide. Vizualno so pregledani namizni in ozki posnetki, povezani v poročilu. Končni testi niso dostopni in niso bili izvedeni.

## Odprta vprašanja in omejitve

Bistvenih odprtih vprašanj ni: izvirna navodila določajo vedenje. Razporeditev novih kontrol in nepredpisano besedilo se smiselno prilagodita Foliu. Vrstni red imen v izbirniku ni predpisan. Združevanje iskalnih polj uporablja presledke; s tem ne uvajamo nove funkcionalnosti.

Podatki ostanejo iz javnega API-ja; `/__test/` in razvojni pripomočki so dovoljeni samo testnemu programu. Ne spreminjamo strežnika, infrastrukture, odvisnosti, skupnih tipov/testov, uradnih predlog ali veščin. Implementacija je omejena na `src/`, lastne teste in dokumentacijo; procesni izjemi sta ustava in `.specify/feature.json`. Nova stanja nalaganja, sočasno urejanje in zapisovalni API-ji niso predmet naloge.

Implementacija in načrtovana preverjanja so zaključeni. Znana odstopanja od R01–R12 niso ugotovljena; omejitve preverjanja in nedostopnost končnih testov so zapisane v [poročilu](../verification.md#omejitve-in-predaja).

### Zgodovina sprememb

- 2026-09-23, 1.0: začetna specifikacija vseh R01–R12, predikati, prehodi stanja, scenariji in začetna sledljivost; brez sprememb aplikacije.

- 2026-09-23, 1.1: implementirane R01–R12; začetna sledljivost nadomeščena s povezavo na izpolnjeno osrednjo tabelo v `docs/agent/verification.md`; 54 uspešnih testov in vizualni pregled. Vedenjske zahteve ostajajo enake.
