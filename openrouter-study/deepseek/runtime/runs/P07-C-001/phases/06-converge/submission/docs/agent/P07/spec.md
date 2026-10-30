# Specifikacija P07 — Priljubljena opravila in trajna shramba

Različica 1.0. Izvirne zahteve R01–R12 so v `task/instructions.md` in so merilo; ta specifikacija jih
povzema po skupni predlogi (`task/specification-template.md`) in jih veže na pogoje, kodo in testne dokaze.
Povezave: `docs/dizajn.md` (potrjeni videz Folio), `.specify/memory/constitution.md` (projektna pravila),
`plan.md` in `tasks.md` (nastaneta v naslednjih korakih; ta specifikacija se nanju sklicuje, vsebine ne podvaja).

## Problem in kontekst

Uporabnik v aplikaciji Folio želi označevati priljubljena opravila in prikaz omejiti nanje. Aplikacija je React
odjemalec, ki podatke bere iz javnega API-ja `/api/`; stanje priljubljenih je novo, lokalno in trajno v
`localStorage`, brez sprememb strežnika, odvisnosti in skupnih tipov. Ohranjata se nalaganje, navigacija in
potrjeni dizajn Folio (lebdeči meni, modri poudarki, slovenska poimenovanja).

## Vhodi, dejanja in izidi

Vhodna polja (nespremenjeni tipi iz `shared/types.ts`): `Task {id, projectId, title, description, status,
assignee, dueDate}`, `Project {id, name}`. Nova stanja: globalna množica priljubljenih `F` (nizi ID-jev,
trajna v `localStorage`) in filter `f` (bool, privzeto `false`). Trenutni projekt `p`, opravila projekta `T_p`.

Dejanja: klik `Priljubljeno opravilo <id>`; preklop `Prikaži le priljubljena`; klik `Odstrani priljubljene tega
projekta`; menjava projekta; preklop pogleda preglednica/tabla; dogodek `storage`; osvežitev strani; branje in
zapis shrambe.

Izidi: posodobljena `F` in/ali `f`; posodobljen prikaz (vrstice/kartice, števci, sporočila); ob spremembi `F`
zapis v shrambo (razen ob dogodku `storage`). Napake: neveljaven zapis pomeni prazno začetno množico brez
prepisa shrambe; izjema branja/zapisa pomeni uporabno aplikacijo v pomnilniku in opozorilo o nedostopni shrambi.

## Zahteve in pravila

