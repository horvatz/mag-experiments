# P02: protokol pilotnih izvedb A, B in C

Različica P02/1, določena pred prvim merjenim zagonom 21. septembra 2026.
P02 ostaja pilot za umerjanje zahtevnosti, postopkov in porabe. Ni del
glavne raziskovalne primerjave in ne določa splošnega zmagovalca.

## Skupni pogoji

- Folio iz commita `6dc1193f32a1fc00722fbc0983907d32b908cb51`, brez rešitve P01.
- Navodila P02 v0.1: vseh dvanajst zahtev R01–R12. Nespremenjena skupna
  predloga, štirje razvojni scenariji, javni testni pripomoček in tipi.
- GPT-6 Astra, `xhigh`, Codex CLI 0.154.0, Node.js 24.11.1 ter iste
  zaklenjene knjižnice in Chromium kot pri pripravi reference.
- Enaka skupna meja **20 minut** od začetka modelske izvedbe, vključno z
  dokumenti, implementacijo, preverjanji, predajami in morebitnimi popravki.
- Brez namigov, ročnih sprememb kode ali povratnih informacij iz končnih
  testov med merjenjem. Predhodni pogovori in rezultati drugih izvedb niso
  del konteksta. Vsak postopek začne iz svežega izvoza.

Priprava okolja, preverjanje izolacije in neodvisno ocenjevanje po oddaji
niso del izmerjenega časa. Zabeležimo vse dejansko začete modele, tudi
nepopolne in neuspele. Začetega ID-ja ali njegovega poročila ne prepisujemo.
Predhodna tehnična preverjanja brez modela so posebej označena.

## Postopki

**A**: en agent sam pripravi specifikacijo, implementacijo in preverjanja.
Začetna seja je prazna. Končni odgovor oziroma časovna meja določi oddajo.

**B**: nespremenjena razporeditev faz iz B/0.3 — avtor specifikacije,
implementer in pregledovalec z ločenimi sejami. Prožna razporeditev
skupnega časa ohrani rezervi za pregled in popravke. Pregled mora izrecno
zajeti vseh dvanajst zahtev P02. Utemeljene popravke opravita prvotna avtorja
v nadaljevanju svojih sej. Veljajo meje pisanja posamezne vloge in
strukturirana predaja; uspeh končnih testov ne nadomesti manjkajoče predaje.

**C**: nespremenjen potek C/0.2 — en agent v isti seji uporabi Spec Kit
1.0.8 z uradnim Lean presetom 1.0.0: constitution, specify, plan, tasks,
implement, converge. Feature je `docs/agent/P02`. Ob pripetih novih nalogah
je dovoljen največ še en krog implementacije in zaključnega pregleda v isti
časovni meji. Konvergenca ne spreminja kode ali obstoječih nalog.

Razširitev s P01 na P02 spremeni oznako naloge, obseg zahtev, poti
dokumentov in razvojno gradivo. Ne spremeni modela, skupnega časa ali
organizacije postopkov. Pozivi in konfiguracije vsakega zagona se shranijo.

## Izvoz in izolacija

Agent lahko piše samo v `src/`, `tests/agent/`, `docs/agent/` in dovoljene
začasne mape; B dodatno omeji datoteke glede na vlogo. C dovoljuje tudi
svoja dva procesna zapisa Spec Kit. Referenca, končni testi, rezultati,
zapiski in osebne prijave niso berljivi, tudi skozi ločeni brskalnik.
Procesna profila omejita omrežje na lokalno aplikacijo. Vrata reference
in ocenjevalca za P01 ter P02 se preverjajo pred zagonom in med njim.

Javni razvojni test se izvozi nespremenjen v `tests/development/P02.spec.ts`,
pripomoček v `tests/development/helpers.ts`, javni tipi pa v `support/types.ts`.
Njihovi relativni uvozi zato ostanejo veljavni. `PROJECT_RULES.md` dobi v
izvozu oznako P02; vsebinske meje ostanejo enake. Priprava izvozi tudi
prilagoditev testnega brskalnika in nobene implementacije množičnega urejanja.

Pri C lokalni `ZDOTDIR` določi pripeto pot Node/Python v `.zshenv`,
`.zprofile` in `.zshrc`. Te datoteke so samo berljive in ne spreminjajo
uporabnikovih nastavitev. Preflight preveri Python 3.12.14/PyYAML 6.0.3 tudi
z dejanskim `/bin/zsh -lc`, da sistemski profil ne izbere napačnega Pythona.

Pred meritvijo preflight preveri zaščito datotek, vloge, začetni kontekst,
gradnjo, vseh 38 osnovnih testov ter odkritje osmih razvojnih preverjanj.
Ločena tehnična kopija z referenco preveri izvedljivost razvojnih testov v
izolaciji. Ta kopija se ne uporabi za modelski zagon in se ohrani izven
izvozov merjenih izvedb. Merjeni izvoz pred začetkom preverimo po vseh
kontrolnih vsotah. Naloga, merila in izvajalnik med izvedbami ostanejo enaki.

## Neodvisna ocena in poraba

Po ustavitvi zamrznemo dovoljene datoteke ter preverimo vse spremembe in
simbolične povezave. Ocenjevalec sestavi kandidata z zaupanja vrednim
strežnikom in izvede slog, tipe, gradnjo ter **72 preverjanj**: 38 osnovnih,
8 razvojnih in 26 končnih. Lastni testi agenta niso del teh 72 preverjanj.
Popolnost ocene preverimo tudi po pričakovanem številu testov v vsakem
projektu. Uspešen zaključek postopka in uspešna ocena kode sta ločena izida.

Porabo hranimo iz CLI; pri B in C jo primerjamo z dogodki natančno določenih
sej. Kumulativnih števcev nadaljevane seje ne seštevamo po fazah. Ob
prekinitvi lahko ostane samo delna poraba, jasno označena kot nepopolna.
Naročniških tokenov ne pretvarjamo v strošek API. Pravila zanesljivega
merjenja ob prekinitvah ostajajo odprta pred glavnimi meritvami.

## Izvedba

Za vsak nov ID, npr. `P02-A-001`, najprej zapremo referenčne predoglede:

```sh
node scripts/prepare-pilot.mjs P02-A-001
node scripts/pilot-browser.mjs P02-A-001
```

Brskalnik ostane zagnan, v drugem terminalu:

```sh
node scripts/preflight-pilot.mjs P02-A-001
node scripts/run-pilot.mjs P02-A-001
```

Po koncu ustavimo brskalnik. Za B/C najprej izvedemo
`node scripts/reconcile-pilot-usage.mjs <ID>`, nato za vsak postopek:

```sh
node scripts/evaluate-pilot.mjs P02-A-001
node scripts/archive-pilot.mjs P02-A-001
```

Arhiv vključuje zamrznjeno oddajo, vse uporabljene pozive, konfiguracijo,
protokol ob zagonu, meje datotek, dogodke, porabo in oceno. Izidi P01
ostajajo v lastnih arhivih in se zaradi sprememb izvajalnika ne ocenjujejo
ali prepisujejo za nazaj.
