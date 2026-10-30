# P07 — Specifikacija: Priljubljena opravila in trajna shramba

**Funkcijska mapa**: `docs/agent/P07` · **Datum**: 2026-10-30 · **Status**: osnutek
**Viri**: `task/instructions.md` (R01–R12 in dogovor o vmesniku), `PROJECT_RULES.md`, `.specify/memory/constitution.md`, `docs/dizajn.md`
**Merilo uspeha**: vse zahteve R01–R12 so preverjene z dejansko izvedenimi testi; zunanjih meritev ne določamo.

## Problem in kontekst

Uporabnik želi v aplikaciji Folio opravila označiti kot priljubljena, seznam
omejiti na priljubljena in izbor ohraniti med osvežitvami strani. Folio že
prikazuje preglednico in tablo opravil, navigacijo, podrobnosti in ozek
prikaz, priljubljenih pa še ne vsebuje. Sprememba doda lokalne kontrole ob
opravilih in trajno shrambo v `localStorage`; strežniški podatki in polja
opravil ostanejo nespremenjeni.

Uporabniški scenariji (skladni z R01–R12, brez dodatnih zahtev):

1. **Označevanje**: uporabnik klikne `Priljubljeno opravilo <id>`; gumb se
   preklopi, podrobnosti se ne odprejo, enaki naslovi ostanejo neodvisni.
   Po osvežitvi je izbor obnovljen.
2. **Filtriranje**: uporabnik vklopi `Prikaži le priljubljena`; prikaz se
   omeji na priljubljena trenutnega projekta, števec kaže `Priljubljeno: X od M.`.
3. **Vzdrževanje**: odstranitev posameznega ali vseh priljubljenih projekta;
   dogodek `storage` iz drugega zavihka uskladi množico; ob napaki shrambe
   aplikacija deluje naprej v pomnilniku z opozorilom.

## Vhodi, dejanja in izidi

**Podatki.** Opravila se berejo iz obstoječega javnega API-ja; uporabljata se
`task.id` (enkraten niz) in pripadnost projektu. V shrambo se zapiše samo
množica ID-jev kot `{"version":1,"ids":[...]}` pod ključem
`folio:favorites:v1`; polja opravil se ne zapisujejo.

**Dejanja in izidi.**

- Preklop priljubljenosti posodobi množico in prikaz; ne odpira podrobnosti
  in ne piše prek API-ja (R01, R12).
- Vklop/izklop filtra posodobi vidna opravila; privzeto je izklopljen (R05, R06).
- Odstranitev priljubljenih projekta odstrani ID-je opravil trenutnega
  projekta, tuje in neznane ohrani; brez priljubljenih projekta je gumb
  onemogočen (R09).
- Menjava projekta ohrani množico, filter ponastavi na izklopljen (R08).
- Osvežitev obnovi množico iz shrambe; filter je izklopljen (R03, R04, R08).
- Dogodek `storage` za pravi ključ uskladi množico po pravilih veljavnosti;
  `null` jo izprazni; drug ključ se ignorira; dogodek ne sproži povratnega
  zapisa (R11).
- Ob napaki branja ali zapisa shrambe aplikacija ostane uporabna v pomnilniku
  in prikaže opozorilo o nedostopni shrambi (R11).

**Dogovor o vmesniku** (iz `task/instructions.md`).

- Gumbi `Priljubljeno opravilo <id>` z `aria-pressed`, postavljeni ločeno
  od povezave opravila; checkbox `Prikaži le priljubljena`; gumb
  `Odstrani priljubljene tega projekta`.
- Element `role=status`, `aria-label="Število priljubljenih"`, besedilo
  `Priljubljeno: X od M.`; napaka shrambe ima `role=alert` in vsebuje
  besedo `shramba`.
- Ohranjeni: `data-task-id` na vrsticah in karticah, dostopna imena
  obstoječih pogledov in stolpcev, `aria-label="Pregled stanj opravil"`;
  nova dejanja ob opravilu so zunaj njegove povezave.
