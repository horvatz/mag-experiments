# P05 — Straničenje in filter stanja

Različica 1.0 · 2026-09-25 · postopek C · Spec Kit 1.0.8 / Lean 1.0.0

## Problem in kontekst

Uporabnik želi pregledovati opravila izbranega projekta po zaporednih straneh in jih omejiti na stanje. Folio trenutno prikazuje vsa opravila v preglednici oziroma razvrščena po stanjih na tabli. Dodamo filter in skupno straničenje obeh pogledov, pri čemer ohranimo obstoječe podrobnosti, navigacijo, slovensko izrazje in [potrjeni dizajn](../../dizajn.md).

Merilo so [izvirne zahteve R01–R12](../../../task/instructions.md), [projektna pravila](../../../PROJECT_RULES.md) in [projektna načela](../../../.specify/memory/constitution.md). Ta dokument izpolnjuje [skupno predlogo](../../../task/specification-template.md). Spremembe aplikacije so omejene na `src/`, lastne teste na `tests/agent/`, dokumentacijo na `docs/agent/`; dodatno sta dovoljeni le procesni datoteki ustave in izbire funkcionalnosti. Strežnik, odvisnosti, nastavitve, skupni tipi/testi in predloge ostanejo nespremenjeni.

## Vhodi, dejanja in izidi

### Podatki in predpostavke

- Projekt: `id`, `name`; opravilo: `id`, `projectId`, `title`, `description`, `status`, `assignee`, `dueDate`, skladno z obstoječimi tipi. Vsako opravilo pripada svojemu projektu.
- Urejeno polje opravil prihaja iz obstoječega javnega `/api/projects/:id/tasks`; projekti in podrobnosti se še naprej berejo prek obstoječih javnih poti. Izbira temelji na enkratnem `id`, ne na naslovu ali položaju.
- Podatkovna domena vključuje prazne projekte, eno ali več kot deset opravil, drugačne ID-je, podvojene naslove, drugačno zaporedje, Unicode, ločila in veljavne koledarske datume. Besedila se prikazujejo kot navadno besedilo.
- Stanja opravil so `todo`, `in_progress`, `done`. Filter dovoljuje tudi `all`; velikost strani je `all`, `2`, `5` ali `10`.

### Stanje in izračun

Naj bo `T` polje vseh opravil trenutnega projekta v vrstnem redu API-ja, `s` velikost strani, `f` filter in `p` notranja številka strani z začetkom 1. Novo lokalno stanje je `q=(s,f,p)`, privzeto `q₀=(all,all,1)`.

```text
F = [t iz T v izvornem vrstnem redu, kjer f = all ali t.status = f]
N = |F|
Y = 0, če N = 0; sicer 1, če s = all; sicer ceil(N / s)
p = 1 pri N = 0; sicer 1 ≤ p ≤ Y
V = F, če s = all; sicer F[(p−1)·s : min(p·s, N)]
X = 0 pri N = 0; sicer p
A = 0 pri N = 0; sicer 1 pri s = all; sicer (p−1)·s + 1
B = 0 pri N = 0; sicer N pri s = all; sicer min(p·s, N)
```

`F` je filtrirani rezultat, `V` trenutna stran; rez uporablja indekse z začetkom 0 in izključno zgornjo mejo. Strani nepraznega `F` so zaporedni neprekrivajoči se odseki, njihova konkatenacija je natanko `F`. Preglednica kaže `V` v njegovem vrstnem redu. Tabla razvrsti samo `V` po stanjih in znotraj stolpca ohrani vrstni red; množici ID-jev obeh pogledov sta enaki.

### Prehodi in izidi dejanj

| Dejanje in pogoj | Stanje po dejanju oziroma izid |
| --- | --- |
| Prvi prikaz projekta, menjava projekta, osvežitev strani | `q := q₀`; stanje prejšnjega projekta se ob vrnitvi ne obnovi. |
| Sprememba velikosti na `s'` | `q := (s', f, 1)`, tudi če bi bila prejšnja stran še veljavna. |
| Sprememba filtra na `f'` | `q := (s, f', 1)`; odstranitev filtra pomeni `f' = all`. |
| Prva oziroma prejšnja stran, če `N > 0` in `p > 1` | `p := 1` oziroma `p := p−1`; `s` in `f` ostaneta enaka. |
| Naslednja oziroma zadnja stran, če `N > 0` in `p < Y` | `p := p+1` oziroma `p := Y`; `s` in `f` ostaneta enaka. |
| Neveljavno dejanje na robu ali pri praznem rezultatu | Gumb je onemogočen; `q` se ne spremeni. |
| Preklop Preglednica/Tabla | `q` se ohrani; prikaz uporablja iste ID-je iz `V`. |
| Odpiranje podrobnosti in zapiranje z gumbom ali preklicem dialoga | `q` se ohrani; podrobnosti pripadajo izbranemu `id`. |
| Nalaganje, napaka branja ali ponovitev branja | Ostane obstoječe vedenje nalaganja, napake in ponovitve; straničenje ne uvaja novih zahtevkov ali zapisov. Napaka se ne obravnava kot uspešno naložen prazen projekt. |

