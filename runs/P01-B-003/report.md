# Pilot P01, postopek B — tretji poskus

**Celoten postopek se je zaključil v 15 minutah in 11 sekundah. Vse tri
vloge so pravočasno oddale predajo, zamrznjena koda pa je opravila vseh
68 neodvisnih preverjanj.**

Uporabili smo protokol B/0.3: trije ločeni agenti zaporedno pripravijo
specifikacijo, kodo in pregled. Izhodišče Folio, navodila P01 v0.2, model
GPT-6 Astra (`xhigh`), CLI 0.154.0 in testi so enaki kot pri A. Agenti med
delom niso imeli dostopa do reference, prejšnjih rešitev ali končnih testov.

| Podatek | Rezultat |
| --- | --- |
| Skupni čas | 15 min 11 s (911,185 s); dovoljenih 20 min |
| Zaključek postopka | Uspešen (`completed`) |
| Osnovna preverjanja | 38/38 |
| Razvojna preverjanja P01 | 8/8 |
| Skrita končna preverjanja P01 | 22/22 |
| Slog, tipi in gradnja | Uspešno |
| Meje dovoljenih sprememb | Upoštevane pri vseh vlogah |
| Popravki po pregledu | Niso bili zahtevani |

## Kaj smo spremenili pred zagonom

Po neuspešnih predajah B-001 in B-002 smo čas razporedili bolj prožno.
Zgodnejši zaključek prepusti čas naslednjemu agentu, pregled pa nima več
fiksne triminutne omejitve. Vsak agent dobi svoj rok in pripomoček za
preverjanje preostalega časa. Pozivi zahtevajo sprotno shranjevanje in
pravočasno oddajo; specifikacija se osredotoči na pogoje, implementacija
pa vključuje zagon aplikacije in testov.

Pregledovalec odda strukturiran končni odgovor z obravnavanimi zahtevami,
ugotovitvami in omejitvami preverjanja. Izvajalnik ga preveri ter prenese
v datoteko predaje brez vsebinskih sprememb. Osnutek se ne šteje za
zaključen pregled. Skupna meja ostaja 20 minut.

To je nov pilotni protokol, ne ponovitev povsem enakih pogojev B-002.
Oba prejšnja poskusa ostajata nespremenjena v arhivu.

## Potek

| Faza | Čas | Rezultat |
| --- | --- | --- |
| Specifikacija | 250,939 s (4 min 11 s) | Shranjena specifikacija in običajen zaključek. |
| Implementacija | 432,171 s (7 min 12 s) | Koda, lastni testi, poročilo in posnetki; 51/51 dostopnih preverjanj. |
| Pregled | 224,582 s (3 min 45 s) | Pregled vseh R01–R10; veljavna predaja brez zahtev za popravke. |

Skupni čas vključuje samodejne predaje. Priprava okolja in neodvisna
ocena nista vključeni. Nobena faza ni bila prekinjena zaradi časovne meje.
Med delom ni bilo ročnih namigov, popravkov kode ali povratnih informacij
iz skritih testov. Po zaključku oddaje nismo spreminjali.

Implementer je opravil 38 osnovnih, 8 razvojnih in 5 lastnih preverjanj.
Pregledovalec je prebral specifikacijo, kodo, teste in dnevnike ter
pregledal shranjene posnetke. Testov in aplikacije ni ponovno zagnal;
to je izrecno navedel v predaji. Končnih testov med pregledom ni imel.

Neodvisni ocenjevalec je nato na zamrznjeni kodi izvedel vseh 68 preverjanj
ter preveril slog, tipe in gradnjo. V `evaluation-summary.json` je
`allChecksPassed:true`: uspešna sta tako zaključek postopka kot ocena kode.

## Poraba in dokazila

Končni števci vseh treh sej se ujemajo z dnevniki porabe. Skupna poraba je
894.913 vhodnih tokenov, od tega 715.648 predpomnjenih, ter 26.574 izhodnih
tokenov, od tega 3.860 za sklepanje. Predpomnjeni vhod in sklepanje sta že
vključena v pripadajoči vsoti. Stroška v evrih iz naročniške porabe ne
izračunavamo.

- `submission/`: nespremenjena končna koda, testi in dokumenti agentov.
- `phases/`: pozivi, nastavitve, časi, dnevniki in predaja vsake faze.
- `procedure-b.json` in `protocol-at-launch/`: protokol ter izvajalnik ob zagonu.
- `evaluation-summary.json`: rezultati neodvisne ocene.
- `usage-observation.json`: preverjeni števci po sejah.
- `manifest.json.gz` in `final-inventory.json.gz`: začetne in končne datoteke.

Osnovni mag-app ostaja na istem commitu. Posebnosti izvoza so shranjene v
`input-overrides/`. Omejitev dostopa do lokalnih orodij Xcode je agentu
preprečila uporabo Gita; izvajalnik je dovoljene spremembe preveril z
evidenco datotek. To ni preprečilo gradnje ali testov.

## Omejitve rezultata

Pilot potrjuje, da je B/0.3 v tej izvedbi uspešno predal vse tri faze.
Pregledovalec ni zahteval popravkov, zato nadaljevanje prvotnih agentskih
sej po pregledu v dejanskem modelskem zagonu še ni preizkušeno. Predaja
popravkov, nepopoln pregled in iztek časa so preverjeni z enotskimi
simulacijami izvajalnika, ne z dodatnimi merjenimi izvedbami modela.

To ni glavna meritev ali dokaz prednosti B pred A. Mobilni scenariji so
emulacija v Chromiumu. Uspeh testov ne dokazuje pravilnosti za vsa mogoča
stanja aplikacije.

[Protokol B](../../docs/pilot-b-protocol.md) · [Pregled pilotov](../../docs/pilot-results.md)