- Pri širini 390 pik se cela stran ne razširi; notranje drsenje preglednice
  in table je dovoljeno. Besedilo, ki ni izrecno določeno, in razporeditev
  novih kontrol nista predpisana.

## Zahteve in pravila

**Simboli.** P = opravila trenutnega projekta v izvornem vrstnem redu;
F = globalna množica priljubljenih ID-jev v pomnilniku; L = zapis v shrambi;
f = vrednost filtra `Prikaži le priljubljena`; X in M = števca v besedilu
`Priljubljeno: X od M.`. **Predpostavke**: ID-ji so enkratni nizi; F lahko
vsebuje trenutno neznane ID-je (za druge projekte); ista validacija velja ob
nalaganju in ob dogodku `storage`.

**Splošna pravila sprememb stanja** (ločena od posameznih testnih primerov):

- **P1 (preklop)**: `F' = F △ {id}`; podrobnosti se ne odprejo; sprememba
  velja samo za kliknjeni ID, tudi pri enakih naslovih.
- **P2 (zapis)**: ob vsaki spremembi F razen P6 se zapiše
  `L = {version:1, ids: sortUTF16(unique(F))}` — enkratni nizi, razvrščeni
  po UTF-16.
- **P3 (normalizacija)**: `veljaven(L) ⇔ L je objekt ∧ L.version = 1 ∧ L.ids
  je polje ∧ vsi elementi so nizi`; `N(L) = veljaven(L) ? množica(L.ids) : ∅`.
  Podvojeni ID-ji se obravnavajo kot eden, neznani se ohranijo, izmišljenih
  opravil ni.
- **P4 (prikaz)**: `vidna = f ? [t ∈ P : t.id ∈ F] : P` (izvorni vrstni red);
  `X = |{t ∈ P : t.id ∈ F}|`, `M = |P|`.
- **P5 (odstranitev projekta)**: `F' = F \ {t.id : t ∈ P}`.
- **P6 (dogodek `storage`)**: `F' = N(nova vrednost)`; `null → ∅`; brez
  povratnega zapisa; drug ključ se ignorira.
- **P7 (napaka shrambe)**: če branje ali zapis vrže izjemo, F ostane v
  pomnilniku, aplikacija je uporabna, prikaže se opozorilo (`role=alert`,
  vsebuje `shramba`); ob nalaganju se shramba sama ne prepiše.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Gumbi `Priljubljeno opravilo <id>` z `aria-pressed` v preglednici in na tabli; preklop samo tega ID-ja, brez odpiranja podrobnosti; enaki naslovi neodvisni. | UI test: gumbi, preklop, podrobnosti, enaki naslovi. |
| R02 | Zapis `folio:favorites:v1` = `{version:1,ids:[...]}`; ob zapisu enkratni nizi, razvrščeni po UTF-16; polja opravil se ne zapisujejo. | UI test in neposreden vpogled v shrambo. |
| R03 | Osvežitev obnovi shranjene ID-je; podvojeni se obravnavajo kot eden; neznani se ohranijo; brez izmišljenih opravil. | UI test z vnaprej pripravljeno shrambo (podvojeni in neznani ID-ji). |
| R04 | Manjkajoč ključ, neveljaven JSON, napačna `version`, manjkajoč `ids` ali neniz v `ids` → prazna začetna množica; brez odpovedi in brez prepisa ob nalaganju. | UI test za vsak neveljaven primer; primerjava zapisa pred nalaganjem in po njem. |
| R05 | Filter `Prikaži le priljubljena` omeji prikaz na F ∩ P v izvornem vrstnem redu; privzeta vrednost je `false`. | UI test: privzeto stanje, vklop/izklop, vrstni red. |
| R06 | Odstranitev priljubljenega med aktivnim filtrom ga takoj odstrani iz prikaza; brez rezultatov se pokaže `Ni priljubljenih opravil.` in filter je mogoče izklopiti. | UI test: odstranitev pod filtrom, sporočilo, izklop filtra. |
| R07 | Preglednica in tabla delita množico in filter; preklop pogleda ne izgubi sprememb; podrobnosti so dostopne po pravilnem ID-ju. | UI test: preklop pogleda, skupno stanje, odpiranje podrobnosti. |
| R08 | Menjava projekta ohrani globalno množico, filter ponastavi na `false`; osvežitev obnovi množico, filter je prav tako `false`. | UI test: menjava projekta in osvežitev. |
| R09 | Gumb `Odstrani priljubljene tega projekta` odstrani natanko ID-je opravil trenutnega projekta; tuji in neznani ID-ji ostanejo; brez priljubljenih projekta je onemogočen. | UI test: odstranitev, ohranitev tujih in neznanih ID-jev, onemogočeno stanje. |
| R10 | Števec vedno kaže `Priljubljeno: X od M.` za celoten trenutni projekt, tudi ob aktivnem filtru; števci stolpcev table štejejo vidna opravila. | UI test: števec ob filtru in brez njega, števci stolpcev. |
| R11 | Dogodek `storage` za pravi ključ takoj uskladi množico (P3); `null` jo izprazni; drug ključ se ignorira; brez povratnega zapisa; ob izjemi opozorilo o shrambi in uporabna aplikacija v pomnilniku. | UI test dogodka (pravi in drug ključ, `null`, neveljavna vrednost); test izjeme branja/zapisa. |
| R12 | Vse spremembe priljubljenih so lokalne: brez zapisov na API, polja opravil nespremenjena; Folio, nalaganje, navigacija in ozek prikaz ohranjeni. | Pregled omrežnih klicev, primerjava podatkov, regresijski skupni testi, preverjanje pri 390 px. |

