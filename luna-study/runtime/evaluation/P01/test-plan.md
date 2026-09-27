# Referenčna pravila in načrt preverjanja P01

Osnutek v0.1. Gradivo za pripravo eksperimenta, ne za kontekst agentov.
To še niso izvršljivi testi in ni zapis opravljenega preizkusa.
Vse ocenjevano delovanje mora izhajati iz zahtev R01–R10 v skupnih navodilih.

## Model stanja

- `T`: množica identifikatorjev opravil; v P01 se ne spreminja.
- `S: T → D`: shranjeni zapisi pred dejanjem; `S'` je shranjeno stanje po njem.
- `t ∈ T`: urejano opravilo, izbrano po identifikatorju.
- `d = (title, status)`: začasni vnos v obrazcu.
- `n(title)`: odstranitev začetnih in končnih presledkov, tabulatorjev,
  LF in CR. Drugih znakov ne odstranjujemo; notranji znaki ostanejo enaki.
- `valid(d)`: `n(d.title)` ni prazen in `d.status ∈ {todo, in_progress, done}`.
- `Q`: število zahtev za posodobitev med opazovanim scenarijem.

Ni drugih piscev, ozadnih posodobitev ali samodejnih sprememb časa.
Za scenarij zajamemo globoko kopijo začetnega stanja, ne sklica na isti objekt.
Opazujemo tudi odprtost obrazca, prikazane vrednosti, napake in stanje čakanja.

## Referenčni pogoji

| Pravilo | Zahteve | Natančen pomen |
| --- | --- | --- |
| P01 | R01 | Po odprtju obrazec kaže `S(t).title` in `S(t).status`. |
| P02 | R02 | Samo spreminjanje polj ohrani `S' = S`, `Q = 0` in prvotne vrednosti preglednice. |
| P03 | R03 | Pri praznem `n(d.title)` poskus shranjevanja ohrani `S' = S`, `Q = 0` in prikaže napako. Po popravku v veljaven naslov se napaka umakne. |
| P04 | R04, R05 | Ob uspehu in `valid(d)` velja `S'(t).title = n(d.title)` ter `S'(t).status = d.status`. Obrazec je zaprt in bralna prikaza kažeta nove vrednosti. |
| P05 | R06 | Preklic pred pošiljanjem ohrani `S' = S`, `Q = 0`; obrazec se zapre. Ponovno odprtje velja kot svež P01. |
| P06 | R07 | Za vsak `u ∈ T`, kjer `u ≠ t`, velja `S'(u) = S(u)`. Pri `t` ostanejo enaki `id`, `projectId`, `description`, `assignee`, `dueDate`. |
| P07 | R08 | Po zavrnitvi velja `S' = S`; obrazec in njegov vnos ostaneta, prikazana je napaka. Uspešen ponovni poskus izpolni P04 in odstrani prejšnjo napako. |
| P08 | R09 | Pred odgovorom na poslano zahtevo so polji in oba gumba onemogočeni; dodatni pritiski ne povečajo `Q`. Prikazano je shranjevanje. Po zavrnitvi je vnos omogočen. |
| P09 | R05, R10 | Po uspehu nov zajem podatkov in osvežitev strani vrneta shranjeno stanje. Izbira projekta, seznam in podrobnosti ostanejo uporabni; naslednje urejanje dobi stanje drugega opravila. |

Vsako pravilo ima omejen namen. P06 samo zase na primer dopušča rešitev, ki
ne spremeni ničesar; šele skupaj s P04 preverimo uspešno in omejeno spremembo.
Pri skritem preverjanju se ne zanašamo na agentove trditve o pravilnosti,
jegove teste ali njegovo implementacijo predikatov.

## Razvojni testi, vidni vsem postopkom

| Test | Scenarij | Zahteve |
| --- | --- | --- |
| D01 | Izberi projekt, odpri opravilo in urejanje; preveri začetni naslov in stanje. | R01, R10 |
| D02 | Spremeni naslov in stanje, uspešno shrani ter preveri preglednico in podrobnosti. | R04, R05 |
| D03 | Spremeni obe polji, prekliči, ponovno odpri; primerjaj shranjeni zapis. | R02, R06 |
| D04 | Poskusi shraniti naslov iz presledkov, nato veljaven naslov; preveri napako in njen umik. | R03 |

To je začetni razvojni sklop. Skupni regresijski testi osnovne aplikacije so
prav tako vidni. Dostop do testnega nadzora strežniških odzivov je enak za
vse postopke, zato lahko vsak napiše tudi svoje teste neuspeha in čakanja.
V skupnih navodilih so vse zahteve, tudi tiste brez pripravljenega razvojnega testa.

## Skriti končni scenariji

