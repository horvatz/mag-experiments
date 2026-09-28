# P05: Straničenje in filter stanja

**Različica zahtev**: 1.0  
**Projekt**: Folio

## Problem in kontekst

Folio uporabniku omogoča izbiro projekta, ogled opravil v preglednici ali tabli ter odpiranje podrobnosti opravila. Trenutno oba pogleda prikažeta cel seznam izbranega projekta. P05 doda lokalno straničenje in filter stanja, da uporabnik lažje pregleda seznam, ne da bi se spremenili opravila ali obstoječe povezave.

Sprememba mora ohraniti potrjeni videz Folia iz [`docs/dizajn.md`](../../dizajn.md), slovenska poimenovanja, obstoječe gradnike, odzivnost, nalaganje in podrobnosti. Podatki ostanejo pridobljeni prek obstoječega javnega `/api/`; strežnik, skupni tipi, odvisnosti in skupni testi niso del te funkcionalnosti.

## Vhodi, dejanja in izidi

- Vhod je seznam opravil izbranega projekta, prebran prek `GET /api/projects/:id/tasks`. Uporabljena polja so `id`, `projectId` in `status`; vrstni red vhodnega seznama je izvorni vrstni red. Vsako opravilo pripada enemu projektu.
- Uporabnik izbere velikost `all`, `2`, `5` ali `10`, filter `all`, `todo`, `in_progress` ali `done`, stran s štirimi gumbi, pogled ali opravilo za podrobnosti.
- Uspešna sprememba velikosti ali filtra posodobi lokalno stanje straničenja po pravilih spodaj. Navigacija spremeni samo trenutno stran. Preklop pogleda in odpiranje ali zapiranje podrobnosti ohranita stanje straničenja.
- Menjava projekta in osvežitev ponastavita stanje. Straničenje in filter ne spreminjata podatkov ter ne pošiljata zapisovalnih zahtev na API.
- Med nalaganjem in ob napaki ostanejo veljavni obstoječi prikazi nalaganja, ponovnega poskusa in napake. Zahteve ne določajo dodatne navigacije med nezaključenim nalaganjem. Obstoječe povezave do projektov in opravil ter vedenje podrobnosti ostanejo uporabni.

## Zahteve in pravila

### Model stanja in predikati

Za trenutno izbrani projekt naj bo `T` seznam opravil iz API-ja v prejetem vrstnem redu, `f` filter, `s` velikost strani in `k` številka strani z začetkom pri 1. Naj bo `F = T`, če je `f = all`; sicer je `F` podseznam opravil iz `T`, katerih `status = f`, pri čemer se vrstni red ohrani. Naj bo `N = |F|`.

Za neprazen `F` je število strani `Y = 1`, kadar je `s = all`, sicer `Y = ceil(N / s)`. Pri `s = all` je prikazana stran `P = F`, `k = 1`, `A = 1` in `B = N`. Pri številčni velikosti strani je `P = F[(k−1)s : min(ks,N)]`, `A = (k−1)s + 1` in `B = min(ks,N)`. Indeksa `A` in `B` sta vključujoča in se nanašata na filtrirani seznam `F`, ne na celoten projekt.

Če je `N = 0`, je `Y = 0`, prikazani seznam je prazen in status poroča nič strani ter nič opravil. Po spremembi filtra ali velikosti se `k` nastavi na 1; po menjavi projekta in ob osvežitvi se `(s,f,k) = (all,all,1)`. V ne-praznem rezultatu velja `1 ≤ k ≤ Y`. Pri praznem rezultatu ni veljavne strani za navigacijo.

| Dogodek | Pogoj in prehod stanja |
| --- | --- |
| Začetni prikaz, osvežitev ali izbira drugega projekta | `s := all`, `f := all`, `k := 1`. Stanje straničenja ni v URL-ju ali trajni shrambi. |
| Sprememba velikosti na `s'` | `s := s'`, `k := 1`; filter ostane enak. |
| Sprememba filtra na `f'` | `f := f'`, `k := 1`; velikost ostane enaka. Filtriranje ohrani vrstni red `T`. |
| Prva stran / Prejšnja stran | Dovoljeno, ko `N > 0` in `k > 1`; nova stran je `1` / `k−1`. |
| Naslednja stran / Zadnja stran | Dovoljeno, ko `N > 0` in `k < Y`; nova stran je `k+1` / `Y`. |
| Dejanje na robu ali ob `N = 0` | Ustrezni gumb je onemogočen; stanje se ne spremeni. |
| Preklop preglednice/table ali odprtje/zaprtje podrobnosti | `(s,f,k)` ostane nespremenjen. |

