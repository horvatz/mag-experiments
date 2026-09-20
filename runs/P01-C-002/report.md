# Pilot P01, postopek C — Lean

**Celoten postopek se je uspešno zaključil v 15 minutah in 52 sekundah.
Neodvisna ocena oddane kode je uspešna: 68/68 preverjanj ter slog, tipi
in gradnja.**

En agent GPT-6 Astra (xhigh, CLI 0.154.0) je v isti seji izvedel šest
uradnih korakov Spec Kit 1.0.8 z uradnim presetom Lean 1.0.0. Izhodišče
Folio, zahteve P01 v0.2, testi in skupna omejitev 20 minut ostajajo enaki
kot pri A in B. Med delom ni imel dostopa do reference, prejšnjih rešitev
ali končnih testov. Ročnih namigov in popravkov ni bilo.

| Podatek | Rezultat |
| --- | --- |
| Protokol | C/0.2, Spec Kit 1.0.8 + Lean 1.0.0 |
| Skupni čas | 952,058 s — 15 min 52 s |
| Zaključek | completed, zaključni pregled converged |
| Osnovna preverjanja | 38/38 |
| Razvojna preverjanja P01 | 8/8 |
| Skrita končna preverjanja P01 | 22/22 |
| Slog, tipi in gradnja | Uspešno |
| Dovoljene spremembe | Upoštevane v vseh fazah |
| Celotna poraba | Zabeležena in preverjena po isti seji |

## Potek in predaje

| Korak | Čas | Rezultat |
| --- | ---: | --- |
| constitution | 97,316 s | Projektna načela. |
| specify | 172,258 s | Specifikacija vseh R01–R10 in pravila sprememb stanja. |
| plan | 106,775 s | Tehnični načrt v enem dokumentu. |
| tasks | 66,340 s | Devet nalog za implementacijo in preverjanje. |
| implement | 434,402 s | Koda, 14 lastnih testov in popolna predaja. |
| converge | 71,501 s | Pregled skladnosti; dodatne naloge niso bile potrebne. |

Skupni čas vključuje tudi samodejne predaje. Priprava prvih štirih korakov
je skupaj s predajami trajala približno 7 minut in 25 sekund. Vse faze
so nadaljevale isto sejo; zaključni pregled zato ni neodvisen drugi agent.

Agent je med implementacijo dvakrat naletel na nedelujoči sistemski
Python pri urejanju dokumentov in uporabil Node. Prvi celotni pregled
je odkril tipsko napako v njegovem testu; popravil jo je sam. Čas teh
poskusov ostaja v meritvi. Nato je npm run check opravil vseh **60**
dostopnih testov: 38 osnovnih, 8 razvojnih in 14 lastnih. Shranjen je
tudi pregledan posnetek obrazca pri širini 390 px.

V koraku converge je agent pregledal kodo, vseh deset zahtev, načrt,
naloge in dokazila. Testov ni ponovno zagnal in je to izrecno zapisal.
Datoteka nalog je ostala nespremenjena, vseh devet nalog je označenih
kot opravljenih. Neodvisni ocenjevalec je šele po oddaji na zamrznjeni
kodi izvedel vseh 68 skupnih preverjanj; lastni testi agenta niso del
tega števila.

## Poraba

Končni števci so preverjeni glede na dogodke porabe iste seje. Ker so
posamezne faze nadaljevanja, njihovih kumulativnih števcev ne seštevamo.

- Vhodni tokeni: **2.452.527**, od tega 2.194.560 predpomnjenih.
- Izhodni tokeni: **27.494**, od tega 3.806 za sklepanje.
- Zapis v predpomnilnik: 0 po vrnjenem števcu.

Podštevci so že vključeni v ustrezni vsoti. Uporabljena je bila obstoječa
prijava ChatGPT; poraba ni račun API in je ne pretvarjamo v evre.

## Razlika od prvega poskusa

[C-001](../P01-C-001/report.md) je uporabil polne veščine brez preseta.
Koda je opravila 68/68 preverjanj, predaja implementacije pa ni bila
pravočasno zaključena in converge ni stekel. Ta rezultat ohranjamo.

Pred C-002 smo izbrali uradni Lean preset, ki skrajša zahtevane dokumente.
To je sprememba pilotnega protokola, ne ponovitev enakih pogojev.
Pred začetkom merjenja smo preverili odvisnosti Python, dostop do
začasnih datotek na macOS, vse meje pisanja in 38 osnovnih testov.
Neuspele priprave okolja niso bile modelski zagoni; njihove lokalne
kopije so ohranjene v .work/setup-attempts/.

## Dokazila in omejitve

[Oddaja](submission/) je nespremenjena, [faze](phases/) pa ohranjajo vse
pozive, nastavitve, dnevnike in predaje. [Izvajalnik ob zagonu](protocol-at-launch/),
[protokol](procedure-c.json) in [uradne predloge](spec-kit-at-launch/)
vsebujejo zamrznjeno okolje. spec-kit-runtime.json.gz beleži Python okolje;
[poraba](usage-observation.json) in [neodvisna ocena](evaluation-summary.json)
vsebujeta podrobne rezultate. Prilagoditev sistemskega mktemp je določena
v zamrznjeni pripravljalni skripti. Osnovna aplikacija mag-app je nespremenjena.

Popravki po zaključnem pregledu niso bili zahtevani. Dodatni krog
implement → converge je preverjen s simulacijo izvajalnika, še ne z
dejanskim modelskim zagonom. Mobilni testi uporabljajo emulacijo v
Chromiumu. En pilot ne dokazuje popolnosti testov ali prednosti postopka C.

[Pregled vseh pilotov](../../docs/pilot-results.md) · [Protokol ob zagonu](protocol-at-launch/pilot-c-protocol.md)
