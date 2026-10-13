# P08 — Koledarski pregled rokov

## Problem in kontekst

Folio omogoča izbiro med projekti, pregled opravil v preglednici ali tabli in
odpiranje podrobnosti. Uporabnik potrebuje koledarski pregled rokov glede na
referenčni datum, ne glede na trenutno uro naprave. Dopolnitev mora ohraniti
slovenska poimenovanja, potrjeni dizajn Folio, obstoječo navigacijo in javni
API `/api/`.

## Vhodi, dejanja in izidi

- Podatkovna polja: `Task.id`, `Task.projectId`, `Task.status` in
  `Task.dueDate`; izbira projekta po `Project.id`. Pregled doda izvorno polje
  `Referenčni datum` (`input type="date"`) in izbirnik `Pogled rokov`
  (`select`) z vrednostmi `all/overdue/today/week/later/done`.
- Ob začetku prikaza projekta sta referenčni datum `2026-09-21` in pogled rokov
  `all`. Novi stanji se hranita samo v trenutnem pomnilniškem stanju aplikacije.
- Veljaven vnos datuma takoj preračuna skupine in prikaz. Neveljaven ali
  prazen vnos prikaže `Vnesi veljaven referenčni datum.`, ohrani zadnji
  veljaven preračun in ne izgubi izbrane skupine.
- Menjava projekta ali osvežitev strani ponastavita referenčni datum in pogled
  rokov na začetni vrednosti. Filter se ne zapisuje v URL, lokalno ali drugo
  trajno shrambo.
- Pregled ne pošilja zapisov na API, ne spreminja podatkov in ne kliče kontrol
  `/__test/`. Obstoječi bralni API in podrobnosti ostanejo nespremenjeni.

## Pravila skupin in sprememb stanja

Za opravilo `task` in referenčni datum `ref` velja:

- `group(task, ref) = done`, če je `task.status = done`.
- Sicer za odprto opravilo velja:
  - `overdue`, če je `task.dueDate < ref`;
  - `today`, če je `task.dueDate = ref`;
  - `week`, če je `ref + 1 dan <= task.dueDate <= ref + 7 dni`;
  - `later`, če je `task.dueDate > ref + 7 dni`.
- Skupine so paroma disjunktne in za dan projekt pokrivijo vsa opravila.
- `all` vsebuje vsa opravila trenutnega projekta v izvornem vrstnem redu;
  ostale vrednosti izbirnika prikazujejo samo pripadajočo skupino.
- Števci so vedno izračunani iz celotnega seznama opravil trenutnega projekta.
  Aktivni filter vpliva samo na prikaz, ne na števce ali podatke.
- `ref + n dni` je koledarsko seštevanje na nizih `YYYY-MM-DD`, brez ure,
  brez časovnega pasu in brez poletnega časa. Preskusiti je prehode mesecev,
  let in prestopni februar.
- Veljavna sprememba referenčnega datuma ohrani izbrano skupino. Sprememba
  skupine ohrani referenčni datum in besedilo datumskega polja. Preklop med
  preglednico in tablo ohrani datum, besedilo polja in izbrano skupino.
- Menjava projekta ali osvežitev zamenja trenutno stanje z začetnim stanjem:
  `ref = 2026-09-21`, `group = all`.
- Prazen projekt ima pet števcev z vrednostjo `0`. Prazna izbrana skupina v
  nepraznem projektu prikaže `Ni opravil v izbrani skupini.` in omogoči
  preklop na drugo skupino ali `all`.

## Zahteve in pravila

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Ob vsakem začetku projekta sta datum `2026-09-21` in pogled `all`. Ura naprave ne vpliva. | Nastavi sistemsko/napravo uro na drugo uro in odpri projekt. |
| R02 | `status=done` vedno pomeni `done`; ne šteje v `overdue/today/week/later`. | Uporabi končano opravilo z roki pred, na in po referenčnem datumu. |
| R03 | Za odprto opravilo je `dueDate < ref` → `overdue`, `dueDate = ref` → `today`. | Primerjaj obmejna primera rokov. |
| R04 | `ref+1` do `ref+7` → `week`, pozneje → `later`; skupine so popolne in disjunktne. | Preveri meje `+1`, `+7`, `+8` in vse skupine. |
| R05 | Datumski račun je koledarski `YYYY-MM-DD`, brez ure, pasu in poletnega časa. | Preskusni preklope mesec, leto in prestopni februar. |
| R06 | Števci prikazujejo pet števil za celoten trenutni projekt; filter jih ne spremeni. | Zapolni vseh pet stanj, preklopi vsako skupino in primerjaj števce. |
| R07 | Izbirnik prikaže `all` ali natanko eno skupino v izvornem vrstnem redu, brez spremembe podatkov. | Preveri ID-je pred in po preklopu skupin. |
| R08 | Veljaven datum takoj preračuna prikaz in ohrani filter; prazen/neveljaven prikaže opozorilo in zadnji veljaven preračun; veljaven vnos odstrani opozorilo. | Vnesi zaporedoma neveljaven/prazen in veljaven datum. |
| R09 | Preglednica in tabla prikazujeta iste filtrirane ID-je; preklop ohrani datum, besedilo polja in izbrano skupino. | Primerjaj ID-je, vrednosti kontrol in filter pred/po preklopu. |
| R10 | Menjava projekta in osvežitev ponastavita datum ter `all`; filtrna stanja niso v URL-ju ali trajni shrambi. | Preklopi projekt, osveži in preveri URL/localStorage. |
| R11 | Prazen projekt da pet ničel; prazna skupina v nepraznem projektu da navedeno sporočilo in omogoča preklop. | Uporabi prazen projekt in vsako prazno skupino. |
| R12 | Podatkovni datumi so veljavni `YYYY-MM-DD`; pregled ne pošilja zapisov, obstoječa polja in bralne podrobnosti ostanejo nespremenjeni. | Preveri omrežne zahteve, prestopne datume in obstoječe poglede. |

