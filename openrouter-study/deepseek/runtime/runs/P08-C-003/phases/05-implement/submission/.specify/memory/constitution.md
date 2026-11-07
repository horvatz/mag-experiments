# Folio — Projektna ustava

Ta ustava povzema zavezujoča pravila iz `PROJECT_RULES.md`, `task/instructions.md`
in potrjenega dizajna Folio (`docs/dizajn.md`). Ne uvaja novih zahtev.

## Osnovna načela

### I. Omejen obseg sprememb (NON-NEGOTIABLE)
Spreminjajo se lahko samo `src/`, lastni testi v `tests/agent/` in dokumenti v
`docs/agent/`; postopek C lahko dodatno ureja `.specify/memory/constitution.md`.
Začetni podatki, `server/`, `shared/`, skupni testi, odvisnosti ter zagonske in
preveritvene nastavitve ostanejo nespremenjeni. Sprememba skupne infrastrukture
zahteva vnaprej dogovorjeno posodobitev izhodišča za vse postopke.

### II. Ohranjen potrjeni videz Folio
Uporabniški vmesnik ohrani slovenska poimenovanja in potrjeni videz Folio:
obstoječe gradnike, slogovne spremenljivke in postavitvene rešitve iz
`src/styles.css` ter `docs/dizajn.md` (barve, meni, kartice, odzivnost,
viden fokus). Obstoječe dostopnostne oznake in `data-task-id` ostanejo.

### III. Javni API je edini vir podatkov
Aplikacija bere in shranjuje izključno prek javnega vmesnika `/api/` in izbira
po `id`. Uporabniški vmesnik ne uporablja testnih kontrol `/__test/`, ne
nadomešča strežnika z lokalno kopijo podatkov ali `localStorage` in ne uvaja
novih zapisovalnih API-jev. Stanje nove funkcionalnosti je lokalno trenutnemu
projektu, razen kjer zahteva izrecno določa drugače.

### IV. Trditve le z dejanskimi dokazi
Rešitev se preveri s skupnimi testi in smiselno dodanimi lastnimi testi.
Vsaka zahteva R01–R12 je povezana s pogojem, kodo in dejansko izvedenim
testom; neizvedenih ali nedostopnih preverjanj ni dovoljeno navajati kot
uspešnih. Rezultati, omejitve in nepreverjeni deli se zapišejo odkrito.

### V. Sledljiva specifikacija po skupni predlogi
Izdelek sledi skupni predlogi iz `task/specification-template.md`; izbrani
pogoji so izraženi s predikati ali pravili spremembe stanja, ločeno od
posameznih testnih primerov. Dokumenti se ne podvajajo; uporabijo se povezave.

## Razvojni potek

- Koraki potekajo v vrstnem redu uradnih veščin Spec Kit; pot funkcionalnosti
  je `docs/agent/P08`.
- Ne ustvarjajo se veje ali commiti; delo se sproti shranjuje, dokazila se
  pišejo jedrnato.
- Zahtev P08 ni dovoljeno širiti prek zapisanega obsega, dodajati odvisnosti
  ali obveznih arhitekturnih preureditev.

## Upravljanje

Ta ustava prevlada nad drugimi praksami pri nasprotjih. Spremembe zahtevajo
usklajeno posodobitev izhodišča; projektna pravila in zahteve naloge ostajajo
merilo resnice.

**Različica**: 1.0.0 | **Potrjena**: 2026-10-13 | **Nazadnje spremenjena**: 2026-10-13