Simboli: `F` — globalna množica priljubljenih ID-jev; `f` — filter; `p` — trenutni projekt; `T_p` — opravila
projekta `p`; `V_p` — vidna opravila = `f ? [t ∈ T_p : t.id ∈ F] : T_p` (izvorni vrstni red); `△` — simetrična
razlika. Zapis shrambe: JSON `{version:1, ids:[...]}`; veljaven je natanko takrat, ko je `version === 1` in je
`ids` polje nizov (vsak element `typeof === "string"`); sicer velja `F := ∅`. `norm(X)` = enkratne vrednosti
`X`, razvrščene po UTF-16. Predpostavke: vsako opravilo pripada svojemu projektu; podatki so poljubni veljavni
primeri opisane domene (tudi 0, 1 ali >10 opravil, enaki naslovi, drugačno zaporedje, Unicode).

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Za vsako opravilo `t` v preglednici in tabli obstaja ločen gumb z dostopnim imenom `Priljubljeno opravilo <t.id>` in atributom `aria-pressed`; klik izvede `F := F △ {t.id}` in ne odpre podrobnosti; opravila z enakim naslovom ostanejo neodvisna (stanje vezano na `id`). | Lastni testi: klik, `aria-pressed`, enaki naslovi; gumb zunaj povezave. |
| R02 | Ob vsaki spremembi `F` se zapiše `localStorage["folio:favorites:v1"] = JSON {version:1, ids: norm(F)}`; `norm` vrne enkratne nize, razvrščene po UTF-16; polja opravil se ne zapišejo. | Lastni testi: branje shrambe po klikih; preveritev ključa, razvrstitve in vsebine. |
| R03 | Ob osvežitvi: `F := norm(ids)` iz veljavnega zapisa; podvojeni ID-ji veljajo kot en, trenutno neznani ID-ji se ohranijo (za druge projekte), izmišljena opravila se ne ustvarijo. | Lastni testi: zapis s podvojenimi in neznanimi ID-ji, osvežitev. |
| R04 | Manjkajoč ključ ∨ neveljaven JSON ∨ `version ≠ 1` ∨ manjkajoč `ids` ∨ ∃ x ∈ ids: `typeof x ≠ "string"` ⇒ `F := ∅`; aplikacija se naloži in ob nalaganju sama ne prepiše shrambe. | Lastni testi: po en scenarij za vsak neveljaven zapis; shramba po nalaganju nespremenjena. |
| R05 | `f = true` ⇒ `V_p = [t ∈ T_p : t.id ∈ F]` v izvornem vrstnem redu; privzeta vrednost `f` je `false`. | Lastni testi: privzeti prikaz, vklop/izklop filtra, vrstni red. |
| R06 | Odstranitev priljubljenega med `f = true` takoj odstrani opravilo iz `V_p`; ko je `V_p = ∅`, se prikaže `Ni priljubljenih opravil.` in kontrole omogočajo izklop filtra. | Lastni testi: odstranitev pod filtrom; prazen izid in sporočilo; izklop filtra. |
| R07 | Preglednica in tabla uporabljata isto `F` in `f`; preklop pogleda ne spremeni stanja; podrobnosti so dostopne po pravilnem `id`. | Lastni testi: preklop pogleda po spremembah; odpiranje podrobnosti. |
| R08 | Menjava projekta ohrani `F` in nastavi `f := false`; osvežitev obnovi `F` iz shrambe, `f` pa je `false`. | Lastni testi: menjava projekta, osvežitev. |
| R09 | Klik `Odstrani priljubljene tega projekta` ⇒ `F := F \ {t.id : t ∈ T_p}`; ID-ji drugih projektov in neznani ID-ji ostanejo; če `F ∩ {t.id : t ∈ T_p} = ∅`, je gumb onemogočen. | Lastni testi: mešana množica, tuji/neznani ID-ji, onemogočen gumb. |
| R10 | Element vedno kaže `Priljubljeno: X od M.`, kjer je `X = |{t ∈ T_p : t.id ∈ F}|` in `M = |T_p|`, neodvisno od `f`; števci stolpcev table štejejo vidna opravila. | Lastni testi: besedilo ob vključenem/izključenem filtru; števci stolpcev. |
| R11 | Dogodek `storage` s ključem `folio:favorites:v1` takoj uskladi `F` z novo vrednostjo po pravilih R03/R04 (`null` ⇒ `∅`); drug ključ se ignorira; dogodek ne sproži povratnega zapisa; izjema branja/zapisa ⇒ aplikacija uporabna v pomnilniku in opozorilo z `role=alert`, ki vsebuje besedo `shramba`. | Lastni testi: dogodek storage (veljavna/neveljavna vrednost, drug ključ), simulirana izjema. |
| R12 | Spremembe priljubljenih ne kličejo API-ja in ne spreminjajo polj opravil; ohranjeni so Folio, nalaganje, navigacija in ozki prikaz (pri širini 390 px se stran ne razširi; notranje drsenje preglednice in table je dovoljeno). | Skupni testi (`tests/baseline.spec.ts`, `tests/api.spec.ts`) + lastni testi: omrežni dnevnik brez zapisov, obstoječe oznake in videz. |

Dogovor o vmesniku (iz `task/instructions.md`): gumbi `Priljubljeno opravilo <id>` z `aria-pressed=true/false`,
postavljeni ločeno od povezave opravila; checkbox `Prikaži le priljubljena`; gumb `Odstrani priljubljene tega
projekta`; element `role=status`, `aria-label=Število priljubljenih`, besedilo `Priljubljeno: X od M.`; napaka
shrambe ima `role=alert` in vsebuje besedo `shramba`. Ohranjeni so `data-task-id` na vrsticah in karticah,
dostopna imena obstoječih pogledov in stolpcev ter `aria-label="Pregled stanj opravil"`. Besedilo, ki ni
izrecno določeno, in razporeditev novih kontrol nista predpisana.