## Dogovor o vmesniku

- Datum ima oznako `Referenčni datum`, izbirnik pa `Pogled rokov`.
- Pet števcev ima `aria-label="Število rokov <ključ>"` in vsebuje samo številsko vrednost. Imena skupin so `Zapadlo`, `Danes`, `Naslednjih 7 dni`, `Pozneje` in `Končano`.
- Neveljaven ali prazen datum prikaže `role="alert"` z besedilom `Vnesi veljaven referenčni datum.`
- Ohranijo se `data-task-id` na vrsticah in karticah, dostopna imena obstoječih pogledov in stolpcev ter `aria-label="Pregled stanj opravil"`.
- Nova dejanja ob opravilu so izven njegove povezave. Na širini 390 px se cela stran ne razširi; preglednica in tabla smeta drseti znotraj svojega prikaza. Fokus s tipkovnico ostane viden.

## Izvedba in sledljivost

| Zahteva | Pogoj | Načrtovan test ali scenarij | Načrtovana datoteka in del kode | Izid |
| --- | --- | --- | --- | --- |
| R01–R05 | Referenčni datum, koledarski dnevi in popolne disjunktne skupine | Enotski ali komponentni testi klasifikacije z mejami | `src/App.tsx` ali pomožni koledarski modul; `tests/agent/P08.spec.ts` | Ni še izvedeno v tej fazi |
| R06–R07 | Števci celotnega projekta in prikaz filtrirane skupine | UI test z vsemi skupinami in preklopi | `src/App.tsx`; `tests/agent/P08.spec.ts` | Ni še izvedeno v tej fazi |
| R08–R09 | Ohranitev stanja ob vnosu in preklopu pogleda | UI test neveljavnega/praznega vnosa ter obeh pogledov | `src/App.tsx`; `src/TaskBoard.tsx`; `tests/agent/P08.spec.ts` | Ni še izvedeno v tej fazi |
| R10–R11 | Ponastavitev in prazna stanja | UI test menjave projekta, osvežitve ter praznega projekta/skupine | `src/App.tsx`; `tests/agent/P08.spec.ts` | Ni še izvedeno v tej fazi |
| R12 | Nespremenjen bralni API, polja in dostopnost | UI test omrežja, podrobnosti, `data-task-id`, 390 px in obstoječih imen | `src/App.tsx`; `src/TaskBoard.tsx`; `tests/agent/P08.spec.ts` | Ni še izvedeno v tej fazi |

## Uspešna uporabniška pot

1. Uporabnik odpre projekt. Vidi datum `2026-09-21`, pogled `all`, pet števcev in obstoječo vsebino.
2. Uporabnik vpiše drug veljaven referenčni datum. Števci, izbrana skupina in vidni seznami se takoj uskladijo.
3. Uporabnik izbere eno od skupin. Vidi samo njena opravila v izvornem vrstnem redu; števci se ne spremenijo.
4. Uporabnik preklopi med preglednico in tablo. ID-ji ostanejo isti, kontrolne vrednosti pa se ohranijo.
5. Uporabnik vpiše prazen ali neveljaven datum. Vidi opozorilo, prejšnji preračun ostane aktiven, naslednji veljaven datum pa opozorilo odstrani.

## Odprta vprašanja in omejitve

- Ni zunanjih meritev, dodatnih funkcionalnih zahtev ali sprememb odvisnosti.
- Končni skriti testi in rezultati izvedbe v tej fazi še niso na voljo; zato izidi niso označeni kot uspešni.
- Če testni podatki vsebujejo enake naslove ali poljubno število opravil, mora razvrščanje ostati po izvornem vrstnem redu in identificirati zapise po `id`.
- Neobdelana stanja nalaganja in sočasne spremembe podatkov brez osvežitve niso dodana k obstoječi regresijski zahtevi.
