# Folio (pilot P03) Constitution

## Core Principles

### I. Zvestoba izvirnim zahtevam
Merilo dela so zahteve naloge (R01–R12) in `task/specification-template.md`;
specifikacija, načrt in opravila ne smejo razširiti ali oslabiti njihovega
obsega. Vsaka zahteva mora biti sledljiva do pogoja, kode in dejansko
izvedenega preverjanja. Neizvedenih preverjanj ni dovoljeno navajati kot
uspešnih.

### II. Nespremenljiva skupna infrastruktura (NON-NEGOTIABLE)
Spreminjajo se samo `src/`, lastni testi v `tests/agent/` in dokumenti v
`docs/agent/`; procesni datoteki `.specify/memory/constitution.md` in
`.specify/feature.json` sta edini izjemi. `server/`, `shared/`, skupni testi,
odvisnosti, nastavitve zagona in preverjanja, uradne predloge ter datoteke
veščin ostanejo nespremenjeni. Vsaka potreba po spremembi infrastrukture se
zabeleži kot omejitev, ne izvede.

### III. Javni vmesnik je edini vir podatkov
Aplikacija bere in piše izključno prek `/api/`, izbira po `id`. Testne
kontrole `/__test/` so namenjene samo testnemu programu; vmesnik jih ne sme
uvažati, brati ali ponastavljati, prav tako ne sme nadomeščati strežnika z
lokalno kopijo podatkov ali `localStorage`. Novih zapisovalnih API-jev ni.

### IV. Ohranjen potrjeni dizajn Folio
Videz in vedenje iz `docs/dizajn.md` sta obvezujoča: slovenska poimenovanja,
obstoječi gradniki in slogovne spremenljivke, viden fokus pri tipkovnici,
uporabnost pri ozki širini (brez vodoravnega razširjanja strani na 390 pik)
ter ohranjene povezave in dostopna imena obstoječih pogledov, stolpcev in
`data-task-id`.

### V. Lokalno in preverljivo stanje
Stanje nove funkcionalnosti je lokalno trenutnemu projektu; brez trajne
shrambe in brez zapisa v URL, razen če posamezna zahteva izrecno določa
drugače. Vsaka sprememba se preveri s skupnimi regresijskimi testi in z
lastnimi testi za zahteve P03; rezultati se zapišejo sproti in jedrnato, brez
podvajanja dokumentov.

## Development Workflow

Zaporedje Spec Kit: specifikacija (skupna predloga, povezave na dokumente
namesto podvajanja) → načrt → opravila → izvedba. Spremembe ostanejo majhne
in osredotočene; raziskovanje pomeni pregled lokalne kode in priloženih
navodil. Veje in commiti se ne ustvarjajo; delo poteka na obstoječem izhodišču.

## Governance

Ta ustava prevlada nad drugimi praksami v tem repozitoriju. Spremembe zahtevajo
zapisano obrazložitev in posodobitev odvisnih dokumentov Spec Kit; kršitve
načel je treba odpraviti ali izrecno zabeležiti kot omejitev. Skladnost se
preveri v specifikaciji, načrtu in opravilih.

**Version**: 1.0.0 | **Ratified**: 2026-11-01 | **Last Amended**: 2026-11-01