| ID | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Ob začetnem prikazu sta `s = all` in `f = all`; prikazani ID-ji so vsi ID-ji iz `T` v istem vrstnem redu. | Scenarij: začetni seznam z več opravili, preveri izbrane kontrole in urejen seznam ID-jev. |
| R02 | Pri velikosti 2, 5 ali 10 zaporedne strani tvorijo razčlenitev `F`: vsako opravilo se pojavi natanko enkrat, brez prekrivanja ali izgube; zadnja stran lahko vsebuje manj zapisov. | Scenariji za velikosti 2/5/10 in število zapisov, ki ni večkratnik velikosti; preveri zaporedje ID-jev skozi vse strani. |
| R03 | Navigacija Prva/Prejšnja/Naslednja/Zadnja vodi na stran 1/`k−1`/`k+1`/`Y`; na neveljavnem robu je ustrezen gumb onemogočen in stanje ostane enako. | Scenarij: preveri gumbe ter ID-je na prvi, vmesni in zadnji strani. |
| R04 | Vsaka sprememba velikosti nastavi `k = 1`, tudi kadar je prejšnji `k` še znotraj novega `Y`; `all` ima pri `N > 0` eno stran. | Scenarij: pojdi na poznejšo stran, spremeni velikost v tako, pri kateri bi bila ta stran veljavna, in preveri prvo stran. |
| R05 | Filter se uporabi pred straničenjem; `F` vsebuje samo izbrano stanje in ohrani vrstni red `T`. Sprememba filtra nastavi `k = 1`. | Scenarij: uporabi filter pri številčni velikosti z več stranmi, preveri ujemajoče ID-je in ponastavitev strani. |
| R06 | Preglednica in tabla prikažeta isti nabor ID-jev `P`. Tabla razporedi opravila iz `P` v stolpce šele po straničenju; stolpci niso ločeno straničeni. | Scenarij: primerjaj ID-je obeh pogledov pri aktivnem filtru in strani; na tabli preveri razvrstitev samo tega odseka. |
| R07 | Preklop pogleda, odprtje podrobnosti in zaprtje z gumbom ali Escape ne spremenijo `s`, `f` ali `k`. | Scenarij: nastavi neprivzeto stran in filter, izvedi vsak prehod ter preveri kontrole in ID-je. |
| R08 | Ob izbiri drugega projekta ali osvežitvi so `s = all`, `f = all`, `k = 1`. Stanje straničenja ni zapisano v URL ali trajno shranjeno. | Scenarij: spremeni vsa tri stanja, zamenjaj projekt oziroma osveži in preveri ponastavitev ter URL/shrambo. |
| R09 | Za `N > 0` element `role=status`, `aria-label="Stanje straničenja"` vsebuje natančen vzorec `Stran X od Y. Prikazano A–B od N.`; `X=k`, `Y` je število strani, `A/B` sta zgoraj določena indeksa. | Scenarij: preveri besedilo na začetku, vmesni strani in krajši zadnji strani. |
| R10 | Za prazen projekt ali prazen rezultat filtra status vsebuje `Stran 0 od 0. Prikazano 0–0 od 0.` in vsi štirje navigacijski gumbi so onemogočeni. Odstranitev filtra prikaže prvo stran rezultata. | Scenarij: prazen projekt, filter brez zadetkov, nato `all`; preveri status, gumbe in ID-je. |
| R11 | Pregled stanj projekta in skupno število opravil temeljita na celotnem, nefiltriranem `T`; števci stolpcev table štejejo opravila trenutne strani `P`. Straničenje ne zmanjša števila vseh opravil. | Scenarij: uporabi filter in stran, primerjaj pregled stanj s celotnim `T` ter števce stolpcev s karticami v `P`. |
| R12 | Straničenje ne spreminja opravil in ne pošilja zapisovalnih zahtev na API. Ostanejo uporabni ID-ji (`data-task-id` na vrsticah in karticah), obstoječa imena pogledov in stolpcev, `aria-label="Pregled stanj opravil"`, povezave, podrobnosti ter nalaganje. Nova dejanja pri opravilu so zunaj njegove povezave. Pri širini 390 px se celotna stran ne razširi; preglednica in tabla lahko drsita znotraj sebe. | Scenarij: spremljaj omrežne zahteve, odpri opravilo iz obeh pogledov, preveri atribute in dostopna imena ter izmeri širino pri 390 px. |

