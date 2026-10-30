# P07: Priljubljena opravila in trajna shramba

Različica specifikacije: 1.0. Vir zahtev: `task/instructions.md`; projektne meje določa `PROJECT_RULES.md`, ustava pa `.specify/memory/constitution.md`.

## Problem in kontekst

Folio že prikazuje projekte, preglednico, tablo in podrobnosti opravil prek obstoječega `/api/` vmesnika. Uporabnik potrebuje osebno izbiro priljubljenih opravil, ki je lokalna, trajna in ne spreminja podatkov na strežniku.

Cilj je dodati gumb za priljubljenost ob vsakem opravilu, filter po priljubljenih, števec, brisanje priljubljenih trenutnega projekta in zanesljivo shranjevanje v `localStorage`. Pri tem se ohranita potrjeni dizajn Folio in obstoječe delovanje nalaganja, navigacije, preglednice, table in podrobnosti.

## Vhodi, dejanja in izidi

### Vhodi

- `localStorage` ključ: `folio:favorites:v1`.
- Shranjeni zapis: JSON `{ "version": 1, "ids": [ID1, ID2, …] }`.
- `ids` so nizi; ob zapisu so enkratni in urejeni po UTF-16 kodnih enotah (`Array.prototype.sort()` privzeto uredi po UTF-16).
- Opravila so podatki iz obstoječega API-ja: `id`, `projectId`, `title`, `description`, `status`, `assignee`, `dueDate`. Polja opravil se ne shranjujejo med priljubljene.

### Dejanja

- **Preklop priljubljenega:** gumb `Priljubljeno opravilo <id>` spremeni pripadnost samo tega ID-ja.
- **Filter:** checkbox `Prikaži le priljubljena` prikaže samo priljubljena opravila trenutnega projekta v izvornem vrstnem redu.
- **Brisanje:** gumb `Odstrani priljubljene tega projekta` odstrani samo ID-je opravil celotnega trenutnega projekta.
- **Zunanja sprememba:** dogodek `storage` za pravi ključ takoj prevzame novo vrednost, ne sproži povratnega zapisa in ignorira druge ključe.

### Izidi

- Stanje priljubljenih je globalna množica ID-jev, prikaz in filter pa sta vezana na trenutni projekt.
- Neveljaven ali manjkajoč shranjeni zapis ne povzroči odpovedi aplikacije in se ob nalaganju ne prepisuje.
- Ob nedostopni shrambi aplikacija ohrani stanje v pomnilniku in prikaže opozorilo z besedo `shramba`.
- Priljubljeni ne povzročijo nobenega zapisovalnega API-klica in ne spremenijo nobenega polja opravila.

## Zahteve in pravila

### Pravila stanja in spremembe stanja

Naj bo `F ⊆ String` globalna množica priljubljenih ID-jev, `P` množica ID-jev vseh opravil trenutnega projekta, `T` seznam opravil trenutnega projekta v vrstnem redu API-ja in `q ∈ {false, true}` stanje filtra.

| Simbol | Pomen |
| --- | --- |
| `F` | Globalna množica vseh priljubljenih ID-jev, vključno z neznanimi ID-ji. |
| `P` | Množica ID-jev vseh naloženih opravil trenutnega projekta. |
| `T` | Seznam opravil trenutnega projekta v izvornem vrstnem redu. |
| `q` | `false` pomeni vse, `true` pomeni le priljubljene trenutnega projekta. |

#### Branje in veljavnost

- `parse(value)` je velik le, če je JSON dekodiran v objekt z `version === 1` in `ids`, ki je tabela, v kateri je vsak element niz. Vsi veljavni ID-ji se pretvorijo v množico; podvojeni ID-ji pomenijo enega.
- Manjkajoč ključ, neveljaven JSON, napačna `version`, manjkajoči `ids` ali katerikoli neniz v `ids` pomeni `F = ∅`. Neznani ID-ji so veljavni in ostanejo v `F`.
- Ob zagonu se `q` nastavi na `false`. Neveljaven ali manjkajoč zapis se takoj ne prepisuje.
- Napaka pri branju shrambe pomeni začetni `F = ∅`, prikazano opozorilo o nedostopni shrambi in delujočo aplikacijo.

#### Zapis

