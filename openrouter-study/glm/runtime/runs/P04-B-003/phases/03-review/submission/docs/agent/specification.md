# Specifikacija: stabilno razvrščanje z dvema ključema

## Problem in kontekst

Uporabnik želi pri pregledu opravil nadzorovati vrstni red z dvema neodvisnima
ključema in smere, pri čemer mora razvrščanje ostati stabilno in brez stranskih
učinkov. Izhodišče prebere projekte in opravila iz javnega API-ja ter jih prikaže
v preglednici in tabli v vrstnem redu odgovora strežnika. Nova funkcionalnost
doda štiri kontrole razvrščanja ter gumb za povrnitev izvornega vrstnega reda,
ne pa novih zapisovalnih API-jev.

## Vhodi, dejanja in izidi

Podatkovni vir je obstoječi javni API:

- projekti: `GET /api/projects`;
- opravila izbranega projekta: `GET /api/projects/:projectId/tasks`;
- obstoječi podrobni pogled: `GET /api/tasks/:taskId`.

Tipi so iz `shared/types.ts`:

- `Task.id: string`, enkraten znotraj projekta;
- `Task.title: string` in `Task.description: string`;
- `Task.assignee: string`, ki je pri izbiri odgovorne osebe neprazen in različen od `"all"`;
- `Task.status: "todo" | "in_progress" | "done"`;
- `Task.dueDate: string` v veljavni obliki `YYYY-MM-DD`;
- `Task.projectId: string`, ki povezuje opravilo z izbranim projektom.

Stanje razvrščanja je:

```ts
type PrimaryKey = 'original' | 'title' | 'assignee' | 'status' | 'dueDate'
type SecondaryKey = 'none' | 'title' | 'assignee' | 'status' | 'dueDate'
type Direction = 'asc' | 'desc'
type SortState = {
  primary: PrimaryKey
  primaryDirection: Direction
  secondary: SecondaryKey
  secondaryDirection: Direction
}
```

Privzeto stanje je:

```ts
{
  primary: 'original',
  primaryDirection: 'asc',
  secondary: 'none',
  secondaryDirection: 'asc',
}
```

Kontrole imajo dostopna imena `Primarni ključ`, `Primarna smer`,
`Sekundarni ključ` in `Sekundarna smer` ter natanko zgoraj navedene vrednosti.
Gumb ima ime `Izvorni vrstni red`.

Po uspešni spremembi se obstoječi podatki prikažejo v novem vrstnem redu. Če
nalaganje ni uspelo, se ohrani obstoječa obravnava napake. Razvrščanje je čista
projekcija: ne spreminja polj opravil, številcev stanj, pripadnosti projektu niti
izvornega polja in ne sproži zapisovalnega zahtevka.

## Pravila razvrščanja

Normalizacija besedila je:

```ts
normalizeText(value) =
  value.normalize('NFD').replace(/[\u0300-\u036F]/g, '').toLowerCase()
```

Za `title` in `assignee` se primerjata normalizirana niza z običajnima
operatorjema `<` in `>` po UTF-16 kodnih enotah. Ne uporabita se
`localeCompare`, `Intl.Collator` niti jezikovno ali številčno prilagojena
razvrščanja. Vrstni red statusov je:

```text
todo < in_progress < done
```

Datum se primerja po trojici števil `year`, `month`, `day` v tem zaporedju.
Ker so vsi vhodni datumi veljavni `YYYY-MM-DD`, obravnava manjkajočih ali
neveljavnih vrednosti ni zahtevana.

Primerjava dveh opravil `a` in `b` iz izvornega polja sledi tem korakom:

1. Če je `primary === "original"`, vrni `0`; preostale kontrole ne vplivajo.
2. Izračunaj `primaryResult` za izbrani primarni ključ.
3. Če je `primaryDirection === "desc"`, obrni predznak `primaryResult`.
4. Če `primaryResult !== 0`, vrni `primaryResult`.
5. Če je `secondary === "none"`, vrni `0`.
6. Izračunaj `secondaryResult` za izbrani sekundarni ključ.
7. Če je `secondaryDirection === "desc"`, obrni predznak `secondaryResult`.
8. Vrni `secondaryResult`.

