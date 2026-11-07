# Razvojna specifikacija P04: stabilno razvrščanje z dvema ključema

## Problem in kontekst

Uporabnik želi opravila v projektu urejati po enem primarnem in enem sekundarnem ključu, pri čemer ima vsak ključ svojo smer. Izhodiščni Folio že prikazuje projekte, povzetek stanj, preglednico, tabo, podrobnosti in obstoječe bralne funkcije, vendar ne ponuja kontrol za razvrščanje.

Predvidena sprememba je omejena na uporabniški vmesnik: dodati štiri obstoječemu dizajnu skladne kontrole ter gumb `Izvorni vrstni red`, izpeljati stabilno razvrščeno polje in ga uporabiti v preglednici in tabli. Razvrščanje je projekcija naloženih podatkov; ne spreminja opravil, pripadnosti, številcev ali izvornega polja in ne kliče zapisovalnega API-ja.

## Vhodi, dejanja in izidi

Podatkovni tip je obstoječi `Task` iz `shared/types.ts`: `id`, `projectId`, `title`, `description`, `status`, `assignee` in `dueDate`. `status` je `todo | in_progress | done`. Naslovi in imena so nizi, datumi so obljubljeni veljavni koledarski datumi `YYYY-MM-DD`, ID-ji so enkratni, vsako opravilo pa pripada svojemu projektu.

Dovoljene vrednosti:

- primarni ključ: `original | title | assignee | status | dueDate`;
- sekundarni ključ: `none | title | assignee | status | dueDate`;
- smeri: `asc | desc`.

Dovoljena dejanja:

- nastaviti primarni ključ, primarno smer, sekundarni ključ in sekundarno smer;
- vrniti vse štiri vrednosti na privzete z gumbom `Izvorni vrstni red`;
- preklopiti med preglednico in tabo ter odpreti ali zapreti podrobnosti.

Po uspehu sta preglednica in tabla sestavljena iz istega razvrščenega polja, vsak ID je prikazan natanko enkrat, povezave odpirajo podrobnosti izbranega ID-ja, števci ostanejo enaki in ne pride do zapisovalnega API-ja. Napake nalaganja ali shranjevanja ohranijo obstoječe vedenje; razvrščanje ne dodaja novih napak.

## Zahteve in pravila

Razvrščanje določa:

```ts
type TaskKey = 'original' | 'title' | 'assignee' | 'status' | 'dueDate'
type SecondaryKey = 'none' | TaskKey
type Direction = 'asc' | 'desc'
type SortSettings = {
  primaryKey: TaskKey
  primaryDirection: Direction
  secondaryKey: SecondaryKey
  secondaryDirection: Direction
}
const defaultSettings: SortSettings = {
  primaryKey: 'original',
  primaryDirection: 'asc',
  secondaryKey: 'none',
  secondaryDirection: 'asc',
}
```

Z besediloma `title` in `assignee` uporabi:

```ts
const normalizeText = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036F]/g, '')
    .toLowerCase()
```

Nato primerjaj izključno z JavaScript `<` in `>`, torej po enotah UTF-16. Ne uporabljaj `localeCompare`, `Intl.Collator`, numeričnega razvrščanja ali jezikovno prilagojenega razvrščanja. Za `status` velja rank `todo=0`, `in_progress=1`, `done=2`. Za veljavni datum uporabi kronološko primerjavo trojke `(leto, mesec, dan)`.

Končni comparator je stabilna sestavljena primerjava:

1. izračunaj primarno primerjavo izbranih vrednosti; `original` vedno vrne `0` in ignorira sekundarni ključ;
2. če je primarna smer `desc`, obrni le rezultat primarne primerjave;
3. če primarna primerjava ni `0`, uporabi njen rezultat;
4. sicer izračunaj sekundarno primerjavo; `none` vrne `0`;
5. če je sekundarna smer `desc`, obrni le rezultat sekundarne primerjave;
6. če sekundarna primerjava ni `0`, uporabi njo;
7. sicer primerjaj izvirna indeksa v vhodnem polju.

