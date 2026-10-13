# Specifikacija: Koledarski pregled rokov (P08)

## Problem in kontekst

**Namen:** Dodati koledarski pregled rokov z filtriranjem po skupinah in datumom v ozadju Folio.

**Zacetno delovanje:** Aplikacija prikazuje opravila samo z osnovno mapiro in seznamom.

**Predvidena sprememba:** Dodati referencni datum, vmesnik za filtriranje in logiko pravelascanja v skupine overdue/today/week/later/done.

## Reference

- Navodila zahtev: \`task/instructions.md\`
- Projektna pravila: \`PROJECT_RULES.md`
- Dizajn Folio: \`docs/dizajn.md\`
- Temeljni dokumenti: \`docs/README.md\`
- Skupna predloga P08: \`task/specification-template.md\`
- Vesicine Spec Kit: \`.agents/skills/speckit-*/SKILL.md\`

## Vhodi, dejanja in izidi

### Podatkovna polja

| Ime polja | Tip | Oznacevanje | Opis |
|-----------|-----|-------------|------|
| `dueDate` | \`YYYY-MM-DD\` | berem | Datum roka opravila; koledarski datum (brez casovnega pasa) |
| `status`   | `enum` (open|done) | branje | Stanje opravila |

### Dovoljena dejanja (brez zapisovnih API-jev)

- BRANJE z `/api/` (GET)
- FILTRIRANJE po `dueDate` in `status`
- UI: vnos referencnega datuma, izbira pogleda (all/overdue/today/week/later/done), prikaz preglednice/table

### Pogosti uporabi

- Referencni datum je fiksno 2026-09-21 (ob zacetku projekta)
- Zacetni pogled: `all`
- Vmesniki delujejo le s predvidenim API-jem (brez zapisovanja)

### Sacakvano stanje po uspehu

- Vsi odprti nalogi z `dueDate < referenca` -> **overdue**
- Enak datum -> **today**
- Od 1 do 7 dni po referencnem -> **week**
- >7 dni -> **later**
- `status=done` -> vedno v skupino **done** (brez izkljusevanja iz aktivnih)

---

## Zahteve in pravila

| Zahteva | Pravilo spremembe stanja | Nacin preverjanja |
|---------|-------------------------|-------------------|
| **R01** | Z zacetkom projekta je `ref = 2026-09-21`. Zacetni pogled `all`. | Preverjanje: prvi zacetni polozaj (brez UI) -> `ref = 2026-09-21`, pogled `all`. |
| **R02** | `status = done` -> vedno `group = done`; nikoli v overdue/today/week/later. | Preverjanje: `group(d, done, ref) == "done"` za vse `done` naloge. |
| **R03** | Odprto (`status=open`) z `dueDate < ref` -> `group = overdue`; `dueDate == ref` -> `group = today`. | Preverjanje: za odprta opravila `if dueDate < ref -> overdue`, `else if dueDate == ref -> today`. |
| **R04** | Odprto z `1 <= (dueDate - ref) <= 7` dni -> `group = week`; `dueDate - ref > 7` dni -> `group = later`. | Preverjanje: `delta = dueDate - ref`; `1 <= delta <= 7 -> week`, `delta > 7 -> later`. |
| **R05** | Vsak `dueDate` je koledarski `YYYY-MM-DD` (brez casovne komponente). | Preverjanje: format izhaja iz API-ja; casovne razlike so izven sistema. |
| **R06** | Pet stitev prikaže stevilo vseh nalog v projektnem sklop po `group ∈ {overdue,today,week,later,done}`; filter ne spremeni totalov. | Preverjanje: vsi stevci sestejejo `all` naloge ne glede na filter. |
| **R07** | Pogled: `select` ∈ {all, overdue, today, week, later, done}. Vmesnik prikazuje `group = select`. | Preverjanje: vsebina v UI ujema z `group=select` v trenutnih nalogah. |
| **R08** | Nova referenca -> takojšen preizkus vseh `group`; ohraniti obstojeci `select`. Ce `ref` prazen -> opozorilo. | Preverjanje: izracun `group` je ponovno izracunan, `select` ostane nespremenjen. |
| **R09** | Preglednica in tabla prikazujeta enake filtrirane ID-je; prehodi ohranijo `ref` in `select`. | Preverjanje: oba tipa prikazujeta enake ID in urejenost. |
| **R10** | Sprememba projekta in osvestitev -> reset na `ref = 2026-09-21`, `select = all`. | Preverjanje: po spremembi projekta se vrne v zaceto stanje. |
| **R11** | Prazen projekt -> vsi stevici = 0; prazna skupina -> "Ni opravil v izbrani skupini". | Preverjanje: s praznim seznamom so vsi stevici 0. |
| **R12** | Vsak datum je veljaven `YYYY-MM-DD` (tudi prestoppni). Pregled ne posilja zapisov API. | Preverjanje: datumi so pravilni format; noben zapisovanja ni. |

---

## Odprta vprasanja in omejitve

- Vsak datum se obravnava kot koledarski brez casovne komponente.
- Pri spremembi referencnega datuma se vsa pravelascanja ponovno izracuna; filter ostane nespremenjen.
- Ne implementirajte zapisovnih API-jev; samo berite z `/api/`.
- UI mora imeti `aria-label="Stevilo rokov <ključ>` za vsak od petih stevcev.
- Na sirini 390 pik se celotna stran ne sme razsiriti.
- Datumi podatkov so `YYYY-MM-DD`. Pregled ne uporablja zapisovanja.

> **Omejitev:** Testni program uporablza `/__test/` - vaša aplikacija ne sme brati ali zapisovati v `/__test/`.
