# Dodatni eksperiment z GPT-6 Luna

**Zaključeno 29. septembra 2026:** 72/72 meritev, 24/24 vsebinskih presoj,
primerjava vseh 144 arhivov, preverjena preglednica, grafi in samostojni PDF.
Začni s [končnimi zaključki](analysis/final-summary.md) in
[uspešno končno revizijo](analysis/final-verification.json).
Navodila za zagon spodaj opisujejo že izvedeni postopek; vrste ne zaganjaj ponovno.

To je ločena zbirka L/1.0, pripravljena na uporabnikovo naročilo 27. septembra
2026. Stara zbirka M/1.0 ni spremenjena. [Protokol](protocol.md) določa 72 novih
meritev in omejitev zgodovinske primerjave zaradi druge različice izvajalnika.

- `runtime/`: izolirana kopija vhodov, izvajalnikov, razporeda in novih arhivov.
- `setup.json`: izvorna zbirka, natančne prilagoditve in pripeti paket CLI.
- `qualification/`: preverbe dostopa in tehnični dnevniki, zunaj 72 meritev.
- `runtime/qualification/`: vse kvalifikacije modela, tudi neuspešne.
- `frozen-inputs.json`: zamrznitev po uspešni kvalifikaciji pred meritvami.
- `runtime/main-study/active.json`, `status.json`: živo stanje po zamrznitvi.
- `analysis/reporting-results.json`: podatki za poročanje, null ni nič.

Zagon kvalifikacije, zamrznitve in vrste je raziskovalčev postopek, ne poziv
merjenemu modelu. Po zamrznitvi `node luna-study/run.mjs` nadaljuje pri prvem
še nezačetem ID-ju. Pred tem preveri živo ključavnico in procese. Nikoli ne
odstrani žive ključavnice in nikoli ne ponovi že začetega ID-ja.

Luna uporablja naročnino. API ključ ali sprememba globalne prijave ni potrebna.
Neznani ali nepopolni rezultati se ohranijo; 70 preverjanj ne predstavlja vseh
mogočih stanj aplikacije. A/B/C se primerjajo znotraj iste zbirke; Astra–Luna
je zgodovinska primerjava z izrecno omejitvijo izvajalnika in obdobja.