Za ostanek po obeh ključih velja izvorni vrstni red, torej naraščajoči izvorni
indeks. Implementacija lahko računa na stabilno `Array.prototype.sort` ali
eksplicitno doda izvorni indeks kot zadnji primerjalnik. Razvrščanje vedno deluje
na kopiji polja.

## Zahteve in sprejemni pogoji

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Ob inicializaciji, menjava projekta ali osvežitvi velja privzeto stanje; `original` ohrani vrstni red prejetega polja. | Preveri vrednosti vseh štirih kontrol in zaporedje ID-jev takoj po nalaganju. |
| R02 | Za `title` in `assignee` velja normalizacija NFD, odstranitev U+0300–U+036F, male črke in leksikografska primerjava po UTF-16 z `<` in `>`. | Enotni test z ASCII, ločili, številkami v besedilu in Unicode, kjer jezikovno razvrščanje odstopa. |
| R03 | `status` ima vrstni red `todo`, `in_progress`, `done`; `dueDate` je kronološko. | Enotni testi rangov statusov in trojic leta, meseca ter dneva. |
| R04 | Smer obrne le izid primerjave izbranega ključa; ne obrača končnega polja in ne vrstnega reda enakih elementov. | Primerjaj izide `asc` in `desc` ter preveri ohranjenost izvornega zaporedja enakih ključev. |
| R05 | Sekundarni ključ se uporabi le ob enakosti primarnega ključa, z neodvisno izbrano smerjo. | Enotni testi z enakimi primarnimi in različnimi sekundarnimi vrednostmi v obeh smereh. |
| R06 | Ob enakosti obeh ključev ali ob `secondary === "none"` velja izvorni vrstni red. Enak sekundarni in primarni ključ ne doda obrata. `primary === "original"` vedno pomeni izvorni vrstni red ne glede na preostale kontrole. | Parametriziran test vseh sekundarnih ključev in obeh smeri, tudi ob `primary === "original"`. |
| R07 | Tabla vedno prikaže stolpce `todo`, `in_progress`, `done` v tem vrstnem redu. Vsak stolpec dobi opravila svojega stanja v relativnem vrstnem redu razvrščenega polja. | Odprti test primerja stalna imena stolpcev in zaporedja ID-jev znotraj vsakega stolpca. |
| R08 | Preklop `table`/`board` ter odpiranje in zapiranje podrobnosti ohranita vse štiri nastavitve in trenutni vrstni red. | Testna naveza spremeni kontrole, preklopi pogled, odpre in zapre podrobnost ter primerja stanje. |
| R09 | Menjava projekta ali osvežitev ponastavi nastavitve na privzete. Nastavitve niso v `localStorage`, `sessionStorage` ali URL-ju; obstoječi parameter `view` ostane nespremenjen. | Test z dvema projektoma, osvežitvijo in pregledom shrambe ter različice URL-ja. |
| R10 | Gumb `Izvorni vrstni red` nastavi privzete vrednosti vseh štirih kontrol in izvorno zaporedje. Prazno polje in polje z enim opravilom delujeta z vsemi ključi in smereh. | Klik po spremembah ter parametriziran test praznega in enojnega polja. |
| R11 | Razvrščanje je projekcija: polja, pripadnost, številci in izvorno polje ostanejo nespremenjeni; sprememba kontrol ne pošlje zapisovalnega zahtevka. | Enotni test čiste projekcije ter odprti test z beleženjem nebralnih zahtevkov. |
| R12 | Vsak ID ostane v vsakem pogledu prikazan natanko enkrat in odpre prave podrobnosti tudi pri enakih naslovih. Ohranijo se obstoječi dostopni nazivi, `data-task-id`, stolpci, povezave in prilagodljiv videz Folio. Nova dejanja so zunaj povezave opravila. | Odprti test preveri množico ID-jev, povezave, podrobnosti in na širini 390 px odsotnost horizontalne razširitve strani. |