- `serialize(F)` zapiše samo `{ "version": 1, "ids": [...F] }`; ID-ji so razvrščeni po UTF-16.
- `toggle(id)`: če je `id ∈ F`, potem `F′ = F \ {id}`; sicer `F′ = F ∪ {id}`. Vmesno stanje se posodobi tudi, če zapis v shrambo vrže izjemo, nato se prikaže opozorilo o nedostopni shrambi.
- `clearCurrentProject()`: `F′ = F \ P`. ID-ji drugih projektov in neznani ID-ji ostanejo.
- Gumb za brisanje je onemogočen, ko je `F ∩ P = ∅`.
- Dogodek `storage` se upošteje le za ključ `folio:favorites:v1`. Njegova vrednost se validira z istim pravilom kot ob nalaganju; `null` pomeni `F = ∅`. Dogodek ne kliče zapisnalne funkcije.

#### Prikaz in štetje

- Prikazani seznam je `D = q ? [t ∈ T : t.id ∈ F] : T`, pri čemer se ohrani vrstni red `T`.
- `q` je privzeto `false`, ob menjavi projekta se ponastavi na `false`, ob osvežitvi pa ostane `false`.
- Preglednica in tabla uporabljata isti `F` in isti `q`; preklop pogleda ne spremeni nobenega od njiju.
- Podrobnosti ostanejo dostopne po ID-ju iz povezave, ne po naslovu.
- Števec priljubljenih kaže vedno `Priljubljeno: X od M.`, kjer je `X = |F ∩ P|` in `M = |P|`, tudi ko je filter aktiven.
- Števci stolpcev table štejejo vidna opravila po stanju, torej `|{t ∈ D : status(t) = s}|`.

### Funkcionalne zahteve

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Vsako opravilo v preglednici in na tabli ima svoj gumb `Priljubljeno opravilo <id>` z `aria-pressed`. Klik spremeni samo tisti ID, ne odpre podrobnosti in enaki naslovi ostanejo neodvisni. | Preskus klica po ID-ju v obeh pogledih, preverjanje `aria-pressed`, URL in podrobnosti. |
| R02 | Zapis v `localStorage` pod `folio:favorites:v1` ima `version: 1` in `ids` z enkratnimi nizi, urejenimi po UTF-16. Polja opravil se ne zapisujejo. | Enotski presuski serialize/parse in branje shranjene vrednosti. |
| R03 | Osvežitev obnovi shranjene ID-je. Podvojeni se štejejo enkrat; neznani se ohranijo, ne ustvarijo pa opravil. | Preskus s podvojenimi in neznanimi ID-ji ter ponovnim nalaganjem. |
| R04 | Manjkajoč ključ, neveljaven JSON, napačna `version`, manjkajoči `ids` ali neniz v `ids` pomeni prazno množico, brez odpovedi in brez prepisa ob nalaganju. | Parametrizirani negativni presusi validacije in vrednosti v shrambi. |
| R05 | Checkbox `Prikaži le priljubljena` pokaže samo priljubljena opravila trenutnega projekta v izvornem vrstnem redu; privzeto ni izbran. | Preskus vrstnega reda, vsebine in privzetega stanja. |
| R06 | Med aktivnim filtrom odstranitev priljubljenega takoj skrije opravilo. Brez rezultatov se prikaže `Ni priljubljenih opravil.` in filter ostane mogoče izklopiti. | Presusisa praznega rezultata in takojšnje spremembe prikaza. |
| R07 | Preglednica in tabla imata isti `F` in `q`; preklop ne izgubi sprememb. Podrobnosti se odprejo po pravilnem ID-ju. | Presusisi preklopa pogledov, stanja in podrobnosti. |
| R08 | Menjava projekta ohrani globalni `F`, ponastavi `q` na `false`; osvežitev obnovi `F`, `q` pa je `false`. | Presusisi menjave projekta in osvežitve. |
| R09 | `Odstrani priljubljene tega projekta` odstrani samo ID-je iz `P`; drugi in neznani ID-ji ostanejo. Gumb je onemogočen, če v `P` ni priljubljenih. | Presusisi ostanka ID-jev in onemogočenega gumba. |
| R10 | Števec vedno kaže `Priljubljeno: X od M.` za celoten trenutni projekt; števci stolpcev table štejejo vidna opravila. | Presusisi števce z in brez filtra ter s praznimi stolpci. |
| R11 | `storage` za pravi ključ takoj prevzame novo vrednost po istih pravilih; `null` izprazni, drug ključ se ignorira, povratni zapis ni. Izjema shrambe pusti aplikacijo uporabno in prikaže opozorilo z besedo `shramba`. | Presusisi dogodkov, drugih ključev, neveljavnih vrednosti in napak shrambe. |
| R12 | Priljubljeni so samo lokalni: ni novih zapisovalnih API-klicev, polja opravil se ne spremenijo. Ohranijo se Folio, nalaganje, navigacija in ozki prikaz. | API-števec, primerjava podatkov, regresijski in ozki prikaz na 390 px. |

