# Folio (P08) — Projektna ustava

## Osnovna načela

### I. Potrjeni videz Folio (NELOČLJIVO)
Vsaka sprememba uporabniškega vmesnika ohrani potrjeni dizajn Folio iz
`docs/dizajn.md`: postavitev, barve, tipografijo in obstoječe gradnike.
Slogovne spremenljivke v `src/styles.css` so vir resnice; brez prenove
videz se uporabljajo slovenska poimenovanja in obstoječi pogledi.

### II. Omejen obseg sprememb (NELOČLJIVO)
Spreminjajo se samo `src/`, lastni testi v `tests/agent/` in lastna
dokumentacija v `docs/agent/`. Začetni podatki, strežnik v `server/`,
skupni tipi v `shared/`, skupni testi `tests/baseline.spec.ts` in
`tests/api.spec.ts`, odvisnosti ter nastavitve zagona ostanejo enaki;
sprememba skupne infrastrukture zahteva vnaprej dogovorjeno posodobitev
izhodišča za vse postopke.

### III. Javni vmesnik `/api/` (NELOČLJIVO)
Podatki se berejo in shranjujejo izključno prek javnega vmesnika `/api/`,
izbira po `id`. Uporabniški vmesnik ne uporablja testnih kontrol `/__test/`
in ne nadomešča strežnika z lokalno kopijo podatkov ali `localStorage`;
novih zapisovalnih API-jev ni.

### IV. Zahteve kot merilo in sledljivost
Zahteve R01–R12 iz `task/instructions.md` so merilo, tudi če jih
specifikacija izpusti. Specifikacija se pripravi po skupni predlogi
`task/specification-template.md`; vsaka zahteva je povezana s pravilom
oziroma predikatom, kodo in dejansko izvedenim testom. Neizvedenih testov
ni dovoljeno navajati kot uspešnih; nepreverjeni deli in omejitve se
zapišejo.

### V. Preverjanje na resničnih izvedbah
Rešitev se preveri s skupnimi testi in smiselnimi lastnimi preverjanji v
`tests/agent/`, ki naslovijo posebne zahteve P08. Skupni testi se ne
spreminjajo; rezultati se poročajo z dnevnikom zagona.

## Upravljanje

Ta ustava nadreja drugim praksam v projektu. Spremembe se dokumentirajo z
datumom in različico. Odprta vprašanja se rešujejo iz obstoječih zahtev; če
bistvenega podatka ni, se omejitev jasno navede in delo ustavi, odgovor
uporabnika pa se ne izmišljuje. Dokumentov se ne podvaja; skupna predloga se
lahko izpolni s povezavami na dokumente Spec Kit.

**Različica**: 1.0.0 | **Sprejeto**: 2026-10-09 | **Zadnja sprememba**: 2026-10-09