| Test | Scenarij in opazovanja | Zahteve |
| --- | --- | --- |
| E01 | Odpri vsako izmed dveh istoimenskih opravil; preveri, da obrazec pripada izbranemu identifikatorju. | R01 |
| E02 | Spremeni polji brez shranjevanja; primerjaj celotni podatkovni vir in preglednico. | R02 |
| E03 | Prazen naslov, presledki, tabulatorji in prelomi vrstic; brez zahteve, vidna napaka, nato veljaven popravek. | R03 |
| E04 | Naslov z robnimi belimi znaki, notranjima presledkoma in šumniki; shrani ter primerjaj normalizirano vrednost. | R03, R05 |
| E05 | Preveri vseh šest prehodov med različnima stanjema ter shranjevanje brez spremembe stanja. | R04, R05 |
| E06 | Uspešno spremeni obe polji; preveri podatkovni vir, preglednico, podrobnosti in osvežitev strani. | R05 |
| E07 | Po veljavnem in po neveljavnem vnosu prekliči; preveri odsotnost zahteve, podatke in svež obrazec ob ponovnem odprtju. | R06 |
| E08 | Pri shranjevanju preveri vsa neurejana polja in vsa druga opravila, tudi istoimenska ter iz drugega projekta. | R07 |
| E09 | Strežnik zavrne zapis; preveri nespremenjen vir, ohranjen vnos, napako, omogočeno urejanje in uspešen ponovni poskus. | R08 |
| E10 | Zadrži odgovor, hitro ponovi pritisk na shranjevanje; preveri eno zahtevo, onemogočene kontrole in prikaz čakanja. Sprosti uspeh oziroma zavrnitev. | R09 |
| E11 | Po shranjevanju in po preklicu preklopi projekt, odpri drugo opravilo in preveri svež prikaz ter delovanje osnovne navigacije. | R10 |

Razvojni in skriti testi lahko preverjajo isto pravilo, vendar so implementacije
in končne kombinacije podatkov ločene. Konkretne podatke in pričakovane izide
za končne scenarije določimo pred ocenjevanjem kandidatov. P01 je pilot, zato
lahko izboljšujemo protokol, vendar moramo spremembe verzionirati in ne
primerjati rezultatov, pridobljenih z različnimi merili, kot da so enakovredni.

## Preverjanje meril pred izvedbo postopkov

Pripravimo pravilno referenčno izvedbo iz istih navodil, ločeno od začetne kode.
Na njej morajo uspeti vsa končna preverjanja. Nato uvedemo posamične napake:

| Namerno napačna izvedba | Preverjanje, ki jo mora zaznati |
| --- | --- |
| Shranjuje vsako spremembo vnosa še pred potrditvijo. | E02, E07 |
| Opravilo posodobi po naslovu namesto po identifikatorju. | E01 ali E08, odvisno od mesta napake |
| Prazen naslov preverja pred odstranitvijo belih znakov. | E03 |
| Posodobi samo lokalni prikaz, ne podatkovnega vira. | E06 |
| Pri zavrnitvi zapre obrazec in izbriše vnos. | E09 |
| Ob dveh hitrih pritiskih pošlje dve zahtevi. | E10 |
| Ob zamenjavi opravila ohrani prejšnji vnos ali napako. | E11 |

Napake v referenci ali testih odpravimo pred modelsko primerjavo. V dnevnik
zapišemo rezultate ponovljenih zagonov z enakim stanjem in vsako nestabilnost.
Uspeh teh preverb ni dokaz popolnosti testov.

## Ocena pilotne izvedbe

Za vsako zahtevo R01–R10 vnaprej povežemo vsa pripadajoča preverjanja iz tabele.
Zahteva uspe le, če uspejo vsa. Skupni rezultat je število izpolnjenih zahtev
od desetih, ne odstotek vseh posameznih pritiskov oziroma testnih korakov.
Celotna izvedba uspe, če uspejo vse zahteve in skupna regresijska preverjanja.

Ločeno zabeležimo izid zagona, strošek celotnega postopka, čas, klice modela,
cikle popravkov in človeške posege. Nepreverjen izid označimo posebej in navedemo
razlog; infrastrukturne napake ne enačimo samodejno z napako kandidata.
Razvojne specifikacije primerjamo z R01–R10 in temi pravili. Pri sledljivosti
preverimo dejansko vsebino navedenega testa ter spremembe kode, ne samo povezave.
Rubriko za ročno ocenjevanje kode in specifikacij še pripravimo pred glavnimi meritvami.

Za prvo preverbo izvedljivosti izvedemo A, B in C po enkrat. Ti trije izidi
ne zadoščajo za sklepanje o splošni premoči postopka. Služijo odkrivanju težav
z okoljem, navodili, delitvijo vlog in proračunom. Model, skupno časovno in
stroškovno omejitev ter pravila pomoči določimo pred prvim zagonom.
