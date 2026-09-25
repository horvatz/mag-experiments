# P07 — Priljubljena opravila in trajna shramba

Datum: 2026-09-25. Stanje: specifikacija pred implementacijo.
Viri: [izvirne zahteve](../../../task/instructions.md), [projektna pravila](../../../PROJECT_RULES.md), [skupna predloga](../../../task/specification-template.md), [načela](../../../.specify/memory/constitution.md), [Folio](../../dizajn.md). Izvirne zahteve R01–R12 ostajajo merilo; ta dokument izpolnjuje skupno predlogo.

## Problem in kontekst

Uporabnik želi označiti pomembna opravila, jih hitro prikazati v preglednici ali na tabli ter oznake ohraniti po osvežitvi in med projekti. Izhodišče prikazuje projekte, stanja in podrobnosti prek javnega API-ja; priljubljenih še nima. Dopolnitev uvede lokalno množico ID-jev in filter brez sprememb opravil ali zapisovanja na API.

Ohranjen je potrjeni Folio: slovenski vmesnik, obstoječi gradniki in slogovne spremenljivke, postavitev, nalaganje, navigacija in podrobnosti. Na širini 390 pik ni vodoravnega širjenja cele strani; preglednica in tabla se smeta pomikati znotraj vsebnika. Nove kontrole imajo viden fokus in se vključijo v obstoječi slog.

## Vhodi, dejanja in izidi

- API zagotavlja urejen seznam opravil trenutnega projekta z obstoječimi polji `id`, `projectId`, `title`, `description`, `status`, `assignee`, `dueDate`. Polj in tipov ne spreminjamo. Prikaz temelji na odgovorih `/api/`, nikoli na testnih kontrolah ali lokalni kopiji opravil.
- ID-ji so enkratni nizi; naslovi so lahko enaki. Seznam je lahko prazen, vsebuje eno ali več kot deset opravil, drugačno zaporedje, poljubne dovoljene ID-je, Unicode, ločila in veljavne koledarske datume. Vsako opravilo pripada svojemu projektu; tudi oba projekta sta lahko prazna.
- Trajna shramba vsebuje izključno zapis priljubljenih pod ključem `folio:favorites:v1`: JSON `{ "version": 1, "ids": [...] }`. Podvojeni in neznani nizovni ID-ji so veljaven vhod. Druga obstoječa polja shrambe niso predmet sprememb.
- Dejanja: preklop priljubljenega po ID-ju; vklop/izklop filtra; odstranitev priljubljenih celotnega projekta; menjava pogleda/projekta; odpiranje in zapiranje podrobnosti; osvežitev; prejem dogodka `storage`.
- Dejanja priljubljenih veljajo takoj, brez potrditvenega koraka ali preklica. Ponovni preklop je nasprotno dejanje. Zapiranje podrobnosti ne spreminja priljubljenih ali filtra.
- Ob napaki branja shrambe je začetna množica prazna. Ob napaki pisanja izvedena sprememba ostane v pomnilniku. V obeh primerih aplikacija ostane uporabna in pokaže opozorilo `role="alert"`, ki vsebuje besedo `shramba`. Napačna vsebina zapisa pomeni prazno množico in ne povzroči sesutja ali samodejnega popravljalnega zapisa.

## Zahteve in pravila

### Model stanja in predikati

Naj bo `T_p` urejen seznam vseh naloženih opravil projekta `p`, `I_p = {t.id | t ∈ T_p}`, `F` globalna množica priljubljenih ID-jev, `q` logična vrednost filtra in `v` pogled. `∅` pomeni prazno množico, `△` simetrično razliko, `\` razliko množic. Model velja po obstoječem nalaganju podatkov; navigacije med nalaganjem ne razširja.

1. `decode(raw)` vrne množico `ids` natanko tedaj, ko je `raw` veljaven JSON objekt z `version === 1`, `Array.isArray(ids)` in `∀i ∈ ids: typeof i === 'string'`; sicer vrne `∅`. `null` oziroma manjkajoč ključ vrne `∅`. Podvojitve se združijo, neznani ID-ji ostanejo. Prazni nizi niso dodatno prepovedani, ker izvirne zahteve dovoljujejo vse nize.
2. Ob zagonu/osvežitvi: `F := decode(getItem(key))`, `q := false`. Branje ne sproži pisanja, tudi ob neveljavnem zapisu. Izjema pri branju uporabi `∅` in opozorilo.
3. Preklop opravila `i`: `F' = F △ {i}`. Noben drug ID se ne spremeni. Izvedi poskus zapisa `JSON.stringify({version:1, ids:sortUTF16(unique(F'))})`. Razvrstitev primerja UTF-16 kodne enote (brez lokaliziranega razvrščanja). Zapis ne vsebuje polj opravil. Neuspešen zapis ne razveljavi `F'`.
4. Vidni seznam: `V_p = T_p`, če `q = false`; sicer `V_p = [t ∈ T_p | t.id ∈ F]`, z ohranjenim vrstnim redom. Neznan ID nikoli ne ustvari opravila. Stolpec table za stanje `s` prikazuje podzaporedje `V_p` s tem stanjem.
5. Odstranitev projekta: `F' = F \ I_p`, tudi ob aktivnem filtru. Dejanje je onemogočeno natanko, ko `F ∩ I_p = ∅`. Zapis sledi pravilu 3; ID-ji zunaj `I_p` ostanejo.
6. Števci: `X = |F ∩ I_p|`, `M = |T_p|`; števec stolpca stanja `s` je `|{t ∈ V_p | t.status = s}|`. Aktivni filter ne spremeni imenovalca `M` ali obsega števca priljubljenih.
7. Menjava pogleda ohrani `(F,q)`. Menjava projekta ohrani `F` in nastavi `q := false`. Odpiranje pravilnega ID-ja in zapiranje podrobnosti ohranjata stanje priljubljenih.
8. `storage`: če `event.key === key`, nastavi `F := decode(event.newValue)` brez pisanja; `newValue === null` izprazni množico. Drug ključ se ignorira. Filter ostane nespremenjen; vsi prikazi in števci se preračunajo.
9. Za vsako dejanje priljubljenih velja: `tasksAfter = tasksBefore` po vseh poljih in `APIWrites = 0`. Filtriranje in navigacija ne shranjujeta novega stanja priljubljenih; zapis sprožijo lokalne spremembe množice.

