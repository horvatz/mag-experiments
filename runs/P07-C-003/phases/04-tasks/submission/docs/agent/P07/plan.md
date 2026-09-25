# P07 — Načrt izvedbe

Datum: 2026-09-25. Podlaga: [specifikacija](spec.md), [izvirne zahteve](../../../task/instructions.md), [načela](../../../.specify/memory/constitution.md). Pravila stanja in sprejemni pogoji so v specifikaciji in se tukaj ne podvajajo.

## Tehnični kontekst

Obstoječi sklad: React 19.3, TypeScript 6, Vite 8, lucide-react, CSS; preverjanje z ESLint, TypeScript in Playwright 1.63. Odvisnosti in Chromium so nameščeni. Uporabimo obstoječe skripte in Playwright konfiguracijo, brez sprememb infrastrukture ali namestitev.

`App.tsx` pridobi projekte in za izbrani projekt izriše `ProjectView key={project.id}`. Ta pridobi opravila prek `useResource`, vsebuje preglednico in prikazuje `TaskBoard` ali `TaskDetails`. Navigacija uporablja hash in kodirane ID-je. `TaskBoard` razdeli podani seznam v tri statusne stolpce. `main.tsx` uporablja React StrictMode. Skupni tipi že ustrezajo nalogi.

## Odločitve in razporeditev stanja

1. **Globalna množica:** `useFavorites` se kliče enkrat v `App`, nad projektno komponento. Vsebuje `Set<string>`, opozorilo o shrambi ter dejanji preklopa ID-ja in odstranitve podane množice ID-jev. Projektoma in pogledoma se posreduje isto stanje. Lastnosti `Task` se ne dopolnjujejo s priljubljenostjo.
2. **Shramba:** začetni bralnik lovi izjeme dostopa in `getItem`; čisti parser preveri JSON, različico, polje nizov ter združi podvojitve. Neznanih ID-jev ne filtrira. Kanonični zapis uporabi `[...ids].sort()` za UTF-16 in točen ključ/obliko R02. Izjema zapisa ohrani spremembo v pomnilniku in opozorilo.
3. **Brez samodejnega pisanja:** zapis se izvede samo v obdelovalniku lokalnega dejanja, zunaj funkcij za izračun React stanja. Ni učinka, ki bi pisal ob vsaki spremembi množice; tako inicializacija, StrictMode in dogodek `storage` ne sprožijo povratnih zapisov. Obdelovalniki vedno izhajajo iz zadnje množice, tudi pri zaporednih dogodkih.
4. **Sinhronizacija:** učinek doda poslušalca `storage` in ga odstrani ob odklopu. Pravilen ključ uporabi isti parser nad `newValue`; drugi ključi se ignorirajo. Posodobijo se množica in vsi izpeljani prikazi brez spreminjanja filtra in brez pisanja.
5. **Projektni filter:** lokalni `useState(false)` v `ProjectView`. Obstoječi ključ projekta zagotovi ponastavitev pri menjavi projekta, med pogledoma in podrobnostmi komponenta ostane ista. Filter se ne shranjuje. Iz vseh naloženih opravil se izračunajo `visibleTasks`, projektni števec in onemogočenost odstranitve.
6. **Dva obsega štetja:** števec priljubljenih, množična odstranitev in obstoječi pregled stanj temeljijo na celotnem seznamu projekta. Tabla dobi `visibleTasks`, zato njeni obstoječi stolpci štejejo vidne vnose in ohranijo njihov vrstni red znotraj stanja.
7. **Kontrole:** skupni `FavoriteButton` z ikono iz nameščenega lucide-react, točnim dostopnim imenom in `aria-pressed`. V preglednici je ob povezavi v celici, na tabli pa njen sorojeni element znotraj istega `li[data-task-id]`. Noben gumb ni znotraj povezave. Obstoječe povezave in navigacija ostanejo odgovorne za podrobnosti.
8. **Prazni rezultati:** kontrolna vrstica ostane vidna tudi pri nič opravilih ali zadetkih. Aktivni filter brez zadetkov prikaže zahtevano sporočilo. Tabla še vedno izriše vse tri prazne stolpce; preglednica pri izklopljenem filtru ohrani obstoječe prazno stanje. Status priljubljenih se prikaže po naložitvi opravil, da ne podvoji obstoječega statusa nalaganja.
9. **Folio:** dopolnilni razredi uporabljajo obstoječe barve, robove in fokus. Kontrole se prelamljajo, tabla in preglednica ohranita notranje drsenje. Na kartici naj bo za ločeni gumb rezerviran prostor, da ne prekrije ID-ja, naslova ali povezave.

