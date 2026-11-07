# P07 – razvojna specifikacija (postopek A, en agent)

## Problem in kontekst

Folio trenutno prikazuje opravila projekta v preglednici in na tabli, bere jih
iz javnega API-ja (`/api/`) in ne ponuja označevanja opravil kot priljubljenih.
Uporabnik želi med sejo označiti opravila kot priljubljena, filtrirati pogled
na priljubljena opravila trenutnega projekta, počistiti priljubljene tega
projekta in obdržati izbiro po osvežitvi strani. Shramba je `localStorage`
pod ključem `folio:favorites:v1`; vse ostane lokalno v brskalniku, brez
zapisov na API.

## Vhodi, dejanja in izidi

- Vhodni podatki: obstoječi tipi `Project`/`Task` iz `shared/types.ts`, brani
  prek `/api/projects` in `/api/projects/:id/tasks`; shranjeni zapis
  `{version: 1, ids: string[]}` v `localStorage`.
- Dejanja: klik gumba `Priljubljeno opravilo <id>` (preklop enega ID-ja),
  vklop/izklop potrditvenega polja `Prikaži le priljubljena`, klik gumba
  `Odstrani priljubljene tega projekta`, dogodek `storage` za pravi ključ.
- Uspeh: množica priljubljenih se posodobi v pomnilniku in (za uporabniška
  dejanja) zapiše v `localStorage`; pogled se takoj uskladi; opravila in
  API ostanejo nedotaknjeni.
- Napaka shrambe (branje/zapis vrže izjemo): aplikacija ostane uporabna s
  stanjem v pomnilniku in prikaže opozorilo `role=alert` z besedo "shramba".
- Preklic: klik na že priljubljeno opravilo ga odstrani; izklop filtra
  ponovno prikaže vsa opravila projekta.

## Zahteve in pravila

Simboli: `F` = množica priljubljenih ID-jev (normalizirana), `P` = opravila
trenutnega projekta v izvornem vrstnem redu, `f` = stanje filtra
(`Prikaži le priljubljena`), `vis = f ? [t ∈ P : t.id ∈ F] : P`.
`norm(X) = sort_utf16(unique(X))` – enkratni nizi, razvrščeni po UTF-16.
Predpostavke: ID-ji opravil so enkratni; vsako opravilo pripada svojemu
projektu; shramba je lahko nedosegljiva ali pokvarjena.

Splošna pravila:

- `zapis(F) = {version: 1, ids: norm(F)}`; ob zapisu se polja opravil ne
  zapišejo (R02).
- `beri(raw) = []`, če `raw` ni JSON objekt z `version === 1` in `ids`, kjer
  je vsak element niz; sicer `norm(ids)` (R03, R04).
- Ob nalaganju se shramba samo bere, nikoli ne prepiše (R04).
- Dogodek `storage` s pravim ključem nastavi `F := beri(newValue)` (null
  izprazni) in ne zapiše nazaj; drug ključ se ignorira (R11).

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Za vsako `t ∈ P` v preglednici in na tabli obstaja gumb z dostopnim imenom `Priljubljeno opravilo <t.id>` in `aria-pressed = (t.id ∈ F)`; klik spremeni le `F` za `t.id`, ne odpre podrobnosti; enaki naslovi se ne povežejo. | Razvojna D01, agentni test neodvisnosti gumbov |
| R02 | Po vsakem uporabniškem preklopu velja `localStorage[folio:favorites:v1] = JSON(zapis(F))`; `norm` deduplicira in sortira po UTF-16; zapis ne vsebuje polj opravil. | Agentni test zapisa + branje shrambe |
| R03 | Ob nalaganju `F = beri(raw)`; podvojeni ID-ji se združijo, neznani ostanejo v `F`, neznana opravila se ne prikažejo. | Agentni test semena shrambe |
| R04 | Manjkajoč ključ, neveljaven JSON, `version ≠ 1`, manjkajoč `ids` ali ne-niz v `ids` → `F = []`; aplikacija se naloži in shrambe ne prepiše. | Agentni test neveljavnih zapisov |
| R05 | `f` je privzeto `false`; ko je `f = true`, je prikazan natanko `vis` v izvornem vrstnem redu. | Agentni test filtra |
| R06 | Odstranitev priljubljenega pri `f = true` takoj posodobi `vis`; če je `vis = []`, je prikazano `Ni priljubljenih opravil.` in potrditveno polje ostane uporabno. | Razvojna D02, agentni test |
| R07 | Preglednica in tabla prebereta isti `F` in isti `f`; preklop pogleda ohrani oboje; podrobnosti se odprejo po ID-ju ne glede na `F`. | Razvojna D04, agentni test parnosti pogledov |
| R08 | Menjava projekta ohrani `F`, nastavi `f := false`; osvežitev obnovi `F` iz shrambe in `f := false`. | Agentni test projektov in osvežitve |
| R09 | `Odstrani priljubljene tega projekta` izvede `F := F \ {t.id : t ∈ P}`; gumb je onemogočen, ko `F ∩ {t.id : t ∈ P} = ∅`. | Agentni test |
| R10 | Element `role=status` z `aria-label="Število priljubljenih"` vedno kaže `Priljubljeno: X od M.`, `X = |{t ∈ P : t.id ∈ F}|`, `M = |P|`, tudi ko je `f = true`; števci stolpcev table štejejo `vis` po stolpcih. | Agentni test števcev |
| R11 | Dogodek `storage` za `folio:favorites:v1` takoj nastavi `F = beri(newValue)`; `newValue = null` → `[]`; drug ključ se ignorira; dogodek ne sproži zapisa. Ob izjemi branja/zapisa ostane aplikacija uporabna v pomnilniku in prikaže `role=alert` z "shramba". | Agentni test dogodkov in izjem |
| R12 | Noben preklop ne pošlje zahteve, ki ni GET, in ne spremeni polj opravila; ohranjeni so videz Folio, nalaganje, navigacija in ozki prikaz (brez vodoravnega razširjanja strani). | Razvojna D04 (`readonly`), agentni test brez zapisov |