### Sprejemni pogoji

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Vsako prikazano opravilo ima v obeh pogledih gumb `Priljubljeno opravilo <id>` z `aria-pressed` glede na članstvo v `F`; zunaj povezave. Preklop spremeni le ta ID in ne odpre podrobnosti. | S1: enaka naslova, različna ID-ja, oba pogleda, preverjanje dialoga in oznak. |
| R02 | Uspešen lokalni zapis uporablja točen ključ in obliko, enkratne nize in vrstni red UTF-16; brez podatkov opravil. | S2: neposredno preverjanje JSON po preklopu, več različnih ID-jev in Unicode. |
| R03 | Osvežitev obnovi množico; podvojitve se združijo; neznani ID-ji preživijo poznejše zapise in ne ustvarijo opravil. | S2: prednapolnjen zapis, osvežitev, oba projekta in ponovni zapis. |
| R04 | Manjkajoč zapis, neveljaven JSON, napačna različica, manjkajoča/neveljavna zbirka ali katerikoli neniz pomenijo prazno množico. Nalaganje ničesar ne prepiše. | S3: parameterizirani napačni zapisi; primerjava shrambe pred in po nalaganju. |
| R05 | Checkbox `Prikaži le priljubljena`, začetno izklopljen, prikaže le priljubljena opravila trenutnega projekta v izvornem zaporedju. | S4: označi nesosednja opravila, primerjaj vidne ID-je s podzaporedjem vhodnih. |
| R06 | Odstranitev pri aktivnem filtru takoj skrije opravilo; pri nič zadetkih prikaže `Ni priljubljenih opravil.`; filter lahko izklopimo. | S4: odstrani zadnji zadetek v obeh pogledih in obnovi celotni prikaz. |
| R07 | Preglednica in tabla uporabljata ista `F` in `q`; preklop pogleda ju ohrani; podrobnosti odprejo pravi ID. | S1/S4: prehodi med pogledoma, podrobnosti in vrnitev. |
| R08 | Projektna menjava ohrani globalni `F` in ponastavi `q`; osvežitev obnovi `F`, `q` je false. | S5: označevanje v dveh projektih, vključen filter, prehodi in osvežitev. |
| R09 | `Odstrani priljubljene tega projekta` odstrani le `I_p`, ne drugih ali neznanih ID-jev; onemogočen pri `X = 0`. | S5: mešan shranjeni nabor, aktivni filter, množična odstranitev, prazen projekt. |
| R10 | `role="status"`, `aria-label="Število priljubljenih"`, besedilo `Priljubljeno: X od M.` velja za celotni projekt; stolpci štejejo vidna opravila. | S4/S5/S8: števci pred/po filtriranju in odstranitvi, nič opravil. |
| R11 | Pravilen dogodek `storage` takoj uporabi enako validacijo, null izprazni; drug ključ nima učinka; ni povratnega zapisa. Izjemi branja/pisanja prikažeta opozorilo in dovolita uporabo v pomnilniku. | S6: veljavni/neveljavni/null dogodki in tuji ključ, nadzor zapisov. S7: ločeni izjemi getItem/setItem, nadaljnji preklopi in filter. |
| R12 | Priljubljene ne spreminjajo opravil in ne zapisujejo na API; Folio, nalaganje, navigacija in ozki prikaz delujejo. | S1/S8: preverjanje zahtev in podatkov, skupna regresija, razvojni testi, prikaz pri 390 pik. |

Ohraniti je treba `data-task-id` na vrsticah in karticah, dostopna imena obstoječih pogledov in stolpcev ter `aria-label="Pregled stanj opravil"`. Dekorativne ikone ostanejo skrite pred bralnikom zaslona. Natančno besedilo in razporeditev drugih novih elementov nista predpisana.

