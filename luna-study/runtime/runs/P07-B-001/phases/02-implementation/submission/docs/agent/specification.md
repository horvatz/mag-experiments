# P07: priljubljena opravila in trajna shramba

## Problem in kontekst

Folio zdaj prek `/api/projects` naloži projekte, v `ProjectView` pa prek
`/api/projects/{id}/tasks` prikaže opravila v preglednici ali na tabli.
Uporabnik želi opravila neodvisno označiti kot priljubljena, izbor ohraniti po
osvežitvi, ga filtrirati in počistiti za trenutni projekt. `Project` ima polji
`id` in `name`; `Task` ima `id`, `projectId`, `title`, `description`, `status`,
`assignee` in `dueDate` (`shared/types.ts`). ID je identiteta opravila; naslov
ni nujno enoličen. Ohranita se Folio, obstoječa navigacija/podrobnosti in ozka
postavitev iz `docs/dizajn.md`.

## Vhodi, dejanja in izidi

Naj bo `Tₚ` seznam opravil trenutnega projekta v vrstnem redu API-ja, `Iₚ` množica
njihovih ID-jev, `F` globalna množica priljubljenih ID-jev in `b` stanje filtra.
Vidni seznam je `Vₚ = Tₚ`, kadar `b=false`, sicer
`Vₚ = [t ∈ Tₚ | t.id ∈ F]` (vrstni red se ohrani). Oznaka opravila `t` je
pritisnjena natanko tedaj, ko `t.id ∈ F`. V `localStorage` se pod ključem
`folio:favorites:v1` hrani JSON `{ "version": 1, "ids": [...] }`; `ids` ob
zapisu vsebuje enolične nize, razvrščene z JavaScriptovim privzetim
UTF-16-urejanjem. Opravila in njihova polja niso del zapisa.

Klik oznake spremeni samo članstvo njenega ID-ja v `F`. Brisanje projekta
odstrani iz `F` samo ID-je iz `Iₚ`. Napaka shrambe ne prepreči sprememb `F` v
pomnilniku in uporabe preostalega vmesnika. Nobeno dejanje priljubljenih ne
spreminja opravila ali pošilja zapisovalnih zahtev API-ju.

