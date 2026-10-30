# Folio Constitution

Projektna načela za aplikacijo Folio (pilot P06). Izpeljana iz `PROJECT_RULES.md`
in skupne predloge razvojne specifikacije; ne uvajajo novih zahtev, odvisnosti
ali obveznih arhitekturnih preureditev.

## Core Principles

### I. Meje dovoljenih sprememb (NON-NEGOTIABLE)
Spreminjajo se samo koda vmesnika v `src/`, lastni testi v `tests/agent/` in
dokumenti v `docs/agent/`. Strežnik v `server/`, skupni tipi v `shared/`,
skupni testi, odvisnosti in nastavitve zagona ostanejo nespremenjeni; vsaka
sprememba skupne infrastrukture je dovoljena le kot vnaprej dogovorjena
posodobitev izhodišča za vse postopke.

### II. Javni API je edini vir podatkov
Podatki se berejo in shranjujejo izključno prek javnega vmesnika `/api/`,
izbira po `id`. Vmesnik ne uporablja testnih kontrol `/__test/`, ne nadomešča
strežnika z lokalno kopijo podatkov ali `localStorage` in ne uvaja novih
zapisovalnih API-jev.

### III. Potrjeni dizajn Folio
Ohranijo se slovenska poimenovanja in potrjeni videz Folio iz `docs/dizajn.md`
(barve, postavitev, ikone, odzivnost do 390 pik, viden fokus). Dopolnítve
uporabljajo obstoječe gradnike in slogovne spremenljivke; dekorativne ikone so
`aria-hidden`, dostopna imena obstoječih pogledov in stolpcev ter `data-task-id`
ostanejo.

### IV. Preverjanje z dejanskimi dokazi
Vsaka zahteva se preveri s skupnimi testi in smiselno dodanimi lastnimi
preverjanji. Neizvedenih testov ni dovoljeno navajati kot uspešnih; rezultati
morajo biti določljivi (ime testa, dnevnik zagona), omejitve in nepreverjeni
scenariji pa izrecno zapisani.

### V. Skromnost in sledljivost
Spremembe so najmanjše možne in usmerjene v nalogo; brez novih odvisnosti,
širjenja obsega ali posegov v infrastrukturo. Specifikacija po skupni predlogi
poveže vsako zahtevo R01–R12 s pogoji, kodo in dejansko izvedenimi testi.

## Dodatne omejitve

- Začetni podatki, skupni testi `tests/baseline.spec.ts` in `tests/api.spec.ts`
  ter nastavitve zagona in preverjanja so samo berljivi.
- Testni pripomoček za nadzorovane odgovore je testni mehanizem; vmesnik ga ne
  uvaža in ne uporablja.
- Stanje nove funkcionalnosti je lokalno trenutnemu projektu, razen če zahteva
  izrecno določa trajno shrambo ali URL.

## Razvojni tok

1. Preberi zahteve naloge in uporabi priloženo predlogo specifikacije.
2. Dopolni obstoječi vmesnik v mejah načel I–III.
3. Preveri rešitev s skupnimi testi in lastnimi preverjanji (načelo IV).
4. Ob koncu opiši spremembe, izvedena preverjanja, rezultate in neizpolnjene
   zahteve.

## Governance

Constitution nadrejena drugim praksam; vsaka sprememba se dokumentira z
datumom in razlogom. Vsa dela morajo biti skladna z načeli I–V; odstopanja je
treba utemeljiti. Sprememba skupne infrastrukture zahteva vnaprej dogovorjeno
posodobitev izhodišča za vse postopke.

**Version**: 1.0.0 | **Ratified**: 2026-10-30 | **Last Amended**: 2026-10-30
