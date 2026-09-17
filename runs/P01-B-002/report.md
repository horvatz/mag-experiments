# Pilot P01, postopek B

**Predana koda je opravila vseh 68 neodvisnih preverjanj. Celoten postopek B
se ni zaključil pravilno, ker pregledovalec ni pravočasno shranil predaje.**

Trije ločeni agenti so zaporedno pripravljali specifikacijo, implementacijo
in pregled. Uporabili so isto začetno aplikacijo, zahteve P01 v0.2, model
GPT-6 Astra (`xhigh`) in Codex CLI 0.154.0 kot pri A. Referenčne rešitve,
rešitve A in skritih testov med delom niso imeli na voljo.

| Podatek | Rezultat |
| --- | --- |
| Skupni čas | 15 min 57 s (957,277 s); dovoljenih 20 min |
| Stanje postopka | Nepopolna predaja pregledovalca (`invalid_review_handoff`) |
| Osnovna preverjanja | 38/38 |
| Razvojna preverjanja P01 | 8/8 |
| Skrita končna preverjanja P01 | 22/22 |
| Slog, tipi in gradnja | Uspešno |
| Meje dovoljenih sprememb | Upoštevane pri vseh vlogah |
| Celotna poraba tokenov | Ni popolnega podatka zaradi prekinjenih faz |

## Kaj se je zgodilo

| Faza | Čas | Predaja |
| --- | --- | --- |
| Specifikacija | 5 min | Dokument in zgodovina sprememb sta shranjena; seja je dosegla časovno mejo. |
| Implementacija | 7 min 53 s | Običajen zaključek; koda, testi in poročilo so predani. |
| Pregled | 3 min | Seja je dosegla mejo brez `review.md` in `review.json`. |

Preostanek skupnega časa se ni uporabil, ker brez veljavnega pregleda
izvajalnik ni mogel določiti popravkov. Faz popravljanja ni bilo. Med
izvajanjem nismo posredovali namigov, ročno spreminjali kode ali agentom
razkrili končnih testov. Po ustavitvi predaje nismo popravljali.

Implementer je dodal urejanje naslova in stanja, preklic, preverjanje vnosa,
prikaz čakanja, obravnavo zavrnitve in posodobitev prikazov po shranjevanju.
Opravil je 59 dostopnih preverjanj: 38 osnovnih, 8 razvojnih in 13 lastnih.
Pregledovalec je vseh 59 preverjanj ponovil uspešno, vendar svojih ugotovitev
ni oddal v zahtevani obliki. Zato uspeha testov ne predstavljamo kot
zaključen ali odobren pregled.

Neodvisna ocena po ustavitvi je opravila vseh 68 preverjanj. V
`evaluation-summary.json` je `allChecksPassed` kljub temu `false`, ker ta
zastavica zahteva tudi pravilno zaključen postopek. Posamezna preverjanja
kode so uspešna; vzrok za neuspeh postopka je predaja.

## Poraba in dokazila

`usage-observation.json` ločeno ohranja podatke vsake agentske seje. Skupaj
je bilo do zadnjih razpoložljivih dogodkov zabeleženih 1.043.493 vhodnih
(vključno z 888.320 predpomnjenimi) in 25.740 izhodnih tokenov. **To je delni
zapis, ne celotna poraba zagona.** Prekinjeni fazi nista vrnili končnega
števca. Stroška v evrih ne izračunavamo iz naročniške porabe.

- `submission/`: nespremenjena končna koda, testi in dokumenti agentov.
- `phases/`: pozivi, nastavitve, čas, dnevniki in kopija predaje vsake faze.
- `procedure-b.json`: vnaprej določeni pozivi in časovne omejitve.
- `protocol-at-launch/`: izvajalnik in protokol ob zagonu.
- `evaluation-summary.json` in dnevniki: neodvisna ocena.
- `manifest.json.gz` in `final-inventory.json.gz`: začetne in končne datoteke.

Osnovni mag-app ostaja nespremenjen. Posebnosti izvoza so v
`input-overrides/`, skupno izhodišče pa določa `baseline` v povzetku ocene.
Poznejše izboljšave izvajalnika ne spreminjajo te arhivirane izvedbe.

## Kaj pomeni rezultat

Prejšnji [poskus B-001](../P01-B-001/report.md) se je ustavil že po prvi
fazi, ker specifikacija v treh minutah ni bila shranjena. Za ta novi poskus
smo pred zagonom povečali njeno omejitev na pet minut in zahtevali sprotno
zapisovanje. Oba poskusa ostajata zabeležena.

Pilot je pokazal, da lahko predana koda uspešno opravi pripravljena merila,
predaja med vlogami in časovna razporeditev pa še potrebujeta prilagoditev.
Tri minute za pregled v tej izvedbi niso zadostovale za zahtevano predajo.
To ni dokaz splošne prednosti ali slabosti B, niti dokončna primerjava z A.
Mobilni scenariji uporabljajo emulacijo v Chromiumu. Uspeh testov ne dokazuje
pravilnosti vseh mogočih stanj aplikacije.

[Protokol B](../../docs/pilot-b-protocol.md) · [Pregled pilotov](../../docs/pilot-results.md)