## Zahteve in pravila

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Vsaka vrstica in kartica ima ločen gumb z imenom `Priljubljeno opravilo <id>`; `aria-pressed` je enak `t.id ∈ F`. Klik izvede `F' = F △ {t.id}` (simetrična razlika), ne sproži povezave/podrobnosti; enaka naslova ne povežeta stanj. | Klikni dve opravili z enakim naslovom v obeh pogledih; preveri ID-je, `aria-pressed` in odsotnost dialoga (D01). |
| R02 | Vsak zapis uporabi točen ključ in obliko `{version:1,ids:[...]}`; ID-ji so nizi brez dvojnikov in po UTF-16 vrstnem redu. Vrednosti opravil se nikoli ne zapisujejo. | Preveri vrednost localStorage po več preklopih, vključno z Unicode ID-ji. |
| R03 | Veljaven zapis se ob zagonu obnovi. Podvojeni ID-ji postanejo en član `F`; veljavni, a trenutno neznani ID-ji ostanejo v `F`, vendar zanje UI ne ustvari opravil. | Osveži z vnaprej pripravljenim zapisom z dvojniki in neznanim ID-jem; kasnejši zapis ga ohrani. |
| R04 | Manjkajoč ključ ali zapis z neveljavnim JSON, `version !== 1`, manjkajočim `ids` ali vsaj enim nenizom v `ids` da `F=∅`. UI ostane uporaben; samo nalaganje ne zapisuje nazaj v shrambo. | Preveri vsak neveljaven primer in potrdi prazen začetni izbor ter nespremenjen ključ. |
| R05 | Checkbox `Prikaži le priljubljena` se začne kot `false`; vključen omeji oba prikaza na `Vₚ` in ohrani vrstni red `Tₚ`. | Preveri privzeto stanje in filtriran vrstni red v preglednici in tabli. |
| R06 | Odstranitev oznake med aktivnim filtrom takoj odstrani opravilo iz `Vₚ`. Če je `Vₚ=∅`, je vidno točno `Ni priljubljenih opravil.`; kontrola filtra ostane dosegljiva za izklop. | Vključi filter, odstrani zadnji vidni ID in preveri prazno stanje ter checkbox. |
| R07 | Preglednica in tabla uporabljata isti `F` in `b`; menjava pogleda ju ne ponastavi. Odpiranje povezave opravila še vedno pokaže podrobnosti po njegovem ID-ju. | D01, D04; preklopi pogled in odpri podrobnosti opravila z enakim naslovom kot drugo. |
| R08 | Menjava projekta ohrani globalni `F` in nastavi `b=false`; osvežitev obnovi `F` iz shrambe in začne z `b=false`. | Preklopi projekt med vključenim filtrom, nato osveži in preveri oznake ter filter. |
| R09 | Gumb `Odstrani priljubljene tega projekta` nastavi `F' = F \\ Iₚ`, tudi če so opravila skrita s filtrom. ID-ji drugih projektov in neznani ID-ji ostanejo. Gumb je onemogočen natanko, ko `F ∩ Iₚ = ∅`. | Izbriši priljubljene enega projekta, preveri drugi projekt/neznani ID ter stanje gumba pri nič in več zadetkih. |
| R10 | `role=status`, `aria-label="Število priljubljenih"` vedno kaže točno `Priljubljeno: X od M.`, kjer `X=|F ∩ Iₚ|` in `M=|Tₚ|` ne glede na filter. Števci stolpcev table štejejo samo vidna opravila po stanju. Ohranita se `aria-label="Pregled stanj opravil"` in `data-task-id` na vrsticah/karticah. | Preveri števce pred/med filtrom ter števce stolpcev po stanju. |
| R11 | Dogodek `storage` za ključ `folio:favorites:v1` takoj zamenja `F` po pravilih R03–R04; `newValue=null` pomeni `F=∅`. Drug ključ se prezre, uskladitev ne sproži povratnega zapisa. Izjema `getItem` ali `setItem` ne prekine uporabe: stanje v pomnilniku deluje, `role=alert` pa vsebuje besedo `shramba`. | Sproži veljaven/neveljaven/null dogodek, dogodek drugega ključa ter napaki branja in pisanja; preveri brez povratnega zapisa in opozorilo. |
| R12 | Vse spremembe so lokalne: brez zapisovalnih zahtev `/api/` in brez spremembe polj `Task`. UI ne uporablja `/__test/`, lokalne kopije opravil ali drugega ključa za shranjevanje. Obstoječe nalaganje, navigacija, podrobnosti in Folio ostanejo; pri 390 px ni vodoravnega drsenja cele strani, notranje drsenje tabele/table je dovoljeno. | D04 ter pregled mrežnih zahtev, podatkov, podrobnosti, navigacije in `documentElement.scrollWidth <= innerWidth` pri širini 390 px. |

Splošna pravila veljajo za prazne sezname, eno ali več opravil, poljubne nize
ID-jev in naslove, tudi enake, ter opravila v izvornem vrstnem redu API-ja.
Začetna podatkovna domena določa enolične ID-je; testni projekt je lahko prazen.
UI bere samo javni `/api/`; testi lahko neodvisno nadzirajo GET odgovore.
Navigacije med nedokončanim nalaganjem in sočasnih sprememb podatkov brez
osvežitve zahteve ne širijo prek regresijskega obnašanja izhodišča.

## Izvedba in sledljivost

