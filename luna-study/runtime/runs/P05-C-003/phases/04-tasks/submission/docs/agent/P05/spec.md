# P05: Straničenje in filter stanja

## Problem in kontekst

Folio trenutno v izbranem projektu prikazuje opravila, prebrana prek `/api/`, v preglednici ali tabli. Uporabnik želi izbrati filter stanja in velikost strani ter se premikati po filtriranem seznamu, pri čemer mora oba pogleda prikazati isti trenutni odsek. Dopolnitev ohrani obstoječe slovenske oznake, povezave in potrjeni videz Folio iz [`docs/dizajn.md`](../../dizajn.md). Zahteve in podatkovni pogoji so določeni v `task/instructions.md` (R01–R12); spodaj so pretvorjeni v preverljive pogoje.

## Vhodi, dejanja in izidi

Vhod je seznam opravil trenutnega projekta, vrnjen z obstoječim javnim API-jem, v izvornem vrstnem redu. Opravila imajo veljavne izhodiščne tipe in polja; ID-ji so enolični, naslovi pa niso nujno enolični. Velikost strani je `s ∈ {all, 2, 5, 10}`, filter `f ∈ {all, todo, in_progress, done}`, številka strani `p` pa je enotsko indeksirana. Trenutni pogled in odprto opravilo sta obstoječi stanji navigacije.

Za seznam `T` naj bo `F = T`, če je `f=all`, sicer `F = [t ∈ T | t.status=f]`, pri čemer se vrstni red ne spremeni. Naj bo `N=|F|`; število strani je `Y=0`, če je `N=0`, sicer `Y=1` za `s=all` ali `ceil(N/s)` za številski `s`. Če `N>0`, je vidni odsek `V=F`, kadar je `s=all`, sicer `V=F[(p−1)s : min(ps,N)]`. Če je `N=0`, je `V=[]` in je prikazano stanje strani 0 od 0. Preglednica ohrani vrstni red `V`; tabla razvrsti iste ID-je v stolpce po stanju šele po izbiri `V` in ohrani vrstni red znotraj stolpca.

Pravila spremembe stanja:

| Dogodek | Predpogoj | Novo stanje straničenja |
| --- | --- | --- |
| Začetni prikaz, osvežitev ali menjava projekta | Projekt je izbran oziroma se njegovi podatki ponovno naložijo | `s=all`, `f=all`, `p=1` |
| Sprememba velikosti | Izbrana je nova vrednost `s'` | `s=s'`, filter ostane enak, `p=1` |
| Sprememba filtra | Izbrana je nova vrednost `f'` | `f=f'`, velikost ostane enaka, `p=1` |
| Prva/prejšnja/naslednja/zadnja stran | Ciljna stran je znotraj `1…Y` | `p` postane `1`, `p−1`, `p+1` oziroma `Y` |
| Navigacija na robu ali pri praznem rezultatu | Cilj ni veljaven | Gumb je onemogočen; stanje ostane nespremenjeno |
| Preklop preglednica/tabla ali odpiranje/zapiranje podrobnosti | Projekt ostane isti | `s`, `f` in `p` ostanejo nespremenjeni |
| Ni ujemajočih se opravil | `N=0` | Izbira `s` in `f` ostane; prikaz je prazen, vsi štirje navigacijski gumbi so onemogočeni |

Sprememba filtra iz praznega rezultata na filter z zadetki zato začne na prvi strani. Stanje straničenja je lokalno izbranemu projektu in ne sme biti shranjeno v URL-ju ali trajni shrambi. Obstoječe stanje nalaganja, napake in ponovnega poskusa ostane uporabno; obnašanje navigacije med nezaključenim nalaganjem ni dodatno določeno.

