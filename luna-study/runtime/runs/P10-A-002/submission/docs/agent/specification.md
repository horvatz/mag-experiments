# Specifikacija: lokalni vrstni red z razveljavitvami

## Problem in kontekst

Folio že pridobi projekte in opravila prek javnega `/api/` ter jih prikaže kot preglednico ali tablo. P10 doda lokalno preurejanje opravil, zgodovino razveljavitev in ponovitev ter vrnitev na začetni vrstni red. Vrstni red je za čas prikaza izbranega projekta in se ob menjavi projekta ali osvežitvi začne znova. Polja opravil, stanja, števci stanj, podrobnosti in API ostanejo nespremenjeni.

## Vhodi, dejanja in izidi

- Vhod je seznam opravil iz `GET /api/projects/{id}/tasks`; `id` je enoličen, začetni vrstni red pa je vrstni red tega seznama. Naslovi niso ključi.
- Dejanja so premik ID-ja za eno mesto gor ali dol v globalnem seznamu, razveljavitev, ponovitev in vrnitev na izvorni seznam. Preglednica in tabla uporabljata isti lokalni seznam.
- Premik zunaj meja, razveljavitev/ponovitev prazne zgodovine ter vrnitev, ko je vrstni red že izvoren, so neoperativni. Veljavni premiki in vrnitev na drugačen izvorni vrstni red shranijo prejšnjo permutacijo v omejeno zgodovino razveljavitev ter izpraznijo ponovitve.
- Preklop pogleda in podrobnosti ohranita stanje. Menjava projekta ustvari novo stanje; ponovno nalaganje ponovno prebere izvorni vrstni red.
- Napake pri pridobivanju ostanejo obravnavane z obstoječim prikazom napake in ponovnim poskusom. Funkcionalnost vrstnega reda ne zapisuje podatkov.

## Zahteve in pravila

Naj bo `I` začetni seznam enoličnih ID-jev, `O` trenutna permutacija, `U` sklad razveljavitev, `R` sklad ponovitev; vrh sklada je zadnji element. `swap(O,i,j)` zamenja samo elementa na mestih `i` in `j`. Po veljavni spremembi se zgodovina `U` omeji na zadnjih 20 permutacij.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | `O₀ = I`; mesto ID-ja je njegov indeks v `O` + 1; ID, ne naslov, določa identiteto. | Začetni seznam in aria-label mest v obeh pogledih. |
| R02 | Za `i=index(O,id)`, gor je dovoljeno le `i>0` in da `O'=swap(O,i,i-1)`; dol le `i<|O|-1` in `O'=swap(O,i,i+1)`. Ostali podatki ostanejo isti. | Premik gor/dol v preglednici in tabli ter primerjava podatkov. |
| R03 | Neveljavni premik vrne nespremenjeno stanje; robni gumb je onemogočen. | Robna opravila in nespremenjen števec zgodovine. |
| R04 | Ob veljavnem premiku `U'=tail20(U⋅[O])`, `R'=[]`. Undo pri `U≠[]`: `O'=last(U)`, `U'=init(U)`, `R'=R⋅[O]`. | Zaporedje premik, undo ter števec in permutacija. |
| R05 | Redo pri `R≠[]`: `O'=last(R)`, `R'=init(R)`, `U'=tail20(U⋅[O])`. | Več zaporednih undo/redo in ohranitev unikatov. |
| R06 | Veljavni premik pri `R≠[]` nastavi `R=[]`; neveljavni premik ne spremeni `R`. | Undo, robni premik, redo; nato veljaven premik in redo. |
| R07 | Po vsakem dodajanju v `U` velja `|U|≤20`; odstrani se samo najstarejša permutacija. | Več kot 20 veljavnih premikov in undo/redo preostalih korakov. |
| R08 | Ponastavitev, če `O≠I`, je eno undo-dejanje: `U'=tail20(U⋅[O])`, `O'=I`, `R'=[]`; če `O=I`, brez spremembe. | Ponastavitev, undo/redo in neaktivna ponastavitev. |
| R09 | Preglednica sledi `O`; tabla za vsak stolpec filtrira `O` po nespremenjenem stanju. Mesto na kartici/vrstici ostane indeks v celotnem `O`. | Primerjava obeh pogledov pri opravilih v več stanjih. |
| R10 | Lokalni model ostane v komponenti projekta; pogled/podrobnosti ga ne inicializirajo znova, ključ projekta in novo nalaganje pa ga inicializirata. | Preklop pogleda, odpri/zapri podrobnosti, menjava projekta in reload. |
| R11 | Prikazani števci so `|U|` in `|R|`; undo/redo sta onemogočena natanko pri ničelnem ustreznem skladu. Seznam velikosti 0 ali 1 ne ponuja veljavnega premika. | Prazen, enoopravilni in običajen projekt. |
| R12 | Za vsak prehod `set(O)=set(I)`, `|O|=|I|`, brez podvojenih ID-jev; API je samo bralni, opravila se med preurejanjem ne mutirajo. | Zaporedje operacij, izvirni statusi/števci/podrobnosti in pregled zahtev API. |

## Izvedba in sledljivost

Prehodi permutacije in zgodovine so v `src/taskOrder.ts`; skupni kontrolniki in globalna mesta v `src/TaskOrderControls.tsx`; integracija seznama projekta v `src/App.tsx`, filtriranje table po stalnih stanjih v `src/TaskBoard.tsx`, slogi pa v `src/styles.css`. Lastni sprejemni scenariji so v `tests/agent/P10-order.spec.ts`. Dejanski dokazi za vsako zahtevo so v [verification.md](verification.md).

### Zapis popravkov specifikacije

- 2026-09-29: Po izvedbi sem popravil načrtovano lokacijo skupnih kontrolnikov: namesto vdelave v komponente projekta in table so ločeni v `src/TaskOrderControls.tsx`. Zahteve in sprejemna pravila se niso spremenila.

## Odprta vprašanja in omejitve

Specifikacija sledi izrecnim zahtevam naloge. Permutacije hranijo ID-je, zato se nobeno polje opravila ne kopira ali spreminja. Za prazno izvorno zaporedje ni mogoče izvajati premikov; ponastavitev je že v začetnem stanju. Za enoličnost ID-jev se opiramo na opis vhodne domene. Omejitev zgodovine velja tudi za dejanje ponastavitve in za permutacije, dodane z redo.