## Izvedba in sledljivost

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | gumbi z `aria-pressed`, ločeni od povezave | D01; agentni A01 | `src/TaskBoard.tsx`, `src/App.tsx` (preglednica) | glej `docs/agent/verification.md` |
| R02 | zapis `{version:1, ids:norm}` | agentni A02 | `src/favorites.ts` (`writeStored`) | glej `docs/agent/verification.md` |
| R03 | dedupe + ohranitev neznanih | agentni A03 | `src/favorites.ts` (`parseFavorites`) | glej `docs/agent/verification.md` |
| R04 | neveljaven zapis → prazno, brez prepisa | agentni A04 | `src/favorites.ts` (`parseFavorites`, `readStored`) | glej `docs/agent/verification.md` |
| R05 | filter v izvornem vrstnem redu | agentni A05 | `src/App.tsx` (`ProjectView`) | glej `docs/agent/verification.md` |
| R06 | takojšnja odstranitev, prazno sporočilo | D02; agentni A06 | `src/App.tsx` | glej `docs/agent/verification.md` |
| R07 | parnost pogledov, podrobnosti po ID | D04; agentni A07 | `src/App.tsx`, `src/TaskBoard.tsx` | glej `docs/agent/verification.md` |
| R08 | projekt ohrani `F`, ponastavi `f` | agentni A08 | `src/App.tsx` (`key={project.id}`), `src/favorites.ts` | glej `docs/agent/verification.md` |
| R09 | čiščenje samo ID-jev projekta | agentni A09 | `src/App.tsx`, `src/favorites.ts` (`removeProject`) | glej `docs/agent/verification.md` |
| R10 | `Priljubljeno: X od M.` | agentni A10 | `src/App.tsx` | glej `docs/agent/verification.md` |
| R11 | `storage` sinhronizacija, izjeme | agentni A11, A12 | `src/favorites.ts` (`useFavorites`) | glej `docs/agent/verification.md` |
| R12 | ni zapisov, ohranjen videz | D04 `readonly`; agentni A13 | `src/favorites.ts`, `src/App.tsx` | glej `docs/agent/verification.md` |

## Zgodovina sprememb specifikacije

- 2026-10-30, v1: začetna specifikacija pred implementacijo (R01–R12).
- 2026-10-30, v1.1: po implementaciji dopolnjeno: filter je stanje
  `ProjectView`, ki se ob menjavi projekta ponovno vzpostavi (`key`), zato je
  R08 izpolnjen brez dodatnega učinka; neznani ID-ji se ohranijo tudi pri
  zapisu ob preklopu (potrjeno z A03/A09).
- 2026-10-30, v1.2: popravek med preverjanjem: zapis v shrambo se izvede
  natanko enkrat na uporabniško dejanje (uporabljeno zrcalo zadnjega stanja v
  `useFavorites`, ne stranski učinek v posodabljalniku `useState`); brez tega
  je razvojni način React zaradi dvojnega klica posodabljalnika zapisal dvakrat.

## Odprta vprašanja in omejitve

- Končni (skriti) testi naloge niso dostopni; tu so navedena le dejansko
  izvedena preverjanja.
- Razporeditev novih kontrol ni predpisana; izbrana je vrstica v glavi
  razdelka Opravila, ki se na ozkih zaslonih prelomi.
- Dogodek `storage` v istem dokumentu brskalnik ne sproži sam; preverjen je
  z ročno sproženim `StorageEvent`, kot bi prišel iz drugega zavihka.