## Zahteve in pravila

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Ob začetnem prikazu sta `s=all` in `f=all`; preglednica prikaže vse ID-je `T` v izvornem vrstnem redu, tabla pa iste ID-je grupira po R06. | Naloži projekt z več opravili v znanem vrstnem redu; preveri privzeti izbiri ter ID-je obeh pogledov. |
| R02 | Za `s∈{2,5,10}` je `V` zaporedni odsek `F`; odseki zaporednih strani se ne prekrivajo in skupaj vsebujejo vsak ID natanko enkrat. Zadnji odsek sme biti krajši. | Preveri število, vrstni red in unikatnost ID-jev za več strani ter krajšo zadnjo stran, tudi pri 0, 1 in več kot 10 opravilih. |
| R03 | Prva, prejšnja, naslednja in zadnja nastavijo ustrezni `p`; dejanja zunaj `1…Y` so onemogočena in ne spremenijo `p`. | Preveri premike naprej/nazaj, skoke na obe skrajni strani in onemogočena gumba na robovih. |
| R04 | Sprememba `s` vedno nastavi `p=1`, tudi kadar je prejšnji `p` veljaven pri novi velikosti. `all` ima pri `N>0` eno stran. | Iz strani, večje od 1, spremeni velikost v drugo številčno vrednost in v `all`; preveri stran 1 oziroma eno stran. |
| R05 | Filter `f` se uporabi pred razrezom strani; ujemajoči se opravili ohranita vrstni red iz `T`. Sprememba filtra nastavi `p=1`. | Iz poznejše strani spremeni filter; primerjaj ID-je in vrstni red s filtriranim izhodiščnim seznamom. |
| R06 | Preglednica in tabla kažeta natanko ID-je `V`. Tabla razvrsti samo `V` v stolpce po stanju; stolpci niso neodvisno straničeni. | Na isti kombinaciji filtra/strani primerjaj ID-je vrstic in kartic ter vsoto in vsebino stolpcev z `V`. |
| R07 | Preklop pogleda, odpiranje opravila in zapiranje podrobnosti ne spremenijo `(s,f,p)`. | Na strani, večji od 1, preklopi oba pogleda ter odpri/zapri podrobnost prek gumba in Escape; preveri stanje in vidne ID-je. |
| R08 | Menjava projekta in osvežitev nastavita `(s,f,p)=(all,all,1)`. Te vrednosti niso v URL-ju ali trajni shrambi. | Nastavi neprivzeto stanje, zamenjaj projekt oziroma osveži stran; preveri začetne izbire in URL/shrambo. |
| R09 | Za `N>0` je v elementu `role="status"`, `aria-label="Stanje straničenja"` besedilo `Stran X od Y` in `Prikazano A–B od N.`; indeksa A/B začneta z 1. Za `s=all` sta `X=1`, `Y=1`, `A=1`, `B=N`. | Preveri dostopnost elementa in obe številčni vrednosti pri prvi, vmesni, zadnji in `all` strani. |
| R10 | Za prazen projekt ali prazen rezultat je status `Stran 0 od 0` in `Prikazano 0–0 od 0.`; vsi štirje gumbi so onemogočeni. Zamenjava filtra nastavi prvo stran, ko se pojavijo zadetki. | Preveri prazen projekt, filter brez zadetkov in nato filter z zadetki. |
| R11 | Pregled stanj in skupno število opravil zajemata celoten nefiltriran `T`; števci stolpcev table štejejo samo vidne kartice v `V`. Straničenje ne spremeni velikosti `T`. | Primerjaj povzetek s celotnim `T`, števce stolpcev z `V` in skupno število pred/po premiku. |
| R12 | Straničenje in filtriranje ne spreminjata opravil in ne pošiljata zapisovalnih zahtev API-ju. Ohranijo se obstoječe povezave, ID-ji, podrobnosti, nalaganje/napaka in prilagodljiv videz. Pri širini 390 px ni vodoravnega razširjanja cele strani; notranje drsenje prikazov je dovoljeno. | Preveri, da se podatki in število zapisov/API zapisovalni klici ne spremenijo; preskusi povezave, podrobnosti, nalaganje/napako ter pogled pri 390 px. |

### Pogodba uporabniškega vmesnika in podatkov

- Kontrola HTML `select` **Velikost strani** ponuja `all`, `2`, `5`, `10`; kontrola **Filter strani** ponuja `all`, `todo`, `in_progress`, `done`.
- Navigacijski gumbi imajo oznake **Prva stran**, **Prejšnja stran**, **Naslednja stran**, **Zadnja stran**.
- Vrstice in kartice ohranijo `data-task-id`; ohranijo se dostopna imena obstoječih pogledov in stolpcev ter `aria-label="Pregled stanj opravil"`. Nova dejanja ob opravilu so zunaj njegove povezave.
- Podatki prihajajo samo prek `/api/`. Ne uporabljamo `/__test/` iz uporabniškega vmesnika, lokalne kopije opravil, `localStorage` ali novih zapisovalnih API-jev.
- Sprejemni podatki lahko vsebujejo nič, eno ali več kot deset opravil, različne enolične ID-je, ponovljene naslove, poljuben vrstni red, Unicode in ločila v besedilu ter veljavne koledarske datume. Projekta sta lahko prazna. Ujemanje in razvrščanje ne smeta predpostavljati enoličnih naslovov ali stalnega števila opravil.
- Besedilo zunaj izrecno določenih oznak/statusov in razporeditev kontrol nista predpisana. Uporabijo se obstoječi gradniki in slogi potrjenega Folio.

## Uporabniški scenariji in merila uspeha