### Dogovor o uporabniškem vmesniku in podatkih

- HTML selecta imata dostopni imeni `Velikost strani` in `Filter strani`, z vrednostmi, določenimi zgoraj. Gumbi imajo dostopna imena `Prva stran`, `Prejšnja stran`, `Naslednja stran` in `Zadnja stran`.
- Status straničenja je element z `role="status"` in `aria-label="Stanje straničenja"`. Med indeksoma `A–B` je pomišljaj `–`; prikazano besedilo sledi vzorcem R09 oziroma natančnemu besedilu R10.
- Testni podatki lahko vsebujejo nič, eno ali več kot deset opravil, enkratne ID-je, enake naslove, poljuben vrstni red, veljavne datume in besedilo z Unicode znaki ter ločili. Projekta sta lahko prazna. Veljajo obstoječa polja in tipi.
- Začetno število opravil in pregled stanj ne smeta biti izpeljana iz prikazane strani. Stolpci table prejmejo samo opravila trenutne strani in jih razvrstijo po statusu; števci odražajo število prikazanih kartic v posameznem stolpcu.
- Aplikacija uporablja samo `/api/`. Testni mehanizem in `/__test/` sta izključno testna. Ne dodajajo se zapisovalni API-ji, trajna shramba ali URL-parametri za filter in stran. Obstoječi pogled lahko še naprej uporablja obstoječi URL.

## Uporabniški scenariji

1. **Pregled zaporednih strani.** Uporabnik odpre projekt, izbere velikost strani, se pomika do zadnje strani in nazaj. Vrstni red sledi viru, zapisi se ne ponovijo ali izpustijo, robni gumbi pa so onemogočeni.
2. **Zoženje seznama po stanju.** Uporabnik izbere stanje. Filter najprej omeji projektni seznam, nato straničenje razdeli filtrirani seznam. Sprememba filtra odpre njegovo prvo stran.
3. **Menjava načina pregleda in podrobnosti.** Uporabnik preklopi med preglednico in tablo ali odpre ter zapre podrobnost. Ista stran in filter ostaneta izbrana; tabla prikaže samo trenutno stran v ustreznih stolpcih.
4. **Menjava projekta, osvežitev ali prazen rezultat.** Uporabnik preide na drug projekt ali osveži stran in začne s privzetimi nastavitvami. Če projekt ali filter nima opravil, status in navigacija jasno kažeta prazen rezultat; odstranitev filtra vrne prikaz na prvo stran.
5. **Ohranitev obstoječega dela.** Uporabnik še naprej uporablja povezave, podrobnosti, nalaganje, pregled stanj ter prilagodljiv Folio. Straničenje je samo za prikaz in ne spremeni podatkov.

## Merila uspeha

Funkcionalnost je sprejemljiva, ko so za vseh R01–R12 izpolnjeni pogoji v tabeli, obe predstavitvi kažeta isti odsek, prazna in neprazna stanja imajo določeno besedilo, spremembe stanja sledijo tabeli prehodov ter obstoječi dogovor o UI in podatkih ostane izpolnjen. Razvojni in lastni scenariji morajo uporabljati različne velikosti seznamov in preverjati ID-je, ne naslovov.

## Izvedba in sledljivost

