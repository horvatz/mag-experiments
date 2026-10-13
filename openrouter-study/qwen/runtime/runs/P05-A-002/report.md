# Glavna naloga P05, postopek A

En agent je iz navodil pripravil specifikacijo, implementacijo naloge in lastna preverjanja.
Referenčne rešitve in končnih testov med delom ni imel na voljo.

| Podatek | Rezultat |
| --- | --- |
| Model | qwen/qwen3.5-9b (xhigh) |
| Zaključek | time_limit |
| Čas agenta | 20 min 0 s; omejitev 20 min |
| Osnovna preverjanja | 14/38 |
| Razvojna preverjanja P05 | 0/8 |
| Končna preverjanja P05 | 0/24 |
| Dovoljene spremembe | Da |
| Slog, tipi in gradnja | Glej evaluation-summary.json |

Čas vključuje specifikacijo, kodo in preverjanje agenta. Priprava okolja in končna ocena nista vključeni.
Osnovna aplikacija mag-app ostaja pri pripetem commitu; izdelek izvedbe je shranjen ločeno v submission/.

Poraba, kot jo je vrnil CLI: podatek ni na voljo.
Delno opažena poraba pred prekinitvijo (spodnja meja, ne celotna poraba): {"input_tokens":2869548,"cached_input_tokens":566528,"cache_write_input_tokens":0,"output_tokens":24752,"reasoning_output_tokens":2818}.
Zagon uporablja OpenRouter API. Dejansko zaračunani strošek in popolnost evidence sta ločena v api-cost.json; tokenov ne pretvarjamo v evre.

Rezultat velja za eno izvedbo naloge. Ne dokazuje prednosti postopka A, popolnosti testov ali pravilnosti za vsa mogoča stanja.
Mobilna preverjanja so emulacija v Chromiumu.

Navodila in nastavitve so ob poročilu. Stisnjena izpisa dogodkov in datotek ohranjata sled izvedbe.
Vhodne datoteke aplikacije določa baseline v evaluation-summary.json; posebnosti izvoza so v input-overrides/.
Natančen opis okolja je v ../../docs/main-protocol.md. Shranjena konfiguracija in dnevnik te izvedbe imata prednost pred poznejšimi izboljšavami izvajalnika.