## Izvedba in sledljivost

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | Vsako opravilo ima gumb po ID z `aria-pressed` in ne odpre podrobnosti. | `tests/agent/p07.spec.ts:3` | `src/App.tsx:65`, `src/TaskBoard.tsx:44` | Pass. |
| R02 | Zapis je `{version:1,ids:[...]}` z enkratnimi nizi v UTF-16 vrstnem redu. | `tests/agent/p07.spec.ts:3` | `src/favorites.ts:1`, `src/useFavorites.ts:1` | Pass. |
| R03 | Osvežitev obnovi ID-je, podvojene šteje, neznane ohrani. | `tests/agent/p07.spec.ts:3`, `tests/agent/p07.spec.ts:22` | `src/favorites.ts:5`, `src/useFavorites.ts:1` | Pass. |
| R04 | Neveljaven zapis ne pomeni odpovedi in se ne prepiše. | `tests/agent/p07.spec.ts:22` | `src/favorites.ts:5`, `src/useFavorites.ts:8` | Pass. |
| R05 | Filter pokaže le priljubljene trenutnega projekta v izvornem vrstnem redu. | `tests/agent/p07.spec.ts:31` | `src/App.tsx:23`, `src/App.tsx:54` | Pass. |
| R06 | Prazna filtrirana množica v preglednici in na tabli pokaže `Ni priljubljenih opravil.` ter omogoči izklop filtra. | `tests/agent/p07.spec.ts:31` in `tests/agent/p07.spec.ts:44` | `src/App.tsx:60` | Pass. |
| R07 | Preglednica in tabla imata isti stanje in filter. | `tests/agent/p07.spec.ts:31` | `src/App.tsx:23`, `src/TaskBoard.tsx:1` | Pass. |
| R08 | Menjava projekta ohrani globalno množico in ponastavi filter. | `tests/agent/p07.spec.ts:31` | `src/App.tsx:80`, `src/useFavorites.ts:1` | Pass. |
| R09 | Brisanje odstrani samo ID-je trenutnega projekta. | `tests/agent/p07.spec.ts:31` | `src/App.tsx:56`, `src/useFavorites.ts:37` | Pass. |
| R10 | Števec in stolpci štejejo pravilno. | `tests/agent/p07.spec.ts:31`, `tests/agent/p07.spec.ts:57` | `src/App.tsx:22`, `src/App.tsx:24`, `src/TaskBoard.tsx:20` | Pass. |
| R11 | Dogodek `storage` se posodobi brez povratnega zapisa, drugi ključi se ignorirajo. | `tests/agent/p07.spec.ts:57`, `tests/agent/p07.spec.ts:85` | `src/useFavorites.ts:16`, `src/favorites.ts:5` | Pass. |
| R12 | Priljubljeni so lokalni, brez API zapisov in z ozkim prikazom. | `tests/agent/p07.spec.ts:3`, `tests/agent/p07.spec.ts:31`, `tests/agent/p07.spec.ts:85` | `src/App.tsx:54`, `src/styles.css:1` | Pass. |

## Odprta vprašanja in omejitve

- Ni odprtih vprašanj, ki bi zahtevala uporabniško odločitev; vse relevantne podrobnosti določajo izvirne zahteve.
- Specifikacija ne dodaja novih zapisovalnih API-jev, zunanjih meritev, odvisnosti ali infrastrukturnih sprememb.
- Končna veljavnost bo odvisna od dejavno izvedenih testov v kasnejših korakih; trenutna faza ne sme rezultata prikazati kot preverjenega.
