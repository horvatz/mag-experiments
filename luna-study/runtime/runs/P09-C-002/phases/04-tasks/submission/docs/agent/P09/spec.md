# P09 — Stanje pogleda v povezavi in zgodovini

**Različica zahtev:** 1.0  
**Stanje:** specifikacija; izvedba in preverjanja še niso opravljeni

## Problem in kontekst

Folio prikazuje opravila izbranega projekta v preglednici ali tabli, odpre podrobnosti opravila ter usmerja prek URL-ja v fragmentu. Pregled trenutno ne omogoča iskanja in filtriranja. Uporabnik želi stanje pregleda deliti kot povezavo, ga uporabljati ob neposrednem odprtju in zanesljivo obnavljati z navigacijo brskalnika, ob tem pa ohraniti potrjeni videz Folio, obstoječo navigacijo in dostop do podrobnosti.

Ta sprememba doda iskanje po eni frazi, filter stanja in vrstni red naslovov. Njihovo potrjeno stanje je zapisano v query delu fragmenta za pot projekta ali opravila. Urejanje kontrol je najprej osnutek; šele Uporabi pogled ali Ponastavi pogled spremeni potrjeno stanje. Podatki se še naprej berejo iz javnega `/api/`; P09 ne spreminja podatkov.

## Vhodi, dejanja in izidi

Vhod so parametri `q`, `status`, `order` ter obstoječi `view=board` v query delu fragmenta, pot projekta/opravila in opravila, vrnjena prek `/api/`. Opravila imajo polja `id`, `projectId`, `title`, `description`, `status`, `assignee` in `dueDate`. Podatkovna polja ostanejo navadno besedilo; ID je identiteta opravila tudi ob podvojenih naslovih.

Kontrole so `input type="search"` z oznako »Iskanje v povezavi«, izbirnik »Stanje v povezavi« (`all`, `todo`, `in_progress`, `done`) ter izbirnik »Vrstni red v povezavi« (`original`, `title-asc`, `title-desc`). Gumba sta »Uporabi pogled« in »Ponastavi pogled«. Rezultati so preglednica ali tabla, živo obvestilo `role="status"`, `aria-label="Rezultati povezave"` in števec »Prikazano: N od M.«

Ob začetnem nalaganju se URL razčleni brez njegovega samodejnega spreminjanja; veljavno potrjeno stanje takoj določa prikaz in postane osnutek kontrol. Ob urejanju kontrol se spreminja le osnutek. Uporaba potrdi vse tri vrednosti skupaj; ponastavitev jih nastavi na privzete vrednosti. Navigacija zavrže nepotrjen osnutek in kontrolam nastavi stanje, razbrano iz ciljne povezave. Obstoječi načini nalaganja, napak, podrobnosti in neznane poti ostanejo delujoči.

## Zahteve in pravila

### Pravila stanja in predikati

Označimo potrjene filtre z `F=(q,s,o)`, osnutek kontrol z `D=(q_d,s_d,o_d)`, način prikaza z `V∈{table,board}`, pot z `P`, podatke API-ja z `T` ter prikazane rezultate z `R`. Privzeto stanje je `F₀=D₀=("",all,original)`, `V₀=table`. `q` je vrednost prve pojavitve parametra; neobstoječi `q` pomeni prazen niz. Neznani `status` in `order` se razložita kot `all` oziroma `original`.

Normalizacija za iskanje in primerjavo naslovov je:

```text
norm(x) = lowercase(remove(U+0300–U+036F, NFD(trim(x))))
```

Za opravilo `t` velja:

```text
qMatch(t,q) = norm(q) = ""
              OR ∃ f ∈ {title, description, assignee, id}:
                   norm(t[f]) vsebuje dobesedni podniz norm(q)
statusMatch(t,s) = (s = all) OR (t.status = s)
R = [t ∈ T | qMatch(t,q) ∧ statusMatch(t,s)]
```

Iskanje zato obravnava frazo kot en sam dobesedni podniz, brez regularnih izrazov ali razčlenjevanja po besedah. `M=|T|` je število opravil projekta pred filtrom, `N=|R|` pa število prikazanih opravil. `original` ohrani vrstni red API-ja. Pri `title-asc` in `title-desc` se `norm(title)` primerja po vrstnem redu UTF-16; pri enakih normaliziranih naslovih je izvirni indeks razsojevalni ključ v obeh smereh.

