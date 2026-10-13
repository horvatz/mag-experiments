# Folio Ustava

**Različica**: 1.0 | **Sprejeto**: 2026-10-13 | **Zadnja sprememba**: 2026-10-13

## Vodilna načela

### I. Zahteve so merilo

Izvirne zahteve naloge in skupna predloga specifikacije sta izhodišče. Vsako
relevantno zahtevo je treba sledljivo zajeti, preverjene izide ločiti od
nepreverjenih omejitev in ne dodajati obsega, ki ni zahtevan.

### II. Ohranjaj potrjeni Folio

Obstoječi vmesnik React dopolni z obstoječim vizualnim jezikom Folio,
slovenskimi uporabniškimi imeni, dostopnostjo ter obstoječo navigacijo in
podrobnostmi. Nedoločenih delov aplikacije ne preoblikuj.

### III. Upoštevaj meje sprememb

Delo v aplikaciji ostaja v `src/`, lastnih testih v `tests/agent/` in lastni
dokumentaciji v `docs/agent/`. Samo ta postopek lahko dodatno posodobi
`.specify/memory/constitution.md` in `.specify/feature.json`. Odvisnosti,
nastavitve, strežniške datoteke, skupne tipe, izhodiščne teste in skupno
infrastrukturo ne spreminjaj.

### IV. Uporabljaj javni podatkovni vmesnik

Podatke beri in shranjuj samo prek obstoječega javnega vmesnika `/api/` in
zapise izbiraj po `id`. Uporabniška koda ne kliče testnih kontrol `/__test/`,
ne nadomešča strežnika s krajevnimi ponaredki in ne dodaja novih zapisovalnih
API-jev, razen če bodoča naloga to izrecno zahteva.

### V. Preverjaj in poročaj pošteno

Uporabi smiselne izhodiščne in nalogi primerne preverbe, nato natančno zapiši
ukaze, izide in nepreverjene scenarije. Neizvedenega testa nikoli ne predstavi
kot uspešnega.

## Nepogojna pravila

- Potrjeni dizajn Folio in obstoječe delovanje aplikacije sta izhodišče;
  dopolnitve se ju prilagodita, ne nadomestita.
- Stanje naloge je krajevno in vezano na trenutni projekt, razen če zahteva
  izrecno določa trajno shrambo ali parametre v URL-ju.
- Nove odvisnosti, testno vedenje v produkcijski kodi in obvezne arhitekturne
  preureditve so izven obsega.
- Nejasne ali manjkajoče podatke zapiši kot omejitve; jih ne izmišljuj.

## Upravljanje

Ta ustava vodi delo Spec Kit za Folio. Spreminjaj jo samo v tej datoteki, z
kratkim razlogom in posodobljenim datumom spremembe. Če se bodoča naloga zdi v
nasprotju s temi pravili, nasprotje ali odstopanje izrecno razreši pred izvedbo.