## Izvedba in sledljivost

Tabela se med izvedbo dopolni z dejanskimi datotekami in dokazi; izidi brez
izvedbe ostanejo označeni kot neizvedeni. Načrt in naloge: `plan.md`,
`tasks.md` (isti imenik).

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | P1 | agentni UI test — gumbi in preklop | `src/` (določeno v plan.md) | ni izvedeno (faza specifikacije) |
| R02 | P2 | agentni UI test — zapis v shrambo | `src/` (določeno v plan.md) | ni izvedeno (faza specifikacije) |
| R03 | P3 | agentni UI test — obnova iz shrambe | `src/` (določeno v plan.md) | ni izvedeno (faza specifikacije) |
| R04 | P3 | agentni UI test — neveljavni zapisi | `src/` (določeno v plan.md) | ni izvedeno (faza specifikacije) |
| R05 | P4 | agentni UI test — filter | `src/` (določeno v plan.md) | ni izvedeno (faza specifikacije) |
| R06 | P4, P1 | agentni UI test — odstranitev pod filtrom | `src/` (določeno v plan.md) | ni izvedeno (faza specifikacije) |
| R07 | P4 | agentni UI test — preklop pogleda | `src/` (določeno v plan.md) | ni izvedeno (faza specifikacije) |
| R08 | P4 | agentni UI test — menjava projekta | `src/` (določeno v plan.md) | ni izvedeno (faza specifikacije) |
| R09 | P5 | agentni UI test — odstranitev projekta | `src/` (določeno v plan.md) | ni izvedeno (faza specifikacije) |
| R10 | P4 | agentni UI test — števci | `src/` (določeno v plan.md) | ni izvedeno (faza specifikacije) |
| R11 | P6, P7 | agentni UI test — dogodek in izjema | `src/` (določeno v plan.md) | ni izvedeno (faza specifikacije) |
| R12 | P2, P5 | regresijski testi in pregled klicev | `src/` (določeno v plan.md) | ni izvedeno (faza specifikacije) |

## Odprta vprašanja in omejitve

- Razporeditev novih kontrol in besedilo, ki ni izrecno določeno, nista
  predpisana; izbira ostane znotraj potrjenega videza Folio.
- Nezaključeno nalaganje med navigacijo in sočasne spremembe podatkov brez
  osvežitve niso del obsega.
- Končni ocenjevalni testi niso dostopni; preverjanje bo izvedeno s skupnimi
  testi in lastnimi testi v `tests/agent/`; neizvedenih testov ne bomo
  označili kot uspešnih.
- Zunanjih meritev uspešnosti ne določamo.