Pravila spremembe stanja:

| Dogodek | Predpogoj/stanje pred dogodkom | Sprememba stanja in izid |
| --- | --- | --- |
| Začetno odprtje ali neposredna povezava | URL vsebuje pot in poljubne query parametre | Razčleni prvo pojavitev parametra; neveljavna podprta vrednost postane privzeta. Nastavi `F=parse(URL)`, `D=F`, `V=parseView(URL)` in `R` po zgornjem predikatu. URL ostane nespremenjen. |
| Urejanje kontrol | `F`, URL in `R` so potrjeni | Spremeni samo ustrezno komponento `D`; `F`, `V`, URL in `R` ostanejo enaki. |
| Uporabi pogled | Na voljo je osnutek `D` | Ustvari `F'=(trim(q_d),s_d,o_d)`. Zgradi URL z isto potjo; izpusti prazen `q`, `status=all` in `order=original`, pravilno kodira preostale vrednosti, ohrani `view=board` ter odstrani druge parametre. Če se potrjeni filtri spremenijo, zapiše eno novo zgodovinsko stanje. Če se ne spremenijo, ne doda zgodovinskega stanja; po potrebi trenutni URL kanonizira brez dodatnega vnosa v zgodovino. Nato nastavi `F=D=F'` in preračuna `R`. |
| Ponastavi pogled | Poljubna potrjena in osnutna vrednost | Nastavi `D` in `F` na `F₀`, ohrani pot in trenutni `V`, URL pa posodobi po istih pravilih zgodovine in kodiranja kot potrditev. |
| Navigacija ali Nazaj/Naprej | URL in morebitni osnutek | Zavrže osnutek; iz ciljnega URL-ja ponovno določi `F`, `V`, `P`, `D=F` in prikaz. Ob obnovi zgodovinskega vnosa se prikažejo njegove potrjene vrednosti. |
| Preklop preglednica/tabla | Trenutni `F` in `V` | Spremeni samo `V`; `q/status/order` ostanejo v URL-ju in prikazani so isti ID-ji. Nepotrjeni `D` se zavrže. |
| Odpiranje/zapiranje podrobnosti | Trenutna pot projekta ali opravila | Spremeni pot oziroma podrobnost, ohrani potrjene filtre in način `V`; ob zaprtju z gumbom ali Escape se vrne na pregled projekta. Opravilo določa `id`, ne naslov. Nepotrjeni osnutek se zavrže. |
| Izbira drugega projekta | Klik na projekt v navigaciji | Ciljna pot začne pri `F₀`, ohrani `V` in opusti osnutek. Neposredno odprta ciljna povezava pa uporabi svoje filtre. |
| Filtriranje in razvrščanje | Podatki `T`, potrjeni `F` | Prikaži `R` po `qMatch ∧ statusMatch` in izbranem vrstnem redu. Če `N=0`, prikaži »Ni zadetkov.«; števec prikaže »Prikazano: N od M.« |
| Napaka/nalaganje | Obstoječe stanje API-ja ali neveljavna/neznana pot | Obdrži obstoječe prikaze nalaganja, napake, ponovnega poskusa in neznane poti; ne zapisuj podatkov ali samodejno popravljaj URL-ja. |

