# Gradivo za pisanje magistrske

## Kje začeti

Končni obseg je **P03–P10: osem nalog, A/B/C, tri ponovitve, 72 izvedb**.
P01 in P02 sta zaključena pilota in ne vstopata v glavno primerjavo.
Trenutno število dejansko arhiviranih izvedb je vedno v [zbirnih rezultatih](results.md).
Število 72 v metodologiji pomeni načrt, dokler ta zbirka ni popolna.

Metodologija je usklajena z zamrznjenim protokolom v
[poglavju 5](../../../naloga/latex/poglavja/05-metodologija.tex).
Razdelka 4.6 in 4.7 v [opisu okolja](../../../naloga/latex/poglavja/04-zasnova-in-izvedba.tex)
opisujeta dejansko izolacijo, preverjanje in beleženje porabe.
Prejšnji različici sta ohranjeni v `naloga/zapiski/pred-glavnimi-meritvami-2026-09-21/`.

## Dokazi za posamezen del besedila

| Del magistrske | Uporabno gradivo | Kaj je mogoče utemeljiti |
| --- | --- | --- |
| Zasnova in izvedba | [Glavni protokol](../../docs/main-protocol.md), [preverjanje okolja](../../docs/main-verification.md) | Sveže okolje, izolacija, enaka izhodišča, zaključevanje in arhiviranje |
| Izbor nalog | [Katalog](../../tasks/main-catalog.json), `tasks/P03` do `tasks/P10` | Osem konkretnih razširitev; 12 zahtev vsake; skupna domena vhodov |
| Pilot | [P01](../../docs/pilot-results.md), [P02](../../docs/p02-results.md) | Razvoj in preverjanje postopkov pred glavno raziskavo |
| Kvalifikacija | [Q-B/Q-C/Q-I](../../docs/qualification-results.md) | Dejanski povratni popravki in obravnava prekinjene porabe |
| Potek meritev | [Razpored](../schedule.json), [zamrznjeni vhodi](../frozen-inputs.json), `runs/<ID>/execution.json` | Vrstni red, model in časovna meja; konkretne faze in statusi |
| Funkcionalni rezultati | [Zbirka](results.json), `runs/<ID>/evaluation-summary.json` | Dokazane zahteve, regresije, strogi uspeh in napake |
| Čas in poraba | `execution.json`, `usage-observation.json`, `evaluation-summary.json` v arhivu | Celoten modelski čas, faze, popolna poraba ali opažena spodnja meja |
| Vsebinska presoja | [Zamrznjena rubrika](../../docs/main-rubric.md), `reviews/<ID>.json` | Pet ločenih ocen z utemeljitvami in konkretnimi dokazi |
| Primeri za razpravo | Oddana specifikacija, lastni testi, dnevniki ter neodvisna ocena iste izvedbe | Konkretna razlika med zahtevami, razvojnim preverjanjem in končnim vedenjem |

Poti oblike `runs/<ID>/` so relativne imeniku `experiments`. Tak arhiv
vsebuje tudi `archive-complete.json`: inventar in zgoščene vrednosti datotek.
Vrednosti iz surovega arhiva imajo prednost pred ročno prepisano številko.

## Predlagano zaporedje rezultatov

1. **Dejanski obseg.** Koliko od 72 izvedb je začetih in arhiviranih;
   koliko postopkov je zaključenih, omejenih s časom ali prekinjenih;
   katere naloge oziroma bloki manjkajo. Navedi datumski razpon.
2. **Izpolnjevanje zahtev.** Prikaži posamezne ponovitve in povprečja po nalogi.
   Za R01–R12 morata uspeti oba sprejemna scenarija. Delno opaženega preverjanja
   ne opisuj kot dokazano funkcionalno napako. Loči strogi uspeh od deleža zahtev.
3. **Čas in poraba.** Vključi neuspehe in časovne omejitve. Pri popolni porabi
   navedi imenovalec; prekinjena izvedba ima le opaženo spodnjo mejo.
   Predpomnjenih tokenov ne prištevaj še enkrat vhodnim. Tokeni niso evri.
4. **Parne razlike.** Ob popolni zbirki najprej povpreči tri ponovitve iste
   naloge in postopka; primerjaj osem parov nalog. Opiši smer, velikost in
   negotovost razlike. Ponavljanje 20.000 vzorcev ne poveča števila nalog.
5. **Vsebinska kakovost.** Poročaj pet dimenzij posebej za vnaprej izbrano
   ponovitev 001, z manjkajočimi ocenami in razlago presoje. Ocenjevalec Codex
   pomeni AI-podprto, neslepo presojo. Človeških ocen ali soglasja ni.
6. **Konkretni primeri.** Izberi razložljiv neuspeh, če obstaja, oziroma
   jasno označen razvojni popravek. Razvojna napaka, popravljena pred oddajo,
   ni napaka končne rešitve. Za vsak primer poveži navodilo, kodo, test in izid.

## Merila in dovoljene trditve

- Enota posploševanja je naloga. 72 izvedb, 864 ocen zahtev in tisoči testnih
  izidov niso 72, 864 ali več tisoč neodvisnih programerskih problemov.
- Rezultat 12/12 pomeni uspeh določenih končnih scenarijev na obeh pogledih;
  ne pomeni formalnega dokaza pravilnosti za vse možne podatke.
- Strogi uspeh zahteva zaključen proces, dovoljene spremembe, lint, tipe,
  gradnjo ter 70/70 preverjanj. Agentova trditev »vse deluje« ni to merilo.
- Primerjamo celotne postopke A/B/C. Iz te zasnove ne moremo izolirati učinka
  samo števila agentov, dolžine specifikacije ali posameznega koraka Spec Kit.
- Neznačilna ali nejasna razlika ne dokazuje enakovrednosti. Opisni intervali
  temeljijo na majhnem namenskem vzorcu osmih sorodnih nalog.
- Vse naloge so razširitve istega React vmesnika, večinoma organiziranje
  prebranih podatkov. Mobilni prikaz je emuliran Chromium. Ne trdimo, da
  rezultat velja za fizične naprave, druge modele ali poljubne projekte.
- Referenčnih 560/560 in zaznanih 48/48 namernih napak sta preverjanje
  infrastrukture. Ne vključuj ju v uspešnost merjenih modelskih rešitev.

## Preostalo avtorsko delo

Rezultate poveži z raziskovalnimi vprašanji iz uvoda, izberi jasne primere
in preveri skladnost sklepov s podatki. Literatura, interpretacija,
neodvisna človeška presoja in končna jezikovna ureditev ostanejo ločeni
avtorski koraki. Zbirka ne more nadomestiti mentorjeve presoje zasnove.
