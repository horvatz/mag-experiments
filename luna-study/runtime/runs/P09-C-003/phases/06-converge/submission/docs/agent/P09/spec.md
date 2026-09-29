# P09: Stanje pogleda v povezavi in zgodovini

## Problem in kontekst

Folio že prikazuje projekte in opravila iz javnega API-ja, omogoča preglednico, tablo in podrobnosti opravila ter uporablja hash poti. Stanje pregleda opravila pa še ni mogoče izraziti v povezavi. Uporabnik potrebuje deljivo povezavo do projekta ali opravila, ki obnovi potrjeno iskanje, stanje in vrstni red; med prikazi in zgodovino brskalnika mora ohraniti isti izbor.

Sprememba dopolni obstoječi vmesnik in potrjeni [dizajn Folio](../../dizajn.md). Opravila ostanejo nespremenjeni podatki iz `/api/`; funkcionalnost je samo za branje in svoje stanje izraža v URL-ju ter trenutnih kontrolah.

## Uporabniški scenariji

1. Uporabnik odpre ali osveži povezavo do projekta oziroma opravila s parametri pregleda. Vsebina se takoj prikaže po teh parametrih.
2. Uporabnik vnese frazo, izbere stanje in vrstni red. Rezultati se ne spremenijo, dokler ne izbere **Uporabi pogled**; potrditev shrani vse tri vrednosti skupaj v povezavo.
3. Uporabnik preklopi med **Preglednica** in **Tabla**, odpre opravilo in ga zapre z gumbom ali Escape. Potrjeni pregled in ustrezni ID-ji ostanejo ohranjeni.
4. Uporabnik se z gumboma brskalnika vrne na prejšnje potrjeno stanje ali nadaljuje naprej; kontrolniki in prikaz se obnovijo iz URL-ja. **Ponastavi pogled** vrne privzeti pregled.
5. Uporabnik izbere drug projekt. Pregled se ponastavi, trenutni način prikaza pa ostane izbran. Neposredna povezava do drugega projekta s parametri jih uporabi.

## Vhodi, dejanja in izidi

- Pot je obstoječa hash pot projekta ali opravila, na primer `#/projects/web` ali `#/projects/web/tasks/<id>`. Njen query del lahko vsebuje `q`, `status`, `order` in obstoječi `view=board`.
- Podatki so projekti in opravila, prebrani prek obstoječega javnega `/api/`. Opravilo določata njegov enolični `id` in pripadajoči `projectId`; naslovi niso enolični ključ.
- Potrjeni pregled je trojica `C = (q, status, order)`; privzeto `C₀ = ("", all, original)`. Način je `view ∈ {table, board}`, pri čemer odsotnost `view=board` pomeni preglednico. URL določa potrjeno stanje.
- Kontrole urejajo ločen osnutek `D`. Uspešna potrditev ali ponastavitev posodobi URL, potrjeni pregled in osnutek. Navigacija brez potrditve osnutek zavrže. Odpoved ali napaka nalaganja ne spremeni podatkov; obstoječi prikaz nalaganja, napake in ponovnega poskusa ostane v veljavi.
- Filtriranje, razvrščanje, navigacija in podrobnosti ne pošiljajo zapisov na API in ne shranjujejo stanja v `localStorage`.

## Zahteve in pravila

Naj bo `T(p)` seznam opravil projekta `p` v vrstnem redu iz API-ja. Definiraj normalizacijo `N(s) = lowercase(remove(U+0300–U+036F, NFD(s)))`. Iskalni niz je `Q = N(trim(q))`; za naslov, opis, odgovorno osebo in ID se uporabi `N` brez razčlenjevanja v besede. Vidni izbor je:

`F(p,C) = { t ∈ T(p) | (C.status = all ∨ t.status = C.status) ∧ (Q = "" ∨ Q je podniz N(t.title) ∨ N(t.description) ∨ N(t.assignee) ∨ N(t.id)) }`.

