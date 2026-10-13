# Konstitucija P08 – Koledarski pregled rokov

## Ime projekta
Koledarski pregled rokov (slovenščina), Pilot P08, Postopek C.

## Vodilna načela
- Podatke odčrpljuj iz obstoječega javnega API-ja `/api/`; ne implementiraj novih zapisovalnih endpoints.
- Ohrani potrjen dizajn Folio: imena, urejenost, `aria-label`s in obstoječe kognitivne vzorce neposredno nadgrajuj.
- Deluj eno jedrno: en agent, en spec, en načrt, ne zaganjaj drugih agentov.
- Vse datume obravnavaj kot koledarske YYYY-MM-DD (brez časovnih pasov in poletnih časov).
- Pripravljaj dokazila sproti, jedrnato; brez dveh in več vej, brez Commitov.
- Spreminjaj samo dovoljena območja: `src/`, `tests/agent/`, `docs/agent/`.
- Datum sprejetja: 2026-10-09.

## Nedogovarljiva pravila
- Brez sprememb skupne infrastrukture: strežnik, odvisnosti, skupni tipi in testni framework.
- Vmesniške funkcionalnosti dopolnjuj s `id`–filtriranjem; ne dodajaj novih zapisovalnih API-jev.
- Ustava velja za celoten potek Spec Kit postopka (specify → plan → tasks → implement).

