# P08: Koledarski pregled rokov

Vir funkcionalnih zahtev je `task/instructions.md` (različica 1.0). Ta specifikacija pokriva vseh R01–R12; sprejemni pogoji ne nadomeščajo izvirnih zahtev.

## Problem in kontekst

Folio uporabniku omogoča izbiro projekta, pregled opravil v preglednici ali tabli po stanjih ter branje podrobnosti opravila. Opravila in projekti se nalagajo prek javnega API-ja; obstoječi prikaz že vsebuje identifikatorje, stanje in koledarski rok opravila. Uporabnik potrebuje še pregled rokov glede na izrecno izbrani referenčni datum, skupne števce po skupinah in filter za vidna opravila. Pregled je samo za branje: ne spreminja opravil ali njihovih podrobnosti.

Dodatek ohrani potrjeni videz Folio, slovenska poimenovanja, obstoječe poglede, odzivnost in viden fokus pri uporabi tipkovnice. Dovoljene aplikacijske spremembe so v `src/`; lastni testi in dokumenti sodijo v `tests/agent/` in `docs/agent/`. Strežnik, skupni tipi in testi, odvisnosti ter nastavitve ostanejo nespremenjeni. Aplikacija uporablja `/api/`, izbira zapise po `id` in ne uporablja testnih poti `/__test/`.

## Vhodi, dejanja in izidi

### Podatki in izrazi

- `P = [t₁, …, tₙ]` je seznam opravil trenutno izbranega projekta, kot ga vrne `/api/projects/:id/tasks`, v vrstnem redu odgovora. Projekt je lahko prazen; število opravil ni vnaprej omejeno. Polja so izhodiščna (`id`, `projectId`, `title`, `description`, `status`, `assignee`, `dueDate`); ID-ji ločijo opravila tudi pri enakih naslovih.
- `d₀ = 2026-09-21` je začetni referenčni datum. `d` je zadnji veljaven referenčni datum, `x` trenutno besedilo polja, `f` pa izbrana skupina (`all`, `overdue`, `today`, `week`, `later` ali `done`). Vhod datuma je `input type="date"` z oznako `Referenčni datum`; izbira skupine je HTML `select` z oznako `Pogled rokov`.
- Za veljaven datum `YYYY-MM-DD` naj `ord(date)` pomeni zaporedno številko koledarskega dne po koledarju, ne časovne točke. `Δ(t,d) = ord(t.dueDate) − ord(d)`. Izračun je neodvisen od časovnega pasu in poletnega časa.
- Klasifikator `c(t,d)` je enoličen: če je `t.status = done`, je `done`; sicer je `overdue`, če `Δ < 0`; `today`, če `Δ = 0`; `week`, če `1 ≤ Δ ≤ 7`; in `later`, če `Δ ≥ 8`. Torej `done` prevlada nad rokom, ostala opravila pa so odprta.
- `V(P,d,f)` je podseznam `P`, ki vsebuje vsa opravila, kadar je `f=all`, sicer samo tista, za katera velja `c(t,d)=f`. Filtriranje ohrani vrstni red iz `P`. `Nₖ(P,d) = |{t ∈ P : c(t,d)=k}|` za vsako od petih skupin; ti števci se izračunajo iz celotnega `P`, ne iz `V`.

### Dejanja in spremembe stanja

| Dogodek | Stanje in pričakovani izid |
| --- | --- |
| Začetek ali osvežitev projekta; izbira drugega projekta | Nastavi `d=d₀`, `x="2026-09-21"`, `f=all` in odstrani opozorilo. Prikaže podatke trenutno izbranega projekta. |
| Vnos veljavnega datuma `v` | Nastavi `d=v` in `x=v`, takoj preračuna pet skupin, števce in vidna opravila, ohrani `f` ter odstrani opozorilo. |
| Izpraznitev datuma | Nastavi `x=""`, prikaže opozorilo `role="alert"` z besedilom `Vnesi veljaven referenčni datum.`; `d`, preračunane skupine, števci in vidna opravila ostanejo po zadnjem veljavnem `d`. |
| Izbira skupine `f′` | Nastavi samo `f=f′`; vidna opravila se izberejo iz istega projekta. Datum in vseh pet števcev ostaneta nespremenjena. |
| Preklop preglednica/tabla | Ohranijo se `d`, trenutno besedilo `x` in `f`. Oba pogleda izrišeta iste filtrirane ID-je; preglednica ohrani vrstni red iz `P`, tabla pa obstoječe stolpce po stanju in relativni vrstni red iz `P` znotraj vsakega stolpca. |

