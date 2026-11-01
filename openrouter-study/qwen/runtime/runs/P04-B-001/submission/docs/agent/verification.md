# Razvrščanje opravil
Datum: 2026-11-01T01:19:24.000Z

## R01 - Privzeti ključni parametri
- Primarni ključ: original (vrstni red v API odgovoru)
- Smera: ascending (default)
- Sekundarni ključ: none

## R02 - Normalizacija text polj
- Primarni ključ 'title' ali 'assignee'
- Niz obravnavamo kot UTF-8 niz
- Uporabimo .toLocaleLowerCase() za UTF-16 primerjavo
- NDF normalizacija (Canonical Decomposition)
- Uro 6.8.2 2.1.1 (https://unicode.org/reports/tr15/#NFD_Lemma)

## R03 - Specifični sortni red za določene naloge
- 'status': todo, in_progress, done
- 'dueDate': ISO-8601 YYYY-MM-DD kronološko

## R04 - Obrat smeri
- asc/desc obrne le sortiran matriko, ne povratno vrstni red
- Stanja 'todo', 'in_progress', 'done' se ne obrnejo znotraj enake vrednosti

## R05 - Sekundarni ključ uporabi le ob enakosti primarnega
- Enaknost: primarni ključ enak, primerjava z '===' operator
- Sekundarni ključ uporabi le pri enakosti primarnega

## R06 - Izhodni vrstni red
- Pri enakem sekundarnem ključu: ohrani primarni sortni red
- Pri enakem primarnem in sekundarnem ključu: ohrani originalni vrstni red
- original na primarnem ključu vedno vrne originalni vrstni red brez dodatnega obrata

## R07 - Stalni vrstni red stolpcev
- Primarni ključ (primarni sortni ključ)
- Sekundarni ključ (sekundarni sortni ključ)
- Tretji stolpec (prikaz podatkov)

## R08 - Preklop pogleda ohranja nastavitve
- Tablica <> Tabla ohrani izbire
- Odpiranje podrobnosti ohrani nastavitve
- Zapiranje ne spremeni nastavitve

## R09 - Menjava projekta
- Ponastavi vse štiri nastavitve (primarni ključ, sekundarni ključ, smeri)
- Osvežitev ponastavi vse nastavitve
- Nastavitve niso shranjene trajno
## R10 - Gumb Izvorni vrstni red
- Ponastavi vse štiri nastavitve
- Delovanje: primarni ključ=original, sekundarni ključ=none, smeri=ascending
- Prazen projekt: deluje pri vseh ključih in smereh (brez aktivnih opravil)

## R11 - Projekcija (sortiranje ne spremeni podatkov)
- Primer: original vrstni red -> sortiran prikaz -> navrat na original
- Podatka ne pošiljamo nazaj API-ju
- Podatkovni zapis ostaja nespremenjen

## R12 - Edinstven prikaz ID-jev
- Vsak ID prikazan natanko enkrat
- Enaki naslovi ne povzročajo duplikacije
- Podrobnosti pravilno odpirajo opravila po ID-ju
- Ohraniti obstoječe bralne funkcije in videz Folio

---
Datum uvrstitve: 2026-11-01T01:19:24.000Z