Ne uporabi `Array.prototype.reverse` na končnem polju. Eksplicitni indeksi ali zanesljivo stabilna razvrstitev zagotavljata, da `desc` ne zamenja ali obrne enakih elementov.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Po inicializaciji, osvežitvi ali menjavi projekta velja `defaultSettings`. Prikaz sledi zaporedju `GET /api/projects/:id/tasks`, tudi če strežnik vrže permutacijo. | Naloži znano permutacijo in preveri zaporedje ID-jev ter vrednosti vseh štirih selectov. |
| R02 | Za primarni ali sekundarni ključ `title` oz. `assignee` ureja `normalizeText` in nato UTF-16 primerjava; velike/male črke, sestavljeni Unicode in ločila ne smejo povzročiti jezikovno ali numerično odvisnega vrstnega reda. | Test s pari, ki na `localeCompare` oz. numeričnem razvrščanju padajo drugače, ter nadzorovanimi enakimi nizi po normalizaciji. |
| R03 | `status` ima v `asc` vrstni red `todo, in_progress, done`; `dueDate` primerja veljavne datume kronološko, ne le slučajno po nizu. | Test z vsemi tremi statusi in datumi, ki ločijo mesec, dan in leto; preveri obe smeri. |
| R04 | `desc` pomnoži z `-1` le rezultat primerjave trenutnega ključa. Enaki vrednosti ostanejo v izvornem relativnem vrstnem redu, končno polje se ne obrne. | Test z več skupinami enakih ključev; preveri zaporedje ID-jev in odsotnost splošnega obrata. |
| R05 | Sekundarna primerjava se izvede le, kadar je primarna primerjava `0`, in uporabi lastno smer. | Parametriziran test sekundarnih ključev `title`, `assignee`, `status`, `dueDate` z neodvisnima smerema. |
| R06 | Po izenačenih primarni in sekundarni primerjavi ostane izvorni vrstni red. Ista vrednost sekundarnega in primarnega ključa je dovoljena in enakih vrednosti ne obrne še enkrat. `original` kot primarni ključ vedno vrne izvorno polje ne glede na sekundarni ključ in smeri. | Testi z duplikati, enakima izbranima ključema in `original` v obeh smereh z vsemi sekundarnimi ključi. |
| R07 | Tabla ohrani natanko tri obstoječe stolpce `Pripravljeno`, `V delu` in `Končano`. Vsak stolp vsebuje tiste elemente razvrščenega polja, ki imajo ustrezen status, v njegovem relativnem vrstnem redu. | Izvede razvrščanje, preklopi na tablo in za vsak stolpec primerja seznam `data-task-id`. |
| R08 | Preklop `Preglednica`/`Tabla` ne spremeni štirih nastavitev. Odpiranje in zapiranje podrobnosti prav tako ohrani nastavitve in trenutni vrstni red. | Spremeni vse štiri vrednosti, preklopi pogled, odpre in zapre podrobnosti, nato preveri selecte in vrstni red. |
| R09 | Menjava projekta ponastavi nastavitve. Osvežitev začne s privzetimi vrednostmi. UI ne shranjuje nastavitev v `localStorage` in ne zapisuje razvrščanja v URL, razen obstoječega parametra `view`. | Test menjave projekta, `page.reload()` ter primerjava `localStorage` in hasha pred/po spremembi. |
| R10 | Gumb `Izvorni vrstni red` nastavi `defaultSettings` in izvorno zaporedje. Prazna projekta in projekta z enim opravilom ne smeta povzročiti napake pri nobenem ključu ali smeri. | Test gumba po spremembi vseh štirih vrednosti ter parametriziran test praznega in enega opravila za vse ključe in obe smeri. |
| R11 | Razvrščanje izpelje novo prikazno polje iz obstoječega naloženega polja. Ne spremeni `Task` objektov, `projectId`, številcev ali izvornega polja. Med spremembo razvrščanja ne sme priti do ne-`GET` zahteve na `/api/`. | Primerjava vseh podatkov pred/po, preverba številcev ter zajem ne-GET API zahtev. |
| R12 | Vsi ID-ji so v vsakem pogledu prikazani natanko enkrat in povezava odpre podrobnosti za svoj `data-task-id`, tudi pri enakih naslovih. Ohranijo se obstoječi dostopni imeni, trije stolpci, `aria-label="Pregled stanj opravil"`, `data-task-id` in preostale bralne funkcije. Pri širini 390 px stran ne širi; notranje drsenje je dovoljeno. | Skupni regresijski testi plus nov test z enakimi naslovi, preverba ARIA/ID-jev in viewport 390 px. |

## Izvedba in sledljivost

Predvidena izvedba:

