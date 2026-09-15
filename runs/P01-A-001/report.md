# Pilot P01, postopek A

En agent je iz navodil pripravil specifikacijo, implementacijo urejanja opravila in lastna preverjanja.
Referenčne rešitve in končnih testov med delom ni imel na voljo.

| Podatek | Rezultat |
| --- | --- |
| Model | GPT-6 Astra (xhigh) |
| Zaključek | Samostojno zaključeno |
| Čas agenta | 13 min 21 s; omejitev 20 min |
| Osnovna preverjanja | 38/38 |
| Razvojna preverjanja P01 | 8/8 |
| Končna preverjanja P01 | 22/22 |
| Dovoljene spremembe | Da |
| Slog, tipi in gradnja | Uspešno |

Čas vključuje specifikacijo, kodo in preverjanje agenta. Priprava okolja in končna ocena nista vključeni.
Osnovna aplikacija mag-app ostaja pri pripetem commitu; izdelek pilota je shranjen ločeno v submission/.

CLI je zabeležil 1.071.373 vhodnih tokenov, od tega 999.680 iz predpomnilnika,
in 24.503 izhodne tokene, od tega 6.022 za razmišljanje. Vrednosti »od tega«
so že vključene v skupni številki; ne seštevamo jih še enkrat.
Zagon uporablja obstoječo prijavo ChatGPT. Iz porabe nismo izračunali stroška API ali zneska v evrih.

Rezultat velja za eno izvedbo pilotne naloge. Ne dokazuje prednosti postopka A, popolnosti testov ali pravilnosti za vsa mogoča stanja.
Mobilna preverjanja so emulacija v Chromiumu.

Navodila in nastavitve so ob poročilu. Stisnjena izpisa dogodkov in datotek ohranjata sled izvedbe.
Vhodne datoteke aplikacije določa baseline v evaluation-summary.json; posebnosti izvoza so v input-overrides/.
Natančen opis okolja je v ../../docs/pilot-protocol.md. Shranjena konfiguracija in dnevnik te izvedbe imata prednost pred poznejšimi izboljšavami izvajalnika.
