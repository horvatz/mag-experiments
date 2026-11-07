# Specifikacija P09: Stanje pogleda v povezavi in zgodovini

## Problem in kontekst

Folio prikazuje projekte in opravila prek javnega API-ja `/api/`. Izhodiščna
navigacija ločuje le projekt, opravilo in način `table`/`board`, zato stanje
pregleda ni mogoče deliti, obnoviti ali umakniti z brskalnikom. Naloga doda tri
potrjene parametre v query delu URL fragmenta: `q`, `status` in `order`.

Stanje je trenutno za izbrani projekt, ni shranjeno v `localStorage` in ne povzroči
zapisov na API. Vrednosti so namenjene izključno prikazu; testne kontrole
`/__test/` UI ne uporablja.

## Vhodi, dejanja in izidi

Podatkovna polja za filtriranje so `id`, `title`, `description`, `status` in
`assignee`. Iskalna fraza se primerja kot ena dobesedna podniza, ne kot regularni
izraz in ne po besedah. Vsaka sprememba kontrol najprej spremeni le osnutek;
prikaz in URL se spremenita šele po potrditvi ali ponastavitvi.

Dovoljena dejanja:

- vpis iskalne fraze in izbira stanja ter vrstnega reda;
- potrditev vseh treh vrednosti z `Uporabi pogled`;
- ponastavitev na privzeto stanje s `Ponastavi pogled`;
- preklop med preglednico in tablo, odpiranje in zapiranje podrobnosti;
- brskanje Nazaj/Naprej in osvežitev strani.

Uspeh pomeni, da URL vsebuje samo veljavne, neprivzete parametre, prikaz ustreza
potrjenemu stanju, osnutek kontrol se ob navigaciji zavzame, zgodovina brskalnika
ostane smiselna in podatki ostanejo nespremenjeni.

## Zahteve in pravila

Simboli: `NFD(s)` razstavi besedilo, `CMB(s)` odstrani znake U+0300–U+036F,
`norm(s) = lower(NFD(trim(s)) − CMB)`, `first(params, key)` je prva pojavitev
parametra. Veljavni vrednosti so `status ∈ {all, todo, in_progress, done}` in
`order ∈ {original, title-asc, title-desc}`. Neznane ali manjkajoče vrednosti se
prevedejo v `all` oziroma `original`.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Iz URL fragmenta se razčleni `q`, `status` in `order`; privzeto `{q: "", status: "all", order: "original"}`. Ob neposrednem odprtju se stanje uporabi brez klika. | Razvojni in lastni URL scenariji. |
| R02 | Prikaži `t`, če `norm(q)` ni prazna in je podniza vsaj enega izmed `norm(t.id)`, `norm(t.title)`, `norm(t.description)`, `norm(t.assignee)`; sicer prikaži prazno množico. | Lastni preskusi besedila, Unicode, ločil in ID. |
| R03 | `q` in `status` delujeta po IN. `order` sortira normalizirana naslova po UTF-16; izenačeni naslovi ohranijo izvorni vrstni red. | Lastni preskusi vrstnega reda in stabilnosti. |
| R04 | Neveljavna `status`/`order` se prevesta v privzeto vrednost. Ponovljen parameter upošteva prvo pojavitev. Neznani parametri ne vplivajo na prikaz in se pri potrditvi odstranijo. Razčlenjevanje ne prepiše URL-ja. | Lastni URL preskusi. |
| R05 | Sprememba kontrole spremeni samo osnutek. `Uporabi pogled` potrdi tri vrednosti hkrati; novo zgodovinsko stanje nastane le, če se potrjeno stanje spremeni. | Razvojni in lastni preskusi osnutka in zgodovine. |
| R06 | Potrjena fraza se obreže. Privzeti parametri se izpustijo, ostali se URL-kodirajo. `view=board` se ohrani, neznani parametri se odstranijo. Enaka ponovna potrditev ne doda zgodovinskega stanja. | Preskus URL oblike in zgodovine. |
| R07 | Nazaj/Naprej obnovita potrjene parametre, prikaz in osnutek. Osvežitev uporabi stanje iz URL-ja. | Preskus navigacij in ponovnega nalaganja. |
| R08 | Preklop pogleda ohrani veljavne potrjene parametre in prikaže iste ID-je v enakem vrstnem redu. Osnutek se ob navigaciji zavže. | Lastni preskus preklopa. |
| R09 | Odpiranje in zapiranje podrobnosti ohranita parametre in način pogleda. Povezava izbere natančno ID, tudi pri enakih naslovih. | Skupini in lastni preskus podrobnosti. |
| R10 | Klik na drug projekt začne privzeti pogled tega projekta, a ohrani `table`/`board`. Direkten URL drugega projekta s parametri jih upošteva. | Lastni preskus navigacije med projekti. |
| R11 | `Ponastavi pogled` nastavi `{q: "", status: "all", order: "original"}`, ohrani način pogleda in zgodovinsko pravilo. Prazen rezultat pokaže `Ni zadetkov`; status s tekstom `Prikazano: N od M.` kaže število prikazanih in skupno število. | Razvojni in lastni preskusi. |
| R12 | Nobeno dejanje ne spremeni podatkov ne pošlje zapisovalnega zahtevka na API. Stanje ni v `localStorage`. Ohranijo se neznana pot, nalaganje, podrobnosti in odziven Folio. | Skupini preskusa, lastni preskus write/storage in širine. |

