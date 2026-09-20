# Feature Specification: P01 — Urejanje opravila

**Feature Branch**: brez veje (izrecna omejitev pilota)

**Created**: 2026-09-20

**Status**: Ready for planning

**Input**: Celotna funkcionalnost R01–R10 iz `task/instructions.md`, različica 0.2.
Kratko ime: `urejanje-opravila`. Mapa: `docs/agent/P01`.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Shranim naslov in stanje opravila (Priority: P1)

Kot uporabnik Folio želim v podrobnostih urediti naslov in stanje izbranega opravila
ter po shranjevanju videti iste podatke v vseh pogledih in po osvežitvi strani.

**Why this priority**: To je osnovni namen naloge; obstoječi vmesnik omogoča ogled,
ne ponuja pa urejanja.

**Independent Test**: Odpri opravilo, izberi »Uredi«, spremeni obe vrednosti, shrani,
preveri podrobnosti, preglednico, tablo, števce in osvežitev strani.

**Acceptance Scenarios**:

1. **Given** izbrano opravilo, **When** uporabnik izbere »Uredi«, **Then** obrazec
   vsebuje shranjeni naslov in stanje tega identifikatorja (S01; R01).
2. **Given** odprt obrazec, **When** uporabnik spremeni podatke brez shranjevanja,
   **Then** shranjeni podatki, preglednica, tabla in števci ostanejo nespremenjeni
   (S02; R02).
3. **Given** veljaven vnos, **When** shranjevanje uspe, **Then** se obe vrednosti
   skupaj posodobita, obrazec zapre, vsi pogledi in števci uskladijo, kartica je
   v pravilnem stolpcu, vrednosti pa ostanejo po osvežitvi (S05; R04, R05).
4. **Given** druga opravila, tudi z enakim naslovom ali v drugih projektih,
   **When** shranim izbrano opravilo, **Then** se nobeno drugo opravilo niti opis,
   odgovorna oseba, rok ali projekt urejanega opravila ne spremenijo (S07; R07).
5. **Given** zaključeno urejanje, **When** uporabnik zamenja projekt ali pogled in
   odpre drugo opravilo, **Then** navigacija deluje in obrazec nima prejšnjega vnosa
   ali napak (S10; R10).
6. **Given** opravilo v kateremkoli od treh stanj, **When** uporabnik ureja stanje,
   **Then** lahko izbere katerokoli od treh dovoljenih stanj in ga uspešno shrani;
   preveri se vseh šest različnih prehodov in ohranitev stanja (S04; R04).

### User Story 2 - Popravim vnos ali prekličem urejanje (Priority: P2)

Kot uporabnik želim razumljivo napako ob praznem naslovu in možnost preklica brez
spremembe shranjenih podatkov.

**Why this priority**: Preprečuje nenameren zapis in omogoča varen umik iz urejanja.
Vse zgodbe so zahtevani obseg, prioriteta določa vrstni red dela.

**Independent Test**: Vnesi prazen naslov, sproži preverjanje, popravi naslov in
prekliči; ob ponovnem odprtju preveri shranjene vrednosti brez napak.

**Acceptance Scenarios**:

1. **Given** prazen naslov ali naslov samo iz dovoljenih robnih belih znakov,
   **When** uporabnik izbere »Shrani«, **Then** se ob polju prikaže napaka in
   shranjevanje se ne začne; veljaven popravek napako umakne (S03a; R03).
2. **Given** naslov z robnimi presledki, tabulatorji ali prelomi vrstic,
   **When** uporabnik shrani, **Then** se odstranijo le robni U+0020, U+0009,
   U+000A in U+000D, notranji in vsi drugi znaki ostanejo (S03b; R03).
3. **Given** spremenjen obrazec, tudi z napako, **When** uporabnik izbere »Prekliči«,
   **Then** se obrazec zapre brez shranjevanja; ponovno odprtje vsebuje shranjeni
   vrednosti in nobene prejšnje napake (S06; R06).

### User Story 3 - Razumem čakanje in ponovim zavrnjeno shranjevanje (Priority: P3)

Kot uporabnik želim med shranjevanjem videti potek in ob neuspehu ohraniti vnos,
da lahko poskusim znova.

**Why this priority**: Zaključi zahtevano obravnavo neuspeha in ponovnih pritiskov.

**Independent Test**: Preveri zakasnjen odgovor, več hitrih pritiskov, zavrnitev in
uspešen ponovni poskus z ohranjenim vnosom.

**Acceptance Scenarios**:

1. **Given** čakajoče shranjevanje, **When** uporabnik poskuša ponovno shraniti,
   **Then** teče največ ena zahteva, prikazano je shranjevanje in polji ter gumba
   »Shrani« in »Prekliči« so onemogočeni (S09; R09).
2. **Given** veljaven spremenjen vnos, **When** je shranjevanje zavrnjeno,
   **Then** shranjeni podatki ostanejo isti, obrazec ostane odprt z vnosom in
   jasnim razlogom neuspeha, urejanje je spet omogočeno (S08a; R08, R09).
3. **Given** zavrnjen poskus, **When** naslednji poskus uspe, **Then** se napaka
   umakne in velja običajen uspešen zaključek iz S05 (S08b; R08).

### Edge Cases

- Dve opravili z enakim naslovom: identiteta izbranega opravila je odločilna.
- Prazen niz in poljubne kombinacije štirih robnih belih znakov niso veljaven naslov.
- Notranji presledki ostanejo; nedeljivi presledek U+00A0 in drugi znaki se ne
  odstranjujejo. Naslov iz samega U+00A0 zato po tem pravilu ni prazen.