### Sprejemni pogoji in načini preverjanja

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | `F` se bere iz `q/status/order` v query delu fragmenta za obstoječo pot projekta/opravila; privzete vrednosti so `""/all/original`. Neposredna povezava takoj določa prikaz. | Odpri poti projekta in opravila neposredno z vsemi filtri, nato brez parametrov; preveri kontrole in rezultate brez klika. |
| R02 | Uporabi `norm`; rezultat se ujema, če je normalizirana fraza prazen niz ali dobesedni podniz normaliziranega `title`, `description`, `assignee` ali `id` vsaj enega opravila. Presledki znotraj fraze ostanejo; fraza se ne deli in se ne obravnava kot regex. | Scenariji z velikimi/malimi črkami, diakritiko, zunanjimi presledki, ločili/regex znaki, večbesedno frazo in ujemanjem v vsakem polju. |
| R03 | Veljavni statusi so `all/todo/in_progress/done`; filter statusa in `q` se združita z IN. Vrstni red je `original/title-asc/title-desc`; naslov uporablja `norm`, primerjavo UTF-16 in stabilno ohrani vrstni red pri izenačenju. | Preveri vsak status skupaj z iskanjem; razvrsti normalizirane, enake in različne naslove ter potrdi vrstni red ID-jev. |
| R04 | Za ponovljen parameter velja prva pojavitev. Neveljaven `status`/`order` uporabi privzeto; neznani parametri ne vplivajo na prikaz. Samo razčlenjevanje URL-ja ga ne prepiše. | Odpri URL z neveljavnimi/ponovljenimi/poljubnimi parametri; preveri prvi parameter, privzete vrednosti, prikaz in nespremenjen URL pred potrditvijo. |
| R05 | Urejanje spremeni le `D`. Uporaba potrdi vse tri komponente skupaj in doda en zgodovinski vnos natanko, ko se potrjeni filtri spremenijo. | Uredi več kontrol brez potrditve in preveri nespremenjen prikaz/URL; potrdi in preveri sočasno spremembo ter eno zgodovinsko stanje. |
| R06 | Ob potrditvi se `q` obreže; prazni `q`, `status=all`, `order=original` se izpustijo. Preostali parametri se URL-kodirajo, `view=board` se ohrani, drugi parametri odstranijo. Ista potrditev ne doda zgodovinskega stanja. | Preveri kanonično povezavo s posebnimi znaki, ohranjenim board, odstranjenimi parametri in ponovljeno potrditvijo. |
| R07 | Nazaj/Naprej obnovita potrjene filtre, način, rezultate in osnutek kontrol za ciljni vnos; osvežitev uporabi URL-jevo potrjeno stanje. | Potrdi več stanj, uporabi Nazaj/Naprej in osveži vsako neposredno povezavo; preveri URL, kontrole in prikaz. |
| R08 | Preklop »Preglednica«/»Tabla« ohrani potrjene parametre ter nabor ID-jev. Vsaka navigacija zavrže nepotrjeni osnutek in ciljne kontrole uskladi s potrjenim URL-jem. | Preklopi pogled z aktivnimi filtri; preveri enak nabor ID-jev, query parametre in zavržen osnutek. |
| R09 | Odpiranje podrobnosti ter zapiranje z gumbom ali Escape ohranita potrjene parametre in način prikaza. Povezava izbere ID opravila tudi pri enakih naslovih. | Odpri opravili z enakim naslovom v vsakem pogledu, zapri na oba načina in preveri ID, pot ter filtre. |
| R10 | Klik drugega projekta nastavi `F₀` in ohrani `V`; neposredna povezava drugega projekta uporabi njene veljavne filtre. | Klikni drugi projekt v obeh pogledih ter nato odpri neposredno povezavo drugega projekta s filtri. |
| R11 | »Ponastavi pogled« počisti `q/status/order` in osnutek ter uporabi pravila zgodovine iz R05–R06, pri tem pa ohrani `V`. Prazen filtriran rezultat pokaže »Ni zadetkov.«, števec pa `N` od `M`. | Ponastavi spremenjeno in že privzeto stanje v preglednici/tablI; preveri URL, osnutek, pogled, rezultat in števec. |
| R12 | Dejanja P09 ne spreminjajo opravil in ne pošiljajo zapisov na API; novo stanje ni v `localStorage`. Obstoječe neznane poti, nalaganje, podrobnosti in prilagodljiv Folio ostanejo delujoči. | Preveri, da P09 sproži le bralne API-klice in da po navigaciji/osvežitvi ni odvisen od `localStorage`; regresijski scenariji za poti, nalaganje, podrobnosti in 390 px. |

### Skupni pogoji vmesnika in podatkov