Razvrščanje `F` po `original` ohrani vrstni red API-ja. `title-asc` in `title-desc` primerjata `N(title)` leksikografsko po UTF-16; pri enakem normaliziranem naslovu ohranita vrstni red API-ja. Filtriranje se uporabi pred razvrščanjem. Isti potrjeni pregled velja v obeh načinih.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Na obstoječi poti projekta ali opravila razčleni `q`, `status` in `order` iz query dela fragmenta. Brez parametrov velja `C₀`. Neposredno odprta povezava takoj prikaže `F(p,C)` brez potrditve uporabnika. | Neposredno odpreti povezavi s parametri in brez njih; preveriti rezultate ter kontrolnike. |
| R02 | `q` je ena dobesedna fraza po zgornjem pravilu `N` in obrezovanju. Zadostuje, da je celotna normalizirana fraza podniz vsaj enega od štirih polj. Fraze se ne razdeli in ne razume kot regularni izraz. | Preveriti zunanje presledke, diakritiko in velikost črk, frazo čez več besed, ločila/znake regex ter ujemanje v vsakem polju; delni zadetki in več ločenih besed niso dodatno iskani. |
| R03 | Dovoljeni `status`: `all`, `todo`, `in_progress`, `done`; `all` ne omeji izbora, ostale vrednosti se združijo z iskanjem po IN. Dovoljeni `order`: `original`, `title-asc`, `title-desc`; primerjava naslovov uporablja `N` in UTF-16, enaki normalizirani naslovi pa ohranijo izvorni vrstni red tudi pri padajočem izboru. | Za vsako stanje preveriti kombinacijo z iskanjem, oba vrstna reda in enake normalizirane naslove. |
| R04 | Neveljaven `status` oziroma `order` se razume kot `all` oziroma `original`. Pri ponovitvah parametra se uporabi njegova prva pojavitev. Neznani parametri ne vplivajo na pogled. Samo razčlenitev povezave ne prepiše URL-ja. | Odpreti povezave z neveljavnimi, ponovljenimi in neznanimi parametri; preveriti izbrani pogled in nespremenjen URL. |
| R05 | Urejanje kontrol spremeni samo `D`; dokler uporabnik ne izbere **Uporabi pogled**, se `C`, rezultati in URL ne spremenijo. Potrditev uveljavi vse tri vrednosti hkrati in doda natanko en zapis zgodovine, kadar je potrjena trojica drugačna od trenutne. | Spreminjati eno in več kontrol; primerjati prikaz in URL pred/po potrditvi ter zgodovino. |
| R06 | Ob potrditvi se `q` obreže. Prazni `q`, `status=all` in `order=original` se izpustijo; preostale vrednosti se veljavno kodirajo za query. Ohranjen je `view=board`; neznani parametri se odstranijo. Ista potrjena trojica ne doda zgodovinskega zapisa. Vrstni red parametrov ni določen. | Potrditi privzete in neprivzete vrednosti, znake za kodiranje, `view=board`, neznan parameter in ponovljeno enako potrditev. |
| R07 | Dogodka Nazaj in Naprej obnovita potrjene filtre, način prikaza ter osnutek kontrol iz ciljnega URL-ja. Osvežitev obnovi potrjeno stanje, kodirano v URL-ju. | Ustvariti vsaj dve potrjeni stanji, uporabiti Nazaj/Naprej ter osvežiti vsako povezavo. |
| R08 | Preklop **Preglednica**/**Tabla** ohrani `C` in prikaže isti nabor ID-jev. Vsaka navigacija brez potrditve zavrže `D`; to velja tudi za preklop pogleda in navigacijo med projekti ali opravili. | Primerjati ID-je in parametre po preklopu; pred navigacijo nastaviti osnutek in preveriti, da se po njej ne uporabi. |
| R09 | Odpiranje podrobnosti opravila in zapiranje z gumbom ali Escape ohranita `C` ter pogled. Povezava odpre opravilo z zahtevanim `id`, tudi kadar ima drugo opravilo enak naslov. | Odpreti in zapreti podrobnosti v obeh načinih; pri ponovljenih naslovih odpreti vsako opravilo po ID-ju. |
| R10 | Klik na drug projekt nastavi `C₀` in ohrani `view`. Neposredno odprta pot drugega projekta uporabi svoje parametre. | Preklopiti projekt iz obeh načinov in neposredno odpreti drugo projektno povezavo s filtri. |
| R11 | **Ponastavi pogled** nastavi `C₀`, počisti osnutek in posodobi povezavo ter zgodovino po istem pravilu kot potrditev; način pogleda ohrani. Pri praznem izboru je prikazano **Ni zadetkov.** Števec z `role=status` in `aria-label="Rezultati povezave"` prikazuje `Prikazano: N od M.`, kjer je `N` število prikazanih, `M` pa število vseh opravil v projektu. | Ponastaviti spremenjen in že privzeti pregled v obeh načinih; preveriti zgodovino, prazen izbor ter števec. |
| R12 | Nobeno dejanje te funkcionalnosti ne spreminja opravil ali kliče zapisovalnega API-ja; stanje ni v `localStorage`. Še naprej delujejo neznana pot, nalaganje, podrobnosti in prilagodljiv Folio. Uporabijo se obstoječa polja/vrste podatkov in javni `/api/`; testne kontrole `/__test/` niso del uporabniškega vmesnika. | Preveriti regresijske poti, nič/eno/več opravil, prazne projekte, API zahteve in odsotnost trajne lokalne shrambe. |

### Stanje URL-ja in kontrol

- Ob branju povezave `C := parse(URL)` in `D := C`. Neveljavne vrednosti se preslikajo na privzete po R04, URL pa ostane nedotaknjen.
- Ob urejanju kontrol se spremeni samo `D`. Prikaz vedno izračuna `F(p,C)`, ne `F(p,D)`.
- Ob potrditvi naj bo `C' = (trim(D.q), D.status, D.order)`. URL dobi serializacijo `C'` in obstoječega načina prikaza, brez neznanih parametrov. Če `C' ≠ C`, se doda eno zgodovinsko stanje; če `C' = C`, se dodatno stanje ne doda. Nato velja `C := C'` in `D := C'`.
- Ob ponastavitvi se izvede isto pravilo potrditve z `C' := C₀`; pogled se ohrani. Ob Nazaj/Naprej se `C` in `D` ponovno prebereta iz URL-ja.
- Ob preklopu pogleda ostane `C` enak; ob odprtju/zaprtju podrobnosti ostaneta `C` in pogled enaka. Ob navigaciji na drug projekt se uporabi `C₀`, pogled pa ostane enak. Nepotrjen `D` se ob vsaki od teh navigacij zamenja z ustreznim novim potrjenim stanjem.

### Dogovor o vmesniku in mejah

- Kontrole: `input type="search"` z oznako **Iskanje v povezavi**; izbor **Stanje v povezavi** z možnostmi `all/todo/in_progress/done`; izbor **Vrstni red v povezavi** z možnostmi `original/title-asc/title-desc`; gumba **Uporabi pogled** in **Ponastavi pogled**.
- Primer povezave: `#/projects/web?view=board&q=Pregled&status=todo&order=title-desc`. Vrstni red parametrov ni zahtevan.
- Ohranijo se `data-task-id` na vrsticah in karticah, dostopna imena obstoječih pogledov in stolpcev ter `aria-label="Pregled stanj opravil"`. Nova dejanja ob opravilu so zunaj povezave opravila.
- Pri širini 390 px se stran ne razširi vodoravno; notranje drsenje preglednice in table je dovoljeno. Obstoječi prilagodljivi dizajn Folio ostane v veljavi. Drugo besedilo in razporeditev kontrol nista predpisana.
- Testi lahko vrnejo poljubno število opravil, vključno z nič, enim in več kot deset; enolične, drugačne ID-je; enake naslove; različen vrstni red; veljavne koledarske datume; Unicode in ločila. Projekti so lahko prazni. Uporabi se struktura podatkov iz izhodišča. Spremembe strežnika, infrastrukture, odvisnosti, skupnih tipov ali skupnih testov niso del te funkcionalnosti.

## Uspešna merila

1. Vsaka povezava projekta/opravila z veljavnimi parametri obnovi isti potrjeni filter in pogled; osvežitev ter Nazaj/Naprej obnovita tudi kontrole.
2. Rezultati ustrezajo `F(p,C)` in vrstnemu redu iz pravil R02–R03 za poljubne dovoljene podatke.
3. Osnutek ne vpliva na rezultate; potrditev in ponastavitev uveljavita celotno stanje ter pravila zgodovine R05–R06 in R11.
4. Preklop pogleda, podrobnosti in navigacija projektov upoštevajo R08–R10; podrobnosti se odprejo po ID-ju.
5. Vmesnik izpolni besedilne, dostopnostne in odzivne zahteve; podatkov ne spreminja in jih ne shranjuje lokalno.

## Izvedba in sledljivost

Izvedba in preverjanje sta zaključena. Agentni scenariji so v `tests/agent/P09.spec.ts`; vsi navedeni agentni, razvojni in osnovni testi so bili izvedeni z `npm run check`.

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | Hash parser in privzeto stanje v `src/navigation.ts`. | Agentni neposredni URL scenarij; razvojni D01/D03. | `src/navigation.ts`, `src/App.tsx`. | Uspešno; `npm run check`, 52/52. |
| R02 | Normalizacija in literalni podniz v `src/taskView.ts`. | Agentni Unicode, iskanje, znaki `+` in ID. | `src/taskView.ts`, `tests/agent/P09.spec.ts`. | Uspešno; `npm run check`, 52/52. |
| R03 | Status IN, vrstni red naslova in stabilne izenačitve. | Agentni kombinirani filter in razvrščanje; razvojni D02. | `src/taskView.ts`, `src/App.tsx`. | Uspešno; `npm run check`, 52/52. |
| R04 | Prva pojavitev, privzete neveljavne vrednosti, brez prepisa. | Agentni URL s ponovitvami/neznanimi parametri. | `src/navigation.ts`, `tests/agent/P09.spec.ts`. | Uspešno; `npm run check`, 52/52. |
| R05 | Osnutek je ločen; potrditev uveljavi trojico. | Agentni draft/apply in razvojni D02. | `src/App.tsx`. | Uspešno; `npm run check`, 52/52. |
| R06 | Kanonična serializacija, pogled ohranjen, brez podvojene zgodovine. | Agentni URL, enaka potrditev in razvojni D02. | `src/navigation.ts`, `src/App.tsx`. | Uspešno; `npm run check`, 52/52. |
| R07 | Zgodovina in kontrolniki sledijo URL-ju. | Agentni Nazaj/Naprej; razvojni D03. | `src/navigation.ts`, `src/App.tsx`. | Uspešno; `npm run check`, 52/52. |
| R08 | Preklop pogleda ohrani filtre in ID-je; navigacija zavrže osnutek. | Agentni preklop in regresijski testi table. | `src/App.tsx`, `src/TaskBoard.tsx`. | Uspešno; `npm run check`, 52/52. |
| R09 | Podrobnosti in zapiranje ohranijo pogled/filtre ter ciljni ID. | Agentni odpri/Escape in osnovni testi podrobnosti. | `src/App.tsx`, `src/TaskDetails.tsx`. | Uspešno; `npm run check`, 52/52. |
| R10 | Klik projekta ponastavi filtre, neposredni URL jih upošteva. | Agentni menjava projekta in neposredna pot. | `src/App.tsx`, `src/navigation.ts`. | Uspešno; `npm run check`, 52/52. |
| R11 | Ponastavitev, prazno sporočilo in števec N od M. | Agentna ponastavitev, filtriran in API-prazen rezultat. | `src/App.tsx`, `src/styles.css`. | Uspešno; `npm run check`, 52/52. |
| R12 | Samo branje, brez localStorage; obstoječi pogledi in prilagodljivost. | Agentni nadzor zapisov in 390 px; 38 osnovnih regresijskih primerov. | `src/App.tsx`, `src/TaskBoard.tsx`, `src/TaskDetails.tsx`, `src/styles.css`. | Uspešno; `npm run check`, 52/52. |

## Odprta vprašanja in omejitve

Ni odprtega funkcionalnega vprašanja ali znane neizpolnjene zahteve. Nedostopni končni testi niso bili izvedeni; povzeti izidi veljajo samo za lokalne ukaze in navedene razvojne/osnovne/agentne teste.