Filter in velikost se uveljavita takoj; nimata ločene potrditve ali preklica. Novo stanje je samo v pomnilniku trenutnega prikaza projekta, brez zapisovanja v URL, `localStorage` ali drugo trajno shrambo. Obstoječe poti projekta, pogleda in podrobnosti ostanejo uporabne.

### Dogovor o vmesniku

- HTML `select` z dostopnim imenom **Velikost strani** in vrednostmi `all/2/5/10` ter HTML `select` **Filter strani** z vrednostmi `all/todo/in_progress/done`.
- Gumbi **Prva stran**, **Prejšnja stran**, **Naslednja stran**, **Zadnja stran**.
- Element `role="status"`, `aria-label="Stanje straničenja"`; natančno besedilo `Stran X od Y. Prikazano A–B od N.` z znakom `–` med indeksoma. Prazen rezultat: `Stran 0 od 0. Prikazano 0–0 od 0.`
- Ohranjeni `data-task-id` na vrsticah in karticah, imena pogledov in stolpcev ter `aria-label="Pregled stanj opravil"`. Morebitna nova dejanja ob opravilu so zunaj njegove povezave.
- Kontrole sledijo obstoječim gradnikom in slogom Folio. Pri širini 390 pik stran nima vodoravnega prelivanja; preglednica in tabla smeta imeti notranje drsenje. Fokus ostane viden. Razporeditev kontrol in nepredpisana besedila niso dodatne zahteve.

## Zahteve in pravila

Vsaka vrstica je sprejemni pogoj; scenariji v naslednjem razdelku so konkretni načini preverjanja, ne omejitev podatkovne domene.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Ob začetku velja `q=q₀`, `V=T`; preglednica ohrani vrstni red API-ja. | S01: začetne vrednosti obeh kontrol in zaporedje ID-jev. |
| R02 | Za `s∈{2,5,10}` so strani rezine `F`; konkatenacija vseh strani je `F`, brez izgubljenih ali podvojenih ID-jev, zadnja je lahko krajša. | S02: sprehod po vseh straneh za vse velikosti na več kot desetih opravilih. |
| R03 | Veljajo štirje prehodi in pogoji omogočenosti gumbov iz tabele; onemogočeno dejanje ne spremeni stanja. | S03: prva, srednja in zadnja stran ter robovi. |
| R04 | Sprememba `s` vedno nastavi `p=1`; `s=all ∧ N>0 ⇒ Y=1`. | S04: menjava velikosti s poznejše, še veljavne strani in prehod na `all`. |
| R05 | Izračun `F` pred `V`; sprememba `f` nastavi `p=1`, filter ohrani relativni vrstni red. | S05: vsi filtri, mešana stanja in sprememba na poznejši strani. |
| R06 | `IDs(preglednica)=IDs(tabla)=IDs(V)`; stolpci nastanejo šele iz `V`. | S06: enakost ID-jev med pogledi pri mešanih stanjih in aktivnem filtru. |
| R07 | Preklop pogleda in odpiranje/zapiranje podrobnosti ne spreminjajo `q`. | S07: aktivni filter in poznejša stran, oba pogleda, gumb zapiranja in Escape. |
| R08 | Menjava projekta in osvežitev nastavita `q₀`; novo stanje ni v trajni shrambi ali URL-ju. | S08: menjava in vrnitev, reload ter pregled URL-ja/shrambe in kode. |
| R09 | Pri `N>0` status natanko ustreza `X,Y,A,B,N` iz formul, z indeksi od 1. | S09: prva, srednja, zadnja krajša stran, `all` in filtrirani rezultat. |
| R10 | Pri `N=0` je status natanko ničelni, vsi gumbi onemogočeni; odstranitev filtra postavi `p=1`. | S10: prazen projekt, filter brez zadetkov in vrnitev na `all`. |
| R11 | Pregled stanj in skupno število uporabljata `T`; števec stolpca `k` je `|{t∈V : t.status=k}|`. | S11: nespremenjeni globalni števci in števci stolpcev ob filtriranju/straničenju. |
| R12 | Straničenje/filtriranje ne mutirata podatkov in ne pošiljata zapisov; ohranjeni ID-ji, povezave, podrobnosti, nalaganje in Folio. | S12: nadzor zahtevkov, regresijski testi, drugačni ID-ji/enaki naslovi/Unicode in prikaz pri 390 pikah. |

## Uporabniški scenariji in merilo uspeha

