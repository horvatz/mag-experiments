# Specifikacija: Koledarski pregled rokov (P08)

## Problem in kontekst

Uporabnik potrebuje pregled opravil po koledarskih skupinah glede na referenčni datum. Obstojča aplikacija prikazuje opravila po projekte v vmesnu tabelo in tabla. Dodajamo funkcionalnost razvrščanja v pet pogledov rokov: vse (all), zapadlo (overdue), danes (today), naslednjih 7 dni (week), poznejši (later) in končano (done).

Implementacija zahteva dodajanje kontrol za referenčni datum in izbirnik pogleda, pet števcev in logiko za avtomatsko razvrščanje opravil v ustrezne skupine.
- The view shows only tasks from the selected group based on the reference date.
- A valid reference date triggers an immediate recalculation of groups and visible rows, keeping the active filter.
- An empty date field shows a warning: "Enter a valid reference date" and keeps the last valid recalculation. A new valid date removes the warning.