- Dovoljenih je vseh šest prehodov med različnimi stanji; stanje sme tudi ostati isto.
- Zavrnitev ne sme povzročiti delnega zapisa; ponovni poskus ohrani vnos.
- Več hitrih pritiskov med čakanjem ne povzroči sočasnih zahtev.
- Po preklicu, uspehu ali ob naslednjem opravilu ni ostankov prejšnje napake ali vnosa.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001 / R01**: »Uredi« odpre obrazec za trenutno izbrani identifikator opravila
  s shranjenim naslovom in stanjem, tudi pri enakih naslovih.
- **FR-002 / R02**: Začasne spremembe do uspeha ne spreminjajo shranjenih podatkov,
  preglednice, table ali števcev stanj.
- **FR-003 / R03**: Pred preverjanjem in shranjevanjem se z obeh robov naslova odstranijo
  samo U+0020, U+0009, U+000A in U+000D. Notranji in drugi znaki ostanejo. Prazen
  rezultat pokaže napako ob polju in prepreči shranjevanje; veljaven popravek umakne napako.
- **FR-004 / R04**: Na voljo so Pripravljeno (`todo`), V delu (`in_progress`) in
  Končano (`done`); dovoljen je katerikoli prehod med njimi.
- **FR-005 / R05**: Uspeh skupaj shrani naslov in stanje izbranega opravila, zapre
  obrazec, uskladi podrobnosti, preglednico, tablo, stolpec kartice in števce ter
  ohrani vrednosti po osvežitvi strani.
- **FR-006 / R06**: »Prekliči« zapre obrazec, zavrže začasni vnos in ne pošlje zahteve
  za shranjevanje. Ob ponovnem odprtju so prikazane shranjene vrednosti brez napak.
- **FR-007 / R07**: Druga opravila v kateremkoli projektu in preostala polja
  urejanega opravila ostanejo nespremenjena.
- **FR-008 / R08**: Zavrnitev ne spremeni shranjenih podatkov; odprt obrazec ohrani
  uporabnikov vnos in prikaže jasno napako. Ponovni poskus je mogoč in uspeh napako umakne.
- **FR-009 / R09**: Med čakanjem je vidno shranjevanje; obe polji, »Shrani« in
  »Prekliči« so onemogočeni. Sočasnih zahtev ni; po zavrnitvi je urejanje omogočeno.
- **FR-010 / R10**: Po koncu urejanja delujejo izbira projekta, preklop pogledov in
  odpiranje podrobnosti. Naslednji obrazec nima vnosa ali napak prejšnjega opravila.

Obvezni dogovor o oznakah in dostopnosti ter pravila sprememb stanja so zapisana
v [skupni razvojni specifikaciji](development-spec.md). Videz sledi
[potrjenemu Folio](../../dizajn.md). To so obstoječe omejitve naloge.

### Key Entities *(include if feature involves data)*

- **Opravilo**: identifikator, projekt, naslov, stanje, opis, odgovorna oseba in rok.
  Urejata se samo naslov in stanje; identifikator ne temelji na naslovu.
- **Osnutek urejanja**: identiteta opravila, začasni naslov in stanje, napaka naslova,
  napaka shranjevanja ter informacija, ali shranjevanje čaka na odgovor.
- **Projekt in prikazi**: projekt združuje opravila; preglednica, tabla, podrobnosti
  in števci predstavljajo iste shranjene vrednosti.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Za vseh šest prehodov med različnimi stanji se obe shranjeni vrednosti
  po uspehu ujemata v vseh treh prikazih in po osvežitvi; števci ustrezajo opravilom.
- **SC-002**: Neveljaven naslov in preklic sprožita nič shranjevanj; v drugih
  opravilih in v neurejanih poljih je nič sprememb.
- **SC-003**: Pri zavrnitvi je vnos ohranjen in napaka vidna; uspešen ponovni poskus
  zaključi urejanje brez preostale napake.
- **SC-004**: Med čakanjem je največ eno shranjevanje, oba gumba in obe polji so
  onemogočeni, uporabnik vidi stanje shranjevanja.
- **SC-005**: Vsi scenariji S01–S10 izpolnijo povezane pogoje R01–R10, vključno
  s preklicem, identiteto in nadaljnjo navigacijo.

Merila so neposredni izidi zahtev; ne dodajajo časovnih ciljev ali zunanjih meritev.

## Assumptions

- Veljajo izrecne predpostavke navodil: med urejanjem ni sočasnih sprememb drugih
  uporabnikov; shranjevanje bodisi uspe bodisi je zavrnjeno brez zapisa.
- Obstoječa aplikacija zagotavlja projekte, opravila, prikaze in podatkovno storitev.
- Opis, odgovorna oseba, rok in projekt se ne urejajo.
- Escape, klik izven obrazca, navigacija med odprtim urejanjem, opozorilo ob zapustitvi
  strani in prijava niso del naloge. Zahtevana zaključka sta »Shrani« in »Prekliči«.
- Besedilo napak je prosto, vendar mora jasno izraziti razlog. Slovenske oznake in
  dogovorjena dostopnost ostanejo obvezne.
- Bistvenih odprtih vprašanj ni. Scenariji so načrtovani; aplikacijski testi v tem
  koraku niso izvedeni. Zgodovina in stanje dokazov sta v spremljajočem dokumentu.