Vrednosti filtra in referenčnega datuma se ne zapišejo v trajno shrambo ali URL. Pregled za to funkcionalnost ne pošilja zapisov na API. Prazno polje je edini izrecno določeni neveljavni uporabniški vnos; podatkovni roki, ki jih posreduje API, so veljavni koledarski datumi po R12.

## Uporabniški scenariji

1. **Pregled rokov projekta:** uporabnik odpre projekt in vidi začetni referenčni datum, izbrano skupino `all`, pet števcev za ves projekt ter opravila. Skupine so brez prekrivanja in zajamejo vsako opravilo natanko enkrat.
2. **Preračun in filtriranje:** uporabnik vnese nov datum ali izbere skupino. Veljaven datum takoj preračuna rezultate; izbira skupine omeji samo vidne vrstice/kartice. Pri praznem polju dobi opozorilo, prejšnji veljavni pregled pa ostane prikazan.
3. **Menjava načina prikaza in projekta:** uporabnik preklopi med preglednico in tablo ter ohrani datum, besedilo polja in skupino. Ob menjavi projekta ali osvežitvi se datum in skupina vrneta na začetni vrednosti.
4. **Prazen rezultat:** prazen projekt pokaže pet ničel. Če projekt vsebuje opravila, izbrana skupina pa nobenega, se pokaže `Ni opravil v izbrani skupini.` in uporabnik lahko izbere drugo skupino ali `all`.

## Zahteve in pravila

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Ob začetku vsakega projekta in po osvežitvi je `d=d₀` (`2026-09-21`) neodvisno od ure naprave, `f=all`. | Odpri projekt ob različnih sistemskih datumih in osveži; preveri vrednost polja ter izbrano skupino. |
| R02 | Za vsak `t`, če `t.status=done`, potem `c(t,d)=done` ne glede na `dueDate`; ne sodi v nobeno odprto skupino. | Preveri opravljeno opravilo z rokom pred, na in po `d`. |
| R03 | Za odprto opravilo (`status≠done`): `Δ<0 ⇒ overdue`, `Δ=0 ⇒ today`. | Preveri odprte roke dan pred `d` in na `d`. |
| R04 | Za odprto opravilo: `1≤Δ≤7 ⇒ week`, `Δ≥8 ⇒ later`. Skupine so disjunktne in njihova unija z `done` zajame `P`. | Preveri roke `d+1`, `d+7`, `d+8` in neodvisnost razvrstitve posameznega opravila. |
| R05 | Primerjava in prištevanje dni uporabljata koledarske datume `YYYY-MM-DD`, ne lokalnega časa. Velja tudi čez mesec, leto in prestopni februar. | Preveri koledarske meje, prestopni/neprestopni februar in isti datum v različnih časovnih pasovih. |
| R06 | Števci `overdue/today/week/later/done` so `Nₖ(P,d)` in imajo natančna dostopna imena `Število rokov <ključ>` ter samo številsko vrednost. Spreminjanje `f` jih ne spremeni. | Primerjaj vseh pet vrednosti s celotnim naborom projekta pred in po filtriranju; preveri dostopna imena in vsebino. |
| R07 | Izbirnik `Pogled rokov` ponuja `all/overdue/today/week/later/done`; filtriranje ustvari `V(P,d,f)` v izvornem vrstnem redu. Preglednica ga prikaže po tem vrstnem redu; tabla prikaže iste ID-je v obstoječih stolpcih po stanju in ohrani relativni izvorni vrstni red znotraj stolpca. Izbira ne spreminja rokov ali stanj. | Za vsako možnost primerjaj `data-task-id` s pričakovano skupino ter podatke pred/po izbiri. |
| R08 | Veljaven nov datum takoj posodobi skupine in vidne vrstice, ohrani `f` in odstrani opozorilo. Prazno polje pokaže natančno navedeno opozorilo `role=alert` in ohrani zadnji veljavni preračun. | Zaporedno vnesi veljaven datum, izprazni polje in znova vnesi veljaven datum; preveri filter, vrstice, števce in opozorilo. |
| R09 | Preglednica in tabla kažeta enak nabor filtriranih ID-jev. Preklop pogleda ohrani `d`, trenutno besedilo `x` in `f`. | Preveri ID-je in stanje kontrol pred ter po preklopu v obeh smereh, tudi ko je `x` prazno. |
| R10 | Menjava projekta in osvežitev ponastavita `d` in `f` na R01. Filter in referenčni datum nista v trajni shrambi ali URL-ju. | Nastavi nestandardni datum/skupino, zamenjaj projekt in osveži; preveri začetni vrednosti in URL/shrambo. |
| R11 | Prazen `P` ima vseh pet števcev enakih nič. Prazna izbrana skupina v nepraznem `P` prikaže `Ni opravil v izbrani skupini.` ter omogoča izbor druge skupine ali `all`. | Preveri prazen projekt ter neprazen projekt s prazno izbrano skupino in nadaljnjo izbiro. |
| R12 | Roki iz API-ja so veljavni datumi `YYYY-MM-DD`, vključno s pravilno obravnavo prestopnih datumov. Pregled ne zapisuje na API; opravila in njihove bralne podrobnosti ostanejo nespremenjeni. Folio ostane prilagodljiv; pri širini 390 px se stran ne razširi, dovoljeno je notranje drsenje preglednice/table in fokus tipkovnice ostane viden. | Uporabi veljavne mejne datume; preveri, da ni zahtev za zapis in da so polja/podrobnosti nespremenjeni; preveri ozko širino, fokus in obstoječa dostopna imena. |