## Izvedba in sledljivost

Hash router v `src/navigation.ts:23` razčleni query del fragmenta v potrjeno
stanje in v `src/navigation.ts:34` generira kanonične povezave. `ProjectView`
v `src/App.tsx:29` vzdržuje osnutek kontrol, v `src/App.tsx:38` izvede
filtriranje po IN ter v `src/App.tsx:15` stabilno urejanje normaliziranih
naslovov. Potrditev v `src/App.tsx:47` spremeni vse tri vrednosti hkrati;
novo zgodovinsko stanje ustvari le ob spremembi stanja, sicer kanonični URL
zamenja z `history.replaceState`.

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | neposreden URL takoj uporabi stanje | D01, A03, A04 | `src/navigation.ts:56`, `src/App.tsx:29` | Uspešno; `npm run check` 53/53. |
| R02 | normalizirana ena fraza po poljih | A01 | `src/App.tsx:11`, `src/App.tsx:38` | Uspešno; A01. |
| R03 | IN kombinacija in stabilno UTF-16 urejanje | A02, D01 | `src/App.tsx:15`, `src/App.tsx:38` | Uspešno; A02. |
| R04 | privzete neznane vrednosti, prva pojavitev | A03 | `src/navigation.ts:23` | Uspešno; A03. |
| R05 | osnutek se potrdi kot celota | D02, A04 | `src/App.tsx:50`, `src/App.tsx:91` | Uspešno; D02/A04. |
| R06 | trim, izpuščeni privzeti in kanonični URL | A03, A04 | `src/navigation.ts:34`, `src/App.tsx:47` | Uspešno; A03/A04. |
| R07 | nazaj/naprej in osvežitev | D03, A04 | `src/navigation.ts:43`, `src/App.tsx:46` | Uspešno; D03/A04. |
| R08 | preklop ohrani stanje, osnutek zavrže | A06 | `src/App.tsx:87`, `src/App.tsx:119` | Uspešno; A06. |
| R09 | podrobnosti ohranijo ID, pogled in filtre | A06 ter skupni baseline | `src/App.tsx:129`, `src/TaskBoard.tsx:27`, `src/TaskDetails.tsx:12` | Uspešno; A06/baseline. |
| R10 | drugi projekt začne privzeto, ohrani pogled | A06 | `src/App.tsx:156` | Uspešno; A06. |
| R11 | ponastavitev, prazen rezultat in števec | D04, A05, A07 | `src/App.tsx:115`, `src/App.tsx:118` | Uspešno; D04/A05/A07. |
| R12 | brez zapisov, brez localStorage, ohranjeno osnovno delovanje | A05, A07, baseline/API | `src/useResource.ts:13`, `src/App.tsx:29` | Uspešno; `npm run check` 53/53. |

## Odprta vprašanja in omejitve

- Datum `dueDate` ni vnesen v iskanje, ker zahteva ne našteva med iskalnimi polji.
- Testi lahko vrnejo poljubno število opravil, vključno z nič; urejanje je stabilno.
- Končni testi niso dostopni, zato rezultat ne more biti trditveno popoln.

## Zgodovina popravkov

- 1.0: prva specifikacija pred implementacijo.
- 1.1: po pregledu R11 dodano sporočilo `Ni zadetkov` tudi za tabulo;
  osvežena sledljivost, dejanski izidi preverjanja in omejitve.
