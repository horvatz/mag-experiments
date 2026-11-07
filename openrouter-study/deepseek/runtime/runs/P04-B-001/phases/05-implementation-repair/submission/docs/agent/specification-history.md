# Zgodovina specifikacije P04

- 2026-11-01, v0.1 (avtor specifikacije): prvi osnutek z namenom, vhodi, dejanji in izidi.
- 2026-11-01, v1.0 (avtor specifikacije): dopolnjeni pogoji R01 do R12 s predikati, dogovor o vmesniku, sledljivost in omejitve. Izidi preverjanja ostajajo neizvedeni; vnese jih implementer po dejanskem zagonu.

- 2026-11-01, v1.1 (avtor specifikacije, po pregledu): upoštevana ugotovitev pregleda pri R06. Predikata E in cmp sta dopolnjena tako, da je pri primarnem ključu `original` E(t, u) = 0 in cmp(t, u) = idx(t) - idx(u) ne glede na sekundarni ključ in smeri; izjema je zdaj del formule in ni več v nasprotju s pravilom S = T.
- 2026-11-01, v1.1 (zavrnjeno kot izven vloge): ugotovitev pregleda o sekundarnem selectu, ki ponuja `original` (R05), zadeva `src/App.tsx` in jo mora odpraviti implementer kot lastnik kode; specifikacija ostaja nespremenjena, saj že zahteva možnosti none/title/assignee/status/dueDate.
