# Folio (P05) Constitution

## Core Principles

### I. Meje dovoljenih sprememb (NON-NEGOTIABLE)
Spremembe so dovoljene samo v `src/`, `tests/agent/` in `docs/agent/`.
Izjema postopka C sta procesni datoteki `.specify/memory/constitution.md` in
`.specify/feature.json`. Strežnik (`server/`), skupni tipi (`shared/`), skupni
testi (`tests/baseline.spec.ts`, `tests/api.spec.ts`), odvisnosti, nastavitve,
uradne predloge in datoteke veščin so nespremenljivi; sprememba skupne
infrastrukture bi zahtevala vnaprej dogovorjeno posodobitev izhodišča za vse
postopke.

### II. Javni API je edini vir podatkov
Aplikacija bere in shranjuje podatke izključno prek javnega vmesnika `/api/`.
Testnih kontrol `/__test/` uporabniški vmesnik ne sme uvažati, brati ali
uporabljati za nastavljanje odzivov; strežnika ni dovoljeno nadomestiti z
lokalno kopijo podatkov ali `localStorage`. Novih zapisovalnih API-jev ni.
Stanje nove funkcionalnosti je lokalno trenutnemu projektu, brez trajne
shrambe in brez URL-ja, razen kjer zahteva izrecno določa drugače.

### III. Potrjeni dizajn Folio in slovenski vmesnik
Potrjen videz Folio iz `docs/dizajn.md` ostane uporabljen: obstoječi gradniki
in slogovne spremenljivke, slovenska poimenovanja, ohranjena dostopna imena,
`data-task-id` ter `aria-label="Pregled stanj opravil"`. Nova dejanja ob
opravilu so zunaj njegove povezave; pri širini 390 pik je dovoljeno notranje
drsenje preglednice in table.

### IV. Specifikacija po skupni predlogi s sledljivostjo
Izdelek se dokumentira po skupni predlogi `task/specification-template.md`;
dokumentov se ne podvaja, temveč povezuje. Vsaka zahteva R01–R12 je povezana
s sprejemnim pogojem (kjer je smiselno s predikatom), kodo in dejansko
izvedenim testom. Izvirne zahteve so merilo, tudi če jih specifikacija
izpusti.

### V. Pošteno preverjanje (NON-NEGOTIABLE)
Rešitev se preveri s skupnimi testi in lastnimi preverjanji v `tests/agent/`.
Izida se ne označi kot uspešnega brez dejanskega zagona; neizvedeni in
nedostopni testi ter omejitve se izrecno navedejo. Razširjanje obsega naloge
in spreminjanje infrastrukture nista dovoljena.

## Governance
Ta ustava prevlada nad drugimi praksami; navzkrižja se razrešujejo v njeno
korist. Spremembe zahtevajo dokumentiran razlog in ohranjeno zgodovino.
Skladnost preverijo skupni testi in lastna preverjanja iz `tests/agent/`.

**Version**: 1.0.0 | **Ratified**: 2026-10-30 | **Last Amended**: 2026-10-30
