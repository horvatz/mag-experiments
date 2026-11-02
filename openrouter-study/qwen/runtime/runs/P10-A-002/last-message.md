```
apply_patch
*** Begin Patch
*** Update File: docs/agent/specification.md
@@ -0,0 +1,103 @@
+# Specifikacija umetnega vrstnega reda
+
+## Problem in kontekst
+
+Aplikacija Folio omogoča upravljanje opravil v projektih. Podpirata se dva pogleda: preglednica (seznam) in tabla (kanban stil). Sedaj dodajamo funkcionalnost umetnega vrstnega reda z možnostjo premikanja opravil, razveljavljanja in ponavljanja premikov.
+
+## Vhodi, dejanja in izidi
+
+### Podatkovni vnos
+
+- Projekti z enimi ali več opravili (ID-ji so neposredni nizovi npr. `web-01`)
+- Vsako opravilo ima `projectId`, `title`, `status`, `assignee`, `dueDate`, `description`
+
+### Dejanja
+
+| Dejanje | Področje | Pogoj |
+|---------|----------|-------|
+| Premakni gor | Preglednica in tabla | Obnašanje velja za vse |
+| Premakni dol | Preglednica in tabla | Obnašanje velja za vse |
+| Razveljavi premik | - | Ko obstaja neskončna zgodovina |
+| Ponovi premik | - | Ko obstaja neskončna zgodovina |
+| Začetni vrstni red | - | Vse vrstice in zgodovina se vrnejo na izhodišče |
+
+### Pričakovani izidi
+
+- Vrstni red opravil se spremeni le z veljavnim premikom
+- Zgodovina beleži vse premike
+- Razveljavitev in ponavljanje ohranita storitve
+- Zapisovanje na API/verzija podatkov ostane enaka
+
+## Zahteve in pravila
+
+| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
+|---------|--------------------------------|-------------------|
+| R01 | Ob začetku je vrstni red enak prejetemu polju | Če je API vrne opravila `[A, B, C]`, je UI vrstni red `[A, B, C]` |
+| R02 | Gumbi premakneta opravilo z neposrednim predhodnikom/naslednikom | `Premakni 2 gor` → `[B, A, C]`; `Premakni 3 dol` → `[B, C, A]` |
+| R03 | Robna dejanja (prvo gor/zadnje dol) so onemogočena | Prvo opravilo ne sme pasti gor; zadnje opravilo ne sme pasti dol |
+| R04 | Vsak premik zapiše permutacijo v zgodovino | Zgodovina vsebuje zaporedne vrstne rede |
+| R05 | Ponovitev prevzame zadnjo razveljavljeno permutacijo | `Ponovi` vrne prejšnji stanje |
+| R06 | Nov veljaven premik po razveljavitvi zavrže ponovitve | `Ponovi` ne deluje po novem premiku |
+| R07 | Shranjujeta se največ 20 permutacij | Starše permutacije se izbrišejo pri 21. premiku |
+| R08 | Začetni vrstni red vrne izvorno permutacijo | `Začetni vrstni red` vrne originalno vrstni red |
+| R09 | Preglednica in tabla uporabljata iste premike | Premiki uporabljajo globalno mesto, ne relativno |
+| R10 | Preklop pogleda in osvežitev ohranita vrstni red | Navi gredo ohranijo spremembe |
+| R11 | Števec kaže `Razveljavitve: U. Ponovitve: R.` | Števec je usklajen z gumbi |
+| R12 | Spremembe so lokalne permutacije | Brez zapisov na API |
+
+## Simboli in predpostavke
+
+- `U`: število razveljitev
+- `R`: število ponovitev
+- `N`: število opravil v projekta
+- Prvo opravilo = indeks 0; zadnje opravilo = indeks N-1
+- `Premakni gor`: zameni opravilo z neposrednim predhodnikom
+- `Premakni dol`: zameni opravilo z neposrednim naslednikom
+
+## Odprta vprašanja in omejitve
+
+- Projekt ni prazen: vsaj eno opravilo
+- ID-ji opravil so edinstveni znotraj projekta
+- API ni obremenjen; sprememba opravil ne vpliva na vrstni red
+- Študenti in podaljški so lokalni v projekta
*** End Patch
```
