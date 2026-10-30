# Projektna ustava – Pilot P05

**Dobrodošli v aplikaciji Folio.**
Ta dokument razrešuje temeljna načela, na katerih temelji obvezno delo v tem projektu.

## Naloga

- Dopolni obstoječi uporabniški vmesnik za straničenje infiltriranje opravil po velikosti strani (all/2/5/10) in statusu (all/todo/in_progress/done).
- Prikaži in filtriraj podatke prek javnega API-ja /api/ ob izbiranju po ID-u.

## Projektna pravila

### Glej navodila in predlogo specifikacije
- Uporabi task/instructions.md za zahteve R01&R12 in task/specification-template.md za obvezno specifikacijo.
- Ne širite obsega dela; sledite izrecnim navodilom.

### Ohrani potrjeni dizajn
- Slovenska poimenovanja in urejenost vzorca Folio iz docs/dizajn.md.
- Uporabi data-task-id, obstoječa imena pogledov in stolpcev ter aria-label="Pregled stanj opravil".

### Javni vmesnik
- Vsi podatki preberi in shranjuje prek /api/.
- Ne nadomeščaj strežnika z lokalno shrambo ali localStorage.

### Testiranje
- Preveri s skupnimi testi in dodaj lastne teste v tests/agent/.
- Testne kontrole /__test/ upravlja samo testni program.

### Meje sprememb
- Pisaj le v src/, tests/agent/ in docs/agent/.
- Ne spreminjaj strežnika, skupnih tipov, odvisnosti ali skupnih testov.
