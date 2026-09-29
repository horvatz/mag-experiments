# Prvi pilot P01 po postopku A

Pilot preveri, ali lahko en agent iz navodil sam pripravi specifikacijo,
doda urejanje opravila in preveri rešitev. Je poskus izvedbe, ne primerjava
treh postopkov in ne del glavnih meritev.

## Vhod in omejitev

Agent dobi izvoz commita iz `baseline.json`, navodila P01 v0.2, skupna
pravila, predlogo specifikacije in štiri razvojne scenarije. Izvoz nima
zgodovine Git, referenčne rešitve ali končnih testov.

Za prvi pilot je izbran GPT-6 Luna, nastavitev razmišljanja `xhigh`,
prek že prijavljenega Codex CLI 0.158.0-alpha.2.1. Omejitev je 20 minut. Čas začne
teči ob zagonu nove agentske seje in vključuje specifikacijo, spremembe
kode, preverjanje in končno poročilo. Priprava okolja in poznejše
ocenjevanje sta izmerjenemu delu agenta izključena.

Zagon se konča ob zaključku agenta ali časovni omejitvi. Med delom
ne posredujemo namigov ali rezultatov končnih testov. Morebitna prekinitev,
napaka okolja ali poseg izvajalca se zabeleži; take izvedbe ne predstavljamo
kot običajnega uspešnega zaključka.

## Delovno okolje na tem računalniku

Izvoz je v `.work/pilots/<ID>/app`. Agent sme spreminjati samo `src/`,
`tests/agent/` in `docs/agent/`. Skupni strežnik, podatki, tipi, odvisnosti,
navodila in skupni testi so samo berljivi. Za rezultate preverjanj in
predpomnilnike ima posebej določene začasne mape.

Profil Codexa omeji branje na izvoz in potrebne izvajalne datoteke.
Referenca, končni testi, osebne prijave in zapiski niso berljivi. Osebna
konfiguracija, dodatki, povezane aplikacije, spomini in veščine niso del
poziva. Uporablja se nova seja brez zgodovine prejšnjega pogovora.

Ukazi agenta imajo prek omrežnega posrednika dostop do lokalnih storitev.
Znana vrata reference in ocenjevalca morajo biti zaprta; izvajalnik jih
preverja tudi med delom. Neposreden dostop v internet je blokiran.
To je omejeno lokalno okolje na macOS, ne navidezni stroj: lokalne storitve
so še vedno skupni vir, zato pred vsako izvedbo preverimo, kaj je odprto.

Chromium potrebuje ločen proces, ker ga macOS znotraj običajnega profila
Codexa ne zažene. Njegov celoten proces, vključno s strežnikom Playwright,
teče v svojem sistemskem profilu. Bere le izvoz in izvajalne datoteke,
piše v svojo začasno mapo ter se povezuje samo na vrata pilotne aplikacije.
Testni vmesnik posluša na `127.0.0.1:9223` in uporablja naključen ključ.
Agent ga uporablja prek nastavljenega `connectOptions` oziroma
`chromium.connect()` s podatki iz `task/browser.json`.

Izvajalec v izvozu doda dva projekta za razvojne teste P01, povezavo do
testnega brskalnika ter podmapi za testna poročila. To so spremembe okolja,
ne rešitve P01; vsebina skupnih testov in zahteve ostanejo enake.

## Zaporedje zagona

1. `node scripts/prepare-pilot.mjs P01-A-001` ustvari nov izvoz. Obstoječega
   identifikatorja ne prepiše.
2. Ustavi referenčni predogled in druge zagone ocenjevalca.
3. `node scripts/pilot-browser.mjs P01-A-001` zažene omejeni brskalnik.
4. `node scripts/preflight-pilot.mjs P01-A-001` preveri zaščito datotek,
   začetni kontekst, gradnjo in vseh 38 osnovnih preverjanj.
5. `node scripts/run-pilot.mjs P01-A-001` zažene enega agenta. Shrani
   navodila, nastavitve, dogodke, čas, porabo in končno stanje datotek.
6. Ko se agent zaključi, ustavi testni brskalnik.
7. `node scripts/evaluate-pilot.mjs P01-A-001` iz zamrznjene predaje in
   zaupanja vredne infrastrukture sestavi kandidata ter ga oceni.

Na macOS morata sistemska profila teči neposredno na gostitelju.
Vgnezdeni zagon znotraj že omejenega terminala lahko sistem zavrne.
Ukazi ne spreminjajo uporabnikove konfiguracije ali prijave v Codex.

## Predaja in ocenjevanje

Pred zagonom shranimo kontrolne vsote vseh vhodnih datotek, tudi odvisnosti.
Po koncu primerjamo datoteke z začetnim stanjem. Spremembe zunaj dovoljenih
map se označijo kot kršitev. Simbolične povezave v predani kodi niso dovoljene.
Predajo kopiramo ločeno in je po pregledu končnih testov ne popravljamo.

Ocenjevalec uporablja začetni strežnik, podatke in teste iz pripetega commita.
Preveri slog, tipe in gradnjo ter izvede 68 preverjanj: 38 osnovnih,
8 razvojnih in 22 končnih. Zadnji dve številki predstavljata 4 oziroma
11 scenarijev, izvedenih na računalniškem in emuliranem mobilnem prikazu.
Neuspešni in neizvedeni testi se ohranijo v poročilu.

Porabo shranimo iz dogodka `turn.completed`, če jo CLI vrne. Ločeno
hranimo vhodne, predpomnjene vhodne in izhodne tokene. Če podatka ni, ostane
neznan. Naročniška poraba ni račun za API, zato stroška v evrih ne izračunamo
iz teh številk. Za glavne meritve moramo vnaprej določiti tudi način
primerljive omejitve in obračuna porabe za A, B in C.

## Viri nastavitev

Uporabljena je uradna dokumentacija za
[neinteraktivni zagon](https://learn.chatgpt.com/docs/non-interactive-mode),
[profile dovoljenj](https://learn.chatgpt.com/docs/permissions) in
[nastavitve Codexa](https://learn.chatgpt.com/docs/config-file/config-reference),
preverjena skupaj s pomočjo dejansko nameščene različice CLI.
Povezava do brskalnika sledi lokalnim tipom in dokumentaciji nameščene
različice Playwright 1.63.0.