- Oznake kontrol, imeni gumbov, `role="status"`, `aria-label="Rezultati povezave"` in besedilo števca so kot navedeni zgoraj. Ohranijo se `data-task-id` na vrsticah in karticah, dostopna imena obstoječih pogledov in stolpcev ter `aria-label="Pregled stanj opravil"`.
- Nova dejanja ob opravilu so zunaj povezave opravila. Pri širini 390 px se stran kot celota ne razširi; dovoljeno je notranje drsenje preglednice in table. Ohranijo se Folio, slovenske oznake, vidni fokus in potrjena vizualna usmeritev iz `docs/dizajn.md`.
- Uporabljajo se samo obstoječi tipi in javni API. Testni nadzor `/__test/` je zgolj pripomoček testnega programa in ga odjemalec ne uvaža/uporablja. Ni novih zapisovalnih API-jev, lokalne kopije strežniških podatkov ali `localStorage`.
- Preskusni podatki lahko vsebujejo nič, eno ali več kot deset opravil, poljubne enkratne ID-je, podvojene naslove, drugačen vrstni red, veljavne datume, Unicode, ločila in prazen projekt. Ta nabor je domena preverjanja, ne dodaten omejitveni pogoj za produkcijske podatke.
- Ni zahtev za sinhronizacijo ob navigaciji med nedokončanim nalaganjem ali za sočasne spremembe podatkov brez osvežitve prek obstoječih regresijskih zahtev. Če zahteva ne določa trajne shrambe ali URL-ja, je stanje nove funkcionalnosti lokalno trenutnemu projektu.

### Merila uspeha

1. Vseh R01–R12 je mogoče preveriti s scenariji iz zgornje tabele; za vsak rezultat je znan filtrski pogoj in stanje URL-ja.
2. Isti URL pri neposrednem odprtju in po osvežitvi prikaže isti potrjeni pregled; Nazaj/Naprej vrneta pripadajoče potrjeno stanje.
3. Urejanje osnutka ne spremeni rezultatov; potrditev in ponastavitev uporabita dogovorjena pravila zgodovine brez podvojenih vnosov za enako stanje.
4. Preglednica, tabla in podrobnosti ohranijo potrjene filtre ter pravilne ID-je; začetne poti, nalaganje, napake in Folio postavitev ostanejo delujoči.
5. Dejanje P09 ne zapisuje podatkov; ozki zaslon širine 390 px nima vodoravnega razširjanja cele strani.

## Uporabniški scenariji

1. **Odpiranje/shranjevanje pregleda:** uporabnik odpre ali deli povezavo s frazo, stanjem in vrstnim redom; povezava takoj pokaže ustrezne rezultate in izbrani pogled.
2. **Urejanje in potrditev:** uporabnik spreminja tri kontrole kot osnutek, rezultate pa uveljavi z »Uporabi pogled«; povezava je kodirana in zgodovina dobi največ en vnos za spremenjeno stanje.
3. **Vrnitev v zgodovini:** uporabnik potrdi več pregledov ter z gumboma Nazaj/Naprej obnovi posamezne potrjene kontrole in rezultate; osvežitev ohrani stanje povezave.
4. **Menjava pogleda in podrobnosti:** uporabnik pregleda isti filtrirani nabor kot preglednico ali tablo, odpre opravilo po ID-ju in se vrne z gumbom ali Escape, ne da bi izgubil potrjene filtre.
5. **Menjava projekta/ponastavitev:** klik na drug projekt začne privzeti pregled v trenutnem načinu, neposredna filtrirana povezava drugega projekta pa uporabi parametre. Ponastavitev odstrani filtre ob ohranitvi načina.
6. **Brez zadetkov:** uporabnik vidi »Ni zadetkov.« in števec prikazanih glede na vsa opravila projekta.

## Izvedba in sledljivost