## Predvidene datoteke

| Datoteka | Sprememba | Zahteve |
| --- | --- | --- |
| `src/useFavorites.ts` (nova) | Validacija, varno začetno branje, lokalna množica, kanoničen zapis, dogodki in napake | R02–R04, R08–R09, R11–R12 |
| `src/FavoriteButton.tsx` (nova) | Skupni dostopni gumb za oba pogleda | R01, R07, R12 |
| `src/App.tsx` | Lastništvo globalnega stanja; filter, kontrole, števec, prazno stanje in gumbi preglednice | R01, R05–R10, R11–R12 |
| `src/TaskBoard.tsx` | Sprejem množice in dejanja; ločeni gumbi na karticah; izris vidnih opravil | R01, R05–R07, R10, R12 |
| `src/styles.css` | Slogi kontrol, gumba in opozorila z odzivnim prelamljanjem | R12 |
| `tests/agent/P07.spec.ts` (nova) | Dodatni vedenjski testi vrzeli razvojnih primerov | R01–R12 |
| `docs/agent/P07/spec.md` | Posodobitev sledljivosti z dejansko kodo, testi in rezultati ter zgodovine | R01–R12 |
| `docs/agent/P07/validation.md` in dnevniki v isti mapi | Kratka evidenca ukazov, rezultatov in omejitev brez podvajanja specifikacije | Dokazila |

`TaskDetails`, `navigation`, `api`, `useResource`, skupni tipi, strežnik, skupni testi, konfiguracija, odvisnosti in uradne predloge ne potrebujejo sprememb.

## Zaporedje izvedbe in preverjanje

1. Izdelaj upravljanje množice in shrambe, nato skupni gumb ter povezavo v `App` in `TaskBoard`. Dopolni sloge za Folio.
2. Dodaj lastne Playwright scenarije iz S1–S8, predvsem vrzeli javnih razvojnih testov D01–D04: napačni zapisi brez prepisovanja; podvojitve/neznani ID-ji in UTF-16; oba projekta in množična odstranitev; celotni in stolpčni števci; storage dogodki brez pisanja; izjemi branja in pisanja; prazni, enojni in večji seznami ter posebni ID-ji. Preveri nespremenjene podatke in odsotnost API zapisov.
3. Lastni testi lahko uvozijo javni razvojni pripomoček, a ga UI ne uvaža. Stanje in nadzorovane GET odgovore pripravi test; izjemi shrambe in štetje zapisov se nastavijo pred zagonom UI. Za osvežitev začetno seme ne sme ob vsakem nalaganju povoziti novega zapisa.
4. Zaženi `npm run lint`, `npm run build` in `npm test` z obstoječo konfiguracijo. `npm test` vključuje API, oba osnovna prikaza, razvojne teste za namizni/mobilni pogled in lastni projekt `agent`. Strežnik upravlja obstoječa Playwright konfiguracija; zaradi skupnega strežnika se zagoni testov ne prekrivajo.
5. Lastni scenarij preveri širino 390 pik v obeh pogledih, vidnost/fokus novih kontrol in ohranitev označb Folio. Po možnosti shrani posnetek za pregled v dovoljeno dokumentacijsko mapo. Ob napaki popravi le dovoljene datoteke in ponovi prizadete preglede.
6. Sproti posodobi sledljivost vseh R01–R12 in določen izvor dokazil. Končnih nedostopnih testov ne označi kot opravljenih. Ob izteku časa zadnjo minuto nameni zapisu preostanka in predaji.

## Omejitve in tveganja

Ni novih odvisnosti ali arhitekturnega preurejanja. Posebno pozornost zahtevajo dvojni klici StrictMode, pisanje brez povratne zanke, ohranitev neznanih ID-jev in ločitev celotnega od filtriranega seznama. Napaka shrambe omeji trajnost, ne uporabnosti v trenutni seji. Sočasnih sprememb strežniških podatkov in dodatne navigacije med nalaganjem ne širimo. Ta korak vsebuje samo načrt; implementacija in testi še niso izvedeni.