1. **Pregled celote:** uporabnik odpre projekt; vidi vsa opravila v izvornem vrstnem redu in privzeti možnosti `all`.
2. **Omejitev seznama:** uporabnik izbere stanje, velikost ter strani; oba pogleda prikažeta isti ustrezni odsek, status pa pravilne indekse.
3. **Sprememba konteksta:** uporabnik spremeni filter/velikost, preklopi pogled, odpre podrobnosti ali izbere drug projekt; veljajo zgornja pravila ponastavitve in ohranitve stanja.
4. **Prazen rezultat:** uporabnik odpre prazen projekt ali filter brez zadetkov; vidi določeni ničelni status in onemogočene gumbe, nato se po spremembi filtra lahko vrne na rezultate.

> Funkcija izpolni specifikacijo, ko so vsi pogoji R01–R12 preverjeni na podatkih iz opisane domene, vsi zgoraj določeni kontrolniki/dostopnostni atributi obstajajo, obstoječi regresijski testi ostanejo uspešni ter meja sprememb in videz Folio ostaneta ohranjena. Sam obstoj razvojnega primera ne dokazuje obravnave celotne domene.

## Izvedba in sledljivost

Povezave do kode spodaj kažejo trenutna mesta v začetni aplikaciji, ki jih zahteve zadevajo; ne predpisujejo arhitekturne preureditve. Načrtovani scenarij P05 po isti oznaki R je treba dopolniti z dejanskim imenom testa in dokazom po izvedbi.

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | Privzeti `all/all`, izvorni vrstni red | P05-R01: začetni prikaz | `src/App.tsx`, `ProjectView` | Ni izvedeno; specifikacija, brez zagona testa. |
| R02 | Rezanje `F` na neprekrivajoče se odseke | P05-R02: meje, zadnja stran, ID-ji | `src/App.tsx`, seznam/pogleda | Ni izvedeno; specifikacija, brez zagona testa. |
| R03 | Veljavne navigacije in robovi | P05-R03: štirje gumbi in meje | `src/App.tsx`, kontrole strani | Ni izvedeno; specifikacija, brez zagona testa. |
| R04 | Sprememba velikosti ponastavi stran | P05-R04: sprememba na drugi strani | `src/App.tsx`, stanje strani | Ni izvedeno; specifikacija, brez zagona testa. |
| R05 | Filter pred rezanjem, ponastavitev | P05-R05: stanja in vrstni red | `src/App.tsx`, seznam opravil | Ni izvedeno; specifikacija, brez zagona testa. |
| R06 | Isti ID-ji; tabla grupira po rezu | P05-R06: preglednica proti tabli | `src/App.tsx`; `src/TaskBoard.tsx` | Ni izvedeno; specifikacija, brez zagona testa. |
| R07 | Ohranitev stanja ob pogledu/podrobnostih | P05-R07: preklop in odpri/zapri | `src/App.tsx`; `src/navigation.ts`; `src/TaskDetails.tsx` | Ni izvedeno; specifikacija, brez zagona testa. |
| R08 | Ponastavitev projekta/osvežitve, brez persistence | P05-R08: zamenjava in reload | `src/App.tsx`; `src/navigation.ts` | Ni izvedeno; specifikacija, brez zagona testa. |
| R09 | Status in izračun indeksov | P05-R09: polni/nedelni odsek | `src/App.tsx`, status straničenja | Ni izvedeno; specifikacija, brez zagona testa. |
| R10 | Ničelni status in gumbi | P05-R10: prazen projekt/filter | `src/App.tsx`, prazno stanje | Ni izvedeno; specifikacija, brez zagona testa. |
| R11 | Celotni povzetek proti števcem table | P05-R11: primerjava števcev | `src/App.tsx`; `src/TaskBoard.tsx` | Ni izvedeno; specifikacija, brez zagona testa. |
| R12 | Brez zapisov, regresije in 390 px | P05-R12: API, navigacija, responsivnost | `src/App.tsx`; `src/api.ts`; `src/navigation.ts`; `src/TaskDetails.tsx`; `src/styles.css` | Ni izvedeno; specifikacija, brez zagona testa. |

## Odprta vprašanja in omejitve

Izvirne zahteve določajo vrednosti kontrol, izračune, ničelno stanje, ohranitev/ponastavitev stanja, robne primere in obnašanje pri širini 390 px; dodatna produktna odločitev ni potrebna. Specifikacija ne določa nepredpisanega besedila ali razporeditve kontrol in ne širi obnašanja navigacije med nalaganjem oziroma sočasnih sprememb podatkov.

V tem koraku ni implementacije ali izvedenih preverjanj P05, zato so vsi izidi v sledljivostni tabeli označeni kot neizvedeni. Po implementaciji jih je treba dopolniti z dejanskimi testi/dnevniki; razvojni primeri sami niso dokaz pokritosti neznanih končnih testov.