Spodnje lokacije označujejo obstoječe dele, ki so relevantni za prihodnjo izvedbo; niso trditev, da je funkcionalnost že v kodi, niti zahtevana razdelitev komponent. Testi P09 v tej fazi niso bili izvedeni. Po izvedbi je treba lokacije, imena testov in dokazila posodobiti po dejanskem stanju.

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | Parametri fragmenta z določeno privzeto vrednostjo takoj določijo filtre. | Načrtovano: neposreden URL poti projekta/opravila, tudi po osvežitvi. | `src/navigation.ts` (`useRoute`); `src/App.tsx` (`ProjectView`). | Ni izvedeno; dokazov ni. |
| R02 | Dobesedni podniz po `norm` se ujema v vsaj enem od štirih polj. | Načrtovano: normalizacija Unicode, trim, velikost črk, polja in fraza z ločili. | `src/App.tsx` (izbira rezultatov; dejansko mesto določiti ob izvedbi). | Ni izvedeno; dokazov ni. |
| R03 | Status in iskanje sta povezana z IN; naslov se stabilno razvrsti po UTF-16. | Načrtovano: kombinacije statusa/iskanja ter stabilni enaki naslovi. | `src/App.tsx` (izbira/vrstni red rezultatov; dejansko mesto določiti ob izvedbi). | Ni izvedeno; dokazov ni. |
| R04 | Prva pojavitev, privzete neveljavne vrednosti, neznani parametri brez stranskih učinkov. | Načrtovano: ponovljeni/neveljavni query parametri in opazovanje URL-ja. | `src/navigation.ts` (`useRoute` razčlenjevanje fragmenta). | Ni izvedeno; dokazov ni. |
| R05 | Osnutek je ločen od potrjenega stanja; spremenjena potrditev ustvari en vnos. | Načrtovano: urejanje brez potrditve ter enkratna potrditev treh kontrol. | `src/App.tsx` (kontrole v `ProjectView`); zgodovina fragmenta v `src/navigation.ts`. | Ni izvedeno; dokazov ni. |
| R06 | Kanonični parametri, board ohranjen, ponovitev brez novega vnosa. | Načrtovano: kodiranje, izpust privzetih vrednosti, odstranitev neznanih parametrov. | `src/navigation.ts` (sestava poti/query za `projectUrl`/`taskUrl`; dejanski del določiti ob izvedbi). | Ni izvedeno; dokazov ni. |
| R07 | Zgodovinski URL obnovi potrjeno stanje in osnutek; osvežitev ohrani filter. | Načrtovano: Nazaj/Naprej čez več stanj in neposredna osvežitev. | `src/navigation.ts` (`useRoute`); `src/App.tsx` (uskladitev kontrol/prikaza). | Ni izvedeno; dokazov ni. |
| R08 | Menjava načina ohrani filtre in ID-je ter zavrže osnutek. | Načrtovano: preklop ob aktivnem filtru in osnutku. | `src/App.tsx` (`view-switch`); `src/navigation.ts`; `src/TaskBoard.tsx`. | Ni izvedeno; dokazov ni. |
| R09 | Pot do opravila in nazaj ohranja filtre/prikaz, cilj določa ID. | Načrtovano: podvojena naslova; odpiranje in obe obliki zapiranja. | `src/TaskBoard.tsx` (povezava table); `src/App.tsx` (vrstice); `src/TaskDetails.tsx`; `src/navigation.ts`. | Ni izvedeno; dokazov ni. |
| R10 | Klik drugega projekta ponastavi filtre, neposredna povezava jih uporabi, pogled ostane. | Načrtovano: klik v obeh načinih in ločen neposreden URL. | `src/App.tsx` (`project-nav`); `src/navigation.ts`. | Ni izvedeno; dokazov ni. |
| R11 | Ponastavitev uporabi pravila potrditve; prazen prikaz in števec sta točna. | Načrtovano: spremenjeno/privzeto stanje, nič zadetkov ter štetje N/M. | `src/App.tsx` (`ProjectView`: kontrole, rezultati in prazno stanje). | Ni izvedeno; dokazov ni. |
| R12 | Brez zapisovalnih zahtev ali `localStorage`; regresijsko obnašanje in 390 px ostaneta. | Načrtovano: pregled omrežnih zahtev/stanja in regresijski ter odzivni scenariji. | `src/api.ts`; `src/App.tsx`; `src/styles.css`; obstoječi prikazi v `src/TaskDetails.tsx`. | Ni izvedeno; dokazov ni. |

## Odprta vprašanja in omejitve

V zahtevah ni odprtega bistvenega vprašanja; manjkajočih vedenjskih odločitev ni treba ugibati. Vrstni red query parametrov ni določen in ostaja poljuben. Ta dokument je specifikacija, ne dokaz izvedbe: razvojni in končni testi P09 v tem koraku niso bili zagnani, razpoložljivi končni testi niso vključeni v ta izvoz. Povezave med pogoji, dejanskimi deli kode, testi in dokazili je treba po implementaciji dopolniti; noben test v tej specifikaciji ni označen kot opravljen.