Izvorni pregled: `src/App.tsx` veže projektno nalaganje, povzetek, preglednico,
poglede in `TaskDetails`; `src/TaskBoard.tsx` razporedi kartice po stanju;
`src/navigation.ts` nosi ID projekta/opravila in pogled v hash poti; `src/api.ts`
izpostavlja GET in obstoječi pripravljeni `updateTask`; `src/styles.css` vsebuje
notranje pomikanje ter odzivno postavitev. `tests/development/P07.spec.ts`
vsebuje scenarije D01–D04, `helpers.ts` pa nadzorovane podatke/GET-e in preverjanje
zapisov API ter širine strani. Ti testi v fazi specifikacije niso bili zagnani.
Implementer po izvedbi dopolni dejanske lokacije kode, dodatne scenarije in dokaze;
spodaj navedeni izidi zato niso uspešni rezultati.

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | ID določa samo svojo oznako; klik ne odpre podrobnosti. | D01; oba pogleda, enaka naslova. | `App.tsx` `ProjectView`; `TaskBoard.tsx` `TaskBoard` — obstoječa mesta vrstice/kartice. | Ni zagnano v fazi specifikacije. |
| R02 | Kanoničen zapis ID množice pod točnim ključem. | D03; dodatno urejanje in brez polj opravila. | Nova shrambena/stanj­ska koda (implementer določi lokacijo). | Ni zagnano; še ni implementirano. |
| R03 | Obnova, deduplikacija in ohranitev neznanih ID-jev. | D03; vnaprej nastavljen zapis z dvojniki/neznanim ID-jem. | Nova shrambena/stanj­ska koda. | Ni zagnano; še ni implementirano. |
| R04 | Neveljaven zapis postavi prazno stanje brez samodejnega zapisa. | Razvojni scenariji za vse navedene napake oblike. | Nova shrambena/stanj­ska koda. | Ni zagnano; še ni implementirano. |
| R05 | Filter je privzeto izklopljen in ohranja vrstni red. | Filtriranje v preglednici in tabli. | `App.tsx` `ProjectView`; `TaskBoard.tsx` prejme filtriran seznam. | Ni zagnano v fazi specifikacije. |
| R06 | Odznačitev takoj spremeni rezultate; prazen filter pokaže določeno sporočilo. | D02. | `App.tsx` stanje seznama in prazno stanje. | Ni zagnano; D02 ni bil zagnan. |
| R07 | Stanje je enotno za oba pogleda; podrobnosti uporabljajo ID povezave. | D01, D04; obstoječi scenarij `details`. | `App.tsx`, `TaskBoard.tsx`, `navigation.ts`, `TaskDetails.tsx`. | Ni zagnano v fazi specifikacije. |
| R08 | Globalna množica preživi projektno menjavo/osvežitev; filter se ponastavi. | Projektna menjava z vključenim filtrom in osvežitev. | Lastništvo stanja v `App.tsx`/novem stanju; `navigation.ts` za pot. | Ni zagnano; še ni implementirano. |
| R09 | Odšteje samo celoten `Iₚ`; pravilno onemogočanje. | Večprojektni ID-ji, skriti zadetki in prazen projekt. | `App.tsx` kontrole `ProjectView`; skupna shrambena množica. | Ni zagnano; še ni implementirano. |
| R10 | Točni atributi/tekst števca in števci vidnih stolpcev. | Filter on/off, različna stanja, prazen projekt. | `App.tsx` povzetek; `TaskBoard.tsx` `columns`. | Ni zagnano; še ni implementirano. |
| R11 | Zunanji dogodek brez odmevnega zapisa; izjeme so obravnavane. | Storage dogodki in napake branja/pisanja. | Nova shrambena/stanj­ska koda in opozorilo v UI. | Ni zagnano; še ni implementirano. |
| R12 | Samo lokalna priljubljenost, ohranjene regresije in brez preliva strani. | D04; pregled podrobnosti, API zahtev in širine 390 px. | `App.tsx`, `api.ts`, `navigation.ts`, `styles.css`. | Ni zagnano v fazi specifikacije. |

## Odprta vprašanja in omejitve

Naloga ne določa dodatnega vedenja za dodana polja v veljavnem JSON objektu;
za obnovo so obvezni `version:1` in veljaven nizovni seznam `ids`. Predlagani
scenariji v zgornji sledljivosti niso dokaz izvedbe. Končni testi naloge niso
dostopni tej fazi in niso navedeni kot opravljeni.
