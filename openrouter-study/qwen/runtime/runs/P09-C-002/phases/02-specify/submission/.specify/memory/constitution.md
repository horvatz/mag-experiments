# Ustavna shema - Pilot P09, postopek C

## Ime projekta
Sledilčica: delovni pregled opravil s prilagodljivimi filtri, zgodovino stanja in preglednica/tabla.

## Načela in cilji
- Zahteva uporabnika so edini izvirni merila; izpolnjujejo se kot strog niz preslicav.
- Odgovori na naloge so jasni, enostavni in sledijo vzorcom obstoječe kodi.
- Najmanjša sprememba: dopolni obstoječi vmesnik, ne dodajaj nepotrebnih funkcij.
- Vsi podatki prihajajo iz /api/; noben zapis ne gre na API, stanje se ne shrani v localStorage.
- Preverjanje: prikaži vse naloge s pravilnim števcem, ohrani data-task-id in aria-label.

## Nepogojljiva pravila
- Ne dodaj novih odvisnosti, strežnika, skupnih testov ali sprememb infrastructure.
- Ne širi se obseg nalog; ne spreminja se tests/baseline.spec.ts in tests/api.spec.ts.
- Dokumenti iz docs/dizajn.md (Folio) ostajajo kot vizualni cilj.
- Sproži naslednji korak iz spec-kit zaporedja sicer avtomatsko po zaključku koraka.
