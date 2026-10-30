# Specifikacija P07: Priljubljena opravila in trajna shramba

## Problem in kontekst

Folio prikazuje projekte, opravila v preglednici, opravila na tabli in podrobnosti opravila. Uporabnik želi posamezna opravila označiti kot priljubljena in si ta izbor trajno zapomniti. Priljubljenost je izključno lokalno stanje brskalnika: ne spremeni podatkov API-ja, povezave opravil ali obstoječega delovanja Folia.

## Vhodi, dejanja in izidi

Podatkovna domena je določena z `shared/types.ts`:

- `Project`: `{ id: string, name: string }`.
- `Task`: `{ id: string, projectId: string, title: string, description: string, status: 'todo' | 'in_progress' | 'done', assignee: string, dueDate: string }`.
- Projekta lahko vsebujeta nič, eno ali več opravil. Naslovi so lahko enaki, ID-ji so enkratni, besedilo pa lahko vsebuje Unicode znake in ločila.

Vmesnik še naprej bere samo `/api/projects`, `/api/projects/<projectId>/tasks` in `/api/tasks/<taskId>`. Ne sme brati ali klicati `/__test/`, ne sme dodati novih zapisovalnih API-jev, ob preklopu priljubljenosti pa ne sme biti poslan noben ne-GET/HEAD/OPTIONS zahtevek.

Stanje priljubljenih je množica ID-jev `favoriteIds`. Filtriranje je neodvisen boolean `showFavoritesOnly`. Obe stanji sta last trenutnega pogleda aplikacije, ne posameznega projekta; filter pa se ponastavi ob menjavi projekta. Priljubljenost posameznega opravila se preklopi s predikatom:

```text
toggle(taskId):
  if favoriteIds.contains(taskId):
    favoriteIds := favoriteIds \ {taskId}
  else:
    favoriteIds := favoriteIds ∪ {taskId}
  persist(favoriteIds)
```

Trajni zapis je natanko:

```text
localStorage["folio:favorites:v1"] =
  JSON.stringify({ version: 1, ids: [...favoriteIds].sort(compareUtf16) })
```

`compareUtf16` je primerjava po kodnih enotah UTF-16, ne lokalizirana primerjava nizov. Podvojene vrednosti se v shrambi ne pojavijo, ker je `favoriteIds` množica. Ob vsakem uspešnem zapisu se torej uporabita enkratni, razvrščeni nizi. Polja `Task` se ne shranjujejo.