1. **Pregled daljšega projekta (S01–S04, S09):** uporabnik vidi vsa opravila, izbere 2, obišče naslednjo, prejšnjo, zadnjo in prvo stran; sprememba na 5, 10 ali `all` začne na prvi strani. Preverjajo se ID-ji in točno besedilo statusa.
2. **Omejitev po stanju (S05, S06, S11):** uporabnik na poznejši strani izbere posamezno stanje. Rezultat začne na prvi strani in ima izvirni relativni vrstni red; preklop na tablo ohrani isti odsek. Globalni števci ostanejo enaki, stolpci štejejo vidne kartice.
3. **Ohranitev in ponastavitev (S07, S08):** na poznejši filtrirani strani uporabnik preklopi pogled ter odpre in zapre podrobnosti. Stanje se ohrani. Menjava projekta, vrnitev in osvežitev ga ponastavijo.
4. **Prazni in majhni rezultati (S09, S10):** projekt brez opravil ali filter brez zadetkov prikaže ničelni status in onemogočene gumbe; po odstranitvi filtra je spet prva stran. Eno opravilo ima eno stran in onemogočene gumbe.
5. **Regresija in podatkovna neodvisnost (S12):** drugačni ID-ji, ponovljeni naslovi, Unicode in poljubno dovoljeno zaporedje ne pokvarijo povezav ali podrobnosti; uporaba kontrol ne zapisuje podatkov in ostane uporabna tudi pri 390 pikah.

Uspeh pomeni izpolnitev vseh R01–R12 in ohranitev obstoječih regresijskih zahtev z določljivimi rezultati preverjanj. Ni dodatnih zunanjih meritev ali novih funkcionalnosti.

## Izvedba in sledljivost

Spodaj so lokacije za predvideno izvedbo na podlagi pregleda izhodišča, ne trditve o že izdelani rešitvi. `ProjectView` v `src/App.tsx` trenutno prikazuje celotno polje, `TaskBoard` v `src/TaskBoard.tsx` ga združuje po stanjih; projektni `key` že določa življenjsko dobo prikaza. Implementacija bo dopolnila natančne povezave in dokazila v tej tabeli.

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | Privzeto `q₀`, `V=T` | S01 | `src/App.tsx`: ProjectView, začetno stanje | Ni implementirano/preverjeno. |
| R02 | Rezine vseh velikosti | S02; razvojni D01/D02 delno | `src/App.tsx`: izračun trenutne strani | Ni implementirano/preverjeno. |
| R03 | Navigacija in robovi | S03; D01/D02 delno | `src/App.tsx`: navigacijski gumbi | Ni implementirano/preverjeno. |
| R04 | Sprememba velikosti → 1 | S04; D04 delno | `src/App.tsx`: izbira velikosti | Ni implementirano/preverjeno. |
| R05 | Filter pred rezom, vrnitev na 1 | S05; D03 delno | `src/App.tsx`: filtriranje in izbira stanja | Ni implementirano/preverjeno. |
| R06 | Skupni `V` | S06; D03 delno | `src/App.tsx`: podatki za preglednico/TaskBoard; `src/TaskBoard.tsx`: stolpci | Ni implementirano/preverjeno. |
| R07 | Ohranitev `q` | S07 | `src/App.tsx`: ProjectView; `src/TaskDetails.tsx`: obstoječe zapiranje | Ni implementirano/preverjeno. |
| R08 | Ponastavitev `q₀` | S08 | `src/App.tsx`: projektni key in lokalno stanje | Ni implementirano/preverjeno. |
| R09 | Natančni indeksi/status | S09; D02 delno | `src/App.tsx`: status straničenja | Ni implementirano/preverjeno. |
| R10 | Prazen rezultat | S10 | `src/App.tsx`: ničelni status, gumbi in prazen prikaz | Ni implementirano/preverjeno. |
| R11 | Števci `T` in `V` | S11 | `src/App.tsx`: counts/skupno število; `src/TaskBoard.tsx`: entries | Ni implementirano/preverjeno. |
| R12 | Branje in regresija | S12; D04 delno; skupni testi | `src/App.tsx`, `src/styles.css`; obstoječi API, navigacija in podrobnosti | Ni implementirano/preverjeno. |

Razvojni D01–D04 so v `tests/development/P05.spec.ts`; skupna testa sta `tests/baseline.spec.ts` in `tests/api.spec.ts`. Dodatni testi bodo v `tests/agent/`. V tem koraku je bil izveden samo pregled izvornih navodil in lokalne kode; testni programi niso bili zagnani.

## Odprta vprašanja in omejitve

- Bistvenih odprtih vprašanj ni; pot funkcionalnosti je izrecno določena kot `docs/agent/P05`.
- Razlika med notranjo prvo stranjo in prikazano ničelno stranjo pri praznem rezultatu je opredeljena s formulami; ne uvaja novega uporabniškega vedenja.
- »Osvežitev« pomeni osvežitev strani aplikacije; obstoječa ponovitev branja po napaki ostaja obstoječe dejanje.
- Navigacija med nedokončanim nalaganjem in nove sočasne spremembe podatkov brez osvežitve niso razširjene prek obstoječih regresijskih zahtev.
- Končni testi niso dostopni. Razvojni primeri niso popolno merilo; dodatni scenariji pokrivajo širšo dovoljeno domeno.
- Uporabniški vmesnik ne sme brati `/__test/` ali uvažati testnih pripomočkov. Noben nov zapisovalni API, odvisnost ali preureditev infrastrukture ni del naloge.

## Zgodovina sprememb

- 2026-09-25, 1.0: začetna specifikacija vseh R01–R12, prehodov stanja, predikatov, scenarijev in še neizvedene sledljivosti.