Vsi podatki se berejo iz javnega `/api/`. Uporabniški vmesnik ne kliče, uvaža ali bere stanja testnih poti `/__test/`. Obstoječi `data-task-id`, dostopna imena pogledov in stolpcev ter `aria-label="Pregled stanj opravil"` ostanejo. Nova dejanja ob opravilu, če jih je treba prikazati, ne smejo biti znotraj njegove povezave; ta funkcionalnost ne zahteva novih dejanj.

## Merila uspeha

- Vsak sprejemni pogoj R01–R12 je preverljiv in prestane ustrezni scenarij z različnim številom opravil, poljubnimi ID-ji, podvojenimi naslovi, različnim vrstnim redom ter veljavnimi datumi iz opisane domene.
- Za vsak projekt velja `|P| = N_overdue + N_today + N_week + N_later + N_done`; nobeno opravilo ni v dveh skupinah. Filter spremeni samo `V`, ne pa `P`, datumov, stanj ali števcev.
- Pregled ohrani obstoječi Folio, obnašanje bralnih podrobnosti in uporabo na ozkem zaslonu; ne uvede API zapisov ali shranjenega/URL stanja filtra.

## Izvedba in sledljivost

Specifikacija določa scenarije preverjanja, ne trdi, da so bili izvedeni. Datoteko/kodo dopolni med implementacijo; izid se označi šele po dejanskem zagonu testa in z navedbo dokaza.

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | Glej sprejemni pogoj R01 zgoraj. | Začetne vrednosti in osvežitev | Še ni določeno | Ni izveden — faza specifikacije. |
| R02 | Glej sprejemni pogoj R02 zgoraj. | Končano ne glede na rok | Še ni določeno | Ni izveden — faza specifikacije. |
| R03 | Glej sprejemni pogoj R03 zgoraj. | Zapadlo in danes | Še ni določeno | Ni izveden — faza specifikacije. |
| R04 | Glej sprejemni pogoj R04 zgoraj. | Meje naslednjih sedmih dni | Še ni določeno | Ni izveden — faza specifikacije. |
| R05 | Glej sprejemni pogoj R05 zgoraj. | Koledarske meje in prestopni dan | Še ni določeno | Ni izveden — faza specifikacije. |
| R06 | Glej sprejemni pogoj R06 zgoraj. | Števci celotnega projekta | Še ni določeno | Ni izveden — faza specifikacije. |
| R07 | Glej sprejemni pogoj R07 zgoraj. | Vse možnosti filtra in izvorni vrstni red | Še ni določeno | Ni izveden — faza specifikacije. |
| R08 | Glej sprejemni pogoj R08 zgoraj. | Veljaven datum, prazno polje, ponovni vnos | Še ni določeno | Ni izveden — faza specifikacije. |
| R09 | Glej sprejemni pogoj R09 zgoraj. | Preklop preglednica/tabla | Še ni določeno | Ni izveden — faza specifikacije. |
| R10 | Glej sprejemni pogoj R10 zgoraj. | Menjava projekta in osvežitev | Še ni določeno | Ni izveden — faza specifikacije. |
| R11 | Glej sprejemni pogoj R11 zgoraj. | Prazen projekt in prazna skupina | Še ni določeno | Ni izveden — faza specifikacije. |
| R12 | Glej sprejemni pogoj R12 zgoraj. | Veljavni roki, brez zapisov, ohranjen Folio | Še ni določeno | Ni izveden — faza specifikacije. |

## Odprta vprašanja in omejitve

Za opisano funkcionalnost ni ostalo odprto vprašanje: izhodiščne zahteve določajo začetne vrednosti, skupine, interakcije, prazne rezultate in meje sprememb. Zahteve ne širijo obnašanja pri novih sočasnih spremembah podatkov med osvežitvijo. V tej fazi ni bila izvedena koda ali test; rezultati preverjanja zato ostajajo nedoločeni do implementacije.