## Zahteve in pravila

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Za vsak `task` v trenutnem projektu obstaja ločen gumb z dostopnim imenom `Priljubljeno opravilo <task.id>` in `aria-pressed` enakim `favoriteIds.has(task.id) ? 'true' : 'false'`. Gumb stoji zunaj povezave do podrobnosti. Klik izvede samo `toggle(task.id)`, ne spremeni URL in ne odpre dialoga. Dva opravila z istim naslovom, a različnima ID-jema, se obnašata neodvisno. | Lastni Playwright test z vsaj dvema enakima naslovoma in različnima ID-jema preveri oba `aria-pressed`, odsotnost dialoga in URL. |
| R02 | Ob vsakem uspešnem preklopi se zapiše `folio:favorites:v1` kot veljaven JSON z natanko `version: 1` in poljem `ids`; `ids` so nizi, brez ponovitev in razvrščeni po UTF-16. V shrambi ni objektov opravil. | Test preklopi več ID-jev v nenaslovnem vrstnem redu, prebere `localStorage` in primerja celoten JSON. |
| R03 | Ob inicializaciji se prebere obstoječ zapis. Veljaven zapis lahko vsebuje podvojene in trenutno neznane ID-je: podvojene se v pomnilniku obravnavajo kot enega, neznani pa ostanejo v množici. Neznani ID ne sme ustvariti vrstice, kartice ali opravila. | Test nastavi `{version:1,ids:['z','a','z']}`, osveži stran in preveri prikaz ter morebitni zapis po naslednjem preklopu. |
| R04 | Branje velja samo, če obstaja ključ, je lahko razčlenjen kot JSON, `version === 1`, obstaja last `ids` in je vsak element `ids` niz. Sicer je začetna množica prazna. Neveljaven ali manjkajoč zapis ne povzroči nerešene napake in se samodejno ne popravi oz. ne zapiše. | Parametriziran test preveri manjkajoči ključ, neveljaven JSON, napačno `version`, manjkajoče `ids` in ne-nizni element; preveri tudi, da nalaganje ne ustvari novega zapisa. |
| R05 | Checkbox ima dostopno ime `Prikaži le priljubljena` in je ob zagonu neizbran. Če je izbran, je `visibleTasks = tasks.filter(task => favoriteIds.has(task.id))`; sicer je `visibleTasks = tasks`. Zaporedje ostane tisto, ki ga vrne API. | Test izbere filter pri mešanih priljubljenih in nepriljubljenih opravilih ter preveri vidne ID-je v izvornem zaporedju. |
| R06 | Preklop priljubljenega ob aktivnem filtru takoj odstrani opravilo iz `visibleTasks`. Če je `visibleTasks.length === 0`, se prikaže natanko besedilo `Ni priljubljenih opravil.` Checkbox in gumbi ostanejo dostopni, da lahko uporabnik izklopi filter. | Test označi in odstrani zadnji vidni priljubljeni ID, preveri prazno stanje, nato izklopi filter in preveri vrnitev vseh opravil. |
| R07 | `favoriteIds` in `showFavoritesOnly` sta skupni za preglednico in tablo. Preklop pogleda ne izgubi priljubljenosti, filtra ali podatkov. Povezava do podrobnosti uporabi obstoječi `taskUrl(project.id, task.id, view)` in pravilen ID. | Test spremeni priljubljenost in filter, preklopi med `Preglednica` in `Tabla`, nato odpre podrobnost prek `data-task-id`. |
| R08 | Menjava projekta ohrani globalno množico `favoriteIds`, vključno z ID-ji drugega projekta in neznanimi ID-ji, ter ponastavi `showFavoritesOnly` na `false`. Po osvežitvi velja enako pravilo: množica se prebere iz shrambe, filter pa je neizbran. | Test priljubi ID-je v obeh projektih, preklopi projekt, osveži stran in preveri obe stanji. |
| R09 | Gumb z dostopnim imenom `Odstrani priljubljene tega projekta` izvede `favoriteIds := favoriteIds \ ids(tasks trenutnega projekta)`. ID-ji drugih projektov in neznani ID-ji ostanejo. Gumb je onemogočen, kadar je število priljubljenih opravil trenutnega projekta nič. | Test pripravi mešano globalno množico, odstrani priljubljene trenutnega projekta in preveri preostanek; v praznem projektu preveri `disabled`. |
| R10 | Element števca ima `role="status"`, `aria-label="Število priljubljenih"` in vedno besedilo `Priljubljeno: X od M.`, kjer je X število vseh opravil trenutnega projekta s priljubljenim ID-jem in M število vseh opravil trenutnega projekta. Vrednosti se ne spremenita zaradi filtra. Števci stanj oz. stolpcev preglednice in table štejejo vidna opravila. | Test spremeni filter, priljubljenost in pogled ter preveri števec, stanja, števce stolpcev in vidne ID-je. |
| R11 | Poslušalec `storage` se odzove samo na `event.key === 'folio:favorites:v1'`. `event.newValue` se validira po istih pravilih kot R04; `null` oz. odstranitev pomeni prazno množico. Drug ključ se ignorira. Obdelava dogodka ne sme povzročiti povratnega zapisa. Vsako branje ali pisanje `localStorage` je zaščiteno: izjema ne sme prekiniti stanja v pomnilniku in prikaže opozorilo z `role="alert"`, ki vsebuje besedo `shramba`. | Test z dvema listoma sproži isti in tuji `storage` dogodek ter preveri usklajenost in odsotnost novih API-jev; ločen test prisili izjemo shrambe in preveri opozorilo ter uporabnost. |
| R12 | Nobeno dejanje priljubljenosti ne kliče `updateTask`, ne spreminja polj `Task` in ne pošlje pisanega zahtevka na `/api/`. Ohranijo se obstoječi pogledi, imena, `data-task-id`, navigacija, ozki prikaz in potrjen Folio videz. Pri širini 390 px se stran ne razširi čez viewport; notranje drsenje je dovoljeno. | Test z nadzorovanim GET odgovorom preveri, da ni ne-GET/HEAD/OPTIONS zahtevkov in da se podatki strežnika ne spremenijo; vizualni pregled preveri 390 px. |

