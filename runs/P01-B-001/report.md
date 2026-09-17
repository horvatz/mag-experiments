# Pilot P01, postopek B: neuspešna predaja specifikacije

Prvi poskus B se je ustavil po 3 minutah. Avtor specifikacije do omejitve
180 sekund ni shranil `docs/agent/specification.md`. Implementer in
pregledovalec zato nista bila zagnana. Rešitev P01 ni bila izdelana.

- Model: GPT-6 Astra, `xhigh`, Codex CLI 0.154.0.
- Skupna dovoljena omejitev: 20 minut; dosežena je bila omejitev prve faze.
- Začetna aplikacija je pred zagonom opravila vseh 38 osnovnih preverjanj.
- Končno ocenjevanje ni bilo izvedeno, ker implementacija ni bila predana.
- Celotna poraba ni znana: prekinjena seja ni vrnila končnega dogodka porabe.
- Med izvajanjem nismo posredovali namigov ali ročno spreminjali datotek.

To je neuspešen poskus predaje, ne uspešno izvedena primerjava treh agentov.
Ohranjen je v celoti, vključno s pozivom, nastavitvami, dnevnikom in stanjem
datotek. Protokol ob zagonu je v `protocol-at-launch/`.

V naslednjem poskusu [P01-B-002](../P01-B-002/report.md) je bila omejitev
priprave specifikacije vnaprej povečana na 300 sekund. Poziv zahteva sprotno
zapisovanje dokumenta. Skupna omejitev 20 minut ter zahteve, model in testi
so ostali enaki. Ta prilagoditev je del pilota in je ne prikrivamo pri
primerjavi s postopkom A.