- `src/sortTasks.ts` (novo): tipe, privzete nastavitve, normalizacijo, comparatorje in `sortTasks(tasks, settings)`;
- `src/App.tsx`: lokalno stanje štirih nastavitev v `ProjectView`, kontrole z izrecnimi dostopnimi imeni, uporaba `sortTasks` v preglednici, gumb za ponastavitev in nevezano navigacijo obstoječih opravil;
- `src/TaskBoard.tsx`: `TaskBoard` dobi razvrščeno polje in ohrani obstoječe filtriranje po statusu;
- `src/styles.css`: le prilagoditve razporeditve novih kontrol z obstoječimi Folio spremenljivkami;
- `tests/agent/P04.spec.ts` (novo): lastni Playwright testi za R01–R12, z morebitnimi pomožnimi funkcijami v isti mapi.

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | Privzete vrednosti in vhodno zaporedje. | `D01 default and title order` oz. lasten test privzetega vrstnega reda. | `src/sortTasks.ts`, `src/App.tsx`; `tests/agent/P04.spec.ts`. | Ni izvedeno v specifikacijski fazi. |
| R02 | Normalizacija NFD, brez U+0300–U+036F, male črke, UTF-16. | Lasten Unicode test za naslov in odgovorno osebo. | `src/sortTasks.ts`; `tests/agent/P04.spec.ts`. | Ni izvedeno v specifikacijski fazi. |
| R03 | Statusni in datumski comparator. | Lasten test `status` in `dueDate` v obeh smereh. | `src/sortTasks.ts`; `tests/agent/P04.spec.ts`. | Ni izvedeno v specifikacijski fazi. |
| R04 | Obrat le rezultata izbranega ključa, stabilnost. | Test z več skupinami enakih ključev. | `src/sortTasks.ts`; `tests/agent/P04.spec.ts`. | Ni izvedeno v specifikacijski fazi. |
| R05 | Sekundarni ključ le po primarni enakosti, lastna smer. | Parametriziran test vseh sekundarnih ključev. | `src/sortTasks.ts`, `src/App.tsx`; `tests/agent/P04.spec.ts`. | Ni izvedeno v specifikacijski fazi. |
| R06 | Stabilni izvorni vrstni red po obeh izenačenih ključih; `original` vedno izvorno. | Test duplikatov, enakih ključev in `original`. | `src/sortTasks.ts`; `tests/agent/P04.spec.ts`. | Ni izvedeno v specifikacijski fazi. |
| R07 | Tabla ohrani tri stolpce in relativni vrstni red. | Test ID-jev po treh stolpcih tabele. | `src/TaskBoard.tsx`; `tests/agent/P04.spec.ts`. | Ni izvedeno v specifikacijski fazi. |
| R08 | Nastavitve preživijo preklop pogleda in podrobnosti. | Test štirih selectov ter ID-jev pred/po preklopih. | `src/App.tsx`; `tests/agent/P04.spec.ts`. | Ni izvedeno v specifikacijski fazi. |
| R09 | Menjava projekta in osvežitev resetirata; brez trajnega shranjevanja ali URL stanja. | Test menjave, osvežitve, `localStorage` in hasha. | `src/App.tsx`; `tests/agent/P04.spec.ts`. | Ni izvedeno v specifikacijski fazi. |
| R10 | Gumb resetira vse štiri kontrole; mejna projekta delujeta. | Test reset in parametrizirana testova za 0 in 1 opravilo. | `src/App.tsx`, `src/sortTasks.ts`; `tests/agent/P04.spec.ts`. | Ni izvedeno v specifikacijski fazi. |
| R11 | Razvrščanje je samo projekcija in ne zapisuje. | Primerjava podatkov ter zajem ne-GET zahtev. | `src/App.tsx`, `src/sortTasks.ts`; `tests/agent/P04.spec.ts`. | Ni izvedeno v specifikacijski fazi. |
| R12 | Enkratni ID-ji, prave podrobnosti, ohranjena dostopnost in prilagodljivost. | Skupni regresijski testi in lastni test enakih naslovov ter viewport 390 px. | `src/App.tsx`, `src/TaskBoard.tsx`; `tests/agent/P04.spec.ts`. | Ni izvedeno v specifikacijski fazi. |

Implementer mora po izvedbi posodaniti stolpec `Izid ter dokaz` z dejanskimi imeni testov in rezultatom ter po potrebi popraviti predvidene poti, če izbere drugačno minimalno izvedbo.

## Odprta vprašanja in omejitve

- Manjkajoči ali neveljavni datumi niso del obsega; končni testi uporabljajo veljavne koledarske datume.
- Pri izbiri odgovorne osebe so imena neprazna in različna od rezervirane vrednosti `all`.
- Ne širimo navigacij med nezaključenim nalaganjem ali sočasnih sprememb brez osvežitve.
- Ne dodajamo novih zapisovalnih API-jev; UI ne sme uporabljati `/__test/`.
- Strežnik, infrastruktura, odvisnosti, skupni tipi in skupni testi ostanejo nespremenjeni.