## Izvedba in sledljivost

Priporočena izvedba ohrani obstoječo komponentno strukturo:

- Stanje `favoriteIds` in `showFavoritesOnly` naj bo v `src/App.tsx` ali v lastnem `src/useFavorites.ts` in se podá v `ProjectView`.
- Zato ker je `ProjectView` trenutno gnezden z `key={project.id}`, stanji ne smeta ostati samo v tej komponenti, sicer bi menjava projekta izgubila globalno množico.
- `visibleTasks` se uporabi v `src/App.tsx` za preglednico, v `src/TaskBoard.tsx` za tablo in za števce stanj; `src/styles.css` le dopolni obstoječi Folio videz.
- Validacija in zapis shrambe naj bosta v majhni, samostojni funkciji oz. hooku, ki ga lahko testiramo ločeno ali prek uporabniškega vmesnika.

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01–R04 | Zapis, preklop, branje in validacija shrambe. | Lastni testi za neodvisne ID-je, zapis, osvežitev in vse neveljavne vnose. | Nova shramba oz. hook ter gumb v `src/App.tsx`. | Ni izvedeno; predano implementerju. |
| R05–R07 | Skupni filter, prazno stanje in enakost obeh pogledov. | Lastni testi filtriranja, praznega prikaza, preklopa pogleda in podrobnosti. | `src/App.tsx`, `src/TaskBoard.tsx`. | Ni izvedeno; predano implementerju. |
| R08–R10 | Menjava projekta, odstranitev projektnih priljubljenih in števci. | Lastni testi z dvema projektoma, mešanimi ID-ji in števci. | Stanje v `src/App.tsx` oz. nov hook ter prikaz v obstoječih komponentah. | Ni izvedeno; predano implementerju. |
| R11 | `storage` dogodek in zaščita izjem. | Lastni testi z dvema listoma in prisiljeno izjemo `localStorage`. | Nova shramba oz. hook. | Ni izvedeno; predano implementerju. |
| R12 | Ohranitev Folia, brez pisanja na API in ozki prikaz. | Lastni Playwright test z nadzorovanimi GET odgovori, spremljanjem zahtevkov in 390px pregled. | `src/App.tsx`, `src/TaskBoard.tsx`, `src/styles.css`. | Ni izvedeno; predano implementerju. |

Po implementaciji implementer posodobi zadnji stolpec z dejanskimi testi in rezultati. Rezultat brez izvedenega testa se ne sme označiti kot uspešen.

## Odprta vprašanja in omejitve

- Strežnik, `shared/types.ts`, skupni testi, odvisnosti in nastavitve ostajajo nespremenjeni.
- `/__test/` lahko uporabita le testni program in testni pripomočki; produkcijski vmesnik ga ne sme uporabiti.
- Nalaganje, navigacija med nezaključenim nalaganjem in sočasne spremembe podatkov brez osvežitve niso novo obsežene zahteve.
- Vizualna podoba ni natančno predpisana; novo dejanje mora slediti obstoječemu Folio dizajnu in biti dostopno na širini 390 px.
- Ta faza specifikacije ne izvaja aplikacije ali testov, zato noben izid ni prijavljen kot opravljen.
