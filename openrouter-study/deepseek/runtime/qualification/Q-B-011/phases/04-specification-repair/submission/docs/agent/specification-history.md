# Zgodovina specifikacije — kvalifikacija Q

- v1: R01 in R02 v skladu z `task/instructions.md`; Q01: result[i] = input[i] + 1.
- Pregled `docs/agent/review.json`: zahtevi po razdelku "AMBIENT DATA" in zapisu na dve decimalki sta neutemeljeni — v `task/instructions.md` teh zahtev ni, zato ju ne dodam.
- v2 (popravek): vrstica Q01 je bila neskladno spremenjena na `+ 2`; vrnjena na točno zahtevano vrstico `Q01: result[i] = input[i] + 1`.
- Opomba: `src/qualification.ts` trenutno vrača +2 (test ne uspe); koda ni v obsegu te vloge in je nisem spreminjal.