### Uporabniški scenariji in merila uspeha

- **S1 — Posamezno opravilo:** uporabnik označi enega od dveh enako naslovljenih opravil, preklopi pogled, odpre pravilne podrobnosti in se vrne. Označen ostane samo izbrani ID, klik oznake ne odpira podrobnosti.
- **S2 — Trajnost:** po veljavnem prednapolnjenem zapisu in novih oznakah uporabnik osveži stran. Množica se obnovi, neznani ID-ji ostanejo shranjeni, novi zapis je kanoničen in vsebuje le različico in ID-je.
- **S3 — Neveljavna vsebina:** aplikacija se odpre za vsak neveljaven vhod iz R04. Vidna je prazna množica priljubljenih, opravila so uporabna, originalni zapis ostane nedotaknjen.
- **S4 — Filtriranje in pogleda:** uporabnik označi več opravil različnih stanj, vključi filter, preklopi pogled in odstranjuje oznake do praznega rezultata. Vrstni red, števci in možnost izklopa filtra ostanejo pravilni.
- **S5 — Projekti:** uporabnik označi opravila v obeh projektih, prehaja med njima in odstrani priljubljene enega projekta. Drugi in neznani ID-ji ostanejo; filter se ob prehodu izklopi; gumb je pri nič priljubljenih onemogočen.
- **S6 — Sinhronizacija:** aplikacija prejme spremembe shrambe. Upošteva pravi ključ in validacijo, posodobi gumbe, sezname in števce brez povratnega zapisa.
- **S7 — Nedostopna shramba:** ob ločeno povzročenih napakah branja in pisanja uporabnik še vedno označuje in filtrira v pomnilniku; vidi opozorilo z zahtevano semantiko. Trajnosti ob nedostopni shrambi ne obljubljamo.
- **S8 — Regresija in podatkovna domena:** ob praznih, enojnih in večjih seznamih, nestandardnih ID-jih, Unicode in enakih naslovih delujejo pravilne povezave, prikazi in ozka stran. Dejanja priljubljenih ne povzročajo zapisovalnih API zahtev ali sprememb polj.

Uspeh pomeni izpolnitev vseh sprejemnih pogojev R01–R12, ohranitev projektnih meja in sledljiva dejansko izvedena preverjanja. Primeri S1–S8 ponazarjajo splošna pravila, ne omejujejo domene na začetne podatke.

## Izvedba in sledljivost

Specifikacijski korak ne spreminja aplikacije ali testov. Spodnje vrstice so začetna evidenca; implementacijski korak doda dejanska imena testov, dele kode in povezave na dnevnike. Vsi navedeni scenariji so trenutno načrtovani, ne izvedeni.

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | Ločen preklop po ID-ju | S1 | Še ni implementirano | Ni izvedeno |
| R02 | Kanoničen lokalni zapis | S2 | Še ni implementirano | Ni izvedeno |
| R03 | Obnovitev in neznani ID-ji | S2 | Še ni implementirano | Ni izvedeno |
| R04 | Varna validacija brez pisanja | S3 | Še ni implementirano | Ni izvedeno |
| R05 | Urejeno projektno filtriranje | S4 | Še ni implementirano | Ni izvedeno |
| R06 | Takojšnja odstranitev in prazno stanje | S4 | Še ni implementirano | Ni izvedeno |
| R07 | Skupno stanje in podrobnosti | S1, S4 | Še ni implementirano | Ni izvedeno |
| R08 | Globalni ID-ji, projektni filter | S5 | Še ni implementirano | Ni izvedeno |
| R09 | Odstranitev množice projekta | S5 | Še ni implementirano | Ni izvedeno |
| R10 | Celotni in vidni števci | S4, S5, S8 | Še ni implementirano | Ni izvedeno |
| R11 | Dogodki in izjeme shrambe | S6, S7 | Še ni implementirano | Ni izvedeno |
| R12 | Lokalnost in regresija Folio | S1, S8 | Še ni implementirano | Ni izvedeno |

## Odprta vprašanja in omejitve

Bistvenih odprtih vprašanj glede vedenja ni. Pot funkcionalnosti je izrecno določena. Izrecna zahteva R02 dovoljuje lokalno shrambo ID-jev ob splošni prepovedi lokalne kopije opravil. Manjkajoče bistvene informacije bi bile razlog za zapis omejitve in ustavitev, ne za izmišljeno pojasnilo uporabnika.

Raziskovanje je omejeno na lokalno kodo in priložene dokumente. Končni testi niso dostopni in niso izvedeni; tudi razvojni in skupni testi v tem koraku niso izvedeni. Obseg ne vključuje novih API-jev, infrastrukture, odvisnosti ali razširjenih pravil navigacije med nezaključenim nalaganjem oziroma novih sočasnih sprememb strežniških podatkov brez osvežitve.

## Zgodovina sprememb

- 2026-09-25: začetna specifikacija vseh R01–R12, formalna pravila stanja, scenariji in začetna sledljivost po skupni predlogi; brez implementacije.