## Izvedba in sledljivost

Predlagana izvedba je ločena enota za primerjalna pravila, na primer
`src/sorting.ts`, ki vrača novo polje. Stanje kontrol naj živi v `ProjectView` v
`src/App.tsx`, razvrščeno polje pa naj prejeta `TaskBoard` v
`src/TaskBoard.tsx`. Tako menjava projekta prek obstoječega `key={project.id}`
ponastavi stanje, preklop pogleda in podrobnosti pa ga ohranita. Stolpci table
in obstoječi odpiralni povezavi ostanejo nespremenjeni.

| Zahteva | Pogoj | Predlagani test ali scenarij | Predvidena datoteka | Izid |
| --- | --- | --- | --- | --- |
| R01 | Privzeto stanje. | Enotni test privzetih vrednosti in odprta preverba inicializacije. | `src/sorting.ts`, `src/App.tsx` | Ni izvedeno. |
| R02 | Normalizacija in UTF-16. | Enotni test primerjalne funkcije z Unicode. | `src/sorting.ts` | Ni izvedeno. |
| R03 | Rangi statusov in datumov. | Enotni testi statusov in datumskih trojic. | `src/sorting.ts` | Ni izvedeno. |
| R04 | Neodvisna smer. | Enotni test z enakimi in neenakimi ključi. | `src/sorting.ts` | Ni izvedeno. |
| R05 | Sekundarni ključ. | Enotni test neodvisnih smeri. | `src/sorting.ts` | Ni izvedeno. |
| R06 | Stabilnost in izvorni ključ. | Parametriziran enotni test vseh kombinacij. | `src/sorting.ts` | Ni izvedeno. |
| R07 | Stalni stolpci table. | Playwright test relativnih zaporedij stolpcev. | `src/App.tsx`, `src/TaskBoard.tsx` | Ni izvedeno. |
| R08 | Ohranitev stanja. | Playwright test preklopa in podrobnosti. | `src/App.tsx`, `src/navigation.ts`, `src/TaskDetails.tsx` | Ni izvedeno. |
| R09 | Ponastavitev in brez trajne shrambe. | Playwright test projekta, osvežitve in shrambe. | `src/App.tsx` | Ni izvedeno. |
| R10 | Gumb za izvorni vrstni red. | Playwright klik po spremembah ter robni primeri. | `src/App.tsx`, `src/sorting.ts` | Ni izvedeno. |
| R11 | Čista projekcija. | Enotni test nespremenjenih vhodov in omrežni presledki. | `src/sorting.ts`, `src/App.tsx` | Ni izvedeno. |
| R12 | Enotnost ID-jev in obstoječe funkcije. | Playwright test ID-jev, povezav, podrobnosti in širine 390 px. | `src/App.tsx`, `src/TaskBoard.tsx`, `src/TaskDetails.tsx`, `src/styles.css` | Ni izvedeno. |

Rezultati testov bodo veljavni šele po implementaciji in dejanskem zagonu.
Implementer naj v poročilu navede izvedene teste in dokaze; skupnih testov,
infrastrukture, strežnika in odvisnosti ne spreminja.

## Odprta vprašanja in omejitve

- Vsi datumi so veljavni `YYYY-MM-DD`; obravnava manjkajočih ali neveljavnih
  datumov ni zahtevana.
- Naslovi, opisi in imena so navadno besedilo, vključno z Unicode znaki in
  ločili. Testi lahko podajo poljubno število opravil, tudi nič, eno in več kot
  deset.
- Uporabniški vmesnik bere samo `/api/`; testnih kontrol `/__test/` ne sme
  uvačati ali uporabljati.
- Stanje razvrščanja ni trajno shranjeno niti kodirano v URL-ju. Parametra
  projekta in obstoječi pogled v URL-ju ostaneta.
- Besedilo in razporeditev novih kontrol nista predpisana, razen dostopnih imen,
  vrednosti in gumba iz zahtev.