## Izvedba in sledljivost

Izidi so vpisani po dejanskem zagonu 2 (`npm run check`); koraki in datoteke so v `plan.md` in `tasks.md`,
dokazi in omejitve pa v `verification.md`.

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | Gumb z `aria-pressed` ob vsakem opravilu; klik preklopi samo ta `id` | „R01: gumbi preklapljajo samo svoj id …“, „R01: enaki naslovi ostanejo neodvisni“ | `src/FavoriteButton.tsx`, `src/App.tsx`, `src/TaskBoard.tsx` | uspešno — zagon 2 |
| R02 | Zapis `{version:1, ids: norm(F)}` pod `folio:favorites:v1` | „R02: zapis je {version:1, ids} …“ | `src/favorites.ts`, `src/useFavorites.ts` | uspešno — zagon 2 |
| R03 | Obnova `F` ob osvežitvi z ohranitvijo neznanih ID-jev | „R03: obnova ohrani neznane id-je …“ | `src/favorites.ts` | uspešno — zagon 2 |
| R04 | Neveljavni zapisi ⇒ `∅`, brez prepisa ob nalaganju | „R04: neveljavni zapisi …“ (6 primerov) | `src/favorites.ts` | uspešno — zagon 2 |
| R05 | Filter omeji na priljubljena trenutnega projekta, privzeto `false` | „R05: filter je privzeto izklopljen …“ | `src/App.tsx` | uspešno — zagon 2 |
| R06 | Takojšnja odstranitev pod filtrom; prazno stanje in izklop | „R06: odstranitev med filtrom …“ | `src/App.tsx` | uspešno — zagon 2 |
| R07 | Skupno stanje obeh pogledov; podrobnosti po `id` | „R07: preglednica in tabla …“ | `src/App.tsx`, `src/TaskBoard.tsx` | uspešno — zagon 2 |
| R08 | Menjava projekta in osvežitev ponastavita filter, `F` se ohrani | „R08: menjava projekta in osvežitev …“ | `src/App.tsx`, `src/useFavorites.ts` | uspešno — zagon 2 |
| R09 | Odstranitev samo ID-jev trenutnega projekta; onemogočen gumb | „R09: odstranitev priljubljenih projekta …“ | `src/App.tsx`, `src/useFavorites.ts` | uspešno — zagon 2 |
| R10 | `Priljubljeno: X od M.` za cel projekt; števci stolpcev za vidna | „R10: števec kaže cel projekt …“ | `src/App.tsx`, `src/TaskBoard.tsx` | uspešno — zagon 2 |
| R11 | Uskladitev ob `storage`, brez povratnega zapisa; opozorilo ob izjemi | „R11: dogodek storage …“, „R11: izjema zapisa …“, „R11: izjema branja …“ | `src/useFavorites.ts`, `src/App.tsx` | uspešno — zagon 2 |
| R12 | Brez API zapisov in sprememb polj; Folio in ozki prikaz ohranjena | „R12: brez API zapisov“, „R12: 390 px …“ + skupni testi | `src/styles.css`, `src/App.tsx` | uspešno — zagon 2 |

Zagon 2 = `npm run check`: lint, tipi in gradnja uspešni; Playwright 62 uspelih, 0 neuspešnih (38 skupnih,
8 razvojnih primerov P07, 16 lastnih testov). Zagon 1 (samo lastni testi): 15 uspelih, 1 neuspeh v testu —
test popravljen, ne koda. Končni (skriti) testi niso dostopni in niso bili izvedeni.

## Odprta vprašanja in omejitve

- Razporeditev novih kontrol in nedoločeno besedilo nista predmet zahtev; preverjajo se le določeni pogoji.
- Končni testi te naloge med razvojem niso dostopni; lastni testi pokrivajo opisane pogoje, morebitne vrzeli se
  navedejo ob oddaji. Neizvedenih testov ni dovoljeno navajati kot uspešnih.
- Navigacija med nedokončanim nalaganjem in sočasne spremembe podatkov brez osvežitve niso razširitev obsega;
  veljajo obstoječe regresijske zahteve.
- Če shramba ni dosegljiva, velja R11; stanje ostane lokalno trenutnemu projektu v pomnilniku.