Spodaj so ciljna mesta za izvedbo, ne trditev, da je koda že spremenjena. Scenariji `D01`–`D04` so obstoječi v `tests/development/P05.spec.ts`; navedeni so samo tam, kjer delno pokrivajo pravilo. Dodatni poimenovani scenariji so predlogi za `tests/agent/P05.spec.ts`, ne obstoječi ali izvedeni testi.

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | `s=all`, `f=all`; vsi ID-ji v vhodnem vrstnem redu. | `P05-default-all-order` (načrtovan). | `src/App.tsx`: privzeto stanje in prikaz seznama. | Ni izveden; v tej fazi ni bilo sprememb kode ali zagona testov. |
| R02 | Strani so zaporedne, neprekrivajoče in skupaj enake `F`. | `D01`, `D02`; dopolniti z `P05-no-loss` (načrtovan). | `src/App.tsx`: izračun odseka `P`. | Ni izveden; D01/D02 sta prebrana, ne zagnana. |
| R03 | Veljavne smeri premaknejo `k`; neveljavna dejanja so onemogočena. | `P05-navigation-boundaries` (načrtovan). | `src/App.tsx`: stran in stanja gumbov. | Ni izveden; brez dokaza zagona. |
| R04 | Sprememba velikosti nastavi `k=1`; `all` ima eno stran za `N>0`. | `D04`; razširiti s primerom, kjer je stara stran še veljavna (`P05-size-reset`, načrtovan). | `src/App.tsx`: obravnava selecta velikosti. | Ni izveden; D04 je prebran, ne zagnan. |
| R05 | Filter pred odsekom, vrstni red ohranjen, sprememba vrne na `k=1`. | `D03`; preveriti vrstni red in reset z `P05-filter-order` (načrtovan). | `src/App.tsx`: filtriranje in ponastavitev. | Ni izveden; D03 je prebran, ne zagnan. |
| R06 | Isti nabor ID-jev v tabeli in tabli; tabla razvrsti odsek. | `D03`; razširiti na primerjavo obeh pogledov (`P05-same-page-views`, načrtovan). | `src/App.tsx`, `src/TaskBoard.tsx`: posredovanje in grupiranje `P`. | Ni izveden; D03 je prebran, ne zagnan. |
| R07 | Pogled in podrobnosti ohranijo `(s,f,k)`. | `P05-preserve-state` (načrtovan). | `src/App.tsx`, `src/TaskDetails.tsx`, `src/navigation.ts`: lokalno stanje ob menjavi poti. | Ni izveden; brez dokaza zagona. |
| R08 | Projekt/ponovni zagon ponastavi `(s,f,k)`; filter in stran nista trajna. | `P05-reset-project-refresh` (načrtovan). | `src/App.tsx`: inicializacija stanja ob projektu; brez novih URL-parametrov. | Ni izveden; brez dokaza zagona. |
| R09 | Status izračuna `X/Y` in vključujoča indeksa `A–B` iz `F`. | `D02` (delni primer); `P05-status-pages` (načrtovan). | `src/App.tsx`: izračun in element statusa. | Ni izveden; D02 je prebran, ne zagnan. |
| R10 | Prazen rezultat: status `Stran 0 od 0. Prikazano 0–0 od 0.`, štirje gumbi onemogočeni; odstranitev filtra vrne začetek. | `P05-empty-project-and-filter` (načrtovan). | `src/App.tsx`: prazni status in gumbi. | Ni izveden; brez dokaza zagona. |
| R11 | Pregled in skupno število temeljita na `T`, števci table na `P`. | `P05-count-scopes` (načrtovan). | `src/App.tsx`, `src/TaskBoard.tsx`: obseg števcev. | Ni izveden; brez dokaza zagona. |
| R12 | Brez zapisov na API; ohranjeni ID-ji, povezave, podrobnosti in UI ter brez preliva strani pri 390 px. | `D04` delno preverja brez zapisov in širino; `P05-readonly-and-regressions` (načrtovan). | `src/App.tsx`, `src/TaskBoard.tsx`, `src/styles.css`; API in skupna infrastruktura ostaneta nespremenjena. | Ni izveden; D04 je prebran, ne zagnan. |

## Odprta vprašanja in omejitve

Blokirajočih nejasnosti ni; vrednosti kontrol, robni primeri, ponastavitve in besedila statusa so določeni v navodilih. Med nalaganjem in ob novih sočasnih spremembah podatkov brez osvežitve se vedenje ne širi prek obstoječih regresijskih zahtev. V tej fazi so pogoji in ciljna mesta kodiranja opredeljeni, implementacija ter preverjanja P05 pa še niso izvedeni. Razvojni testi D01–D04 so bili pregledani samo kot lokalno gradivo. Nedostopnih končnih testov ne navajamo kot izvedenih.
